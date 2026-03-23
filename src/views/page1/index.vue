<!-- JinxiHome.vue -->
<template>
  <main class="home-page" role="main">
    <!-- Three.js 背景容器 -->
    <div class="three-dom" ref="threeContainer"></div>

    <!-- CSS 装饰层 -->
    <div class="bg-decor">
      <div class="glow-orb glow-1"></div>
      <div class="glow-orb glow-2"></div>
      <div class="floating-particles">
        <span
          v-for="i in 24"
          :key="i"
          class="particle"
          :style="getParticleStyle(i)"
        ></span>
      </div>
      <div class="grid-overlay"></div>
    </div>

    <!-- 居中内容区 -->
    <section class="center-wrap" aria-live="polite">
      <header class="hero" role="banner">
     
        <h1 class="title">
          <span class="title-main">今汐</span>
         
        </h1>
        <div class="title-glow"></div>
      </header>

      <div class="type-area" role="status" aria-atomic="true">
        <div class="type-box">
          <div class="type-content">
            <span class="typed">{{ displayText }}</span>
            <span class="cursor" aria-hidden="true">▌</span>
          </div>
          <div class="type-border-glow"></div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="site-footer" role="contentinfo">
      <div class="footer-inner">
        <div class="left">
          <small>© {{ new Date().getFullYear() }} 今汐电子设定集</small>
          <span class="dot">•</span>
          <small>制作：霜落天亦</small>
        </div>
      </div>
      <div class="footer-wave"></div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import initJinxiNight from "./initJinxiNight";

const threeContainer = ref<HTMLElement | null>(null);

// 台词数组（今汐风格）
const lines = ref([
  { text: "许愿的倾听者，今州的守望者。" },
  { text: "以我之心，共鸣万物之愿。" },
  { text: "愿以微光，照见你的春天。" },
  { text: "万千愿望，皆是我前行的力量。" },
  { text: "岁主之责，便是为人间带来春天。" },
  { text: "在这里，每个愿望都会被温柔以待。" },
  { text: "从寒冬中走来，为你们守护春光。" },
  { text: "指尖轻触，为你连接万千心愿。" },
]);

const displayText = ref("");
const lineIndex = ref(0);
const charIndex = ref(0);

const TYPING_SPEED = 100;
const DELETING_SPEED = 30;
const PAUSE_AFTER_FULL = 1400;

let typingTimer: number | null = null;
let pauseTimer: number | null = null;

function typeStep() {
  const cur = lines.value[lineIndex.value].text;
  if (charIndex.value <= cur.length) {
    displayText.value = cur.slice(0, charIndex.value);
    charIndex.value++;
    typingTimer = window.setTimeout(typeStep, TYPING_SPEED);
  } else {
    pauseTimer = window.setTimeout(startDeleting, PAUSE_AFTER_FULL);
  }
}

function startDeleting() {
  const cur = lines.value[lineIndex.value].text;
  if (charIndex.value >= 0) {
    displayText.value = cur.slice(0, charIndex.value);
    charIndex.value--;
    typingTimer = window.setTimeout(startDeleting, DELETING_SPEED);
  } else {
    lineIndex.value = (lineIndex.value + 1) % lines.value.length;
    pauseTimer = window.setTimeout(() => {
      charIndex.value = 0;
      typeStep();
    }, 600);
  }
}

let bgCleanup: (() => void) | null = null;

// 随机粒子样式
const getParticleStyle = (i: number) => {
  const size = Math.random() * 3 + 1;
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const duration = Math.random() * 20 + 10;
  const delay = Math.random() * 10;
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: `${top}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  };
};

onMounted(() => {
  if (threeContainer.value) {
    const { cleanup } = initJinxiNight(threeContainer.value);
    bgCleanup = cleanup;
  }

  pauseTimer = window.setTimeout(() => {
    charIndex.value = 0;
    typeStep();
  }, 1000);
});

onUnmounted(() => {
  if (typingTimer) clearTimeout(typingTimer);
  if (pauseTimer) clearTimeout(pauseTimer);
  if (bgCleanup) bgCleanup();
});
</script>

<style scoped lang="scss">
.home-page {
  --bg-1: #021016; // 深色底
  --bg-2: #051c22; // 稍浅潮色
  --accent: #7fe7d6; // 薄雾海绿
  --accent-2: #d7fff6; // 珍珠青
  --gold: #e6c77c; // 龙尾金
  --white: #f0f6fa; // 月白
  --shadow: 0 0 20px rgba(127, 231, 214, 0.15);
  --border-glow: 0 0 8px rgba(127, 231, 214, 0.3);

  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto,
    "PingFang SC", sans-serif;
  color: var(--white);
  background: linear-gradient(
    180deg,
    var(--bg-1) 0%,
    var(--bg-2) 60%,
    #021016 100%
  );
  padding-top: 50px;

  .three-dom {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    background: transparent;
  }

  // CSS 装饰层
  .bg-decor {
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    overflow: hidden;

    .glow-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
      animation: floatGlow 12s infinite alternate;

      &.glow-1 {
        width: 400px;
        height: 400px;
        background: radial-gradient(
          circle,
          rgba(127, 231, 214, 0.4),
          transparent
        );
        top: 10%;
        left: -10%;
        animation-duration: 18s;
      }
      &.glow-2 {
        width: 500px;
        height: 500px;
        background: radial-gradient(
          circle,
          rgba(215, 255, 246, 0.3),
          transparent
        );
        bottom: -20%;
        right: -10%;
        animation-duration: 22s;
        animation-delay: -5s;
      }
    }

    .floating-particles {
      position: absolute;
      inset: 0;
      .particle {
        position: absolute;
        background: rgba(127, 231, 214, 0.4);
        border-radius: 50%;
        filter: blur(2px);
        animation: floatParticle linear infinite;
      }
    }

    .grid-overlay {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(
          rgba(127, 231, 214, 0.03) 1px,
          transparent 1px
        ),
        linear-gradient(90deg, rgba(127, 231, 214, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      mask: radial-gradient(circle at 50% 50%, black 40%, transparent 80%);
    }
  }

  .center-wrap {
    position: relative;
    z-index: 6;
    min-height: calc(100vh - 96px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.2rem 1rem;
    gap: 2rem;
    text-align: center;

    .hero {
      position: relative;
     
      .title {
        margin: 0;
        position: relative;
        .title-main {
          font-size: 4rem;
          font-weight: 800;
          background: linear-gradient(
            135deg,
            var(--white),
            var(--accent-2),
            var(--accent)
          );
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 4px;
          text-shadow: 0 0 20px rgba(127, 231, 214, 0.2);
          animation: titleGlow 3s ease-in-out infinite;
        }
    
      }
      .title-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 120%;
        height: 120%;
        transform: translate(-50%, -50%);
        background: radial-gradient(
          ellipse at center,
          rgba(127, 231, 214, 0.08),
          transparent 70%
        );
        filter: blur(40px);
        pointer-events: none;
      }
    }

    .type-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      width: 100%;
      max-width: 520px;

      .type-box {
        position: relative;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.04),
          rgba(255, 255, 255, 0.01)
        );
        border: 1px solid rgba(127, 231, 214, 0.3);
        padding: 1.4rem 2rem;
        border-radius: 32px;
        backdrop-filter: blur(12px);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5),
          0 0 0 1px rgba(127, 231, 214, 0.2) inset;
        transition: all 0.3s ease;
        width: 100%;

        &:hover {
          border-color: rgba(127, 231, 214, 0.6);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(127, 231, 214, 0.4) inset;
          transform: translateY(-2px);
        }

        .type-content {
          display: flex;
          align-items: baseline;
          gap: 8px;
          .typed {
            font-size: 1.3rem;
            font-weight: 500;
            line-height: 1.5;
            text-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            letter-spacing: 0.5px;
            background: linear-gradient(90deg, var(--white), var(--accent-2));
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .cursor {
            font-size: 1.3rem;
            font-weight: 300;
            color: var(--accent);
            animation: blink 0.8s step-end infinite;
            text-shadow: 0 0 6px var(--accent);
          }
        }

        .type-border-glow {
          position: absolute;
          inset: -1px;
          border-radius: 32px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(127, 231, 214, 0.4),
            rgba(215, 255, 246, 0.4),
            transparent
          );
          opacity: 0;
          transition: opacity 0.4s;
          pointer-events: none;
        }

        &:hover .type-border-glow {
          opacity: 0.6;
          animation: borderFlow 2s linear infinite;
        }
      }

      .enter-btn {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.8rem 1.5rem;
        border-radius: 48px;
        font-weight: 600;
        font-size: 1rem;
        text-decoration: none;
        color: #0a1a1e;
        background: linear-gradient(90deg, var(--accent), var(--accent-2));
        box-shadow: 0 8px 20px rgba(127, 231, 214, 0.3);
        border: none;
        cursor: pointer;
        transition: all 0.25s ease;
        overflow: hidden;
        z-index: 6;
        letter-spacing: 1px;

        .btn-glow {
          position: absolute;
          inset: -4px;
          border-radius: 52px;
          background: radial-gradient(
            ellipse at center,
            rgba(127, 231, 214, 0.5),
            transparent 70%
          );
          filter: blur(12px);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(127, 231, 214, 0.5);
          .btn-glow {
            opacity: 0.8;
          }
        }

        &:active {
          transform: translateY(-1px);
        }
      }
    }
  }

  .site-footer {
    position: relative;
    z-index: 6;
    width: 100%;
    border-top: 1px solid rgba(127, 231, 214, 0.15);
    padding: 1rem;
    margin-top: auto;
    background: linear-gradient(0deg, rgba(2, 16, 22, 0.7), transparent);
    overflow: hidden;

    .footer-wave {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        var(--accent),
        var(--accent-2),
        transparent
      );
      animation: waveMove 4s linear infinite;
    }

    .footer-inner {
      max-width: 980px;
      margin: 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
      color: rgba(240, 246, 250, 0.7);
      font-size: 0.85rem;

      .left {
        display: flex;
        gap: 0.6rem;
        align-items: center;
        backdrop-filter: blur(4px);
        padding: 0 1rem;
      }
      .dot {
        opacity: 0.5;
        margin: 0 0.2rem;
      }
    }
  }

  // 动画定义
  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  @keyframes floatGlow {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 0.2;
    }
    100% {
      transform: translate(30px, 20px) scale(1.2);
      opacity: 0.4;
    }
  }

  @keyframes floatParticle {
    0% {
      transform: translateY(0) translateX(0);
      opacity: 0;
    }
    20% {
      opacity: 0.6;
    }
    80% {
      opacity: 0.6;
    }
    100% {
      transform: translateY(-100px) translateX(40px);
      opacity: 0;
    }
  }

  @keyframes titleGlow {
    0%,
    100% {
      text-shadow: 0 0 5px rgba(127, 231, 214, 0.2);
    }
    50% {
      text-shadow: 0 0 20px rgba(127, 231, 214, 0.5);
    }
  }

  @keyframes pulseDot {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }

  @keyframes borderFlow {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @keyframes waveMove {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  // 响应式
  @media (max-width: 880px) {
    .center-wrap {
      .hero .title {
        .title-main {
          font-size: 4.5rem;
        }
       
      }
      .type-area .type-box {
        padding: 1rem 1.5rem;
        .typed,
        .cursor {
          font-size: 1.1rem;
        }
      }
      .enter-btn {
        padding: 0.6rem 1.2rem;
        font-size: 0.9rem;
      }
    }
  }

  @media (max-width: 480px) {
    .center-wrap {
      min-height: calc(100vh - 100px);
      .hero .title {
        .title-main {
          font-size: 3.8rem;
        }
       
      }
      .type-area .type-box {
        padding: 0.8rem 1rem;
        .typed,
        .cursor {
          font-size: 0.9rem;
        }
      }
      .enter-btn {
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
      }
    }
  }
}
</style>
