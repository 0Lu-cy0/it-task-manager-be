import { ColumnModel } from '../models/columnModal.js'

export const columnRepository = {
  async create(data) {
    return ColumnModel.create(data)
  },

  async findById(id) {
    return ColumnModel.findById(id).lean()
  },

  async findByProjectId(projectId) {
    return ColumnModel.find({
      project_id: projectId,
    }).lean()
  },

  async updateById(id, data) {
    return ColumnModel.findByIdAndUpdate(id, data, { new: true }).lean()
  },

  async deleteById(id) {
    return ColumnModel.findByIdAndDelete(id).lean()
  },

  async addCardToColumn(columnId, cardId, position = null) {
    if (position === null) {
      return ColumnModel.findByIdAndUpdate(
        columnId,
        { $push: { cardOrderIds: cardId } },
        { new: true }
      ).lean()
    } else {
      return ColumnModel.findByIdAndUpdate(
        columnId,
        { $push: { cardOrderIds: { $each: [cardId], $position: position } } },
        { new: true }
      ).lean()
    }
  },
  async removeCardFromColumn(columnId, cardId) {
    return ColumnModel.findByIdAndUpdate(
      columnId,
      { $pull: { cardOrderIds: cardId } },
      { new: true }
    ).lean()
  },
  async updateCardOrder(columnId, cardOrderIds) {
    return ColumnModel.findByIdAndUpdate(columnId, { cardOrderIds }, { new: true }).lean()
  },
}
