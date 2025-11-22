import { notiRepository } from '~/repository/notiRepository'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { MESSAGES } from '~/constants/messages'

const markAsRead = async (notiId, updateData) => {
  const noti = await notiRepository.getNotiById(notiId)
  if (!noti) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.NOTIFICATION_NOT_FOUND)
  }
  const markAsRead = await notiRepository.markAsRead(notiId, updateData)
  return markAsRead
}

const deleteNoti = async notiId => {
  const noti = await notiRepository.getNotiById(notiId)
  if (!noti) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.NOTIFICATION_NOT_FOUND)
  }
  await notiRepository.deleteNoti(notiId)
  return true
}

const deleteAllNoti = async () => {
  await notiRepository.deleteAllNoti()
  return true
}

const getDetailNoti = async notiId => {
  const noti = await notiRepository.getNotiById(notiId)
  if (!noti) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.NOTIFICATION_NOT_FOUND)
  }
  return noti
}

const getAllNoti = async userId => {
  const noti = await notiRepository.findNoti(userId)
  return noti
}

export const notiService = {
  markAsRead,
  deleteNoti,
  deleteAllNoti,
  getDetailNoti,
  getAllNoti,
}
