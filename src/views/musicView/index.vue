<template>
  <section
    class="jinxi-player"
    @keydown.space.prevent="onSpace"
    tabindex="0"
    ref="rootEl"
    aria-label="今汐 音乐播放器"
  >
    <div class="stage">
      <!-- 左侧：封面与控制 -->
      <div class="left" role="region" aria-label="播放器控制区">
        <div class="cover" :style="coverStyle">
          <video
            v-if="videoSrc"
            class="video-background"
            :src="videoSrc"
            autoplay
            muted
            loop
            playsinline
            aria-hidden="true"
            tabindex="-1"
            :class="videoClass"
          ></video>

          <div v-if="loadingAudio" class="loading-overlay" aria-hidden="true">
            <div class="spinner" />
            <div class="loading-text">加载中…</div>
          </div>
        </div>

        <div class="controls">
          <div class="title" :title="current?.title || '未选择曲目'">
            {{ current?.title || "未选择曲目" }}
          </div>

          <div class="meta">
            <span class="time">{{ formatTime(currentTime) }}</span>
            <span class="divider">/</span>
            <span class="time">{{ formatTime(duration) }}</span>
          </div>

          <div
            class="progress-wrap"
            ref="progressWrap"
            @click="seekByClick"
            @pointerdown.prevent="onPointerDownProgress"
            role="slider"
            :aria-valuemin="0"
            :aria-valuemax="duration"
            :aria-valuenow="currentTime"
            aria-label="进度条"
          >
            <div class="progress-bar">
              <div
                class="progress"
                :style="{ width: progressPercent + '%' }"
              ></div>
            </div>
            <div
              class="progress-handle"
              :style="{ left: progressPercent + '%' }"
              aria-hidden="true"
            ></div>
          </div>

          <div class="btns">
            <button class="icon" @click="prev" aria-label="上一首">⟵</button>

            <button
              class="play"
              @click="togglePlay"
              :aria-pressed="playing"
              :aria-label="playing ? '暂停' : '播放'"
            >
              <span v-if="!playing">▶</span>
              <span v-else>▌▌</span>
            </button>

            <button class="icon" @click="next" aria-label="下一首">⟶</button>

            <div class="modes" role="group" aria-label="播放模式">
              <button
                :class="{ active: shuffle }"
                @click="toggleShuffle"
                title="随机播放"
              >
                🔀
              </button>
              <button
                :class="{ active: repeatMode !== 'off' }"
                @click="toggleRepeat"
                title="循环模式"
              >
                🔁
              </button>
            </div>

            <div class="volume" aria-label="音量控制">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="volume"
                aria-label="音量"
              />
            </div>
          </div>

          <div v-if="errorMessage" class="error-msg" role="status">
            {{ errorMessage }}
          </div>
        </div>
      </div>

      <!-- 右侧：播放列表 -->
      <div class="right" role="region" aria-label="播放列表">
        <div class="playlist-header">
          <div class="left-head">
            <h3>播放列表</h3>
            <div class="api-hint">
              {{ loading ? "加载中…" : list.length ? "" : "目录为空" }}
            </div>
          </div>

          <div class="search-wrap">
            <input
              v-model="searchTerm"
              @input="onSearchInput"
              placeholder="搜索曲名..."
              aria-label="搜索曲目"
            />
            <button
              v-if="searchTerm"
              class="clear"
              @click="clearSearch"
              aria-label="清除搜索"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="list-area">
          <div v-if="loading" class="list-loading">
            <div class="small-spinner" />
            加载目录...
          </div>

          <ul class="playlist" role="list">
            <li
              v-for="(item, idx) in filteredList"
              :key="item.name || idx"
              :class="{ active: current && item.name === current.name }"
              @click="selectTrack(idx)"
              tabindex="0"
              @keyup.enter="selectTrack(idx)"
              role="listitem"
              :aria-current="idx === index ? 'true' : 'false'"
            >
              <div class="left-col">
                <div class="dot" aria-hidden="true"></div>
                <div class="title" :title="item.title">{{ item.title }}</div>
              </div>
              <div class="right-col">
                <div class="len">
                  {{ item.duration ? formatTime(item.duration) : "--:--" }}
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <audio
      ref="audioRef"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @loadedmetadata="onLoadedMetadata"
      @error="onAudioError"
      preload="metadata"
    ></audio>
  </section>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
import { getMusicList, getMusicUrl } from "@/api/modules/music";

type MusicItem = {
  name: string;
  title: string;
  url?: string;
  duration?: number | null;
};

const list = ref<MusicItem[]>([]);
const loading = ref(false);
const index = ref<number>(-1);
const playing = ref(false);
const audioRef = ref<HTMLAudioElement | null>(null);
const currentTime = ref<number>(0);
const duration = ref<number>(0);
const volume = ref<number>(Number(localStorage.getItem("jinxi_volume") ?? 0.8));
const shuffle = ref<boolean>(false);
const repeatMode = ref<"off" | "one" | "all">("off");

const rootEl = ref<HTMLElement | null>(null);
const progressWrap = ref<HTMLElement | null>(null);
const dragging = ref(false);

const errorMessage = ref<string | null>(null);
const loadingAudio = ref(false);

const isMobile = ref<boolean>(window.innerWidth <= 920);
window.addEventListener("resize", () => {
  isMobile.value = window.innerWidth <= 920;
});

const videoSrc = ref("");
const videoClass = ref("");

const searchTerm = ref("");
let searchTimer: any = null;
const searchDebounceMs = 240;

const current = computed(() =>
  index.value >= 0 && list.value[index.value] ? list.value[index.value] : null
);
const progressPercent = computed(() =>
  duration.value
    ? Math.min(100, Math.max(0, (currentTime.value / duration.value) * 100))
    : 0
);

const coverStyle = computed(() => {
  const t = current.value?.title || "jinxi";
  let hash = 0;
  for (let i = 0; i < t.length; i++)
    hash = (hash << 5) - hash + t.charCodeAt(i);
  const r1 = (Math.abs(hash) % 100) + 80;
  const r2 = (Math.abs(hash * 3) % 100) + 100;
  return {
    background: `radial-gradient(circle at 28% 28%, rgba(127, 231, 214, 0.08), transparent 12%), linear-gradient(135deg, rgba(${r1},${r2},180,0.12), rgba(90, 140, 130, 0.08))`,
  };
});

const filteredList = computed(() => {
  const term = (searchTerm.value || "").trim().toLowerCase();
  if (!term) return list.value;
  return list.value.filter((i) => (i.title || "").toLowerCase().includes(term));
});

async function fetchList() {
  loading.value = true;
  try {
    const res = await getMusicList();
    const items =
      res?.ok && Array.isArray(res.list)
        ? res.list
        : Array.isArray(res)
        ? res
        : res?.list ?? [];
    list.value = items.map((it: any) => ({
      name: it.name,
      title: it.title ?? (it.name ? it.name.replace(/\.mp3$/i, "") : "未知"),
      url: getMusicUrl(it.name),
      duration: null,
    }));
  } catch (e) {
    console.error("获取音乐列表失败", e);
    list.value = [];
    errorMessage.value = "加载目录失败";
  } finally {
    loading.value = false;
  }
}

async function safeSetSrc(url: string) {
  const a = audioRef.value!;
  errorMessage.value = null;
  loadingAudio.value = true;
  try {
    try {
      const head = await fetch(url, { method: "HEAD" });
      if (!head.ok) throw new Error(`资源响应 ${head.status}`);
      const ct = head.headers.get("content-type") || "";
      if (!ct.includes("audio")) {
        console.warn("content-type 不是 audio:", ct);
      }
    } catch (e) {}
    a.src = url;
    a.load();
  } catch (err) {
    console.error("设置音源失败", err);
    errorMessage.value = "无法加载音频资源";
    throw err;
  }
}

async function loadCurrent(doPlay = false) {
  const a = audioRef.value;
  const curr = current.value;
  if (!a || !curr) return;
  a.pause();
  duration.value = 0;
  currentTime.value = 0;
  try {
    await safeSetSrc(curr.url || getMusicUrl(curr.name));
    if (doPlay) await play();
  } catch {
    playing.value = false;
    loadingAudio.value = false;
  }
}

async function play() {
  const a = audioRef.value;
  if (!a) return;
  try {
    await a.play();
    playing.value = true;
    errorMessage.value = null;
  } catch (e: any) {
    console.warn("播放失败", e);
    playing.value = false;
    errorMessage.value = "播放被浏览器阻止或资源不可用";
  }
}
function pause() {
  audioRef.value?.pause();
  playing.value = false;
}
function togglePlay() {
  if (!audioRef.value) return;
  if (playing.value) pause();
  else play();
}
function selectTrack(idxInFiltered: number) {
  const item = filteredList.value[idxInFiltered];
  if (!item) return;
  const originalIndex = list.value.findIndex((it) => it.name === item.name);
  if (originalIndex === -1) return;
  index.value = originalIndex;
  loadCurrent(true);
}

function onTimeUpdate(e: Event) {
  const t = e.target as HTMLAudioElement;
  currentTime.value = t.currentTime || 0;
}
function onLoadedMetadata(e: Event) {
  const t = e.target as HTMLAudioElement;
  duration.value = isFinite(t.duration) ? t.duration : 0;
  if (current.value && !current.value.duration)
    current.value.duration = duration.value;
  loadingAudio.value = false;
}
function onEnded() {
  loadingAudio.value = false;
  if (repeatMode.value === "one") {
    if (audioRef.value) {
      audioRef.value.currentTime = 0;
      play();
    }
    return;
  }
  if (shuffle.value) {
    playRandom();
    return;
  }
  if (index.value < list.value.length - 1) selectTrack(index.value + 1);
  else {
    if (repeatMode.value === "all") selectTrack(0);
    else playing.value = false;
  }
}
function onAudioError(e: Event) {
  const a = audioRef.value;
  console.error("audio error", a?.error);
  errorMessage.value = "音频播放出错";
  playing.value = false;
  loadingAudio.value = false;
}

function next() {
  if (!list.value.length) return;
  if (shuffle.value) {
    playRandom();
    return;
  }
  if (index.value < list.value.length - 1) selectTrack(index.value + 1);
  else if (repeatMode.value === "all") selectTrack(0);
}
function prev() {
  if (!audioRef.value) return;
  if (audioRef.value.currentTime > 4) {
    audioRef.value.currentTime = 0;
    return;
  }
  if (index.value > 0) selectTrack(index.value - 1);
  else if (repeatMode.value === "all") selectTrack(list.value.length - 1);
}
function playRandom() {
  if (!list.value.length) return;
  if (list.value.length === 1) {
    selectTrack(0);
    return;
  }
  let i = index.value;
  while (i === index.value) i = Math.floor(Math.random() * list.value.length);
  selectTrack(i);
}

function seekByClick(e: MouseEvent | TouchEvent) {
  if (!progressWrap.value || !duration.value || !audioRef.value) return;
  const rect = progressWrap.value.getBoundingClientRect();
  const clientX =
    (e as MouseEvent).clientX ?? (e as TouchEvent).touches?.[0]?.clientX;
  if (clientX == null) return;
  const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
  const ratio = x / rect.width;
  audioRef.value.currentTime = ratio * duration.value;
  currentTime.value = audioRef.value.currentTime;
}
function onPointerDownProgress(e: PointerEvent) {
  if (!progressWrap.value || !audioRef.value || !duration.value) return;
  dragging.value = true;
  (e.target as Element).setPointerCapture?.(e.pointerId);
  window.addEventListener("pointermove", onPointerMoveProgress);
  window.addEventListener("pointerup", onPointerUpProgress);
  handlePointer(e);
}
function onPointerMoveProgress(e: PointerEvent) {
  handlePointer(e);
}
function onPointerUpProgress(e: PointerEvent) {
  dragging.value = false;
  window.removeEventListener("pointermove", onPointerMoveProgress);
  window.removeEventListener("pointerup", onPointerUpProgress);
}
function handlePointer(e: PointerEvent) {
  if (!progressWrap.value || !audioRef.value || !duration.value) return;
  const rect = progressWrap.value.getBoundingClientRect();
  const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
  const ratio = x / rect.width;
  audioRef.value.currentTime = ratio * duration.value;
  currentTime.value = audioRef.value.currentTime;
}

watch(volume, (v) => {
  if (audioRef.value) audioRef.value.volume = v;
  localStorage.setItem("jinxi_volume", String(v));
});

function toggleShuffle() {
  shuffle.value = !shuffle.value;
}
function toggleRepeat() {
  if (repeatMode.value === "off") repeatMode.value = "all";
  else if (repeatMode.value === "all") repeatMode.value = "one";
  else repeatMode.value = "off";
}

function onSpace() {
  if (
    document.activeElement &&
    ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
  )
    return;
  togglePlay();
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchTimer = null;
  }, searchDebounceMs);
}
function clearSearch() {
  searchTerm.value = "";
}

function formatTime(sec?: number) {
  if (!sec || !isFinite(sec)) return "--:--";
  const s = Math.floor(sec % 60);
  const m = Math.floor(sec / 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

onMounted(async () => {
  audioRef.value =
    (document.querySelector(".jinxi-player audio") as HTMLAudioElement) ?? null;
  if (audioRef.value) audioRef.value.volume = volume.value;

  const isM = isMobile.value;
  const folder = isM ? "/mp1" : "/mp2";
  const idx = Math.floor(Math.random() * 4) + 1;
  videoSrc.value = `${folder}/1 (${idx}).mp4`;
  videoClass.value = isM ? "landscape" : "portrait";

  await fetchList();

  window.addEventListener("keydown", globalKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", globalKeydown);
});

function globalKeydown(e: KeyboardEvent) {
  if (e.code === "Space") {
    if (
      document.activeElement &&
      ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
    )
      return;
    e.preventDefault();
    togglePlay();
  } else if (e.code === "Escape") {
    pause();
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
$glass-bg: rgba(8, 22, 26, 0.65);
$glass-border: rgba(127, 231, 214, 0.25);
$text-light: #f5fffd;
$text-muted: rgba(245, 255, 253, 0.7);

/* 整体容器 */
.jinxi-player {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(145deg, $dark 0%, #06242a 100%);
  color: $text-light;
  padding-top: 80px;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto,
    "PingFang SC", sans-serif;
  outline: none;
  position: relative;
  overflow-x: hidden;
}

/* 水纹纹理 */
.jinxi-player::before {
  content: "";
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    to bottom,
    rgba($accent, 0.02) 0px,
    rgba($accent, 0.02) 1px,
    transparent 1px,
    transparent 18px
  );
  pointer-events: none;
  z-index: 0;
}

.stage {
  display: flex;
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
  align-items: flex-start;
  position: relative;
  z-index: 2;
}

/* 左侧卡片 */
.left {
  width: 420px;
  background: $glass-bg;
  backdrop-filter: blur(12px);
  border: 1px solid $glass-border;
  border-radius: 28px;
  padding: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
}

.cover {
  width: 100%;
  height: 580px;
  border-radius: 20px;
  background: linear-gradient(
    135deg,
    rgba($accent, 0.15),
    rgba($accent-2, 0.08)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 -6px 28px rgba(0, 0, 0, 0.3);
}

.video-background {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
  transform: scale(1.02);
  filter: saturate(0.92) contrast(0.95) blur(0.2px);
}

.video-background.landscape {
  aspect-ratio: 16 / 9;
}
.video-background.portrait {
  aspect-ratio: 9 / 16;
  width: auto;
  height: 110%;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 8;
}
.spinner,
.small-spinner {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 4px solid rgba($accent, 0.2);
  border-top-color: $accent;
  animation: spin 1s linear infinite;
}
.small-spinner {
  width: 18px;
  height: 18px;
  border-width: 3px;
  margin-right: 8px;
}
.loading-text {
  margin-top: 8px;
  color: $text-light;
  font-weight: 600;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.controls {
  margin-top: 16px;
}
.title {
  font-size: 1.1rem;
  font-weight: 700;
  color: $accent-2;
  letter-spacing: 0.3px;
}
.meta {
  margin-top: 6px;
  font-size: 0.9rem;
  color: $text-muted;
  display: flex;
  gap: 8px;
  align-items: center;
}

.progress-wrap {
  margin-top: 12px;
  cursor: pointer;
  touch-action: none;
}
.progress-bar {
  height: 4px;
  background: rgba($accent, 0.2);
  border-radius: 4px;
  overflow: hidden;
}
.progress {
  height: 100%;
  background: linear-gradient(90deg, $accent, $accent-2);
  box-shadow: 0 0 6px rgba($accent, 0.5);
  transition: width 120ms linear;
}
.progress-handle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: $accent-2;
  transform: translateX(-50%);
  position: relative;
  top: -4px;
  box-shadow: 0 0 6px $accent;
  transition: left 120ms linear;
}

.btns {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.icon,
.play {
  border: none;
  background: rgba($accent, 0.1);
  color: $text-light;
  font-size: 18px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 40px;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}
.play {
  font-size: 20px;
  background: linear-gradient(90deg, $accent, $accent-2);
  color: $dark;
  padding: 8px 16px;
}
.icon:hover,
.play:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}
.modes button {
  background: rgba($accent, 0.1);
  border: 1px solid $glass-border;
  padding: 6px 10px;
  border-radius: 40px;
  margin-right: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.modes .active {
  background: rgba($accent, 0.3);
  border-color: $accent;
}
.volume input {
  width: 100px;
  accent-color: $accent;
}
.error-msg {
  margin-top: 10px;
  color: #ff8a8a;
  font-size: 0.8rem;
}

/* 右侧列表 */
.right {
  flex: 1;
  background: $glass-bg;
  backdrop-filter: blur(12px);
  border-radius: 28px;
  border: 1px solid $glass-border;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: max-height 0.3s;
  overflow: hidden;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.left-head {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.playlist-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: $accent-2;
}

.api-hint {
  font-size: 0.8rem;
  color: $text-muted;
}
.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-wrap input {
  padding: 6px 12px;
  border-radius: 40px;
  border: 1px solid $glass-border;
  background: rgba(0, 0, 0, 0.3);
  color: $text-light;
  outline: none;
  transition: all 0.2s;
}
.search-wrap input:focus {
  border-color: $accent;
}
.search-wrap .clear {
  background: transparent;
  border: none;
  color: $text-muted;
  cursor: pointer;
  font-size: 1rem;
}
.list-area {
  flex: 1;
  overflow: hidden;
}
.list-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  color: $text-muted;
}
.playlist {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  max-height: calc(70vh - 100px);
}
.playlist li {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.playlist li:hover {
  background: rgba($accent, 0.08);
  transform: translateX(-4px);
  border-color: rgba($accent, 0.2);
}
.playlist li.active {
  background: rgba($accent, 0.15);
  border-color: rgba($accent, 0.4);
}
.left-col {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $accent-2;
  flex-shrink: 0;
}
.title {
  font-weight: 500;
  color: $text-light;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.right-col .len {
  color: $text-muted;
  font-size: 0.8rem;
  white-space: nowrap;
}

/* 响应式 */
@media (max-width: 920px) {
  .stage {
    flex-direction: column;
  }
  .left {
    width: 100%;
  }
  .cover {
    height: 200px;
  }
  .right {
    width: 100%;
    max-height: none;
  }

  .playlist li .title {
    white-space: normal;
    word-break: break-word;
  }
  .playlist li {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .left-col .title {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .right-col .len {
    text-align: left;
    margin-left: 26px;
  }
}

@media (max-width: 560px) {
  .btns {
    justify-content: center;
  }
  .volume input {
    width: 80px;
  }
  .playlist-header {
    flex-direction: column;
    align-items: stretch;
  }
  .search-wrap input {
    width: 100%;
  }
}
</style>
