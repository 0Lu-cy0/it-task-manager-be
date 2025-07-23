// analyzeController.js
const fs = require('fs')
const path = require('path')

const CONFIG = {
  auth: {
    controller: 'src/controllers/authController.js',
    dependencies: {
      authService: 'src/services/authService.js',
      authValidation: 'src/validations/authValidation.js',
      authRepository: 'src/repository/authRepository.js',
    },
  },
  task: {
    controller: 'src/controllers/taskController.js',
    dependencies: {
      taskService: 'src/services/taskService.js',
      taskValidation: 'src/validations/taskValidation.js',
      taskRepository: 'src/repository/taskRepository.js',
    },
  },
  project: {
    controller: 'src/controllers/projectController.js',
    dependencies: {
      projectService: 'src/services/projectService.js',
      projectValidation: 'src/validations/projectValidation.js',
      projectRepository: 'src/repository/projectRepository.js',
    },
  },
}

function extractRequiredModules(code) {
  const regex = /const\s+(\w+)\s*=\s*require\(['"](.*)['"]\)/g
  const result = {}
  let match
  while ((match = regex.exec(code)) !== null) {
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

function checkFunctionExistence(filePath, functionName) {
  if (!fs.existsSync(filePath)) return false
  const code = fs.readFileSync(filePath, 'utf-8')
  const patterns = [
    `function ${functionName}(`,
    `const ${functionName} =`,
    `${functionName}:`,
    `exports.${functionName} =`,
    `module.exports.${functionName} =`,
  ]
  return patterns.some((p) => code.includes(p))
}

function analyze(moduleName) {
  const module = CONFIG[moduleName]
  if (!module) return console.error('Invalid module name. Use: auth or task')

  const controllerPath = path.resolve(module.controller)
  const controllerCode = fs.readFileSync(controllerPath, 'utf-8')
  const requires = extractRequiredModules(controllerCode)

  const summary = []
  for (const [alias, relativePath] of Object.entries(module.dependencies)) {
    const absPath = path.resolve(relativePath)
    const calls = extractFunctionCalls(controllerCode, alias)
    calls.forEach((funcName) => {
      const exists = checkFunctionExistence(absPath, funcName)
      summary.push({
        functionName: funcName,
        calledIn: path.basename(controllerPath),
        expectedIn: relativePath,
        status: exists ? '✅ Found' : '❌ Not Found',
      })
    })
  }

  console.log(`\n### 🔍 Missing Function Summary for ${moduleName.toUpperCase()} Module\n`)
  console.log('| Function Name       | Called In            | Expected In File                     | Status       |')
  console.log('|---------------------|----------------------|--------------------------------------|--------------|')
  summary.forEach((item) => {
    console.log(
      `| ${item.functionName.padEnd(20)} | ${item.calledIn.padEnd(20)} | ${item.expectedIn.padEnd(36)} | ${item.status.padEnd(12)} |`,
    )
  })
}

// CLI usage
const moduleName = process.argv[2]
analyze(moduleName)
