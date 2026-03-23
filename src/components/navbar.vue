<template>
  <header class="jinxi-header">


    <div class="header-container">
      <!-- 左侧：标题 + BGM -->
      <div class="header-left">
        <div class="title-wrapper">
          <h1 class="title">
            <span class="title-main">今汐</span>
            <span class="title-sub">电子设定集</span>
          </h1>
          <div class="title-decoration">
            <span class="gold-line"></span>
            <span class="pearl-dot"></span>
          </div>
        </div>

        <!-- BGM 控制按钮 -->
        <button
          class="music-toggle"
          :class="{ playing: isMusicPlaying }"
          @click="toggleMusic"
          aria-label="播放/暂停背景音乐"
        >
          <div class="music-icon">
            <svg
              v-if="!isMusicPlaying"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18V5L21 3V13M9 18C9 19.1046 7.88071 20 6.5 20C5.11929 20 4 19.1046 4 18C4 16.8954 5.11929 16 6.5 16C7.88071 16 9 16.8954 9 18ZM21 13C21 14.1046 19.8807 15 18.5 15C17.1193 15 16 14.1046 16 13C16 11.8954 17.1193 11 18.5 11C19.8807 11 21 11.8954 21 13Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
              <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
            </svg>
          </div>
          <div class="music-pulse" v-if="isMusicPlaying"></div>
        </button>
      </div>

      <!-- 中间：在线人数（今州共鸣） -->
      <div class="online-badge" v-if="onlineCount !== null">
        <div class="badge-glow"></div>
    
        <span class="badge-label">今州共鸣</span>
        <span class="badge-count">{{ onlineCount }}</span>
        <span class="badge-unit">人</span>
      </div>

      <!-- 右侧：导航菜单 + 汉堡按钮 -->
      <nav class="nav-wrapper">
        <button
          class="hamburger"
          @click="toggleMobileNav"
          :class="{ open: mobileNavOpen }"
          aria-label="导航菜单"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div class="nav-links" :class="{ 'nav-open': mobileNavOpen }">
          <!-- 主导航项（前5项） -->
          <RouterLink
            v-for="item in mainNavItems"
            :key="item.name"
            :to="item.path"
            class="nav-link"
            active-class="active"
            @click="closeMobileNav"
          >
            {{ item.name }}
          </RouterLink>

          <!-- PC端：下拉菜单“更多” -->
          <div class="dropdown pc-only">
            <button class="dropdown-trigger nav-link">
              更多
              <svg
                class="dropdown-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="dropdown-menu">
              <RouterLink
                v-for="item in moreNavItems"
                :key="item.name"
                :to="item.path"
                class="dropdown-item"
                active-class="active"
                @click="closeMobileNav"
              >
                {{ item.name }}
              </RouterLink>
              <a
                href="https://slty.site/#/redirector"
                target="_blank"
                rel="noopener"
                class="dropdown-item"
                @click="closeMobileNav"
              >
                霜落映界
              </a>
            </div>
          </div>

          <!-- 移动端：剩余所有导航项平铺 -->
          <template v-if="isMobile">
            <RouterLink
              v-for="item in moreNavItems"
              :key="item.name"
              :to="item.path"
              class="nav-link mobile-item"
              active-class="active"
              @click="closeMobileNav"
            >
              {{ item.name }}
            </RouterLink>
            <a
              href="https://slty.site/#/redirector"
              target="_blank"
              rel="noopener"
              class="nav-link mobile-item"
              @click="closeMobileNav"
            >
              霜落映界
            </a>
          </template>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, onUnmounted } from "vue";
import { io } from "socket.io-client";

// 导航配置
const allNavItems = [
  { name: "岁光庭", path: "/" },
  { name: "韶光年谱", path: "/timeLine" },
  { name: "愿辰札记", path: "/message" },
  { name: "晷影典藏", path: "/gallery" },
  { name: "汐语轩", path: "/talk" },
  { name: "流汐低语", path: "/voice" },
  { name: "岁主典籍", path: "/resources" },
  { name: "潮音阁", path: "/music" },
  { name: "文汐台", path: "/wiki" },
];

// 前5项为主导航，其余为更多菜单
const mainNavItems = allNavItems.slice(0, 5);
const moreNavItems = allNavItems.slice(5);

// 移动端检测与响应
const isMobile = ref(false);
const mobileNavOpen = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) mobileNavOpen.value = false;
};
const toggleMobileNav = () => {
  mobileNavOpen.value = !mobileNavOpen.value;
};
const closeMobileNav = () => {
  mobileNavOpen.value = false;
};

// 在线人数（socket.io）
const siteId = "jinXi";
const onlineCount = ref<number | null>(null);
let socket: any;

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
  socket = io(import.meta.env.VITE_API_BASE_URL, { query: { siteId } });
  socket.on("onlineCount", (count: number) => {
    onlineCount.value = count;
  });
});
onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
  if (socket) socket.disconnect();
});

// BGM 控制
const bgmUrl = import.meta.env.VITE_API_BASE_URL + `/music/独坐吟空庭.mp3`;
const isMusicPlaying = ref(false);
let audioElement: HTMLAudioElement | null = null;

function initAudio() {
  if (!audioElement) {
    audioElement = new Audio(bgmUrl);
    audioElement.loop = true;
    audioElement.volume = 0.45;
    audioElement.addEventListener("ended", () => {
      isMusicPlaying.value = false;
    });
  }
}

function toggleMusic() {
  initAudio();
  if (!audioElement) return;
  if (isMusicPlaying.value) {
    audioElement.pause();
    isMusicPlaying.value = false;
  } else {
    audioElement.play().catch((err) => {
      console.warn("BGM 播放失败", err);
      isMusicPlaying.value = false;
    });
    isMusicPlaying.value = true;
  }
}

onBeforeUnmount(() => {
  if (audioElement) {
    audioElement.pause();
    audioElement.src = "";
    audioElement = null;
  }
});
</script>

<style scoped lang="scss">
// ========== 今汐主题变量 ==========
$accent: #7fe7d6;       // 薄雾海绿
$accent2: #d7fff6;      // 珍珠青
$gold: #e6c77c;         // 龙尾金
$white: #f0f6fa;        // 月白
$dark: #0a1115;         // 玄黑底
$glass-bg: rgba(8, 18, 22, 0.68);
$glass-border: rgba(127, 231, 214, 0.2);
$glow: rgba(127, 231, 214, 0.3);

.jinxi-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 80px;
  background: $glass-bg;
  backdrop-filter: blur(2px) saturate(1.4);
  border-bottom: 1px solid $glass-border;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;



  .header-container {
    position: relative;
    height: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  // ========== 左侧区域 ==========
  .header-left {
    display: flex;
    align-items: center;
    gap: 28px;
  }

  .title-wrapper {
    position: relative;
    .title {
      margin: 0;
      font-size: 0;
      line-height: 1;
    }
    .title-main {
      font-size: 28px;
      font-weight: 600;
      background: linear-gradient(135deg, $white 20%, $accent 60%, $accent2 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 2px;
      position: relative;
      display: inline-block;
      margin-right: 8px;
      text-shadow: 0 0 12px rgba($accent, 0.3);
    }
    .title-sub {
      font-size: 16px;
      font-weight: 400;
      color: rgba($white, 0.8);
      letter-spacing: 1px;
      background: none;
      -webkit-text-fill-color: initial;
    }
    .title-decoration {
      position: absolute;
      bottom: -12px;
      left: 0;
      display: flex;
      align-items: center;
      gap: 6px;
      .gold-line {
        width: 40px;
        height: 2px;
        background: linear-gradient(90deg, $gold, transparent);
        border-radius: 2px;
      }
      .pearl-dot {
        width: 4px;
        height: 4px;
        background: $accent2;
        border-radius: 50%;
        box-shadow: 0 0 6px $accent2;
      }
    }
  }

  .music-toggle {
    position: relative;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: rgba($accent, 0.08);
    border: 1px solid rgba($accent, 0.35);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $white;

    .music-icon {
      width: 22px;
      height: 22px;
      svg {
        width: 100%;
        height: 100%;
        stroke: currentColor;
        fill: none;
      }
    }
    .music-pulse {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 1px solid $accent;
      animation: pulseRing 1.5s infinite;
    }
    &:hover {
      background: rgba($accent, 0.2);
      border-color: $accent;
      transform: scale(1.05);
      box-shadow: 0 0 12px $glow;
    }
    &.playing {
      color: $accent;
      border-color: $accent;
      background: rgba($accent, 0.15);
    }
  }

  // ========== 在线人数徽章 ==========
  .online-badge {
    position: relative;
    background: rgba($dark, 0.6);
    backdrop-filter: blur(8px);
    border-radius: 40px;
    padding: 6px 18px 6px 14px;
    border: 1px solid rgba($accent, 0.3);
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    overflow: hidden;
    .badge-glow {
      position: absolute;
      top: 0;
      left: -50%;
      width: 200%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba($accent, 0.2), transparent);
      transform: skewX(-25deg);
      animation: shine 6s infinite;
    }

    .badge-label {
      font-size: 0.8rem;
      color: rgba($white, 0.8);
      letter-spacing: 0.5px;
    }
    .badge-count {
      font-size: 1.3rem;
      font-weight: 700;
      color: $accent;
      text-shadow: 0 0 6px $glow;
      line-height: 1;
    }
    .badge-unit {
      font-size: 0.7rem;
      color: $accent2;
      opacity: 0.9;
    }
    &:hover {
      border-color: $accent;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }
  }

  // ========== 导航区域 ==========
  .nav-wrapper {
    display: flex;
    align-items: center;
  }

  .hamburger {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 28px;
    height: 22px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 20;
    span {
      display: block;
      width: 100%;
      height: 2px;
      background: $white;
      border-radius: 2px;
      transition: all 0.25s ease;
    }
    &.open span:nth-child(1) {
      transform: translateY(10px) rotate(45deg);
    }
    &.open span:nth-child(2) {
      opacity: 0;
    }
    &.open span:nth-child(3) {
      transform: translateY(-10px) rotate(-45deg);
    }
  }

  .nav-links {
    display: flex;
    gap: 28px;
    align-items: center;
    transition: all 0.3s;

    .nav-link {
      position: relative;
      color: $white;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 450;
      padding: 8px 4px;
      transition: all 0.25s;
      cursor: pointer;
      background: none;
      border: none;
      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background: linear-gradient(90deg, $accent, $accent2);
        transition: width 0.3s, left 0.3s;
        transform: translateX(-50%);
        border-radius: 2px;
      }
      &:hover {
        color: $accent;
        transform: translateY(-1px);
        &::after {
          width: 80%;
          left: 50%;
        }
      }
    }
    .active {
      color: $accent;
      &::after {
        width: 70%;
      }
    }

    // 下拉菜单
    .dropdown {
      position: relative;
      .dropdown-trigger {
        display: flex;
        align-items: center;
        gap: 6px;
        .dropdown-arrow {
          width: 12px;
          height: 12px;
          transition: transform 0.2s;
        }
      }
      .dropdown-menu {
        position: absolute;
        top: calc(100% + 12px);
        right: 0;
        min-width: 160px;
        background: rgba(8, 18, 22, 0.96);
        backdrop-filter: blur(20px);
        border-radius: 16px;
        border: 1px solid rgba($accent, 0.3);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3), 0 1px 0 rgba($accent2, 0.1) inset;
        padding: 10px 0;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-12px);
        transition: all 0.25s;
        z-index: 110;
        .dropdown-item {
          display: block;
          padding: 8px 20px;
          color: $white;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.2s;
          white-space: nowrap;
          &:hover {
            background: rgba($accent, 0.12);
            color: $accent;
            padding-left: 26px;
          }
          &.active {
            color: $accent;
            background: rgba($accent, 0.08);
            border-left: 3px solid $accent;
          }
        }
      }
      &:hover .dropdown-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      &:hover .dropdown-arrow {
        transform: rotate(180deg);
      }
    }
  }

  // ========== 响应式 ==========
  @media (max-width: 860px) {
    .header-container {
      padding: 0 24px;
    }
    .title-main {
      font-size: 24px;
    }
    .title-sub {
      font-size: 14px;
    }
    .online-badge {
      padding: 4px 12px;
      .badge-label {
        display: none;
      }
      .badge-count {
        font-size: 1.1rem;
      }
    }
    .nav-links {
      gap: 20px;
      .nav-link {
        font-size: 0.85rem;
      }
    }
  }

  @media (max-width: 768px) {
    height: 70px;
    .hamburger {
      display: flex;
    }
    .nav-links {
      position: fixed;
      top: 70px;
      left: 0;
      right: 0;
      flex-direction: column;
      align-items: stretch;
      background: rgba(6, 14, 18, 0.98);
      backdrop-filter: blur(20px);
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      gap: 0;
      border-top: 1px solid rgba($accent, 0.2);
      box-shadow: 0 20px 30px rgba(0, 0, 0, 0.3);
      &.nav-open {
        max-height: 580px;
      }
      .nav-link {
        padding: 14px 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        width: 100%;
        text-align: left;
        &::after {
          display: none;
        }
        &:hover {
          transform: none;
        }
      }
      .active {
        background: linear-gradient(90deg, rgba($accent, 0.1), transparent);
        border-left: 3px solid $accent;
      }
      .dropdown {
        display: none;
      }
      .mobile-item {
        display: block;
      }
    }
  }
}


@keyframes drift {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(3%, 2%) scale(1.05); }
}
@keyframes shine {
  0% { transform: translateX(-100%) skewX(-25deg); }
  20% { transform: translateX(100%) skewX(-25deg); }
  100% { transform: translateX(100%) skewX(-25deg); }
}
@keyframes pulseRing {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(1.4); opacity: 0; }
}

// 工具类
.pc-only {
  @media (max-width: 768px) {
    display: none;
  }
}
</style>