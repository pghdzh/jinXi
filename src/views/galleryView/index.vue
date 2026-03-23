<template>
  <div class="gallery-container">
    <!-- 动态背景装饰 -->
    <div class="dynamic-bg">
      <div class="bg-glow bg-glow-1"></div>
      <div class="bg-glow bg-glow-2"></div>
      <div class="bg-glow bg-glow-3"></div>
      <div class="particle-field">
        <span
          v-for="i in 60"
          :key="i"
          class="particle"
          :style="getParticleStyle(i)"
        ></span>
      </div>
    </div>

    <button class="upload-btn" @click="openUploadModal">上传图片</button>

    <section class="gallery section">
      <div class="sort-controls">
        <button @click="toggleSort" class="sort-btn">
          按 {{ sortBy === "like_count" ? "点赞量" : "最新上传" }} 排序
        </button>
      </div>
      <div class="gallery-grid">
        <div
          v-for="(img, index) in images"
          :key="img.id"
          class="card"
          @click="openLightbox(index)"
          ref="cards"
        >
          <div class="card-inner">
            <img
              :src="img.src"
              :alt="img.alt"
              loading="lazy"
              @load="onImageLoad($event)"
            />
            <div class="overlay">
              <span>查看大图</span>
            </div>
            <button class="like-btn" @click.stop="handleLike(img)">
              <i class="heart" :class="{ liked: img.liked }"></i>
              <span class="like-count">{{ img.likeCount }}</span>
            </button>
          </div>
        </div>
      </div>
      <div ref="sentinel" class="sentinel"></div>
      <div class="loading" v-if="loading">加载中...</div>
      <div class="finished" v-if="finished">已全部加载</div>
    </section>

    <aside class="ranking-panel">
      <div class="panel-header" @click="expanded = !expanded">
        <h3 class="ranking-title">排行榜</h3>
        <span>共{{ imgTotal }}张</span>
        <span class="toggle-icon">{{ expanded ? "▾" : "▸" }}</span>
      </div>
      <transition name="fade">
        <ul v-if="expanded" class="ranking-list">
          <li
            v-for="(item, idx) in rankingList"
            :key="idx"
            class="ranking-item"
            :class="`rank-${idx + 1}`"
          >
            <span class="rank">{{ idx + 1 }}</span>
            <span class="name">{{ item.nickname }}</span>
            <span class="count">{{ item.count }} 张</span>
          </li>
        </ul>
      </transition>
    </aside>

    <!-- Lightbox Modal -->
    <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
      <span class="close" @click="closeLightbox">✕</span>
      <span class="prev" @click.stop="prevImage">‹</span>
      <img :src="images[currentIndex].src" :alt="images[currentIndex].alt" />
      <span class="next" @click.stop="nextImage">›</span>
    </div>

    <!-- 上传弹窗 -->
    <div
      v-if="uploadModalOpen"
      class="upload-modal-overlay"
      @click.self="closeUploadModal"
    >
      <div class="upload-modal">
        <h3>批量上传图片</h3>
        <div class="tip-container">
          <ul class="tips-list">
            <li>
              审核规则： 1.不要色情倾向（不要露三点，我怕被封）
              2.要我能认出是今汐。
            </li>
            <li>
              由于没有用户系统，我这边不好做审核反馈，但只要显示上传成功，我这边肯定能收到。
            </li>
            <li>
              如果图片数量较多请在b站私信联系我给我网盘链接，因为我云服务器比较小一次性上传太多图片可能会导致上传不上，感谢理解。
            </li>
            <li>
              因为审核上传一次比较麻烦，所以审核时间不定，最晚一周，感谢谅解。
            </li>
          </ul>
        </div>
        <p class="stats">
          今日已上传：<strong>{{ uploadedToday }}</strong> 张，
          剩余可上传：<strong>{{ remaining }}</strong> 张
        </p>
        <label>
          昵称：
          <input v-model="nickname" type="text" placeholder="请输入昵称" />
        </label>
        <label>
          选择图片（最多 {{ remaining }} 张）：
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            @change="handleFileSelect"
          />
        </label>
        <p class="tip" v-if="selectedFiles.length">
          已选 {{ selectedFiles.length }} 张
        </p>
        <div class="modal-actions">
          <button :disabled="!canSubmit || isUploading" @click="submitUpload">
            {{ isUploading ? "上传中..." : "立即上传" }}
          </button>
          <button class="cancel" @click="closeUploadModal">取消</button>
        </div>
      </div>
    </div>

    <div class="floating-chibis">
      <img
        v-for="(pet, i) in chibiList"
        :key="i"
        :src="pet.src"
        :style="{ top: pet.top + 'px', left: pet.left + 'px' }"
        class="chibi-img"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from "vue";
import { uploadImages } from "@/api/modules/images";
import { getRankingList } from "@/api/modules/ranking";
import { gsap } from "gsap";
import { getImagesLikesList, likeImage } from "@/api/modules/imagesLikes";
import { debounce } from "lodash";

const sortBy = ref<"uploaded_at" | "like_count">("like_count");
const order = ref<"asc" | "desc">("desc");
function toggleSort() {
  if (sortBy.value === "uploaded_at") {
    sortBy.value = "like_count";
    order.value = "desc";
  } else {
    sortBy.value = "uploaded_at";
    order.value = "desc";
  }
  pageImage.value = 1;
  images.value = [];
  finished.value = false;
  window.scrollTo(0, 0);
  loadNextPage();
}

function getLikedIds(): number[] {
  const data = localStorage.getItem("likedImageIds");
  return data ? JSON.parse(data) : [];
}
function setLikedIds(ids: number[]) {
  localStorage.setItem("likedImageIds", JSON.stringify(ids));
}
async function handleLike(img: ImageItem) {
  if (img.liked) return;
  try {
    await likeImage(img.id);
    img.likeCount += 1;
    img.liked = true;
    const likedIds = getLikedIds();
    likedIds.push(img.id);
    setLikedIds(likedIds);
  } catch (error) {
    console.error("点赞失败", error);
    alert("点赞失败，请稍后重试");
  }
}

interface ImageItem {
  src: string;
  alt: string;
  likeCount: number;
  id: number;
  liked: Boolean;
}
interface RankingItem {
  id?: number;
  nickname: string;
  count: number;
}
const rankingList = ref<RankingItem[]>([]);
const expanded = ref(true);
const page = 1;
const pageSize = 99;
const fetchRanking = async () => {
  const res = await getRankingList({ page, pageSize, character_key: "jinXi" });
  if (res.success) {
    rankingList.value = res.data;
  } else {
    console.error("获取排行榜失败", res.message);
  }
};

const images = ref<ImageItem[]>([]);
const pageImage = ref(1);
const limit = ref(10);
const loading = ref(false);
const finished = ref(false);
const sentinel = ref<HTMLElement | null>(null);

const observerCard = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observerCard.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);
async function observeNewCards(startIndex = 0) {
  await nextTick();
  const cards = document.querySelectorAll<HTMLElement>(".card");
  for (let i = startIndex; i < cards.length; i++) {
    observerCard.observe(cards[i]);
  }
}
const fixImageUrl = (url: string): string => {
  if (url.includes("127.0.0.1")) {
    return url.replace("http://127.0.0.1", window.location.origin);
  }
  return url;
};
const imgTotal = ref(0);
async function loadNextPage() {
  if (loading.value || finished.value) return;
  loading.value = true;
  try {
    const res = await getImagesLikesList({
      page: pageImage.value,
      limit: limit.value,
      sortBy: sortBy.value,
      character_key: "jinXi",
      order: order.value,
    });
    imgTotal.value = res.total;
    const likedIds = getLikedIds();
    const list = (
      res.images as Array<{ url: string; like_count: number; id: number }>
    ).map((item) => ({
      src: fixImageUrl(item.url),
      alt: "",
      likeCount: item.like_count,
      id: item.id,
      liked: likedIds.includes(item.id),
    }));
    if (list.length === 0) {
      finished.value = true;
      return;
    }
    const oldLength = images.value.length;
    const existingIds = new Set(images.value.map((i) => i.id));
    const filtered = list.filter((item) => !existingIds.has(item.id));
    images.value.push(...filtered);
    pageImage.value++;
    observeNewCards(oldLength);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

const debouncedLoad = debounce(
  () => {
    loadNextPage();
  },
  200,
  { leading: true, trailing: false }
);

const lightboxOpen = ref(false);
const currentIndex = ref(0);
function openLightbox(index: number) {
  currentIndex.value = index;
  lightboxOpen.value = true;
}
function closeLightbox() {
  lightboxOpen.value = false;
}
function prevImage() {
  currentIndex.value =
    (currentIndex.value + images.value.length - 1) % images.value.length;
}
function nextImage() {
  currentIndex.value = (currentIndex.value + 1) % images.value.length;
}

function onImageLoad(e: Event) {
  const img = e.target as HTMLImageElement;
  const card = img.closest(".card");
  card?.classList.add("loaded");
}

// 上传弹窗逻辑
const uploadModalOpen = ref(false);
const nickname = ref("");
const fileInput = ref<HTMLInputElement>();
const selectedFiles = ref<File[]>([]);
function getTodayKey() {
  return `uploaded_${new Date().toISOString().slice(0, 10)}`;
}
const uploadedToday = ref<number>(
  Number(localStorage.getItem(getTodayKey()) || 0)
);
const remaining = computed(() => Math.max(27 - uploadedToday.value, 0));
const canSubmit = computed(() => {
  return (
    nickname.value.trim().length > 0 &&
    selectedFiles.value.length > 0 &&
    selectedFiles.value.length <= remaining.value
  );
});
function clearOldUploadRecords() {
  const today = new Date();
  const storage = window.localStorage;
  for (const key of Object.keys(storage)) {
    if (!key.startsWith("uploaded_")) continue;
    const dateStr = key.slice("uploaded_".length);
    const recordDate = new Date(dateStr);
    if (isNaN(recordDate.getTime())) continue;
    const diffMs = today.getTime() - recordDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays > 2) {
      storage.removeItem(key);
    }
  }
}
function openUploadModal() {
  clearOldUploadRecords();
  nickname.value = "";
  selectedFiles.value = [];
  if (fileInput.value) fileInput.value.value = "";
  uploadedToday.value = Number(localStorage.getItem(getTodayKey()) || 0);
  uploadModalOpen.value = true;
}
function closeUploadModal() {
  uploadModalOpen.value = false;
}
function handleFileSelect(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files || []);
  if (!files) return;
  const validFiles: File[] = [];
  for (const file of files) {
    if (file.size > 20 * 1024 * 1024) {
      alert(`文件太大：${file.name}，请控制在 20MB 内`);
      continue;
    }
    validFiles.push(file);
  }
  if (validFiles.length === 0) return;
  if (validFiles.length > remaining.value) {
    alert(
      `今天最多还能上传 ${remaining.value} 张，已为你截取前 ${remaining.value} 张`
    );
    selectedFiles.value = files.slice(0, remaining.value);
  } else {
    selectedFiles.value = files;
  }
}
const isUploading = ref(false);
async function submitUpload() {
  if (!canSubmit.value) return;
  isUploading.value = true;
  try {
    const res = await uploadImages(
      selectedFiles.value,
      nickname.value.trim(),
      "jinXi"
    );
    const uploadedCount = res.data.length;
    uploadedToday.value += uploadedCount;
    localStorage.setItem(getTodayKey(), String(uploadedToday.value));
    alert(`成功上传 ${uploadedCount} 张图片`);
    closeUploadModal();
  } catch (err: any) {
    console.error(err);
    alert(err.message || "上传失败");
  } finally {
    isUploading.value = false;
  }
}

interface Chibi {
  src: string;
  top: number;
  left: number;
}
const chibiList = ref<Chibi[]>([]);
let sentinelObserver: IntersectionObserver;

onMounted(async () => {
  await fetchRanking();
  await loadNextPage();
  observeNewCards(0);
  sentinelObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) debouncedLoad();
    },
    { rootMargin: "0px", threshold: 0.1 }
  );
  if (sentinel.value) {
    sentinelObserver.observe(sentinel.value);
  }
  const total = 9;
  let pickCount = 3;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = window.innerWidth <= 768;
  const imgWidth = 100;
  const imgHeight = 100;
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  if (isMobile) pickCount = 1;
  const nums = shuffle(Array.from({ length: total }, (_, k) => k + 1));
  const picks = nums.slice(0, pickCount);
  chibiList.value = [];
  picks.forEach((i) => {
    chibiList.value.push({
      src: `/QImages/1 (${i}).png`,
      left: Math.random() * (vw - imgWidth),
      top: Math.random() * (vh - imgHeight),
    });
  });
  await nextTick();
  const imgs = document.querySelectorAll<HTMLImageElement>(".chibi-img");
  imgs.forEach((img, index) => {
    const padding = 200;
    gsap.fromTo(
      img,
      { opacity: 0, scale: 0.5 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "back.out(2)",
        delay: 0.2 * index,
      }
    );
    img.addEventListener("mouseenter", () => {
      gsap.killTweensOf(img);
      gsap.to(img, {
        x: "+=" + ((Math.random() - 0.5) * 400).toFixed(0),
        y: "+=" + ((Math.random() - 0.5) * 400).toFixed(0),
        duration: 1.2,
        ease: "back.out(2)",
        onComplete: () => {
          animate(img);
        },
      });
    });
    const animate = (img: HTMLImageElement) => {
      let { x, y } = img.getBoundingClientRect();
      let deltaX = (Math.random() - 0.5) * 200;
      let deltaY = (Math.random() - 0.5) * 200;
      let nextX = x + deltaX;
      let nextY = y + deltaY;
      if (nextX < padding) deltaX = padding - x;
      if (nextX + img.width > window.innerWidth - padding)
        deltaX = window.innerWidth - padding - (x + img.width);
      if (nextY < padding) deltaY = padding - y;
      if (nextY + img.height > window.innerHeight - padding)
        deltaY = window.innerHeight - padding - (y + img.height);
      gsap.to(img, {
        x: `+=${deltaX.toFixed(0)}`,
        y: `+=${deltaY.toFixed(0)}`,
        rotation: `+=${((Math.random() - 0.5) * 60).toFixed(0)}`,
        duration: 2 + Math.random() * 2,
        ease: "power1.inOut",
        onComplete: () => animate(img),
      });
    };
    animate(img);
  });
});

onBeforeUnmount(() => {
  observerCard.disconnect();
  sentinelObserver.disconnect();
});

// 随机粒子样式（辅助背景）
const getParticleStyle = (i: number) => {
  const size = Math.random() * 4 + 1.5;
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
@keyframes pop {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 0;
  }
}

.gallery-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(145deg, #021016 0%, #06242a 100%);
  color: $text-light;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto,
    "PingFang SC", sans-serif;
  padding-bottom: 60px;
  overflow-x: hidden;

  // 动态背景层
  .dynamic-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;

    .bg-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
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
        background: rgba($accent-2, 0.5);
        border-radius: 50%;
        filter: blur(2px);
        animation: floatParticle linear infinite;
      }
    }
  }

  .section {
    position: relative;
    z-index: 2;
    padding: 80px 20px;
    max-width: 1200px;
    margin: 0 auto;

    .sort-controls {
      margin: 16px 0;

      .sort-btn {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 10px 28px 10px 56px;
        font-size: 1rem;
        line-height: 1;
        font-family: "PingFang SC", "Noto Sans SC", "Helvetica Neue", Arial,
          sans-serif;
        cursor: pointer;
        border-radius: 28px;
        position: relative;
        overflow: hidden;
        border: 1px solid $glass-border;
        background: rgba(8, 22, 26, 0.8);
        backdrop-filter: blur(8px);
        color: $accent-2;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba($accent, 0.1);
        transition: transform 0.2s, box-shadow 0.2s, background 0.2s;

        &::after {
          content: "";
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%) rotate(-12deg);
          width: 20px;
          height: 24px;
          background: linear-gradient(135deg, $accent-2, $accent);
          clip-path: polygon(
            50% 0,
            78% 25%,
            100% 45%,
            50% 100%,
            0% 45%,
            22% 25%
          );
          pointer-events: none;
        }
        &::before {
          content: "";
          position: absolute;
          left: 6px;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          background: radial-gradient(circle, rgba($accent, 0.1), transparent);
          filter: blur(6px);
          pointer-events: none;
        }
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
          background: rgba(8, 22, 26, 0.9);
          color: $accent;
        }
      }
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;

      .card {
        perspective: 1000px;
        opacity: 0;
        transform: translateY(20px);
        &.visible {
          animation: fadeInUp 0.6s ease forwards;
        }
        &.loaded .card-inner img {
          filter: none;
          opacity: 1;
        }
        .card-inner {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: $card-bg;
          backdrop-filter: blur(8px);
          border: 1px solid $glass-border;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          transform-style: preserve-3d;
          transition: transform 0.4s, box-shadow 0.4s;
          &:hover {
            transform: rotateY(6deg) rotateX(3deg) scale(1.02);
            box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
            border-color: rgba($accent, 0.5);
          }
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            filter: blur(20px) grayscale(30%);
            opacity: 0.6;
            transition: filter 0.6s ease, opacity 0.6s ease;
          }
          .overlay {
            position: absolute;
            bottom: 0;
            width: 100%;
            padding: 12px 0;
            background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s;
            span {
              color: $text-light;
              font-family: "Cinzel Decorative", serif;
              font-size: 1rem;
              background: rgba(0, 0, 0, 0.6);
              padding: 4px 12px;
              border-radius: 20px;
              backdrop-filter: blur(4px);
            }
          }
          &:hover .overlay {
            opacity: 1;
          }
          .like-btn {
            position: absolute;
            bottom: 12px;
            right: 12px;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            border: none;
            cursor: pointer;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 40px;
            transition: transform 0.2s;
            &:hover {
              transform: scale(1.05);
            }
            .heart {
              width: 22px;
              height: 22px;
              background: url("/icons/heart-red-outline.svg") no-repeat center;
              background-size: contain;
              transition: all 0.3s;
              filter: drop-shadow(0 0 2px rgba(255, 0, 0, 0.5));
            }
            .liked {
              background: url("/icons/heart-red-filled.svg") no-repeat center;
              background-size: contain;
              animation: pop 0.4s ease;
              &::after {
                content: "";
                position: absolute;
                top: 50%;
                left: 50%;
                width: 40px;
                height: 40px;
                background: rgba(255, 0, 0, 0.3);
                border-radius: 50%;
                transform: translate(-50%, -50%) scale(0);
                animation: pulse 1.2s ease-out infinite;
                pointer-events: none;
              }
            }
            .like-count {
              font-size: 0.85rem;
              color: #ff6b6b;
              font-weight: bold;
              text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
            }
          }
        }
      }
    }
  }

  .lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    img {
      max-width: 85%;
      max-height: 85%;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.9);
    }
    .close,
    .prev,
    .next {
      position: absolute;
      color: $text-light;
      font-size: 2.5rem;
      cursor: pointer;
      user-select: none;
      padding: 8px;
      border-radius: 50%;
      transition: color 0.2s;
      &:hover {
        color: $accent;
      }
    }
    .close {
      top: 20px;
      right: 20px;
    }
    .prev {
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
    }
    .next {
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  .upload-btn {
    position: fixed;
    bottom: 64px;
    left: 24px;
    z-index: 10;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    font-size: 1rem;
    font-weight: 600;
    font-family: "PingFang SC", "Noto Sans SC", sans-serif;
    cursor: pointer;
    background: linear-gradient(90deg, $accent, $accent-2);
    border: none;
    border-radius: 40px;
    color: $dark;
    box-shadow: 0 8px 20px rgba($accent, 0.3);
    transition: transform 0.2s, box-shadow 0.2s;
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba($accent, 0.4);
    }
  }

  .upload-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(2, 16, 22, 0.85);
    backdrop-filter: blur(12px);
    .upload-modal {
      position: relative;
      width: 720px;
      max-width: calc(100% - 40px);
      padding: 32px;
      border-radius: 28px;
      background: $card-bg;
      backdrop-filter: blur(12px);
      border: 1px solid $glass-border;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      color: $text-light;
      h3 {
        margin: 0 0 16px;
        font-size: 1.6rem;
        background: linear-gradient(90deg, $accent-2, $white);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
      }
      .tip-container {
        margin: 16px 0;
        padding: 16px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 16px;
        border-left: 3px solid $accent;
        .tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
          li {
            position: relative;
            padding-left: 24px;
            margin-bottom: 8px;
          
          }
        }
      }
      .stats {
        text-align: center;
        strong {
          color: $accent;
        }
      }
      label {
        display: block;
        margin: 16px 0;
        input,
        textarea {
          width: 100%;
          margin-top: 8px;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid $glass-border;
          background: rgba(0, 0, 0, 0.3);
          color: $text-light;
          outline: none;
          transition: border-color 0.2s;
          &:focus {
            border-color: $accent;
          }
        }
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
        button {
          padding: 10px 24px;
          border-radius: 40px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
          &:not(.cancel) {
            background: linear-gradient(90deg, $accent, $accent-2);
            color: $dark;
            &:hover:not(:disabled) {
              transform: translateY(-2px);
            }
            &:disabled {
              opacity: 0.5;
              animation: cursorAnimation_disabled 1s infinite step-start;
            }
          }
          &.cancel {
            background: transparent;
            border: 1px solid $glass-border;
            color: $text-muted;
            &:hover {
              background: rgba($accent, 0.1);
            }
          }
        }
      }
    }
  }

  .ranking-panel {
    width: 240px;
    position: fixed;
    top: 84px;
    right: 20px;
    z-index: 100;
    background: $card-bg;
    backdrop-filter: blur(12px);
    border-radius: 24px;
    border: 1px solid $glass-border;
    padding: 16px;
    color: $text-light;
    transition: all 0.2s;
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      .ranking-title {
        margin: 0;
        font-size: 1.1rem;
        background: linear-gradient(90deg, $accent-2, $white);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .toggle-icon {
        background: rgba($accent, 0.1);
        padding: 4px 8px;
        border-radius: 20px;
        transition: transform 0.2s;
      }
      &:hover .toggle-icon {
        transform: translateY(-2px);
      }
    }
    .ranking-list {
      list-style: none;
      padding: 0;
      margin: 12px 0 0;
      max-height: 60vh;
      overflow-y: auto;
      &::-webkit-scrollbar {
        width: 4px;
      }
      &::-webkit-scrollbar-thumb {
        background: $accent;
        border-radius: 4px;
      }
    }
    .ranking-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      margin: 6px 0;
      border-radius: 12px;
      background: rgba(0, 0, 0, 0.2);
      transition: transform 0.2s;
      &:hover {
        transform: translateX(-4px);
        background: rgba($accent, 0.08);
      }
      .rank {
        width: 32px;
        font-weight: bold;
        color: $accent;
      }
      .name {
        flex: 1;
        padding: 0 8px;
        font-size: 0.9rem;
      }
      .count {
        font-size: 0.85rem;
        color: $accent-2;
      }
      &.rank-1 {
        background: linear-gradient(
          90deg,
          rgba($accent, 0.2),
          rgba($accent-2, 0.1)
        );
        .rank {
          color: $gold;
        }
      }
      &.rank-2 {
        background: linear-gradient(
          90deg,
          rgba($accent-2, 0.15),
          rgba($accent, 0.08)
        );
        .rank {
          color: $accent-2;
        }
      }
      &.rank-3 {
        background: linear-gradient(
          90deg,
          rgba($gold, 0.15),
          rgba($accent, 0.08)
        );
        .rank {
          color: $gold;
        }
      }
    }
  }

  .floating-chibis {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    .chibi-img {
      position: absolute;
      width: 80px;
      user-select: none;
      transform-origin: center;
      pointer-events: auto;
      filter: drop-shadow(0 0 6px rgba($accent, 0.3));
    }
  }

  .loading,
  .finished {
    text-align: center;
    padding: 20px;
    color: $text-muted;
    font-size: 0.9rem;
  }
  .sentinel {
    height: 1px;
  }
}
</style>
