import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import {
  FiRotateCw,
  FiSliders,
  FiEye,
  FiActivity,
  FiCheck,
  FiCamera,
  FiLayers,
  FiUser,
  FiBox,
  FiMaximize2
} from 'react-icons/fi';

// ─── Fabric Procedural Texture Generators ────────────────────────────────────
function createFabricTexture(fabricType = 'cotton') {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  if (fabricType === 'cotton' || fabricType === 'jersey') {
    // Fine interlaced jersey / cotton knit
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < 512; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
    for (let y = 0; y < 512; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
  } else if (fabricType === 'denim') {
    // 45-degree twill weave
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2.2;
    for (let i = -512; i < 1024; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 512, 512);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.20)';
    for (let y = 0; y < 512; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
  } else if (fabricType === 'wool') {
    // Fuzzy brushed wool weave
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 2.8;
    for (let x = 0; x < 512; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
    for (let y = 0; y < 512; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
  } else if (fabricType === 'leather') {
    // Fine cellular pebble leather grain
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let i = 0; i < 1200; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      const r = Math.random() * 2.2 + 0.8;
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (fabricType === 'silk') {
    // Ultra smooth with delicate vertical sheen lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 512; x += 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

// ─── 1. EDITORIAL GHOST ATELIER MANNEQUIN (EXACT PHOTO REPLICA + REAL FIT) ───
// Renders clean tailored ecru neck form, 2-tone retro runner sneakers, dark plinth,
// and dynamically wears: T-Shirt, Oxford Shirt, Chore Jacket, Hoodie, Cargo Pants, or Midi Dress!
function EditorialGhostMannequin({
  activeGarment = 'jacket',
  heroColor = '#243746',
  innerColor = '#EAE6DF',
  trousersColor = '#36393E',
  fabric = 'cotton',
  isHeatmap = false,
  wireframe = false,
  showAccessories = true
}) {
  const bumpTex = useMemo(() => createFabricTexture(fabric), [fabric]);

  // Dynamic Hero Garment Material
  const heroMat = useMemo(() => {
    if (isHeatmap) {
      return new THREE.MeshStandardMaterial({
        color: '#10B981',
        emissive: '#047857',
        emissiveIntensity: 0.35,
        wireframe,
        roughness: 0.5
      });
    }
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(heroColor),
      roughness: fabric === 'leather' ? 0.35 : fabric === 'silk' ? 0.28 : 0.68,
      metalness: fabric === 'silk' ? 0.15 : 0.04,
      wireframe,
      side: THREE.DoubleSide
    });
    if (bumpTex) {
      mat.bumpMap = bumpTex;
      mat.bumpScale = fabric === 'leather' ? 0.04 : fabric === 'denim' ? 0.035 : 0.02;
    }
    return mat;
  }, [heroColor, fabric, isHeatmap, wireframe, bumpTex]);

  // Secondary Inner Top Material (Neutral Ecru / Off-white)
  const innerMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(innerColor),
      roughness: 0.78,
      metalness: 0.02,
      wireframe
    });
  }, [innerColor, wireframe]);

  // Trousers Material
  const trouserMat = useMemo(() => {
    const isHeroPants = activeGarment === 'pants';
    const effectiveColor = isHeroPants ? heroColor : trousersColor;

    if (isHeatmap) {
      return new THREE.MeshStandardMaterial({
        color: '#34D399',
        emissive: '#059669',
        emissiveIntensity: 0.25,
        wireframe,
        roughness: 0.5
      });
    }
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(effectiveColor),
      roughness: 0.72,
      metalness: 0.03,
      wireframe
    });
    if (bumpTex) {
      mat.bumpMap = bumpTex;
      mat.bumpScale = 0.025;
    }
    return mat;
  }, [activeGarment, heroColor, trousersColor, isHeatmap, wireframe, bumpTex]);

  // Tailored Mannequin Neck Form Material (Ecru Studio Fabric)
  const mannequinFormMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#E6DFD5',
      roughness: 0.85,
      metalness: 0.02
    });
  }, []);

  const neckCapTopMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#D4CDC2',
      roughness: 0.45,
      metalness: 0.25
    });
  }, []);

  // Sneaker Materials
  const sneakerWhiteMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.32 }), []);
  const sneakerSuedeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8B6239', roughness: 0.85 }), []); // Camel brown suede
  const sneakerGumSoleMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2C1D11', roughness: 0.75 }), []); // Dark gum tread

  // Floor Plate Material
  const floorPlateMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2B2B2E', roughness: 0.35, metalness: 0.65 }), []);

  // Concrete Pedestal Material & Accessories
  const concreteMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9CA3AF', roughness: 0.88, metalness: 0.05 }), []);
  const leatherAccessoryMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#5C4431', roughness: 0.6 }), []);
  const goldMetalMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#D97706', roughness: 0.2, metalness: 0.85 }), []);
  const buttonPearlMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#F3F4F6', roughness: 0.2, metalness: 0.3 }), []);

  return (
    <group position={[0, -0.95, 0]}>
      {/* ─── A. RECTANGULAR MATTE FLOOR PLATE (UNDER SNEAKERS) ─── */}
      <mesh position={[0, 0.008, 0]} material={floorPlateMat}>
        <boxGeometry args={[0.76, 0.016, 0.54]} />
      </mesh>

      {/* ─── B. MANNEQUIN INTERNAL NECK FORM (GHOST ATELIER CAP) ─── */}
      <group position={[0, 2.12, 0]}>
        {/* Tailored Neck Cylinder */}
        <mesh material={mannequinFormMat}>
          <cylinderGeometry args={[0.070, 0.076, 0.16, 32]} />
        </mesh>
        {/* Flat Polished Top Rim Cap */}
        <mesh position={[0, 0.08, 0]} material={neckCapTopMat}>
          <cylinderGeometry args={[0.070, 0.070, 0.012, 32]} />
        </mesh>
      </group>

      {/* ─── C. UPPER GARMENT MESHES (DYNAMIC TO ACTIVE GARMENT) ─── */}

      {/* 1. T-SHIRT (Heavyweight Atelier Crewneck) */}
      {activeGarment === 'tshirt' && (
        <group>
          {/* T-Shirt Torso */}
          <group position={[0, 1.62, 0]}>
            <mesh material={heroMat}>
              <cylinderGeometry args={[0.23, 0.21, 0.76, 32]} />
            </mesh>
            {/* Ribbed Round Collar Ring */}
            <mesh position={[0, 0.37, 0]} rotation={[Math.PI / 2, 0, 0]} material={heroMat}>
              <torusGeometry args={[0.084, 0.018, 16, 32]} />
            </mesh>
            {/* Bottom Hem Roll */}
            <mesh position={[0, -0.37, 0]} material={heroMat}>
              <cylinderGeometry args={[0.215, 0.215, 0.025, 32]} />
            </mesh>
          </group>

          {/* Left Short Sleeve (Drop Shoulder) */}
          <group position={[-0.29, 1.76, 0]} rotation={[0, 0, 0.42]}>
            <mesh material={heroMat}>
              <cylinderGeometry args={[0.092, 0.082, 0.28, 24]} />
            </mesh>
            {/* Left Sleeve Cuff Hem */}
            <mesh position={[0, -0.14, 0]} material={heroMat}>
              <cylinderGeometry args={[0.084, 0.084, 0.02, 24]} />
            </mesh>
          </group>

          {/* Right Short Sleeve (Drop Shoulder) */}
          <group position={[0.29, 1.76, 0]} rotation={[0, 0, -0.42]}>
            <mesh material={heroMat}>
              <cylinderGeometry args={[0.092, 0.082, 0.28, 24]} />
            </mesh>
            {/* Right Sleeve Cuff Hem */}
            <mesh position={[0, -0.14, 0]} material={heroMat}>
              <cylinderGeometry args={[0.084, 0.084, 0.02, 24]} />
            </mesh>
          </group>
        </group>
      )}

      {/* 2. OXFORD SHIRT (Button-Down Dress Shirt) */}
      {activeGarment === 'shirt' && (
        <group>
          {/* Shirt Torso */}
          <group position={[0, 1.62, 0]}>
            <mesh material={heroMat}>
              <cylinderGeometry args={[0.23, 0.21, 0.74, 32]} />
            </mesh>
            {/* Pointed Spread Collar Band */}
            <mesh position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]} material={heroMat}>
              <torusGeometry args={[0.082, 0.02, 16, 32]} />
            </mesh>
            {/* Left Collar Point */}
            <mesh position={[-0.07, 0.35, 0.09]} rotation={[0.4, 0.2, -0.3]} material={heroMat}>
              <boxGeometry args={[0.08, 0.09, 0.012]} />
            </mesh>
            {/* Right Collar Point */}
            <mesh position={[0.07, 0.35, 0.09]} rotation={[0.4, -0.2, 0.3]} material={heroMat}>
              <boxGeometry args={[0.08, 0.09, 0.012]} />
            </mesh>

            {/* Front Button Placket Stripe */}
            <mesh position={[0, 0, 0.212]} material={heroMat}>
              <boxGeometry args={[0.032, 0.72, 0.01]} />
            </mesh>

            {/* Placket Pearl Buttons */}
            {[-0.24, -0.12, 0, 0.12, 0.24].map((yOff, idx) => (
              <mesh key={idx} position={[0, yOff, 0.22]} material={buttonPearlMat}>
                <cylinderGeometry args={[0.007, 0.007, 0.006, 16]} />
              </mesh>
            ))}

            {/* Left Chest Dress Pocket */}
            <mesh position={[-0.12, 0.10, 0.21]} material={heroMat}>
              <boxGeometry args={[0.08, 0.10, 0.01]} />
            </mesh>

            {/* Curved Shirt Tail Hem */}
            <mesh position={[0, -0.38, 0]} material={heroMat}>
              <cylinderGeometry args={[0.215, 0.20, 0.04, 32]} />
            </mesh>
          </group>

          {/* Left Long Sleeve with Barrel Cuff */}
          <group position={[-0.32, 1.58, 0]} rotation={[0, 0, 0.14]}>
            <mesh material={heroMat}>
              <cylinderGeometry args={[0.088, 0.072, 0.58, 24]} />
            </mesh>
            <mesh position={[0, -0.30, 0]} material={heroMat}>
              <cylinderGeometry args={[0.074, 0.074, 0.05, 24]} />
            </mesh>
            <mesh position={[0.04, -0.30, 0.04]} material={buttonPearlMat}>
              <cylinderGeometry args={[0.005, 0.005, 0.005, 12]} />
            </mesh>
          </group>

          {/* Right Long Sleeve with Barrel Cuff */}
          <group position={[0.32, 1.58, 0]} rotation={[0, 0, -0.14]}>
            <mesh material={heroMat}>
              <cylinderGeometry args={[0.088, 0.072, 0.58, 24]} />
            </mesh>
            <mesh position={[0, -0.30, 0]} material={heroMat}>
              <cylinderGeometry args={[0.074, 0.074, 0.05, 24]} />
            </mesh>
            <mesh position={[-0.04, -0.30, 0.04]} material={buttonPearlMat}>
              <cylinderGeometry args={[0.005, 0.005, 0.005, 12]} />
            </mesh>
          </group>
        </group>
      )}

      {/* 3. WORKWEAR CHORE JACKET (Layered Open Jacket over Ecru Tee) */}
      {activeGarment === 'jacket' && (
        <group>
          {/* Inner Tucked Crewneck Tee */}
          <group position={[0, 1.62, 0]}>
            <mesh material={innerMat}>
              <cylinderGeometry args={[0.22, 0.20, 0.72, 32]} />
            </mesh>
            <mesh position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]} material={innerMat}>
              <torusGeometry args={[0.082, 0.016, 16, 32]} />
            </mesh>
          </group>

          {/* Left Jacket Body Panel */}
          <mesh position={[-0.14, 1.64, 0.02]} rotation={[0, 0.12, 0]} material={heroMat}>
            <cylinderGeometry args={[0.16, 0.15, 0.72, 28, 1, false, Math.PI * 0.45, Math.PI * 0.95]} />
          </mesh>
          {/* Right Jacket Body Panel */}
          <mesh position={[0.14, 1.64, 0.02]} rotation={[0, -0.12, 0]} material={heroMat}>
            <cylinderGeometry args={[0.16, 0.15, 0.72, 28, 1, false, -Math.PI * 0.4, Math.PI * 0.95]} />
          </mesh>
          {/* Back Jacket Panel */}
          <mesh position={[0, 1.64, -0.04]} material={heroMat}>
            <cylinderGeometry args={[0.26, 0.23, 0.72, 32, 1, false, Math.PI * 0.8, Math.PI * 1.4]} />
          </mesh>

          {/* Structured Spread Collar (Left & Right) */}
          <mesh position={[-0.10, 1.94, 0.09]} rotation={[0.4, 0.3, -0.3]} material={heroMat}>
            <boxGeometry args={[0.11, 0.08, 0.014]} />
          </mesh>
          <mesh position={[0.10, 1.94, 0.09]} rotation={[0.4, -0.3, 0.3]} material={heroMat}>
            <boxGeometry args={[0.11, 0.08, 0.014]} />
          </mesh>

          {/* Left Chest Patch Pocket */}
          <mesh position={[-0.14, 1.68, 0.16]} rotation={[0, 0.12, 0]} material={heroMat}>
            <boxGeometry args={[0.11, 0.14, 0.012]} />
          </mesh>
          {/* Right Chest Patch Pocket */}
          <mesh position={[0.14, 1.68, 0.16]} rotation={[0, -0.12, 0]} material={heroMat}>
            <boxGeometry args={[0.11, 0.14, 0.012]} />
          </mesh>

          {/* Left Structured Sleeve */}
          <mesh position={[-0.34, 1.58, 0]} rotation={[0, 0, 0.14]} material={heroMat}>
            <cylinderGeometry args={[0.095, 0.076, 0.58, 24]} />
          </mesh>
          <mesh position={[-0.38, 1.28, 0]} rotation={[0, 0, 0.14]} material={heroMat}>
            <cylinderGeometry args={[0.076, 0.076, 0.05, 24]} />
          </mesh>

          {/* Right Structured Sleeve */}
          <mesh position={[0.34, 1.58, 0]} rotation={[0, 0, -0.14]} material={heroMat}>
            <cylinderGeometry args={[0.095, 0.076, 0.58, 24]} />
          </mesh>
          <mesh position={[0.38, 1.28, 0]} rotation={[0, 0, -0.14]} material={heroMat}>
            <cylinderGeometry args={[0.076, 0.076, 0.05, 24]} />
          </mesh>

          {/* Bottom Jacket Straight Hem */}
          <mesh position={[0, 1.28, 0]} material={heroMat}>
            <cylinderGeometry args={[0.26, 0.26, 0.03, 32, 1, true]} />
          </mesh>
        </group>
      )}

      {/* 4. STREETWEAR BOXY HOODIE */}
      {activeGarment === 'hoodie' && (
        <group>
          {/* Voluminous Boxy Torso */}
          <group position={[0, 1.62, 0]}>
            <mesh material={heroMat}>
              <cylinderGeometry args={[0.25, 0.235, 0.74, 32]} />
            </mesh>

            {/* Thick Ribbed Waistband */}
            <mesh position={[0, -0.36, 0]} material={heroMat}>
              <cylinderGeometry args={[0.235, 0.235, 0.08, 32]} />
            </mesh>

            {/* Kangaroo Front Pouch Pocket */}
            <mesh position={[0, -0.14, 0.23]} material={heroMat}>
              <boxGeometry args={[0.22, 0.16, 0.04]} />
            </mesh>

            {/* Twin Drawstrings */}
            <mesh position={[-0.04, 0.20, 0.22]} material={innerMat}>
              <cylinderGeometry args={[0.004, 0.004, 0.20, 12]} />
            </mesh>
            <mesh position={[0.04, 0.20, 0.22]} material={innerMat}>
              <cylinderGeometry args={[0.004, 0.004, 0.20, 12]} />
            </mesh>
            {/* Drawstring Metal Aglets */}
            <mesh position={[-0.04, 0.09, 0.22]} material={goldMetalMat}>
              <cylinderGeometry args={[0.005, 0.005, 0.02, 12]} />
            </mesh>
            <mesh position={[0.04, 0.09, 0.22]} material={goldMetalMat}>
              <cylinderGeometry args={[0.005, 0.005, 0.02, 12]} />
            </mesh>
          </group>

          {/* 3D Hood Drape around Neck & Upper Back */}
          <group position={[0, 2.02, -0.06]}>
            <mesh material={heroMat}>
              <sphereGeometry args={[0.16, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.75]} />
            </mesh>
            {/* Hood Opening Rim */}
            <mesh position={[0, -0.02, 0.12]} rotation={[Math.PI / 4, 0, 0]} material={heroMat}>
              <torusGeometry args={[0.13, 0.025, 16, 32]} />
            </mesh>
          </group>

          {/* Left Drop-Shoulder Hoodie Sleeve */}
          <group position={[-0.34, 1.58, 0]} rotation={[0, 0, 0.16]}>
            <mesh material={heroMat}>
              <cylinderGeometry args={[0.105, 0.085, 0.58, 24]} />
            </mesh>
            {/* Ribbed Knit Cuff */}
            <mesh position={[0, -0.30, 0]} material={heroMat}>
              <cylinderGeometry args={[0.085, 0.085, 0.07, 24]} />
            </mesh>
          </group>

          {/* Right Drop-Shoulder Hoodie Sleeve */}
          <group position={[0.34, 1.58, 0]} rotation={[0, 0, -0.16]}>
            <mesh material={heroMat}>
              <cylinderGeometry args={[0.105, 0.085, 0.58, 24]} />
            </mesh>
            {/* Ribbed Knit Cuff */}
            <mesh position={[0, -0.30, 0]} material={heroMat}>
              <cylinderGeometry args={[0.085, 0.085, 0.07, 24]} />
            </mesh>
          </group>
        </group>
      )}

      {/* 5. TOP WHEN PANTS IS HERO (Clean Ecru Studio Top) */}
      {activeGarment === 'pants' && (
        <group>
          {/* Neutral Clean Top to highlight Hero Pants */}
          <group position={[0, 1.62, 0]}>
            <mesh material={innerMat}>
              <cylinderGeometry args={[0.22, 0.20, 0.72, 32]} />
            </mesh>
            <mesh position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]} material={innerMat}>
              <torusGeometry args={[0.082, 0.016, 16, 32]} />
            </mesh>
          </group>
          <mesh position={[-0.32, 1.62, 0]} rotation={[0, 0, 0.25]} material={innerMat}>
            <cylinderGeometry args={[0.085, 0.075, 0.32, 24]} />
          </mesh>
          <mesh position={[0.32, 1.62, 0]} rotation={[0, 0, -0.25]} material={innerMat}>
            <cylinderGeometry args={[0.085, 0.075, 0.32, 24]} />
          </mesh>
        </group>
      )}

      {/* 6. ATELIER MODERN MIDI DRESS */}
      {activeGarment === 'dress' && (
        <group>
          {/* Contoured Upper Bodice */}
          <group position={[0, 1.64, 0]}>
            <mesh material={heroMat}>
              <cylinderGeometry args={[0.22, 0.18, 0.68, 32]} />
            </mesh>
            {/* Boat / Scoop Neckline */}
            <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} material={heroMat}>
              <torusGeometry args={[0.088, 0.016, 16, 32]} />
            </mesh>
            {/* Waist Accent Seam */}
            <mesh position={[0, -0.33, 0]} material={heroMat}>
              <cylinderGeometry args={[0.185, 0.185, 0.02, 32]} />
            </mesh>
          </group>

          {/* Sleeveless Shoulder Caps */}
          <mesh position={[-0.23, 1.90, 0]} rotation={[0, 0, 0.4]} material={heroMat}>
            <cylinderGeometry args={[0.07, 0.07, 0.08, 20]} />
          </mesh>
          <mesh position={[0.23, 1.90, 0]} rotation={[0, 0, -0.4]} material={heroMat}>
            <cylinderGeometry args={[0.07, 0.07, 0.08, 20]} />
          </mesh>

          {/* Flowing A-Line Pleated Midi Skirt Drape (covering legs down to calf) */}
          <group position={[0, 0.85, 0]}>
            <mesh material={heroMat}>
              <cylinderGeometry args={[0.185, 0.38, 0.94, 36, 1, true]} />
            </mesh>
            {/* Flared Hem Roll */}
            <mesh position={[0, -0.46, 0]} material={heroMat}>
              <cylinderGeometry args={[0.385, 0.385, 0.025, 36]} />
            </mesh>
          </group>
        </group>
      )}

      {/* ─── D. RELAXED UTILITY WORK TROUSERS / CARGO (NOT SHOWN FOR DRESS) ─── */}
      {activeGarment !== 'dress' && (
        <group>
          {/* Clean Waistband with Belt Loops & Rivet */}
          <group position={[0, 1.27, 0]}>
            <mesh material={trouserMat}>
              <cylinderGeometry args={[0.225, 0.235, 0.12, 32]} />
            </mesh>
            {/* Waist Button Rivet */}
            <mesh position={[0, 0.03, 0.23]} material={goldMetalMat}>
              <cylinderGeometry args={[0.008, 0.008, 0.008, 16]} />
            </mesh>
          </group>

          {/* Left Trouser Leg (Straight cut with natural drape) */}
          <group>
            <mesh position={[-0.12, 0.64, 0]} material={trouserMat}>
              <cylinderGeometry args={[0.112, 0.094, 1.15, 28]} />
            </mesh>
            {/* Left Knee Horizontal Panel Seam */}
            <mesh position={[-0.12, 0.68, 0.01]} material={trouserMat}>
              <boxGeometry args={[0.19, 0.015, 0.19]} />
            </mesh>
            {/* Left Ankle Drape Break */}
            <mesh position={[-0.12, 0.10, 0]} material={trouserMat}>
              <cylinderGeometry args={[0.095, 0.095, 0.06, 28]} />
            </mesh>
          </group>

          {/* Right Trouser Leg */}
          <group>
            <mesh position={[0.12, 0.64, 0]} material={trouserMat}>
              <cylinderGeometry args={[0.112, 0.094, 1.15, 28]} />
            </mesh>
            {/* Right Knee Horizontal Panel Seam */}
            <mesh position={[0.12, 0.68, 0.01]} material={trouserMat}>
              <boxGeometry args={[0.19, 0.015, 0.19]} />
            </mesh>
            {/* Right Side Cargo Pocket on Thigh */}
            <mesh position={[0.22, 0.72, 0.02]} material={trouserMat}>
              <boxGeometry args={[0.035, 0.16, 0.13]} />
            </mesh>
            <mesh position={[0.22, 0.81, 0.02]} material={trouserMat}>
              <boxGeometry args={[0.038, 0.025, 0.135]} />
            </mesh>
            {/* Right Ankle Drape Break */}
            <mesh position={[0.12, 0.10, 0]} material={trouserMat}>
              <cylinderGeometry args={[0.095, 0.095, 0.06, 28]} />
            </mesh>
          </group>
        </group>
      )}

      {/* ─── E. TWO-TONE DESIGNER RETRO RUNNER SNEAKERS ─── */}
      {/* Left Sneaker */}
      <group position={[-0.12, 0.05, 0.04]}>
        {/* White Chunky Midsole */}
        <mesh position={[0, -0.01, 0]} material={sneakerWhiteMat}>
          <boxGeometry args={[0.11, 0.04, 0.25]} />
        </mesh>
        {/* Dark Gum Tread Outsole */}
        <mesh position={[0, -0.035, 0]} material={sneakerGumSoleMat}>
          <boxGeometry args={[0.115, 0.016, 0.26]} />
        </mesh>
        {/* Suede Brown Mudguard / Toe Panel */}
        <mesh position={[0, 0.015, 0.06]} material={sneakerSuedeMat}>
          <boxGeometry args={[0.10, 0.05, 0.12]} />
        </mesh>
        {/* White Leather Heel Collar & Eyestay */}
        <mesh position={[0, 0.03, -0.04]} material={sneakerWhiteMat}>
          <boxGeometry args={[0.09, 0.06, 0.13]} />
        </mesh>
        {/* White Laces Bar */}
        <mesh position={[0, 0.048, 0.02]} material={sneakerWhiteMat}>
          <boxGeometry args={[0.045, 0.012, 0.08]} />
        </mesh>
      </group>

      {/* Right Sneaker */}
      <group position={[0.12, 0.05, 0.04]}>
        {/* White Chunky Midsole */}
        <mesh position={[0, -0.01, 0]} material={sneakerWhiteMat}>
          <boxGeometry args={[0.11, 0.04, 0.25]} />
        </mesh>
        {/* Dark Gum Tread Outsole */}
        <mesh position={[0, -0.035, 0]} material={sneakerGumSoleMat}>
          <boxGeometry args={[0.115, 0.016, 0.26]} />
        </mesh>
        {/* Suede Brown Mudguard / Toe Panel */}
        <mesh position={[0, 0.015, 0.06]} material={sneakerSuedeMat}>
          <boxGeometry args={[0.10, 0.05, 0.12]} />
        </mesh>
        {/* White Leather Heel Collar */}
        <mesh position={[0, 0.03, -0.04]} material={sneakerWhiteMat}>
          <boxGeometry args={[0.09, 0.06, 0.13]} />
        </mesh>
        {/* White Laces Bar */}
        <mesh position={[0, 0.048, 0.02]} material={sneakerWhiteMat}>
          <boxGeometry args={[0.045, 0.012, 0.08]} />
        </mesh>
      </group>

      {/* ─── F. ACCESSORIES DISPLAY PEDESTAL (RIGHT SIDE - EXACT PHOTO) ─── */}
      {showAccessories && (
        <group position={[0.88, 0, 0]}>
          {/* Main Concrete Plinth Base */}
          <mesh position={[0, 0.22, 0]} material={concreteMat}>
            <boxGeometry args={[0.48, 0.44, 0.46]} />
          </mesh>

          {/* Crossbody Messenger / Camera Bag Resting on Pedestal */}
          <group position={[0, 0.54, 0.02]}>
            <mesh material={leatherAccessoryMat}>
              <boxGeometry args={[0.34, 0.22, 0.16]} />
            </mesh>
            {/* Bag Front Flap Pocket */}
            <mesh position={[0, -0.02, 0.085]} material={leatherAccessoryMat}>
              <boxGeometry args={[0.26, 0.14, 0.02]} />
            </mesh>
            {/* Shoulder Strap Loop */}
            <mesh position={[-0.18, 0.02, 0]} material={leatherAccessoryMat}>
              <boxGeometry args={[0.02, 0.18, 0.04]} />
            </mesh>
            <mesh position={[0.18, 0.02, 0]} material={leatherAccessoryMat}>
              <boxGeometry args={[0.02, 0.18, 0.04]} />
            </mesh>
          </group>

          {/* Miniature Watch Cube Display Riser */}
          <mesh position={[0, 0.82, 0]} material={concreteMat}>
            <boxGeometry args={[0.20, 0.22, 0.20]} />
          </mesh>

          {/* Minimalist Field Watch */}
          <group position={[0, 0.98, 0]}>
            {/* Watch Case */}
            <mesh material={mannequinFormMat}>
              <cylinderGeometry args={[0.045, 0.045, 0.018, 24]} />
            </mesh>
            {/* Watch Dial */}
            <mesh position={[0, 0.01, 0]} material={neckCapTopMat}>
              <cylinderGeometry args={[0.040, 0.040, 0.005, 24]} />
            </mesh>
            {/* Brown Leather Strap */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={leatherAccessoryMat}>
              <boxGeometry args={[0.012, 0.032, 0.14]} />
            </mesh>
          </group>

          {/* Hat Stand Thin Rod */}
          <mesh position={[0, 1.25, 0]} material={mannequinFormMat}>
            <cylinderGeometry args={[0.010, 0.010, 0.36, 16]} />
          </mesh>

          {/* Camel Brown Baseball Cap on Stand */}
          <group position={[0, 1.50, 0]}>
            {/* Cap Crown Dome */}
            <mesh material={leatherAccessoryMat}>
              <sphereGeometry args={[0.12, 24, 24, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
            </mesh>
            {/* Cap Visor / Brim */}
            <mesh position={[0, -0.06, 0.09]} rotation={[0.25, 0, 0]} material={leatherAccessoryMat}>
              <boxGeometry args={[0.18, 0.015, 0.14]} />
            </mesh>
            {/* Top Button */}
            <mesh position={[0, 0.12, 0]} material={leatherAccessoryMat}>
              <sphereGeometry args={[0.015, 12, 12]} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}

// ─── Main Virtual Mannequin Studio Component ────────────────────────────────
export default function VirtualMannequinStudio({
  initialGarment = 'jacket',
  garment,
  initialColor = '#243746',
  color,
  initialSize = 'M',
  size: propSize,
  productName = 'Editorial Atelier Runway Look',
  product,
  onColorChange,
  onGarmentChange
}) {
  // Active Garment Category: tshirt, shirt, jacket, hoodie, pants, dress
  const [activeGarment, setActiveGarment] = useState(garment || initialGarment);

  // Garment Colors
  const [heroColor, setHeroColor] = useState(color || initialColor);
  const [trousersColor, setTrousersColor] = useState('#36393E');
  const [innerColor, setInnerColor] = useState('#EAE6DF');
  const [fabric, setFabric] = useState('cotton');
  const [size, setSize] = useState(propSize || initialSize);

  // Sync state whenever props change from external clicks (e.g. clicking products in catalog)
  useEffect(() => {
    if (garment || initialGarment) {
      setActiveGarment(garment || initialGarment);
    }
  }, [garment, initialGarment]);

  useEffect(() => {
    const nextColor = color || initialColor;
    if (nextColor) {
      setHeroColor(nextColor);
    }
  }, [color, initialColor]);

  useEffect(() => {
    if (propSize || initialSize) {
      setSize(propSize || initialSize);
    }
  }, [propSize, initialSize]);

  // Viewport & Lighting State
  const [wireframe, setWireframe] = useState(false);
  const [isHeatmap, setIsHeatmap] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showAccessories, setShowAccessories] = useState(true);
  const controlsRef = useRef();

  const handleCameraPreset = (view) => {
    if (!controlsRef.current) return;
    if (view === 'full') {
      controlsRef.current.object.position.set(0.15, 0.3, 3.8);
      controlsRef.current.target.set(0.15, 0.1, 0);
    } else if (view === 'top') {
      controlsRef.current.object.position.set(0, 0.7, 2.1);
      controlsRef.current.target.set(0, 0.65, 0);
    } else if (view === 'trousers') {
      controlsRef.current.object.position.set(0, -0.3, 2.3);
      controlsRef.current.target.set(0, -0.35, 0);
    } else if (view === 'accessories') {
      controlsRef.current.object.position.set(0.9, 0.4, 2.0);
      controlsRef.current.target.set(0.85, 0.4, 0);
    } else if (view === 'side') {
      controlsRef.current.object.position.set(3.0, 0.3, 1.8);
      controlsRef.current.target.set(0, 0.1, 0);
    }
    controlsRef.current.update();
  };

  const handleSetHeroColor = (hex) => {
    setHeroColor(hex);
    if (onColorChange) onColorChange(hex);
  };

  const handleSetGarment = (g) => {
    setActiveGarment(g);
    if (onGarmentChange) onGarmentChange(g);
  };

  // Floating Color Swatches matching reference photograph
  const photoPalette = [
    { name: 'Slate Navy', hex: '#243746' },
    { name: 'Ecru Cream', hex: '#EAE6DF' },
    { name: 'Saddle Camel', hex: '#8B6239' },
    { name: 'Charcoal Slate', hex: '#36393E' },
    { name: 'Obsidian Black', hex: '#1A1A1A' },
    { name: 'Forest Olive', hex: '#3E493B' },
    { name: 'Crimson Red', hex: '#991B1B' },
    { name: 'Cobalt Blue', hex: '#1D4ED8' }
  ];

  // Garment Label Formatter
  const getGarmentTitle = () => {
    switch (activeGarment) {
      case 'tshirt': return 'Atelier Crewneck T-Shirt';
      case 'shirt': return 'Tailored Oxford Shirt';
      case 'hoodie': return 'Boxy Streetwear Hoodie';
      case 'jacket': return 'Layered Chore Overshirt';
      case 'pants': return 'Relaxed Utility Cargo Pant';
      case 'dress': return 'Modern Atelier Midi Dress';
      default: return 'Atelier Garment';
    }
  };

  return (
    <div className="relative flex flex-col h-[680px] sm:h-[750px] w-full overflow-hidden rounded-[28px] bg-gradient-to-b from-[#AFA9A0] via-[#9E978D] to-[#8D867C] border border-[#7A7369] shadow-xl select-none">
      {/* ─── 3D WebGL Canvas ─── */}
      <div className="h-full w-full">
        <Canvas
          camera={{ position: [0.15, 0.3, 3.8], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          {/* Atelier Loft Lighting matching reference photograph */}
          <ambientLight intensity={1.15} />
          {/* Soft Directional Key Light */}
          <directionalLight position={[4, 5, 4]} intensity={1.85} color="#FFFBF5" castShadow />
          {/* Subtle Cool Fill Light */}
          <directionalLight position={[-4, 3, -1]} intensity={0.85} color="#D1D5DB" />
          {/* Warm Rim Light */}
          <directionalLight position={[0, 4, -4]} intensity={0.95} color="#FFFFFF" />
          {/* Overhead Spotlight */}
          <spotLight position={[0, 7, 2]} intensity={1.5} angle={0.48} penumbra={0.7} />

          {/* Model Rendering: Real Editorial Ghost Look */}
          <EditorialGhostMannequin
            activeGarment={activeGarment}
            heroColor={heroColor}
            innerColor={innerColor}
            trousersColor={trousersColor}
            fabric={fabric}
            isHeatmap={isHeatmap}
            wireframe={wireframe}
            showAccessories={showAccessories}
          />

          {/* Soft Ground Contact Shadow */}
          <ContactShadows position={[0, -0.94, 0]} opacity={0.55} scale={6.0} blur={2.0} far={3.0} color="#1A1815" />

          {/* Orbit Controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            minDistance={1.3}
            maxDistance={5.6}
            maxPolarAngle={Math.PI / 2 + 0.05}
            autoRotate={autoRotate}
            autoRotateSpeed={1.4}
          />
        </Canvas>
      </div>

      {/* ─── Top Right Palette & Diagnostics Dock ─── */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Floating Reference Swatch Dots */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-md">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/80 hidden sm:inline">
            Dye:
          </span>
          {photoPalette.map((c) => (
            <button
              key={c.name}
              onClick={() => handleSetHeroColor(c.hex)}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                heroColor.toLowerCase() === c.hex.toLowerCase() ? 'border-white scale-125 shadow-lg' : 'border-white/40 hover:scale-110'
              }`}
              style={{ backgroundColor: c.hex }}
              title={`Dye: ${c.name}`}
            />
          ))}
          {/* Custom Color Input */}
          <label className="relative cursor-pointer" title="Custom Garment Dye">
            <input
              type="color"
              value={heroColor.startsWith('#') ? heroColor : '#243746'}
              onChange={(e) => handleSetHeroColor(e.target.value)}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
            <div
              className="w-5 h-5 rounded-full border-2 border-dashed border-white/80 flex items-center justify-center hover:scale-110 transition"
              style={{ backgroundColor: heroColor }}
            >
              <span className="text-[8px] text-white font-extrabold">+</span>
            </div>
          </label>
        </div>

        {/* View Mode Switcher (Photoreal / Tension Heatmap / Wireframe) */}
        <div className="hidden sm:flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-full border border-gray-200 shadow-sm">
          <button
            onClick={() => { setIsHeatmap(false); setWireframe(false); }}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition ${
              !isHeatmap && !wireframe ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
            }`}
          >
            Realistic
          </button>
          <button
            onClick={() => { setIsHeatmap(true); setWireframe(false); }}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition flex items-center gap-1 ${
              isHeatmap ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:text-black'
            }`}
          >
            <FiActivity className="text-xs" /> Fit Heatmap
          </button>
          <button
            onClick={() => { setWireframe(!wireframe); setIsHeatmap(false); }}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition ${
              wireframe ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-black'
            }`}
          >
            Wireframe
          </button>
        </div>
      </div>

      {/* ─── Top Left Telemetry Pill ─── */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-[#EAEAEC] px-4 py-2.5 rounded-2xl shadow-md space-y-1 max-w-[280px] sm:max-w-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <h2 className="text-xs font-black text-[#111111] uppercase tracking-wider truncate">
            {productName}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
          <span>Wearing: <strong className="text-black">{getGarmentTitle()}</strong></span>
          <span>•</span>
          <span>Weave: <strong className="text-black capitalize">{fabric}</strong></span>
          <span>•</span>
          <span>Size: <strong className="text-[#FF3F6C] font-mono">{size}</strong></span>
        </div>
      </div>

      {/* ─── Top Center Quick Camera Angles ─── */}
      <div className="absolute top-20 left-4 z-10 hidden sm:flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-gray-200 shadow-sm">
        <button
          onClick={() => handleCameraPreset('full')}
          className="px-2.5 py-1 text-[10px] font-bold text-gray-700 hover:text-black rounded-lg transition"
        >
          Full Look
        </button>
        <button
          onClick={() => handleCameraPreset('top')}
          className="px-2.5 py-1 text-[10px] font-bold text-gray-700 hover:text-black rounded-lg transition"
        >
          Upper Top
        </button>
        <button
          onClick={() => handleCameraPreset('trousers')}
          className="px-2.5 py-1 text-[10px] font-bold text-gray-700 hover:text-black rounded-lg transition"
        >
          Trousers
        </button>
        <button
          onClick={() => handleCameraPreset('accessories')}
          className="px-2.5 py-1 text-[10px] font-bold text-gray-700 hover:text-black rounded-lg transition"
        >
          Accessories
        </button>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-2 py-1 text-[10px] font-bold rounded-lg transition flex items-center gap-1 ${
            autoRotate ? 'bg-black text-white' : 'text-gray-700 hover:text-black'
          }`}
        >
          <FiRotateCw className={`text-xs ${autoRotate ? 'animate-spin' : ''}`} /> 360°
        </button>
      </div>

      {/* ─── Bottom Interactive Styling Dock ─── */}
      <div className="absolute bottom-4 inset-x-4 z-10 rounded-[22px] bg-white/95 backdrop-blur-md border border-[#EAEAEC] p-3.5 shadow-lg space-y-2.5">
        {/* Quick Garment Switcher Row */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs border-b border-gray-100">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 shrink-0">
            Active Garment:
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {[
              { id: 'tshirt', label: 'T-Shirt' },
              { id: 'shirt', label: 'Shirt' },
              { id: 'jacket', label: 'Jacket' },
              { id: 'hoodie', label: 'Hoodie' },
              { id: 'pants', label: 'Cargo Pant' },
              { id: 'dress', label: 'Dress' },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => handleSetGarment(g.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                  activeGarment === g.id
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customization Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
          {/* 1. Hero Garment Color */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700">
                Garment Dye
              </label>
              <span className="text-[10px] font-mono text-gray-500 uppercase">{heroColor}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { name: 'Navy', hex: '#243746' },
                { name: 'Ecru', hex: '#EAE6DF' },
                { name: 'Camel', hex: '#8B6239' },
                { name: 'Charcoal', hex: '#36393E' },
                { name: 'Olive', hex: '#3E493B' },
                { name: 'Red', hex: '#991B1B' },
              ].map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleSetHeroColor(c.hex)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    heroColor.toLowerCase() === c.hex.toLowerCase() ? 'border-black scale-125 shadow-md' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* 2. Trouser Color (or Inner Tee for jackets) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">
              {activeGarment === 'jacket' ? 'Inner Tee Dye' : 'Trousers Dye'}
            </label>
            <div className="flex items-center gap-1.5">
              {(activeGarment === 'jacket'
                ? [
                    { name: 'Ecru', hex: '#EAE6DF' },
                    { name: 'White', hex: '#FFFFFF' },
                    { name: 'Black', hex: '#1E1E20' },
                    { name: 'Grey', hex: '#9CA3AF' },
                  ]
                : [
                    { name: 'Charcoal', hex: '#36393E' },
                    { name: 'Khaki', hex: '#C2B8A3' },
                    { name: 'Black', hex: '#1E1E20' },
                    { name: 'Navy', hex: '#1E2C38' },
                  ]
              ).map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    if (activeGarment === 'jacket') setInnerColor(c.hex);
                    else setTrousersColor(c.hex);
                  }}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    (activeGarment === 'jacket' ? innerColor : trousersColor) === c.hex
                      ? 'border-black scale-125 shadow-md'
                      : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* 3. Fabric Material & Weave */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">
              Fabric Weave
            </label>
            <div className="flex gap-1">
              {[
                { id: 'cotton', label: 'Cotton' },
                { id: 'denim', label: 'Denim' },
                { id: 'wool', label: 'Wool' },
                { id: 'leather', label: 'Leather' },
                { id: 'silk', label: 'Silk' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFabric(f.id)}
                  className={`flex-1 py-1 rounded-lg text-[9px] font-bold uppercase transition ${
                    fabric === f.id
                      ? 'bg-[#111111] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Accessories Podium Toggle & Size */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700">
                Pedestal Staging
              </label>
              <button
                onClick={() => setShowAccessories(!showAccessories)}
                className={`text-[9px] font-bold px-2 py-0.5 rounded transition ${
                  showAccessories ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {showAccessories ? 'Props: ON' : 'Props: OFF'}
              </button>
            </div>
            <div className="flex gap-1">
              {['S', 'M', 'L', 'XL'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition ${
                    size === s
                      ? 'bg-[#FF3F6C] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
