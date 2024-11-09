import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export function Arrow(props) {

  const arrowRef = useRef();
  

  const { nodes, materials } = useGLTF("/models/direction_arrow.glb");
  return (
    <group {...props} ref = {arrowRef} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, -0.015]}>
        <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Arrow_Material001_0.geometry}
            material={materials["Material.001"]}
            position={[11.483, 8.663, 11.398]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/direction_arrow.glb");
export default Arrow;
