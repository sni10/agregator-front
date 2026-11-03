<!--
  LikeHold.vue — лайк с удержанием (вариант 1a «Искры»). Vue 3, без зависимостей.

  Использование:
    <LikeHold :rating="1284" :limit="100" :initial="0" @commit="onCommit" />

  Props:
    rating       — текущий рейтинг статьи (без вклада юзера)
    initial      — уже поставленный юзером вклад (0..limit)
    limit        — максимум от одного юзера (по умолчанию 100)
    acceleration — множитель скорости набора (1 = 100 очков примерно за 4 с)
  Events:
    commit(added, total) — после отпускания: сколько добавлено сейчас и итоговый вклад
    progress(total)      — во время удержания, при каждом изменении
-->
<template>
  <div class="lh">
    <div class="lh-count" :style="{ transform: `scale(${numScale})` }">{{ countText }}</div>
    <div class="lh-stage">
      <canvas ref="canvas" class="lh-canvas"></canvas>
      <svg class="lh-ring" width="176" height="176" viewBox="0 0 176 176">
        <rect
          x="1"
          y="1"
          width="174"
          height="174"
          fill="none"
          stroke="var(--lh-track)"
          stroke-width="2"
        />
        <rect
          x="1"
          y="1"
          width="174"
          height="174"
          fill="none"
          stroke="var(--lh-accent)"
          stroke-width="2"
          pathLength="100"
          :stroke-dasharray="`${(progress * 100).toFixed(2)} 100`"
        />
      </svg>
      <button
        class="lh-btn"
        :class="{ 'is-full': full && !hasParticles }"
        :style="{ background: btnBg }"
        aria-label="Поставить лайк"
        @pointerdown="press"
        @pointerup="release"
        @pointercancel="release"
        @lostpointercapture="release"
        @contextmenu.prevent
      >
        <i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>
        <svg
          width="60"
          height="60"
          viewBox="0 0 24 24"
          fill="var(--lh-accent)"
          :fill-opacity="fill"
          :stroke="iconStroke"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :style="{ transform: iconTransform }"
        >
          <path d="M7 10v12" />
          <path
            d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  rating: { type: Number, default: 0 },
  initial: { type: Number, default: 0 },
  limit: { type: Number, default: 100 },
  acceleration: { type: Number, default: 1 },
})
const emit = defineEmits(['commit', 'progress'])

const canvas = ref<HTMLCanvasElement | null>(null)
const committed = ref(props.initial)
const session = ref(0)
const holding = ref(false)
const now = ref(performance.now())
watch(
  () => props.initial,
  (v) => {
    if (!holding.value) committed.value = v
  },
)

let t0 = 0,
  lastInc = -1e9,
  releaseAt = -1e9,
  releaseScale = 1,
  acc = 0,
  last = 0,
  raf = 0
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  hue: number
  burst: boolean
}
let parts: Particle[] = []
const hasParticles = ref(false)
let colors = { a: '#5980a6', a4: '#94bce3', a7: '#416180' }

const total = computed(() => committed.value + session.value)
const progress = computed(() => Math.min(1, total.value / props.limit))
const full = computed(() => committed.value >= props.limit)
const countText = computed(() => (props.rating + total.value).toLocaleString('ru-RU'))

const holdT = () => ((now.value - t0) / 1000) * props.acceleration
const speed = () => (holding.value ? Math.min(1, (2 + 12 * holdT()) / 40) : 0)
function scaleAt(t: number) {
  if (holding.value) {
    const s = (t - t0) / 1000
    return 1 + 0.45 * (1 - Math.exp(-s * 0.9)) - 0.14 * Math.exp(-s * 12)
  }
  const e = (t - releaseAt) / 1000,
    A = releaseScale - 1
  return 1 + A * Math.exp(-5 * e) * Math.cos(15 * e) + 0.2 * Math.exp(-6 * e) * Math.sin(15 * e)
}

const iconTransform = computed(() => {
  const t = now.value,
    s = speed()
  const ht = holding.value ? (t - t0) / 1000 : 0
  const dx = Math.sin(t / 16) * s * 3,
    dy = Math.cos(t / 19) * s * 2
  const rot = holding.value ? -8 * Math.min(1, ht * 5) + Math.sin(t / 23) * s * 7 : 0
  return `translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${scaleAt(t).toFixed(3)})`
})
const fill = computed(() =>
  Math.min(1, progress.value * 1.2 + (holding.value ? 0.25 : 0)).toFixed(3),
)
const iconStroke = computed(() =>
  holding.value || total.value > 0 ? 'var(--lh-accent-dark)' : 'var(--lh-ink)',
)
const btnBg = computed(() =>
  holding.value
    ? `color-mix(in srgb, var(--lh-accent) ${Math.round(6 + 14 * speed())}%, transparent)`
    : 'transparent',
)
const numScale = computed(() =>
  (1 + 0.16 * Math.exp((-(now.value - lastInc) / 1000) * 14)).toFixed(3),
)

function press(e: PointerEvent) {
  if (full.value) return
  e.preventDefault()
  try {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  } catch {
    /* pointer already gone */
  }
  t0 = lastInc = performance.now()
  holding.value = true
  session.value = 1
  emit('progress', total.value)
  if (committed.value + 1 >= props.limit) release()
}
function release() {
  if (!holding.value) return
  const t = performance.now()
  releaseScale = scaleAt(t)
  holding.value = false
  releaseAt = t
  const added = session.value
  burst(added)
  committed.value += added
  session.value = 0
  emit('commit', added, committed.value)
}

function spawn(s: number, isBurst: boolean) {
  const a = Math.random() * Math.PI * 2,
    r0 = 50 * scaleAt(performance.now())
  const sp = isBurst ? 220 + Math.random() * 360 : (90 + Math.random() * 200) * (0.6 + s)
  parts.push({
    x: Math.cos(a) * r0,
    y: Math.sin(a) * r0,
    vx: Math.cos(a) * sp,
    vy: Math.sin(a) * sp,
    life: 0,
    max: isBurst ? 0.7 + Math.random() * 0.4 : 0.45 + Math.random() * 0.3,
    hue: Math.random(),
    burst: isBurst,
  })
}
function burst(n: number) {
  const count = Math.min(80, 14 + Math.round(n * 0.7))
  for (let k = 0; k < count; k++) spawn(1, true)
}

function step(t: number) {
  const dt = Math.min(0.05, (t - last) / 1000)
  last = t
  now.value = t
  if (holding.value) {
    const ht = holdT(),
      cap = props.limit - committed.value
    const target = Math.min(cap, 1 + Math.floor(2 * ht + 6 * ht * ht))
    if (target > session.value) {
      session.value = target
      lastInc = t
      emit('progress', total.value)
    }
    const s = speed()
    acc += dt * (8 + 70 * s)
    while (acc >= 1) {
      acc -= 1
      spawn(s, false)
    }
    if (session.value >= cap) release()
  }
  const drag = Math.pow(0.9, dt * 60)
  parts = parts.filter((p) => (p.life += dt) < p.max)
  for (const p of parts) {
    p.vx *= drag
    p.vy *= drag
    if (p.burst) p.vy += 120 * dt
    p.x += p.vx * dt
    p.y += p.vy * dt
  }
  hasParticles.value = parts.length > 0
  draw()
  raf = requestAnimationFrame(step)
}

function draw() {
  const c = canvas.value
  if (!c) return
  const dpr = window.devicePixelRatio || 1,
    W = c.clientWidth,
    H = c.clientHeight
  if (c.width !== W * dpr || c.height !== H * dpr) {
    c.width = W * dpr
    c.height = H * dpr
  }
  const ctx = c.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, (W / 2) * dpr, (H / 2) * dpr)
  ctx.clearRect(-W / 2, -H / 2, W, H)
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  for (const p of parts) {
    ctx.globalAlpha = Math.max(0, 1 - p.life / p.max)
    ctx.strokeStyle = p.hue < 0.5 ? colors.a : p.hue < 0.8 ? colors.a4 : colors.a7
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

onMounted(() => {
  const cs = getComputedStyle(canvas.value!)
  const g = (n: string, f: string) => cs.getPropertyValue(n).trim() || f
  colors = {
    a: g('--lh-accent', colors.a),
    a4: g('--lh-accent-light', colors.a4),
    a7: g('--lh-accent-dark', colors.a7),
  }
  last = performance.now()
  raf = requestAnimationFrame(step)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<style scoped>
.lh {
  /* Цвета: переопределите в своём проекте */
  --lh-accent: #5980a6;
  --lh-accent-light: #94bce3;
  --lh-accent-dark: #416180;
  --lh-ink: #424244;
  --lh-track: #d4d4d7;
  --lh-line: rgba(29, 31, 32, 0.16);
  --lh-mark: #7a7a7d;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-family: 'Barlow Condensed', system-ui, sans-serif;
}
.lh-stage {
  position: relative;
  width: 340px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lh-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.lh-ring {
  position: absolute;
  pointer-events: none;
  overflow: visible;
}
.lh-btn {
  position: relative;
  width: 132px;
  height: 132px;
  padding: 0;
  border: 1px solid var(--lh-line);
  border-radius: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.lh-btn:focus {
  outline: none;
}
.lh-btn:focus-visible {
  outline: 2px solid var(--lh-accent);
  outline-offset: 2px;
}
.lh-btn.is-full {
  opacity: 0.55;
  cursor: default;
}
.lh-btn svg {
  pointer-events: none;
}
.c {
  position: absolute;
  width: 11px;
  height: 11px;
}
.c::before,
.c::after {
  content: '';
  position: absolute;
  background: var(--lh-mark);
}
.c::before {
  left: 5px;
  top: 0;
  width: 1px;
  height: 100%;
}
.c::after {
  top: 5px;
  left: 0;
  width: 100%;
  height: 1px;
}
.c.tl {
  top: -6px;
  left: -6px;
}
.c.tr {
  top: -6px;
  right: -6px;
}
.c.bl {
  bottom: -6px;
  left: -6px;
}
.c.br {
  bottom: -6px;
  right: -6px;
}
.lh-count {
  font-size: 52px;
  font-weight: 600;
  line-height: 1;
  color: #1d1f20;
  font-variant-numeric: tabular-nums;
  transform-origin: center bottom;
}
</style>
