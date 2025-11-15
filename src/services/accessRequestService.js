import { accessRequestModel } from '~/models/accessRequestModel'
import { projectModel } from '~/models/projectModel'
import { notificationModel } from '~/models/notificationModel'
import { projectService } from '~/services/projectService'
import { getRoleId } from '~/utils/getRoleId'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { MESSAGES } from '~/constants/messages'

export const accessRequestService = {
  /**
   * User request access vào private project
   */
  async requestAccess(projectId, userId, message) {
    // Kiểm tra project tồn tại
    const project = await projectModel.findById(projectId).populate('created_by', 'email full_name')
    if (!project) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
    }

    // Chỉ cho phép request cho private project
    if (project.visibility === 'public') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Dự án công khai. Bạn có thể tham gia trực tiếp mà không cần request.'
      )
    }

    // Kiểm tra user đã là thành viên chưa
    const isMember = project.members?.some(m => m.user_id.toString() === userId.toString())
    if (isMember) {
      throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.USER_ALREADY_MEMBER)
    }

    // Kiểm tra đã có pending request chưa
    const existingRequest = await accessRequestModel.findOne({
      project_id: projectId,
      user_id: userId,
      status: 'pending',
    })

    if (existingRequest) {
      throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.ACCESS_REQUEST_ALREADY_SENT)
    }

    // Tạo access request
    const accessRequest = await accessRequestModel.create({
      project_id: projectId,
      user_id: userId,
      message: message || null,
    })

    // Lấy danh sách admins của project
    const adminRoleIds = (
      await projectModel.aggregate([
        { $match: { _id: project._id } },
        {
          $lookup: {
            from: 'project_roles',
            localField: '_id',
            foreignField: 'project_id',
            as: 'roles',
          },
        },
        { $unwind: '$roles' },
        { $match: { 'roles.name': { $in: ['admin', 'lead'] } } },
        { $project: { roleId: '$roles._id' } },
      ])
    ).map(r => r.roleId.toString())

    const adminMembers = project.members.filter(m =>
      adminRoleIds.includes(m.project_role_id.toString())
    )

    // Gửi notification cho tất cả admins
    const userRequesting = await projectModel.populate(accessRequest, {
      path: 'user_id',
      select: 'email full_name',
    })

    for (const admin of adminMembers) {
      await notificationModel.create({
        user_id: admin.user_id,
        project_id: projectId,
        type: 'custom',
        title: 'Yêu cầu truy cập mới',
        content: `${userRequesting.user_id.full_name || userRequesting.user_id.email} muốn tham gia dự án "${project.name}"`,
        link: `/projects/${projectId}/access-requests`,
        related_id: accessRequest._id,
      })
    }

    return {
      message: 'Đã gửi yêu cầu truy cập. Admin sẽ xem xét yêu cầu của bạn.',
      request: {
        _id: accessRequest._id,
        project_id: projectId,
        status: accessRequest.status,
        created_at: accessRequest.createdAt,
      },
    }
  },

  /**
   * Admin approve access request
   */
  async approveRequest(requestId, adminId, roleId) {
    const request = await accessRequestModel
      .findOne({ _id: requestId, status: 'pending' })
      .populate('project_id', 'name visibility members')
      .populate('user_id', 'email full_name')

    if (!request) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.ACCESS_REQUEST_NOT_FOUND)
    }

    // Kiểm tra admin có quyền không (phải có permission add_member)
    const project = request.project_id
    const hasPermission = await projectService.verifyProjectPermission(
      project._id,
      adminId,
      'add_member'
    )

    if (!hasPermission) {
      throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN)
    }

    // Kiểm tra user đã là thành viên chưa
    const isMember = project.members.some(
      m => m.user_id.toString() === request.user_id._id.toString()
    )
    if (isMember) {
      throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.USER_ALREADY_MEMBER)
    }

    // Approve: Thêm user vào project
    const memberRoleId = roleId || (await getRoleId(project._id, 'member'))
    await projectService.addProjectMember(project._id, request.user_id._id, memberRoleId, adminId)

    // Thông báo cho user trước khi xóa request
    await notificationModel.create({
      user_id: request.user_id._id,
      project_id: project._id,
      type: 'custom',
      title: 'Yêu cầu truy cập được chấp nhận',
      content: `Yêu cầu tham gia dự án "${project.name}" của bạn đã được chấp nhận`,
      link: `/projects/${project._id}`,
      related_id: requestId,
    })

    // Xóa access request sau khi approved
    await accessRequestModel.findByIdAndDelete(requestId)

    return {
      message: 'Đã chấp nhận yêu cầu truy cập',
      request: {
        _id: request._id,
        user: {
          _id: request.user_id._id,
          name: request.user_id.full_name || request.user_id.email,
        },
        project: {
          _id: project._id,
          name: project.name,
        },
        status: 'approved',
      },
    }
  },

  /**
   * Admin reject access request
   */
  async rejectRequest(requestId, adminId, reason) {
    const request = await accessRequestModel
      .findOne({ _id: requestId, status: 'pending' })
      .populate('project_id', 'name visibility')
      .populate('user_id', 'email full_name')

    if (!request) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.ACCESS_REQUEST_NOT_FOUND)
    }

    // Kiểm tra admin có quyền không (phải có permission add_member)
    const hasPermission = await projectService.verifyProjectPermission(
      request.project_id._id,
      adminId,
      'add_member'
    )

    if (!hasPermission) {
      throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN)
    }

    const project = request.project_id

    // Thông báo cho user trước khi xóa request
    await notificationModel.create({
      user_id: request.user_id._id,
      project_id: project._id,
      type: 'custom',
      title: 'Yêu cầu truy cập bị từ chối',
      content: reason
        ? `Yêu cầu tham gia dự án "${project.name}" bị từ chối. Lý do: ${reason}`
        : `Yêu cầu tham gia dự án "${project.name}" bị từ chối`,
      related_id: requestId,
    })

    // Xóa access request sau khi rejected
    await accessRequestModel.findByIdAndDelete(requestId)

    return {
      message: 'Đã từ chối yêu cầu truy cập',
    }
  },

  /**
   * Lấy danh sách access requests của project (cho admin)
   */
  async getProjectRequests(projectId, adminId, status = 'pending') {
    const project = await projectModel.findById(projectId)
    if (!project) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
    }

    // Kiểm tra admin có quyền không
    const adminMember = project.members.find(m => m.user_id.toString() === adminId.toString())
    if (!adminMember) {
      throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.ACCESS_REQUEST_NO_PERMISSION)
    }

    const query = { project_id: projectId }
    if (status) {
      query.status = status
    }

    const requests = await accessRequestModel
      .find(query)
      .populate('user_id', 'email full_name avatar')
      .populate('reviewed_by', 'email full_name')
      .sort({ createdAt: -1 })

    return requests.map(req => ({
      _id: req._id,
      user: {
        _id: req.user_id._id,
        name: req.user_id.full_name || req.user_id.email,
        email: req.user_id.email,
        avatar: req.user_id.avatar,
      },
      message: req.message,
      status: req.status,
      reviewed_by: req.reviewed_by
        ? {
          _id: req.reviewed_by._id,
          name: req.reviewed_by.full_name || req.reviewed_by.email,
        }
        : null,
      reviewed_at: req.reviewed_at,
      reject_reason: req.reject_reason,
      created_at: req.createdAt,
    }))
  },

  /**
   * Lấy access requests của user
   */
  async getUserRequests(userId) {
    const requests = await accessRequestModel
      .find({ user_id: userId })
      .populate('project_id', 'name description visibility')
      .populate('reviewed_by', 'email full_name')
      .sort({ createdAt: -1 })

    return requests.map(req => ({
      _id: req._id,
      project: {
        _id: req.project_id._id,
        name: req.project_id.name,
        description: req.project_id.description,
      },
      message: req.message,
      status: req.status,
      reviewed_by: req.reviewed_by
        ? {
          name: req.reviewed_by.full_name || req.reviewed_by.email,
        }
        : null,
      reviewed_at: req.reviewed_at,
      reject_reason: req.reject_reason,
      created_at: req.createdAt,
    }))
  },
}
