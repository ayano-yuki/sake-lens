import sharp from 'sharp'
import { recognizeImages, locateMatches } from './src/ocr.js'
const source = process.argv[2] || '/input.webp'
const original = await sharp(source).png().toBuffer()
const { data, info } = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true })
for (let i = 0; i < data.length; i += 3) {
  const value = Math.round(255 - (.299 * data[i] + .587 * data[i+1] + .114 * data[i+2]))
  data[i] = data[i+1] = data[i+2] = value
}
const inverted = await sharp(data, { raw: info }).png().toBuffer()
for (let i = 0; i < data.length; i++) data[i] = data[i] < 65 ? 0 : 255
const thresholded = await sharp(data, { raw: info }).png().toBuffer()
const words = await recognizeImages(original, inverted, undefined, thresholded)
console.log('TEXT', words.map(w => w.text).join(' '))
const hits = locateMatches(words)
console.log('MATCHES', JSON.stringify(hits))
if (!hits.some(h => h.entry.term === '純米大吟醸')) process.exitCode = 1
