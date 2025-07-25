const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

// CONFIG đã được cập nhật với key "middleware"
const CONFIG = {
  auth: {
    controller: 'src/controllers/authController.js',
    service: 'src/services/authService.js',
    // Thêm đường dẫn middleware cho module 'auth'
    middleware: 'src/middlewares/authMiddleware.js',
    dependencies: {
      authService: 'src/services/authService.js',
      authValidation: 'src/validations/authValidation.js',
      authRepository: 'src/repository/authRepository.js',
    },
  },
  task: {
    controller: 'src/controllers/taskController.js',
    service: 'src/services/taskService.js',
    // Thêm đường dẫn middleware cho module 'task'
    middleware: 'src/middlewares/taskMiddleware.js',
    dependencies: {
      taskService: 'src/services/taskService.js',
      taskValidation: 'src/validations/taskValidation.js',
      taskRepository: 'src/repository/taskRepository.js',
    },
  },
  project: {
    controller: 'src/controllers/projectController.js',
    service: 'src/services/projectService.js',
    // Thêm đường dẫn middleware cho module 'project'
    middleware: 'src/middlewares/projectMiddleware.js',
    dependencies: {
      projectService: 'src/services/projectService.js',
      projectValidation: 'src/validations/projectValidation.js',
      projectRepository: 'src/repository/projectRepository.js',
    },
  },
}

function extractRequiredModules(code) {
  const result = {}
  const commonJSRegex = /(?:const|let|var)\s*{?\s*(\w+)\s*}?\s*=\s*require\(['"](.*)['"]\)/g
  let match
  while ((match = commonJSRegex.exec(code)) !== null) {
    result[match[1]] = match[2]
  }
  const esModuleRegex = /import\s*{?\s*(\w+)\s*}?\s*from\s*['"](.*)['"]/g
  while ((match = esModuleRegex.exec(code)) !== null) {
    result[match[1]] = match[2]
  }
  return result
}

function extractFunctionCalls(code, objectName) {
  const regex = new RegExp(`${objectName}\\.(\\w+)`, 'g')
  const functions = new Set()
  let match
  while ((match = regex.exec(code)) !== null) {
    functions.add(match[1])
  }
  return Array.from(functions)
}

function extractAllDefinedFunctions(code) {
  const patterns = [
    /function\s+(\w+)\s*\(/g,
    /const\s+(\w+)\s*=\s*\(/g,
    /(\w+)\s*:\s*async?\s*\(/g,
    /exports\.(\w+)\s*=/g,
    /module\.exports\.(\w+)\s*=/g,
    /export\s+const\s+\w+\s*=\s*{\s*([^}]+)}/g,
  ]
  const result = new Set()

  patterns.forEach((pattern) => {
    let match
    while ((match = pattern.exec(code)) !== null) {
      if (pattern.toString().includes('export')) {
        const objectContent = match[1]
        const functionNames = objectContent
          .split(',')
          .map((line) => line.trim())
          .filter((line) => line.match(/^\w+$/))
        functionNames.forEach((name) => result.add(name))
      } else {
        result.add(match[1])
      }
    }
  })

  return Array.from(result)
}

function analyze(moduleName) {
  const module = CONFIG[moduleName]
  if (!module) return console.error('Invalid module name. Use: auth, task or project')

  // Kiểm tra file controller
  const controllerPath = path.resolve(module.controller)
  if (!fs.existsSync(controllerPath)) {
    return console.error(chalk.red(`Controller file not found: ${controllerPath}`))
  }
  const controllerCode = fs.readFileSync(controllerPath, 'utf-8')

  // Kiểm tra file service
  const servicePath = path.resolve(module.service)
  if (!fs.existsSync(servicePath)) {
    return console.error(chalk.red(`Service file not found: ${servicePath}`))
  }
  const serviceCode = fs.readFileSync(servicePath, 'utf-8')

  // **MỚI**: Kiểm tra file middleware
  const middlewarePath = path.resolve(module.middleware)
  if (!fs.existsSync(middlewarePath)) {
    return console.error(chalk.red(`Middleware file not found: ${middlewarePath}`))
  }
  const middlewareCode = fs.readFileSync(middlewarePath, 'utf-8')

  const summary = []
  const unusedFunctions = []
  const unusedImports = []
  const allCalledFunctions = new Set()

  // **CẬP NHẬT**: Thay đổi tiêu đề log
  console.log(`\n${chalk.bold.blue(`🔍 Analyzing ${moduleName.toUpperCase()} Module (Controller, Service & Middleware)...\n`)}`)

  // Phân tích từng file phụ thuộc
  for (const [alias, relativePath] of Object.entries(module.dependencies)) {
    const absPath = path.resolve(relativePath)
    if (!fs.existsSync(absPath)) {
      console.warn(chalk.yellow(`Warning: File not found: ${relativePath}`))
      continue
    }
    const depCode = fs.readFileSync(absPath, 'utf-8')
    const definedFunctions = extractAllDefinedFunctions(depCode)

    // **CẬP NHẬT**: Lấy các hàm được gọi trong controller, service, và middleware
    const controllerCalledFunctions = extractFunctionCalls(controllerCode, alias)
    const serviceCalledFunctions = extractFunctionCalls(serviceCode, alias)
    const middlewareCalledFunctions = extractFunctionCalls(middlewareCode, alias)
    const calledFunctions = [...new Set([...controllerCalledFunctions, ...serviceCalledFunctions, ...middlewareCalledFunctions])]

    // Ghi lại các hàm được gọi
    calledFunctions.forEach((funcName) => {
      const exists = definedFunctions.includes(funcName)
      // **CẬP NHẬT**: Xác định nơi hàm được gọi (controller, service, hoặc middleware)
      let calledIn = 'N/A'
      if (controllerCalledFunctions.includes(funcName)) {
        calledIn = path.basename(controllerPath)
      } else if (serviceCalledFunctions.includes(funcName)) {
        calledIn = path.basename(servicePath)
      } else if (middlewareCalledFunctions.includes(funcName)) {
        calledIn = path.basename(middlewarePath)
      }

      summary.push({
        functionName: funcName,
        calledIn,
        expectedIn: relativePath,
        status: exists ? chalk.green('✅ Found') : chalk.red('❌ Not Found'),
      })
      if (exists) {
        allCalledFunctions.add(`${alias}.${funcName}`)
      }
    })

    // Kiểm tra hàm không được sử dụng
    definedFunctions.forEach((f) => {
      if (!calledFunctions.includes(f)) {
        unusedFunctions.push({ file: relativePath, name: f })
      }
    })

    // Kiểm tra import không được sử dụng
    if (calledFunctions.length === 0) {
      unusedImports.push({ alias, file: relativePath })
    }
  }

  // Phân tích gián tiếp qua service cho repository
  for (const [alias, relativePath] of Object.entries(module.dependencies)) {
    if (alias.endsWith('Service')) {
      const absPath = path.resolve(relativePath)
      if (!fs.existsSync(absPath)) continue
      const depCode = fs.readFileSync(absPath, 'utf-8')
      const serviceRequires = extractRequiredModules(depCode)
      for (const [depAlias, depPath] of Object.entries(serviceRequires)) {
        if (depAlias.endsWith('Repository') && module.dependencies[depAlias]) {
          const repoPath = path.resolve(module.dependencies[depAlias])
          if (fs.existsSync(repoPath)) {
            const repoCode = fs.readFileSync(repoPath, 'utf-8')
            const repoFunctions = extractFunctionCalls(depCode, depAlias)
            repoFunctions.forEach((func) => allCalledFunctions.add(`${depAlias}.${func}`))
          }
        }
      }
    }
  }

  // Cập nhật danh sách hàm không được sử dụng cho repository
  for (const [alias, relativePath] of Object.entries(module.dependencies)) {
    if (alias.endsWith('Repository')) {
      const absPath = path.resolve(relativePath)
      if (!fs.existsSync(absPath)) continue
      const depCode = fs.readFileSync(absPath, 'utf-8')
      const definedFunctions = extractAllDefinedFunctions(depCode)

      const filteredUnusedFunctions = unusedFunctions.filter((f) => {
        if (f.file === relativePath) {
          return !allCalledFunctions.has(`${alias}.${f.name}`)
        }
        return true
      })

      unusedFunctions.length = 0
      unusedFunctions.push(...filteredUnusedFunctions)

      if (definedFunctions.some((func) => allCalledFunctions.has(`${alias}.${func}`))) {
        const index = unusedImports.findIndex((i) => i.alias === alias)
        if (index !== -1) unusedImports.splice(index, 1)
      }
    }
  }

  // In bảng tóm tắt
  console.log('| Function Name       | Called In            | Expected In File                     | Status       |')
  console.log('|---------------------|----------------------|--------------------------------------|--------------|')
  summary.forEach((item) => {
    console.log(
      `| ${item.functionName.padEnd(20)} | ${item.calledIn.padEnd(20)} | ${item.expectedIn.padEnd(36)} | ${item.status.padEnd(12)} |`,
    )
  })

  // In danh sách hàm không được sử dụng
  if (unusedFunctions.length > 0) {
    console.log(chalk.yellow('\n⚠️  Unused functions:'))
    unusedFunctions.forEach((f) => {
      console.log(`- ${chalk.cyan(f.name)} (in ${f.file})`)
    })
  }

  // In danh sách import không được sử dụng
  if (unusedImports.length > 0) {
    console.log(chalk.magenta('\n⚠️  Imported but not used:'))
    unusedImports.forEach((i) => {
      console.log(`- ${chalk.cyan(i.alias)} (from ${i.file})`)
    })
  }

  console.log()
}

// CLI
const moduleName = process.argv[2]
analyze(moduleName)
