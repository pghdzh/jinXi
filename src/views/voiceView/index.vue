<template>
    <section class="voice-gallery" aria-label="珂莱塔 · 语音馆">
   
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
                        <h1 class="title">长离 · 语音馆</h1>
                        <p class="subtitle">局未终，人仍在。</p>
                    </div>
                </div>
            </header>

            <!-- 列表（已解锁放前，未解锁放后） -->
            <ul class="vg__list" role="list">
                <li v-for="id in allVoiceIds" :key="id" class="vg__item"
                    :class="{ unlocked: isUnlocked(id), locked: !isUnlocked(id), playing: id === currentId }">
                    <div class="item__left">
                        <div class="index">{{ String(id).padStart(3, '0') }}</div>
                        <div class="info">
                            <div class="name">语音 {{ String(id).padStart(3, '0') }}</div>
                            <div class="note" v-if="isUnlocked(id)">已解锁</div>
                            <div class="note note--locked" v-else>未解锁</div>
                        </div>
                    </div>

                    <div class="item__right">
                        <button class="btn btn--icon" :disabled="!isUnlocked(id)" @click="playEntry(id)"
                            :title="isUnlocked(id) ? (currentId === id && isPlaying ? '暂停' : '播放') : '尚未解锁'">
                            <span v-if="!isUnlocked(id)">🔒</span>
                            <span v-else-if="currentId === id && isPlaying">❚❚</span>
                            <span v-else>▶</span>
                        </button>

                        <a v-if="isUnlocked(id)" :href="voicePath(id)" :download="`audio_${id}.mp3`" title="下载">
                            <el-button type="primary" :icon="Download" circle />
                        </a>
                        <span v-else class="btn btn--hint" aria-hidden="true">—</span>
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
const TOTAL_VOICES = 30; // 语音总数，按实际替换
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

/* 已解锁集合（由 localStorage.triggeredVoices 提供，数组） */
const unlockedSet = ref<Set<number>>(new Set<number>());

function loadUnlocked() {
    try {
        const raw = localStorage.getItem('triggeredVoices') || '[]';
        const arr = JSON.parse(raw);
        const s = new Set<number>();
        if (Array.isArray(arr)) {
            arr.forEach((v: any) => {
                const n = Number(v);
                if (!Number.isNaN(n)) s.add(n);
            });
        }
        unlockedSet.value = s;
    } catch (e) {
        console.warn('读取 triggeredVoices 失败', e);
        unlockedSet.value = new Set<number>();
    }
}

/* 生成所有 id，并保持已解锁在前、未解锁在后 */
const allIds = Array.from({ length: TOTAL_VOICES }, (_, i) => i);
const allVoiceIds = computed(() => {
    const unlocked = Array.from(unlockedSet.value).filter(n => allIds.includes(n)).sort((a, b) => a - b);
    const locked = allIds.filter(id => !unlockedSet.value.has(id));
    return [...unlocked, ...locked];
});

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
function isUnlocked(id: number) {
    return unlockedSet.value.has(id);
}

async function playEntry(id: number) {
    if (!isUnlocked(id)) return;
    // 同一条 -> 切换暂停/恢复
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

/* 监听 storage 事件（跨 tab 更新） */
function onStorage(e: StorageEvent) {
    if (e.key === 'triggeredVoices') loadUnlocked();
}

/* 生命周期 */
onMounted(() => {
    loadUnlocked();
    window.addEventListener('storage', onStorage);
    window.addEventListener('resize', handleResize);

    // 如果数组为空（没有图片），也避免报错：确保至少有一个占位空数组
    if (!randomFive.value.length && allSrcs.length) randomFive.value = shuffle(allSrcs).slice(0, Math.min(5, allSrcs.length));
    if (!randomFive2.value.length && allSrcs2.length) randomFive2.value = shuffle(allSrcs2).slice(0, Math.min(5, allSrcs2.length));

    // 启动轮播
    startBgTimer();
});

onBeforeUnmount(() => {
    window.removeEventListener('storage', onStorage);
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
/* 长离风格：暗匣底色 + 余焰点缀（颜色写死） */
.voice-gallery {
    position: relative;
    min-height: 560px;
    font-family: "PingFang SC", "Noto Sans SC", system-ui, -apple-system, "Segoe UI",
        Roboto, "Helvetica Neue", Arial;
    color: #f5e6d9;
    /* 纸色文字 */
    overflow: hidden;
    padding: 28px;
    padding-top: 80px;
    background: linear-gradient(180deg, #100603 0%, #140704 40%, #0b0503 100%);
    -webkit-font-smoothing: antialiased;

    /* 背景轮播层（余焰暖影）*/
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
                filter: brightness(0.72) contrast(0.92) saturate(0.9);
                mix-blend-mode: screen;
            }

            .bg-img.active {
                opacity: 1;
                transform: scale(1);
                filter: brightness(0.9) contrast(1) saturate(1.06) sepia(0.06);
            }
        }
    }

    /* 前景容器（暗匣玻璃 + 余焰边） */
    .vg__wrap {
        position: relative;
        z-index: 2;
        max-width: 980px;
        margin: 0 auto;
        border-radius: 14px;
        padding: 18px;
        box-shadow: 0 12px 48px rgba(4, 6, 6, 0.72), inset 0 1px 0 rgba(255, 220, 190, 0.02);
        background: linear-gradient(180deg, rgba(12, 6, 4, 0.6), rgba(8, 4, 3, 0.45));
        border: 1px solid rgba(255, 140, 90, 0.04);
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

            /* 右侧：焰棋徽（替代晶格） */
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

                background: linear-gradient(180deg, rgba(10, 6, 4, 0.92), rgba(12, 8, 6, 0.94));
                border: 1px solid rgba(255, 120, 70, 0.06);
                box-shadow: 0 8px 30px rgba(6, 4, 4, 0.64), inset 0 1px 0 rgba(255, 160, 110, 0.02);
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
                    fill: #ff9a66;
                    opacity: 0.14;
                    transition: fill 260ms, opacity 260ms, transform 260ms, filter 260ms;
                    filter: drop-shadow(0 8px 20px rgba(255, 120, 70, 0.06));
                }

                .ember-sparks circle {
                    fill: rgba(255, 200, 150, 0.95);
                    opacity: 0;
                    transition: opacity 240ms, transform 360ms;
                }

                &:hover,
                &:focus {
                    transform: translateY(-6px) scale(1.04);
                    box-shadow: 0 28px 86px rgba(8, 4, 4, 0.72), inset 0 1px 0 rgba(255, 160, 110, 0.02);
                    background: linear-gradient(180deg, rgba(14, 8, 6, 0.96), rgba(16, 10, 8, 0.98));



                    .ember-core path {
                        opacity: 1;
                        transform: scale(1.03);
                        fill: #ff9a66;
                        filter: drop-shadow(0 18px 46px rgba(255, 120, 70, 0.12));
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



                /* 动画：浮动 / 框体摆动 / 核心呼吸 / 火星上浮 */
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
                    filter: drop-shadow(0 6px 18px rgba(255, 120, 70, 0.06));
                }

                50% {
                    transform: scale(1.04);
                    opacity: 1;
                    filter: drop-shadow(0 18px 46px rgba(255, 140, 80, 0.12));
                }

                100% {
                    transform: scale(1);
                    opacity: 0.9;
                    filter: drop-shadow(0 6px 18px rgba(255, 120, 70, 0.06));
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
                    /* 暖金渐变文字 */
                    background: linear-gradient(90deg, #ffd9b8 0%, #ffb37a 50%, #ff8a4a 100%);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    -webkit-text-fill-color: transparent;
                    text-shadow: 0 6px 20px rgba(10, 6, 6, 0.6);
                    letter-spacing: 0.4px;
                }

                .subtitle {
                    margin: 4px 0 0;
                    color: rgba(245, 230, 214, 0.85);
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
            background: linear-gradient(180deg, rgba(255, 140, 90, 0.12), rgba(180, 90, 50, 0.12));
            border-radius: 8px;
            border: 2px solid transparent;
            background-clip: padding-box;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }
    }

    /* 每一项卡片（暗匣 + 余焰边） */
    .vg__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 14px;
        background: linear-gradient(90deg, rgba(18, 12, 10, 0.72), rgba(12, 8, 6, 0.78));
        border: 1px solid rgba(180, 110, 60, 0.06);
        backdrop-filter: blur(4px);
        transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, opacity 0.18s ease;

        &.playing {
            transform: translateY(-4px);
            box-shadow: 0 0 42px rgba(255, 120, 70, 0.14), inset 0 2px 12px rgba(255, 140, 90, 0.03);
            border-color: rgba(255, 140, 90, 0.18);
        }

        &.locked {
            opacity: 0.5;
            filter: grayscale(20%) brightness(0.82);

            .note--locked {
                color: #6a7376;
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
                background: linear-gradient(180deg, #ffdab3 0%, #ffb37a 60%);
                color: #1a0b06;
                font-weight: 800;
                box-shadow: 0 6px 20px rgba(8, 6, 6, 0.36);
                text-shadow: 0 0 6px rgba(0, 0, 0, 0.18);
            }

            .info {
                .name {
                    color: #ffecd9;
                    font-weight: 700;
                    letter-spacing: 0.3px;
                }

                .note {
                    color: #b9bfc3;
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
                    background: linear-gradient(180deg, #ffcf9f, #ff9f5a);
                    color: #1a0804;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 6px 26px rgba(255, 120, 70, 0.12);
                    transition: all 0.15s ease;

                    &:hover {
                        background: linear-gradient(180deg, #ffd8b4, #ffac6b);
                        box-shadow: 0 8px 40px rgba(255, 120, 70, 0.18);
                        transform: translateY(-3px);
                    }
                }

                &--hint {
                    color: #9aa6a9;
                }
            }

            a {
                .el-button {
                    background: linear-gradient(180deg, #ffcf9f, #ff9f5a);
                    border: none;
                    color: #1a0804;
                    transition: all 0.15s ease;

                    &:hover {
                        background: linear-gradient(180deg, #ffd8b4, #ffb07a);
                    }
                }
            }
        }
    }

    /* 过渡效果组（背景淡入淡出）*/
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
