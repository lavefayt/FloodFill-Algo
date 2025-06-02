"use client"

import type { Tool } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Pencil, PaintBucket, Minus, Square, Circle, Eraser, Trash2 } from "lucide-react"

interface ToolbarProps {
  currentTool: Tool
  onToolChange: (tool: Tool) => void
  onClear: () => void
}

export function Toolbar({ currentTool, onToolChange, onClear }: ToolbarProps) {
  const tools = [
    { id: "pen" as Tool, icon: Pencil, label: "Pen" },
    { id: "bucket" as Tool, icon: PaintBucket, label: "Paint Bucket" },
    { id: "line" as Tool, icon: Minus, label: "Line" },
    { id: "rectangle" as Tool, icon: Square, label: "Rectangle" },
    { id: "circle" as Tool, icon: Circle, label: "Circle" },
    { id: "eraser" as Tool, icon: Eraser, label: "Eraser" },
  ]

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
      {tools.map((tool) => {
        const Icon = tool.icon
        return (
          <Button
            key={tool.id}
            variant={currentTool === tool.id ? "default" : "outline"}
            size="sm"
            onClick={() => onToolChange(tool.id)}
            className="flex items-center gap-2"
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{tool.label}</span>
          </Button>
        )
      })}

      <div className="ml-auto">
        <Button variant="destructive" size="sm" onClick={onClear} className="flex items-center gap-2">
          <Trash2 size={16} />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      </div>
    </div>
  )
}
