import { inviteModel } from '~/models/inviteModel'
import { projectModel } from '~/models/projectModel'
import { projectRolesModel } from '~/models/projectRolesModel'
import { userModel } from '~/models/authModel'

export const inviteRepository = {
  async createInvite(projectId, userId, email, roleId, inviteToken, expiresAt) {
    const nomalizedEmail = email ? email.toLowerCase() : null

    //Kt xem có lời mời nào ở trạg thái pending trong prj chưa
    const exitingIntive = await inviteModel.findOne({
      project_id: projectId,
      status: 'pending',
      email: nomalizedEmail,
    })

    //Nếu đã có lời mời, cập nhật tg hết hạn
    if (exitingIntive) {
      exitingIntive.expires_at = expiresAt
      exitingIntive.invited_by = userId
      await exitingIntive.save()
      return exitingIntive
    }
    const invite = new inviteModel({
      project_id: projectId,
      email: email ? email.toLowerCase() : null,
      invite_token: inviteToken,
      invited_by: userId,
      role_id: roleId,
      expires_at: expiresAt,
    })
    return await invite.save()
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
      { new: true },
    )
  },

  async listInvites(projectId) {
    return await inviteModel
      .find({ project_id: projectId })
      .populate('invited_by', 'email full_name')
      .populate('role_id', 'name')
      .select('email invite_token status created_at expires_at')
  },

  async findProject(projectId) {
    return await projectModel.findById(projectId)
  },

  async findRole(projectId, roleName) {
    return await projectRolesModel.findOne({ project_id: projectId, name: roleName })
  },

  async findUserByEmail(email) {
    return await userModel.findOne({ email: email.toLowerCase() })
  },
}
