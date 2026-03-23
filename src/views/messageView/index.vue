<template>
  <div class="jinxi-message-board">
    <!-- 动态光效背景 -->
    <div class="dynamic-bg">
      <div class="bg-glow bg-glow-1"></div>
      <div class="bg-glow bg-glow-2"></div>
      <div class="bg-glow bg-glow-3"></div>
      <div class="particle-field">
        <span
          v-for="i in 80"
          :key="i"
          class="particle"
          :style="getParticleStyle(i)"
        ></span>
      </div>
      <div class="wave-overlay"></div>
    </div>

    <div class="board-container">
      <!-- 页眉 -->
      <header class="board-header">
        <div class="title-section">
          <h1>今汐 · 留言板</h1>
          <span class="total-count">共 {{ total }} 条</span>
        </div>
        <p class="subtitle">潮声寄语，岁光回响</p>
      </header>

      <!-- 留言列表 -->
      <section class="message-list" ref="listRef">
        <transition-group name="msg" tag="div" class="message-list-inner">
          <div v-for="msg in messages" :key="msg.id" class="message-card">
            <div class="card-glow"></div>
            <div class="card-meta">
              <div
                class="avatar"
                :style="{ background: getAvatarColor(msg.content) }"
              >
                {{ getInitial(msg.name) }}
              </div>
              <div class="info">
                <div class="name">{{ msg.name || "匿名" }}</div>
                <div class="time">{{ formatTime(msg.created_at) }}</div>
              </div>
              <div class="badge">
                <svg
                  class="tide-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 12C4 10 6 8 8 8C10 8 12 10 14 12C16 14 18 16 20 16C22 16 22 12 22 12"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linecap="round"
                  />
                  <path
                    d="M2 18C4 16 6 14 8 14C10 14 12 16 14 18C16 20 18 22 20 22C22 22 22 18 22 18"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linecap="round"
                  />
                  <circle cx="12" cy="8" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="14" r="1" fill="currentColor" />
                </svg>
              </div>
            </div>
            <div class="content">{{ msg.content }}</div>
            <div class="card-deco"></div>
          </div>
        </transition-group>

        <div ref="sentinel" class="sentinel"></div>
        <div v-if="loadingMore" class="loading-tip">
          <span class="loading-spinner"></span>
          正在聆听更多的愿望...
        </div>
        <div v-if="!hasMore && messages.length > 0" class="end-tip">
          ✨ 已至潮汐尽头 ✨
        </div>
      </section>

      <!-- 底部输入区 -->
      <footer class="message-form">
        <div class="form-row">
          <input
            v-model="name"
            type="text"
            placeholder="你的昵称"
            class="name-input"
            @keydown.enter.prevent
          />
          <div class="textarea-wrap">
            <textarea
              v-model="content"
              placeholder="写下你的留言... (Ctrl+Enter 发送)"
              @keydown.ctrl.enter.prevent="submitMessage"
              @input="autoGrow"
              ref="textareaRef"
            ></textarea>
            <div class="textarea-glow"></div>
          </div>
        </div>
        <div class="form-actions">
          <div class="hint">
            <span class="hint-icon">✨</span>
            每一份心意都会被珍藏
          </div>
          <button
            @click="submitMessage"
            :disabled="submitting || !content.trim()"
          >
            <span v-if="!submitting">发送寄语</span>
            <span v-else>发送中…</span>
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { getMessageList, createMessage } from "@/api/modules/message";

// ---------- 分页状态 ----------
const messages = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = 20;
const hasMore = ref(true);
const loadingMore = ref(false);
const submitting = ref(false);

// 表单数据
const name = ref(localStorage.getItem("message_name") || "");
const content = ref("");
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const listRef = ref<HTMLElement | null>(null);
const sentinel = ref<HTMLElement | null>(null);

let observer: IntersectionObserver | null = null;

// ---------- 辅助函数 ----------
const getInitial = (n?: string) => {
  if (!n) return "匿";
  return n.trim().slice(0, 1).toUpperCase();
};

const getAvatarColor = (name?: string) => {
  const hue = ((name?.length || 0) * 37) % 360;
  return `hsla(${hue}, 80%, 70%, 1)`;
};

const formatTime = (time: string) => {
  if (!time) return "";
  const d = new Date(time);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

const autoGrow = () => {
  const ta = textareaRef.value;
  if (!ta) return;
  ta.style.height = "auto";
  ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
};

// ---------- 加载留言 ----------
const loadMessages = async (reset = false) => {
  if (reset) {
    currentPage.value = 1;
    messages.value = [];
    hasMore.value = true;
  }

  if (!hasMore.value) return;
  if (loadingMore.value) return;

  loadingMore.value = true;
  try {
    const res = await getMessageList({
      page: currentPage.value,
      pageSize,
    });
    const newMessages = res.data || [];
    if (reset) {
      messages.value = newMessages;
    } else {
      messages.value = [...messages.value, ...newMessages];
    }
    total.value = res.pagination?.total || 0;
    const totalPages = res.pagination?.totalPages || 1;
    hasMore.value = currentPage.value < totalPages;
    if (hasMore.value) currentPage.value++;
  } catch (err) {
    console.error("加载留言失败", err);
  } finally {
    loadingMore.value = false;
  }
};

const refreshMessages = async () => {
  currentPage.value = 1;
  messages.value = [];
  hasMore.value = true;
  await loadMessages(false);
};

// ---------- 提交留言 ----------
const submitMessage = async () => {
  if (!content.value.trim() || submitting.value) return;
  submitting.value = true;
  try {
    await createMessage({
      name: name.value || "匿名",
      content: content.value,
    });
    localStorage.setItem("message_name", name.value);
    content.value = "";
    autoGrow();
    await refreshMessages();
    if (listRef.value) {
      listRef.value.scrollTo({ top: 0, behavior: "smooth" });
    }
  } catch (err) {
    console.error("发送失败", err);
  } finally {
    submitting.value = false;
  }
};

// ---------- 无限滚动监听 ----------
const initObserver = () => {
  if (!sentinel.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore.value && !loadingMore.value) {
        loadMessages();
      }
    },
    { threshold: 0.1 }
  );
  observer.observe(sentinel.value);
};

// ---------- 随机粒子样式 ----------
const getParticleStyle = (i: number) => {
  const size = Math.random() * 5 + 1.5;
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const duration = Math.random() * 20 + 12;
  const delay = Math.random() * 10;
  const opacity = Math.random() * 0.4 + 0.2;
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: `${top}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    opacity,
  };
};

// ---------- 生命周期 ----------
onMounted(async () => {
  await loadMessages(true);
  await nextTick();
  initObserver();
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<style scoped lang="scss">
// 今汐主题色 - 提升亮度
$accent: #7fe7d6; // 薄雾海绿
$accent-2: #b0fff2; // 珍珠青 (提亮)
$gold: #f3d48f; // 暖金
$white: #ffffff;
$light-bg: #e2f3f0; // 极浅青白底
$dark-bg: #093238; // 深潮色 (但整体提亮)
$card-bg: rgba(255, 255, 255, 0.12);
$glass-border: rgba(127, 231, 214, 0.35);
$text-light: #f5fffd;
$text-muted: rgba(245, 255, 253, 0.75);
$shadow: 0 12px 28px rgba(0, 0, 0, 0.1),
  0 0 0 1px rgba(127, 231, 214, 0.1) inset;

.jinxi-message-board {
  min-height: 100vh;
  background: linear-gradient(145deg, #08343c 0%, #0a424b 100%);
  color: $text-light;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto,
    "PingFang SC", sans-serif;
  position: relative;
  overflow-x: hidden;
  padding: 80px 24px 120px;

  // 动态背景 (更亮)
  .dynamic-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;

    .bg-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      opacity: 0.25;
      animation: floatGlow 20s infinite alternate;
      &.bg-glow-1 {
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, $accent, transparent);
        top: -20%;
        left: -15%;
        animation-duration: 22s;
      }
      &.bg-glow-2 {
        width: 700px;
        height: 700px;
        background: radial-gradient(circle, $accent-2, transparent);
        bottom: -25%;
        right: -10%;
        animation-duration: 26s;
        animation-delay: -6s;
      }
      &.bg-glow-3 {
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, $gold, transparent);
        top: 40%;
        left: 30%;
        animation-duration: 28s;
        animation-delay: -10s;
      }
    }
    .particle-field {
      position: absolute;
      inset: 0;
      .particle {
        position: absolute;
        background: rgba($accent-2, 0.6);
        border-radius: 50%;
        filter: blur(2px);
        animation: floatParticle linear infinite;
      }
    }
    .wave-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 200px;
      background: linear-gradient(
        180deg,
        transparent,
        rgba(127, 231, 214, 0.05)
      );
      pointer-events: none;
    }
  }

  .board-container {
    position: relative;
    z-index: 2;
    max-width: 1000px;
    margin: 0 auto;
  }

  // 页眉
  .board-header {
    text-align: center;
    margin-bottom: 40px;
    .title-section {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;

      h1 {
        font-size: 2.2rem;
        font-weight: 700;
        margin: 0;
        background: linear-gradient(135deg, $white, $accent-2, $accent);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 15px rgba($accent, 0.3);
      }
      .total-count {
        font-size: 0.9rem;
        background: rgba($accent, 0.2);
        backdrop-filter: blur(4px);
        padding: 4px 12px;
        border-radius: 40px;
        border: 1px solid rgba($accent, 0.4);
      }
    }
    .subtitle {
      margin-top: 12px;
      font-size: 1rem;
      color: $accent-2;
      letter-spacing: 2px;
      font-weight: 300;
    }
  }

  // 留言列表
  .message-list {
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(8px);
    border-radius: 32px;
    border: 1px solid rgba($accent, 0.3);
    padding: 20px;
    max-height: 58vh;
    overflow-y: auto;
    scroll-behavior: smooth;
    margin-bottom: 28px;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-track {
      background: rgba($accent, 0.1);
      border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba($accent, 0.5);
      border-radius: 10px;
    }

    .message-list-inner {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .message-card {
      position: relative;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      padding: 20px;
      transition: all 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      border: 1px solid rgba($accent, 0.2);
      overflow: hidden;
      backdrop-filter: blur(2px);

      &::before {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(
          circle at 0% 0%,
          rgba($accent, 0.08),
          transparent
        );
        opacity: 0;
        transition: opacity 0.4s;
        pointer-events: none;
      }
      &:hover {
        transform: translateY(-6px);
        border-color: rgba($accent, 0.6);
        background: rgba(255, 255, 255, 0.12);
        box-shadow: 0 16px 28px rgba(0, 0, 0, 0.2);
        &::before {
          opacity: 1;
        }
      }

      .card-glow {
        position: absolute;
        top: -50%;
        left: -20%;
        width: 140%;
        height: 140%;
        background: radial-gradient(circle, rgba($accent, 0.05), transparent);
        pointer-events: none;
        transition: opacity 0.3s;
        opacity: 0;
      }
      &:hover .card-glow {
        opacity: 1;
      }

      .card-meta {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 14px;
        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
          background: linear-gradient(135deg, $accent, $accent-2);
          color: $dark-bg;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .info {
          flex: 1;
          .name {
            font-weight: 700;
            color: $accent-2;
            font-size: 1rem;
          }
          .time {
            font-size: 0.7rem;
            color: $text-muted;
            margin-top: 4px;
          }
        }
        .badge {
          .tide-icon {
            width: 28px;
            height: 28px;
            stroke: $accent-2;
            fill: none;
            filter: drop-shadow(0 0 6px $accent);
            transition: all 0.3s;
          }
          &:hover .tide-icon {
            transform: scale(1.1) rotate(5deg);
            stroke: $accent;
          }
        }
      }
      .content {
        font-size: 0.95rem;
        line-height: 1.6;
        color: $text-light;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .card-deco {
        position: absolute;
        bottom: 8px;
        right: 8px;
        width: 40px;
        height: 40px;
        background: radial-gradient(circle, rgba($accent, 0.1), transparent);
        border-radius: 50%;
        pointer-events: none;
      }
    }
  }

  .sentinel {
    height: 4px;
    margin-top: 8px;
  }
  .loading-tip,
  .end-tip {
    text-align: center;
    padding: 24px;
    color: $text-muted;
    font-size: 0.9rem;
  }
  .loading-spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid rgba($accent, 0.3);
    border-top-color: $accent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 10px;
    vertical-align: middle;
  }

  // 底部表单
  .message-form {
    background: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(12px);
    border-radius: 32px;
    border: 1px solid rgba($accent, 0.3);
    padding: 24px;
    transition: all 0.3s;
    &:hover {
      border-color: rgba($accent, 0.5);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
    .form-row {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: 20px;
      .name-input {
        flex: 0 0 150px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba($accent, 0.3);
        border-radius: 40px;
        padding: 12px 18px;
        color: $white;
        font-size: 0.9rem;
        outline: none;
        transition: all 0.2s;
        &:focus {
          border-color: $accent;
          box-shadow: 0 0 12px rgba($accent, 0.3);
        }
      }
      .textarea-wrap {
        flex: 1;
        position: relative;
        textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba($accent, 0.3);
          border-radius: 24px;
          padding: 12px 18px;
          color: $white;
          font-size: 0.9rem;
          resize: none;
          min-height: 80px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
          &:focus {
            border-color: $accent;
            box-shadow: 0 0 12px rgba($accent, 0.3);
          }
        }
        .textarea-glow {
          position: absolute;
          bottom: -2px;
          left: 5%;
          width: 90%;
          height: 4px;
          background: linear-gradient(
            90deg,
            transparent,
            $accent,
            $accent-2,
            transparent
          );
          filter: blur(3px);
          opacity: 0;
          transition: opacity 0.3s;
        }
        textarea:focus + .textarea-glow {
          opacity: 1;
        }
      }
    }
    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .hint {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        color: $text-muted;
        .hint-icon {
          font-size: 1rem;
          animation: pulseSmall 2s infinite;
        }
      }
      button {
        background: linear-gradient(90deg, $accent, $accent-2);
        border: none;
        border-radius: 40px;
        padding: 10px 28px;
        font-weight: 600;
        font-size: 0.9rem;
        color: #08343c;
        cursor: pointer;
        transition: all 0.25s;
        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba($accent, 0.4);
        }
        &:disabled {
          opacity: 0.5;
          animation: cursorAnimation_disabled 1s infinite step-start;
        }
      }
    }
  }

  // 动画
  @keyframes floatGlow {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 0.15;
    }
    100% {
      transform: translate(30px, 20px) scale(1.2);
      opacity: 0.3;
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
      transform: translateY(-100px) translateX(50px);
      opacity: 0;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes pulseSmall {
    0%,
    100% {
      opacity: 0.6;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
  }
  .msg-enter-active,
  .msg-leave-active {
    transition: all 0.3s ease;
  }
  .msg-enter-from {
    opacity: 0;
    transform: translateY(-15px);
  }
  .msg-leave-to {
    opacity: 0;
    transform: translateY(15px);
  }

  @media (max-width: 700px) {
    padding: 70px 16px 100px;
    .board-header .title-section h1 {
      font-size: 1.8rem;
    }
    .message-list {
      padding: 16px;
    }
    .message-form .form-row {
      flex-direction: column;
      .name-input {
        flex: auto;
        width: 100%;
      }
    }
  }
}
</style>
