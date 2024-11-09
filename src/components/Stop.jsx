import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Stop(props) {
  const { nodes, materials } = useGLTF('/models/stop.glb')
  return (
    <group {...props} dispose={null}>
      <group scale={0.01}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Stop_Sign_Stop_Sign_0.geometry}
          material={materials.Stop_Sign}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/models/stop.glb');
export default Stop;  