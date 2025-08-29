/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')

const PUBLIC_DIR = path.join(__dirname, '..', 'public')
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

// 1x1 透明 PNG（有效 PNG，用作兜底，避免“resource isn't a valid image”）
const BLANK_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='

function isValidPng(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r')
    const buf = Buffer.alloc(8)
    const read = fs.readSync(fd, buf, 0, 8, 0)
    fs.closeSync(fd)
    if (read !== 8) return false
    for (let i = 0; i < 8; i++) {
      if (buf[i] !== PNG_MAGIC[i]) return false
    }
    return true
  } catch {
    return false
  }
}

function ensurePng(name) {
  const file = path.join(PUBLIC_DIR, name)
  const exists = fs.existsSync(file)
  const valid = exists && isValidPng(file)
  if (valid) {
    console.log(`[icons] OK ${name}`)
    return
  }
  const data = Buffer.from(BLANK_PNG_BASE64, 'base64')
  fs.mkdirSync(PUBLIC_DIR, { recursive: true })
  fs.writeFileSync(file, data)
  console.log(`[icons] Wrote fallback ${name}`)
}

ensurePng('icon-192.png')
ensurePng('icon-512.png')


