import mongoose from 'mongoose'
import { columnRepository } from '~/repository/columnRepository'
import { taskRepository } from '~/repository/taskRepository'
import ApiError from '~/utils/APIError'
import { StatusCodes } from 'http-status-codes'
import { projectRepository } from '~/repository/projectRepository'
import { MESSAGES } from '~/constants/messages'

export const columnService = {
  async getColumnsByProject(projectId) {
    // Kiểm tra project tồn tại
    const project = await projectRepository.findOneById(projectId)
    if (!project) throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)

    // Lấy tất cả columns của project
    const columns = await columnRepository.findByProjectId(projectId)

    // Populate cards cho mỗi column
    const columnsWithCards = await Promise.all(
      columns.map(async column => {
        const cards = await taskRepository.findByColumnId(column._id)

        // Sắp xếp cards theo cardOrderIds
        const order = Array.isArray(column.cardOrderIds) ? column.cardOrderIds.map(String) : []
        const cardsSorted = cards.slice().sort((a, b) => {
          const ai = order.indexOf(String(a._id))
          const bi = order.indexOf(String(b._id))
          if (ai === -1 && bi === -1) return 0
          if (ai === -1) return 1
          if (bi === -1) return -1
          return ai - bi
        })

        return {
          ...column,
          cards: cardsSorted,
        }
      })
    )

    return columnsWithCards
  },

  async createColumn(projectId, userId, data) {
    // kiểm tra project tồn tại
    const project = await projectRepository.findById(projectId)
    if (!project) throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)

    const column = await columnRepository.create({
      ...data,
      project_id: projectId,
      createdBy: userId,
    })

    // thêm column vào project
    await projectRepository.addColumn(projectId, column._id)

    return column
  },

  async getColumnWithCards(columnId) {
    const column = await columnRepository.findById(columnId)
    if (!column) throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.COLUMN_NOT_FOUND)

    const cards = await taskRepository.findByColumnId(columnId)

    // sắp xếp cards theo cardOrderIds
    const order = Array.isArray(column.cardOrderIds) ? column.cardOrderIds.map(String) : []
    const cardsSorted = cards.slice().sort((a, b) => {
      const ai = order.indexOf(String(a._id))
      const bi = order.indexOf(String(b._id))
      if (ai === -1 && bi === -1) return 0
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })

    return {
      ...column,
      cards: cardsSorted,
    }
  },

  async updateColumn(columnId, data) {
    const column = await columnRepository.updateById(columnId, data)
    if (!column) throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.COLUMN_NOT_FOUND)
    return column
  },

  async deleteColumn(columnId) {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
      const column = await columnRepository.findById(columnId)
      if (!column) throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.COLUMN_NOT_FOUND)

      // xóa tất cả tasks trong column
      await taskRepository.deleteByColumnId(columnId, { session })

      // xóa column khỏi project
      await projectRepository.removeColumn(column.project_id, columnId, { session })

      // xóa column
      await columnRepository.deleteById(columnId, { session })

      await session.commitTransaction()
      session.endSession()
      return { message: 'Column deleted successfully' }
    } catch (err) {
      await session.abortTransaction()
      session.endSession()
      throw err
    }
  },

  async moveCard(cardId, fromColumnId, toColumnId, position = null) {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
      // update task's columnId
      await taskRepository.updateById(cardId, { columnId: toColumnId }, { session })

      // remove from old column
      await columnRepository.removeCardFromColumn(fromColumnId, cardId, { session })

      // add to new column
      await columnRepository.addCardToColumn(toColumnId, cardId, position, { session })

      await session.commitTransaction()
      session.endSession()
      return { message: 'Card moved successfully' }
    } catch (err) {
      await session.abortTransaction()
      session.endSession()
      throw err
    }
  },
}
