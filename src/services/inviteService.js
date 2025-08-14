import { inviteRepository } from '~/repository/inviteRepository'
import { projectService } from '~/services/projectService'
// import { checkUserPermission } from '~/utils/permissions'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import { notificationModel } from '~/models/notificationModel'
import crypto from 'crypto'
import { env } from '~/config/environment'
import { getRoleId } from '~/utils/getRoleId'

export const inviteService = {
  async createInvite(projectId, userId, email, roleName) {
    // const hasPermission = await checkUserPermission(projectId, userId, 'can_add_member')
    // if (!hasPermission) {
    //   throw new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền mời thành viên')
    // }

    const project = await inviteRepository.findProject(projectId)
    if (!project) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Dự án không tồn tại')
    }

    const role = await inviteRepository.findRole(projectId, roleName)
    if (!role) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Vai trò không hợp lệ')
    }

    const inviteToken = email ? null : crypto.randomBytes(32).toString('hex')
    const existingInvite = await inviteRepository.findInviteByToken(inviteToken) ||
      (email && await inviteRepository.findInviteById(null, projectId, email))
    if (existingInvite) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Lời mời đã tồn tại')
    }

    const invite = await inviteRepository.createInvite(projectId, userId, email, role._id, inviteToken)

    await notificationModel.create({
      project_id: projectId,
      user_id: userId,
      type: 'invite_created',
      title: 'Lời mời mới được tạo',
      content: `Người dùng ${email || 'qua link mời'} được mời vào dự án "${project.name}" với vai trò ${roleName}`,
      related_id: invite._id,
    })

    return {
      _id: invite._id,
      project_id: invite.project_id,
      email: invite.email,
      invite_link: inviteToken ? `${env.CLIENT_URL}/api/invites/${inviteToken}` : null,
      status: invite.status,
      role_id: invite.role_id,
    }
  },

  async handleInviteLink(token, userId) {
    const invite = await inviteRepository.findInviteByToken(token)
    if (!invite) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Lời mời không hợp lệ hoặc đã hết hạn')
    }

    const vieweRoleId = await getRoleId(invite.project_id._id, 'viewer')

    await projectService.addProjectMember(invite.project_id, userId, vieweRoleId, userId)

    await notificationModel.create({
      project_id: invite.project_id,
      user_id: userId,
      type: 'member_joined',
      title: 'Thành viên mới tham gia',
      content: 'Người dùng đã tham gia dự án qua lời mời với vai trò viewer',
      related_id: invite._id,
    })

    return { project_id: invite.project_id }
  },

  // async handleInviteAction(projectId, inviteId, userId, action, roleName) {
  //   // const hasPermission = await checkUserPermission(projectId, userId, 'can_add_member')
  //   // if (!hasPermission) {
  //   //   throw new ApiError(StatusCodes.FORBIDDEN, 'Chỉ Lead hoặc Owner có thể duyệt/từ chối lời mời')
  //   // }

  //   const invite = await inviteRepository.findInviteById(inviteId, projectId)
  //   if (!invite) {
  //     throw new ApiError(StatusCodes.BAD_REQUEST, 'Lời mời không hợp lệ hoặc đã được xử lý')
  //   }

  //   const project = await inviteRepository.findProject(projectId)

  //   if (action === 'reject') {
  //     await inviteRepository.updateInviteStatus(inviteId, 'rejected')
  //     await notificationModel.create({
  //       project_id: projectId,
  //       user_id: userId,
  //       type: 'invite_rejected',
  //       title: 'Lời mời bị từ chối',
  //       content: `Lời mời cho ${invite.email || 'người dùng qua link'} trong dự án "${project.name}" đã bị từ chối`,
  //       related_id: inviteId,
  //     })
  //     return { message: 'Lời mời đã bị từ chối' }
  //   }

  //   if (action !== 'accept') {
  //     throw new ApiError(StatusCodes.BAD_REQUEST, 'Hành động không hợp lệ')
  //   }

  //   const user = await inviteRepository.findUserByEmail(invite.email)
  //   if (!user) {
  //     throw new ApiError(StatusCodes.BAD_REQUEST, 'Người dùng không tồn tại')
  //   }

  //   await projectService.addMember(projectId, user._id, roleName, userId)
  //   await inviteRepository.updateInviteStatus(inviteId, 'accepted')

  //   await notificationModel.create({
  //     project_id: projectId,
  //     user_id: user._id,
  //     type: 'invite_accepted',
  //     title: 'Lời mời được chấp nhận',
  //     content: `Lời mời cho ${invite.email} trong dự án "${project.name}" đã được chấp nhận với vai trò ${roleName}`,
  //     related_id: inviteId,
  //   })

  //   return {
  //     message: 'Lời mời đã được chấp nhận',
  //     member: { user_id: user._id, project_role_id: invite.role_id },
  //   }
  // },

  // async listInvites(projectId, userId) {
  //   const hasPermission = await checkUserPermission(projectId, userId, 'can_add_member')
  //   if (!hasPermission) {
  //     throw new ApiError(StatusCodes.FORBIDDEN, 'Chỉ Lead hoặc Owner có thể xem danh sách lời mời')
  //   }

  //   return await inviteRepository.listInvites(projectId)
  // },
}
