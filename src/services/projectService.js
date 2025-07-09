/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formater'

const createNew = async (reqBody) => {
  try {
    //Xử lý logic dữ liệu tùy đặc dù dự án
    const newProject = {
      ...reqBody,
      slug: slugify(reqBody.title),
    }

    //Gọi tới tầng model để xử lý bản ghi newProject vào trong db
    //...

    //Làm thêm các xử lý logic khác với các colection khác tùy đặc thù dự án...vv
    //Bán email, noti về cho lead khi có 1 project mới, task mới được tạo bởi mem...vv

    return newProject //Trả về cho controller những dữ liệu cần thiết cho phía client bên fe,
    //trong service luôn phải có return
  } catch (error) {
    throw error
  }
}

export const projectService = {
  createNew,
}
