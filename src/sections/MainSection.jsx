import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  PerspectiveCamera,
  useScroll,
  ScrollControls,
  Scroll,
} from "@react-three/drei";
import { Leva, useControls } from "leva";
import { useMediaQuery } from "react-responsive";
import { Environment } from "@react-three/drei";
import Cube from "../components/Cube.jsx";
import { XR, ARButton } from "@react-three/xr";
import Stop from "../components/Stop";
import Arrow from "../components/Arrow"

const MainSection = () => {
  return (
    <>
      <ARButton />
      <Canvas>
        <XR>
          <ambientLight intensity={2.0} />
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          <Arrow position = {[0,0,-15]} scale ={4.0} rotation ={[1.2,0,0]}/>
        </XR>
      </Canvas>
    </>
  );
};

export default MainSection;
