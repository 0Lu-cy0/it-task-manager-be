import { exec } from 'child_process'
import os from 'os'

const isWindows = os.platform() === 'win32'
const cmd = isWindows
  ? '.\\meilisearch-windows-amd64.exe --master-key "Mls_2025@DayTask"'
  : './meilisearch-windows-amd64.exe --master-key "Mls_2025@DayTask"'

console.log(`🚀 Starting MeiliSearch using: ${isWindows ? 'Windows' : 'Unix-like'} command...`)
const processMeili = exec(cmd)

processMeili.stdout.on('data', data => console.log(data.toString()))
processMeili.stderr.on('data', data => console.error(data.toString()))
