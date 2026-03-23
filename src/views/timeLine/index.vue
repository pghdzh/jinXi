<template>
  <div class="jinxi-page">
    <!-- 动态背景层 -->
    <div class="dynamic-bg">
      <div class="bg-glow-1"></div>
      <div class="bg-glow-2"></div>
      <div class="bg-glow-3"></div>
      <div class="particle-container" ref="particleContainer"></div>
    </div>

    <main class="container">
      <!-- HERO 区域 -->
      <header class="hero">
        <div class="left-col">
          <div class="avatar-card">
            <picture class="avatar-wrap">
              <img
                src="@/assets/images1/2 (4).webp"
                class="avatar"
                loading="lazy"
                alt="今汐"
              />
            </picture>
            <div class="avatar-meta">
              <span class="avatar-badge">共鸣能力：寒尽觉春生</span>
            </div>
          </div>
        </div>
        <div class="right-col">
          <div class="hero-panel">
            <h1 class="name">今汐 <span class="jp">（今州令尹）</span></h1>
            <p class="subtitle">身承岁主之责，心系凡尘之愿。</p>
            <p class="lead">
              万丈天光被她化作点点辉芒，温柔地照亮人们的愿望。<br />
              命运向她指明神灵的方向，但她脚下的道路，仍然通向人类的未来。
            </p>
          </div>
        </div>
      </header>

      <!-- 核心机制卡片（技能风格） -->
      <section class="card mechanism">
        <div class="card-head">
          <h2>核心机制</h2>
          <div class="head-icon">⚙️</div>
        </div>
        <ul class="traits">
          <li>
            <strong>【韶光值】</strong
            >：血量上方上限50点的能量条。今汐释放<strong>惊龙破空·炳星（E4）</strong>时，消耗全部【韶光值】以提升伤害。
          </li>
          <li>
            <strong>【韶光值】获取方式</strong
            >：<br />1、每种属性伤害，每3秒可获得1点【韶光值】<br />2、每种属性的协同伤害，每3秒可获得2点【韶光值】<br />每种方式、每种属性的冷却时间相互独立。
          </li>
          <li>
            在释放<strong>延奏技能</strong>后，获得韶光值的冷却时间会缩减至1秒，持续20秒。
          </li>
          <li class="highlight">输出流程：</li>
          <li><strong>A-A-A-A / 变奏入场-E2-A-A-Q-E3-A-A-E4-R</strong></li>
          <li>
            技能缩写：普攻 = A，重击 = Z，共鸣技能 = E，共鸣解放 = R，声骸 = Q
          </li>
        </ul>
      </section>

      <!-- 角色背景与形象（书卷风格） -->
      <section class="card overview">
        <div class="card-head">
          <h2>角色背景与形象</h2>
          <div class="head-icon">📖</div>
        </div>
        <div class="two-col">
          <div class="text-block">
            <h3>背景</h3>
            <p>
              今令尹今汐，原名汐，出生于今州云霄山，于16年前云霄山残象潮中夭折，后被<strong>“角”</strong>复活，成为了”角”的共鸣者，被“角”带到今州抚养长大。<br />今汐幼时拜<strong>长离</strong>为师，学习武艺和技艺，并在长离的辅佐下，于<strong>豆蔻之年</strong>被岁主“角”任命为今州令尹，仅用3年就让今州走出<strong>弯刀之役</strong>，重获繁荣。
            </p>
          </div>
          <div class="text-block">
            <h3>外貌／着装</h3>
            <p>
              今汐有着<strong>银白色的长发</strong>，长发挽成两股清新自然的马尾，而更罕见的是今汐那<strong>清澈明亮的淡色眼眸</strong>以及空灵清绝的容颜。<br />今汐衣着黑色超短裙内衬，外套月白色点缀的衣裳，剪裁别致，以白色和黑色为主色调，装饰有金色的边饰和图案，外衣左前方由腰到裙摆装饰着一条<strong>金色的中华龙尾</strong>。
            </p>
          </div>
        </div>
      </section>

      <!-- 共鸣状况（频谱风格） -->
      <section class="card resonance">
        <div class="card-head">
          <h2>共鸣状况</h2>
          <div class="head-icon">📊</div>
        </div>
        <div class="resonance-content">
          <h3>鉴定依据：【频谱检验报告RA2100-G】</h3>
          <p>
            无明确共鸣时间，主诉于幼年时期已出现觉醒征兆，能与岁主「角」互相感应。<br />
            对象声痕位于背部正中，共鸣后部分体征发生变化，共鸣能力发动时，颅顶会长出类龙角状结晶物质。<br />
            对象可凝聚淡色天光，汇聚成类岁主形光芒，经测试可确认，该光芒有着与岁主相似的力量。<br />
            经观察，该对象的共鸣能力具有罕见的成长性，成长至最佳状态时，或许可以流转时光。<br />
            共鸣频谱检验图与已知岁主频率波动区间接近，测试有较强的谐振反应，但由于岁主特殊性，无法完全确认共鸣源。<br />
            受试样本拉贝尔曲线不具收敛性，具有显著周期性特征，检测结果判断为先天型共鸣者。
          </p>
          <h3>超频诊断报告</h3>
          <p>
            波形检验图呈椭圆形波动，时域表示稳定，未见异常波形。<br />
            诊断结果：超频临界值极高，稳定性极高，几乎可以肯定无超频风险。<br />
            无过往超频史。 建议按时进行定期检查，暂无需心理辅导。
          </p>
        </div>
      </section>

      <!-- 特殊物品区（四格卡片，带光效） -->
      <div class="items-grid">
        <section
          class="card special-item"
          v-for="item in specialItems"
          :key="item.title"
        >
          <div class="card-head">
            <h2>{{ item.title }}</h2>
            <div class="head-icon">{{ item.icon }}</div>
          </div>
          <div class="item-content">
            <div class="img-area">
              <img :src="item.img" :alt="item.title" loading="lazy" />
            </div>
            <div class="text-block">
              <p
                v-for="(line, idx) in item.text"
                :key="idx"
                :class="{ quote: idx === item.text.length - 1 && item.quote }"
              >
                {{ line }}
              </p>
            </div>
          </div>
        </section>
      </div>

      <!-- 共鸣链详解（龙纹装饰） -->
      <section class="card timeline">
        <div class="card-head">
          <h2>共鸣链详解</h2>
          <div class="head-icon">🐉</div>
        </div>
        <div class="tl-wrap">
          <div class="vl" aria-hidden="true"></div>
          <ol class="tl-list">
            <li v-for="(ev, i) in timeline" :key="i" class="tl-item">
              <div class="tl-card">
                <h3 class="tl-title">第 {{ i + 1 }} 链 · {{ ev.title }}</h3>
                <p class="tl-desc">{{ ev.desc }}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <!-- 今汐纪事（轮播，配卷轴风格） -->
      <section class="card stories-carousel" ref="storyRef">
        <div class="card-head">
          <h2>今汐纪事</h2>
          <div class="head-icon">📜</div>
        </div>
        <div class="story-container">
          <transition name="fade-slide" mode="out-in">
            <article :key="items[current].id" class="story">
              <h3 class="story-head">{{ items[current].title }}</h3>
              <div class="story-content">{{ items[current].content }}</div>
            </article>
          </transition>
          <div class="carousel-nav">
            <button class="nav-btn" @click="prev" aria-label="上一则故事">
              ‹
            </button>
            <span class="pager">{{ current + 1 }} / {{ items.length }}</span>
            <button class="nav-btn" @click="next" aria-label="下一则故事">
              ›
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

// 共鸣链数据
const timeline = ref([
  {
    title: "沉海洄天溯",
    desc: "今汐施放普攻凌霄·普攻、共鸣技能逐天取月时，获得一层惊蛰效果，可叠加4层，持续6秒。施放共鸣技能惊龙破空时，消耗惊蛰效果的所有层数，每消耗一层，共鸣技能惊龙破空造成的伤害提升20%。",
  },
  {
    title: "绒雪凝屏息",
    desc: "今汐处于非战斗状态大于4秒时，回复50点【韶光】，每4秒只生效1次。",
  },
  {
    title: "天定神子身",
    desc: "今汐施放变奏技能蟠龙清辉后，获得一层谪仙效果，每层使攻击提升25%，可叠加2层，效果持续20秒。",
  },
  {
    title: "自甘佑凡尘",
    desc: "今汐施放共鸣解放移岁诛邪或共鸣技能惊龙破空时，附近队伍中所有角色全属性伤害加成提升20%，持续20秒。",
  },
  { title: "流光化霜雪", desc: "共鸣解放移岁诛邪伤害倍率提升120%。" },
  {
    title: "寒尽又逢春",
    desc: "共鸣技能惊龙破空伤害倍率提升45%，消耗【韶光】时带来的倍率增加效果额外提升45%。",
  },
]);
import foodImg from "./img/food.png";
import item1Img from "./img/item1.png";
import item2Img from "./img/item2.png";
import item3Img from "./img/item3.png";
// 特殊物品数据
const specialItems = ref([
  {
    title: "迎春酥",
    icon: "🌸",
    img: foodImg,
    text: [
      "乘霄山特色糕点雪莲酥——今汐改良版。霜雪无言，星星点点的愿望随着冬日的雪点静静飘落，卧于山林。",
      "然而千年如一日飘落的白雪终会被迟来的春风吹拂……届时，深埋雪中的愿望将如花蕾般悄然绽放。",
    ],
    quote: false,
  },
  {
    title: "小龙包",
    icon: "🥟",
    img: item1Img,
    text: [
      "一盘今汐亲手制作的小龙包，粉嘟嘟的小龙包上撒着甜甜的桂花糖粉。",
      "这一盘小龙包口味各异，有蛋奶馅儿的、莲蓉馅儿的、豆沙馅儿的……甚至连冰皮的都准备了。",
      "“马上就要面见贵客了……不知道漂泊者喜欢哪种口味的呢？”",
    ],
    quote: true,
  },
  {
    title: "待办清单",
    icon: "📋",
    img: item2Img,
    text: [
      "令尹总是很忙，夜归部署、天工事务、巡尉安防……今州城里的桩桩件件都等着她一一过目。",
      "待办文件堆满了边庭的办公桌，但光凭文件并不能做出最准确，或者说最合适的判断……今汐喜欢亲临现场，亲自倾听民众的诉求。",
      "于是今汐拜托华胥研究院开发了一个方便随身携带的电子版待办清单，以便在外出时随时批阅文件。",
    ],
    quote: false,
  },
  {
    title: "龙鳞",
    icon: "🐉",
    img: item3Img,
    text: [
      "今汐幼年时经常卧床梦魇。",
      "有一次，她在梦中溺水，被卷入海浪之中，即将沉往海底。这时飘过一块浮木，她紧紧抓住浮木，顺着逆流的潮汐回到岸边。",
      "醒来后，她手里抓着的，竟是一块鳞片。仔细看会发现，这鳞片似乎和岁主身上的有些相似……",
    ],
    quote: false,
  },
]);

// 纪事数据（完整保留原内容）
const items = [
  {
    id: "legend",
    title: "令尹之名",
    content: `今州城地处边塞，提起边塞，大多给人穷天极地、荒山僻壤的印象。

从未去过今州城的行商接到前往今州的单子，连忙摆手推托：“我身体不好，要去那么远的边陲之地，我可受不了。”

前辈却只是笑笑：“今州城那地方，你去了才知道。”

行商被前辈半哄半推着上了路。两人穿过荒瘠蛮地、瘴雾丛林，终于来到了一片山清水秀、风光明媚的地方。

高耸的城门矗立在林道的尽头，门口站岗的士兵亲切友好，检查过证件，便客客气气放两人进了城。

城中民熙物阜、政通人和，半点没有囿于边疆，荒凉垂败之色。白墙黑瓦、碧池彩鲤，城中景色一点都不输物产丰饶的内陆之地。在城内走两圈，喝上一壶六羡茶馆的工夫茶，吃上一碟攀花饭馆的龙抬头，看上一场今州剧院的英雄戏，跋山涉水的疲惫被今州独有的风貌人情一扫而光，心中的疑虑也被今州热情质朴的民风吹得烟消云散了。

“都说今州偏远，没想到这么丰饶啊，跟个桃花源似的！要在这边陲之地把房子建成这样，可不容易吧？”

“那可不，令尹说了，甭管在什么地方，自己想过什么日子，就努力过什么日子。管它荒山残象，先建了再说。毕竟在不幸到来之前，还有很多幸福的日子可以过呢。”

“嗯，理是这么个理，做起来可就没那么容易咯。况且你们一城的人，家家户户都是如此，实在难得啊。”

“有什么难的，跟着令尹就行了。桩桩件件，都有令尹带着我们呢。”

“你们这令尹，看事情这么通透，还能身体力行地带着你们落实，实在是不简单啊。肯定是老江湖了吧？”

“老什么呀，令尹年轻着呢，才十几岁！”

“十几岁？！”`,
  },
  {
    id: "wish",
    title: "许愿之俗",
    content: `今汐刚被选为令尹时年纪尚幼、资历尚浅，人们信任的多半是岁主的选择，是岁主共鸣者的身份，而不是今汐本身。

作为一名合格的令尹，即使开局不利，也得用尽全力将今州引领至更好的未来。况且，信任是要靠自己的能力去争取的，今汐很清楚这点。

比起眼中的怀疑，今汐更在意城民们脸上的疲态——那是一种被生活的苦痛反复碾压，丧失了希望的疲态。

今汐知道，比起物资匮乏、内忧外患的环境，更难的是让被生活摧残得早已丧失气力的人们恢复期盼明天的勇气和信心。

在这种情况下，人们需要一个可以信任的精神寄托，而这个寄托是不是目前的自己，并不重要。

于是，在一次灾后重建中，少女令尹上演了一场“岁主与愿”的“神迹”。这处村庄地势偏远，残象潮虽已退却，连年的频率紊乱却导致了持续异常，乌云压城，雪凝不化。

少女令尹请村民说出自己的愿望。刚开始无人回应，直到一声喷嚏打破寂静，紧接着，一个小小的声音怯生生地哼唧道：“好冷……要是天气没有这么冷就好了。”

今汐站在人群中央，手捧龙鳞，闭目颔首：“我会向岁主传达你的愿望。”

霎时，她的头上生出龙角，一道形似岁主的光芒划破黑压压的乌云，击穿地上的积雪——霎时间，冰消雪融，寒去春来。

众人惊叹：“岁主……岁主显灵了！”龙形天光倒映在人们的眼中，重新点燃了希望的光芒。

一传十、十传百，许愿的习俗逐渐风靡今州。

大大小小的愿望在边庭附近聚集，传进少女令尹的耳中。

她从这些细碎的愿望中找出关键的信息，制定对应的策略。

“担心残象溜进城里。”——任命桃祈为天工防事科事务长，带头升级边防城墙。

“希望战争早点结束，爸爸早点回家。”——将黑石武器科和工学材料科并列为重点研究科，一边应对进化的残象开发新型武器，一边升级防护材料，边攻边守，齐头并进。

“城里混进了流寇，害怕。”——增设巡宁所，增加巡尉数量，夜归攘外，巡尉安内。

不出三年，边防城墙焕然一新，新型武器横空出世，残象潮败退至百里之外，城中政通人和，物埠民丰。

人们逐渐发现，所谓“岁主与愿”，只是少女令尹开的一个善意的玩笑。

毕竟，无论今州境内发生什么事情，令尹都会第一时间赶到现场，亲自了解状况，解决民众们的难题。

毕竟，边庭办公室的灯光永不熄灭，即便是节假日的深夜，令尹也一边聆听着大家的愿望，一边奋笔疾书。

毕竟，即使令尹的手中并没有龙鳞，也一样可以唤来破冰的天光，一样可以使时间流转，寒尽春来。

……

时至今日，许愿已经成为了人们的习惯，成为了人们与令尹之间心照不宣的默契。

“希望令尹别那么忙，有空休息休息，和大家一起看看戏。”这是今年最后一个愿望。

今汐笑了笑，合上手中的文件，侧身靠在边庭的窗户上，闭眼倾听起今州剧院那边传来的，新戏《龙女与愿》的婉转唱腔。</p>`,
  },
  {
    id: "warmth",
    title: "暖心之举",
    content: `今令尹总是温和地笑着：“眼下要做的事情还有很多，但请放心，我会带领大家。”

彼时残象肆虐，将士们在前线杀敌，人们担心再也见不到出发去前线的亲人，也担心临行前的告别即是永别。

新上任的少女令尹见多了人们目中无光、哭丧着脸的模样，她不忍在大家的愁苦上再添一份愁苦。

况且，作为一州令尹，如果连她都哭丧着脸，势必会动摇大家好不容易重新建立起来的信心。

所以，她必须将今州人民所有的苦难和犹疑都抵挡在身后。

没有实绩支撑的笑容会被认为是伪善敷衍、或者上位者高高在上的不知人间疾苦。所以她的笑容背后，有着废寝忘食的筹谋，有着尽心竭力的付出。

战场上夜归战士们骁勇奋战，殊死拼搏。城内不比前线腥风血雨，却也是一场漫长而辛劳的无声战役。

出征士兵的家人们时刻牵挂着前线的亲人，到了食不下咽、寝不安稳的境地。无音区没有信号，终端无法实时通讯，令尹就联合天工和呜呜物流，开办军中特快专递活动。呜呜物流免费以极快的速度为士兵们传递家书，天工则配合修建一些便捷道路作为支持。如此一来，城民们可以及时了解到亲人在军中的情况，悬着的心也就放了下来。

战死士兵的家人们经历了骨肉分离的切肤之痛，只给抚恤金并不足够。令尹联合军策府和天工商量对策，先是提高了抚恤金的数额，确保英烈家属后世无忧。再是给予相应的荣誉，虽然夜归战士们并非因为看重荣誉才奔赴战场，但每一名战士的付出都该被铭记。边墙升级完成后，鸣钟广场成为了下一个重点基建项目。镌刻战士姓名的石碑选用虎口矿场勘探出的上好矿石制作而成，风吹不坏，雨打不腐，坚硬如铁，可保千年不蠹。鸣钟广场建成后，人们多了一个纪念凭吊之所，心里也就多了一分慰藉。

如此种种安抚善后之事，令尹总是亲力亲为。人们一看到令尹温和的笑容，就知道她会带来和笑容同样温暖人心的政策。

这样的温暖抚平了些许战争带给人们的伤痛，带领今州城中的百姓熬过战争的寒冬。`,
  },
  {
    id: "anger",
    title: "难见之怒",
    content: `今令尹是个难得的好脾气，遇到什么事情都保持着大方得体的笑容，几乎没有人见过她发怒。

“你说，咱们的今令尹是不是不会生气呀？无论什么时候，都是温柔大方、游刃有余的样子。”

“是哦，话说我还有点好奇，那么温和的人，生起气来会是什么样子呢……”

“我见过。”平时沉默寡言只管闷头干活的矿工阿实开了口。

那是一个异常寒冷的深冬，矿上刚结了一笔工程款，却被承包商悉数吞下，借口说什么设备使用过度，要收损耗费。

战火刚熄，令尹新任，到处都是一副百废待兴的模样。土木建设对矿产的需求量大，天工自有的勘探设备不够用，就租借了私有的。没想到那商人竞标时有多积极，结款时就有多无赖。更可恶的是，他身为商会会长，仗着自己垄断了市场上的勘探设备，根本不把大小官员放在眼里。

辛苦了一整年，就等着结款回家过个好年，如今这朴素的愿望却要落空了……阿实看了看自己粗糙、布满裂痕的双手，又想起工友德彪说的，当老实人没前途，不如狠狠心干一票，去抢了那奸商，反正也是不义之财，抢就抢了。

月黑风高，阿实跟着其他工友悄摸潜进商人的府邸，壮着胆子将耳朵贴在门上，仔细听着门内的动静，准备寻找恰当的时机冲进去。

“朱老板，我来做个简短的通知。”听着是一个少女的声音，温柔大方，细听却透着一股寒意，“你被商会除名了，经营资格也被吊销，以后无权参加任何今州的商业活动。”

“哦？今州不是最讲求法度吗？你这小令尹莫非是刚上任不懂事？除名商会会长的流程怎么也得两周吧？吊销经营资格也需要实质性的证据，可不是你空口白牙就能吊销的。”

“既然你提到法律，我就同你讲讲法律。今州商业律法第一百八十条，除名商会会长需要超过商会半数成员签字同意，并由天工商务部部长、天工事务长签字同意，最终由令尹签字同意。等令尹签完再层层传回，确实需要多花费一些时日……所以，我亲自出现在这里告诉你这个结果，便是为了省下这些时间。这样，工人们才能早点拿回钱款。”

“至于证据嘛……我从不打无准备之仗，证据早已由巡宁所收集完毕，递交律令院了。”

“还有你那引以为豪的垄断设备，其实早在矿场动工的第一天，我就叫天工加紧生产设备，今天刚落地一批。至于你的那些，不过是临时借用罢了。”

后面的话阿实没有听清，屋内传来一阵嘈杂，似乎有人在试图挣扎辩解。但在绝对的证据、万全的准备面前，这种挣扎不过是徒劳。

不一会儿，阿实的终端上传来了入账信息——正是那笔大家应得的工程款。这下，可以过个好年了。

此后，矿上再也没有发生过这种情况——令尹颁布了新的律法，禁止任何人垄断市场，还更改了资金结算方式：在结款给商户之前，会优先发放工人们应得的工资。

度过了这个冬天，年年都是好年。

“阿实你快说呀，令尹生气是什么样子的？"

“嗯……令尹生起气来也不可怕，反倒……令人安心。”

“什么嘛？！”`,
  },
  {
    id: "concern",
    title: "在意之人",
    content: `大家都说今令尹虽然年纪不大，但是智谋无双，没有什么事情是她不知道的，没有什么事情是她做不成的。

毕竟，她刚上任就快速了解了城内外的各种动向，颁布了一项又一项利民政策，春芒化雪，济世安民。

作为今令尹，自然得对今州发生的所有事情都了如指掌，大到军政民生，小到……不，只要会影响民众的事情，就不能算小事。这是今汐对自己的要求。

但最近她不得不承认，有个对今州十分重要的人，以及和那个人相关的大部分事，她都不清楚……或许正因如此，她对那人格外上心。

根据今州类书记载，曾经有一位能够肉身吸收残象的英雄，在今州乃至整个瑝珑的历史上留下了浓墨重彩的一笔。

而如今，有一位奇异之人即将现世，此人或许与那位英雄有着千丝万缕的联系……

她知道贵客身份特殊，一旦苏醒，就必处于风暴的中央。于是，她筹谋规划，用自己的方式迎接这位贵客。她录下全域通讯留言——没有指明特点，以亲切友善的态度迎接每一位来到今州的客人，让人们感受到宾至如归的温暖；她传递信物——既能寻得与她心有灵犀的贵客，又能引出潜藏在暗处蠢蠢欲动、侵扰贵客、为祸今州的隐患。

她担心贵客的安危，派出贴身近卫暗中保护；她调动一切可调动的资源，以恰到好处的分寸帮助贵客破解了一个又一个迷局……她历经千辛万苦，只为按时回到今州，以赴三日之约。

乘霄山原为一处避世桃源，而现今岁主遇险，机关奇诡、神秘红衣在纯白的雪中时隐时现……种种风诡云谲在岁主休憩的平静之地掀起波澜。少女令尹只身入局，一边抵御各种困难，一边探寻岁主的消息。即便强大如令尹，孤身一人踏入如此莫测之境，也很难全身而退。每当她伤痕累累，遥觉前路艰险，她都会模模糊糊看见一个身影，一个正在等待着她的身影——正是那位贵客。苏醒后的贵客已经身体力行地了解了动荡的当下，知悉了飘摇的过往，正等着她一同做出正确的决断，将今州引领至胜利的未来。

在边庭的露台之上，历经艰险、砥砺而归的少女令尹望着眼前的贵客，目光温柔而欣喜。她颔首致意，落落大方地说出已在心中默念过多遍的开场白：

“三日为期。”

“看来你我都未失约。”

“请容我正式自我介绍一次，我是今汐，很高兴见到你，漂泊者。”`,
  },
];
const current = ref(0);
const storyRef = ref<HTMLElement | null>(null);

function prev() {
  current.value = (current.value - 1 + items.length) % items.length;
  storyRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}
function next() {
  current.value = (current.value + 1) % items.length;
  storyRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// 动态粒子背景 (Canvas)
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let animationId: number | null = null;
let particles: Array<{
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  alpha: number;
}> = [];

const initParticles = () => {
  const container = document.querySelector(
    ".particle-container"
  ) as HTMLElement;
  if (!container) return;
  canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  container.appendChild(canvas);
  ctx = canvas.getContext("2d");
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  generateParticles();
  animate();
};

const resizeCanvas = () => {
  if (!canvas || !ctx) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  ctx.scale(1, 1);
};

const generateParticles = () => {
  const count = Math.min(80, Math.floor(window.innerWidth / 20));
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.2 + 0.1,
      alpha: Math.random() * 0.5 + 0.2,
    });
  }
};

const animate = () => {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(127, 231, 214, ${p.alpha})`;
    ctx.fill();
    p.x += p.speedX;
    p.y += p.speedY;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;
  }
  animationId = requestAnimationFrame(animate);
};

onMounted(() => {
  initParticles();
});
onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  window.removeEventListener("resize", resizeCanvas);
  if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
});
</script>

<style scoped lang="scss">
$accent: #7fe7d6;
$accent-2: #d7fff6;
$gold: #e6c77c;
$white: #f0f6fa;
$dark: #021016;
$card-bg: rgba(8, 22, 26, 0.65);
$glass-border: rgba(127, 231, 214, 0.25);
$text-light: rgba(240, 246, 250, 0.92);
$text-muted: rgba(240, 246, 250, 0.7);

.jinxi-page {
  min-height: 100vh;
  background: linear-gradient(145deg, $dark 0%, #06242a 100%);
  color: $white;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto,
    "PingFang SC", sans-serif;
  padding: 80px 24px 60px;
  position: relative;
  overflow-x: hidden;
}

/* 动态背景 */
.dynamic-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;

  .bg-glow-1,
  .bg-glow-2,
  .bg-glow-3 {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.2;
    animation: floatGlow 20s infinite alternate;
  }
  .bg-glow-1 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, $accent, transparent);
    top: -10%;
    left: -10%;
    animation-duration: 18s;
  }
  .bg-glow-2 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, $accent-2, transparent);
    bottom: -20%;
    right: -15%;
    animation-duration: 22s;
    animation-delay: -5s;
  }
  .bg-glow-3 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, $gold, transparent);
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    animation-duration: 25s;
    animation-delay: -8s;
  }
  .particle-container {
    position: absolute;
    inset: 0;
    canvas {
      display: block;
    }
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

/* 卡片通用样式 */
.card {
  background: $card-bg;
  backdrop-filter: blur(12px);
  border-radius: 28px;
  padding: 28px;
  margin-bottom: 28px;
  border: 1px solid $glass-border;
  transition: all 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  animation: cardFadeUp 0.6s ease-out both;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-6px);
    border-color: rgba($accent, 0.6);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba($accent, 0.3) inset;
  }

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba($accent, 0.25);
    h2 {
      font-size: 1.6rem;
      font-weight: 600;
      background: linear-gradient(90deg, $accent-2, $white);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }
    .head-icon {
      font-size: 1.6rem;
      opacity: 0.7;
      filter: drop-shadow(0 0 4px $accent);
    }
  }
}

/* HERO */
.hero {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  margin-bottom: 40px;
  animation: heroFadeIn 0.9s ease-out;

  .avatar-card {
    background: $card-bg;
    backdrop-filter: blur(12px);
    border-radius: 24px;
    padding: 20px;
    border: 1px solid $glass-border;
    transition: all 0.3s;
    text-align: center;
    &:hover {
      transform: translateY(-8px);
      border-color: $accent;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    .avatar-wrap {
      border-radius: 16px;
      overflow: hidden;
      img {
        width: 100%;
        height: auto;
        transition: transform 0.5s;
      }
    }
    &:hover img {
      transform: scale(1.02);
    }
    .avatar-meta {
      margin-top: 16px;
      .avatar-badge {
        background: rgba($accent, 0.12);
        padding: 6px 12px;
        border-radius: 40px;
        font-size: 0.8rem;
        border: 1px solid rgba($accent, 0.3);
        display: inline-block;
      }
    }
  }
  .hero-panel {
    background: $card-bg;
    backdrop-filter: blur(12px);
    border-radius: 24px;
    padding: 32px;
    border: 1px solid $glass-border;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .name {
      font-size: 2.8rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(135deg, $white, $accent-2, $accent);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      .jp {
        font-size: 1rem;
        font-weight: 400;
        background: none;
        -webkit-text-fill-color: $accent-2;
        color: $accent-2;
      }
    }
    .subtitle {
      font-size: 1.2rem;
      color: $accent;
      font-weight: 500;
      margin: 8px 0 0;
    }
    .lead {
      line-height: 1.6;
      color: $text-light;
      margin-top: 16px;
    }
  }
}

/* 核心机制 */
.mechanism .traits {
  list-style: none;
  padding: 0;
  margin: 0;
  li {
    padding: 12px 0;
    border-bottom: 1px dashed rgba($accent, 0.2);
    line-height: 1.5;
    strong {
      color: $accent-2;
      font-weight: 600;
    }
    &.highlight {
      font-weight: 700;
      color: $accent;
      margin-top: 8px;
    }
    &:last-child {
      border-bottom: none;
    }
  }
}

/* 双栏布局 */
.two-col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  .text-block {
    h3 {
      font-size: 1.3rem;
      color: $accent;
      margin-bottom: 12px;
      font-weight: 600;
    }
    p {
      line-height: 1.7;
      color: $text-light;
      strong {
        color: $accent-2;
      }
    }
  }
}

/* 共鸣状况 */
.resonance-content {
  h3 {
    color: $accent-2;
    margin: 1em 0 0.5em;
    font-size: 1.2rem;
  }
  p {
    line-height: 1.7;
    margin-bottom: 1em;
  }
}

/* 特殊物品网格 */
.items-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
  margin-bottom: 28px;
  .special-item {
    margin-bottom: 0;
    .item-content {
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
      .img-area {
        flex: 0 0 140px;
        img {
          width: 100%;
          border-radius: 16px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s;
          &:hover {
            transform: scale(1.03);
          }
        }
      }
      .text-block {
        flex: 1;
        p {
          line-height: 1.5;
          margin: 0 0 8px;
          strong {
            color: $accent-2;
          }
          &.quote {
            font-style: italic;
            color: $accent;
            border-left: 2px solid $accent;
            padding-left: 12px;
          }
        }
      }
    }
  }
}

/* 共鸣链时间线 */
.timeline {
  .tl-wrap {
    position: relative;
    padding: 20px 0 20px 100px;
    .vl {
      position: absolute;
      left: 56px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(180deg, $accent, transparent);
      opacity: 0.5;
    }
    .tl-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .tl-item {
      margin: 28px 0;
      .tl-card {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 20px;
        padding: 20px 24px;
        transition: all 0.3s;
        &:hover {
          background: rgba($accent, 0.08);
          transform: translateX(8px);
        }
        .tl-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: $accent;
          margin-bottom: 8px;
        }
        .tl-desc {
          color: $text-light;
          line-height: 1.5;
        }
      }
    }
  }
}

/* 纪事轮播 */
.stories-carousel {
  .story-container {
    position: relative;
    min-height: 320px;
    .story {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 20px;
      padding: 24px;
      .story-head {
        font-size: 1.4rem;
        color: $accent-2;
        margin-bottom: 16px;
        font-weight: 700;
      }
      .story-content {
        white-space: pre-wrap;
      }
    }
    .carousel-nav {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 24px;
      .nav-btn {
        background: rgba($accent, 0.1);
        border: 1px solid rgba($accent, 0.3);
        color: $accent-2;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.2s;
        &:hover {
          background: rgba($accent, 0.3);
          transform: scale(1.05);
        }
      }
      .pager {
        font-size: 0.9rem;
        color: $text-muted;
        align-self: center;
      }
    }
  }
}

/* 动画 */
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
@keyframes cardFadeUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes heroFadeIn {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.35s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 响应式 */
@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    .avatar-card {
      max-width: 280px;
      margin: 0 auto;
    }
    .hero-panel .name {
      font-size: 2rem;
    }
  }
  .items-grid {
    grid-template-columns: 1fr;
    gap: 24px;
    .special-item .item-content {
      flex-direction: column;
      text-align: center;
      .img-area {
        flex: 0 0 auto;
        max-width: 200px;
        margin: 0 auto;
      }
    }
  }
  .timeline .tl-wrap {
    padding-left: 20px;
    .vl {
      display: none;
    }
  }
}
</style>
