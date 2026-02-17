'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useProgress, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, RotateCcw, Eye, Scan, Maximize2, Minimize2,
  AlertTriangle, Wrench, Zap, Activity, ChevronRight,
  Cog, Cpu, Gauge, ThermometerSun
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Diagnostic Hotspot Data ──────────────────────────────────────────────────
// Each hotspot maps a known fault/component to a 3D position on the car model
interface DiagnosticHotspot {
  id: string;
  label: string;
  system: string;
  position: [number, number, number]; // 3D world coordinates on the car
  severity: 'critical' | 'warning' | 'info' | 'ok';
  dtcCode?: string;
  description: string;
  causes: string[];
  symptoms: string[];
  action: string;
  icon: 'engine' | 'wheel' | 'exhaust' | 'transmission' | 'sensor' | 'electrical';
  revealAt: number; // scan % at which this hotspot appears
}

const DIAGNOSTIC_HOTSPOTS: DiagnosticHotspot[] = [
  {
    id: 'intake-manifold',
    label: 'Intake Manifold',
    system: 'FUEL SYSTEM',
    position: [0.25, -0.35, 1.3],
    severity: 'critical',
    dtcCode: 'P0171',
    description: 'System Too Lean — Unmetered air entering after MAF sensor',
    causes: [
      'Intake manifold gasket leak',
      'Cracked vacuum hose',
      'PCV valve stuck open',
      'Throttle body gasket degraded',
    ],
    symptoms: ['Rough idle', 'Hesitation on acceleration', 'High fuel trim +15.2%'],
    action: 'Perform smoke test on intake — inspect manifold gasket seal area',
    icon: 'engine',
    revealAt: 25,
  },
  {
    id: 'ignition-coils',
    label: 'Ignition System',
    system: 'POWERTRAIN',
    position: [-0.15, -0.25, 1.05],
    severity: 'warning',
    dtcCode: 'P0300',
    description: 'Random/Multiple Cylinder Misfire — firing irregularity across cylinders',
    causes: [
      'Worn spark plugs (>40k km)',
      'Failing ignition coil pack',
      'Vacuum leak (see P0171)',
      'Low compression cylinder',
    ],
    symptoms: ['Engine vibration', 'Loss of power', 'Rough unstable idle', 'Increased emissions'],
    action: 'Inspect spark plugs & coils — likely secondary to P0171 vacuum leak',
    icon: 'engine',
    revealAt: 35,
  },
  {
    id: 'lf-wheel-sensor',
    label: 'LF Wheel Speed Sensor',
    system: 'ABS / CHASSIS',
    position: [0.72, -1.15, 1.1],
    severity: 'critical',
    dtcCode: 'C0035',
    description: 'Left Front Wheel Speed Sensor Circuit — abnormal signal detected',
    causes: [
      'Damaged wheel speed sensor',
      'Corroded wiring connector',
      'Cracked tone ring',
      'Excessive sensor-to-ring air gap',
    ],
    symptoms: ['ABS light ON', 'Traction control disabled', 'Speedometer fluctuation'],
    action: 'Inspect sensor air gap (0.5–1.5mm) — check wiring & tone ring for damage',
    icon: 'wheel',
    revealAt: 20,
  },
  {
    id: 'catalytic-converter',
    label: 'Catalytic Converter',
    system: 'EXHAUST / EMISSIONS',
    position: [0, -1.35, 0.15],
    severity: 'warning',
    dtcCode: 'P0420',
    description: 'Catalyst System Efficiency Below Threshold — degraded conversion rate',
    causes: [
      'Catalyst substrate breakdown',
      'Engine running rich/lean (root cause P0171)',
      'Oil contamination from worn piston rings',
      'Coolant leak into combustion chamber',
    ],
    symptoms: ['Sulfur/rotten egg smell', 'Reduced fuel economy', 'Pending DTC — not yet confirmed'],
    action: 'Resolve P0171 first — retest catalyst after 200 drive-cycle km',
    icon: 'exhaust',
    revealAt: 55,
  },
  {
    id: 'maf-sensor',
    label: 'MAF Sensor',
    system: 'ENGINE MANAGEMENT',
    position: [0.4, -0.38, 1.65],
    severity: 'info',
    description: 'Mass Air Flow sensor reading 2.85 g/s — within range but warrants cleaning',
    causes: ['Contamination from oil mist', 'Air filter bypass leak'],
    symptoms: ['Slightly elevated fuel trim', 'Contributes to P0171 lean condition'],
    action: 'Clean with MAF-specific cleaner — do NOT touch sensing element directly',
    icon: 'sensor',
    revealAt: 30,
  },
  {
    id: 'transmission',
    label: '4-Speed AT (Punch)',
    system: 'TRANSMISSION',
    position: [0, -0.9, 0.55],
    severity: 'ok',
    description: 'Punch Powertrain 4AT — adaptive values within normal range',
    causes: [],
    symptoms: [],
    action: 'No action required — monitor shift quality during road test',
    icon: 'transmission',
    revealAt: 60,
  },
  {
    id: 'battery-alternator',
    label: 'Charging System',
    system: 'ELECTRICAL',
    position: [-0.5, -0.42, 1.2],
    severity: 'ok',
    description: 'Battery voltage 12.4V — alternator output nominal at idle',
    causes: [],
    symptoms: [],
    action: 'System nominal — no action required',
    icon: 'electrical',
    revealAt: 75,
  },
  {
    id: 'coolant-system',
    label: 'Coolant System',
    system: 'TEMPERATURE',
    position: [0.08, -0.48, 1.75],
    severity: 'info',
    description: 'Coolant temp 92°C — within normal range but monitor for P0171 interaction',
    causes: [],
    symptoms: [],
    action: 'Check coolant level — verify no head gasket weep contributing to lean condition',
    icon: 'sensor',
    revealAt: 45,
  },
];

const SEVERITY_CONFIG = {
  critical: { color: '#ff3344', pulseColor: 'rgba(255,51,68,0.4)', label: 'FAULT', ring: 'ring-red-500/50' },
  warning: { color: '#ffaa00', pulseColor: 'rgba(255,170,0,0.4)', label: 'WARNING', ring: 'ring-amber-500/50' },
  info: { color: '#00aaff', pulseColor: 'rgba(0,170,255,0.3)', label: 'MONITOR', ring: 'ring-blue-500/50' },
  ok: { color: '#00ff88', pulseColor: 'rgba(0,255,136,0.3)', label: 'OK', ring: 'ring-emerald-500/50' },
};

const HOTSPOT_ICON_MAP = {
  engine: Cog,
  wheel: Activity,
  exhaust: ThermometerSun,
  transmission: Gauge,
  sensor: Cpu,
  electrical: Zap,
};

// ─── Pulsing 3D Hotspot Marker ───────────────────────────────────────────────
function HotspotMarker({
  hotspot,
  visible,
  isSelected,
  onClick,
}: {
  hotspot: DiagnosticHotspot;
  visible: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const sevConfig = SEVERITY_CONFIG[hotspot.severity];

  useFrame((state) => {
    if (!visible || !innerRef.current || !outerRef.current || !ringRef.current) return;
    const t = state.clock.elapsedTime;
    const pulse = hotspot.severity === 'critical' || hotspot.severity === 'warning';

    // Inner core — steady glow
    innerRef.current.scale.setScalar(isSelected ? 1.8 : 1);

    // Outer pulse ring
    if (pulse) {
      const s = 1 + Math.sin(t * 3) * 0.4;
      outerRef.current.scale.setScalar(s * (isSelected ? 2.2 : 1.6));
      (outerRef.current.material as THREE.MeshBasicMaterial).opacity = 0.25 - Math.sin(t * 3) * 0.15;
    } else {
      outerRef.current.scale.setScalar(isSelected ? 2 : 1.4);
      (outerRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15;
    }

    // Rotating ring
    ringRef.current.rotation.z = t * 2;
    ringRef.current.rotation.x = t * 0.8;
    ringRef.current.scale.setScalar(isSelected ? 2.5 : 1.8);
  });

  if (!visible) return null;

  return (
    <group position={hotspot.position}>
      {/* Inner core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color={sevConfig.color} transparent opacity={0.9} depthTest={false} />
      </mesh>

      {/* Outer pulse */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={sevConfig.color} transparent opacity={0.2} depthTest={false} />
      </mesh>

      {/* Spinning ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.14, 0.008, 8, 32]} />
        <meshBasicMaterial color={sevConfig.color} transparent opacity={0.5} depthTest={false} />
      </mesh>

      {/* Clickable invisible hitbox */}
      <mesh onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthTest={false} />
      </mesh>

      {/* Label billboard */}
      <Html
        center
        position={[0, 0.28, 0]}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        zIndexRange={[100, 0]}
        distanceFactor={6}
      >
        <div
          className={cn(
            'whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider backdrop-blur-sm border',
            hotspot.severity === 'critical' && 'bg-red-950/80 text-red-400 border-red-500/40',
            hotspot.severity === 'warning' && 'bg-amber-950/80 text-amber-400 border-amber-500/40',
            hotspot.severity === 'info' && 'bg-blue-950/80 text-blue-400 border-blue-500/40',
            hotspot.severity === 'ok' && 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
          )}
        >
          {hotspot.dtcCode ? `${hotspot.dtcCode} — ` : ''}{hotspot.label}
        </div>
      </Html>
    </group>
  );
}

// ─── Connection Lines from hotspots (data trails) ────────────────────────────
function DataTrails({
  hotspots,
  scanPercent,
}: {
  hotspots: DiagnosticHotspot[];
  scanPercent: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Build line objects imperatively to avoid JSX <line> → SVG conflict
  const lines = useMemo(() => {
    return hotspots.map((h) => {
      const points = [
        new THREE.Vector3(...h.position),
        new THREE.Vector3(h.position[0], -1.5, h.position[2]),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: SEVERITY_CONFIG[h.severity].color,
        transparent: true,
        opacity: 0.15,
        depthTest: false,
      });
      const line = new THREE.Line(geometry, material);
      line.visible = false;
      line.userData = { id: h.id, revealAt: h.revealAt };
      return line;
    });
  }, [hotspots]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Line) {
        const reveal = child.userData.revealAt as number;
        child.visible = scanPercent >= reveal;
        if (child.visible) {
          const mat = child.material as THREE.LineBasicMaterial;
          mat.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.08;
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      {lines.map((lineObj, i) => (
        <primitive key={hotspots[i].id} object={lineObj} />
      ))}
    </group>
  );
}

// ─── Scanning Beam ───────────────────────────────────────────────────────────
function ScanBeam({ active }: { active: boolean }) {
  const beamRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [beamY, setBeamY] = useState(3);

  useFrame((_, delta) => {
    if (!active || !beamRef.current || !glowRef.current) return;

    setBeamY((prev) => {
      const next = prev - delta * 1.2;
      return next < -2 ? 3 : next;
    });

    beamRef.current.position.y = beamY;
    glowRef.current.position.y = beamY;
  });

  if (!active) return null;

  return (
    <group>
      <mesh ref={beamRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
        <planeGeometry args={[8, 0.05]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.9} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, beamY + 0.15, 0]}>
        <planeGeometry args={[8, 0.3]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─── Grid Floor ──────────────────────────────────────────────────────────────
function GridFloor() {
  return (
    <group>
      <gridHelper args={[20, 40, '#00ff8844', '#00ff8818']} position={[0, -1.5, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.51, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// ─── Particle field ──────────────────────────────────────────────────────────
function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = Math.random() * 6 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#00ff88" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// ─── FBX Car Model ───────────────────────────────────────────────────────────
function CarModel({
  url,
  viewMode,
}: {
  url: string;
  viewMode: 'wireframe' | 'xray' | 'solid';
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loader = new FBXLoader();
    loader.load(
      url,
      (fbx) => {
        const box = new THREE.Box3().setFromObject(fbx);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4 / maxDim;

        fbx.scale.setScalar(scale);
        fbx.position.set(
          -center.x * scale,
          -center.y * scale + (size.y * scale) / 2 - 1.5,
          -center.z * scale
        );

        // Debug: log normalized model bounds for hotspot calibration
        const postBox = new THREE.Box3().setFromObject(fbx);
        const ps = postBox.getSize(new THREE.Vector3());
        console.log('[3D Scanner] Model bounds after normalize:', {
          size: `X=${ps.x.toFixed(2)} Y=${ps.y.toFixed(2)} Z=${ps.z.toFixed(2)}`,
          min: `${postBox.min.x.toFixed(2)}, ${postBox.min.y.toFixed(2)}, ${postBox.min.z.toFixed(2)}`,
          max: `${postBox.max.x.toFixed(2)}, ${postBox.max.y.toFixed(2)}, ${postBox.max.z.toFixed(2)}`,
        });

        setModel(fbx);
      },
      undefined,
      (err) => {
        console.error('FBX load error:', err);
        setLoadError('Failed to load 3D model');
      }
    );
  }, [url]);

  useEffect(() => {
    if (!model) return;
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (viewMode === 'wireframe') {
          child.material = new THREE.MeshBasicMaterial({ color: '#00ff88', wireframe: true, transparent: true, opacity: 0.7 });
        } else if (viewMode === 'xray') {
          child.material = new THREE.MeshPhongMaterial({ color: '#003322', emissive: '#00ff88', emissiveIntensity: 0.15, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
        } else {
          child.material = new THREE.MeshStandardMaterial({ color: '#1a1a2e', metalness: 0.8, roughness: 0.3, emissive: '#00ff88', emissiveIntensity: 0.05 });
        }
      }
    });
  }, [model, viewMode]);

  if (loadError) {
    return (
      <Html center>
        <div className="text-red-400 text-sm bg-black/60 px-4 py-2 rounded-lg">{loadError}</div>
      </Html>
    );
  }
  if (!model) return null;

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

// ─── Rotating container — keeps car + hotspots in sync ───────────────────────
function VehicleRotationGroup({
  children,
  speed = 0.15,
}: {
  children: React.ReactNode;
  speed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * speed;
  });

  return <group ref={groupRef}>{children}</group>;
}

// ─── Loader ──────────────────────────────────────────────────────────────────
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <div className="text-emerald-400 font-mono text-sm">{progress.toFixed(0)}% loaded</div>
      </div>
    </Html>
  );
}

// ─── Camera ──────────────────────────────────────────────────────────────────
function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(5, 3, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

// ─── Hotspot Detail Panel (HTML overlay) ─────────────────────────────────────
function HotspotDetailPanel({
  hotspot,
  onClose,
}: {
  hotspot: DiagnosticHotspot;
  onClose: () => void;
}) {
  const sev = SEVERITY_CONFIG[hotspot.severity];
  const Icon = HOTSPOT_ICON_MAP[hotspot.icon];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-24 right-4 z-30 w-80 max-h-[70vh] overflow-y-auto"
    >
      <div className="bg-gray-950/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Severity header bar */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: `2px solid ${sev.color}40` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${sev.color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color: sev.color }} />
            </div>
            <div>
              <div className="text-white font-bold text-sm">{hotspot.label}</div>
              <div className="text-white/40 text-[10px] font-mono tracking-wider">{hotspot.system}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hotspot.dtcCode && (
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                style={{ backgroundColor: `${sev.color}20`, color: sev.color }}
              >
                {hotspot.dtcCode}
              </span>
            )}
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Severity badge */}
        <div className="px-4 pt-3">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider"
            style={{ backgroundColor: `${sev.color}15`, color: sev.color, border: `1px solid ${sev.color}30` }}
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: sev.color }} />
            {sev.label}
          </div>
        </div>

        {/* Description */}
        <div className="px-4 py-3">
          <p className="text-white/70 text-xs leading-relaxed">{hotspot.description}</p>
        </div>

        {/* Causes */}
        {hotspot.causes.length > 0 && (
          <div className="px-4 pb-3">
            <div className="text-white/30 text-[10px] font-mono tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" />
              PROBABLE CAUSES
            </div>
            <div className="space-y-1">
              {hotspot.causes.map((cause, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-white/20 font-mono text-[10px] mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-white/60">{cause}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Symptoms */}
        {hotspot.symptoms.length > 0 && (
          <div className="px-4 pb-3">
            <div className="text-white/30 text-[10px] font-mono tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              SYMPTOMS
            </div>
            <div className="flex flex-wrap gap-1">
              {hotspot.symptoms.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-white/50 border border-white/5">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommended action */}
        <div className="px-4 pb-4">
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
            <div className="text-emerald-400/60 text-[10px] font-mono tracking-wider mb-1 flex items-center gap-1.5">
              <Wrench className="w-3 h-3" />
              RECOMMENDED ACTION
            </div>
            <p className="text-emerald-300/80 text-xs leading-relaxed">{hotspot.action}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Left-side Hotspot List ──────────────────────────────────────────────────
function HotspotListPanel({
  hotspots,
  scanPercent,
  selectedId,
  onSelect,
}: {
  hotspots: DiagnosticHotspot[];
  scanPercent: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const visible = hotspots.filter(h => scanPercent >= h.revealAt);
  const faults = visible.filter(h => h.severity === 'critical' || h.severity === 'warning');
  const monitors = visible.filter(h => h.severity === 'info');
  const ok = visible.filter(h => h.severity === 'ok');

  if (visible.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-24 left-4 z-30 w-56"
    >
      <div className="bg-gray-950/90 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-3 py-2.5 border-b border-white/5">
          <div className="text-white/40 text-[10px] font-mono tracking-wider">DETECTED ISSUES</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-red-400 text-xs font-bold">{faults.length} faults</span>
            <span className="text-white/20">·</span>
            <span className="text-blue-400 text-xs">{monitors.length} monitor</span>
            <span className="text-white/20">·</span>
            <span className="text-emerald-400 text-xs">{ok.length} ok</span>
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-1.5 space-y-0.5">
          {visible.map((h) => {
            const sev = SEVERITY_CONFIG[h.severity];
            const Icon = HOTSPOT_ICON_MAP[h.icon];
            const isActive = selectedId === h.id;
            return (
              <button
                key={h.id}
                onClick={() => onSelect(h.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all',
                  isActive ? 'bg-white/10' : 'hover:bg-white/5'
                )}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 relative"
                  style={{ backgroundColor: `${sev.color}15` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: sev.color }} />
                  {(h.severity === 'critical' || h.severity === 'warning') && (
                    <motion.div
                      animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 rounded-lg"
                      style={{ border: `1.5px solid ${sev.color}` }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white/80 text-[11px] font-medium truncate">{h.label}</div>
                  <div className="text-white/30 text-[9px] font-mono">{h.dtcCode || h.system}</div>
                </div>
                <ChevronRight className={cn('w-3 h-3 text-white/20 flex-shrink-0 transition-transform', isActive && 'rotate-90')} />
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Transmission Cross-Section Panel ────────────────────────────────────────
function TransmissionPanel({
  isVisible,
  onClose,
}: {
  isVisible: boolean;
  onClose: () => void;
}) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-[480px] max-w-[90%]"
    >
      <div className="bg-gray-950/95 backdrop-blur-md rounded-2xl border border-emerald-500/20 overflow-hidden shadow-2xl">
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Cog className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Transmission Cross-Section</div>
              <div className="text-white/40 text-[10px] font-mono">AISIN AT · INTERNAL LAYOUT</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3">
          <div className="rounded-xl overflow-hidden bg-gray-900 border border-white/5 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/camry aisin.png"
              alt="Aisin AT Cross Section"
              className="w-full h-auto opacity-90"
              style={{ filter: 'brightness(0.85) contrast(1.1)' }}
            />
            {/* Overlay tint for visual consistency */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-emerald-500/5 pointer-events-none" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[10px] text-white/40 font-mono">
              <span>4AT PUNCH POWERTRAIN</span>
              <span className="text-emerald-400">STATUS: NOMINAL</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 text-[10px] font-mono">ALL CLEAR</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Export Component ───────────────────────────────────────────────────
interface VehicleScanner3DProps {
  isVisible: boolean;
  onClose: () => void;
  vehicleName?: string;
  modelUrl?: string;
  /** When provided, the scanner follows external progress (0-100) instead of its own timer */
  externalScanPercent?: number;
  /** Custom label shown during scan (e.g. 'Discovering ECUs...') */
  scanLabel?: string;
  /** Called when scan reaches 100% (external or internal) */
  onScanFinished?: () => void;
  /** If true, auto-closes after scan completes with a summary screen */
  autoClose?: boolean;
  /** Delay in ms before auto-close (default 4000) */
  autoCloseDelay?: number;
}

type SessionPhase = 'initializing' | 'scanning' | 'completing' | 'exiting';

export default function VehicleScanner3D({
  isVisible,
  onClose,
  vehicleName = 'Proton Saga',
  modelUrl = '/models/proton-saga-pbr.fbx',
  externalScanPercent,
  scanLabel,
  onScanFinished,
  autoClose = false,
  autoCloseDelay = 4500,
}: VehicleScanner3DProps) {
  const isExternallyDriven = externalScanPercent !== undefined;
  const [viewMode, setViewMode] = useState<'wireframe' | 'xray' | 'solid'>('wireframe');
  const [scanActive, setScanActive] = useState(false);
  const [scanPhase, setScanPhase] = useState<'scanning' | 'complete'>('scanning');
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>(autoClose ? 'initializing' : 'scanning');
  const [internalScanPercent, setInternalScanPercent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [showTransmission, setShowTransmission] = useState(false);
  const [initProgress, setInitProgress] = useState(0);
  const [exitCountdown, setExitCountdown] = useState(0);

  // Effective scan progress — external or internal
  const scanPercent = isExternallyDriven ? (externalScanPercent ?? 0) : internalScanPercent;

  const activeHotspot = DIAGNOSTIC_HOTSPOTS.find(h => h.id === selectedHotspot) || null;

  // Handle hotspot click — if transmission, open cross-section panel
  const handleHotspotClick = useCallback((id: string) => {
    if (id === 'transmission') {
      setShowTransmission(true);
      setSelectedHotspot(id);
    } else {
      setShowTransmission(false);
      setSelectedHotspot(prev => prev === id ? null : id);
    }
  }, []);

  // ── Session Phase 1: Initializing (boot-up animation ~4s) ── only when autoClose
  useEffect(() => {
    if (!autoClose || !isVisible || sessionPhase !== 'initializing') return;

    setInitProgress(0);
    const interval = setInterval(() => {
      setInitProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Brief pause at 100% before transitioning to scanning
          setTimeout(() => {
            setSessionPhase('scanning');
            setScanActive(true);
          }, 400);
          return 100;
        }
        return prev + 1.6; // ~3.5s to reach 100 at 55ms intervals
      });
    }, 55);

    return () => clearInterval(interval);
  }, [autoClose, isVisible, sessionPhase]);

  // ── Session Phase 2: Scanning (internal timer or external progress) ──
  useEffect(() => {
    if (!isVisible || scanPhase === 'complete' || isExternallyDriven || sessionPhase !== 'scanning') return;

    // Slower internal scan for realistic feel (~12s total)
    const interval = setInterval(() => {
      setInternalScanPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanPhase('complete');
          setScanActive(false);
          setViewMode('xray');
          if (autoClose) {
            setSessionPhase('completing');
          }
          onScanFinished?.();
          return 100;
        }
        // Variable speed: slow at start, faster mid, slow at end
        const speed = prev < 15 ? 0.3 : prev < 40 ? 0.5 : prev < 75 ? 0.6 : prev < 90 ? 0.4 : 0.25;
        return prev + speed;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isVisible, scanPhase, isExternallyDriven, sessionPhase, autoClose, onScanFinished]);

  // Externally-driven: track completion when external progress hits 100
  useEffect(() => {
    if (!isExternallyDriven || !isVisible || sessionPhase === 'initializing') return;
    if (externalScanPercent !== undefined && externalScanPercent >= 100 && scanPhase !== 'complete') {
      setScanPhase('complete');
      setScanActive(false);
      setViewMode('xray');
      if (autoClose) {
        setSessionPhase('completing');
      }
      onScanFinished?.();
    }
  }, [externalScanPercent, isExternallyDriven, isVisible, scanPhase, sessionPhase, autoClose, onScanFinished]);

  // ── Session Phase 3: Completing → auto-close countdown ──
  useEffect(() => {
    if (sessionPhase !== 'completing') return;

    if (autoClose) {
      setExitCountdown(autoCloseDelay);
      const tick = setInterval(() => {
        setExitCountdown((prev) => {
          if (prev <= 100) {
            clearInterval(tick);
            setSessionPhase('exiting');
            return 0;
          }
          return prev - 100;
        });
      }, 100);
      return () => clearInterval(tick);
    }
  }, [sessionPhase, autoClose, autoCloseDelay]);

  // ── Session Phase 4: Exiting → call onClose after exit animation ──
  useEffect(() => {
    if (sessionPhase !== 'exiting') return;
    const timer = setTimeout(() => {
      onClose();
    }, 600); // match exit animation duration
    return () => clearTimeout(timer);
  }, [sessionPhase, onClose]);

  // Reset when opened
  useEffect(() => {
    if (isVisible) {
      setSessionPhase(autoClose ? 'initializing' : 'scanning');
      setScanPhase('scanning');
      setInternalScanPercent(0);
      setScanActive(!autoClose); // standalone mode starts scan immediately
      setViewMode('wireframe');
      setSelectedHotspot(null);
      setShowTransmission(false);
      setInitProgress(0);
      setExitCountdown(0);
    }
  }, [isVisible, autoClose]);

  if (!isVisible) return null;

  const faultCount = DIAGNOSTIC_HOTSPOTS.filter(h => (h.severity === 'critical' || h.severity === 'warning') && scanPercent >= h.revealAt).length;
  const isExiting = sessionPhase === 'exiting';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: isExiting ? 0.5 : 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-lg"
          onClick={sessionPhase === 'completing' ? onClose : undefined}
        />

        {/* Container — autoClose mode: slides up on enter, slides down on exit. Standalone: scale pop */}
        <motion.div
          initial={autoClose
            ? { y: '100%', opacity: 0, borderRadius: '2rem' }
            : { scale: 0.92, opacity: 0, borderRadius: '2rem' }
          }
          animate={{
            y: autoClose && isExiting ? '100%' : 0,
            scale: !autoClose && isExiting ? 0.92 : 1,
            opacity: isExiting ? 0 : 1,
            borderRadius: isFullscreen ? '0' : '1.5rem',
          }}
          transition={{
            type: 'spring',
            damping: isExiting ? 20 : 30,
            stiffness: isExiting ? 200 : 180,
            duration: isExiting ? 0.5 : undefined,
          }}
          className={cn(
            'relative bg-gradient-to-br from-gray-950 via-slate-950 to-gray-950 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 overflow-hidden',
            isFullscreen ? 'w-screen h-screen' : 'w-[95vw] max-w-7xl h-[85vh]'
          )}
        >
          {/* CRT scanline overlay */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.1) 2px, rgba(0,255,136,0.1) 4px)' }}
          />

          {/* ── INITIALIZING OVERLAY ── */}
          <AnimatePresence>
            {sessionPhase === 'initializing' && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gray-950"
              >
                {/* Boot-up grid lines */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                  className="absolute inset-0"
                  style={{ backgroundImage: 'linear-gradient(rgba(0,255,136,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />

                {/* Center logo/icon */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-24 h-24 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-8 relative"
                >
                  <Scan className="w-12 h-12 text-emerald-400" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-emerald-500/50"
                  />
                </motion.div>

                {/* Vehicle name */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-white/80 text-2xl font-bold tracking-wide">{vehicleName}</h2>
                  <p className="text-emerald-400/60 font-mono text-sm mt-2 tracking-widest">INITIALIZING DIAGNOSTIC SESSION</p>
                </motion.div>

                {/* Init progress bar */}
                <div className="w-80 max-w-[80%]">
                  <div className="flex justify-between mb-2">
                    <span className="text-emerald-400/50 text-xs font-mono">
                      {initProgress < 30 ? 'LOADING 3D MODEL...' :
                       initProgress < 60 ? 'CALIBRATING SENSORS...' :
                       initProgress < 85 ? 'MAPPING VEHICLE TOPOLOGY...' :
                       'READY TO SCAN'}
                    </span>
                    <span className="text-emerald-400/70 text-xs font-mono">{Math.round(initProgress)}%</span>
                  </div>
                  <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${initProgress}%` }}
                    />
                  </div>
                  {/* System check items */}
                  <div className="mt-4 space-y-1.5">
                    {[
                      { label: 'OBD-II Link', threshold: 15 },
                      { label: '3D Model', threshold: 35 },
                      { label: 'Fault Database', threshold: 55 },
                      { label: 'Sensor Array', threshold: 75 },
                      { label: 'Session Lock', threshold: 90 },
                    ].map(({ label, threshold }) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: initProgress >= threshold ? 1 : 0.3, x: 0 }}
                        className="flex items-center gap-2"
                      >
                        <div className={cn(
                          'w-1.5 h-1.5 rounded-full transition-colors duration-300',
                          initProgress >= threshold ? 'bg-emerald-400' : 'bg-white/20'
                        )} />
                        <span className={cn(
                          'text-xs font-mono transition-colors duration-300',
                          initProgress >= threshold ? 'text-emerald-400/70' : 'text-white/20'
                        )}>
                          {label}
                        </span>
                        {initProgress >= threshold && (
                          <span className="text-emerald-500/50 text-[10px] font-mono ml-auto">OK</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── COMPLETING OVERLAY (scan finished summary) ── */}
          <AnimatePresence>
            {sessionPhase === 'completing' && autoClose && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
              >
                <div className="pointer-events-auto bg-gray-950/80 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-10 max-w-lg text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2, damping: 12 }}
                    className={cn(
                      'w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6',
                      faultCount > 0 ? 'bg-red-500/15 border border-red-500/30' : 'bg-emerald-500/15 border border-emerald-500/30'
                    )}
                  >
                    {faultCount > 0 ? (
                      <AlertTriangle className="w-10 h-10 text-red-400" />
                    ) : (
                      <Activity className="w-10 h-10 text-emerald-400" />
                    )}
                  </motion.div>

                  <motion.h2
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={cn(
                      'text-2xl font-bold mb-2',
                      faultCount > 0 ? 'text-red-400' : 'text-emerald-400'
                    )}
                  >
                    {faultCount > 0 ? `${faultCount} FAULTS DETECTED` : 'SCAN COMPLETE'}
                  </motion.h2>

                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/50 text-sm mb-6"
                  >
                    {DIAGNOSTIC_HOTSPOTS.length} zones inspected · {vehicleName}
                  </motion.p>

                  {/* Quick fault summary */}
                  {faultCount > 0 && (
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="space-y-1.5 mb-6"
                    >
                      {DIAGNOSTIC_HOTSPOTS.filter(h => h.severity === 'critical' || h.severity === 'warning').map(h => (
                        <div key={h.id} className="flex items-center gap-2 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SEVERITY_CONFIG[h.severity].color }} />
                          <span className="text-white/50 font-mono">{h.dtcCode || '—'}</span>
                          <span className="text-white/40">{h.label}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Auto-close progress */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <p className="text-white/20 text-xs font-mono mb-2">LOADING FULL REPORT...</p>
                    <div className="h-0.5 bg-white/5 rounded-full overflow-hidden w-48 mx-auto">
                      <motion.div
                        className="h-full bg-emerald-500/50 rounded-full"
                        style={{ width: `${Math.max(0, 100 - (exitCountdown / autoCloseDelay) * 100)}%` }}
                      />
                    </div>
                  </motion.div>

                  <button
                    onClick={onClose}
                    className="mt-4 text-xs text-emerald-400/50 hover:text-emerald-400 font-mono transition-colors"
                  >
                    SKIP →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  sessionPhase === 'initializing' ? 'bg-blue-400 animate-pulse' :
                  scanPhase === 'scanning' ? 'bg-emerald-400 animate-pulse' :
                  faultCount > 0 ? 'bg-red-400 animate-pulse' : 'bg-emerald-500'
                )} />
                <span className={cn(
                  'font-mono text-sm font-bold tracking-wider',
                  sessionPhase === 'initializing' ? 'text-blue-400' :
                  scanPhase === 'complete' && faultCount > 0 ? 'text-red-400' : 'text-emerald-400'
                )}>
                  {sessionPhase === 'initializing' ? 'INITIALIZING' :
                   sessionPhase === 'completing' || sessionPhase === 'exiting' ? (faultCount > 0 ? `${faultCount} FAULTS DETECTED` : 'SCAN COMPLETE') :
                   'SCANNING'}
                </span>
              </div>
              <span className="text-white/40 text-sm">|</span>
              <span className="text-white/70 font-medium">{vehicleName}</span>
              {scanPhase === 'complete' && (
                <span className="text-white/20 text-xs font-mono">
                  {DIAGNOSTIC_HOTSPOTS.length} zones inspected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setIsFullscreen(f => !f)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scan Progress Bar */}
          {sessionPhase === 'scanning' && scanPhase === 'scanning' && (
            <div className="absolute top-16 left-6 right-6 z-20">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400/60 font-mono">
                  {scanLabel ? scanLabel :
                   scanPercent < 25 ? 'SCANNING CHASSIS...' :
                   scanPercent < 40 ? 'ANALYZING POWERTRAIN...' :
                   scanPercent < 60 ? 'INSPECTING EXHAUST SYSTEM...' :
                   scanPercent < 80 ? 'CHECKING ELECTRONICS...' :
                   'VERIFYING STRUCTURAL INTEGRITY...'}
                </span>
                <span className="text-emerald-400 font-mono font-bold">{Math.round(scanPercent)}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full"
                  style={{ width: `${Math.min(scanPercent, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* 3D Canvas */}
          <div className="absolute inset-0">
            <Canvas
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
            >
              <Suspense fallback={<Loader />}>
                <CameraRig />
                <ambientLight intensity={0.3} />
                <directionalLight position={[5, 5, 5]} intensity={0.5} color="#ffffff" />
                <pointLight position={[-3, 2, -3]} intensity={0.3} color="#00ff88" />
                <pointLight position={[3, 1, 3]} intensity={0.2} color="#00cc66" />

                {/* Car + hotspots rotate together */}
                <VehicleRotationGroup speed={scanPhase === 'complete' ? 0.05 : 0.15}>
                  <CarModel url={modelUrl} viewMode={viewMode} />

                  {/* Diagnostic Hotspot Markers */}
                  {DIAGNOSTIC_HOTSPOTS.map((hotspot) => (
                    <HotspotMarker
                      key={hotspot.id}
                      hotspot={hotspot}
                      visible={scanPercent >= hotspot.revealAt}
                      isSelected={selectedHotspot === hotspot.id}
                      onClick={() => handleHotspotClick(hotspot.id)}
                    />
                  ))}

                  {/* Data trail lines from hotspots to floor */}
                  <DataTrails hotspots={DIAGNOSTIC_HOTSPOTS} scanPercent={scanPercent} />
                </VehicleRotationGroup>

                <ScanBeam active={scanActive} />
                <GridFloor />
                <ParticleField />

                <OrbitControls
                  enablePan={false}
                  enableZoom={true}
                  minDistance={3}
                  maxDistance={12}
                  maxPolarAngle={Math.PI / 2}
                  autoRotate={false}
                />

                <EffectComposer>
                  <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} mipmapBlur />
                </EffectComposer>
              </Suspense>
            </Canvas>
          </div>

          {/* Left: Hotspot list panel — visible during scanning (after enough progress) or complete, not during init/exit */}
          {(sessionPhase === 'scanning' || (!autoClose && scanPhase === 'complete')) && (
          <AnimatePresence>
            {scanPercent > 20 && (
              <HotspotListPanel
                hotspots={DIAGNOSTIC_HOTSPOTS}
                scanPercent={scanPercent}
                selectedId={selectedHotspot}
                onSelect={handleHotspotClick}
              />
            )}
          </AnimatePresence>
          )}

          {/* Right: Selected hotspot detail panel — visible during scanning/complete in standalone */}
          {(sessionPhase === 'scanning' || (!autoClose && scanPhase === 'complete')) && (
          <AnimatePresence>
            {activeHotspot && activeHotspot.id !== 'transmission' && (
              <HotspotDetailPanel
                hotspot={activeHotspot}
                onClose={() => setSelectedHotspot(null)}
              />
            )}
          </AnimatePresence>
          )}

          {/* Bottom: Transmission cross-section — visible during scanning/complete in standalone */}
          {(sessionPhase === 'scanning' || (!autoClose && scanPhase === 'complete')) && (
          <AnimatePresence>
            <TransmissionPanel
              isVisible={showTransmission}
              onClose={() => { setShowTransmission(false); setSelectedHotspot(null); }}
            />
          </AnimatePresence>
          )}

          {/* Bottom Controls — visible during scanning/complete in standalone, not during init/completing */}
          {(sessionPhase === 'scanning' || (!autoClose && scanPhase === 'complete')) && (
          <div className="absolute bottom-0 left-0 right-0 z-20 px-6 py-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              {/* View mode toggles */}
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-xs font-mono mr-2">VIEW</span>
                {[
                  { mode: 'wireframe' as const, icon: Scan, label: 'Wireframe' },
                  { mode: 'xray' as const, icon: Eye, label: 'X-Ray' },
                  { mode: 'solid' as const, icon: Eye, label: 'Solid' },
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                      viewMode === mode
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-white/40 hover:text-white/70 border border-transparent'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Rescan button */}
              <button
                onClick={() => {
                  setSessionPhase(autoClose ? 'initializing' : 'scanning');
                  setScanPhase('scanning');
                  setInternalScanPercent(0);
                  setScanActive(!autoClose);
                  setViewMode('wireframe');
                  setSelectedHotspot(null);
                  setShowTransmission(false);
                  setInitProgress(0);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Rescan
              </button>
            </div>

            {/* Status readouts — now reflect actual fault state */}
            <div className="flex items-center gap-6 mt-3">
              {[
                { label: 'CHASSIS', pct: 20, fault: scanPercent >= 20 && DIAGNOSTIC_HOTSPOTS.some(h => h.system.includes('CHASSIS') && h.severity !== 'ok' && scanPercent >= h.revealAt) },
                { label: 'BODY', pct: 40, fault: false },
                { label: 'POWERTRAIN', pct: 35, fault: scanPercent >= 35 && DIAGNOSTIC_HOTSPOTS.some(h => h.system.includes('POWERTRAIN') && h.severity !== 'ok' && scanPercent >= h.revealAt) },
                { label: 'EXHAUST', pct: 55, fault: scanPercent >= 55 && DIAGNOSTIC_HOTSPOTS.some(h => h.system.includes('EXHAUST') && h.severity !== 'ok' && scanPercent >= h.revealAt) },
                { label: 'ELECTRONICS', pct: 75, fault: false },
              ].map(({ label, pct, fault }) => {
                const checked = scanPercent > pct;
                return (
                  <div key={label} className="flex items-center gap-2">
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      !checked ? 'bg-white/20' : fault ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'
                    )} />
                    <span className="text-white/30 text-xs font-mono">{label}</span>
                    <span className={cn(
                      'text-xs font-mono font-bold',
                      !checked ? 'text-white/20' : fault ? 'text-red-400' : 'text-emerald-400'
                    )}>
                      {!checked ? '...' : fault ? 'FAULT' : 'OK'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* Corner decorations */}
          <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-emerald-500/30 rounded-tl-lg z-10" />
          <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-emerald-500/30 rounded-tr-lg z-10" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-emerald-500/30 rounded-bl-lg z-10" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-emerald-500/30 rounded-br-lg z-10" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
