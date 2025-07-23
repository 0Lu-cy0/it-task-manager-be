✅ Full Prompt: Analyze, Refactor, and Document Auth + Project Modules
🔹 Step 1: Analyze the Existing Structure
bash
Sao chép
Chỉnh sửa
# Step 1: Scan the current `src/` directory and summarize the structure.
# Include list of controllers, models, routes, middlewares, services, validations.
# Group them by module (e.g. auth, project, task).
# Also mention inconsistencies (e.g. different routing styles, missing validation layers, unclear service separation).
🔹 Step 2: Refactor Auth & Project Modules to Match Task Module Style
bash
Sao chép
Chỉnh sửa
# Step 2: Refactor the `auth` and `project` modules according to the style used in the `task` module.
# Follow these specific conventions based on the `taskRoute` and related files:

## 🧱 Structure Required
- `src/routes/home/authRoute.js`
- `src/routes/home/projectRoute.js`
- `src/controllers/authController.js`
- `src/controllers/projectController.js`
- `src/services/authService.js`
- `src/services/projectService.js`
- `src/validations/authValidation.js`
- `src/validations/projectValidation.js`
- `src/middlewares/authMiddleware.js`
- `src/middlewares/projectMiddleware.js`
- `src/models/authModel.js`
- `src/models/projectModel.js`

## 🧭 Style Guide for Routes
- Use express Router like this:
```js
import express from 'express'
import { controller } from '~/controllers/moduleController'
import { middleware } from '~/middlewares/moduleMiddleware'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

router.use(authMiddleware.verifyToken)

router.post('/', controller.create)
router.put('/:id', controller.update)
router.delete('/:id', controller.delete)
router.get('/:id', controller.getById)
router.get('/', controller.getAll)

export const APIs_module = router
Avoid Router.route() chain style (as in projectRoute.js)

Use /:id consistently in update, delete, getById

🧼 Middleware
All routes must use authMiddleware.verifyToken by default

Input validation must use express-validator or joi, and be placed in moduleMiddleware

🔁 Services
Move all business logic (query, transformation, etc.) into service layer

Controllers should only receive req/res and call services

✅ Response Format
Use unified success/error response format:

js
Sao chép
Chỉnh sửa
res.status(200).json({
  status: 'success',
  message: 'Operation successful',
  data: {}
})
🔹 Step 3: Save a Summary of This Refactor
bash
Sao chép
Chỉnh sửa
# Step 3: After the refactor, write a Markdown summary file at:
# `/docs/_summary-refactor-auth-project.md`

# The file should include:
- Modules refactored (auth, project)
- Files modified/created
- Routing conventions applied
- Middleware and validation changes
- Brief comparison to previous structure (what was inconsistent or missing)
🔹 (Optional) Step 4: Reference Previous Task Module Summary
bash
Sao chép
Chỉnh sửa
# You can optionally look back to previous task module summary for inspiration or style consistency.
# This includes structure, model schema, route design, error handling, response formatting, etc.
🔚 Expected Outcome
Once finished, the following will be ensured:

auth, project, and task follow the same structure and coding conventions

All business logic is moved to services

Middleware and validation are consistent

API routes are uniform and RESTful

Centralized success/error response

A human-readable changelog is created in /docs/_summary-refactor-auth-project.md

👇 Copilot, please follow the steps above to refactor `auth` and `project` modules as described. Begin from Step 1.

