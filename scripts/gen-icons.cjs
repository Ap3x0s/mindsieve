const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const publicDir = path.join(__dirname, '..', 'public')

const svg = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">',
  '<rect width="512" height="512" rx="80" fill="#0B0F19"/>',
  '<g transform="translate(256,256)">',
  '<circle cx="0" cy="-40" r="120" fill="none" stroke="#6366F1" stroke-width="28" stroke-linecap="round"/>',
  '<circle cx="-75" cy="60" r="60" fill="none" stroke="#6366F1" stroke-width="28" stroke-linecap="round"/>',
  '<circle cx="75" cy="60" r="60" fill="none" stroke="#6366F1" stroke-width="28" stroke-linecap="round"/>',
  '<circle cx="0" cy="-40" r="40" fill="#6366F1"/>',
  '<circle cx="-45" cy="20" r="16" fill="#6366F1"/>',
  '<circle cx="45" cy="20" r="16" fill="#6366F1"/>',
  '</g></svg>',
].join('')

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg)

async function run() {
  for (const size of [192, 512]) {
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(publicDir, `icon-${size}.png`))
    console.log(`Generated icon-${size}.png`)
  }
}

run().catch(console.error)
