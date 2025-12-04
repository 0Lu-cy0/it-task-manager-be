import { columnModel } from '../models/columnModel.js'

export const columnRepository = {
  async create(data) {
    return columnModel.create(data)
  },

  async findById(id) {
    return columnModel.findById(id).lean()
  },

  async findByProjectId(projectId) {
    return columnModel.find({ project_id: projectId }).lean()
  },

  async updateById(id, data) {
    return columnModel.findByIdAndUpdate(id, data, { new: true }).lean()
  },

  async deleteById(id) {
    return columnModel.findByIdAndDelete(id).lean()
  },

  async addCardToColumn(columnId, cardId, position = null) {
    if (position === null) {
      return columnModel
        .findByIdAndUpdate(columnId, { $push: { cardOrderIds: cardId } }, { new: true })
        .lean()
    } else {
      return columnModel
        .findByIdAndUpdate(
          columnId,
          { $push: { cardOrderIds: { $each: [cardId], $position: position } } },
          { new: true }
        )
        .lean()
    }
  },
  async removeCardFromColumn(columnId, cardId) {
    return columnModel
      .findByIdAndUpdate(columnId, { $pull: { cardOrderIds: cardId } }, { new: true })
      .lean()
  },
  async updateCardOrder(columnId, cardOrderIds) {
    return columnModel.findByIdAndUpdate(columnId, { cardOrderIds }, { new: true }).lean()
  },
}
