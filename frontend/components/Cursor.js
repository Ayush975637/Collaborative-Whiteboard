


export default function Cursor({username,x,y,color}){




    return(
<div 
className="absolute pointer-events-none z-50 transition-all duration-75"
style={{ left: x, top: y }}
>

    <svg
    width="16" height="16" viewBox="0 0 16 16" 
    >
<path 
 d="M0 0 L0 12 L3.5 8.5 L6 14 L8 13 L5.5 7.5 L10 7.5 Z"
fill={color}
></path>





    </svg>
    <span
        className="text-xs text-white px-1 py-0.5 rounded ml-2 whitespace-nowrap"
        style={{backgroundColor:color}}
    >

{username}




    </span>
</div>

    )
}