<template>
  <header class="app-header">
    <h1 class="title">今汐电子设定集</h1>
    <!-- 在线人数展示 -->
    <div class="online-count" v-if="onlineCount !== null">
      当前在线：<span class="count">{{ onlineCount }}人</span>
    </div>
    <!-- 移动端汉堡按钮 -->
    <button
      class="hamburger"
      @click="toggleMobileNav"
      aria-label="Toggle navigation"
    >
      <span :class="{ open: mobileNavOpen }"></span>
      <span :class="{ open: mobileNavOpen }"></span>
      <span :class="{ open: mobileNavOpen }"></span>
    </button>

    <!-- 普通导航 & 移动端下拉导航 -->
    <nav :class="['nav-links', { 'mobile-open': mobileNavOpen }]">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="nav-item"
        active-class="active-link"
        @click="mobileNavOpen = false"
      >
        {{ item.name }}
      </RouterLink>

      <a
        href="http://slty.site/#/redirector"
        target="_blank"
        rel="noopener"
        class="nav-item"
        active-class="active-link"
        @click="mobileNavOpen = false"
      >
        霜落映界
      </a>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { io } from "socket.io-client";

const navItems = [
  { name: "岁光庭", path: "/" }, // 首页 — 岁主/今汐的开场与光之引导
  { name: "韶光年谱", path: "/timeLine" }, // 年谱 — 与韶光、时间相关的纪事
  { name: "愿辰札记", path: "/message" }, // 留言板 — 他人的愿望与寄语处
  { name: "晷影典藏", path: "/gallery" }, // 图集 — 立绘、草稿与时光影像的收藏
  { name: "岁主典籍", path: "/resources" }, // 资料库 — 战术笔记、手稿与设定集
  { name: "流汐低语", path: "/voice" }, // 语音馆 — 今汐的低语、回响与短语录音
  // { name: "晷铭录", path: "/thanks" }, // 致谢/纪念 — 铭记与仪式感的结尾页
];

const mobileNavOpen = ref(false);
function toggleMobileNav() {
  mobileNavOpen.value = !mobileNavOpen.value;
}

const siteId = "jinXi";

const onlineCount = ref<number | null>(null);

// 连接时带上 query.siteId
const socket: any = io("http://36.150.237.25:3000", {
  query: { siteId },
});

onMounted(() => {
  socket.on("onlineCount", (count: number) => {
    onlineCount.value = count;
  });
});

onBeforeUnmount(() => {
  socket.disconnect();
});
</script>

<style scoped lang="scss">
.app-header {
  /* 今汐 - 薄雾潮汐 + 珍珠光 */
  --deep-bg: rgba(8, 20, 26, 0.78); // 夜色基础但更薄、带绿意
  --glass-accent: rgba(160, 225, 210, 0.08); // 珍珠青玻璃感（更柔）
  --accent: #7fe7d6; // 主点光 - 薄雾海绿（清新）
  --accent-2: #d7fff6; // 次级光 - 珍珠青（柔光）
  --muted-text: #eef9fb; // 极淡冰霜文字
  --warm-glow: rgba(255, 238, 180, 0.07); // 极轻微晨金（用作微弱衬光）
  --faint: rgba(127, 231, 214, 0.05); // 微弱韶光背景点

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  /* 背景带一层非常薄的绿调渐变 + 珍珠内光 */
  background: linear-gradient(
    180deg,
    rgba(8, 20, 26, 0.46),
    rgba(10, 24, 28, 0.4)
  );
  backdrop-filter: blur(4px) saturate(1.02);
  box-shadow: 0 6px 28px rgba(6, 12, 14, 0.46),
    0 0 10px var(--glass-accent) inset;
  border-bottom: 1px solid rgba(160, 225, 210, 0.04);
  animation: fadeInDown 0.6s ease-out both;

  /* 标题 - 珍珠光 + 轻晨金衬 */
  .title {
    font-size: 26px;
    font-weight: 700;
    color: var(--muted-text);
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 4px 16px rgba(40, 90, 86, 0.12),
      0 1px 0 rgba(255, 238, 180, 0.02); /* 极轻金边感 */
    transition: transform 0.28s ease, text-shadow 0.28s ease;
    letter-spacing: 0.4px;
    animation: float-slow 9s ease-in-out infinite;

    &:hover {
      transform: translateY(-2px) scale(1.03);
      text-shadow: 0 8px 28px rgba(127, 231, 214, 0.1),
        0 1px 0 rgba(255, 238, 180, 0.04);
    }
  }

  /* 在线人数 / 状态 — 珍珠匣牌风 */
  .online-count {
    position: relative;
    margin-left: 16px;
    padding: 6px 14px;
    font-family: "Cinzel Decorative", serif;
    font-size: 1rem;
    color: var(--muted-text);
    background: linear-gradient(
      135deg,
      rgba(127, 231, 214, 0.02),
      rgba(215, 255, 246, 0.01)
    );
    border: 1px solid rgba(127, 231, 214, 0.1);
    border-radius: 24px;
    backdrop-filter: blur(6px);
    box-shadow: 0 6px 18px rgba(6, 12, 14, 0.42),
      0 0 8px rgba(127, 231, 214, 0.025);
    overflow: hidden;
    cursor: default;
    transition: transform 0.22s ease, box-shadow 0.22s ease;

    &::before {
      content: "";
      position: absolute;
      bottom: -2px;
      left: -40%;
      width: 180%;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        var(--accent-2),
        transparent
      );
      opacity: 0.9;
      filter: blur(5px);
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(6, 12, 14, 0.48),
        0 0 18px rgba(127, 231, 214, 0.06);
    }

    .count {
      display: inline-block;
      margin-left: 6px;
      font-weight: 700;
      color: var(--accent-2);
      background: linear-gradient(90deg, var(--accent), var(--accent-2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 6px rgba(127, 231, 214, 0.04);
    }
  }

  /* 导航链接 — 流光下划调整为更细腻的波纹感 */
  .nav-links {
    display: flex;
    gap: 22px;
    align-items: center;

    .nav-item {
      position: relative;
      color: var(--muted-text);
      font-weight: 500;
      text-decoration: none;
      transition: color 0.22s ease, transform 0.16s ease;
      padding: 6px 4px;
      border-radius: 6px;

      &::after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: -6px;
        width: 0;
        height: 3px;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0),
          var(--accent-2),
          rgba(255, 255, 255, 0)
        );
        transition: width 0.36s cubic-bezier(0.2, 0.9, 0.2, 1),
          left 0.36s cubic-bezier(0.2, 0.9, 0.2, 1), opacity 0.24s;
        transform: translateX(-50%);
        opacity: 0.95;
        border-radius: 3px;
        filter: blur(0.6px);
        background-size: 180% 100%;
        animation: flow 7s linear infinite;
      }

      &:hover {
        color: var(--accent-2);
        transform: translateY(-1.8px);
        text-shadow: 0 0 6px rgba(127, 231, 214, 0.02);
      }

      &:hover::after {
        width: 64%;
        left: 50%;
        opacity: 1;
      }
    }

    .active-link {
      color: var(--accent);
      font-weight: 600;

      &::after {
        width: 92%;
        opacity: 1;
      }
    }
  }

  /* 汉堡按钮（移动） - 线条更柔和 */
  .hamburger {
    display: none;
    flex-direction: column;
    justify-content: space-around;
    width: 28px;
    height: 24px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;

    span {
      display: block;
      width: 100%;
      height: 3px;
      background: rgba(238, 249, 251, 0.9);
      border-radius: 2px;
      transition: transform 0.28s ease, opacity 0.28s ease, background 0.28s;
      box-shadow: 0 2px 6px rgba(8, 16, 18, 0.18);
    }

    span.open:nth-child(1) {
      transform: translateY(10px) rotate(45deg);
    }

    span.open:nth-child(2) {
      opacity: 0;
    }

    span.open:nth-child(3) {
      transform: translateY(-10px) rotate(-45deg);
    }
  }

  @media (max-width: 768px) {
    padding: 0 20px;

    .title {
      display: none;
    }
    .hamburger {
      display: flex;
    }

    .nav-links {
      position: absolute;
      top: 64px;
      left: 0;
      right: 0;
      flex-direction: column;
      background: linear-gradient(
        180deg,
        rgba(10, 24, 28, 0.98),
        rgba(8, 18, 22, 0.995)
      );
      backdrop-filter: blur(10px);
      gap: 0;
      overflow: hidden;
      max-height: 0;
      transition: max-height 0.34s ease;
      border-top: 1px solid rgba(215, 255, 246, 0.035);

      &.mobile-open {
        max-height: 520px;
      }

      .nav-item {
        padding: 14px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      }
    }
  }
}

/* 关键帧保留，略微延长浮动周期以显柔和 */
@keyframes flow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes float-slow {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3.5px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  0% {
    opacity: 0;
    transform: translateY(-8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
