import { StatusCodes } from 'http-status-codes'
import { notiService } from '~/services/notiService'

const markAsRead = async (req, res, next) => {
  try {
    const { notiId } = req.params
    const dataUpdate = req.body
    const result = await notiService.markAsRead(notiId, dataUpdate)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Notice has been read',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const deleteNoti = async (req, res, next) => {
  try {
    const { notiId } = req.params
    await notiService.deleteNoti(notiId)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Notice deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

const deleteAllNoti = async (req, res, next) => {
  try {
    await notiService.deleteAllNoti()

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'All notices have been successfully cleared.',
    })
  } catch (error) {
    next(error)
  }
}

const getDetailNoti = async (req, res, next) => {
  try {
    const { notiId } = req.params
    const result = await notiService.getDetailNoti(notiId)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const getAllNoti = async (req, res, next) => {
  try {
    const result = await notiService.getAllNoti(req.user._id)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: result || [],
      message: result?.length ? undefined : 'No notifications found',
    })
  } catch (error) {
    next(error)
  }
}


export const notiController = {
  markAsRead,
  deleteNoti,
  deleteAllNoti,
  getDetailNoti,
  getAllNoti,
}
