"use client"
import React,{useRef,useEffect} from 'react';
import {  Arrow,Transformer } from 'react-konva';

const Arr = ({element,selected,onSelect,onChange}) => {

const shapeRef=useRef();
 const trRef=useRef();

useEffect(() => {
  if(selected&& trRef.current && shapeRef.current){
    trRef.current.nodes([shapeRef.current]);
  }




}, [selected]);









  return (
    <React.Fragment>
        <Arrow
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

const newPoints=element.points.map((value,idx)=>
    idx%2==0?value*scaleX:value*scaleY
)

onChange({
 ...element,
 x:node.x(),
 y:node.y(),

 points:newPoints,
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

export default Arr;