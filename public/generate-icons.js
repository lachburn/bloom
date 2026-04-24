// Run with: node generate-icons.js
// Requires: npm install sharp
// This script generates all PWA icon sizes from bloom-icon.svg

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const svgPath = path.join(__dirname, 'bloom-icon.svg')

async function generate() {
  for (const size of sizes) {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, 'icons', `icon-${size}.png`))
    console.log(`Generated icon-${size}.png`)
  }
  // Apple touch icon (180x180)
  await sharp(svgPath)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, 'apple-touch-icon.png'))
  console.log('Generated apple-touch-icon.png')
}

generate().catch(console.error)
