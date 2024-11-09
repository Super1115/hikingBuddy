import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { XR, ARButton } from "@react-three/xr";
import Arrow from "../components/Arrow";

const ARSection = () => {
  // State to control Arrow visibility
  const [isARSessionActive, setIsARSessionActive] = useState(false);

  return (
    <>
      <ARButton />
      <Canvas>
        <XR 
          onSessionStart={() => setIsARSessionActive(true)} 
          onSessionEnd={() => setIsARSessionActive(false)}
        >
          <ambientLight intensity={2.0} />
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          
          {/* Only render Arrow if the AR session is active */}
          {isARSessionActive && (
            <Arrow position={[0, 0, -15]} scale={4.0} rotation={[1.2, 0, 0]} />
          )}
        </XR>
      </Canvas>
    </>
  );
};

export default ARSection;
