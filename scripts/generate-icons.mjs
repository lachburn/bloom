// Run once after npm install: node scripts/generate-icons.mjs
// Requires sharp: npm install -D sharp
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const svgPath = join(__dir, '../public/bloom-icon.svg')
const svg = readFileSync(svgPath)

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

for (const size of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(join(__dir, `../public/icons/icon-${size}.png`))
  console.log(`✓ icon-${size}.png`)
}

// Apple touch icon
await sharp(svg).resize(180, 180).png().toFile(join(__dir, '../public/apple-touch-icon.png'))
console.log('✓ apple-touch-icon.png')
console.log('\nAll icons generated!')
