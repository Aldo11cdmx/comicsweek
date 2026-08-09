import type { DetectionResult, DetectionConfidence, DetectionStatus } from '../types'

const MAX_DIMENSION = 1000
const MIN_PANEL_WIDTH_RATIO = 0.08
const MIN_PANEL_HEIGHT_RATIO = 0.08
const MIN_PANEL_AREA_RATIO = 0.01
const MAX_PANELS = 12
const EDGE_THRESHOLD = 35
const GUTTER_PERCENTILE = 18
const ROW_TOLERANCE = 0.12

interface Candidate {
  x: number
  y: number
  width: number
  height: number
  edgeCount: number
  area: number
}

function computeGray(data: Uint8ClampedArray, width: number, height: number): Uint8Array {
  const gray = new Uint8Array(width * height)
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    gray[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
  }
  return gray
}

function detectEdges(gray: Uint8Array, width: number, height: number): { h: Float32Array; v: Float32Array } {
  const hEdges = new Float32Array(width * height)
  const vEdges = new Float32Array(width * height)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      const gx = Math.abs(gray[idx + 1] - gray[idx - 1])
      const gy = Math.abs(gray[idx + width] - gray[idx - width])
      hEdges[idx] = gx
      vEdges[idx] = gy
    }
  }

  return { h: hEdges, v: vEdges }
}

function projectEdges(hEdges: Float32Array, vEdges: Float32Array, width: number, height: number): { rowScores: number[]; colScores: number[] } {
  const rowScores = new Array(height).fill(0)
  const colScores = new Array(width).fill(0)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      rowScores[y] += hEdges[idx] + vEdges[idx]
    }
    rowScores[y] /= width
  }

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      colScores[x] += hEdges[y * width + x] + vEdges[y * width + x]
    }
    colScores[x] /= height
  }

  return { rowScores, colScores }
}

function findValleys(scores: number[], percentile: number): number[] {
  if (scores.length < 3) return [0, scores.length - 1]

  const sorted = [...scores].sort((a, b) => a - b)
  const threshold = sorted[Math.floor(sorted.length * (percentile / 100))]

  const valleys: number[] = []
  let inValley = false

  for (let i = 0; i < scores.length; i++) {
    if (scores[i] <= threshold && !inValley) {
      inValley = true
      valleys.push(i)
    } else if (scores[i] > threshold && inValley) {
      inValley = false
    }
  }

  if (!valleys.includes(0)) valleys.unshift(0)
  if (!valleys.includes(scores.length - 1)) valleys.push(scores.length - 1)

  return valleys
}

function segmentPage(scores: number[], size: number): number[] {
  const valleys = findValleys(scores, GUTTER_PERCENTILE)
  const segments = valleys.map(v => Math.max(0, Math.min(size, v)))
  return segments
}

function isNested(candidate: { x: number; y: number; width: number; height: number; area: number }, existing: { x: number; y: number; width: number; height: number; area: number }): boolean {
  const cx = candidate.x + candidate.width / 2
  const cy = candidate.y + candidate.height / 2
  const ex = existing.x + existing.width / 2
  const ey = existing.y + existing.height / 2
  const maxDist = Math.sqrt(existing.width * existing.width + existing.height * existing.height) / 2
  const dist = Math.sqrt((cx - ex) ** 2 + (cy - ey) ** 2)
  return dist < maxDist && candidate.area < existing.area * 0.6
}

function validatePanel(panel: { x: number; y: number; width: number; height: number }, pageWidth: number, pageHeight: number): boolean {
  if (panel.width < pageWidth * MIN_PANEL_WIDTH_RATIO) return false
  if (panel.height < pageHeight * MIN_PANEL_HEIGHT_RATIO) return false
  if (panel.width * panel.height < pageWidth * pageHeight * MIN_PANEL_AREA_RATIO) return false
  const aspect = panel.width / panel.height
  if (aspect < 0.15 || aspect > 8) return false
  return true
}

function resolveReadingOrder(panels: Array<{ x: number; y: number; width: number; height: number; index: number }>, direction: 'ltr' | 'rtl'): number[] {
  const rows: { y: number; panels: Array<{ x: number; y: number; width: number; height: number; index: number }> }[] = []
  const tolerance = ROW_TOLERANCE

  for (const panel of panels) {
    const panelCenterY = panel.y + panel.height / 2
    let assigned = false
    for (const row of rows) {
      if (Math.abs(panelCenterY - row.y) < tolerance) {
        row.panels.push(panel)
        assigned = true
        break
      }
    }
    if (!assigned) {
      rows.push({ y: panelCenterY, panels: [panel] })
    }
  }

  rows.sort((a, b) => a.y - b.y)

  const orderedIndices: number[] = []
  for (const row of rows) {
    row.panels.sort((a, b) => a.x - b.x)
    if (direction === 'rtl') {
      row.panels.reverse()
    }
    orderedIndices.push(...row.panels.map(p => p.index))
  }

  return orderedIndices
}

export async function detectPanels(
  imageUrl: string,
  _threshold: number = 0.5
): Promise<DetectionResult> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let width = img.width
      let height = img.height

      const maxDim = MAX_DIMENSION
      let scale = 1
      if (width > maxDim || height > maxDim) {
        scale = Math.min(maxDim / width, maxDim / height)
        width = Math.floor(width * scale)
        height = Math.floor(height * scale)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      const imageData = ctx.getImageData(0, 0, width, height)
      const gray = computeGray(imageData.data, width, height)

      const { h: hEdges, v: vEdges } = detectEdges(gray, width, height)
      const { rowScores, colScores } = projectEdges(hEdges, vEdges, width, height)

      const rowSegments = segmentPage(rowScores, height)
      const colSegments = segmentPage(colScores, width)

      const candidates: Candidate[] = []

      for (let r = 0; r < rowSegments.length - 1; r++) {
        for (let c = 0; c < colSegments.length - 1; c++) {
          const x = colSegments[c]
          const y = rowSegments[r]
          const w = colSegments[c + 1] - x
          const h = rowSegments[r + 1] - y

          if (w < width * 0.05 || h < height * 0.05) continue

          let edgeCount = 0
          for (let yy = y; yy < y + h && yy < height; yy++) {
            for (let xx = x; xx < x + w && xx < width; xx++) {
              const idx = yy * width + xx
              if (hEdges[idx] > EDGE_THRESHOLD || vEdges[idx] > EDGE_THRESHOLD) {
                edgeCount++
              }
            }
          }

          const area = (w / width) * (h / height)
          candidates.push({
            x: x / width,
            y: y / height,
            width: w / width,
            height: h / height,
            edgeCount,
            area,
          })
        }
      }

      const validated: { x: number; y: number; width: number; height: number; confidence: number; area: number; aspectRatio: number }[] = []

      for (const c of candidates) {
        if (!validatePanel(c, 1, 1)) continue

        const density = c.edgeCount / Math.max(1, c.width * c.height * width * height)
        const confidence = Math.min(1, density * 1.5 + c.area * 0.8)

        validated.push({
          x: c.x,
          y: c.y,
          width: c.width,
          height: c.height,
          confidence,
          area: c.area,
          aspectRatio: c.width / c.height,
        })
      }

      validated.sort((a, b) => b.confidence - a.confidence)

      const filtered: typeof validated = []
      for (const panel of validated) {
        const overlaps = filtered.some(p => {
          const ox = Math.max(panel.x, p.x)
          const oy = Math.max(panel.y, p.y)
          const ox2 = Math.min(panel.x + panel.width, p.x + p.width)
          const oy2 = Math.min(panel.y + panel.height, p.y + p.height)
          const overlapArea = Math.max(0, ox2 - ox) * Math.max(0, oy2 - oy)
          return overlapArea > Math.min(panel.area, p.area) * 0.7
        })
        if (!overlaps) {
          filtered.push(panel)
        }
      }

      const final: typeof filtered = []
      for (const panel of filtered) {
        const nested = final.some(p => isNested(panel, p))
        if (!nested) {
          final.push(panel)
        }
      }

      if (final.length > MAX_PANELS) {
        final.length = MAX_PANELS
      }

      const totalCoverage = final.reduce((sum, p) => sum + p.area, 0)
      const avgConfidence = final.length > 0 ? final.reduce((sum, p) => sum + p.confidence, 0) / final.length : 0

      let status: DetectionStatus = 'SUCCESS'
      let confidence: DetectionConfidence = 'high'

      if (final.length === 0) {
        status = 'NO_PANELS'
        confidence = 'low'
      } else if (final.length === 1 && totalCoverage > 0.85) {
        status = 'NO_PANELS'
        confidence = 'low'
      } else if (totalCoverage < 0.35 || avgConfidence < 0.25) {
        status = 'LOW_CONFIDENCE'
        confidence = 'low'
      } else if (avgConfidence < 0.45) {
        status = 'LOW_CONFIDENCE'
        confidence = 'medium'
      } else if (final.length > 8) {
        status = 'LOW_CONFIDENCE'
        confidence = 'medium'
      }

      const order = resolveReadingOrder(
        final.map((p, i) => ({
          x: p.x,
          y: p.y,
          width: p.width,
          height: p.height,
          index: i,
        })),
        'ltr'
      )

      const orderedPanels = order.map(idx => {
        const p = final[idx]
        return {
          x: p.x,
          y: p.y,
          width: p.width,
          height: p.height,
          confidence: p.confidence,
          area: p.area,
          aspectRatio: p.aspectRatio,
          index: order.indexOf(idx),
        }
      })

      resolve({
        status,
        panels: orderedPanels,
        confidence,
        rawCandidates: candidates.length,
      })
    }
    img.onerror = () => {
      resolve({
        status: 'ERROR',
        panels: [],
        confidence: 'low',
        rawCandidates: 0,
      })
    }
    img.src = imageUrl
  })
}
