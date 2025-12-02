import { inviteRepository } from '~/repository/inviteRepository'
import { projectService } from '~/services/projectService'
// import { checkUserPermission } from '~/utils/permissions'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import { notificationModel } from '~/models/notificationModel'
import { inviteModel } from '~/models/inviteModel'
import crypto from 'crypto'
import { env } from '~/config/environment'
import { getRoleId } from '~/utils/getRoleId'
import { sendInviteEmail } from '~/utils/authUtils'
import { MESSAGES } from '~/constants/messages'

export const inviteService = {
  /**
   * Tạo permanent invite link cho project (không hết hạn, duy nhất)
   * Được gọi tự động khi tạo project mới
   */
  async createPermanentInvite(projectId, userId, roleName = 'member', session = null) {
    const project = await inviteRepository.findProject(projectId, session)
    if (!project) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
    }

    const role = await inviteRepository.findRole(projectId, roleName, session)
    if (!role) {
      throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.ROLE_INVALID)
    }

    // Tạo token duy nhất cho project
    const inviteToken = crypto.randomBytes(32).toString('hex')

    const invite = await inviteRepository.createInvite(
      projectId,
      userId,
      null, // Không cần email cho permanent invite
      role._id,
      inviteToken,
      null, // Không có expires_at
      true, // is_permanent = true
      session // Truyền session vào
    )

    return {
      _id: invite._id,
      project_id: invite.project_id,
      invite_link: `${env.CLIENT_URL}/api/invites/${inviteToken}`,
      invite_token: inviteToken,
      status: invite.status,
      role_id: invite.role_id,
      is_permanent: invite.is_permanent,
    }
  },

  /**
   * Lấy permanent invite link của project
   */
  async getPermanentInvite(projectId) {
    const invite = await inviteModel
      .findOne({
        project_id: projectId,
        is_permanent: true,
      })
      .lean()

    if (!invite) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.INVITE_PERMANENT_LINK_NOT_FOUND)
    }

    return {
      _id: invite._id,
      project_id: invite.project_id,
      invite_link: `${env.CLIENT_URL}/api/invites/${invite.invite_token}`,
      invite_token: invite.invite_token,
      status: invite.status,
      role_id: invite.role_id,
      is_permanent: invite.is_permanent,
    }
  },

  /**
   * Lấy danh sách lời mời qua email của project
   */
  async getEmailInvites(projectId) {
    const invites = await inviteModel
      .find({
        project_id: projectId,
        is_permanent: false, // Chỉ lấy email invites
        email: { $exists: true, $ne: null }, // Phải có email
        status: 'pending', // Chỉ lấy lời mời đang pending
      })
      .populate('invited_by', 'full_name email')
      .populate('role_id', 'name')
      .sort({ created_at: -1 })
      .lean()

    return invites.map(invite => ({
      _id: invite._id,
      email: invite.email,
      role: invite.role_id,
      invited_by: invite.invited_by,
      created_at: invite.created_at,
      expires_at: invite.expires_at,
      status: invite.status,
    }))
  },

  async handleInviteLink(token, userId) {
    const invite = await inviteRepository.findInviteByToken(token)
    if (!invite) {
      throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.INVITE_INVALID_OR_EXPIRED)
    }

    // Kiểm tra hết hạn nếu không phải permanent invite
    if (!invite.is_permanent && invite.expires_at && new Date() > invite.expires_at) {
      throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.INVITE_EXPIRED)
    }

    // Kiểm tra visibility của project
    const project = invite.project_id
    if (project.visibility === 'private') {
      // Project private: Chỉ cho phép nếu có invite link hợp lệ (đã pass qua check trên)
      // Không cần check thêm gì, vì đã có invite token
    }
    // Project public: Ai cũng có thể join (không cần invite, nhưng nếu có invite link thì vẫn ok)

    const memberRoleId = await getRoleId(invite.project_id._id, 'member')

    await projectService.addProjectMember(invite.project_id, userId, memberRoleId, userId)

    await notificationModel.create({
      project_id: invite.project_id,
      user_id: userId,
      type: 'member_joined',
      title: 'Thành viên mới tham gia',
      content: 'Người dùng đã tham gia dự án qua lời mời với vai trò member',
      related_id: invite._id,
    })

    return {
      project_id: invite.project_id,
      visibility: project.visibility,
    }
  },

  /**
   * Tạo và gửi lời mời qua email cho user
   */
  async sendInviteByEmail(projectId, email, invitedByUserId, roleId) {
    // Kiểm tra project tồn tại
    const project = await inviteRepository.findProject(projectId)

    if (!project) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
    }

    // Kiểm tra người gửi lời mời là thành viên của project
    const isMember = project.members?.some(
      member => member.user_id.toString() === invitedByUserId.toString()
    )

    if (!isMember) {
      throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.INVITE_NO_PERMISSION)
    }

    // Kiểm tra email được mời đã là thành viên chưa
    const invitedUser = await inviteRepository.findUserByEmail(email)

    if (invitedUser) {
      const isInvitedUserMember = project.members?.some(
        member => member.user_id.toString() === invitedUser._id.toString()
      )

      if (isInvitedUserMember) {
        throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.USER_ALREADY_MEMBER)
      }
    }

    // Kiểm tra email đã được mời chưa
    const existingInvite = await inviteModel.findOne({
      project_id: projectId,
      email: email.toLowerCase(),
      status: 'pending',
    })

    if (existingInvite) {
      if (existingInvite.expires_at && new Date() > existingInvite.expires_at) {
        await inviteRepository.updateInviteStatus(existingInvite._id, 'expired')
      } else {
        const expiresInDays = Math.ceil(
          (new Date(existingInvite.expires_at) - new Date()) / (1000 * 60 * 60 * 24)
        )
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `${MESSAGES.INVITE_EMAIL_ALREADY_SENT}. Lời mời còn hiệu lực ${expiresInDays} ngày.`
        )
      }
    }

    // Tạo invite với thời hạn 7 ngày
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invite = await inviteRepository.createInvite(
      projectId,
      invitedByUserId,
      email,
      roleId,
      null,
      expiresAt,
      false
    )

    // Lấy thông tin người mời
    const inviter = await inviteRepository.findUserById(invitedByUserId)
    const inviterName = inviter?.full_name || inviter?.email || 'Một thành viên'

    // Gửi email
    await sendInviteEmail(email, invite._id.toString(), project.name, inviterName)

    // Kiểm tra xem user có tồn tại trong hệ thống không
    const user = await inviteRepository.findUserByEmail(email)

    // Nếu user đã có tài khoản, tạo thông báo
    if (user) {
      const notificationContent =
        project.visibility === 'public'
          ? `${inviterName} đã mời bạn tham gia dự án công khai "${project.name}".`
          : `${inviterName} đã mời bạn tham gia dự án "${project.name}"`

      await notificationModel.create({
        user_id: user._id,
        project_id: projectId,
        type: 'invite_created',
        title: 'Bạn có lời mời mới',
        content: notificationContent,
        link: `/invites/${invite._id}`,
        related_id: invite._id,
      })
    }

    return {
      message:
        project.visibility === 'public'
          ? 'Đã gửi lời mời qua email. (Dự án công khai)'
          : 'Đã gửi lời mời qua email',
      invite: {
        _id: invite._id,
        email: invite.email,
        project_id: invite.project_id,
        status: invite.status,
        expires_at: invite.expires_at,
        project_visibility: project.visibility,
      },
    }
  },

  /**
   * Chấp nhận lời mời
   */
  async acceptInvite(inviteId, userId) {
    let invite = await inviteModel
      .findById(inviteId)
      .populate('project_id')
      .populate('invited_by', 'full_name email')
      .populate('role_id')

    if (!invite) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.INVITE_NOT_FOUND)
    }

    // Nếu invite đã được accept rồi, trả về thông tin project
    if (invite.status === 'accepted') {
      console.log('ℹ️ Invite already accepted, redirecting to project')

      // Kiểm tra user có phải là người được mời không
      const user = await inviteRepository.findUserByEmail(invite.email)
      if (user && user._id.toString() === userId.toString()) {
        return {
          message: 'Bạn đã là thành viên của dự án này',
          project: {
            _id: invite.project_id._id,
            name: invite.project_id.name,
            visibility: invite.project_id.visibility,
          },
          role: invite.role_id?.name || 'member',
        }
      }
    }

    // Kiểm tra invite còn pending không
    if (invite.status !== 'pending') {
      throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.INVITE_NOT_FOUND)
    }

    // Kiểm tra hết hạn
    if (invite.expires_at && new Date() > invite.expires_at) {
      await inviteRepository.updateInviteStatus(inviteId, 'expired')
      throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.INVITE_EXPIRED)
    }

    // Note: Cả public và private project đều cho phép accept invite
    // - Private: Bắt buộc accept mới vào được
    // - Public: Accept để được role trong invite (thay vì member mặc định)

    // Kiểm tra role có tồn tại không
    if (!invite.role_id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Role không tồn tại trong lời mời')
    }

    console.log('🔍 Accept Invite Debug:', {
      inviteId,
      userId,
      inviteEmail: invite.email,
      roleId: invite.role_id._id,
      roleName: invite.role_id.name,
      projectId: invite.project_id._id,
    })

    // Kiểm tra email của user có khớp với lời mời không
    const user = await inviteRepository.findUserByEmail(invite.email)
    if (!user || user._id.toString() !== userId.toString()) {
      console.log('❌ Email mismatch:', {
        inviteEmail: invite.email,
        userEmail: user?.email,
        userId,
        foundUserId: user?._id.toString(),
      })
      throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.INVITE_ACCEPT_NO_PERMISSION)
    }

    // Kiểm tra user đã là thành viên chưa
    const isMember = invite.project_id.members?.some(
      member => member.user_id.toString() === userId.toString()
    )
    if (isMember) {
      throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.USER_ALREADY_MEMBER)
    }

    // Thêm user vào project
    console.log('➕ Adding member to project:', {
      projectId: invite.project_id._id,
      userId,
      roleId: invite.role_id._id,
      roleName: invite.role_id.name,
    })

    await projectService.addProjectMember(invite.project_id._id, userId, invite.role_id._id)

    console.log('✅ Member added successfully')

    // Tạo thông báo cho người mời trước khi cập nhật status
    await notificationModel.create({
      user_id: invite.invited_by._id,
      project_id: invite.project_id._id,
      type: 'invite_accepted',
      title: 'Lời mời đã được chấp nhận',
      content: `${user.full_name || user.email} đã chấp nhận lời mời tham gia dự án "${invite.project_id.name}"`,
      related_id: inviteId,
    })

    // Cập nhật status thành 'accepted' thay vì xóa để có thể redirect lại
    await inviteModel.findByIdAndUpdate(inviteId, {
      status: 'accepted',
      accepted_at: new Date(),
    })

    const isPublicProject = invite.project_id.visibility === 'public'

    return {
      message: isPublicProject
        ? 'Đã chấp nhận lời mời và tham gia dự án công khai'
        : 'Đã chấp nhận lời mời',
      project: {
        _id: invite.project_id._id,
        name: invite.project_id.name,
        visibility: invite.project_id.visibility,
      },
      role: invite.role_id.name,
    }
  },

  /**
   * Từ chối lời mời
   */
  async rejectInvite(inviteId, userId) {
    const invite = await inviteModel
      .findOne({ _id: inviteId, status: 'pending' })
      .populate('project_id', 'name')
      .populate('invited_by', 'full_name email')

    if (!invite) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.INVITE_NOT_FOUND)
    }

    // Kiểm tra quyền
    const user = await inviteRepository.findUserByEmail(invite.email)
    if (!user || user._id.toString() !== userId.toString()) {
      throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.INVITE_REJECT_NO_PERMISSION)
    }

    // Tạo thông báo cho người mời trước khi xóa invite
    await notificationModel.create({
      user_id: invite.invited_by._id,
      project_id: invite.project_id._id,
      type: 'invite_rejected',
      title: 'Lời mời đã bị từ chối',
      content: `${user.full_name || user.email} đã từ chối lời mời tham gia dự án "${invite.project_id.name}"`,
      related_id: inviteId,
    })

    // Xóa lời mời sau khi bị từ chối
    await inviteModel.findByIdAndDelete(inviteId)

    return {
      message: 'Đã từ chối lời mời',
    }
  },

  /**
   * Hủy lời mời (dành cho người mời)
   */
  async cancelInvite(inviteId, userId) {
    const invite = await inviteModel
      .findOne({ _id: inviteId, status: 'pending' })
      .populate('project_id', 'name')

    if (!invite) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.INVITE_NOT_FOUND)
    }

    // Kiểm tra quyền: chỉ người mời hoặc owner mới được hủy
    if (invite.invited_by.toString() !== userId.toString()) {
      // Kiểm tra có phải owner không
      const hasPermission = await projectService.verifyProjectPermission(
        invite.project_id._id,
        userId,
        'add_member'
      )
      if (!hasPermission) {
        throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN)
      }
    }

    // Xóa lời mời thay vì update status
    await inviteModel.findByIdAndDelete(inviteId)

    return {
      message: 'Đã hủy lời mời',
    }
  },

  /**
   * Lấy danh sách lời mời của user (pending)
   */
  async getUserInvites(userId) {
    // Lấy thông tin user từ userId
    const user = await inviteRepository.findUserById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
    }

    const invites = await inviteModel
      .find({
        email: user.email,
        status: 'pending',
        expires_at: { $gt: new Date() }, // Chỉ lấy các invite chưa hết hạn
      })
      .populate('project_id', 'name description visibility')
      .populate('invited_by', 'full_name email')
      .populate('role_id', 'name')
      .sort({ created_at: -1 })

    return invites.map(invite => ({
      _id: invite._id,
      project: {
        _id: invite.project_id._id,
        name: invite.project_id.name,
        description: invite.project_id.description,
        visibility: invite.project_id.visibility,
      },
      invited_by: {
        name: invite.invited_by.full_name || invite.invited_by.email,
        email: invite.invited_by.email,
      },
      role: invite.role_id.name,
      created_at: invite.created_at,
      expires_at: invite.expires_at,
    }))
  },
}
