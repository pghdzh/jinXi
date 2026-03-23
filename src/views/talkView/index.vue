<template>
  <div class="chat-page">
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

    <div class="chat-container">
      <div class="stats-panel">
        <div class="stat-item">
          总对话次数：<span>{{ stats.totalChats }}</span>
        </div>
        <div class="stat-item">
          首次使用：<span>{{
            new Date(stats.firstTimestamp).toISOString().slice(0, 10)
          }}</span>
        </div>
        <div class="stat-item">
          活跃天数：<span>{{ stats.activeDates.length }}</span> 天
        </div>
        <div class="stat-item">
          今日对话：<span>{{
            stats.dailyChats[new Date().toISOString().slice(0, 10)] || 0
          }}</span>
          次
        </div>
        <button class="detail-btn" @click="showModal = true">全部</button>
      </div>
      <div class="messages" ref="msgList">
        <transition-group name="msg" tag="div">
          <div
            v-for="msg in chatLog"
            :key="msg.id"
            :class="[
              'message',
              msg.role,
              { error: msg.isError, egg: msg.isEgg },
            ]"
          >
            <div class="avatar" :class="msg.role"></div>
            <div class="bubble">
              <div class="content" v-html="msg.text"></div>
            </div>
          </div>
          <div v-if="loading" class="message bot" key="loading">
            <div class="avatar bot"></div>
            <div class="bubble loading">
              正在思考中
              <span class="dots">
                <span class="dot">.</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
              </span>
            </div>
          </div>
        </transition-group>
      </div>
      <form class="input-area" @submit.prevent="sendMessage">
        <textarea
          v-model="input"
          placeholder="向今汐提问…"
          :disabled="loading"
          @keydown="handleKeydown"
          rows="1"
        ></textarea>

        <div class="btn-group">
          <button
            type="button"
            class="clear-btn"
            @click="clearChat"
            :disabled="loading"
            title="清空对话"
          >
            ✖
          </button>
        </div>
        <button
          type="button"
          class="copy-btn"
          :disabled="!chatLog.length || loading"
          @click="() => copyChat()"
        >
          {{ copyButtonText }}
        </button>
        <button
          type="submit"
          class="send-btn"
          :disabled="!input.trim() || loading"
        >
          发送
        </button>

        <button
          type="button"
          class="Alldetail-btn"
          @click="showModal = true"
          title="查看统计"
        >
          统计数据
        </button>
      </form>
    </div>

    <!-- 详细统计弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <h3>详细统计</h3>
        <ul class="detail-list">
          <li>总对话次数：{{ stats.totalChats }}</li>
          <li>
            首次使用：{{
              new Date(stats.firstTimestamp).toISOString().slice(0, 10)
            }}
          </li>
          <li>活跃天数：{{ stats.activeDates.length }} 天</li>
          <li>
            今日对话：{{
              stats.dailyChats[new Date().toISOString().slice(0, 10)] || 0
            }}
            次
          </li>
          <li>总使用时长：{{ formatDuration(stats.totalTime) }}</li>
          <li>当前连续活跃：{{ stats.currentStreak }} 天</li>
          <li>最长连续活跃：{{ stats.longestStreak }} 天</li>
          <li>
            最活跃日：{{ mostActiveDayComputed }} （{{
              stats.dailyChats[mostActiveDayComputed] || 0
            }}
            次）
          </li>
        </ul>
        <button class="close-btn" @click="showModal = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  reactive,
  ref,
  computed,
  onMounted,
  nextTick,
  watch,
  onBeforeUnmount,
} from "vue";
import { sendMessageToHui } from "@/api/deepseekApi";

const STORAGE_KEY = "hui_chat_log";
const STORAGE_STATS_KEY = "hui_chat_stats";
const showModal = ref(false);

interface Stats {
  firstTimestamp: number;
  totalChats: number;
  activeDates: string[];
  dailyChats: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
  totalTime: number;
}

const defaultStats: Stats = {
  firstTimestamp: Date.now(),
  totalChats: 0,
  activeDates: [],
  dailyChats: {},
  currentStreak: 0,
  longestStreak: 0,
  totalTime: 0,
};

function loadStats(): Stats {
  const saved = localStorage.getItem(STORAGE_STATS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...defaultStats, ...parsed };
    } catch {
      console.warn("加载统计数据失败，使用默认值");
    }
  }
  return { ...defaultStats };
}

function saveStats() {
  localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats));
}

function updateActive(date: string) {
  if (!stats.activeDates.includes(date)) {
    stats.activeDates.push(date);
    updateStreak();
    saveStats();
  }
}
function updateStreak() {
  const dates = [...stats.activeDates].sort();
  let curr = 0,
    max = stats.longestStreak,
    prevTs = 0;
  const todayStr = new Date().toISOString().slice(0, 10);
  dates.forEach((d) => {
    const ts = new Date(d).getTime();
    if (prevTs && ts - prevTs === 86400000) curr++;
    else curr = 1;
    max = Math.max(max, curr);
    prevTs = ts;
  });
  stats.currentStreak = dates[dates.length - 1] === todayStr ? curr : 0;
  stats.longestStreak = max;
  saveStats();
}

function updateDaily(date: string) {
  stats.dailyChats[date] = (stats.dailyChats[date] || 0) + 1;
  saveStats();
}

const mostActiveDayComputed = computed(() => {
  let day = "",
    max = 0;
  for (const [d, c] of Object.entries(stats.dailyChats)) {
    if (c > max) {
      max = c;
      day = d;
    }
  }
  return day || new Date().toISOString().slice(0, 10);
});

function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h ? `${h} 小时 ${m} 分钟` : `${m} 分钟`;
}

const stats = reactive<Stats>(loadStats());
const sessionStart = Date.now();

interface ChatMsg {
  id: number;
  role: "user" | "bot";
  text: string;
  isError?: boolean;
  isEgg?: boolean;
}

const chatLog = ref<ChatMsg[]>(loadChatLog());
const input = ref("");
const loading = ref(false);
const msgList = ref<HTMLElement>();

async function sendMessage() {
  if (!input.value.trim()) return;
  if (stats.totalChats === 0 && !localStorage.getItem(STORAGE_STATS_KEY)) {
    stats.firstTimestamp = Date.now();
    saveStats();
  }
  const date = new Date().toISOString().slice(0, 10);
  stats.totalChats++;
  updateActive(date);
  updateDaily(date);
  saveStats();

  const userText = input.value;
  chatLog.value.push({
    id: Date.now(),
    role: "user",
    text: userText,
  });
  input.value = "";
  loading.value = true;

  try {
    const history = chatLog.value.filter((msg) => !msg.isEgg && !msg.isError);
    const botReply = await sendMessageToHui(userText, history);
    if (botReply == "error") {
      chatLog.value.push({
        id: Date.now() + 2,
        role: "bot",
        text: "API余额耗尽了，去b站提醒我充钱吧",
        isError: true,
      });
    } else {
      chatLog.value.push({
        id: Date.now() + 1,
        role: "bot",
        text: botReply,
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") sendMessage();
}

function clearChat() {
  if (confirm("确定要清空全部对话吗？")) {
    chatLog.value = [
      {
        id: Date.now(),
        role: "bot",
        text: "今令尹，今汐。我会尽我所能，让今州的每一个人过好当下的每一天。",
      },
    ];
    localStorage.removeItem(STORAGE_KEY);
  }
}

function loadChatLog(): ChatMsg[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("chatLog 解析失败：", e);
    }
  }
  return [
    {
      id: Date.now(),
      role: "bot",
      text: "今令尹，今汐。我会尽我所能，让今州的每一个人过好当下的每一天。",
    },
  ];
}

async function scrollToBottom() {
  await nextTick();
  if (msgList.value) {
    msgList.value.scrollTop = msgList.value.scrollHeight;
  }
}

const copyButtonText = ref("复制");
let _copyTimer: number | null = null;

function stripHtml(html = ""): string {
  if (typeof document === "undefined") {
    return html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
  }
  const div = document.createElement("div");
  const withBreaks = String(html).replace(/<br\s*\/?>/gi, "\n");
  div.innerHTML = withBreaks;
  return div.textContent || div.innerText || "";
}

function buildChatPlainText(): string {
  return chatLog.value
    .map((msg) => {
      const time = new Date(msg.id).toLocaleString();
      const who = msg.role === "user" ? "你" : "今汐";
      const text = stripHtml(msg.text);
      return `[${time}] ${who}: ${text}`;
    })
    .join("\n\n");
}

function fallbackCopyText(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!ok) throw new Error("execCommand copy failed");
}

async function copyChat() {
  const text = buildChatPlainText();
  if (!text) {
    copyButtonText.value = "无内容可复制";
    clearTimeout(_copyTimer as number);
    _copyTimer = window.setTimeout(() => (copyButtonText.value = "复制"), 1600);
    return;
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopyText(text);
    }
    copyButtonText.value = "已复制";
  } catch (err) {
    try {
      fallbackCopyText(text);
      copyButtonText.value = "已复制";
    } catch (e) {
      console.error("复制失败：", e);
      copyButtonText.value = "复制失败";
    }
  } finally {
    clearTimeout(_copyTimer as number);
    _copyTimer = window.setTimeout(() => (copyButtonText.value = "复制"), 1600);
  }
}

watch(
  chatLog,
  async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatLog.value));
    await scrollToBottom();
  },
  { deep: true }
);

function handleBeforeUnload() {
  stats.totalTime += Date.now() - sessionStart;
  saveStats();
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
  scrollToBottom();
  window.addEventListener("beforeunload", handleBeforeUnload);
  Imgtimer = window.setInterval(() => {
    currentIndex.value =
      (currentIndex.value + 1) % Math.max(1, randomFive.value.length);
  }, 5200);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
  if (Imgtimer) clearInterval(Imgtimer);
  if (_copyTimer) clearTimeout(_copyTimer);
});
</script>

<style scoped lang="scss">
// 今汐主题色
$accent: #7fe7d6; // 薄雾海绿
$accent-2: #d7fff6; // 珍珠青
$gold: #e6c77c; // 龙尾金
$white: #f0f6fa; // 月白
$dark: #021016; // 玄黑底
$card-bg: rgba(8, 22, 26, 0.65);
$glass-border: rgba(127, 231, 214, 0.25);
$text-light: #f5fffd;
$text-muted: rgba(245, 255, 253, 0.7);

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes floatGlow {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.1;
  }
  100% {
    transform: translate(40px, 30px) scale(1.2);
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
@keyframes blink {
  0%,
  100% {
    opacity: 0;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-4px);
    color: $accent;
  }
}

.chat-page {
  padding-top: 64px;
  min-height: 100vh;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto,
    "PingFang SC", sans-serif;
  color: $text-light;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, $dark 0%, #06242a 100%);
  position: relative;
  overflow-x: hidden;

  .carousel {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg,
        rgba(2, 12, 14, 0.12),
        rgba(2, 12, 14, 0.28)
      );
      pointer-events: none;
      z-index: 1;
      mix-blend-mode: multiply;
    }

    .carousel-image {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      filter: blur(0.8px) saturate(0.98) contrast(0.96);
      transition: opacity 560ms ease,
        transform 760ms cubic-bezier(0.2, 0.9, 0.2, 1);

      &.active {
        opacity: 1;
        transform: scale(1);
      }
    }
  }

  .carousel2 {
    display: none;
  }

  .chat-container {
    flex: 1;
    width: 920px;
    max-width: calc(100% - 32px);
    margin: 0 auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    z-index: 9;
    position: relative;
  }

  .stats-panel {
    display: flex;
    align-items: center;
    background: $card-bg;
    backdrop-filter: blur(12px);
    padding: 10px 16px;
    border-radius: 28px;
    font-size: 14px;
    color: $text-light;
    justify-content: space-around;
    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.3);
    border: 1px solid $glass-border;

    .stat-item {
      span {
        color: $accent-2;
        font-weight: 700;
        font-size: 15px;
        text-shadow: 0 0 6px rgba($accent-2, 0.3);
      }
    }

    .detail-btn {
      background: transparent;
      border: 1px solid $glass-border;
      border-radius: 40px;
      color: $text-light;
      padding: 6px 14px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;

      &:hover {
        background: rgba($accent, 0.1);
        transform: translateY(-2px);
        border-color: $accent;
      }
    }
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px 0 140px;
    overscroll-behavior: contain;
    scroll-behavior: smooth;
    max-height: 72vh;
    z-index: 6;
  }

  .message {
    display: flex;
    align-items: flex-start;
    margin-bottom: 14px;
    color: $text-light;
    position: relative;

    &.user {
      flex-direction: row-reverse;
    }

    &.error .bubble {
      background: rgba(90, 30, 40, 0.2);
      border: 1px solid rgba(200, 60, 70, 0.3);
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin: 0 10px;
      background-size: cover;
      background-position: center;
      flex-shrink: 0;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba($accent-2, 0.3);
      background-clip: padding-box;

      &.bot {
        background-image: url("@/assets/avatar/changli.png");
        border: 2px solid rgba($accent, 0.5);
        transform: scaleX(-1);
      }

      &.user {
        background: linear-gradient(135deg, $accent, $accent-2);
        border: none;
      }
    }

    .bubble {
      max-width: 78%;
      background: $card-bg;
      backdrop-filter: blur(8px);
      border: 1px solid $glass-border;
      padding: 14px 16px;
      border-radius: 20px;
      line-height: 1.7;
      word-break: break-word;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      transition: all 0.2s;
      color: $text-light;
      position: relative;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
        border-color: rgba($accent, 0.5);
      }

      &.loading {
        opacity: 0.9;
      }

      .message.bot & {
        border-radius: 20px 20px 20px 8px;
      }
      .message.user & {
        border-radius: 20px 20px 8px 20px;
      }

      .dots {
        display: inline-flex;
        align-items: center;
        margin-left: 6px;

        .dot {
          opacity: 0;
          font-size: 16px;
          animation: blink 1s infinite;
          color: $accent-2;

          &:nth-child(1) {
            animation-delay: 0s;
          }
          &:nth-child(2) {
            animation-delay: 0.18s;
          }
          &:nth-child(3) {
            animation-delay: 0.36s;
          }
        }
      }
    }
  }

  .input-area {
    position: sticky;
    bottom: 12px;
    display: flex;
    align-items: center;
    background: $card-bg;
    backdrop-filter: blur(12px);
    padding: 12px;
    gap: 12px;
    z-index: 30;
    border-radius: 28px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
    border: 1px solid $glass-border;

    textarea {
      flex: 1;
      padding: 12px 16px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid $glass-border;
      color: $text-light;
      font-size: 15px;
      line-height: 1.45;
      outline: none;
      resize: none;
      overflow: hidden;
      min-height: 48px;
      max-height: 160px;
      border-radius: 40px;
      transition: all 0.2s;

      &::placeholder {
        color: $text-muted;
      }

      &:focus {
        border-color: $accent;
        box-shadow: 0 0 12px rgba($accent, 0.2);
      }
    }

    .btn-group {
      display: flex;
      gap: 8px;

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        padding: 0;
        border: none;
        border-radius: 40px;
        background: rgba(0, 0, 0, 0.3);
        color: $text-light;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid $glass-border;

        &:hover:not(:disabled) {
          background: rgba($accent, 0.1);
          transform: translateY(-2px);
          border-color: $accent;
        }

        &:disabled {
          opacity: 0.5;
          animation: cursorAnimation_disabled 1s infinite step-start;
        }
      }

      .clear-btn {
        font-size: 16px;
      }
    }

    .copy-btn {
      padding: 0 18px;
      height: 40px;
      border-radius: 40px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid $glass-border;
      color: $text-light;
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: rgba($accent, 0.1);
        transform: translateY(-2px);
        border-color: $accent;
      }

      &:disabled {
        opacity: 0.5;
        animation: cursorAnimation_disabled 1s infinite step-start;
      }
    }

    .send-btn {
      padding: 0 22px;
      height: 40px;
      border: none;
      border-radius: 40px;
      background: linear-gradient(90deg, $accent, $accent-2);
      color: $dark;
      font-weight: 800;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba($accent, 0.3);
      }

      &:disabled {
        opacity: 0.5;
        animation: cursorAnimation_disabled 1s infinite step-start;
      }
    }

    .Alldetail-btn {
      display: none;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid $glass-border;
      border-radius: 40px;
      padding: 0 14px;
      height: 40px;
      color: $text-light;
      font-size: 13px;
      cursor: pointer;

      &:hover {
        background: rgba($accent, 0.1);
        border-color: $accent;
      }
    }
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(2, 16, 22, 0.85);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 16px;

    .modal-content {
      width: 380px;
      max-width: 100%;
      background: $card-bg;
      backdrop-filter: blur(12px);
      border-radius: 28px;
      padding: 24px;
      color: $text-light;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      border: 1px solid $glass-border;
      animation: fadeInUp 0.3s ease;

      h3 {
        margin: 0 0 16px;
        font-size: 1.4rem;
        text-align: center;
        background: linear-gradient(90deg, $accent-2, $white);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .detail-list {
        list-style: none;
        padding: 0;
        margin: 16px 0;
        line-height: 1.6;
        font-size: 0.9rem;

        li {
          margin-bottom: 8px;
          padding: 4px 8px;
          border-bottom: 1px dashed rgba($accent, 0.2);
        }
      }

      .close-btn {
        display: block;
        margin: 0 auto;
        padding: 10px 28px;
        background: linear-gradient(90deg, $accent, $accent-2);
        color: $dark;
        border: none;
        border-radius: 40px;
        cursor: pointer;
        font-weight: 700;
        transition: all 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba($accent, 0.3);
        }
      }
    }
  }

  @media (max-width: 768px) {
    .chat-container {
      width: 100%;
      padding: 12px;
      padding-top: 20px;

      .carousel1 {
        display: none;
      }
      .carousel2 {
        display: block;
      }
      .stats-panel {
        display: none;
      }
    }

    .bubble {
      padding: 10px 12px;
      font-size: 14px;
      max-width: 86%;
    }

    .avatar {
      width: 36px;
      height: 36px;
    }

    .input-area {
      flex-direction: column;
      align-items: stretch;

      textarea {
        width: 100%;
      }
      button {
        width: 100%;
      }
      .Alldetail-btn {
        display: block;
      }
    }
  }
}
</style>
