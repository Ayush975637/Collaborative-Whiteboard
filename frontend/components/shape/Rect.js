
"use client"
import React,{useRef,useEffect} from 'react';
import {  Rect, Transformer } from 'react-konva';



const Rectangle =({element,selected,onSelect,onChange})=>{
 const shapeRef=useRef();
 const trRef=useRef();

useEffect(() => {
  if(selected&& trRef.current && shapeRef.current){
    trRef.current.nodes([shapeRef.current]);
  }
console.log("Rectangle", element.id, selected);



}, [selected]);






    return (
<React.Fragment>
<Rect
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


node.scaleX(1);
node.scaleY(1);
onChange({
 ...element,
 x:node.x(),
 y:node.y(),

 width: Math.max(5, node.width() * scaleX),
            height: Math.max(5,node.height() * scaleY),
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



    )
}

export default Rectangle;