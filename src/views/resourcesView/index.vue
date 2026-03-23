<template>
  <div class="jinxi-resources">


    <!-- 背景轮播 -->
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

    <header class="hero">
      <div class="hero-inner">
        <h1>今汐 · 资源分享</h1>
        <p class="subtitle">
          潮声寄愿，岁光藏珍 —— 可自由上传关于今汐的相关链接
        </p>
      </div>
    </header>

    <main class="container">
      <section class="uploader" :class="{ collapsed: uploaderCollapsed }">
        <div class="uploader-head">
          <button
            class="toggle"
            @click="toggleUploader"
            :aria-expanded="!uploaderCollapsed"
          >
            <span v-if="uploaderCollapsed">展开上传区</span>
            <span v-else>收起上传区</span>
          </button>
        </div>

        <form
          @submit.prevent="addResource"
          class="upload-form"
          :aria-hidden="uploaderCollapsed"
        >
          <div class="row">
            <input
              v-model="form.title"
              type="text"
              placeholder="标题（必填，若有解压码等请一并注明）"
              aria-label="标题"
            />
            <input
              v-model="form.type"
              type="text"
              placeholder="链接类型（网页/网盘/B站等）"
              aria-label="类型"
            />
          </div>
          <div class="row">
            <input
              v-model="form.uploader"
              type="text"
              placeholder="上传人（可选）"
              aria-label="上传人"
            />
            <input
              v-model="form.link"
              type="url"
              placeholder="链接（须以 https:// 开头）"
              aria-label="链接"
            />
          </div>
          <div class="actions">
            <button type="submit" class="btn primary">上传</button>
          </div>
        </form>
      </section>

      <section class="list">
        <div class="list-header">
          <h2>
            资源列表 <span class="count">（{{ resources.length }}）</span>
          </h2>
          <div class="sort">
            <label>
              排序：
              <select v-model="sortBy">
                <option value="time">按时间（新→旧）</option>
                <option value="likes">按点赞（高→低）</option>
              </select>
            </label>
          </div>
        </div>

        <ul class="items">
          <li v-for="item in sortedResources" :key="item.id" class="item">
            <a
              :href="item.link"
              target="_blank"
              rel="noopener noreferrer"
              class="title"
              >{{ item.title }}</a
            >
            <div class="meta">
              <div class="left">
                <span class="uploader">{{ item.uploader || "匿名" }}</span>
                <span class="dot">•</span>
                <time :datetime="item.time">{{ formatTime(item.time) }}</time>
              </div>
              <div class="right">
                <button
                  @click.prevent="handleLike(item)"
                  :aria-pressed="likedIds.has(String(item.id))"
                  class="like-btn"
                  :class="{ active: likedIds.has(String(item.id)) }"
                >
                  <svg
                    class="heart-icon"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z"
                      :fill="
                        likedIds.has(String(item.id))
                          ? '#ff6b6b'
                          : 'rgba(215, 255, 246, 0.5)'
                      "
                    />
                  </svg>
                  <span class="count">{{ item.likes }}</span>
                </button>
                <span class="badge">{{ item.type }}</span>
              </div>
            </div>
          </li>
        </ul>
        <p v-if="resources.length === 0" class="empty">
          ✨ 暂无资源，来上传第一条吧 ✨
        </p>
      </section>
    </main>

    <footer class="foot">提示：点击标题直接跳转，愿这份珍藏如潮汐般长明</footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import {
  getResourceList,
  createResource,
  likeResource,
} from "@/api/modules/resource";
import { ElMessage } from "element-plus";

interface Resource {
  id: number | string;
  title: string;
  uploader?: string;
  time: string;
  likes: number;
  link: string;
  type: string;
  role_key?: string;
}

const STORAGE_KEY = "jinXi_resources_v1";
const DEFAULT_ROLE = "jinXi";

const form = ref({
  title: "",
  uploader: "",
  link: "",
  type: "",
});

const resources = ref<Resource[]>([]);
const likedIds = ref(new Set<string>());
const sortBy = ref<"time" | "likes">("time");
const uploaderCollapsed = ref(false);

function mapServerToLocal(row: any): Resource {
  return {
    id: row.id,
    title: row.title,
    uploader: row.uploader || "匿名",
    time: row.created_at || row.time || new Date().toISOString(),
    likes: row.likes ?? 0,
    link: row.link,
    type: row.storage_type || row.type || "other",
    role_key: row.role_key,
  };
}

async function loadResources() {
  try {
    const res: any = await getResourceList({
      role_key: DEFAULT_ROLE,
      page: 1,
      pageSize: 999,
    });
    if (res && res.success && Array.isArray(res.data)) {
      resources.value = res.data.map(mapServerToLocal);
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.liked && Array.isArray(parsed.liked)) {
            parsed.liked.forEach((id: string) => likedIds.value.add(id));
          }
        } catch (e) {}
      }
      return;
    }
  } catch (err) {
    console.warn("拉取资源失败", err);
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.liked && Array.isArray(parsed.liked)) {
        parsed.liked.forEach((id: string) => likedIds.value.add(id));
      }
    }
  } catch (e) {}
}

function saveLocalCache() {
  try {
    const liked = Array.from(likedIds.value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ liked }));
  } catch (e) {}
}

// 背景轮播逻辑（不变）
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
  loadResources();
  Imgtimer = window.setInterval(() => {
    currentIndex.value =
      (currentIndex.value + 1) % Math.max(1, randomFive.value.length);
  }, 5200);
  uploaderCollapsed.value = window.innerWidth <= 640;
});
onBeforeUnmount(() => {
  if (Imgtimer) clearInterval(Imgtimer);
});

function toggleUploader() {
  uploaderCollapsed.value = !uploaderCollapsed.value;
}

async function addResource() {
  const t = form.value.title.trim();
  const l = form.value.link.trim();
  if (!t || !l) {
    return ElMessage.warning("请填写完整信息");
  }
  if (!/^https?:\/\//i.test(l)) {
    return ElMessage.error("请输入正确的链接（https开头）");
  }
  try {
    const payload = {
      title: t,
      uploader: form.value.uploader.trim() || "匿名",
      link: l,
      storage_type: form.value.type,
      role_key: DEFAULT_ROLE,
    };
    const res: any = await createResource(payload);
    if (res && res.success && res.data) {
      const added = mapServerToLocal(res.data);
      resources.value.unshift(added);
      saveLocalCache();
      resetForm();
      ElMessage.success("上传成功");
      return;
    }
    ElMessage.error("上传失败");
  } catch (err) {
    console.warn("创建资源失败", err);
    ElMessage.error("上传失败，请稍后再试");
  }
}

function resetForm() {
  form.value.title = "";
  form.value.uploader = "";
  form.value.link = "";
  form.value.type = "";
}

async function handleLike(item: Resource) {
  const id = item.id;
  const wasLiked = likedIds.value.has(String(id));
  if (wasLiked) {
    likedIds.value.delete(String(id));
    item.likes = Math.max(0, item.likes - 1);
  } else {
    likedIds.value.add(String(id));
    item.likes++;
  }
  saveLocalCache();
  try {
    const action = wasLiked ? "unlike" : "like";
    const res: any = await likeResource(id, action);
    if (
      res &&
      res.success &&
      res.data &&
      typeof res.data.likes !== "undefined"
    ) {
      item.likes = res.data.likes;
    }
  } catch (err) {
    console.warn("点赞接口调用失败，回滚", err);
    if (wasLiked) {
      likedIds.value.add(String(id));
      item.likes++;
    } else {
      likedIds.value.delete(String(id));
      item.likes = Math.max(0, item.likes - 1);
    }
    saveLocalCache();
  }
}

const sortedResources = computed(() => {
  const arr = [...resources.value];
  if (sortBy.value === "time") {
    arr.sort((a, b) => +new Date(b.time) - +new Date(a.time));
  } else {
    arr.sort((a, b) => b.likes - a.likes);
  }
  return arr;
});

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mm}`;
  } catch (e) {
    return iso;
  }
}
</script>

<style scoped lang="scss">
// 今汐主题色
$accent: #7fe7d6; // 薄雾海绿
$accent-2: #d7fff6; // 珍珠青
$gold: #e6c77c; // 龙尾金
$white: #f0f6fa; // 月白
$dark: #021016; // 玄黑底
$card-bg: rgba(8, 22, 26, 0.55);
$glass-border: rgba(127, 231, 214, 0.25);
$text-light: #f5fffd;
$text-muted: rgba(245, 255, 253, 0.7);

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

.jinxi-resources {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(145deg, $dark 0%, #06242a 100%);
  color: $text-light;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto,
    "PingFang SC", sans-serif;
  padding-bottom: 80px; // 为固定页脚留空间
  overflow-x: hidden;
  padding-top: 80px;

  // 背景轮播
  .carousel {
    position: fixed;
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

  // 头部
  .hero {
    position: relative;
    z-index: 2;
    padding: 24px 20px;
    background: $card-bg;
    backdrop-filter: blur(1px);
    border-bottom: 1px solid $glass-border;
    .hero-inner {
      max-width: 1000px;
      margin: 0 auto;
      text-align: center;
      h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 700;
        background: linear-gradient(135deg, $white, $accent-2, $accent);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .subtitle {
        margin-top: 8px;
        font-size: 0.9rem;
        color: $text-muted;
      }
    }
  }

  // 主容器
  .container {
    position: relative;
    z-index: 2;
    max-width: 1000px;
    margin: 24px auto 0;
    padding: 0 20px;

    // 上传区
    .uploader {
      background: $card-bg;
      backdrop-filter: blur(1px);
      border-radius: 28px;
      border: 1px solid $glass-border;
      overflow: hidden;
      transition: all 0.2s;
      .uploader-head {
        display: flex;
        justify-content: flex-end;
        padding: 12px 20px;
        background: rgba(0, 0, 0, 0.2);
        .toggle {
          background: rgba($accent, 0.1);
          border: 1px solid $glass-border;
          color: $accent-2;
          padding: 6px 14px;
          border-radius: 40px;
          cursor: pointer;
          transition: all 0.2s;
          &:hover {
            background: rgba($accent, 0.2);
            transform: translateY(-2px);
          }
        }
      }
      .upload-form {
        padding: 20px;
        transition: all 0.3s;
        .row {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          input {
            flex: 1;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid $glass-border;
            border-radius: 40px;
            padding: 12px 18px;
            color: $text-light;
            font-size: 0.9rem;
            outline: none;
            transition: all 0.2s;
            &:focus {
              border-color: $accent;
              box-shadow: 0 0 12px rgba($accent, 0.2);
            }
          }
        }
        .actions {
          display: flex;
          justify-content: flex-end;
          .btn {
            padding: 10px 28px;
            border-radius: 40px;
            border: none;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            &.primary {
              background: linear-gradient(90deg, $accent, $accent-2);
              color: $dark;
              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba($accent, 0.3);
              }
            }
          }
        }
      }
      &.collapsed .upload-form {
        padding-top: 0;
        padding-bottom: 0;
        max-height: 0;
        overflow: hidden;
      }
    }

    // 资源列表
    .list {
      margin-top: 28px;
      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 20px;
        h2 {
          font-size: 1.3rem;
          margin: 0;
          .count {
            font-size: 0.9rem;
            color: $text-muted;
          }
        }
        .sort {
          label {
            font-size: 0.85rem;
            select {
              background: rgba(0, 0, 0, 0.3);
              border: 1px solid $glass-border;
              border-radius: 40px;
              padding: 6px 12px;
              color: $text-light;
              margin-left: 8px;
              outline: none;
            }
          }
        }
      }
      .items {
        list-style: none;
        padding: 0;
        margin: 0;
        max-height: calc(100vh - 380px); // 适应不同屏幕
        overflow-y: auto;
        scrollbar-width: thin;
        &::-webkit-scrollbar {
          width: 5px;
        }
        &::-webkit-scrollbar-track {
          background: rgba($accent, 0.1);
          border-radius: 10px;
        }
        &::-webkit-scrollbar-thumb {
          background: $accent;
          border-radius: 10px;
        }
        .item {
          background: rgba(0, 0, 0, 0.4);
          border-radius: 20px;
          padding: 16px 20px;
          margin-bottom: 12px;
          transition: all 0.2s;
          border: 1px solid rgba($accent, 0.1);
          &:hover {
            transform: translateX(-6px);
            border-color: rgba($accent, 0.4);
            background: rgba($accent, 0.05);
          }
          .title {
            display: block;
            font-size: 1rem;
            font-weight: 600;
            color: $accent-2;
            text-decoration: none;
            margin-bottom: 8px;
            word-break: break-word;
            &:hover {
              text-decoration: underline;
            }
          }
          .meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.75rem;
            color: $text-muted;
            flex-wrap: wrap;
            gap: 8px;
            .left {
              display: flex;
              align-items: center;
              gap: 8px;
              .uploader {
                padding: 2px 6px;
                background: rgba($accent, 0.15);
                border-radius: 20px;
                color: $accent-2;
              }
            }
            .right {
              display: flex;
              gap: 12px;
              align-items: center;
              .like-btn {
                display: flex;
                align-items: center;
                gap: 4px;
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 40px;
                transition: all 0.2s;
                .heart-icon {
                  width: 18px;
                  height: 18px;
                }
                .count {
                  font-size: 0.75rem;
                  color: $text-muted;
                }
                &:hover .heart-icon {
                  transform: scale(1.1);
                }
              }
              .badge {
                background: rgba($accent, 0.1);
                padding: 4px 10px;
                border-radius: 40px;
                font-size: 0.7rem;
                border: 1px solid rgba($accent, 0.2);
              }
            }
          }
        }
      }
      .empty {
        text-align: center;
        padding: 40px;
        color: $text-muted;
        font-size: 0.9rem;
      }
    }
  }

  // 页脚 fixed 底部
  .foot {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    padding: 12px 20px;
    font-size: 0.75rem;
    color: $text-muted;
    border-top: 1px solid $glass-border;
    background: $card-bg;
    backdrop-filter: blur(1px);
    z-index: 10;
  }

  // 响应式
  @media (max-width: 768px) {
    padding-bottom: 70px; // 适应固定页脚高度
    .carousel1 {
      display: none;
    }
    .carousel2 {
      display: block;
    }
    .hero .hero-inner h1 {
      font-size: 1.5rem;
    }
    .container {
      padding: 0 16px;
      .uploader .upload-form .row {
        flex-direction: column;
        gap: 12px;
      }
      .list {
        .list-header {
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;
        }
        .items {
          max-height: calc(100vh - 450px); // 移动端适配高度
          .item {
            padding: 14px 16px;
            .meta {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
            }
          }
        }
      }
    }
    .foot {
      padding: 8px 12px;
      font-size: 0.7rem;
    }
  }
}
</style>
