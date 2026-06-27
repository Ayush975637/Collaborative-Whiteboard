"use client"
import React,{useRef,useEffect} from 'react';

import {  Circle,Transformer } from 'react-konva';


const Cir = ({element,selected,onSelect,onChange}) => {

const shapeRef=useRef();
 const trRef=useRef();

useEffect(() => {
  if(selected&& trRef.current && shapeRef.current){
    trRef.current.nodes([shapeRef.current]);
  }




}, [selected]);






  return (
   <React.Fragment>
        <Circle
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
        
        onTransformEnd={(e)=>{
        
        const node=shapeRef.current;
        const scaleX=node.scaleX();
        const scaleY=node.scaleY();
        
        const scale=Math.max(scaleX,scaleY);
        node.scaleX(1);
        node.scaleY(1);
        onChange({
         ...element,
         x:node.x(),
         y:node.y(),
        
        radius:Math.max(5,element.radius*scale),
                  rotation:node.rotation(),
        
        })
        
        
        
        
        }}
        
        
        
        
        
        
        
        
        
        
        
        />
        
        {selected&&(
        
        <Transformer
        ref={trRef}
        flipEnabled={false}
        boundBoxFunc={(oldBox,newBox)=>{
        
        if(Math.abs(newBox.width)<5||Math.abs(newBox.height)<5){
            return oldBox;
        }
        return newBox;
        
        
        
        
        
        }}
        
        
        
        
        />
        
        
        
        
        
        
        
        
        )}
        


        </React.Fragment>
     
  );
};

export default Cir;
