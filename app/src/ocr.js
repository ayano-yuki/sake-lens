import { createWorker } from 'tesseract.js'
import { findTerms } from './glossary.js'

export function locateMatches(words) {
  const candidates = []
  for (let i = 0; i < words.length; i++) {
    let text = ''
    const group = []
    for (let j = i; j < Math.min(i + 12, words.length); j++) {
      const word = words[j]
      if (!word.bbox) break
      if (group.length) {
        const a = group.at(-1).bbox, b = word.bbox
        const size = Math.max(a.x1-a.x0, a.y1-a.y0, b.x1-b.x0, b.y1-b.y0)
        const vertical = Math.abs((a.x0+a.x1-b.x0-b.x1)/2) < size * .6 && b.y0 >= a.y0 && b.y0-a.y1 < size
        const horizontal = Math.abs((a.y0+a.y1-b.y0-b.y1)/2) < size * .6 && b.x0 >= a.x0 && b.x0-a.x1 < size
        if (!vertical && !horizontal) break
      }
      group.push(word); text += word.text.replace(/\s/g, '')
      for (const hit of findTerms(text)) {
        if (text !== hit.alias) continue
        candidates.push({ ...hit, entry: { ...hit.entry, term: hit.alias }, bbox: {
          x0: Math.min(...group.map(w => w.bbox.x0)), y0: Math.min(...group.map(w => w.bbox.y0)),
          x1: Math.max(...group.map(w => w.bbox.x1)), y1: Math.max(...group.map(w => w.bbox.y1)),
        } })
      }
    }
  }
  const result = []
  for (const hit of candidates.sort((a,b) => b.alias.length-a.alias.length)) {
    const a = hit.bbox
    if (result.some(other => {
      const b = other.bbox
      const intersection = Math.max(0, Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0)) * Math.max(0,Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0))
      return intersection / Math.max(1,(a.x1-a.x0)*(a.y1-a.y0)) > .5
    })) continue
    result.push(hit)
  }
  return result
}

export async function recognizeImages(original, inverted, onProgress = () => {}, thresholded = inverted) {
  const words = []
  const passes = [{ lang: 'jpn+eng', image: original, mode: '11' }, { lang: 'jpn_vert', image: inverted, mode: '5' }, { lang: 'jpn_vert', image: thresholded, mode: '5' }]
  for (const [index, pass] of passes.entries()) {
    let worker
    try {
      worker = await createWorker(pass.lang, 1, { logger: m => onProgress((index + (m.progress || 0)) / passes.length) })
      await worker.setParameters({ tessedit_pageseg_mode: pass.mode })
      const { data } = await worker.recognize(pass.image, {}, { blocks: true })
      for (const block of data.blocks || []) for (const paragraph of block.paragraphs || []) for (const line of paragraph.lines || []) {
        words.push(...(line.words || []))
      }
    } finally { if (worker) await worker.terminate() }
  }
  return words
}

export async function scanImage(source, onProgress) {
  const img = new Image()
  img.src = source
  await img.decode()
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < pixels.data.length; i += 4) {
    const value = 255 - (.299 * pixels.data[i] + .587 * pixels.data[i+1] + .114 * pixels.data[i+2])
    pixels.data[i] = pixels.data[i+1] = pixels.data[i+2] = value
  }
  ctx.putImageData(pixels, 0, 0)
  const inverted = canvas.toDataURL('image/png')
  for (let i = 0; i < pixels.data.length; i += 4) {
    const value = pixels.data[i] < 65 ? 0 : 255
    pixels.data[i] = pixels.data[i+1] = pixels.data[i+2] = value
  }
  ctx.putImageData(pixels, 0, 0)
  return recognizeImages(source, inverted, onProgress, canvas.toDataURL('image/png'))
}
