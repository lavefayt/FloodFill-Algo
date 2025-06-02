"use client"

interface ColorPickerProps {
  currentColor: string
  onColorChange: (color: string) => void
}

export function ColorPicker({ currentColor, onColorChange }: ColorPickerProps) {
  const predefinedColors = [
    "#000000",
    "#FFFFFF",
    "#FF0000",
    "#6AA84F",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#FFC0CB",
    "#A52A2A",
    "#808080",
    "#000080",
    "#008000",
  ]

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="color-picker" className="text-sm font-medium text-gray-700">
        Color:
      </label>

      <div className="flex items-center gap-2">
        <input
          id="color-picker"
          type="color"
          value={currentColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
        />

        <div className="flex flex-wrap gap-1 max-w-xs">
          {predefinedColors.map((color) => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`w-6 h-6 rounded border-2 cursor-pointer hover:scale-110 transition-transform ${
                currentColor === color ? "border-gray-800" : "border-gray-300"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
