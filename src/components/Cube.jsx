import React from 'react';
import {useRef} from "react";
import { useFrame } from '@react-three/fiber';


const Cube = ({ args = [2, 2, 2], color = "orange", position = [0,0,-15] }) => {
  
const cubeRef = useRef();

  useFrame(()=> {
    cubeRef.current.rotation.y +=0.05;
  })
  
  return (
    <mesh ref = {cubeRef} position ={position}>
      <boxGeometry args={args} />
      <meshPhongMaterial color={color} />
    </mesh>
  );
};

export default Cube;
