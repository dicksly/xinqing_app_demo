<template>
  <div class="sprout-panorama-scene" :class="{ locked: !unlocked }">
    <canvas ref="canvasRef" aria-label="草团子全景小窝"></canvas>
    <div class="panorama-copy">
      <strong>{{ unlocked ? '全景小窝' : '第 300 天全景小窝' }}</strong>
      <span>{{ subtitle }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  unlocked: {
    type: Boolean,
    default: false,
  },
  weather: {
    type: Object,
    default: () => ({ condition: 'sunny' }),
  },
  bgm: {
    type: String,
    default: '',
  },
})

const canvasRef = ref(null)
let renderer = null
let scene = null
let camera = null
let sproutGroup = null
let animationFrame = null
let resizeObserver = null
let THREE = null

const subtitle = computed(() => {
  if (!props.unlocked) return '还在慢慢搭建'
  if (props.weather?.condition === 'rain') return '雨声落在小窝边'
  if (props.weather?.condition === 'snow') return '雪光铺满软软地面'
  return props.bgm ? '伴着小窝音乐轻轻转动' : '草团子在小窝里转了一圈'
})

function getSceneColors() {
  const condition = props.weather?.condition || 'sunny'
  if (condition === 'rain') {
    return { background: '#DDEAF0', floor: '#8EB6AD', accent: '#6FA3B8' }
  }
  if (condition === 'snow') {
    return { background: '#EEF4F7', floor: '#D5E6EA', accent: '#AFC7D6' }
  }
  if (condition === 'cloudy') {
    return { background: '#ECE7DC', floor: '#B7C8A5', accent: '#B2B8A3' }
  }
  return { background: '#FFF4DF', floor: '#A7D889', accent: '#F0C767' }
}

function addSproutModel() {
  sproutGroup = new THREE.Group()

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 48, 32),
    new THREE.MeshStandardMaterial({ color: '#79AF5F', roughness: 0.58 })
  )
  body.scale.set(1.12, 0.82, 1)
  body.position.y = 0.55
  sproutGroup.add(body)

  const cheekMaterial = new THREE.MeshStandardMaterial({ color: '#F5A1AC', roughness: 0.75 })
  const leftCheek = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), cheekMaterial)
  leftCheek.position.set(-0.28, 0.46, 0.62)
  const rightCheek = leftCheek.clone()
  rightCheek.position.x = 0.28
  sproutGroup.add(leftCheek, rightCheek)

  const eyeMaterial = new THREE.MeshStandardMaterial({ color: '#273128', roughness: 0.35 })
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), eyeMaterial)
  leftEye.position.set(-0.22, 0.65, 0.62)
  const rightEye = leftEye.clone()
  rightEye.position.x = 0.22
  sproutGroup.add(leftEye, rightEye)

  const leafMaterial = new THREE.MeshStandardMaterial({ color: '#6BA65A', roughness: 0.5 })
  const leftLeaf = new THREE.Mesh(new THREE.SphereGeometry(0.23, 24, 16), leafMaterial)
  leftLeaf.scale.set(1.55, 0.54, 0.34)
  leftLeaf.rotation.z = 0.46
  leftLeaf.position.set(-0.18, 1.17, 0.02)
  const rightLeaf = leftLeaf.clone()
  rightLeaf.rotation.z = -0.46
  rightLeaf.position.x = 0.18
  sproutGroup.add(leftLeaf, rightLeaf)

  scene.add(sproutGroup)
}

function buildScene() {
  const colors = getSceneColors()
  scene = new THREE.Scene()
  scene.background = new THREE.Color(colors.background)

  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(0, 1.25, 4.2)
  camera.lookAt(0, 0.58, 0)

  const ambient = new THREE.AmbientLight('#ffffff', 1.6)
  const keyLight = new THREE.DirectionalLight('#ffffff', 2.2)
  keyLight.position.set(2.4, 3.2, 3)
  scene.add(ambient, keyLight)

  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(2.3, 2.7, 0.2, 64),
    new THREE.MeshStandardMaterial({ color: colors.floor, roughness: 0.8 })
  )
  floor.position.y = -0.12
  scene.add(floor)

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.64, 0.035, 12, 96),
    new THREE.MeshStandardMaterial({ color: colors.accent, roughness: 0.42 })
  )
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.02
  scene.add(ring)

  addSproutModel()
}

function resizeRenderer() {
  if (!renderer || !camera || !canvasRef.value) return
  const box = canvasRef.value.getBoundingClientRect()
  const width = Math.max(1, Math.floor(box.width))
  const height = Math.max(1, Math.floor(box.height))
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

function renderScene() {
  if (!renderer || !scene || !camera) return
  const dimScale = props.unlocked ? 1 : 0.72
  if (sproutGroup) {
    sproutGroup.rotation.y += props.unlocked ? 0.008 : 0.003
    sproutGroup.scale.setScalar(dimScale)
  }
  renderer.render(scene, camera)
  animationFrame = window.requestAnimationFrame(renderScene)
}

async function setupRenderer() {
  if (!canvasRef.value) return
  THREE = THREE || await import('three')
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: false,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  buildScene()
  resizeRenderer()
  resizeObserver = new ResizeObserver(resizeRenderer)
  resizeObserver.observe(canvasRef.value)
  renderScene()
}

function rebuildScene() {
  if (!renderer) return
  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
  scene = null
  camera = null
  sproutGroup = null
  buildScene()
  resizeRenderer()
  renderScene()
}

onMounted(setupRenderer)

watch(
  () => [props.weather?.condition, props.unlocked],
  rebuildScene
)

onBeforeUnmount(() => {
  if (animationFrame) window.cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  renderer?.dispose()
})
</script>

<style scoped>
.sprout-panorama-scene {
  position: relative;
  min-height: 172px;
  overflow: hidden;
  border-radius: 22px;
  background: #FFF4DF;
}

.sprout-panorama-scene canvas {
  width: 100%;
  height: 172px;
  display: block;
}

.sprout-panorama-scene.locked canvas {
  filter: saturate(0.72) brightness(0.94);
}

.panorama-copy {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  pointer-events: none;
}

.panorama-copy strong,
.panorama-copy span {
  border-radius: 999px;
  padding: 7px 10px;
  background: rgba(255, 255, 255, 0.76);
  color: var(--color-text-primary);
  font-size: 11px;
  line-height: 1.15;
  font-weight: 900;
  backdrop-filter: blur(8px);
}

.panorama-copy span {
  color: var(--color-text-secondary);
  overflow-wrap: anywhere;
}
</style>
