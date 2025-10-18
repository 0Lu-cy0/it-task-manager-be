const fs = require('fs')
const path = require('path')
const https = require('https')

const version = 'v1.23.0' // Cập nhật version mới nhất
const binariesDir = 'binaries'
const fileName = 'meilisearch-windows-amd64.exe'
const fileUrl = `https://github.com/meilisearch/meilisearch/releases/download/${version}/${fileName}`
const filePath = path.join(binariesDir, fileName)

console.log('🏁 Environment: PowerShell hoặc WSL')
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
  console.log(`📁 Đường dẫn: ${filePath}`)
  process.exit(0)
}

console.log(`📥 Đang tải ${fileName}...`)

// Hàm tải file có xử lý redirect
function downloadWithRedirect(url, outputPath, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    let redirectCount = 0
    const file = fs.createWriteStream(outputPath)

    const makeRequest = (currentUrl) => {
      https.get(currentUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          redirectCount++
          if (redirectCount > maxRedirects) {
            reject(new Error(`Quá nhiều redirects (${redirectCount})`))
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
          console.log('\n✅ Tải thành công!')
          resolve()
        })
      }).on('error', reject)
    }

    makeRequest(url)
  })
}

// Thực hiện tải
downloadWithRedirect(fileUrl, filePath)
  .then(() => {
    console.log(`📁 File lưu tại: ${filePath}`)
  })
  .catch((err) => {
    console.error(`\n❌ Lỗi khi tải file: ${err.message}`)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    console.log('\n💡 Có thể tải thủ công bằng lệnh:')
    console.log(`wget -O "${filePath}" "${fileUrl}"`)
    console.log('Hoặc:')
    console.log(`curl -L -o "${filePath}" "${fileUrl}"`)
    process.exit(1)
  })
