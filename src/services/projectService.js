/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formater'
import { projectModel } from '~/models/projectModel'

const createNew = async (reqBody) => {
  try {
    //Xử lý logic dữ liệu tùy đặc dù dự án
    const newProject = {
      ...reqBody,
      slug: slugify(reqBody.name),
    }

    //Gọi tới tầng model để xử lý bản ghi newProject vào trong db
    const createdProject = await projectModel.createNew(newProject)
    console.log(createdProject)

    //Lấy bản ghi project để hiển thị ra fe sau khi create
    const getNewProject = await projectModel.findOneById(createdProject.insertedId)
    console.log(getNewProject)

    //Làm thêm các xử lý logic khác với các colection khác tùy đặc thù dự án...vv
    //Bán email, noti về cho lead khi có 1 project mới, task mới được tạo bởi mem...vv

    return getNewProject //Trả về cho controller những dữ liệu cần thiết cho phía client bên fe,
    //trong service luôn phải có return
  } catch (error) {
    throw error
  }
}

export const projectService = {
  createNew,
}
