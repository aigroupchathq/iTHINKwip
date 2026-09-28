import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

interface Brain3DSceneProps {
  stage: JourneyStage;
  playing: boolean;
  flowPhase: FlowPhase;
}

type JourneyStage = 'brain' | 'network' | 'highways' | 'synapse' | 'flow';
type FlowPhase = 'distracted' | 'attention' | 'focus' | 'flow';

const FLOW_NETWORK_COLORS = ['#9585ff', '#55d9ff', '#ffc26f', '#f4f7ff'] as const;

interface TravelingSignal {
  mesh: THREE.Mesh;
  curve: THREE.CatmullRomCurve3;
  material: THREE.MeshBasicMaterial;
  offset: number;
  speed: number;
}

const ATLAS_MESHES = [
  '0.0.0.0.0',
  '1.1.1.1.1',
  '1.1.1.1.3',
  '1.1.1.3.0',
  '1.1.1.3.1',
  '1.1.1.4.0',
  '1.1.1.5.1',
  '1.1.2.0.0',
  '1.1.2.1.1',
  '1.1.3.0.0',
  '1.1.3.1.0',
  '1.1.4.0.0',
  '1.1.4.2.0',
  '1.1.4.6.0',
  '1.1.4.7.0',
  '1.1.4.5.0',
  '1.1.4.5.1',
  '1.1.5.0.0',
  '2.1.0.0.0',
  '2.3.0.0.0',
  '3.4.4.0.0',
  '4.0.0.0.0',
  '4.1.0.0.0',
  '4.1.1.0.0',
  '4.1.2.0.0',
  '4.3.0.0.0',
  '9.2.0.0.0',
  '9.3.0.0.0',
  'brain',
] as const;

async function loadAtlasBrain(): Promise<{ group: THREE.Group; matcap: THREE.Texture }> {
  const loader = new GLTFLoader();
  const modelBase = `${import.meta.env.BASE_URL}models/neurotorium/`;
  const [matcap, ...models] = await Promise.all([
    new THREE.TextureLoader().loadAsync(`${modelBase}atlas-matcap.png`),
    ...ATLAS_MESHES.map(code => loader.loadAsync(`${modelBase}${code}.glb`)),
  ]);
  matcap.colorSpace = THREE.SRGBColorSpace;

  const group = new THREE.Group();
  for (const [index, model] of models.entries()) {
    group.add(model.scene);
    model.scene.traverse(object => {
      object.userData.atlasCode = ATLAS_MESHES[index];
      if (!(object instanceof THREE.Mesh)) return;
      const oldMaterials = Array.isArray(object.material) ? object.material : [object.material];
      oldMaterials.forEach(material => material.dispose());
      object.material = new THREE.MeshMatcapMaterial({
        color: '#d8bfd2',
        matcap,
      });
    });
  }

  group.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(group);
  if (bounds.isEmpty()) {
    matcap.dispose();
    throw new Error('The atlas model did not contain any visible geometry.');
  }
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const scale = 3.6 / Math.max(size.x, size.y, size.z);
  group.scale.setScalar(scale);
  group.position.copy(center).multiplyScalar(-scale);
  return { group, matcap };
}

function cloneAtlasModel(source: THREE.Group, color: string, opacity: number) {
  const clone = source.clone(true);
  clone.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    const tinted = materials.map(material => {
      const next = material.clone();
      if (next instanceof THREE.MeshMatcapMaterial) next.color.set(color);
      next.transparent = opacity < 1;
      next.opacity = opacity;
      next.depthWrite = opacity >= 1;
      return next;
    });
    object.material = Array.isArray(object.material) ? tinted : tinted[0];
  });
  return clone;
}

function addSignalPath(
  root: THREE.Group,
  points: THREE.Vector3[],
  color: string,
  count: number,
  lineRadius = 0.012,
  particleRadius = 0.035,
  lineOpacity = 0.42,
): TravelingSignal[] {
  const curve = new THREE.CatmullRomCurve3(points);
  root.add(new THREE.Mesh(
    new THREE.TubeGeometry(curve, 60, lineRadius, 6, false),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: lineOpacity }),
  ));

  return Array.from({ length: count }, (_, index) => {
    const material = new THREE.MeshBasicMaterial({ color, transparent: true });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(particleRadius, 10, 10), material);
    root.add(mesh);
    return { mesh, curve, material, offset: index / count, speed: 0.08 + index * 0.014 };
  });
}

function createNetworkModel(root: THREE.Group, color: string, flowPhase?: FlowPhase) {
  const nodes = [
    new THREE.Vector3(-1.4, 0.2, 0),
    new THREE.Vector3(-0.82, 0, 0.68),
    new THREE.Vector3(-0.62, 0.1, -0.62),
    new THREE.Vector3(0, -0.1, 0.08),
    new THREE.Vector3(0.72, 0.25, 0.72),
    new THREE.Vector3(0.78, 0.12, -0.55),
    new THREE.Vector3(1.42, 0.15, 0.08),
  ];
  const nodeGeometry = new THREE.SphereGeometry(0.105, 24, 24);
  const nodeMaterial = new THREE.MeshStandardMaterial({
    color: '#a89af4',
    emissive: '#524a9b',
    emissiveIntensity: 0.7,
    roughness: 0.38,
  });
  nodes.forEach(position => {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.copy(position);
    root.add(node);
  });

  const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [1, 4], [2, 5]];
  const signals: TravelingSignal[] = [];
  edges.forEach(([from, to], index) => {
    const start = nodes[from];
    const end = nodes[to];
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.z += index % 2 ? 0.24 : -0.2;
    const points = [start.clone(), mid, end.clone()];
    if (flowPhase) {
      const active =
        flowPhase === 'distracted' ||
        (flowPhase === 'attention' && [0, 2, 3, 4, 6].includes(index)) ||
        (flowPhase === 'focus' && [3, 4].includes(index)) ||
        (flowPhase === 'flow' && index === 3);
      const curve = new THREE.CatmullRomCurve3(points);
      root.add(new THREE.Mesh(
        new THREE.TubeGeometry(curve, 48, 0.006, 4, false),
        new THREE.MeshBasicMaterial({ color: '#8290aa', transparent: true, opacity: 0.1 }),
      ));
      if (!active) return;

      const pathColor = flowPhase === 'flow' ? '#f1fff6' : color;
      const pathSignals = addSignalPath(root, points, pathColor, flowPhase === 'distracted' && index % 3 === 0 ? 2 : 1);
      pathSignals.forEach((signal, signalIndex) => {
        signal.speed = flowPhase === 'distracted'
          ? signal.speed * (0.55 + ((index * 3 + signalIndex) % 8) * 0.22)
          : 0.095 + (index % 3) * 0.004;
        if (flowPhase !== 'distracted') signal.offset = ((index % 4) / 4 + signalIndex * 0.5) % 1;
      });
      signals.push(...pathSignals);
      return;
    }
    signals.push(...addSignalPath(root, points, color, index % 3 === 0 ? 2 : 1));
  });
  return signals;
}

function createCortexNetwork(
  root: THREE.Group,
  atlas: THREE.Group,
  color: string,
  phase?: FlowPhase,
  multicolor = false,
  grid = { columns: 5, rows: 4 },
  camera?: THREE.Camera,
): TravelingSignal[] {
  const cameraDirection = new THREE.Vector3(5.8, 1.8, 5.8).normalize();
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), cameraDirection).normalize();
  atlas.updateWorldMatrix(true, true);
  root.updateWorldMatrix(true, false);
  const rootInverse = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const useNetworkColors = Boolean(phase) || multicolor;
  const { columns, rows } = grid;
  let positions: THREE.Vector3[] = [];

  if (camera) {
    camera.updateMatrixWorld(true);
    const raycaster = new THREE.Raycaster();
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const x = -0.62 + ((column + 0.5) / columns) * 1.24;
        const y = 0.48 - ((row + 0.5) / rows) * 0.96;
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        const hit = raycaster.intersectObject(atlas, true).find(intersection => intersection.object instanceof THREE.Mesh);
        if (!hit) continue;
        const surfacePoint = hit.point.clone().addScaledVector(raycaster.ray.direction, -0.035);
        positions.push(root.worldToLocal(surfacePoint));
      }
    }
  }

  if (positions.length < Math.min(columns * rows, 12)) {
    const sampleSurface = (frontOnly: boolean) => {
      const candidates: Array<{ position: THREE.Vector3; screenX: number; screenY: number }> = [];
      atlas.traverse(object => {
        if (!(object instanceof THREE.Mesh) || !String(object.userData.atlasCode).startsWith('1.1.')) return;
        const geometryPositions = object.geometry.getAttribute('position');
        const normals = object.geometry.getAttribute('normal');
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(object.matrixWorld);
        const stride = Math.max(1, Math.floor(geometryPositions.count / 280));
        for (let index = 0; index < geometryPositions.count; index += stride) {
          const normal = normals
            ? new THREE.Vector3().fromBufferAttribute(normals, index).applyMatrix3(normalMatrix).normalize()
            : cameraDirection.clone();
          if (frontOnly && normal.dot(cameraDirection) < 0.04) continue;
          const position = new THREE.Vector3().fromBufferAttribute(geometryPositions, index)
            .applyMatrix4(object.matrixWorld)
            .applyMatrix4(rootInverse)
            .addScaledVector(normal, useNetworkColors ? 0.04 : 0.018)
            .addScaledVector(cameraDirection, useNetworkColors ? 0.04 : 0);
          candidates.push({
            position,
            screenX: right.dot(position),
            screenY: position.y,
          });
        }
      });
      return candidates;
    };

    let candidates = sampleSurface(true);
    if (candidates.length < 20) candidates = sampleSurface(false);
    if (candidates.length < 20) return [];

    const minX = Math.min(...candidates.map(point => point.screenX));
    const maxX = Math.max(...candidates.map(point => point.screenX));
    const minY = Math.min(...candidates.map(point => point.screenY));
    const maxY = Math.max(...candidates.map(point => point.screenY));
    const selected = new Set<number>();
    positions = [];
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const targetX = minX + ((column + 0.5) / columns) * (maxX - minX);
        const targetY = minY + ((row + 0.5) / rows) * (maxY - minY);
        let nearestIndex = -1;
        let nearestDistance = Number.POSITIVE_INFINITY;
        candidates.forEach((candidate, index) => {
          if (selected.has(index)) return;
          const distance = (candidate.screenX - targetX) ** 2 + (candidate.screenY - targetY) ** 2;
          if (distance < nearestDistance) {
            nearestIndex = index;
            nearestDistance = distance;
          }
        });
        if (nearestIndex < 0) continue;
        selected.add(nearestIndex);
        positions.push(candidates[nearestIndex].position);
      }
    }
  }

  if (positions.length === 0) return [];
  let edgeIndex = 0;

  const nodeMaterials = useNetworkColors
    ? FLOW_NETWORK_COLORS.map(color => new THREE.MeshBasicMaterial({ color }))
    : [new THREE.MeshBasicMaterial({ color: '#bdfff4' })];
  const nodeGeometry = new THREE.SphereGeometry(useNetworkColors ? 0.047 : 0.034, 12, 12);
  const nodes = positions.map((position, index) => {
    const materialIndex = useNetworkColors ? (Math.floor(index / columns) + index % columns) % FLOW_NETWORK_COLORS.length : 0;
    const node = new THREE.Mesh(nodeGeometry, nodeMaterials[materialIndex]);
    node.position.copy(position);
    root.add(node);
    return node;
  });
  const signals: TravelingSignal[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column;
      const start = nodes[index];
      if (!start) continue;
      for (const neighbor of [column < columns - 1 ? index + 1 : -1, row < rows - 1 ? index + columns : -1]) {
        const currentEdge = edgeIndex;
        edgeIndex += 1;
        const active = !phase ||
          phase === 'distracted' ||
          (phase === 'attention' && currentEdge % 3 !== 0) ||
          (phase === 'focus' && currentEdge % 5 === 0) ||
          (phase === 'flow' && currentEdge === 7);
        const end = nodes[neighbor];
        if (!end) continue;
        const midpoint = start.position.clone().add(end.position).multiplyScalar(0.5);
        midpoint.add(new THREE.Vector3(0, 0.035, 0));
        const points = [start.position.clone(), midpoint, end.position.clone()];
        const networkColor = useNetworkColors
          ? FLOW_NETWORK_COLORS[(Math.floor(currentEdge / columns) + currentEdge % columns) % FLOW_NETWORK_COLORS.length]
          : color;
        if (phase && !active) {
          const curve = new THREE.CatmullRomCurve3(points);
          root.add(new THREE.Mesh(
            new THREE.TubeGeometry(curve, 40, 0.006, 4, false),
            new THREE.MeshBasicMaterial({ color: networkColor, transparent: true, opacity: 0.18 }),
          ));
          continue;
        }
        if (phase === 'flow' && currentEdge === 7) {
          FLOW_NETWORK_COLORS.forEach((pulseColor, pulseIndex) => {
            const pathSignals = addSignalPath(root, points, pulseColor, 1, 0.02, 0.052);
            pathSignals[0].offset = pulseIndex / FLOW_NETWORK_COLORS.length;
            pathSignals[0].speed = 0.075;
            signals.push(...pathSignals);
          });
        } else {
          const pathSignals = addSignalPath(
            root,
            points,
            networkColor,
            useNetworkColors || phase === 'distracted' && currentEdge % 3 === 0 ? 2 : 1,
            useNetworkColors ? 0.021 : 0.012,
            useNetworkColors ? 0.052 : 0.035,
            useNetworkColors ? 0.56 : 0.42,
          );
          pathSignals.forEach((signal, signalIndex) => {
            signal.speed = phase === 'distracted'
              ? signal.speed * (0.55 + ((currentEdge * 3 + signalIndex) % 8) * 0.22)
              : 0.075 + (currentEdge % 3) * 0.004;
            if (multicolor) signal.offset = signalIndex / pathSignals.length;
            else if (phase !== 'distracted') signal.offset = ((currentEdge % 4) / 4 + signalIndex * 0.5) % 1;
          });
          signals.push(...pathSignals);
        }
      }
    }
  }
  return signals;
}

function createNeuronModel(root: THREE.Group, color: string) {
  const tissue = new THREE.MeshStandardMaterial({ color: '#cb969c', roughness: 0.6 });
  const dendriteMaterial = new THREE.MeshStandardMaterial({ color: '#c38d9b', roughness: 0.62 });
  const soma = new THREE.Mesh(new THREE.SphereGeometry(0.48, 40, 32), tissue);
  soma.position.set(-0.9, 0, 0);
  root.add(soma);
  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 24, 24),
    new THREE.MeshStandardMaterial({ color: '#f0c3bb', emissive: '#6e3c52', emissiveIntensity: 0.35 }),
  );
  nucleus.position.set(-1, -0.08, 0.05);
  root.add(nucleus);

  const branches = [
    [[-1.22, 0.28, 0.22], [-1.68, 0.72, 0.35], [-2.12, 0.96, 0.58]],
    [[-1.24, 0.06, 0.4], [-1.7, 0.1, 0.96], [-1.95, 0.36, 1.3]],
    [[-1.16, -0.28, 0.2], [-1.6, -0.66, 0.45], [-2.04, -0.82, 0.78]],
    [[-1.18, -0.15, -0.16], [-1.5, -0.48, -0.65], [-1.78, -0.7, -0.96]],
    [[-0.96, 0.36, -0.15], [-1.15, 0.8, -0.52], [-1.45, 1.04, -0.76]],
  ];
  branches.forEach(points => {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    root.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.035, 8, false), dendriteMaterial));
  });

  const axon = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.45, 0, 0),
    new THREE.Vector3(0.35, 0.03, -0.03),
    new THREE.Vector3(1.15, -0.04, 0.02),
    new THREE.Vector3(1.9, 0.06, 0),
  ]);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(axon, 60, 0.07, 12, false), dendriteMaterial));
  const sheath = new THREE.MeshStandardMaterial({ color: '#89b9b0', roughness: 0.5 });
  [0.05, 0.42, 0.79, 1.16, 1.53].forEach(x => {
    const segment = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.21, 16), sheath);
    segment.position.set(x, 0, 0);
    segment.rotation.z = Math.PI / 2;
    root.add(segment);
  });
  const terminals = [
    [[1.88, 0.06, 0], [2.13, 0.33, 0.14], [2.38, 0.42, 0.25]],
    [[1.88, 0.06, 0], [2.2, 0.04, -0.06], [2.45, 0.02, -0.14]],
    [[1.88, 0.06, 0], [2.12, -0.22, -0.16], [2.37, -0.34, -0.32]],
  ];
  terminals.forEach(points => {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    root.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.035, 8, false), dendriteMaterial));
  });
  return addSignalPath(root, axon.getPoints(32), color, 3);
}

function createSynapseModel(root: THREE.Group, color: string) {
  const presynaptic = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 40, 32),
    new THREE.MeshPhysicalMaterial({ color: '#c28e99', roughness: 0.48, clearcoat: 0.2 }),
  );
  presynaptic.position.set(-0.88, 0, 0);
  presynaptic.scale.set(1, 0.82, 0.85);
  root.add(presynaptic);

  const postsynaptic = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 40, 32),
    new THREE.MeshPhysicalMaterial({ color: '#79aaa8', roughness: 0.5, clearcoat: 0.2 }),
  );
  postsynaptic.position.set(0.88, 0, 0);
  postsynaptic.scale.set(1, 0.82, 0.85);
  root.add(postsynaptic);

  const cleftGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 1.05),
    new THREE.MeshBasicMaterial({
      color: '#f5c57f',
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  cleftGlow.position.set(0, 0, 0.04);
  root.add(cleftGlow);

  const vesicleMaterial = new THREE.MeshStandardMaterial({
    color: '#f5c57f',
    emissive: '#8c5435',
    emissiveIntensity: 0.45,
  });
  [[-0.96, 0.25, 0.34], [-1.08, -0.04, 0.42], [-0.82, 0.12, -0.35], [-1.18, -0.28, -0.1]].forEach(([x, y, z]) => {
    const vesicle = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 20), vesicleMaterial);
    vesicle.position.set(x, y, z);
    root.add(vesicle);
  });

  for (const z of [-0.42, -0.14, 0.14, 0.42]) {
    const receptor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.22, 12),
      new THREE.MeshStandardMaterial({ color: '#d8ece0', emissive: '#5f988d', emissiveIntensity: 0.35 }),
    );
    receptor.position.set(0.25, 0.02, z);
    receptor.rotation.z = Math.PI / 2;
    root.add(receptor);
  }

  const messengerPositions = [-0.17, -0.08, 0.01, 0.1, 0.19].map((y, index) =>
    new THREE.Vector3(-0.2, y, index % 2 ? 0.12 : -0.12),
  );
  const signals: TravelingSignal[] = [];
  messengerPositions.forEach((position, index) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.34, position.y, position.z),
      position,
      new THREE.Vector3(0.34, position.y + 0.05, position.z * 0.65),
    ]);
    signals.push(...addSignalPath(root, curve.getPoints(16), color, 1));
    const signal = signals[signals.length - 1];
    signal.offset = index / messengerPositions.length;
    signal.speed = 0.045 + index * 0.004;
  });
  return signals;
}

export const Brain3DScene: React.FC<Brain3DSceneProps> = ({ playing, stage, flowPhase }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playingRef = useRef(playing);
  const stageRef = useRef(stage);
  const flowPhaseRef = useRef(flowPhase);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasLabels: Record<JourneyStage, string> = {
    brain: 'Interactive whole-brain atlas model. Drag to rotate, or use the arrow keys.',
    network: 'Brain atlas with a conceptual network of connected cortical pathways.',
    highways: 'Brain atlas with neural pathways and an enlarged neuron showing signal travel.',
    synapse: 'Synapse close-up showing the sending cell, synaptic gap, and receiving cell.',
    flow: 'Conceptual flow-state simulation shown across the brain network.',
  };

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    flowPhaseRef.current = flowPhase;
  }, [flowPhase]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch (error) {
      console.error('WebGL brain rendering could not start.', error);
      setRenderError('3D rendering is unavailable in this browser.');
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.up.set(0, 1, 0);
    const cameraPositions: Record<JourneyStage, THREE.Vector3> = {
      brain: new THREE.Vector3(4.9, 1.6, 4.9),
      network: new THREE.Vector3(4.9, 1.6, 4.9),
      highways: new THREE.Vector3(0, 0, 5.8),
      synapse: new THREE.Vector3(0, 0, 3.9),
      flow: new THREE.Vector3(5.8, 1.8, 5.8),
    };
    camera.position.copy(cameraPositions.brain);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight('#e8eeff', '#1b235d', 1.7));
    const keyLight = new THREE.DirectionalLight('#dffaff', 2.5);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight('#7564ff', 2);
    fillLight.position.set(-4, 1, 1);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight('#00e5ff', 2.1);
    rimLight.position.set(0, -4, 2);
    scene.add(rimLight);

    const brain = new THREE.Group();
    scene.add(brain);
    const brainSignals: TravelingSignal[] = [];

    const network = new THREE.Group();
    const networkSignals: TravelingSignal[] = [];
    scene.add(network);

    const highways = new THREE.Group();
    const highwayDetail = new THREE.Group();
    const highwaySignals = createNeuronModel(highwayDetail, '#72e4d7');
    highwayDetail.scale.setScalar(0.52);
    highwayDetail.position.set(0.85, 0.05, 1.05);
    highways.add(highwayDetail);
    scene.add(highways);

    const synapse = new THREE.Group();
    const synapseContext = new THREE.Group();
    const synapseSignals: TravelingSignal[] = [];
    const synapseDetail = new THREE.Group();
    synapseSignals.push(...createSynapseModel(synapseDetail, '#f4c58f'));
    synapseDetail.scale.setScalar(0.82);
    synapseDetail.position.set(0.85, 0, 0);
    synapse.add(synapseDetail);
    synapse.add(synapseContext);
    scene.add(synapse);

    const flowModels: Record<FlowPhase, THREE.Group> = {
      distracted: new THREE.Group(),
      attention: new THREE.Group(),
      focus: new THREE.Group(),
      flow: new THREE.Group(),
    };
    const flowSignals: Record<FlowPhase, TravelingSignal[]> = {
      distracted: [],
      attention: [],
      focus: [],
      flow: [],
    };
    Object.values(flowModels).forEach(model => scene.add(model));

    const models: Record<Exclude<JourneyStage, 'flow'>, THREE.Group> = { brain, network, highways, synapse };
    const signals: Record<Exclude<JourneyStage, 'flow'>, TravelingSignal[]> = {
      brain: brainSignals,
      network: networkSignals,
      highways: highwaySignals,
      synapse: synapseSignals,
    };

    let disposed = false;
    let atlasMatcap: THREE.Texture | null = null;
    void loadAtlasBrain().then(({ group, matcap }) => {
      if (disposed) {
        group.traverse(object => {
          if (!(object instanceof THREE.Mesh)) return;
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(material => material.dispose());
        });
        matcap.dispose();
        return;
      }
      brain.add(group);
      brainSignals.push(...createCortexNetwork(
        brain,
        group,
        '#69e7dc',
        undefined,
        true,
        { columns: 6, rows: 5 },
        camera,
      ));
      const networkAtlas = cloneAtlasModel(group, '#b8c8e6', 0.38);
      network.add(networkAtlas);
      networkSignals.push(...createCortexNetwork(
        network,
        networkAtlas,
        '#83e5c2',
        undefined,
        true,
        { columns: 6, rows: 5 },
        camera,
      ));

      const highwayAtlas = cloneAtlasModel(group, '#aab4d2', 0.22);
      highways.add(highwayAtlas);
      highwaySignals.push(...createCortexNetwork(highways, highwayAtlas, '#63e5d8'));

      const synapseAtlas = cloneAtlasModel(group, '#96a2c8', 0.2);
      synapseAtlas.scale.multiplyScalar(0.2);
      synapseAtlas.position.set(-1.35, 0.68, -0.7);
      synapseContext.add(synapseAtlas);
      synapseSignals.push(...addSignalPath(
        synapse,
        [
          new THREE.Vector3(-1.8, 0.6, -0.5),
          new THREE.Vector3(-1.2, 0.3, 0),
          new THREE.Vector3(-0.75, 0, 0),
        ],
        '#f4c58f',
        1,
      ));

      const phaseColors: Record<FlowPhase, string> = {
        distracted: '#ffb84a',
        attention: '#00d9ee',
        focus: '#83e5c2',
        flow: '#f1fff6',
      };
      const phaseOpacities: Record<FlowPhase, number> = {
        distracted: 0.4,
        attention: 0.32,
        focus: 0.25,
        flow: 0.18,
      };
      for (const phase of Object.keys(flowModels) as FlowPhase[]) {
        const phaseAtlas = cloneAtlasModel(group, '#b8c8e6', phaseOpacities[phase]);
        flowModels[phase].add(phaseAtlas);
        flowSignals[phase].push(...createCortexNetwork(
          flowModels[phase],
          phaseAtlas,
          phaseColors[phase],
          phase,
        ));
      }

      atlasMatcap = matcap;
      setIsLoading(false);
    }).catch(error => {
      console.error('The Neurotorium educational brain atlas model failed to load.', error);
      if (!disposed) {
        setIsLoading(false);
        setRenderError('The 3D brain model could not be loaded. Refresh to try again.');
      }
    });

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, width < 640 ? 1.25 : 1.5);
      if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let frame = 0;
    let elapsed = 0;
    let lastFrameTime = 0;
    let lastRenderTime = 0;
    let isInViewport = true;
    let dragging = false;
    let previousX = 0;
    let previousY = 0;
    const activeModel = () => stageRef.current === 'flow'
      ? flowModels[flowPhaseRef.current]
      : models[stageRef.current];
    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const model = activeModel();
      model.rotation.y += (event.clientX - previousX) * 0.006;
      model.rotation.x = THREE.MathUtils.clamp(
        model.rotation.x + (event.clientY - previousY) * 0.004,
        -0.62,
        0.62,
      );
      previousX = event.clientX;
      previousY = event.clientY;
    };
    const onPointerUp = () => { dragging = false; };
    const onKeyDown = (event: KeyboardEvent) => {
      const model = activeModel();
      if (event.key === 'ArrowLeft') model.rotation.y -= 0.12;
      if (event.key === 'ArrowRight') model.rotation.y += 0.12;
      if (event.key === 'ArrowUp') model.rotation.x = Math.max(-0.62, model.rotation.x - 0.08);
      if (event.key === 'ArrowDown') model.rotation.x = Math.min(0.62, model.rotation.x + 0.08);
    };
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('keydown', onKeyDown);

    const animate = (time: number) => {
      frame = 0;
      if (!isInViewport || document.hidden) return;
      const frameInterval = host.clientWidth < 640 ? 1000 / 30 : 1000 / 60;
      if (time - lastRenderTime < frameInterval) {
        frame = requestAnimationFrame(animate);
        return;
      }
      const delta = lastFrameTime ? Math.min((time - lastFrameTime) / (1000 / 60), 2) : 1;
      lastFrameTime = time;
      lastRenderTime = time;
      frame = requestAnimationFrame(animate);
      const currentStage = stageRef.current;
      for (const key of Object.keys(models) as Array<Exclude<JourneyStage, 'flow'>>) {
        models[key].visible = key === currentStage;
      }
      for (const phase of Object.keys(flowModels) as FlowPhase[]) {
        flowModels[phase].visible = currentStage === 'flow' && phase === flowPhaseRef.current;
      }
      camera.position.lerp(cameraPositions[currentStage], 1 - Math.pow(1 - 0.035, delta));
      camera.lookAt(0, 0, 0);
      if (playingRef.current && !dragging) {
        elapsed += 0.008 * delta;
        if (currentStage === 'brain') brain.rotation.y += 0.0012 * delta;
        if (currentStage === 'network') network.rotation.y += 0.0012 * delta;
        if (currentStage === 'highways') highways.rotation.y += 0.0008 * delta;
        if (currentStage === 'synapse') synapse.rotation.y += 0.0008 * delta;
        if (currentStage === 'flow') flowModels[flowPhaseRef.current].rotation.y += 0.0012 * delta;
      }
      const currentSignals = currentStage === 'flow' ? flowSignals[flowPhaseRef.current] : signals[currentStage];
      for (const signal of currentSignals) {
        const progress = (elapsed * signal.speed + signal.offset) % 1;
        signal.mesh.position.copy(signal.curve.getPointAt(progress));
        const pulse = Math.sin(progress * Math.PI);
        signal.material.opacity = 0.16 + pulse * 0.84;
        signal.mesh.scale.setScalar(0.5 + pulse * 0.8);
      }
      renderer.render(scene, camera);
    };
    const startAnimation = () => {
      if (!frame && isInViewport && !document.hidden) {
        frame = requestAnimationFrame(animate);
      }
    };
    const stopAnimation = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastFrameTime = 0;
      lastRenderTime = 0;
    };
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isInViewport = entry.isIntersecting;
      if (isInViewport) startAnimation();
      else stopAnimation();
    });
    const onVisibilityChange = () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    };
    intersectionObserver.observe(host);
    document.addEventListener('visibilitychange', onVisibilityChange);
    startAnimation();

    return () => {
      disposed = true;
      stopAnimation();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('keydown', onKeyDown);
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach(material => material.dispose());
          else object.material.dispose();
        }
      });
      atlasMatcap?.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={hostRef} className="brain-3d-model">
      <canvas
        ref={canvasRef}
        aria-label={canvasLabels[stage]}
        role="img"
        tabIndex={0}
      />
      {renderError ? (
        <p className="brain-3d-model__error" role="status">{renderError}</p>
      ) : isLoading ? (
        <p className="brain-3d-model__loading-label" role="status">Loading the 3D brain atlas…</p>
      ) : (
        <span className="brain-3d-model__hint">DRAG TO ROTATE · ARROW KEYS TO EXPLORE</span>
      )}
    </div>
  );
};
