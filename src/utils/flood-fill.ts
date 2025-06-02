interface RGB {
  r: number
  g: number
  b: number
  a: number
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
        a: 255,
      }
    : { r: 0, g: 0, b: 0, a: 255 }
}

function getPixelColor(imageData: ImageData, x: number, y: number): RGB {
  const index = (y * imageData.width + x) * 4
  return {
    r: imageData.data[index],
    g: imageData.data[index + 1],
    b: imageData.data[index + 2],
    a: imageData.data[index + 3],
  }
}

function setPixelColor(imageData: ImageData, x: number, y: number, color: RGB): void {
  const index = (y * imageData.width + x) * 4
  imageData.data[index] = color.r
  imageData.data[index + 1] = color.g
  imageData.data[index + 2] = color.b
  imageData.data[index + 3] = color.a
}

function colorsMatch(color1: RGB, color2: RGB): boolean {
  return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b && color1.a === color2.a
}

export function floodFill(imageData: ImageData, startX: number, startY: number, fillColorHex: string): ImageData {
  const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height)

  const fillColor = hexToRgb(fillColorHex)
  const targetColor = getPixelColor(newImageData, startX, startY)

  // If the target color is the same as fill color, no need to fill
  if (colorsMatch(targetColor, fillColor)) {
    return newImageData
  }

  const stack: Array<{ x: number; y: number }> = [{ x: startX, y: startY }]
  const visited = new Set<string>()

  while (stack.length > 0) {
    const { x, y } = stack.pop()!

    // Check bounds
    if (x < 0 || x >= newImageData.width || y < 0 || y >= newImageData.height) {
      continue
    }

    const key = `${x},${y}`
    if (visited.has(key)) {
      continue
    }

    const currentColor = getPixelColor(newImageData, x, y)

    // If current pixel doesn't match target color, skip
    if (!colorsMatch(currentColor, targetColor)) {
      continue
    }

    // Mark as visited and fill the pixel
    visited.add(key)
    setPixelColor(newImageData, x, y, fillColor)

    // Add neighboring pixels to stack
    stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 })
  }

  return newImageData
}