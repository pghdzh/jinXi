<template>
  <div class="chat-page">
    <div class="carousel carousel1" aria-hidden="true">
      <img v-for="(src, idx) in randomFive" :key="idx" :src="src" class="carousel-image"
        :class="{ active: idx === currentIndex }" />
    </div>
    <div class="carousel carousel2" aria-hidden="true">
      <img v-for="(src, idx) in randomFive2" :key="idx" :src="src" class="carousel-image"
        :class="{ active: idx === currentIndex }" />
    </div>

    <div class="chat-container">
      <!-- 统计面板（放在聊天容器顶部） -->
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
          <div v-for="msg in chatLog" :key="msg.id"
            :class="['message', msg.role, { error: msg.isError, egg: msg.isEgg }]">
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
        <!-- 输入框改成 textarea -->
        <textarea v-model="input" placeholder="向长离提问…" :disabled="loading" @keydown="handleKeydown" rows="1"></textarea>

        <!-- 清空按钮 -->
        <div class="btn-group">
          <button type="button" class="clear-btn" @click="clearChat" :disabled="loading" title="清空对话">
            ✖
          </button>
        </div>

        <!-- 发送按钮 -->
        <button type="submit" class="send-btn" :disabled="!input.trim() || loading">
          发送
        </button>

        <!-- 统计数据按钮 -->
        <button type="button" class="Alldetail-btn" @click="showModal = true" title="查看统计">
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

// 本地存储键名
const STORAGE_STATS_KEY = "hui_chat_stats";
const showModal = ref(false);
// Stats 类型声明，确保所有字段都有默认值
interface Stats {
  firstTimestamp: number; // 首次使用时间戳
  totalChats: number; // 总对话次数
  activeDates: string[]; // 有发言的日期列表（yyyy‑mm‑dd）
  dailyChats: Record<string, number>; // 每日对话次数
  currentStreak: number; // 当前连续活跃天数
  longestStreak: number; // 历史最长连续活跃天数

  totalTime: number; // 累计使用时长（毫秒）
}

// 默认值，用于补齐本地存储中可能缺失的字段
const defaultStats: Stats = {
  firstTimestamp: Date.now(),
  totalChats: 0,
  activeDates: [],
  dailyChats: {},
  currentStreak: 0,
  longestStreak: 0,

  totalTime: 0,
};

// 从 localStorage 加载并合并默认值
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

// 保存到 localStorage
function saveStats() {
  localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats));
}

// 更新「活跃天数」及「连续活跃」逻辑
function updateActive(date: string) {
  if (!stats.activeDates.includes(date)) {
    stats.activeDates.push(date);
    updateStreak();
    saveStats(); // 持久化活跃天数变化
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

// 更新「每日对话次数」
function updateDaily(date: string) {
  stats.dailyChats[date] = (stats.dailyChats[date] || 0) + 1;
  saveStats(); // 持久化活跃天数变化
}

// 计算最活跃日
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

// 格式化总使用时长
function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h ? `${h} 小时 ${m} 分钟` : `${m} 分钟`;
}

// —— Vue 响应式状态 ——
const stats = reactive<Stats>(loadStats());
// 会话开始时间，用于计算本次时长
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

const encourageEggs = [
  { file: "audio (0).mp3", text: "局之未终，焰之未熄。世事往往如此，输赢不过一息间。" },
  { file: "audio (1).mp3", text: "若心能如棋般冷静，是否就能不惧别离？" },
  { file: "audio (2).mp3", text: "一子错落，风云便改。可叹世人，总爱求个‘若当初’。" },
  { file: "audio (3).mp3", text: "命运是场漫长的棋，不在快与慢，而在落子的方向。" },
  { file: "audio (4).mp3", text: "别太在意成败了，局外人眼中的输赢，从来都不重要。" },
  { file: "audio (5).mp3", text: "我不是在等你，只是……棋还没落完。" },
  { file: "audio (6).mp3", text: "有时我会想——若当初那一步不落，也许局势就会不同吧。可惜啊，人生的棋盘从不容后悔，落子之后，只能微笑着看它燃成灰烬。" },
  { file: "audio (7).mp3", text: "他们总说我看得太远，其实我只是怕看得太近。太近的情感，会让人忘了自己站在何处。" },
  { file: "audio (8).mp3", text: "每一局的终点，都不只是输赢。有时，是人心的分岔口。" },
  { file: "audio (9).mp3", text: "你也觉得风冷吗？……别怕，靠近一点。焰不会伤人，若你心够静。" },
  { file: "audio (10).mp3", text: "你看着这片海时，会不会也觉得它像我？平静、无波，却藏着所有的光与深渊。" },
  { file: "audio (11).mp3", text: "我不常劝人，但若是你，我希望你能稍微放慢脚步。连焰，也该学会休息。" },
  { file: "audio (12).mp3", text: "我不是在等你，只是在听……听那一声久违的问候，能否再传回来。" },
  { file: "audio (13).mp3", text: "有些话不该说出口，但今晚的风很温柔，也许能替我说完。" },
  { file: "audio (14).mp3", text: "将自身置于棋局，才能算得更远。为此，我愿承受这离火焚身之苦。" },
  { file: "audio (15).mp3", text: "因果循环，终有报偿。昔日种下的‘因’，便由你我今日来见证这‘果’。" },
  { file: "audio (16).mp3", text: "即使燃尽己身，我也会为你照亮前方的长夜。这是我的承诺。" },
  { file: "audio (17).mp3", text: "若有一天我不在了，愿这缕离火，能代替我继续温暖你。" },
  { file: "audio (18).mp3", text: "当烈焰蒙蔽双眼，我反而能‘看’得更清。耳畔的潮音，指尖的颤动，还有……你的心意，都无比明晰。" },
  { file: "audio (19).mp3", text: "偶尔，也会想放下棋局与筹谋，只静静看着庭前的花开花落。这样的时光，有你相伴，似乎也不坏。" },
  { file: "audio (20).mp3", text: "若有一日，我真的燃尽己身，化作点点星火，但愿其中一簇，能永远温暖你的梦境。" }
];



function playVoice(name: string) {
  const audio = new Audio(`/voice/${name}`);
  audio.play().catch((e) => console.warn("音频播放失败：", e));
}

let lastEggTime = 0; // 记录最后一次触发彩蛋的时间戳
let coolDownPeriod = 1 * 60 * 1000; // 冷却1分钟（毫秒）
const triggeredVoices = new Set(JSON.parse(localStorage.getItem('triggeredVoices') || '[]'));

async function sendMessage() {
  if (!input.value.trim()) return;
  if (stats.totalChats === 0 && !localStorage.getItem(STORAGE_STATS_KEY)) {
    stats.firstTimestamp = Date.now();
    saveStats();
  }
  const date = new Date().toISOString().slice(0, 10); // 每次都取最新“今天”
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
    //  throw new Error("测试错误");
    const history = chatLog.value.filter((msg) => !msg.isEgg && !msg.isError);
    const botReply = await sendMessageToHui(userText, history);
    chatLog.value.push({
      id: Date.now() + 1,
      role: "bot",
      text: botReply,
    });

    // —— 鼓励彩蛋：5% 概率触发 ——
    if (Date.now() - lastEggTime > coolDownPeriod && Math.random() < 0.05) {
      // 随机挑一条
      let voiceId = Math.floor(Math.random() * encourageEggs.length)
      const egg = encourageEggs[voiceId];

      // 记录触发过的语音编号
      triggeredVoices.add(voiceId || 0);

      // 保存到 localStorage
      localStorage.setItem('triggeredVoices', JSON.stringify([...triggeredVoices]));

      // 播放对应语音（不带 .mp3 后缀）
      playVoice(egg.file);
      // 推入带标记的彩蛋消息
      chatLog.value.push({
        id: Date.now() + 2,
        role: "bot",
        text: `<p style="color: #d88873; font-style: italic;font-weight: bold">${egg.text}</p>`,
        isEgg: true,
      });
      lastEggTime = Date.now();
    }
    // —— 彩蛋结束 ——
  } catch (e) {
    console.error(e);
    chatLog.value.push({
      id: Date.now() + 2,
      role: "bot",
      text: "API余额耗尽了，去b站提醒我充钱吧",
      isError: true,
    });
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
        text: "焰有尽，而言无终。若你愿听，我便缓缓道来。",
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
      text: "焰有尽，而言无终。若你愿听，我便缓缓道来。",
    },
  ];
}

async function scrollToBottom() {
  await nextTick();
  if (msgList.value) {
    msgList.value.scrollTop = msgList.value.scrollHeight;
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
});
</script>

<style scoped lang="scss">
.chat-page {
  padding-top: 64px;
  min-height: 100vh;
  /* 暗匣底 + 余焰微光 */
  background: linear-gradient(135deg, #ca633e 0%, #a14b2b 100%);
  color: #e8dccf;
  display: flex;
  flex-direction: column;
  font-family: "Noto Sans SC", "PingFang SC", "Helvetica Neue", Arial, sans-serif;

  .carousel {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg,
          rgba(2, 8, 14, 0.15),
          rgba(2, 8, 14, 0.25));
      pointer-events: none;
      z-index: 1;
    }

    .carousel-image {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      filter: blur(0.8px) saturate(0.92);

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



  .chat-container {
    flex: 1;
    width: 900px;
    max-width: calc(100% - 32px);
    margin: 0 auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    z-index: 9;

    .stats-panel {
      display: flex;
      align-items: center;
      background: linear-gradient(180deg, rgba(18, 10, 8, 0.6), rgba(14, 8, 6, 0.56));
      padding: 10px 16px;
      border-radius: 12px;
      font-size: 14px;
      color: #e8dccf;
      justify-content: space-around;
      box-shadow: 0 10px 30px rgba(6, 4, 2, 0.7);
      border: 1px solid rgba(255, 120, 70, 0.04);

      .stat-item {
        .label {
          font-size: 12px;
          color: rgba(232, 220, 207, 0.76);
          margin-bottom: 4px;
        }

        span {
          color: #ffb890;
          font-weight: 700;
          font-size: 15px;
          text-shadow: 0 0 6px rgba(255, 140, 90, 0.06);
        }
      }

      .detail-btn {
        background: transparent;
        border: 1px solid rgba(255, 120, 70, 0.08);
        border-radius: 6px;
        color: #f0d8c2;
        padding: 6px 12px;
        cursor: pointer;
        font-size: 13px;
        transition: background 0.16s ease, box-shadow 0.16s ease, transform 0.12s;

        &:hover {
          background: rgba(255, 120, 70, 0.06);
          box-shadow: 0 10px 26px rgba(255, 120, 70, 0.06);
          transform: translateY(-2px);
        }

        &:focus-visible {
          outline: none;
          box-shadow: 0 0 0 6px rgba(255, 120, 70, 0.04);
        }
      }
    }
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px 0 120px;
    overscroll-behavior: contain;
    scroll-behavior: smooth;
    max-height: 70vh;
  }

  /* 消息气泡（长离风格：暗匣纸质 + 余焰点缀） */
  .message {
    display: flex;
    align-items: flex-start;
    margin-bottom: 14px;
    color: #e8dccf;

    &.user {
      flex-direction: row-reverse;
    }

    &.error .bubble {
      background: linear-gradient(180deg, rgba(76, 30, 26, 0.24), rgba(44, 18, 14, 0.18));
      border: 1px solid rgba(180, 80, 90, 0.18);
      box-shadow: 0 8px 26px rgba(120, 40, 40, 0.08);
    }

    &.egg .bubble {
      border: 1px solid rgba(255, 140, 90, 0.08);
      box-shadow: 0 8px 26px rgba(255, 120, 70, 0.06);
      transition: all 0.3s ease;
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin: 0 10px;
      background-size: cover;
      background-position: center;
      flex-shrink: 0;
      box-shadow: 0 8px 26px rgba(8, 4, 2, 0.6);
      z-index: 10;

      &.bot {
        /* 长离头像（写死路径名，按需替换） */
        background-image: url("@/assets/avatar/changli.png");
        box-shadow: 0 10px 30px rgba(255, 120, 70, 0.08), inset 0 1px 0 rgba(255, 200, 160, 0.02);
        border: 2px solid rgba(255, 255, 255, 0.06);
        transform: scaleX(-1);
      }

      &.user {
        background: linear-gradient(180deg, #2b1208, #3a160a);
        box-shadow: 0 8px 22px rgba(12, 6, 4, 0.6);
        border: 1px solid rgba(255, 120, 70, 0.04);
      }
    }

    .bubble {
      max-width: 78%;
      background: linear-gradient(135deg, rgba(24, 14, 10, 0.96), rgba(18, 10, 8, 0.94));
      border: 1px solid rgba(255, 120, 70, 0.04);
      padding: 14px 16px;
      border-radius: 16px;
      line-height: 1.7;
      word-break: break-word;
      box-shadow: 0 10px 30px rgba(6, 4, 2, 0.6);
      transition: box-shadow 0.18s, transform 0.12s, background 0.12s;
      color: #f6e9db;

      &:hover {
        box-shadow: 0 16px 44px rgba(6, 4, 2, 0.7), 0 0 28px rgba(255, 120, 70, 0.04);
        transform: translateY(-2px);
      }

      &.loading {
        color: rgba(246, 233, 219, 0.85);
        opacity: 0.95;
      }

      /* bot 消息视觉尾巴 */
      .message.bot & {
        border-radius: 16px 16px 16px 6px;
        background: linear-gradient(135deg, rgba(29, 16, 12, 0.98), rgba(25, 12, 10, 0.96));
      }

      /* user 消息右侧尾巴 */
      .message.user & {
        border-radius: 16px 16px 6px 16px;
        background: linear-gradient(135deg, rgba(25, 12, 10, 0.98), rgba(21, 10, 8, 0.96));
      }

      .dots {
        display: inline-flex;
        align-items: center;
        margin-left: 6px;

        .dot {
          opacity: 0;
          font-size: 16px;
          animation: blink 1s infinite;

          &:nth-child(1) {
            animation-delay: 0s;
          }

          &:nth-child(2) {
            animation-delay: 0.2s;
          }

          &:nth-child(3) {
            animation-delay: 0.4s;
          }
        }

        @keyframes blink {

          0%,
          100% {
            opacity: 0;
          }

          50% {
            opacity: 1;
            color: #ffb890;
          }
        }
      }
    }
  }

  /* 输入区：匣式纸张 + 余焰按钮 */
  .input-area {
    position: sticky;
    bottom: 12px;
    display: flex;
    align-items: center;
    background: linear-gradient(180deg, rgba(18, 10, 8, 0.96), rgba(14, 8, 6, 0.96));
    backdrop-filter: blur(6px);
    padding: 12px;
    gap: 10px;
    z-index: 30;
    border-radius: 14px;
    box-shadow: 0 10px 30px rgba(6, 4, 2, 0.72);
    border: 1px solid rgba(255, 120, 70, 0.04);

    textarea {
      flex: 1;
      padding: 10px 14px;
      background: linear-gradient(180deg, rgba(22, 12, 8, 0.92), rgba(18, 10, 8, 0.9));
      border: 1px solid rgba(255, 120, 70, 0.06);
      color: #f6e9db;
      font-size: 15px;
      line-height: 1.45;
      outline: none;
      resize: none;
      overflow: hidden;
      min-height: 48px;
      max-height: 160px;
      border-radius: 10px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
      transition: box-shadow 0.12s, border-color 0.12s;

      &::placeholder {
        color: rgba(246, 232, 219, 0.28);
      }

      &:focus {
        border-color: rgba(255, 140, 90, 0.26);
        box-shadow: 0 0 0 6px rgba(255, 120, 70, 0.04);
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
        border-radius: 10px;
        background: linear-gradient(180deg, rgba(20, 12, 8, 0.6), rgba(14, 8, 6, 0.6));
        color: #f0d8c2;
        cursor: pointer;
        transition: transform 0.12s, box-shadow 0.12s, background 0.12s;
        box-shadow: 0 6px 18px rgba(6, 4, 2, 0.6);

        &:hover {
          transform: translateY(-2px);
          background: rgba(255, 120, 70, 0.04);
        }

        &:active {
          transform: translateY(0);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .clear-btn {
        font-size: 16px;
        line-height: 1;
      }
    }

    .send-btn {
      padding: 0 22px;
      height: 40px;
      border: none;
      border-radius: 20px;
      background: linear-gradient(135deg, #ffb890 0%, #ff8a4a 100%);
      color: #1a0804;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      box-shadow: 0 12px 36px rgba(255, 120, 70, 0.12);
      transition: transform 0.12s, box-shadow 0.18s, filter 0.12s;

      &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 18px 46px rgba(255, 120, 70, 0.16);
        filter: saturate(1.04);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: none;
      }

      &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 6px rgba(255, 120, 70, 0.06);
      }
    }

    .Alldetail-btn {
      display: none;
      margin-left: 4px;
      background: transparent;
      border: 1px solid rgba(255, 120, 70, 0.06);
      border-radius: 6px;
      padding: 6px 10px;
      color: #f0d8c2;
      font-size: 13px;
      cursor: pointer;

      &:hover {
        background: rgba(255, 120, 70, 0.04);
        box-shadow: 0 6px 14px rgba(255, 120, 70, 0.04);
      }
    }
  }

  /* 模态框（暗匣纸页） */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: linear-gradient(180deg, rgba(6, 4, 2, 0.78), rgba(8, 5, 3, 0.9));
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 16px;

    .modal-content {
      width: 360px;
      max-width: 100%;
      background: linear-gradient(180deg, rgba(18, 10, 8, 0.98), rgba(14, 8, 6, 0.98));
      backdrop-filter: blur(6px);
      border-radius: 14px;
      padding: 20px;
      color: #f5e6d9;
      box-shadow: 0 18px 50px rgba(6, 4, 2, 0.8);
      border: 1px solid rgba(255, 120, 70, 0.06);
      animation: fadeInUp 220ms ease;

      &::before {
        content: "☆";
        position: absolute;
        left: 14px;
        top: 10px;
        font-size: 14px;
        color: rgba(255, 140, 90, 0.12);
        pointer-events: none;
      }

      h3 {
        margin: 0 0 12px 0;
        font-size: 18px;
        font-weight: 700;
        text-align: center;
        color: #ffb890;
        padding-bottom: 8px;
        border-bottom: 1px dashed rgba(255, 120, 70, 0.06);
      }

      .detail-list {
        list-style: none;
        padding: 0;
        margin: 12px 0 18px;
        line-height: 1.6;
        font-size: 14px;
        color: #e8dccf;

        li {
          margin-bottom: 8px;
          padding-left: 6px;

          &:nth-child(odd) {
            color: #d8c6b2;
          }

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      .close-btn {
        display: block;
        margin: 0 auto;
        padding: 8px 20px;
        background: linear-gradient(135deg, #ffb890, #ff8a4a);
        color: #1a0804;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 700;
        box-shadow: 0 12px 36px rgba(255, 120, 70, 0.12);
        transition: transform 0.12s ease, box-shadow 0.14s ease;

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 46px rgba(255, 120, 70, 0.16);
        }

        &:active {
          transform: translateY(-1px) scale(0.996);
        }

        &:focus-visible {
          outline: none;
          box-shadow: 0 0 0 6px rgba(255, 120, 70, 0.06);
        }
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.995);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (max-width: 480px) {
      .modal-content {
        width: 100%;
        padding: 16px;
        border-radius: 12px;

        h3 {
          font-size: 16px;
        }

        .close-btn {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
        }
      }
    }
  }

  /* 响应式调整 */
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
