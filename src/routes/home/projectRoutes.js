// import express from 'express'
// import { projectController } from '~/controllers/projectController'
// import { authMiddleware } from '~/middlewares/authMiddleware'
// import { projectMiddleware } from '~/middlewares/projectMiddleware'

// const router = express.Router()

// router.post(
//   '/projects',
//   authMiddleware.verifyToken,
//   projectMiddleware.checkProjectPermission('create'),
//   projectController.createNew,
// )

// router.get(
//   '/projects/:id',
//   authMiddleware.verifyToken,
//   projectMiddleware.checkProjectPermission('read'),
//   projectController.findOneById,
// )

// router.get(
//   '/projects',
//   authMiddleware.verifyToken,
//   projectMiddleware.checkProjectPermission('read'),
//   projectController.getAll,
// )

// router.patch(
//   '/projects/:id',
//   authMiddleware.verifyToken,
//   projectMiddleware.checkProjectPermission('update'),
//   projectController.update,
// )

// router.delete(
//   '/projects/:id',
//   authMiddleware.verifyToken,
//   projectMiddleware.checkProjectPermission('delete'),
//   projectController.softDelete,
// )

// // router.patch(
// //   '/:projectId/free-mode',
// //   authMiddleware.verifyToken,
// //   projectMiddleware.checkProjectPermission('toggle_free_mode'),
// //   projectMiddleware.checkIsOwner,
// //   projectController.toggleFreeMode,
// // )

// export default router
