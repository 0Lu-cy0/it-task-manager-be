const fs = require('fs')
const path = require('path')
const https = require('https')
const os = require('os')

const version = 'v1.23.0' // CẬP NHẬT version mới nhất
const binariesDir = 'binaries'

// Xác định platform và architecture
const platform = os.platform()
const arch = os.arch()

let fileName, fileUrl

if (platform === 'win32') {
  // Windows
  fileName = 'meilisearch-windows-amd64.exe'
} else if (platform === 'linux') {
  // Linux (bao gồm WSL)
  if (arch === 'x64') {
    fileName = 'meilisearch-linux-amd64'
  } else if (arch === 'arm64') {
    fileName = 'meilisearch-linux-aarch64'
  } else {
    console.error(`❌ Architecture ${arch} không được hỗ trợ trên Linux`)
    process.exit(1)
  }
} else if (platform === 'darwin') {
  // macOS
  if (arch === 'x64') {
    fileName = 'meilisearch-macos-amd64'
  } else if (arch === 'arm64') {
    fileName = 'meilisearch-macos-apple-silicon' // TÊN ĐÃ THAY ĐỔI
  } else {
    console.error(`❌ Architecture ${arch} không được hỗ trợ trên macOS`)
    process.exit(1)
  }
} else {
  console.error(`❌ Platform ${platform} không được hỗ trợ`)
  process.exit(1)
}

// URL chính xác với version mới
fileUrl = `https://github.com/meilisearch/meilisearch/releases/download/${version}/${fileName}`

const filePath = path.join(binariesDir, fileName)

console.log(`🏁 Platform: ${platform}, Architecture: ${arch}`)
console.log(`📦 File sẽ tải: ${fileName}`)
console.log(`🔗 URL: ${fileUrl}`)

// Tạo thư mục binaries nếu chưa tồn tại
if (!fs.existsSync(binariesDir)) {
  fs.mkdirSync(binariesDir, { recursive: true })
  console.log(`✅ Đã tạo thư mục ${binariesDir}`)
}

// Kiểm tra nếu file đã tồn tại
if (fs.existsSync(filePath)) {
  console.log(`⚠️  File ${fileName} đã tồn tại trong thư mục ${binariesDir}`)

  // Set execution permission trên Unix-like systems
  if (platform !== 'win32') {
    fs.chmodSync(filePath, 0o755)
    console.log(`🔑 Đã set quyền thực thi cho ${fileName}`)
  }

  process.exit(0)
}

console.log(`📥 Đang tải ${fileName}...`)

// Tải file với xử lý redirect
const file = fs.createWriteStream(filePath)

function downloadWithRedirect(url, outputPath, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    let redirectCount = 0

    const makeRequest = (currentUrl) => {
      https.get(currentUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          redirectCount++
          if (redirectCount > maxRedirects) {
            reject(new Error(`Quá nhiều redirects: ${redirectCount}`))
            return
          }
          console.log(`↪️ Redirect ${redirectCount}: ${response.headers.location}`)
          makeRequest(response.headers.location)
          return
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
          return
        }

        // Hiển thị tiến trình download
        let downloaded = 0
        const totalSize = parseInt(response.headers['content-length'], 10)

        response.on('data', (chunk) => {
          downloaded += chunk.length
          if (totalSize) {
            const percent = ((downloaded / totalSize) * 100).toFixed(1)
            process.stdout.write(`\r📥 Đang tải... ${percent}% (${(downloaded / 1024 / 1024).toFixed(1)}/${(totalSize / 1024 / 1024).toFixed(1)} MB)`)
          }
        })

        response.pipe(file)

        file.on('finish', () => {
          file.close()
          console.log('\n') // Xuống dòng sau khi hoàn thành
          resolve()
        })

      }).on('error', reject)
    }

    makeRequest(url)
  })
}

// Thực hiện download
downloadWithRedirect(fileUrl, filePath)
  .then(() => {
    console.log(`✅ Đã tải thành công ${fileName}`)
    console.log(`📁 Đường dẫn: ${filePath}`)

    // Set execution permission trên Unix-like systems
    if (platform !== 'win32') {
      fs.chmodSync(filePath, 0o755)
      console.log(`🔑 Đã set quyền thực thi cho ${fileName}`)
    }
  })
  .catch((err) => {
    console.error(`\n❌ Lỗi khi tải file: ${err.message}`)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Gợi ý tải thủ công
    console.log('\n💡 Có thể tải thủ công bằng lệnh:')
    console.log(`wget -O "${filePath}" "${fileUrl}"`)
    console.log('Hoặc:')
    console.log(`curl -L -o "${filePath}" "${fileUrl}"`)

    process.exit(1)
  })
