import { exec } from 'child_process'
import os from 'os'

const isWindows = os.platform() === 'win32'

let cmd

if (isWindows) {
  // Nếu chạy trên Windows thật (PowerShell / CMD)
  cmd = '.\\meilisearch-windows-amd64.exe --master-key "Mls_2025@DayTask"'
} else {
  // Nếu là Git Bash / WSL / Linux -> ép chạy qua PowerShell
  cmd = 'powershell.exe -Command ".\\meilisearch-windows-amd64.exe --master-key \\"Mls_2025@DayTask\\""'
}

console.log(`🚀 Starting MeiliSearch using: ${isWindows ? 'Windows' : 'Git Bash / Unix'} mode...`)

const processMeili = exec(cmd)

processMeili.stdout.on('data', data => console.log(data.toString()))
processMeili.stderr.on('data', data => console.error(data.toString()))
