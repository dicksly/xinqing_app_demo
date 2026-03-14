export function normalizeImageDataUrl(dataUrl) {
  return typeof dataUrl === 'string' ? dataUrl.trim() : ''
}

export function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = dataUrl
  })
}

export async function compressImageDataUrl(dataUrl, options = {}) {
  const normalized = normalizeImageDataUrl(dataUrl)
  if (!normalized || typeof document === 'undefined') {
    return normalized
  }

  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.8,
    outputType = 'image/jpeg',
  } = options

  const image = await loadImageFromDataUrl(normalized)
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1)
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    return normalized
  }

  context.drawImage(image, 0, 0, width, height)
  return canvas.toDataURL(outputType, quality)
}
