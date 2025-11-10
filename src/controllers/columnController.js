import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'

export const columnController = {
  async create(req, res, next) {
    try {
      const { projectId } = req.params
      const userId = req.user._id
      const result = await columnService.createColumn(projectId, userId, req.body)

      return res.status(StatusCodes.CREATED).json({
        status: 'success',
        message: 'Column created successfully',
        data: result,
      })
    } catch (err) {
      next(err)
    }
  },

  async getColumn(req, res, next) {
    try {
      const { columnId } = req.params
      const result = await columnService.getColumnWithCards(columnId)

      return res.status(StatusCodes.OK).json({
        status: 'success',
        data: result,
      })
    } catch (err) {
      next(err)
    }
  },

  async update(req, res, next) {
    try {
      const { columnId } = req.params
      const result = await columnService.updateColumn(columnId, req.body)

      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: 'Column updated successfully',
        data: result,
      })
    } catch (err) {
      next(err)
    }
  },

  async delete(req, res, next) {
    try {
      const { columnId } = req.params
      const result = await columnService.deleteColumn(columnId)

      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: 'Column deleted successfully',
        data: result,
      })
    } catch (err) {
      next(err)
    }
  },

  async moveCard(req, res, next) {
    try {
      const result = await columnService.moveCard(
        req.body.cardId,
        req.body.fromColumnId,
        req.body.toColumnId,
        req.body.position
      )

      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: 'Card moved successfully',
        data: result,
      })
    } catch (err) {
      next(err)
    }
  },

  async getColumnsByProject(req, res, next) {
    try {
      const { projectId } = req.params
      const result = await columnService.getColumnsByProject(projectId)

      return res.status(StatusCodes.OK).json({
        status: 'success',
        data: result,
      })
    } catch (err) {
      next(err)
    }
  },
}
