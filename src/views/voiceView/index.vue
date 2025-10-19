<template>
    <section class="voice-gallery">

        <div class="bg-carousel" aria-hidden="true">
            <transition-group name="bg-fade" tag="div" class="bg-layer">

                <img v-for="(src, idx) in activeImages" :key="`bg-${idx}-${isMobile ? 'm' : 'd'}`" :src="src"
                    :class="['bg-img', { active: idx === currentIndex }]" alt="" />

            </transition-group>

        </div>

        <div class="vg__wrap">

            <header class="vg__header">
                <div class="logo">
                    <div class="shouan-icon" role="button" tabindex="0" aria-label="共鸣之晶">

                        <svg viewBox="0 0 48 48" width="36" height="36" aria-hidden="true" focusable="false">


                            <g class="ember-core" transform="translate(0,0)">
                                <path
                                    d="M24 14 C26 18, 30 20, 28 26 C26 32, 22 34, 24 38 C20 34, 18 30, 20 26 C22 22, 24 20, 24 14 Z" />
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
                    <div class="title-group">
                        <h1 class="title">今汐 · 语音馆</h1>
                        <p class="subtitle">雪落无声，愿语细闻</p>
                    </div>
                </div>
            </header>

            <!-- 列表（已解锁放前，未解锁放后） -->
            <ul class="vg__list" role="list">
                <li v-for="id in allVoiceIds" :key="id" class="vg__item isUnlocked"
                    :class="{ playing: id === currentId }">
                    <div class="item__left">
                        <div class="index">{{ String(id).padStart(3, '0') }}</div>
                        <div class="info">
                            <div class="name">语音 {{ String(id).padStart(3, '0') }}</div>
                        </div>
                    </div>

                    <div class="item__right">
                        <button class="btn btn--icon" @click="playEntry(id)"
                            :title="(currentId === id && isPlaying ? '暂停' : '播放')">
                            <span v-if="currentId === id && isPlaying">❚❚</span>
                            <span v-else>▶</span>
                        </button>

                        <a :href="voicePath(id)" :download="`audio_${id}.mp3`" title="下载">
                            <el-button type="primary" :icon="Download" circle />
                        </a>

                    </div>
                </li>
            </ul>


        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import {
    Download
} from '@element-plus/icons-vue'
/* ================== 配置 ================== */
const TOTAL_VOICES = 17; // 语音总数，按实际替换
const BG_INTERVAL_MS = 4500; // 背景切换间隔（毫秒）
const MOBILE_BREAKPOINT = 720; // 小于这个宽度视为移动端
/* ========================================= */

/* ========== 导入图片资源（Vite：eager） ========== */
/* 横图（用于 PC） */
const modules: Record<string, any> = import.meta.glob('@/assets/images1/*.{jpg,png,jpeg,webp}', { eager: true });
const allSrcs: string[] = Object.values(modules).map((m: any) => m.default || m);

/* 竖图（用于移动端） */
const modules2: Record<string, any> = import.meta.glob('@/assets/images2/*.{jpg,png,jpeg,webp}', { eager: true });
const allSrcs2: string[] = Object.values(modules2).map((m: any) => m.default || m);

/* 简单洗牌函数 */
function shuffle<T>(arr: T[]) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/* 随机取 5 张（若不足 5 张则全部） */
const randomFive = ref<string[]>(shuffle(allSrcs).slice(0, Math.min(5, allSrcs.length)));
const randomFive2 = ref<string[]>(shuffle(allSrcs2).slice(0, Math.min(5, allSrcs2.length)));

/* 轮播索引（共享，但 index 会根据 activeImages 长度做取模） */
const currentIndex = ref(0);
let imgTimer: number | null = null;

/* ========== 设备判断（响应式） ========== */
const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT);
function handleResize() {
    const nowMobile = window.innerWidth < MOBILE_BREAKPOINT;
    if (nowMobile !== isMobile.value) {
        isMobile.value = nowMobile;
        // 切换图片组时重置索引以避免越界
        currentIndex.value = 0;
    }
}

/* activeImages 根据 isMobile 返回对应数组 */
const activeImages = computed(() => (isMobile.value ? randomFive2.value : randomFive.value));
/* ========== 语音列表与播放逻辑 ========== */



/* 生成所有 id，并保持已解锁在前、未解锁在后 */
const allIds = Array.from({ length: TOTAL_VOICES }, (_, i) => i);
const allVoiceIds = allIds

/* audio 单例 */
let currentAudio: HTMLAudioElement | null = null;
const currentId = ref<number | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const currentDuration = ref(0);

function createAudio(src?: string) {
    destroyAudio();
    currentAudio = new Audio();
    currentAudio.preload = 'auto';
    if (src) currentAudio.src = src;
    currentAudio.addEventListener('timeupdate', onTimeUpdate);
    currentAudio.addEventListener('loadedmetadata', onLoadedMeta);
    currentAudio.addEventListener('ended', onEnded);
    currentAudio.addEventListener('error', onAudioError);
}
function destroyAudio() {
    if (!currentAudio) return;
    try {
        currentAudio.pause();
        currentAudio.removeEventListener('timeupdate', onTimeUpdate);
        currentAudio.removeEventListener('loadedmetadata', onLoadedMeta);
        currentAudio.removeEventListener('ended', onEnded);
        currentAudio.removeEventListener('error', onAudioError);
        currentAudio.src = '';
    } catch (e) { }
    currentAudio = null;
}
function onTimeUpdate() { if (currentAudio) currentTime.value = currentAudio.currentTime || 0; }
function onLoadedMeta() { if (currentAudio) currentDuration.value = currentAudio.duration || 0; }
function onEnded() { isPlaying.value = false; /* 不自动下一条 */ }
function onAudioError(e?: any) { console.error('audio error', e); isPlaying.value = false; }

function voicePath(id: number) {
    return `/voice/audio (${id}).mp3`;
}


async function playEntry(id: number) {
    if (currentId.value === id && isPlaying.value) {
        currentAudio?.pause();
        isPlaying.value = false;
        return;
    }
    if (currentId.value === id && !isPlaying.value && currentAudio) {
        try { await currentAudio.play(); isPlaying.value = true; } catch (e) { console.warn(e); }
        return;
    }

    // 新条目
    currentId.value = id;
    createAudio(voicePath(id));
    try {
        await currentAudio!.play();
        isPlaying.value = true;
    } catch (e) {
        console.warn('播放被阻止或失败', e);
        isPlaying.value = false;
    }
}

/* ========== 背景轮播控制 ========== */
function startBgTimer() {
    stopBgTimer();
    imgTimer = window.setInterval(() => {
        const len = Math.max(1, activeImages.value.length);
        // 保证在当前 activeImages 长度范围内循环
        currentIndex.value = (currentIndex.value + 1) % len;
    }, BG_INTERVAL_MS);
}
function stopBgTimer() {
    if (imgTimer !== null) {
        clearInterval(imgTimer);
        imgTimer = null;
    }
}



/* 生命周期 */
onMounted(() => {


    window.addEventListener('resize', handleResize);

    // 如果数组为空（没有图片），也避免报错：确保至少有一个占位空数组
    if (!randomFive.value.length && allSrcs.length) randomFive.value = shuffle(allSrcs).slice(0, Math.min(5, allSrcs.length));
    if (!randomFive2.value.length && allSrcs2.length) randomFive2.value = shuffle(allSrcs2).slice(0, Math.min(5, allSrcs2.length));

    // 启动轮播
    startBgTimer();
});

onBeforeUnmount(() => {

    window.removeEventListener('resize', handleResize);
    stopBgTimer();
    destroyAudio();
});

/* 监听 activeImages 长度变化（切换设备时重置 index 并保持循环） */
watch(activeImages, (nv) => {
    currentIndex.value = 0;
});
</script>

<style lang="scss" scoped>
/* 今汐风格：深潮底色 + 珍珠薄雾点缀（颜色写死） */
.voice-gallery {
    position: relative;
    min-height: 560px;
    font-family: "PingFang SC", "Noto Sans SC", system-ui, -apple-system, "Segoe UI",
        Roboto, "Helvetica Neue", Arial;
    color: #EAF9F8;
    /* 珍珠浅色文字 */
    overflow: hidden;
    padding: 28px;
    padding-top: 80px;
    /* 深海 -> 珍珠薄雾 */
    background: linear-gradient(180deg, #041718 0%, #062b29 40%, #052522 100%);
    -webkit-font-smoothing: antialiased;

    /* 背景轮播层（珍珠冷影）*/
    .bg-carousel {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;

        .bg-layer {
            position: absolute;
            inset: 0;
            overflow: hidden;

            .bg-img {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                opacity: 0;
                transform: scale(1.02);
                transition: opacity 900ms ease, transform 900ms ease, filter 900ms ease;
                pointer-events: none;
                filter: brightness(0.72) contrast(0.94) saturate(0.88);
                mix-blend-mode: screen;
            }

            .bg-img.active {
                opacity: 1;
                transform: scale(1);
                filter: brightness(0.94) contrast(1) saturate(1.04);
            }
        }
    }

    /* 前景容器（玻璃感 + 珍珠边） */
    .vg__wrap {
        position: relative;
        z-index: 2;
        max-width: 980px;
        margin: 0 auto;
        border-radius: 14px;
        padding: 18px;
        box-shadow: 0 12px 48px rgba(2, 10, 10, 0.72), inset 0 1px 0 rgba(127, 231, 214, 0.02);
        background: linear-gradient(180deg, rgba(4, 14, 12, 0.58), rgba(6, 16, 14, 0.44));
        border: 1px solid rgba(127, 231, 214, 0.03);
        backdrop-filter: blur(6px) saturate(1.02);
    }

    /* 头部 */
    .vg__header {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 24px;

        .logo {
            display: flex;
            gap: 12px;
            align-items: center;

            /* 右侧：今汐风徽章（替代晶格） */
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

                background: linear-gradient(180deg, rgba(6, 14, 12, 0.92), rgba(8, 18, 16, 0.94));
                border: 1px solid rgba(127, 231, 214, 0.03);
                box-shadow: 0 8px 30px rgba(2, 8, 8, 0.48), inset 0 1px 0 rgba(127, 231, 214, 0.02);
                transition: transform 260ms cubic-bezier(.2, .9, .3, 1), box-shadow 260ms, background 260ms;
                -webkit-tap-highlight-color: transparent;
                will-change: transform, box-shadow, opacity;

                svg {
                    width: 36px;
                    height: 36px;
                    display: block;
                    overflow: visible;
                }

                .ember-core path {
                    fill: #DFFDF9;
                    /* 珍珠青核心 */
                    opacity: 0.12;
                    transition: fill 260ms, opacity 260ms, transform 260ms, filter 260ms;
                    filter: drop-shadow(0 8px 20px rgba(127, 231, 214, 0.04));
                }

                .ember-sparks circle {
                    fill: #7FE7D6;
                    /* 薄雾海绿星尘 */
                    opacity: 0;
                    transition: opacity 240ms, transform 360ms;
                }

                &:hover,
                &:focus {
                    transform: translateY(-6px) scale(1.04);
                    box-shadow: 0 28px 86px rgba(4, 12, 12, 0.58), inset 0 1px 0 rgba(127, 231, 214, 0.02);
                    background: linear-gradient(180deg, rgba(8, 18, 16, 0.98), rgba(6, 14, 12, 0.99));

                    .ember-core path {
                        opacity: 1;
                        transform: scale(1.03);
                        fill: #DFFDF9;
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

                /* 动画：浮动 / 核心呼吸 / 星尘上浮 */
                animation: emberFloat 8s ease-in-out infinite;

                .ember-core path {
                    animation: emberCoreBreathe 4.6s ease-in-out infinite;
                    transform-origin: 50% 50%;
                }

                .ember-sparks circle {
                    animation: emberSparkFloat 1800ms ease-in-out infinite;
                }

                @media (max-width: 480px) {
                    width: 44px;
                    height: 44px;

                    svg {
                        width: 30px;
                        height: 30px;
                    }
                }
            }

            /* ============ keyframes ============ */
            @keyframes emberFloat {
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

            @keyframes emberCoreBreathe {
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

            @keyframes emberSparkFloat {
                0% {
                    opacity: 0;
                    transform: translateY(0) scale(0.8);
                    filter: blur(0);
                }

                35% {
                    opacity: 1;
                    transform: translateY(-6px) scale(1.15);
                    filter: blur(.2px);
                }

                70% {
                    opacity: 0.6;
                    transform: translateY(-10px) scale(1.25);
                    filter: blur(.8px);
                }

                100% {
                    opacity: 0;
                    transform: translateY(-14px) scale(1.35);
                    filter: blur(1.6px);
                }
            }

            .title-group {
                display: flex;
                flex-direction: column;

                .title {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 800;
                    /* 珍珠渐变文字 */
                    background: linear-gradient(90deg, #DFFDF9 0%, #BFF8EE 50%, #7FE7D6 100%);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    -webkit-text-fill-color: transparent;
                    text-shadow: 0 6px 20px rgba(2, 12, 10, 0.5);
                    letter-spacing: 0.4px;
                }

                .subtitle {
                    margin: 4px 0 0;
                    color: rgba(234, 249, 248, 0.86);
                    font-size: 1rem;
                    line-height: 1.3;
                }
            }
        }
    }

    /* 列表区域 */
    .vg__list {
        display: grid;
        gap: 12px;
        margin: 0;
        padding: 0;
        list-style: none;
        max-height: calc(100vh - 200px);
        overflow-y: auto;
        padding-right: 8px;
        -webkit-overflow-scrolling: touch;

        &::-webkit-scrollbar {
            width: 10px;
        }

        &::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(127, 231, 214, 0.12), rgba(191, 248, 238, 0.10));
            border-radius: 8px;
            border: 2px solid transparent;
            background-clip: padding-box;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }
    }

    /* 每一项卡片（玻璃 + 珍珠边） */
    .vg__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 14px;
        background: linear-gradient(90deg, rgba(6, 14, 12, 0.72), rgba(8, 18, 16, 0.78));
        border: 1px solid rgba(95, 200, 180, 0.04);
        backdrop-filter: blur(4px);
        transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, opacity 0.18s ease;

        &.playing {
            transform: translateY(-4px);
            box-shadow: 0 0 42px rgba(127, 231, 214, 0.12), inset 0 2px 12px rgba(127, 231, 214, 0.03);
            border-color: rgba(127, 231, 214, 0.12);
        }

        &.locked {
            opacity: 0.5;
            filter: grayscale(20%) brightness(0.82);

            .note--locked {
                color: #7a868b;
                font-style: italic;
            }
        }

        .item__left {
            display: flex;
            gap: 12px;
            align-items: center;

            .index {
                min-width: 60px;
                height: 60px;
                border-radius: 12px;
                display: grid;
                place-items: center;
                /* 珍珠编号 */
                background: linear-gradient(180deg, #DFFDF9 0%, #BFF8EE 60%);
                color: #042826;
                font-weight: 800;
                box-shadow: 0 6px 20px rgba(2, 10, 10, 0.18);
                text-shadow: 0 0 6px rgba(0, 0, 0, 0.06);
            }

            .info {
                .name {
                    color: #EAF9F8;
                    font-weight: 700;
                    letter-spacing: 0.3px;
                }

                .note {
                    color: rgba(200, 230, 225, 0.9);
                    font-size: 0.9rem;
                    margin-top: 4px;
                }

                .note--locked {
                    color: #7a868b;
                }
            }
        }

        .item__right {
            display: flex;
            gap: 10px;
            align-items: center;

            .btn {
                &--icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 12px;
                    border: none;
                    display: inline-grid;
                    place-items: center;
                    background: linear-gradient(180deg, #BFF8EE, #7FE7D6);
                    color: #042826;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 6px 26px rgba(34, 92, 86, 0.08);
                    transition: all 0.15s ease;

                    &:hover {
                        background: linear-gradient(180deg, #DFFDF9, #9FEFE0);
                        box-shadow: 0 8px 40px rgba(127, 231, 214, 0.10);
                        transform: translateY(-3px);
                    }
                }

                &--hint {
                    color: #9aa6a9;
                }
            }

            a {
                .el-button {
                    background: linear-gradient(180deg, #BFF8EE, #7FE7D6);
                    border: none;
                    color: #042826;
                    transition: all 0.15s ease;

                    &:hover {
                        background: linear-gradient(180deg, #DFFDF9, #BFF8EE);
                    }
                }
            }
        }
    }

    /* 背景淡入淡出过渡 */
    .bg-fade-enter-active,
    .bg-fade-leave-active {
        transition: opacity 900ms ease, transform 900ms ease;
    }

    .bg-fade-enter-from,
    .bg-fade-leave-to {
        opacity: 0;
        transform: scale(1.05);
    }

    .bg-fade-enter-to,
    .bg-fade-leave-from {
        opacity: 1;
        transform: scale(1);
    }

    /* 移动端微调 */
    @media (max-width: 720px) {
        padding: 12px;
        padding-top: 80px;

        .vg__wrap {
            padding: 14px;
        }

        .vg__item {
            padding: 10px;
        }

        .vg__header {
            gap: 8px;
        }

        .index {
            min-width: 48px;
            height: 48px;
            font-size: 0.95rem;
        }
    }
}
</style>
