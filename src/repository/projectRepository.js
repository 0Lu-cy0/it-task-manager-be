import { projectModel } from '~/models/projectModel'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { MESSAGES } from '~/constants/messages'
import { projectRolesModel } from '~/models/projectRolesModel'
import { getPermissionId } from '~/utils/permission'

/**
 * Tạo một dự án mới trong cơ sở dữ liệu
 * @param {Object} data - Dữ liệu dự án
 * @returns {Object} Dự án đã được tạo
 * @throws {Error} Nếu lỗi xảy ra khi tạo dự án
 */
const createNew = async (data) => {
  return await projectModel.create(data)
}

/**
 * Lấy thông tin dự án theo ID
 * @param {string} id - ID của dự án
 * @returns {Object} Thông tin dự án với dữ liệu liên quan được populate
 * @throws {ApiError} Nếu dự án không tồn tại hoặc đã bị xóa mềm
 */
const findOneById = async (id) => {
  const project = await projectModel
    .findById(id)
    .populate('created_by', 'name email')
    .populate('members.user_id', 'name email')
    .populate('members.project_role_id', 'name')
    .populate({
      path: 'tasks',
      match: { _destroy: false },
      select: 'name priority description status',
    })
    .lean()
    .exec()
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  return project
}

/**
 * Lấy danh sách dự án theo bộ lọc
 * @param {Object} [filter={ _destroy: false }] - Bộ lọc truy vấn
 * @param {Object} [sort={ created_at: -1 }] - Tiêu chí sắp xếp
 * @param {Object} [options={}] - Tùy chọn truy vấn (phân trang, giới hạn, v.v.)
 * @returns {Array} Danh sách dự án với dữ liệu liên quan được populate
 * @throws {ApiError} Nếu bộ lọc không hợp lệ
 */
const getAll = async (filter = { _destroy: false }, sort = { created_at: -1 }, options = {}) => {
  if (!filter || typeof filter !== 'object') {
    throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.INVALID_FILTER)
  }
  const projects = await projectModel
    .find(filter)
    .sort(sort)
    .setOptions(options)
    .select('-start_date -created_by -deputy_lead -created_at -updated_at -__v')
    .lean()
    .exec()
  return projects
}

/**
 * Cập nhật thông tin dự án
 * @param {string} projectId - ID của dự án
 * @param {Object} updateData - Dữ liệu cần cập nhật
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án không tồn tại hoặc đã bị xóa mềm
 */
const update = async (projectId, updateData) => {
  const project = await projectModel.findById(projectId)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  return await projectModel
    .findByIdAndUpdate(projectId, updateData, { new: true })
    .populate('created_by', 'name email')
    .populate('members.user_id', 'name email')
    .populate('members.project_role_id', 'name')
    .exec()
}

/**
 * Thêm thành viên vào dự án
 * @param {string} projectId - ID của dự án
 * @param {Object} memberData - Thông tin thành viên (user_id, project_role_id, joined_at)
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án không tồn tại hoặc đã bị xóa mềm
 */
const addMember = async (projectId, memberData) => {
  const project = await projectModel.findById(projectId)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  project.members.push(memberData)
  project.member_count = project.members.length
  const savedProject = await project.save()

  return await savedProject.populate([
    { path: 'created_by', select: 'name email' },
    { path: 'members.user_id', select: 'name email' },
    { path: 'members.project_role_id', select: 'name' },
  ])
}

/**
 * Xóa thành viên khỏi dự án
 * @param {string} projectId - ID của dự án
 * @param {string} userId - ID của thành viên cần xóa
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án không tồn tại hoặc đã bị xóa mềm
 */
const removeMember = async (projectId, userId) => {
  const project = await projectModel.findById(projectId)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  project.members = project.members.filter(member => member.user_id.toString() !== userId)
  project.member_count = project.members.length
  return await project
    .save()
    .then(doc =>
      doc
        .populate('created_by', 'name email')
        .populate('members.user_id', 'name email')
        .populate('members.project_role_id', 'name')
        .execPopulate(),
    )
}

/**
 * Cập nhật vai trò của thành viên trong dự án
 * @param {string} projectId - ID của dự án
 * @param {string} userId - ID của thành viên
 * @param {string} projectRoleId - ID của vai trò mới
 * @param {Object} [session=null] - Session cho transaction (nếu có)
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án hoặc thành viên không tồn tại
 */
const updateMemberRole = async (projectId, userId, projectRoleId, session = null) => {
  const project = await projectModel.findById(projectId).session(session)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }

  // Update role cho user trong members
  const updatedProject = await projectModel
    .findOneAndUpdate(
      { _id: projectId, 'members.user_id': userId },
      { $set: { 'members.$.project_role_id': projectRoleId } },
      { new: true, session },
    )
    .populate('created_by', 'name email')
    .populate('members.user_id', 'name email')
    .populate('members.project_role_id', 'name')
    .exec()

  if (!updatedProject) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_MEMBER)
  }

  return updatedProject
}

/**
 * Kiểm tra quyền của user trong dự án
 * @param {string} projectId - ID của dự án
 * @param {string} userId - ID của user
 * @param {string} permissionName - Tên quyền cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra quyền
 * @throws {ApiError} Nếu dự án không tồn tại hoặc free_mode tắt khi chỉnh sửa permission
 */
const checkUserPermission = async (projectId, userId, permissionName) => {
  try {

    // 1️⃣ Tìm project chứa user này
    const project = await projectModel.findOne({
      _id: projectId,
      'members.user_id': userId,
    }).lean()

    if (!project) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
    }

    // 2️⃣ Nếu project đang tắt free_mode thì chặn luôn việc chỉnh sửa permission
    if (
      !project.free_mode && permissionName === 'change_member_role') {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Không thể thực hiện hành động này vì chế độ free_mode đang bị tắt',
      )
    }

    // 3️⃣ Lấy tất cả roles của user trong project
    const memberRoles = project.members
      .filter((m) => m.user_id.toString() === userId.toString())
      .map((m) => m.project_role_id)

    if (memberRoles.length === 0) {
      return false
    }

    // 4️⃣ Nếu free_mode bật thì owner được bypass
    if (project.free_mode) {
      const ownerRole = await projectRolesModel.findOne(
        {
          _id: { $in: memberRoles },
          name: 'owner',
        },
        { _id: 1 },
      ).lean()
      console.log('🟡 [checkUserPermission] Owner role found (bypass):', !!ownerRole)
      if (ownerRole) return true
    }

    // 5️⃣ Check permission bình thường
    const permissionId = await getPermissionId(permissionName)

    const role = await projectRolesModel.findOne(
      {
        _id: { $in: memberRoles },
        permissions: permissionId,
      },
      { _id: 1 },
    ).lean()

    return !!role
  } catch (error) {
    console.error('❌ [checkUserPermission] Error:', error.message)
    throw error
  }
}


/**
 * Xóa mềm dự án
 * @param {string} projectId - ID dự án
 * @returns {Promise<boolean>} - Kết quả xóa
 */
const softDelete = async (projectId) => {
  const project = await projectModel.findById(projectId)
  if (!project || project._destroy) {
    return false // hoặc throw ApiError(StatusCodes.CONFLICT, 'Project already deleted')
  }
  await projectModel.findByIdAndUpdate(projectId, {
    _destroy: true,
    deleted_at: new Date(),
  })
  return true
}

/**
 * Cập nhật free_mode của project
 * @param {string} projectId
 * @param {boolean} freeModeValue
 * @returns {Object} Project đã cập nhật
 * @throws {ApiError} Nếu project không tồn tại
 */
const updateFreeMode = async (projectId, freeModeValue) => {
  const project = await projectModel.findById(projectId)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  project.free_mode = freeModeValue
  await project.save()
  return project
}

export const projectRepository = {
  createNew,
  findOneById,
  getAll,
  update,
  softDelete,
  addMember,
  removeMember,
  updateMemberRole,
  checkUserPermission,
  updateFreeMode,
}
