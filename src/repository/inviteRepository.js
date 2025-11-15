import { inviteModel } from '~/models/inviteModel'
import { projectModel } from '~/models/projectModel'
import { projectRolesModel } from '~/models/projectRolesModel'
import { authModel } from '~/models/authModel'

export const inviteRepository = {
  async createInvite(
    projectId,
    userId,
    email,
    roleId,
    inviteToken,
    expiresAt,
    isPermanent = false,
    session = null
  ) {
    const nomalizedEmail = email ? email.toLowerCase() : null

    // Nếu là permanent invite, kiểm tra xem đã có chưa
    if (isPermanent) {
      const query = inviteModel.findOne({
        project_id: projectId,
        is_permanent: true,
      })
      const existingPermanentInvite = session ? await query.session(session) : await query
      if (existingPermanentInvite) {
        return existingPermanentInvite
      }
    }

    //Kt xem có lời mời nào ở trạg thái pending trong prj chưa (chỉ cho non-permanent)
    if (!isPermanent && email) {
      const query = inviteModel.findOne({
        project_id: projectId,
        status: 'pending',
        email: nomalizedEmail,
      })
      const exitingIntive = session ? await query.session(session) : await query

      //Nếu đã có lời mời, cập nhật tg hết hạn
      if (exitingIntive) {
        exitingIntive.expires_at = expiresAt
        exitingIntive.invited_by = userId
        return session ? await exitingIntive.save({ session }) : await exitingIntive.save()
      }
    }

    const invite = new inviteModel({
      project_id: projectId,
      email: email ? email.toLowerCase() : null,
      invite_token: inviteToken,
      invited_by: userId,
      role_id: roleId,
      expires_at: expiresAt,
      is_permanent: isPermanent,
    })
    return session ? await invite.save({ session }) : await invite.save()
  },

  async findInviteByToken(token) {
    return await inviteModel
      .findOne({
        invite_token: token,
        status: 'pending',
      })
      .populate('project_id')
      .populate('role_id', 'name')
  },

  async findInviteById(inviteId, projectId) {
    return await inviteModel.findOne({
      _id: inviteId,
      project_id: projectId,
      status: 'pending',
    })
  },

  async updateInviteStatus(inviteId, status) {
    return await inviteModel.findByIdAndUpdate(
      inviteId,
      { status, updated_at: Date.now() },
      { new: true }
    )
  },

  async listInvites(projectId) {
    return await inviteModel
      .find({ project_id: projectId })
      .populate('invited_by', 'email full_name')
      .populate('role_id', 'name')
      .select('email invite_token status created_at expires_at')
  },

  async findProject(projectId, session = null) {
    const query = projectModel.findOne({ _id: projectId, _destroy: false })
    return session ? await query.session(session) : await query
  },

  async findRole(projectId, roleName, session = null) {
    const query = projectRolesModel.findOne({
      project_id: projectId,
      name: roleName,
      _destroy: false,
    })
    return session ? await query.session(session) : await query
  },

  async findUserByEmail(email) {
    return await authModel.findOne({ email: email.toLowerCase() })
  },

  async findUserById(userId) {
    return await authModel.findById(userId).lean()
  },
}
