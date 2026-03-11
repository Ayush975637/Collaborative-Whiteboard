const COLORS = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#f97316', '#a855f7']

export default function Toolbar({ color, width, tool, onColorChange, onToolChange, onWidthChange, onClear }) {
  return (

    <div className="flex flex-row md:flex-col items-center md:gap-4 gap-1 p-2 mx-auto ">
      
      {/* Colors */}
      <div className="flex flex-row md:flex-col gap-2 ">
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => onColorChange(c)}
            className="w-6 h-6  rounded-full border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: c,
              borderColor: c === color ? '#000' : 'transparent',
            }}
          />
        ))}
      </div>

      {/* Divider */}
      {/* <div className="w-full h-px md:w-px md:h-6 bg-gray-200" /> */}

      {/* Brush Size */}
      <input
        type="range"
        min="1" max="20" value={width}
        onChange={(e) => onWidthChange(Number(e.target.value))}
        className="w-16 md:w-20 accent-black"
        style={{ writingMode: 'horizontal-tb' }}
      />

      {/* Divider */}
      {/* <div className="w-full h-px md:w-px md:h-6 bg-gray-200" /> */}

<div className="md:block hidden flex gap-2">
      {/* Tools */}
      <button
        onClick={() => onToolChange('pen')}
        className={`  px-2 py-1 rounded-lg text-sm ${tool === 'pen' ? 'bg-black text-white' : 'text-gray-700'}`}
      >
        ✏️
      </button>
      <button
        onClick={() => onToolChange('eraser')}
        className={` px-2 py-1 rounded-lg text-sm ${tool === 'eraser' ? 'bg-black text-white' : 'text-gray-600'}`}
      >
        🧹
      </button>

      {/* Divider */}
      {/* <div className="w-full md:block hidden h-px md:w-px md:h-6 bg-gray-200" /> */}

      <button
        onClick={onClear}
        className="px-2 py-1  rounded-lg text-sm text-red-500 hover:bg-red-50"
      >
        🗑️
      </button>
      </div>
    </div>
    
  )
}