<template>
  <div class="megumi-message-board" aria-live="polite">
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
    <!-- 半透明顶部标题 -->
    <header class="board-header" role="banner">
      <div class="title-wrap">
        <h1>留言板</h1>
        <span class="title-count">（共{{ count }}条）</span>

        <p class="subtitle">潮声寄语，岁光回响</p>
      </div>
    </header>

    <!-- 留言展示区 -->
    <section class="message-list">
      <transition-group name="msg" tag="div" class="message-list-inner">
        <div v-if="loading" class="skeleton-wrap" key="skeleton">
          <div class="skeleton" v-for="i in 1" :key="i">
            <div class="sk-avatar"></div>
            <div class="sk-lines">
              <div class="sk-line short"></div>
              <div class="sk-line"></div>
            </div>
          </div>
        </div>
        <div
          v-for="(msg, idx) in messages"
          :key="msg.id || msg._tempId || idx"
          class="message-card"
          :data-index="idx"
          tabindex="0"
          role="article"
          :aria-label="`留言来自 ${msg.name || '匿名'}，内容：${msg.content}`"
        >
          <div class="message-meta">
            <div class="left-meta">
              <div class="name-avatar" :title="msg.name || '匿名'">
                {{ getInitial(msg.name) }}
              </div>
              <div class="meta-texts">
                <div class="message-name">{{ msg.name || "匿名" }}</div>
                <div class="message-time">{{ formatTime(msg.created_at) }}</div>
              </div>
            </div>
            <!-- HTML：把 id/class 复制到对应位置 -->
            <div
              class="shouan-icon"
              role="button"
              tabindex="0"
              aria-label="共鸣之晶"
            >
              <!-- 替换用：焰棋徽（aria-hidden） -->
              <svg
                viewBox="0 0 48 48"
                width="36"
                height="36"
                aria-hidden="true"
                focusable="false"
              >
                <!-- 核心：抽象火焰 / 棋子意象（兼具策略与焰） -->
                <g class="ember-core" transform="translate(0,0)">
                  <path
                    d="M24 14 C26 18, 30 20, 28 26 C26 32, 22 34, 24 38 C20 34, 18 30, 20 26 C22 22, 24 20, 24 14 Z"
                  />
                </g>

                <!-- 飞烬 / 星屑 -->
                <g class="ember-sparks" aria-hidden="true">
                  <circle cx="6" cy="10" r="0.95" />
                  <circle cx="42" cy="14" r="0.8" />
                  <circle cx="38" cy="36" r="0.75" />
                  <circle cx="10" cy="34" r="0.7" />
                </g>
              </svg>
            </div>
          </div>

          <p class="message-content">{{ msg.content }}</p>
        </div>
      </transition-group>
    </section>

    <!-- 底部发送区 -->
    <section class="message-form" aria-label="写下你的留言">
      <label class="sr-only" for="mb-name">你的昵称</label>
      <input
        id="mb-name"
        v-model="name"
        type="text"
        placeholder="你的昵称"
        @keydown.enter.prevent
      />

      <label class="sr-only" for="mb-content">留言内容</label>
      <textarea
        id="mb-content"
        v-model="content"
        placeholder="写下你的留言..."
        @keydown.ctrl.enter.prevent="submitMessage"
        @input="autoGrow"
        ref="textareaRef"
      />

      <div class="form-row">
        <div class="hint">按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 快捷发送</div>
        <button @click="submitMessage" :disabled="isSending || !content.trim()">
          <span v-if="!isSending">发送</span>
          <span v-else>发送中…</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onBeforeUnmount } from "vue";
import { getMessageList, createMessage } from "@/api/modules/message";

const messages = ref<any[]>([]);
const count = ref(0);
const name = ref(localStorage.getItem("message_name") || "");
const content = ref("");
const loading = ref(true);
const isSending = ref(false);

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const fetchMessages = async () => {
  loading.value = true;
  try {
    const res = await getMessageList({ page: 1, pageSize: 9999 });
    messages.value = res.data || [];
    count.value = res.pagination.total;
    await nextTick();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const submitMessage = async () => {
  if (!content.value.trim() || isSending.value) return;
  isSending.value = true;
  const payload = { name: name.value || "匿名", content: content.value };
  try {
    localStorage.setItem("message_name", name.value);
    content.value = "";
    await nextTick();
    // 发送请求
    await createMessage(payload);
    // 重新同步列表（更可靠）
    await fetchMessages();
  } catch (err) {
    console.error(err);
  } finally {
    isSending.value = false;
  }
};

const formatTime = (time: string) => {
  if (!time) return "";
  const d = new Date(time);
  // 例如：2025-08-11 15:30
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

const getInitial = (n?: string) => {
  if (!n) return "匿";
  return n.trim().slice(0, 1).toUpperCase();
};

const autoGrow = (e?: Event) => {
  const ta = textareaRef.value;
  if (!ta) return;
  ta.style.height = "auto";
  const h = Math.min(ta.scrollHeight, 220);
  ta.style.height = h + "px";
};

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
  fetchMessages();
  Imgtimer = window.setInterval(() => {
    currentIndex.value =
      (currentIndex.value + 1) % Math.max(1, randomFive.value.length);
  }, 5200);
  nextTick(() => autoGrow());
});

onBeforeUnmount(() => {
  if (Imgtimer) clearInterval(Imgtimer);
});
</script>

<style scoped lang="scss">
$bg-start: #041718; // 深海绿底
$bg-end: #062c2b; // 深潮色
$accent-1: #7fe7d6; // 薄雾海绿（主光）
$accent-2: #dffdf9; // 珍珠青（次光）
$text-main: #eaf9f8; // 正文浅色
$text-muted: rgba(234, 249, 248, 0.78);
$card-bg: rgba(8, 26, 24, 0.46); // 玻璃卡片底
$card-border: rgba(127, 231, 214, 0.06);
$soft-shadow: rgba(3, 10, 10, 0.5);
$inner-glow: rgba(127, 231, 214, 0.03);
$pearl-glow: rgba(127, 231, 214, 0.06);

.megumi-message-board {
  position: relative;
  min-height: 100vh;
  padding-top: 110px;
  display: flex;
  flex-direction: column;
  /* 今汐：深海 -> 珍珠薄雾 */
  background: linear-gradient(180deg, $bg-start 0%, $bg-end 100%);

  font-family: "Noto Sans SC", "Noto Sans", system-ui, -apple-system, "Segoe UI",
    Roboto, Arial;
  color: $text-main;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

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
        rgba(4, 18, 20, 0.24)
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
      filter: blur(0.6px) saturate(0.88) contrast(0.98);
      transform: scale(1.05);

      &.active {
        opacity: 1;
        transform: scale(1);
      }
    }
  }

  .carousel2 {
    display: none;
  }

  /* ---------- 顶部标题（今汐：薄雾玻璃 + 珍珠光） ---------- */
  .board-header {
    position: absolute;
    top: 72px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 32px);
    max-width: 960px;

    padding: 14px 18px;
    border-radius: 14px;
    box-shadow: 0 12px 36px rgba(3, 10, 10, 0.6), inset 0 1px 0 $inner-glow;
    backdrop-filter: blur(6px) saturate(1.02);
    z-index: 6;
    border: 1px solid rgba(127, 231, 214, 0.03);
    background: linear-gradient(
      180deg,
      rgba(10, 24, 22, 0.14),
      rgba(6, 18, 16, 0.16)
    );

    .title-wrap {
      display: flex;
      align-items: center;
      gap: 12px;

      h1 {
        margin: 0;
        font-size: 18px;
        color: $accent-2;
        letter-spacing: 0.4px;
        font-weight: 900;
        text-shadow: 0 2px 12px rgba(10, 80, 74, 0.06);
      }

      .title-count {
        color: rgba($text-main, 0.92);
        font-size: 12px;
        font-weight: 700;
        margin-left: 6px;
      }

      .subtitle {
        margin: 0;
        margin-left: auto;
        color: rgba($text-main, 0.94);
        font-size: 13px;
        font-weight: 600;
        text-shadow: 0 1px 6px rgba(127, 231, 214, 0.02);
      }
    }

    /* 角落的珍珠光斑装饰（低饱和） */
    &::before {
      content: "";
      position: absolute;
      right: 12px;
      top: 8px;
      width: 84px;
      height: 48px;
      background: radial-gradient(
          34px 16px at 20% 40%,
          rgba(127, 231, 214, 0.1),
          transparent 30%
        ),
        radial-gradient(
          40px 20px at 60% 60%,
          rgba(223, 253, 249, 0.06),
          transparent 30%
        );
      filter: blur(6px);
      pointer-events: none;
      z-index: -1;
    }
  }

  /* ---------- 留言列表 ---------- */
  .message-list {
    z-index: 2;
    position: relative;
    flex: 1;
    overflow-y: auto;
    padding: 28px 20px 340px;
    margin-top: 18px;

    .message-list-inner {
      max-width: 960px;
      max-height: 80vh;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
      z-index: 2;
      overflow-y: auto;
    }

    .skeleton-wrap {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .skeleton {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 12px;
        background: linear-gradient(
          180deg,
          rgba(6, 28, 28, 0.28),
          rgba(8, 30, 30, 0.22)
        );
        border-radius: 12px;
        box-shadow: 0 6px 18px rgba(2, 12, 14, 0.5);
        border: 1px solid rgba(127, 231, 214, 0.02);
      }

      .sk-avatar {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: linear-gradient(90deg, $accent-1, $accent-2);
      }

      .sk-lines {
        flex: 1;

        .sk-line {
          height: 10px;
          border-radius: 6px;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.04),
            rgba(200, 255, 245, 0.03)
          );
          margin-bottom: 8px;
        }

        .sk-line.short {
          width: 40%;
        }
      }
    }
  }

  /* ---------- 单条消息卡片（今汐风） ---------- */
  .message-card {
    background: linear-gradient(
      180deg,
      rgba(6, 18, 16, 0.38),
      rgba(8, 20, 18, 0.42)
    );
    border-radius: 14px;
    padding: 14px 16px;
    margin: 6px auto;
    width: calc(100% - 48px);
    max-width: 960px;

    border: 1px solid $card-border;
    transition: transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.32s,
      border-color 0.32s;
    transform-origin: center;
    position: relative;
    z-index: 3;
    overflow: visible;
    box-shadow: 0 12px 36px $soft-shadow, inset 0 1px 0 $inner-glow;

    &::before {
      content: "";
      position: absolute;
      right: 10px;
      top: 8px;
      width: 44px;
      height: 44px;
      background: radial-gradient(
          circle at 30% 30%,
          rgba(127, 231, 214, 0.08),
          transparent 30%
        ),
        radial-gradient(
          circle at 70% 70%,
          rgba(223, 253, 249, 0.04),
          transparent 30%
        );
      filter: blur(4px);
      pointer-events: none;
      border-radius: 8px;
      z-index: 2;
    }

    &:hover {
      transform: translateY(-8px) scale(1.01);
      box-shadow: 0 28px 84px rgba(2, 10, 10, 0.6);
      border-color: rgba(127, 231, 214, 0.1);
      background: linear-gradient(
        180deg,
        rgba(8, 22, 20, 0.52),
        rgba(6, 18, 16, 0.58)
      );
    }

    .message-meta {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 8px;

      .left-meta {
        display: flex;
        gap: 12px;
        align-items: center;

        .name-avatar {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: #042826;
          background: linear-gradient(180deg, $accent-2 0%, $accent-1 60%);
          border: 2px solid rgba(127, 231, 214, 0.04);
          box-shadow: inset 0 -6px 18px rgba(10, 40, 36, 0.06);
          font-size: 16px;
          flex-shrink: 0;
        }

        .meta-texts {
          .message-name {
            font-size: 15px;
            color: $accent-2;
            font-weight: 800;
            line-height: 1;
            text-shadow: 0 3px 8px rgba(6, 40, 36, 0.06);
          }

          .message-time {
            font-size: 12px;
            color: rgba($text-main, 0.78);
            margin-top: 2px;
          }
        }
      }

      /* 右侧：徽章（今汐风替代焰棋） */
      .shouan-icon {
        display: inline-grid;
        place-items: center;
        width: 52px;
        height: 52px;
        border-radius: 12px;
        cursor: pointer;
        user-select: none;
        position: relative;
        z-index: 4;

        background: linear-gradient(
          180deg,
          rgba(4, 10, 10, 0.88),
          rgba(6, 12, 12, 0.94)
        );
        border: 1px solid $card-border;
        box-shadow: 0 8px 30px rgba(3, 10, 10, 0.48), inset 0 1px 0 $inner-glow;
        transition: transform 260ms cubic-bezier(0.2, 0.9, 0.3, 1),
          box-shadow 260ms, background 260ms;
        -webkit-tap-highlight-color: transparent;
        will-change: transform, box-shadow, opacity;

        svg {
          width: 36px;
          height: 36px;
          display: block;
          overflow: visible;
        }

        /* 内部图形（调整为今汐色） */
        .ember-core path {
          fill: $accent-2;
          opacity: 0.12;
          transition: fill 260ms, opacity 260ms, transform 260ms, filter 260ms;
          filter: drop-shadow(0 8px 20px rgba(127, 231, 214, 0.04));
        }

        .ember-sparks circle {
          fill: $accent-1;
          opacity: 0;
          transition: opacity 240ms, transform 360ms;
        }

        &:hover,
        &:focus {
          transform: translateY(-6px) scale(1.04);
          box-shadow: 0 28px 86px rgba(2, 10, 10, 0.6),
            inset 0 1px 0 $inner-glow;
          background: linear-gradient(
            180deg,
            rgba(8, 18, 16, 0.98),
            rgba(6, 14, 12, 0.99)
          );

          .ember-core path {
            opacity: 1;
            transform: scale(1.03);
            fill: $accent-2;
            filter: drop-shadow(0 18px 46px rgba(127, 231, 214, 0.08));
          }

          .ember-sparks circle {
            opacity: 1;

            &:nth-child(1) {
              transform: translate(-4px, -6px) scale(1.4);
            }

            &:nth-child(2) {
              transform: translate(6px, -4px) scale(1.2);
            }

            &:nth-child(3) {
              transform: translate(4px, 6px) scale(1.1);
            }

            &:nth-child(4) {
              transform: translate(-6px, 4px) scale(1.15);
            }
          }
        }

        &:active {
          transform: translateY(-2px) scale(0.99);
        }

        &:focus {
          outline: none;
          box-shadow: 0 28px 86px rgba(2, 10, 10, 0.6),
            0 0 0 6px rgba(127, 231, 214, 0.06);
        }

        &.active {
          .ember-core path {
            opacity: 1;
            animation: corePulse 2000ms ease-in-out infinite;
          }
        }

        /* 动画：浮动 / 核心呼吸 / 星尘上浮 */
        animation: iconFloat 8s ease-in-out infinite;

        .ember-core path {
          animation: coreBreathe 4.6s ease-in-out infinite;
          transform-origin: 50% 50%;
        }
        .ember-sparks circle {
          animation: sparkFloat 1800ms ease-in-out infinite;
        }

        @media (max-width: 480px) {
          width: 44px;
          height: 44px;

          svg {
            width: 30px;
            height: 30px;
          }
        }
      } /* .shouan-icon end */

      /* ============ keyframes（今汐风命名） ============ */
      @keyframes iconFloat {
        0% {
          transform: translateY(0) scale(1);
        }
        40% {
          transform: translateY(-6px) scale(1.015);
        }
        70% {
          transform: translateY(-3px) scale(1.008);
        }
        100% {
          transform: translateY(0) scale(1);
        }
      }

      @keyframes coreBreathe {
        0% {
          transform: scale(1);
          opacity: 0.9;
          filter: drop-shadow(0 6px 18px rgba(127, 231, 214, 0.04));
        }
        50% {
          transform: scale(1.04);
          opacity: 1;
          filter: drop-shadow(0 18px 46px rgba(127, 231, 214, 0.08));
        }
        100% {
          transform: scale(1);
          opacity: 0.9;
          filter: drop-shadow(0 6px 18px rgba(127, 231, 214, 0.04));
        }
      }

      @keyframes sparkFloat {
        0% {
          opacity: 0;
          transform: translateY(0) scale(0.8);
          filter: blur(0);
        }
        35% {
          opacity: 1;
          transform: translateY(-6px) scale(1.15);
          filter: blur(0.2px);
        }
        70% {
          opacity: 0.6;
          transform: translateY(-10px) scale(1.25);
          filter: blur(0.8px);
        }
        100% {
          opacity: 0;
          transform: translateY(-14px) scale(1.35);
          filter: blur(1.6px);
        }
      }

      @keyframes corePulse {
        0% {
          transform: scale(1);
          filter: drop-shadow(0 6px 18px rgba(127, 231, 214, 0.04));
        }
        50% {
          transform: scale(1.06);
          filter: drop-shadow(0 18px 46px rgba(127, 231, 214, 0.08));
        }
        100% {
          transform: scale(1);
          filter: drop-shadow(0 6px 18px rgba(127, 231, 214, 0.04));
        }
      }
    } /* .message-meta end */

    .message-content {
      font-size: 15px;
      color: rgba($text-main, 0.96);
      line-height: 1.7;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
      padding-bottom: 2px;
      letter-spacing: 0.2px;
    }
  } /* .message-card end */

  /* ---------- 固定底部输入区（今汐样式） ---------- */
  .message-form {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: 18px;
    width: calc(100% - 32px);
    max-width: 960px;

    background: linear-gradient(
      180deg,
      rgba(8, 20, 18, 0.9),
      rgba(6, 16, 14, 0.94)
    );
    padding: 14px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 22px 64px rgba(3, 10, 10, 0.78), inset 0 1px 0 $inner-glow;
    z-index: 6;
    border: 1px solid rgba(127, 231, 214, 0.02);
    will-change: transform, opacity;

    input,
    textarea {
      padding: 12px 14px;
      border-radius: 12px;
      border: 1px solid rgba(127, 231, 214, 0.03);
      font-size: 14px;
      outline: none;
      transition: box-shadow 0.18s, border-color 0.18s, background 0.18s,
        transform 0.12s;
      background: linear-gradient(
        180deg,
        rgba(10, 18, 16, 0.6),
        rgba(6, 14, 12, 0.64)
      );
      box-shadow: inset 0 -4px 10px rgba(0, 0, 0, 0.36);
      color: $text-main;
      resize: none;
      -webkit-appearance: none;
      -moz-appearance: none;
    }

    input::placeholder,
    textarea::placeholder {
      color: rgba($text-main, 0.46);
    }

    input:focus,
    textarea:focus {
      border-color: $accent-1;
      box-shadow: 0 10px 30px rgba(127, 231, 214, 0.06),
        inset 0 -6px 12px rgba(0, 0, 0, 0.32);
      background: linear-gradient(
        180deg,
        rgba(12, 22, 20, 0.74),
        rgba(8, 18, 16, 0.72)
      );
      transform: translateY(-1px);
    }

    textarea {
      min-height: 64px;
      max-height: 220px;
      line-height: 1.6;
    }

    .form-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      .hint {
        color: rgba($text-main, 0.86);
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 8px;

        kbd {
          background: rgba(6, 14, 12, 0.78);
          border-radius: 6px;
          padding: 3px 7px;
          border: 1px solid rgba(127, 231, 214, 0.02);
          font-size: 12px;
          box-shadow: inset 0 -2px 6px rgba(0, 0, 0, 0.28);
          color: $accent-2;
          font-weight: 700;
          letter-spacing: 0.6px;
        }
      }

      /* 提交按钮：珍珠渐变 + 低调呼吸 */
      button {
        padding: 10px 18px;
        background: linear-gradient(180deg, $accent-1 0%, $accent-2 60%);
        color: #042826; /* 深色文字以保证对比 */
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 800;
        box-shadow: 0 12px 36px rgba(127, 231, 214, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.02);
        transition: transform 0.14s ease, box-shadow 0.14s ease,
          opacity 0.14s ease;
        will-change: transform, box-shadow;
        display: inline-flex;
        align-items: center;
        gap: 8px;

        &::after {
          content: "";
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: radial-gradient(
            circle at 40% 40%,
            $accent-2 0%,
            $accent-1 40%,
            transparent 60%
          );
          box-shadow: 0 6px 18px rgba(127, 231, 214, 0.06);
        }

        &:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 20px 56px rgba(127, 231, 214, 0.08);
        }

        &:active {
          transform: translateY(-1px) scale(0.995);
        }
      }

      button:disabled {
        opacity: 0.52;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
        background: linear-gradient(
          180deg,
          rgba(10, 14, 12, 0.6),
          rgba(8, 12, 10, 0.6)
        );
        color: rgba(220, 240, 235, 0.6);
      }
    }

    &.pulse {
      animation: formPulse 1200ms ease-in-out 1;
    }
  }

  @keyframes formPulse {
    0% {
      transform: translateX(-50%) scale(1);
      box-shadow: 0 22px 64px rgba(3, 10, 10, 0.78);
    }
    40% {
      transform: translateX(-50%) scale(1.01);
      box-shadow: 0 28px 84px rgba(127, 231, 214, 0.08);
    }
    100% {
      transform: translateX(-50%) scale(1);
      box-shadow: 0 22px 64px rgba(3, 10, 10, 0.78);
    }
  }

  /* ---------- 响应式：移动端收敛 ---------- */
  @media (max-width: 980px) {
    padding-top: 90px;

    .carousel1 {
      display: none;
    }
    .carousel2 {
      display: block;
    }

    .board-header {
      left: 12px;
      transform: none;
      width: calc(100% - 24px);
    }

    .message-list {
      padding: 18px 12px 260px;

      .message-list-inner {
        gap: 12px;
      }
    }

    .message-card {
      width: calc(100% - 28px);
      border-radius: 12px;
      padding: 12px;

      .name-avatar {
        width: 44px;
        height: 44px;
      }
    }

    .message-form {
      left: 12px;
      transform: none;
      width: calc(100% - 24px);
      bottom: 12px;
      padding: 12px;
    }
  }

  /* sr-only（无障碍隐藏） */
  .sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }
}
</style>
