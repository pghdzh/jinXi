<template>
  <div class="wiki-page">
    <!-- 背景轮播放在最底层 -->
    <div class="carousel">
      <img
        v-for="(src, idx) in randomFive"
        :key="idx"
        :src="src"
        class="carousel-image"
        :class="{ active: idx === currentIndex }"
      />
    </div>
    <header class="wiki-header">
      <div class="title">
        <h1>今汐文本分享</h1>
        <p class="subtitle">愿语轻诉，今州长忆</p>
      </div>
      <div class="actions">
        <input
          v-model="search"
          class="search"
          placeholder="搜索标题或者标签..."
        />
        <button class="btn btn-new" @click="openCreate">新建词条</button>
      </div>
    </header>

    <main class="wiki-body">
      <div v-if="filteredEntries.length === 0" class="empty">
        没有找到匹配的词条 ✨
      </div>

      <ul class="entry-list">
        <li v-for="entry in filteredEntries" :key="entry.id" class="entry-card">
          <div class="entry-head">
            <div class="entry-meta" @click="openDetail(entry)">
              <div class="entry-title-wrap">
                <h2 class="entry-title">{{ entry.title }}</h2>
                <span class="entry-badge">#{{ entry.slug || "未设置" }}</span>
              </div>
              <div class="entry-info">
                <span class="meta-item">作者：{{ entry.author }}</span>
                <span class="meta-item"
                  >时间：{{ formatTime(entry.updatedAt) }}</span
                >
              </div>
            </div>

            <div class="entry-actions">
              <button
                class="like"
                :class="{ active: isLiked(entry.id) }"
                :aria-pressed="isLiked(entry.id)"
                @click.stop="toggleLike(entry.id)"
              >
                <img
                  :src="
                    isLiked(entry.id)
                      ? '/icons/heart-red-filled.svg'
                      : '/icons/heart-red-outline.svg'
                  "
                  alt="like"
                />
                <span class="like-count">{{ entry.likes }}</span>
              </button>
              <div class="edit-delete" v-if="canEdit(entry.id)">
                <button class="small" @click="openEdit(entry)">编辑</button>
                <button class="small danger" @click="remove(entry.id)">
                  删除
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </main>

    <!-- Edit/Create Modal -->
    <transition name="fade-zoom">
      <div class="modal-overlay" v-if="showModal">
        <div class="modal">
          <header class="modal-header">
            <h3>{{ editing ? "编辑词条" : "新建词条" }}</h3>
            <button class="close" @click="closeModal">✕</button>
          </header>
          <section class="modal-body">
            <label>
              标题
              <input v-model="form.title" placeholder="输入标题" />
            </label>

            <label>
              词条（短标签）
              <input
                v-model="form.slug"
                placeholder="比如：彩蛋、二创小说、AI对话记录等等"
              />
            </label>

            <label>
              作者
              <input v-model="form.author" placeholder="作者昵称" />
            </label>

            <label>
              内容
              <textarea
                v-model="form.content"
                rows="8"
                placeholder="在这里输入词条内容"
              ></textarea>
            </label>
          </section>
          <footer class="modal-footer">
            <button class="btn ghost" @click="closeModal">取消</button>
            <button class="btn" @click="submit">
              {{ editing ? "保存" : "创建" }}
            </button>
          </footer>
        </div>
      </div>
    </transition>

    <!-- Detail Modal -->
    <transition name="fade-zoom">
      <div class="modal-overlay" v-if="detailEntry">
        <div class="modal detail-modal">
          <header class="modal-header">
            <h3>{{ detailEntry.title }}</h3>
            <button class="close" @click="detailEntry = null">✕</button>
          </header>
          <section class="modal-body">
            <div class="detail-content">{{ detailEntry.content }}</div>
          </section>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import {
  getWikiList,
  createWiki,
  updateWiki,
  deleteWiki,
  likeWiki,
} from "@/api/modules/wiki";

// 本地存储自己创建的词条 ID
const LS_MY_WIKI_IDS = "yuzuriha:wiki:my_ids";
const myWikiIds: string[] = JSON.parse(
  localStorage.getItem(LS_MY_WIKI_IDS) || "[]"
);
const markAsMine = (id: string | number) => {
  if (!myWikiIds.includes(String(id))) {
    myWikiIds.push(String(id));
    localStorage.setItem(LS_MY_WIKI_IDS, JSON.stringify(myWikiIds));
  }
};
const canEdit = (id: string | number) => myWikiIds.includes(String(id));

// 数据状态
const entries = ref<any[]>([]);

// 本地存储键
const LS_LIKED_IDS = "yuzuriha:wiki:liked_ids";
// 从 localStorage 读取已点赞 id 列表（字符串形式）
const likedIds = ref<string[]>(
  JSON.parse(localStorage.getItem(LS_LIKED_IDS) || "[]")
);

const showModal = ref(false);
const editing = ref(false);
const editingId = ref<string | number | null>(null);
const detailEntry = ref<any>(null);
const form = reactive({ title: "", slug: "", author: "", content: "" });
const search = ref("");

// 时间格式化
function formatTime(ts: string | number | null | undefined) {
  if (!ts) return "未知时间";
  const date = new Date(ts);
  if (isNaN(date.getTime())) return "未知时间";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

// 加载词条列表
async function loadEntries() {
  try {
    const res: any = await getWikiList();
    entries.value = res.data.map((e: any) => ({
      ...e,
      createdAt: e.createdAt || e.created_at,
      updatedAt: e.updatedAt || e.updated_at,
    }));
  } catch (err) {
    console.error(err);
    ElMessage.error("加载词条失败");
  }
}

// 打开/关闭弹窗
function openCreate() {
  editing.value = false;
  editingId.value = null;
  form.title = "";
  form.slug = "";

  form.content = "";
  showModal.value = true;
}
function openEdit(entry: any) {
  if (!canEdit(entry.id)) {
    ElMessage.warning("只有创建者可以编辑");
    return;
  }
  editing.value = true;
  editingId.value = entry.id;
  form.title = entry.title;
  form.slug = entry.slug;
  form.author = entry.author;
  form.content = entry.content;
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
}

const canSubmit = computed(() => form.title.trim() && form.content.trim());

// 提交
async function submit() {
  if (!canSubmit.value) {
    ElMessage.warning("请填写标题和内容");
    return;
  }
  const payload = {
    title: form.title.trim(),
    author: form.author.trim() || "匿名",
    content: form.content.trim(),
    slug: null,
  };
  if (form.slug.trim()) payload.slug = form.slug.trim();
  try {
    if (editing.value && editingId.value) {
      await updateWiki(editingId.value, payload);
      ElMessage.success("编辑成功");
    } else {
      const res: any = await createWiki(payload);
      markAsMine(res.data.id);
      editingId.value = res.data.id;
      ElMessage.success("创建成功");
    }
    showModal.value = false;
    loadEntries();
  } catch (err) {
    console.error(err);
    ElMessage.error("提交失败");
  }
}

// 删除
async function remove(id: string | number) {
  if (!canEdit(id)) {
    ElMessage.warning("只有创建者可以删除");
    return;
  }
  if (!confirm("确认删除该词条？此操作不可撤销")) return;
  try {
    await deleteWiki(id);
    const index = myWikiIds.indexOf(String(id));
    if (index !== -1) myWikiIds.splice(index, 1);
    localStorage.setItem(LS_MY_WIKI_IDS, JSON.stringify(myWikiIds));
    ElMessage.success("删除成功");
    loadEntries();
  } catch (err) {
    console.error(err);
    ElMessage.error("删除失败");
  }
}

// 点赞
function persistLikedIds() {
  try {
    localStorage.setItem(LS_LIKED_IDS, JSON.stringify(likedIds.value));
  } catch (e) {
    console.warn("保存 likedIds 失败", e);
  }
}

// 判断是否已点赞（供模板绑定 class/aria-pressed）
function isLiked(id: string | number) {
  return likedIds.value.includes(String(id));
}

// 点赞 / 取消点赞（乐观更新，本地仅存 id，点赞数使用 entry.likes）
async function toggleLike(id: string | number) {
  const entry = entries.value.find((e) => e.id === id);
  if (!entry) return;

  const idStr = String(id);
  const wasLiked = likedIds.value.includes(idStr);

  // 乐观更新 UI（立即反映）
  if (wasLiked) {
    // 取消点赞：保证不低于 0
    entry.likes = Math.max(0, (entry.likes || 0) - 1);
    likedIds.value = likedIds.value.filter((x) => x !== idStr);
  } else {
    // 点赞
    entry.likes = (entry.likes || 0) + 1;
    likedIds.value.push(idStr);
  }
  persistLikedIds();

  try {
    // 调用后端（action: 'like' | 'unlike' | 'toggle'）
    // 我们明确传 'like' 或 'unlike'
    const action = wasLiked ? "unlike" : "like";
    await likeWiki(id, action);

    // 可选：如果后端在响应中返回了最新的 likes 数（res.data.likes），
    // 你可以在这里用后端值覆盖本地（示例注释）
    // const res = await likeWiki(id, action)
    // if (res?.data?.likes !== undefined) entry.likes = res.data.likes
  } catch (err) {
    // 出错则回滚乐观更新
    console.error("toggleLike error", err);
    if (wasLiked) {
      // 取消点赞失败 -> 重新标记为已点赞
      entry.likes = (entry.likes || 0) + 1;
      if (!likedIds.value.includes(idStr)) likedIds.value.push(idStr);
    } else {
      // 点赞失败 -> 取消之前增加的 count
      entry.likes = Math.max(0, (entry.likes || 0) - 1);
      likedIds.value = likedIds.value.filter((x) => x !== idStr);
    }
    persistLikedIds();
    ElMessage.error("点赞失败，请稍后重试");
  }
}

// 详情弹窗
async function openDetail(entry: any) {
  detailEntry.value = entry;
}

// 搜索过滤
const filteredEntries = computed(() => {
  const q = String(search.value || "")
    .trim()
    .toLowerCase();
  let list = entries.value;

  // 搜索过滤
  if (q) {
    list = list.filter(
      (e) =>
        (e.title || "").toLowerCase().includes(q) ||
        (e.slug || "").toLowerCase().includes(q)
    );
  }

  // 按点赞数排序（默认降序：点赞多的在前）
  return [...list].sort((a, b) => (b.likes || 0) - (a.likes || 0));
});

// 1. 分别导入两套图
const pcModules = import.meta.glob("@/assets/images1/*.{jpg,png,jpeg,webp}", {
  eager: true,
});
const mobileModules = import.meta.glob(
  "@/assets/images2/*.{jpg,png,jpeg,webp}",
  { eager: true }
);

const pcSrcs: string[] = Object.values(pcModules).map((m: any) => m.default);
const mobileSrcs: string[] = Object.values(mobileModules).map(
  (m: any) => m.default
);

// 洗牌函数
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const randomFive = ref<string[]>([]);
const currentIndex = ref(0);
let timer: number;

function pickImages() {
  const isMobile = window.innerWidth < 768;
  const all = isMobile ? mobileSrcs : pcSrcs;
  randomFive.value = shuffle(all).slice(0, 5);
}

onMounted(() => {
  loadEntries();
  pickImages(); // 首次判断
  // 监听窗口大小变化
  window.addEventListener("resize", pickImages);

  // 轮播
  timer = window.setInterval(() => {
    if (randomFive.value.length > 0) {
      currentIndex.value = (currentIndex.value + 1) % randomFive.value.length;
    }
  }, 5000);
});

onUnmounted(() => {
  clearInterval(timer);
  window.removeEventListener("resize", pickImages);
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
$shadow: 0 12px 28px rgba(0, 0, 0, 0.2);

.wiki-page {
  min-height: 100vh;
  color: $text-light;
  padding: 16px;
  box-sizing: border-box;
  padding-top: 80px;
  background: linear-gradient(145deg, $dark 0%, #06242a 100%);
  position: relative;

  // 背景轮播
  .carousel {
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg,
        rgba(2, 16, 22, 0.3),
        rgba(2, 16, 22, 0.7)
      );
      pointer-events: none;
      z-index: 1;
    }

    .carousel-image {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transition: opacity 1s ease;
      filter: blur(0.8px) saturate(0.9);
      transform: scale(1.02);
    }
    .carousel-image.active {
      opacity: 1;
    }
  }

  // 头部区域
  .wiki-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
    background: $card-bg;
    backdrop-filter: blur(12px);
    border-radius: 28px;
    box-shadow: $shadow;
    border: 1px solid $glass-border;
    flex-wrap: wrap;
    position: relative;
    z-index: 2;

    .title {
      h1 {
        margin: 0;
        font-size: 1.6rem;
        font-weight: 700;
        background: linear-gradient(90deg, $accent-2, $white);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .subtitle {
        font-size: 0.8rem;
        color: $text-muted;
        margin-top: 4px;
      }
    }

    .actions {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search {
      padding: 8px 16px;
      border-radius: 40px;
      border: 1px solid $glass-border;
      background: rgba(0, 0, 0, 0.3);
      color: $text-light;
      font-size: 0.9rem;
      outline: none;
      transition: all 0.2s;
      &:focus {
        border-color: $accent;
        box-shadow: 0 0 12px rgba($accent, 0.2);
      }
    }

    .btn-new {
      background: linear-gradient(90deg, $accent, $accent-2);
      border: none;
      border-radius: 40px;
      padding: 8px 20px;
      font-weight: 600;
      color: $dark;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 6px 12px rgba($accent, 0.2);
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba($accent, 0.3);
      }
      &:active {
        transform: translateY(0);
      }
    }
  }

  // 主内容
  .wiki-body {
    margin-top: 24px;
    position: relative;
    z-index: 2;

    .empty {
      text-align: center;
      padding: 60px 20px;
      color: $text-muted;
      font-size: 1rem;
    }

    .entry-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 20px;

      .entry-card {
        background: $card-bg;
        backdrop-filter: blur(12px);
        border-radius: 28px;
        padding: 20px;
        border: 1px solid $glass-border;
        transition: all 0.3s ease;
        &:hover {
          transform: translateY(-4px);
          border-color: rgba($accent, 0.5);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3);
        }

        .entry-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;

          .entry-meta {
            flex: 1;
            cursor: pointer;

            .entry-title-wrap {
              display: flex;
              align-items: center;
              gap: 12px;
              flex-wrap: wrap;
            }

            .entry-title {
              font-size: 1.2rem;
              font-weight: 700;
              margin: 0;
              color: $accent-2;
            }

            .entry-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 40px;
              background: rgba($accent, 0.15);
              color: $accent-2;
              font-size: 0.7rem;
              border: 1px solid rgba($accent, 0.3);
            }

            .entry-info {
              display: flex;
              flex-wrap: wrap;
              gap: 12px;
              margin-top: 12px;

              .meta-item {
                font-size: 0.75rem;
                color: $text-muted;
                background: rgba(0, 0, 0, 0.2);
                padding: 4px 10px;
                border-radius: 40px;
                display: inline-flex;
                align-items: center;
                gap: 4px;
              }
            }
          }

          .entry-actions {
            display: flex;
            gap: 12px;
            align-items: center;

            .like {
              background: transparent;
              border: none;
              display: flex;
              align-items: center;
              gap: 6px;
              cursor: pointer;
              padding: 6px 10px;
              border-radius: 40px;
              transition: all 0.2s;
              img {
                width: 20px;
                height: 20px;
                transition: transform 0.1s;
              }
              .like-count {
                font-size: 0.85rem;
                color: $text-light;
              }
              &:hover img {
                transform: scale(1.1);
              }
              &.active {
                background: rgba(255, 107, 107, 0.1);
              }
            }

            .edit-delete {
              display: flex;
              gap: 8px;

              .small {
                background: rgba($accent, 0.1);
                border: 1px solid $glass-border;
                border-radius: 40px;
                padding: 6px 14px;
                font-size: 0.75rem;
                color: $text-light;
                cursor: pointer;
                transition: all 0.2s;
                &:hover {
                  background: rgba($accent, 0.2);
                  transform: translateY(-1px);
                }
                &.danger {
                  background: rgba(255, 100, 100, 0.1);
                  color: #ff8a8a;
                  &:hover {
                    background: rgba(255, 100, 100, 0.2);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // 模态框
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(2, 16, 22, 0.85);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 16px;

    .modal {
      width: min(720px, 94%);
      max-height: 90vh;
      overflow-y: auto;
      background: $card-bg;
      backdrop-filter: blur(12px);
      border-radius: 28px;
      padding: 24px;
      border: 1px solid $glass-border;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      color: $text-light;

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba($accent, 0.2);
        margin-bottom: 20px;

        h3 {
          margin: 0;
          font-size: 1.4rem;
          background: linear-gradient(90deg, $accent-2, $white);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .close {
          background: transparent;
          border: none;
          font-size: 1.5rem;
          color: $text-muted;
          cursor: pointer;
          transition: color 0.2s;
          &:hover {
            color: $accent;
          }
        }
      }

      .modal-body {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 24px;

        label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.9rem;
          color: $accent-2;

          input,
          textarea {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid $glass-border;
            border-radius: 20px;
            padding: 10px 16px;
            color: $text-light;
            font-size: 0.9rem;
            outline: none;
            transition: all 0.2s;
            &:focus {
              border-color: $accent;
              box-shadow: 0 0 12px rgba($accent, 0.2);
            }
          }
          textarea {
            border-radius: 16px;
            resize: vertical;
          }
        }

        .detail-content {
          white-space: pre-wrap;
          line-height: 1.6;
        }
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding-top: 16px;
        border-top: 1px solid rgba($accent, 0.2);

        .btn {
          padding: 8px 24px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;

          &.ghost {
            background: transparent;
            border: 1px solid $glass-border;
            color: $text-light;
            &:hover {
              background: rgba($accent, 0.1);
            }
          }
          &:not(.ghost) {
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
  }

  // 过渡动画
  .fade-zoom-enter-active,
  .fade-zoom-leave-active {
    transition: all 0.3s ease;
  }
  .fade-zoom-enter-from,
  .fade-zoom-leave-to {
    opacity: 0;
    transform: scale(0.96);
  }

  // 移动端适配
  @media (max-width: 720px) {
    .wiki-header {
      flex-direction: column;
      align-items: stretch;
      padding: 16px;

      .actions {
        justify-content: stretch;
        .search {
          width: 100%;
        }
        .btn-new {
          text-align: center;
        }
      }
    }

    .entry-list .entry-card {
      padding: 16px;

      .entry-head {
        flex-direction: column;

        .entry-actions {
          width: 100%;
          justify-content: space-between;
          margin-top: 12px;

          .like {
            order: 1;
          }
          .edit-delete {
            order: 2;
            .small {
              padding: 4px 12px;
            }
          }
        }
      }
    }

    .modal .modal-body label input,
    .modal .modal-body label textarea {
      font-size: 0.85rem;
    }
  }
}
</style>
