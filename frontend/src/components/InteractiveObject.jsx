/**
 * InteractiveObject Component
 * 
 * Renders a 3D interactive object in the scene with hover effects,
 * occupied state indicators, and click handling.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const InteractiveObject = ({
  object,
  onInteract,
  depthSorter = null,
  isOccupied = false
}) => {
  const meshRef = useRef();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [model, setModel] = useState(null);

  // Load 3D model
  useEffect(() => {
    if (object.modelPath) {
      const loader = new GLTFLoader();
      loader.load(
        object.modelPath,
        (gltf) => {
          setModel(gltf.scene);
        },
        undefined,
        (error) => {
          console.error('Error loading model:', error);
          // Fallback to basic geometry
          createFallbackGeometry();
        }
      );
    } else {
      createFallbackGeometry();
    }
  }, [object.modelPath]);

  // Create fallback geometry if model fails to load
  const createFallbackGeometry = () => {
    const geometry = new THREE.BoxGeometry(
      object.scale?.x || 1,
      object.scale?.y || 1,
      object.scale?.z || 1
    );
    const material = new THREE.MeshStandardMaterial({
      color: object.config?.color || 0x888888
    });
    const mesh = new THREE.Mesh(geometry, material);
    setModel(mesh);
  };

  // Register with depth sorter
  useEffect(() => {
    if (meshRef.current && depthSorter) {
      const yPosition = object.position?.y || 0;
      const isStatic = object.config?.isStatic !== false;
      
      depthSorter.register(
        object.id,
        meshRef.current,
        yPosition,
        isStatic
      );

      return () => {
        depthSorter.unregister(object.id);
      };
    }
  }, [object.id, object.position, depthSorter]);

  // Update depth sorter on position change
  useEffect(() => {
    if (meshRef.current && depthSorter && object.position) {
      depthSorter.updatePosition(object.id, object.position.y);
    }
  }, [object.position?.y, depthSorter, object.id]);

  // Handle pointer over
  const handlePointerOver = (event) => {
    event.stopPropagation();
    setIsHighlighted(true);
    document.body.style.cursor = 'pointer';
  };

  // Handle pointer out
  const handlePointerOut = (event) => {
    event.stopPropagation();
    setIsHighlighted(false);
    document.body.style.cursor = 'default';
  };

  // Handle click
  const handleClick = (event) => {
    event.stopPropagation();
    if (onInteract) {
      onInteract(object);
    }
  };

  // Apply highlight effect
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          if (isHighlighted) {
            // Store original emissive if not already stored
            if (!child.userData.originalEmissive) {
              child.userData.originalEmissive = child.material.emissive?.clone() || new THREE.Color(0x000000);
            }
            // Apply highlight
            if (child.material.emissive) {
              child.material.emissive.setHex(0x444444);
            }
          } else {
            // Restore original emissive
            if (child.userData.originalEmissive && child.material.emissive) {
              child.material.emissive.copy(child.userData.originalEmissive);
            }
          }
        }
      });
    }
  }, [isHighlighted]);

  // Apply occupied indicator
  useEffect(() => {
    if (meshRef.current && isOccupied) {
      meshRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          // Store original color if not already stored
          if (!child.userData.originalColor) {
            child.userData.originalColor = child.material.color?.clone() || new THREE.Color(0xffffff);
          }
          // Tint red for occupied
          if (child.material.color) {
            const tintedColor = child.userData.originalColor.clone();
            tintedColor.lerp(new THREE.Color(0xff0000), 0.3);
            child.material.color.copy(tintedColor);
          }
        }
      });
    } else if (meshRef.current && !isOccupied) {
      // Restore original color
      meshRef.current.traverse((child) => {
        if (child.isMesh && child.material && child.userData.originalColor) {
          if (child.material.color) {
            child.material.color.copy(child.userData.originalColor);
          }
        }
      });
    }
  }, [isOccupied]);

  if (!model) {
    return null;
  }

  const position = [
    object.position?.x || 0,
    object.position?.y || 0,
    object.position?.z || 0
  ];

  const rotation = [
    object.rotation?.x || 0,
    object.rotation?.y || 0,
    object.rotation?.z || 0
  ];

  const scale = [
    object.scale?.x || 1,
    object.scale?.y || 1,
    object.scale?.z || 1
  ];

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      userData={{
        interactiveId: object.id,
        isInteractive: true,
        objectType: object.objectType,
        objectName: object.name
      }}
    >
      <primitive object={model} />
      
      {/* Occupied indicator badge */}
      {isOccupied && (
        <mesh position={[0, (object.scale?.y || 1) + 0.5, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color={0xff0000} />
        </mesh>
      )}
    </group>
  );
};

export default InteractiveObject;
