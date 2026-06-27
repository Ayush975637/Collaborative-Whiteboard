"use client"
import React,{useRef,useEffect} from 'react';

import { Line } from 'react-konva';




const Lin = ({element,selected,onSelect,onChange}) => {
 const shapeRef=useRef();
 const trRef=useRef();

useEffect(() => {
  if(selected&& trRef.current && shapeRef.current){
    trRef.current.nodes([shapeRef.current]);
    trRef.current.getLayer().batchDraw();
  }




}, [selected]);


  return (
   
        <React.Fragment>
        <Line
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...element}
        draggable
        onDragEnd={(e)=>{
        
            onChange({
        ...element,
        x:e.target.x(),
        y:e.target.y(),
        
        
        
        
            })
        
        
        }}
        
        
        
        
        
        
        
        
        
        
        
        
        
        />
        
      
        
        
        
        
        
        
        
        
        </React.Fragment>
        
      
  );
};

export default Lin;
