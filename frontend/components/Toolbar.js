const COLORS = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#f97316', '#a855f7']

export default function Toolbar({
color,width,tool,onColorChange,onToolChange,onWidthChange,onClear

})
{
    return(

        <div
        className="absolute top-4 left-1/2-translate-x-1/2 z-50 bg-white shadow-lg rounded-xl px-4 py-2 flex  items-center gap-4"
        
        >

{/* color */}
<div className="flex gap-2">
{COLORS.map(c=>(
<button
key={c}
onClick={()=>onColorChange(c)}
className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
style={{
    backgroundColor:c,
    borderColor: c === color ? '#000' : 'transparent',
}}
   />

  


))}
</div>

{/* divider */}
<div className="w-px h-6 bg-gray-200"/>


{/* brushSize */}
<input
type="range"
min="1" max="20" value={width}
onChange={(e)=>onWidthChange(e.target.value)}
className="w-24"
/>
<div className="w-px h-6 bg-gray-200"/>

{/* tools */}
<button
onClick={()=>onToolChange('pen')}
className={`px-3 py-1 rounded-lg ${tool==='pen'?'bg-black text-white':' text-gray-700'}`}
>
    ✏️Pen
</button>
<button
        onClick={() => onToolChange('eraser')}
        className={`px-3 py-1 rounded-lg text-sm ${tool === 'eraser' ? 'bg-black text-white' : 'text-gray-600'}`}
      >
        🧹 Eraser
      </button>

<div className="w-px h-6 bg-gray-200" />


<button
        onClick={onClear}
        className="px-3 py-1 rounded-lg text-sm text-red-500 hover:bg-red-50"
      >
        🗑️ Clear
      </button>









        </div>



    )
}