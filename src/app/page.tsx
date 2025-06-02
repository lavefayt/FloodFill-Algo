"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { Toolbar } from "@/components/toolbar"
import { ColorPicker } from "@/components/color-picker"
import { floodFill } from "@/utils/flood-fill"

export type Tool = "pen" | "bucket" | "line" | "rectangle" | "circle" | "eraser"

export default function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentTool, setCurrentTool] = useState<Tool>("pen")
  const [currentColor, setCurrentColor] = useState("#000000")
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [brushSize, setBrushSize] = useState(2)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      // Get the container's actual size
      const rect = container.getBoundingClientRect()

      // Set canvas internal size to match container
      canvas.width = rect.width
      canvas.height = 600 // Keep fixed height for consistency

    // Fill with white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Initial resize
    resizeCanvas()

    // Add resize listener
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    // This gets the position and size of the canvas element relative to the viewport (window).
    // Useful for adjusting mouse coordinates so they match the canvas’s internal coordinate system.
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const drawLine = useCallback(
    (ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) => {
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
    },
    [],
  )

  const drawRectangle = useCallback(
    (ctx: CanvasRenderingContext2D, start: { x: number; y: number }, end: { x: number; y: number }) => {
      const width = end.x - start.x
      const height = end.y - start.y
      ctx.beginPath()
      ctx.rect(start.x, start.y, width, height)
      ctx.stroke()
    },
    [],
  )

  const drawCircle = useCallback(
    (ctx: CanvasRenderingContext2D, start: { x: number; y: number }, end: { x: number; y: number }) => {
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
      ctx.beginPath()
      ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI)
      ctx.stroke()
    },
    [],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const pos = getMousePos(e)
      setStartPos(pos)
      setIsDrawing(true)

      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.lineWidth = brushSize

      if (currentTool === "pen") {
        ctx.strokeStyle = currentColor
        ctx.globalCompositeOperation = "source-over"
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
      } else if (currentTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out"
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
      } else if (currentTool === "bucket") {
        // Ensure we're working with integer coordinates
        const x = Math.floor(pos.x)
        const y = Math.floor(pos.y)

        // Check bounds
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const newImageData = floodFill(imageData, x, y, currentColor)
          ctx.putImageData(newImageData, 0, 0)
        }
        setIsDrawing(false) // Don't continue drawing for bucket tool
      }
    },
    [currentTool, currentColor, brushSize, getMousePos],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || currentTool === "bucket") return

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const pos = getMousePos(e)

      if (currentTool === "pen") {
        ctx.strokeStyle = currentColor
        ctx.globalCompositeOperation = "source-over"
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
      } else if (currentTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out"
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
      }
    },
    [isDrawing, currentTool, currentColor, getMousePos],
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || currentTool === "bucket") return

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const pos = getMousePos(e)
      setIsDrawing(false)

      ctx.globalCompositeOperation = "source-over"
      ctx.strokeStyle = currentColor

      if (currentTool === "line") {
        drawLine(ctx, startPos, pos)
      } else if (currentTool === "rectangle") {
        drawRectangle(ctx, startPos, pos)
      } else if (currentTool === "circle") {
        drawCircle(ctx, startPos, pos)
      }
    },
    [isDrawing, currentTool, currentColor, startPos, getMousePos, drawLine, drawRectangle, drawCircle],
  )

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create a temporary canvas with white background to ensure proper export
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height

    // Fill with white background
    tempCtx.fillStyle = "#ffffff"
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

    // Draw the original canvas content on top
    tempCtx.drawImage(canvas, 0, 0)

    // Create download link
    const link = document.createElement("a")
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
    link.download = `elef-paint-${timestamp}.png`
    link.href = tempCanvas.toDataURL("image/png")

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Elef Paint</h1>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex flex-col gap-4 mb-4">
            <Toolbar currentTool={currentTool} onToolChange={setCurrentTool} onClear={clearCanvas} onExport={handleExport}/>

            <div className="flex items-center gap-4">
              <ColorPicker currentColor={currentColor} onColorChange={setCurrentColor} />

              <div className="flex items-center gap-2">
                <label htmlFor="brush-size" className="text-sm font-medium text-gray-700">
                  Brush Size:
                </label>
                <input
                  id="brush-size"
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-gray-600 w-6">{brushSize}</span>
              </div>
            </div>
          </div>

          <div ref={containerRef} className="border-2 border-gray-300 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setIsDrawing(false)}
              className="block cursor-crosshair w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}