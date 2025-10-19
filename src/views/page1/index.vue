<template>
  <main class="home">
    <canvas ref="canvasEl" class="rose-canvas" aria-hidden="true"></canvas>

    <!-- 背景轮播（两组用于桌面/移动不同裁切） -->
    <div class="carousel carousel1" aria-hidden="true">
      <img
        v-for="(src, idx) in randomFive"
        :key="idx"
        :src="src"
        class="carousel-image"
        :class="{ active: idx === currentIndex }"
      />
    </div>
    <div class="carousel carousel2" aria-hidden="true">
      <img
        v-for="(src, idx) in randomFive2"
        :key="idx"
        :src="src"
        class="carousel-image"
        :class="{ active: idx === currentIndex }"
      />
    </div>

    <section class="center" role="main">
      <h1 class="title">今昔 · 今汐</h1>

      <div class="subtitle" aria-live="polite">
        <span class="typed">{{ typed }}</span
        ><span class="cursor" aria-hidden="true">▍</span>
      </div>
    </section>

    <footer
      class="shore-footer-simple"
      role="contentinfo"
      aria-label="页面页脚"
    >
      <div class="inner container">
        <div class="center">
          <div class="slogan">潮汐轻叩岁光，记下每一次温柔的归处。</div>
          <div class="meta">
            © <span>{{ year }}</span> 今汐电子设定集 · 制作：霜落天亦
          </div>
        </div>
      </div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import violet from "@/assets/violet.png"; // 若希望更贴合风格，可替换为“贝壳/羽毛/萤光点”贴图
const year = new Date().getFullYear();
const canvasEl = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D;
let animationId = 0;
let lastTime = 0;
let elapsed = 0;

interface Rose {
  baseX: number;
  y: number;
  size: number;
  speed: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  angle: number;
  angularSpeed: number;
}

const roses: Rose[] = [];
const ROSE_COUNT_DESKTOP = 18;
const ROSE_COUNT_MOBILE = 6;
const ROSE_IMG = new Image();
ROSE_IMG.src = violet;

function initRoses(count: number) {
  roses.length = 0;
  const canvas = canvasEl.value!;
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

  for (let i = 0; i < count; i++) {
    const baseX = Math.random() * w;
    roses.push({
      baseX,
      y: Math.random() * -h,
      size: 18 + Math.random() * 38, // 稍微精简尺寸
      speed: 12 + Math.random() * 36, // 速度更缓
      swayAmp: 12 + Math.random() * 26,
      swayFreq: 0.15 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      angle: Math.random() * Math.PI * 2,
      angularSpeed: (Math.random() - 0.5) * 1.2,
    });
  }
  elapsed = 0;
}

let resizeTimeout: number;
function resizeCanvas() {
  window.clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(() => {
    cancelAnimationFrame(animationId);
    const canvas = canvasEl.value!;
    const parent = canvas.parentElement!;
    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = Math.max(parent.clientHeight, 420); // 给个最小高度，避免太窄时粒子不明显

    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const isMobile = w < 768;
    initRoses(isMobile ? ROSE_COUNT_MOBILE : ROSE_COUNT_DESKTOP);
    lastTime = 0;
    animationId = requestAnimationFrame(tickCanvas);
  }, 160);
}

function tickCanvas(now: number) {
  if (!lastTime) lastTime = now;
  const dt = (now - lastTime) / 1000;
  lastTime = now;
  elapsed += dt;

  const canvas = canvasEl.value!;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ctx.clearRect(0, 0, w, h);

  // 轻微整体雾层，增强深度（透明度低，避免影响可读性）
  ctx.fillStyle = "rgba(2,8,14,0.08)";
  ctx.fillRect(0, 0, w, h);

  roses.forEach((r) => {
    r.y += r.speed * dt;
    const sway = r.swayAmp * Math.sin(r.phase + elapsed * r.swayFreq);
    const x = r.baseX + sway;
    r.angle += r.angularSpeed * dt;

    if (r.y > h + r.size) {
      r.y = -r.size * 0.6;
      r.baseX = Math.random() * w;
      r.phase = Math.random() * Math.PI * 2;
    }

    if (x > w + r.size || x < -r.size) return;

    // 计算透明度：越远看上去越淡
    const alpha = Math.max(0, Math.min(1, 1 - (r.y / h) * 0.6));

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, r.y);
    ctx.rotate(r.angle);

    if (ROSE_IMG && ROSE_IMG.complete && ROSE_IMG.naturalWidth > 0) {
      // 使用图片绘制，但加上一层冷色调叠加（globalCompositeOperation 简单处理）
      ctx.drawImage(ROSE_IMG, -r.size / 2, -r.size / 2, r.size, r.size);

      // 轻微冷光叠加，提升风格一致性
      ctx.globalCompositeOperation = "lighter";
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r.size);
      grad.addColorStop(0, `rgba(79,233,223,${0.08 * alpha})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(-r.size / 2, -r.size / 2, r.size, r.size);
      ctx.globalCompositeOperation = "source-over";
    }

    ctx.restore();
  });

  animationId = requestAnimationFrame(tickCanvas);
}

// ========== 打字机文案 ==========
// 适合长离风格的副标题（偏长句，已为打字器准备）
const lines = [
  "今汐以韶光为筹，把潮汐的节律折成可行的道路与温柔的诺言。",
  "她在岁轮间低语，用叠层的光把迷惘裁成方向与答复。",
  "以薄雾为帷，以珍珠为灯，她在夜色里为行人点一盏不炽的光。",
  "今汐不急于宣判，她以潮位衡量时机，以韶光测量人心的重。",
  "她把每一次决策看作仪式，既有算筹的锋利，也有海光的抚慰。",
  "在棋盘与潮汐之间，她替后来者把复杂折为一列温柔的指引。",
  "她的教导像潮线，来时平静，去时留下一圈可追寻的印记。",
  "用韶光叠层，她将希望、代价与策略并列，摆成可读的年谱。",
  "当众声喧嚣，她让潮汐的节拍替你筛选重与轻。",
  "她以淡然为铠，用算筹为针，把混乱缝成清晰的脉络。",
  "今汐的温柔不是懦弱，而是在冷静的规划里替你保留回头路。",
  "每一句低语都像拾起的贝壳，里面有过往的答案与下一次的方向。",
  "她把过往炼成韶光，把韶光裁作训言——每一句都有重量。",
  "以潮声为律，她既引导亦守望，像岸边那座静默的灯塔。",
  "在她的盘算里，失去与获得被细致地列出，最后只留下可承受的选择。",
  "她把决策当作施法，落子即定局，余汐为证，静待光回响。",
  "今汐不许轻易言退，她把怯懦化为练习，把练习化为可被依赖的稳定。",
  "她的策略温而不燥，像晨雾里的一缕光，不刺眼却足以看清路。",
  "把别人的犹豫当成棋子，她用沉稳的节拍帮人整理方向与信念。",
  "在潮汐与韶光交汇处，她收集微小的可能，把它们织成能被践行的计划。",
  "她的言辞里藏着年轮的秩序——不炽烈，但足以照亮迷途。",
  "今汐是那种会在深夜为你推演未来，然后把结果放回你手心的存在。",
];

const typed = ref("");
let lineIndex = 0;
let charIndex = 0;
let deleting = false;
let timer: number | null = null;

const TYPING = 120;
const DELETING = 40;
const PAUSE = 1200;

function tick() {
  const cur = lines[lineIndex];
  if (!deleting) {
    typed.value = cur.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex >= cur.length) {
      timer = window.setTimeout(() => {
        deleting = true;
        tick();
      }, PAUSE);
      return;
    }
    timer = window.setTimeout(tick, TYPING);
  } else {
    typed.value = cur.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex <= 0) {
      deleting = false;
      lineIndex = (lineIndex + 1) % lines.length;
      timer = window.setTimeout(tick, 360);
      return;
    }
    timer = window.setTimeout(tick, DELETING);
  }
}

// ========== 背景图片导入与轮播 ==========
const modules = import.meta.glob("@/assets/images1/*.{jpg,png,jpeg,webp}", {
  eager: true,
});
const allSrcs: string[] = Object.values(modules).map((mod: any) => mod.default);

const modules2 = import.meta.glob("@/assets/images2/*.{jpg,png,jpeg,webp}", {
  eager: true,
});
const allSrcs2: string[] = Object.values(modules2).map(
  (mod: any) => mod.default
);

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const randomFive = ref<string[]>(shuffle(allSrcs).slice(0, 5));
const randomFive2 = ref<string[]>(shuffle(allSrcs2).slice(0, 5));

const currentIndex = ref(0);
let Imgtimer: number | undefined;

onMounted(() => {
  timer = window.setTimeout(tick, 420);

  Imgtimer = window.setInterval(() => {
    currentIndex.value =
      (currentIndex.value + 1) % Math.max(1, randomFive.value.length);
  }, 5200);

  const canvas = canvasEl.value!;
  ctx = canvas.getContext("2d")!;

  // 当图片加载或资源就绪后调整 canvas 大小并启动渲染
  ROSE_IMG.onload = () => {
    resizeCanvas();
  };
  // 如果图片已经加载完（缓存情况），也要触发 init
  if (ROSE_IMG.complete && ROSE_IMG.naturalWidth > 0) {
    resizeCanvas();
  }

  window.addEventListener("resize", resizeCanvas);
});

onBeforeUnmount(() => {
  if (Imgtimer) clearInterval(Imgtimer);
  if (timer) window.clearTimeout(timer);

  cancelAnimationFrame(animationId);
  window.removeEventListener("resize", resizeCanvas);
});
</script>

<style lang="scss" scoped>
$bg-deep: #021b20; // 更偏海绿的夜底
$deep-2: #06292a; // 深一点的潮色
$accent-1: #7fe7d6; // 薄雾海绿（主光）
$accent-2: #dffdf9; // 珍珠青（次光）
$muted-text: #eaf9f8; // 极淡冰霜文字
$glass: rgba(160, 225, 210, 0.06);
$soft-warm: rgba(255, 244, 210, 0.03); // 极轻微金边（可选，几乎不可见）

.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(180deg, $bg-deep 0%, $deep-2 70%);
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto,
    "PingFang SC", "Noto Sans CJK SC", sans-serif;
  position: relative;
  overflow: hidden;
  color: $muted-text;

  .rose-canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    pointer-events: none;
    /* 如果画布带光点，可以用珍珠色微弱 glow */
    filter: drop-shadow(0 6px 18px rgba(127, 231, 214, 0.02));
  }

  .carousel {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      /* 更冷更薄的遮罩，使图片更贴合今汐气质 */
      background: linear-gradient(
        180deg,
        rgba(2, 12, 14, 0.22),
        rgba(4, 18, 20, 0.4)
      );
      pointer-events: none;
      z-index: 1;
      mix-blend-mode: soft-light;
    }

    .carousel-image {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transition: opacity 1s ease, transform 10s linear;
      /* 轻微柔化与降低饱和 */
      filter: blur(0.6px) saturate(0.88) contrast(0.98);
      transform: scale(1.04);

      &.active {
        opacity: 1;
        transform: scale(1);
      }
    }
  }

  /* 可在小屏使用第二组竖图，避免裁切失衡 */
  .carousel2 {
    display: none;
  }

  .center {
    position: relative;
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 34px 20px;
    gap: 12px;
    z-index: 3;

    .title {
      z-index: 9;
      font-size: 2rem;
      margin: 0;
      font-weight: 800;
      line-height: 1;
      /* 由暖橙改为今汐的海绿→珍珠渐变 */
      background: linear-gradient(90deg, $accent-1 0%, $accent-2 60%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: $muted-text;
      letter-spacing: 0.4px;
      /* 更柔和的阴影（偏青） */
      text-shadow: 0 8px 28px rgba(21, 80, 78, 0.1),
        0 2px 6px rgba(160, 225, 210, 0.03);
    }

    .subtitle {
      font-size: 1.02rem;
      min-height: 1.6em;
      color: rgba($muted-text, 0.94); /* 保持高可读但偏冷 */
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      z-index: 9;

      .typed {
        display: inline-block;
        letter-spacing: 0.4px;
        font-weight: 600;
        color: rgba($muted-text, 0.96);
      }

      .cursor {
        display: inline-block;
        width: 12px;
        height: 1.05em;
        margin-left: 6px;
        background: linear-gradient(180deg, $accent-1, $accent-2);
        border-radius: 2px;
        /* 使用更细腻的闪烁，匹配今汐 */
        animation: blink 1s steps(1) infinite;
        transform: translateY(2px);
        opacity: 0.95;
        filter: drop-shadow(0 4px 10px rgba(127, 231, 214, 0.05));
      }
    }
  }

  .shore-footer-simple {
    /* 背景与边线改为冷珍珠调 */
    background: linear-gradient(
      180deg,
      rgba(4, 12, 12, 0.7),
      rgba(6, 14, 14, 0.88)
    );
    border-top: 1px solid rgba(160, 225, 210, 0.04); /* 珍珠边线 */
    color: $muted-text;
    font-size: 13px;
    position: relative;
    overflow: visible;

    .inner.container {
      width: min(1100px, 94%);
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .center {
      text-align: center;
      flex: 1 1 auto;

      .slogan {
        /* 标语改为今汐渐变 */
        background: linear-gradient(90deg, $accent-1 0%, $accent-2 60%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline-block;
        line-height: 1;
        font-size: 14px;
        letter-spacing: 0.3px;
        text-shadow: 0 4px 16px rgba(21, 80, 78, 0.08);
      }

      .meta {
        color: rgba($muted-text, 0.68);
        margin-top: 6px;
        font-size: 12px;
      }
    }
  }
}

/* 保持闪烁动画 */
@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* 响应式：移动优先 */
@media (max-width: 720px) {
  .home {
    .carousel1 {
      display: none;
    }
    .carousel2 {
      display: block;
    }

    .center {
      padding: 18px 14px;

      .title {
        font-size: 1.4rem;
      }
      .subtitle {
        font-size: 0.98rem;
      }
    }
  }
}
</style>
