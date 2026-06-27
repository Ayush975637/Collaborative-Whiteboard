import React from 'react'
import Rectangle from './Rect'
import Cir from './Circle'
import Tex from './text'
import Arr from './Arrow'
import Lin from './line'
const ShapeRender = ({element,selected,onSelect,onChange}) => {



switch(element.type){

case "rect":
    return <Rectangle

element={element}
selected={selected}
onSelect={onSelect}
onChange={onChange}



/>

case "circle":
    return <Cir
  
element={element}
selected={selected}
onSelect={onSelect}
onChange={onChange}
    
    />

case "text":
    return  <Tex
 
element={element}
selected={selected}
onSelect={onSelect}
onChange={onChange}
      
      />

case "arrow":
    return <Arr
  
element={element}
selected={selected}
onSelect={onSelect}
onChange={onChange}
    
    
    
    
    
    />


case "line":
    return <Lin
    
   
element={element}
selected={selected}
onSelect={onSelect}
onChange={onChange}
    
    
    
    
    
    
    />







 
}


return (


    <div>



    </div>
)




}

export default ShapeRender;
