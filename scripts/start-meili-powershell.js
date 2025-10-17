const { exec } = require('child_process')
const fs = require('fs')
const net = require('net')
const path = require('path')

console.log('🚀 Starting MeiliSearch via Windows PowerShell from WSL...')

// Kiểm tra file tồn tại
if (!fs.existsSync('binaries/meilisearch-windows-amd64.exe')) {
  console.error('❌ MeiliSearch Windows binary not found')
  console.log('💡 Run: yarn download-meili to download the binary first')
  process.exit(1)
}

// Tạo đường dẫn database trong thư mục binaries
const dbPath = path.join('binaries', 'data.ms')

// Kiểm tra port 7700 có đang được sử dụng không
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => {
      resolve(true) // Port đang được sử dụng
    })
    server.once('listening', () => {
      server.close()
      resolve(false) // Port trống
    })
    server.listen(port)
  })
}

async function startMeiliSearch() {
  const portInUse = await checkPort(7700)

  if (portInUse) {
    console.log('⚠️ Port 7700 is already in use. Stopping existing MeiliSearch...')
    exec('powershell.exe -Command "Get-Process meilisearch* -ErrorAction SilentlyContinue | Stop-Process"', () => {
      // Đợi một chút sau khi stop process
      setTimeout(() => startMeiliProcess(), 2000)
    })
  } else {
    startMeiliProcess()
  }
}

function startMeiliProcess() {
  // THÊM --db-path để chỉ định database location
  const powerShellCommand = `powershell.exe -Command "Start-Process -FilePath '.\\binaries\\meilisearch-windows-amd64.exe' -ArgumentList '--master-key "Mls_2025@DayTask" --db-path "${dbPath}"' -WindowStyle Hidden"`

  console.log('🔑 Master Key: Mls_2025@DayTask')
  console.log(`💾 Database path: ${dbPath}`)
  console.log('⚡ Starting MeiliSearch in background...')

  exec(powerShellCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error starting MeiliSearch: ${error}`)
      return
    }

    console.log('✅ MeiliSearch started in background')
    console.log('📊 MeiliSearch is running on http://localhost:7700')
    console.log(`🗄️ Database location: ${dbPath}`)

    // Kiểm tra sau 3 giây
    setTimeout(() => {
      console.log('🔍 Checking MeiliSearch health...')
      exec('curl -s http://localhost:7700/health', (error, stdout) => {
        if (error) {
          console.log('⚠️ MeiliSearch might still be starting...')
        } else {
          console.log('✅ MeiliSearch is healthy and ready!')
        }
      })
    }, 3000)
  })
}

// Giữ script chạy
startMeiliSearch()
setInterval(() => {
  // Giữ process sống
}, 1000)
