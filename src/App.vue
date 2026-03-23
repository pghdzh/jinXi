<template>
  <div id="app">
    <transition name="fade" v-if="showIntro">
      <div
        class="intro-container"
        @click="skipIntro"
        role="button"
        aria-label="点击进入主页"
      >
        <!-- 背景视频 -->
        <video
          class="video-background"
          :src="videoSrc"
          autoplay
          muted
          loop
          playsinline
          preload="auto"
        ></video>

        <!-- 半透明遮罩，增强文字可读性 -->
        <div class="overlay"></div>

        <div class="intro-content" aria-live="polite">
          <div class="intro-inner">
            <!-- 打字机区域 -->
            <div class="typewriter-wrap">
              <p class="typewriter">
                {{ displayText }}<span class="cursor">|</span>
              </p>
            </div>

            <!-- 进度条（倒计时指示） -->
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: progressWidth + '%' }"
              ></div>
            </div>

            <!-- 点击提示 -->
            <div class="click-hint">
              <span>轻触/点击进入</span>
              <span class="hint-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div v-else>
      <navbar />
      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { RouterView } from "vue-router";
import navbar from "./components/navbar.vue";

const showIntro = ref(true);
const videoSrc = ref("");
const displayText = ref("");

// 随机语句库（今汐主题）
const lines = [
  "薄雾落尽，今汐未眠。",
  "潮声轻叩，岁光应声。",
  "一缕韶光，一声低语，一处归处。",
  "以潮为矩，以光为引，步履自有方向。",
  "汐光微暖，照见未名的誓言。",
  "在潮位与年轮之间，她悄悄定下归期。",
  "把昨日的疑问折给潮汐，让答案慢慢上岸。",
  "珍珠微递，藏着未宣之志。",
  "低语里藏潮汐，潮汐里藏回程。",
  "韶光为笔，潮声为墨，写下一页可行的未来。",
];

// 打字机参数
const typingSpeed = 100; // 每字符间隔 ms
const delayBeforeStart = 200; // 开始打字前延迟
let typingTimer: number | null = null;
let autoHideTimer: number | null = null;

// 进度条控制
const progressWidth = ref(0);
let progressTimer: number | null = null;
const AUTO_HIDE_DURATION = 5000; // 5秒后自动关闭

// 随机选择一句
function pickRandomLine(): string {
  const idx = Math.floor(Math.random() * lines.length);
  return lines[idx];
}

// 打字机效果
function startTyping(line: string) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    displayText.value = line;
    return;
  }

  let i = 0;
  displayText.value = "";
  typingTimer = window.setInterval(() => {
    i++;
    displayText.value = line.slice(0, i);
    if (i >= line.length) {
      if (typingTimer) clearInterval(typingTimer);
      typingTimer = null;
    }
  }, typingSpeed);
}

// 进度条动画
function startProgress() {
  const startTime = Date.now();
  const updateProgress = () => {
    const elapsed = Date.now() - startTime;
    const percent = Math.min(100, (elapsed / AUTO_HIDE_DURATION) * 100);
    progressWidth.value = percent;
    if (percent < 100) {
      progressTimer = requestAnimationFrame(updateProgress);
    } else {
      if (progressTimer) cancelAnimationFrame(progressTimer);
    }
  };
  progressTimer = requestAnimationFrame(updateProgress);
}

// 跳过/关闭欢迎页
function skipIntro() {
  if (typingTimer) clearInterval(typingTimer);
  if (autoHideTimer) clearTimeout(autoHideTimer);
  if (progressTimer) cancelAnimationFrame(progressTimer);
  showIntro.value = false;
}

// 自动关闭
function startAutoHide() {
  autoHideTimer = window.setTimeout(() => {
    skipIntro();
  }, AUTO_HIDE_DURATION);
}

// 视频随机选择（移动端与桌面端不同目录）
function initVideo() {
  const isMobile = window.innerWidth <= 768;
  const folder = isMobile ? "/mp2" : "/mp1";
  // 假设每个文件夹内有 4 个视频（1.mp4, 2.mp4, 3.mp4, 4.mp4）
  const index = Math.floor(Math.random() * 4) + 1;
  videoSrc.value = `${folder}/1 (${index}).mp4`;
}

onMounted(() => {
  initVideo();

  const line = pickRandomLine();
  setTimeout(() => startTyping(line), delayBeforeStart);

  startProgress();
  startAutoHide();
});

onBeforeUnmount(() => {
  if (typingTimer) clearInterval(typingTimer);
  if (autoHideTimer) clearTimeout(autoHideTimer);
  if (progressTimer) cancelAnimationFrame(progressTimer);
});
</script>

<style scoped lang="scss">
#app {
  position: relative;
  min-height: 100vh;
  animation: cursorAnimation 1s infinite step-start;
}

/* 淡入淡出过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.2s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 欢迎页容器 */
.intro-container {
  position: fixed;
  inset: 0;
  background: #021016;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  
  overflow: hidden;
  user-select: none;
}

/* 背景视频 */
.video-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 1;
  filter: blur(0.5px) brightness(0.7);
  transform: scale(1.02);
  transition: opacity 0.3s ease;
  pointer-events: none;
}

/* 半透明遮罩，增强文字对比 */
.overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 40%,
    rgba(2, 16, 22, 0.3) 0%,
    rgba(2, 16, 22, 0.7) 100%
  );
  pointer-events: none;
}

/* 内容区 */
.intro-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1200px;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  animation: contentFadeIn 0.6s ease-out;
}

.intro-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* 打字机区域 */
.typewriter-wrap {
  .typewriter {
    margin: 0;
    font-size: clamp(2rem, 8vw, 4rem);
    font-weight: 700;
    line-height: 1.2;
    background: linear-gradient(135deg, #d7fff6, #7fe7d6);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    text-shadow: 0 0 20px rgba(127, 231, 214, 0.3);
    letter-spacing: 1px;
    white-space: normal;
    word-break: break-word;
  }

  .cursor {
    display: inline-block;
    width: 2px;
    background: #7fe7d6;
    animation: blink 0.8s step-end infinite;
    margin-left: 4px;
    vertical-align: baseline;
    font-weight: 300;
    color: #7fe7d6;
    text-shadow: 0 0 4px #7fe7d6;
  }
}

/* 进度条 */
.progress-bar {
  width: 260px;
  max-width: 70vw;
  height: 2px;
  background: rgba(127, 231, 214, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7fe7d6, #d7fff6);
  border-radius: 2px;
  width: 0%;
  transition: width 0.05s linear;
  box-shadow: 0 0 8px rgba(127, 231, 214, 0.5);
}

/* 点击提示 */
.click-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: rgba(215, 255, 246, 0.7);
  letter-spacing: 1px;
  background: rgba(2, 16, 22, 0.4);
  backdrop-filter: blur(4px);
  padding: 6px 14px;
  border-radius: 40px;
  border: 1px solid rgba(127, 231, 214, 0.2);
  transition: all 0.3s;
  animation: hintPulse 1.8s infinite;

  .hint-arrow {
    font-size: 1rem;
    transition: transform 0.2s;
  }

  &:hover .hint-arrow {
    transform: translateX(4px);
  }
}

/* 动画定义 */
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes contentFadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes hintPulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .intro-inner {
    gap: 1.2rem;
  }
  .typewriter {
    font-size: clamp(1.4rem, 6vw, 2.2rem);
  }
  .progress-bar {
    width: 200px;
  }
  .click-hint {
    font-size: 0.7rem;
    padding: 4px 12px;
  }
}

@media (max-width: 480px) {
  .typewriter {
    font-size: 1.2rem;
  }
  .click-hint span:first-child {
    display: none; // 移动端简化，只显示箭头
  }
  .click-hint .hint-arrow {
    font-size: 1.2rem;
  }
}
</style>
