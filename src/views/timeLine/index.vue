<template>
  <div class="megumi-page" aria-live="polite">
    <main class="container" ref="mainContainer">
      <!-- HERO 区域 -->
      <header class="hero" role="banner">
        <div class="left-col">
          <button class="avatar-card">
            <picture class="avatar-wrap">
              <img
                src="@/assets/images1/1 (1).png"
                class="avatar"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <div class="avatar-meta">
              <span class="avatar-badge">共鸣能力：寒尽觉春生</span>
            </div>
          </button>
        </div>
        <div class="right-col" ref="metaCard">
          <div class="hero-panel">
            <h1 class="name">今汐 <span class="jp">（今州令尹）</span></h1>
            <p class="subtitle">焰落不息，誓言仍燃于心。</p>
            <p class="lead">
              万丈天光被她化作点点辉芒，温柔地照亮人们的愿望。
              命运向她指明神灵的方向，但她脚下的道路，仍然通向人类的未来。
            </p>
          </div>
        </div>
      </header>

      <!-- 内容卡片区 -->
      <section id="personality" class="card personality">
        <div class="card-head">
          <h2>核心机制</h2>
        </div>
        <ul class="traits">
          <li>
            【韶光值】：血量上方上限50点的能量条。今汐释放惊龙破空.炳星（E4）时，消耗全部【韶光值】以提升伤害
            。
          </li>
          <li>
            【韶光值】获取方式：1、每种属性伤害，每3秒可以获得1点【韶光值】，2、每种属性的协同伤害，每3秒就可以获得2点【韶光值】
          </li>
          <li>每种方式，每种属性的冷却时间相互独立</li>
          <li>在释放延奏技能后，获得韶光值的冷却时间会缩减至1秒，持续20秒</li>
          <li style="font-weight: bold">输出流程：</li>
          <li>A-A-A-A / 变奏入场-E2-A-A-Q-E3-A-A-E4-R</li>
          <li>
            技能缩写：普攻 = A，重击 = Z，共鸣技能 = E，共鸣解放 = R，声骸 = Q
          </li>
        </ul>
      </section>

      <section id="overview" class="card overview">
        <div class="card-head">
          <h2>角色背景与形象</h2>
        </div>
        <div class="two-col">
          <div class="text-block">
            <h3>背景</h3>
            <p>
              今令尹今汐，原名汐，出生于今州云霄山，于16年前云霄山残象潮中夭折，后被“角”复活，成为了”角”的共鸣者，被“角”带到今州抚养长大。
              今汐幼时拜长离为师，学习武艺和技艺，并在长离的辅佐下，于豆蔻之年被岁主“角”任命为今州令尹，仅用3年就让今州走出弯刀之役，重获繁荣。
            </p>
          </div>
          <div class="text-block">
            <h3>外貌／着装</h3>
            <p>
              今汐有着银白色的长发，长发挽成两股清新自然的马尾，而更罕见的是今汐那清澈明亮的淡色眼眸以及空灵清绝的容颜
              。今汐衣着黑色超短裙内村，外套月白色点缀的衣裳，剪裁别致，以白色和黑色为主色调，装饰有金色的边饰和图案，外衣左前方由腰到裙摆装饰着一条金色的中华龙尾。
            </p>
          </div>
        </div>
      </section>

      <section id="resonance-status" class="card overview">
        <div class="card-head">
          <h2>共鸣状况</h2>
        </div>
        <div class="two-col">
          <div class="text-block">
            <p>
              今汐波形检验图呈椭圆形波动，时域表示稳定，未见异常波形。超频临界值极高，稳定性极高，几乎可以肯定无超频风险。无过往超频史。今汐可凝聚淡色天光，汇聚成类岁主形光芒，经测试可确认，该光芒有着与岁主相似的力量。经观察，今汐的共鸣能力具有罕见的成长性，成长至最佳状态时，或许可以流转时光。共鸣频谱检验图与已知岁主频率波动区间接近，测试有较强的谐振反应，但由于岁主特殊性，无法完全确认共鸣源。样本拉贝尔曲线不具收敛性，具有显著周期性特征，检测结果判断为先天型共鸣者。建议按时进行定期检查，暂无需心理辅导。
            </p>
          </div>
        </div>
      </section>

      <!-- 新增三大主题区域 -->
      <section id="food" class="card special-section">
        <div class="card-head">
          <h2>迎春酥</h2>
        </div>
        <div class="content two-col">
          <div class="img-area">
            <img
              src="./img/food.png"
              alt="迎春酥"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="text-block">
            <p>
              乘霄山特色糕点雪莲酥——今汐改良版。
              霜雪无言,星星点点的愿望随着冬日的雪点静静飘落,卧于山林。
            </p>
            <p>
              然而千年如一日飘落的白雪终会被迟来的春风吹拂······届时，深埋雪中的愿望将如花蕾般悄然绽放。
            </p>
          </div>
        </div>
      </section>
      <section id="shattered-crystal" class="card special-section">
        <div class="card-head">
          <h2>小龙包</h2>
        </div>
        <div class="content two-col">
          <div class="img-area">
            <img
              src="./img/item1.png"
              alt="小龙包"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="text-block">
            <p>
              一盘今汐亲手制作的小龙包，粉嘟嘟的小龙包上撒着甜甜的桂花糖粉。
            </p>
            <p>
              这一盘小龙包口味各异,有蛋奶馅儿的、莲蓉馅儿的、豆沙馅儿的………甚至连冰皮的都准备了。
            </p>
            <p>“马上就要面见贵客了……不知道漂泊者喜欢哪种口味的呢? "</p>
          </div>
        </div>
      </section>

      <section id="cyclic-clock" class="card special-section">
        <div class="card-head">
          <h2>待办清单</h2>
        </div>
        <div class="content two-col">
          <div class="img-area">
            <img
              src="./img/item2.png"
              alt="待办清单"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="text-block">
            <p>
              令尹总是很忙，夜归部署、天工事务、巡尉安防……今州城里的桩桩件件都等着她一一过目。
            </p>
            <p>
              待办文件堆满了边庭的办公桌，但光凭文件并不能做出最准确，或者说最合适的判断……今汐喜欢亲临现场，亲自倾听民众的诉求。
            </p>
            <p>
              于是今汐拜托华胥研究院开发了一个方便随身携带的电子版待办清单，以便在外出时随时批阅文件。
            </p>
          </div>
        </div>
      </section>

      <section id="collective-album" class="card special-section">
        <div class="card-head">
          <h2>龙鳞</h2>
        </div>
        <div class="content two-col">
          <div class="img-area">
            <img
              src="./img/item3.png"
              alt="龙鳞"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="text-block">
            <p>今汐幼年时经常卧床梦魇。</p>
            <p>
              有一次，她在梦中溺水，被卷入海浪之中，即将沉往海底。这时飘过一块浮木，她紧紧抓住浮木，顺着逆流的潮汐回到岸边。
            </p>
            <p>
              醒来后，她手里抓着的，竟是一块鳞片。仔细看会发现，这鳞片似乎和岁主身上的有些相似……
            </p>
          </div>
        </div>
      </section>

      <section
        id="timeline"
        class="card timeline"
        aria-labelledby="timeline-heading"
      >
        <div class="card-head">
          <h2 id="timeline-heading">共鸣链详解</h2>
        </div>
        <div class="tl-wrap" role="list">
          <div class="vl" aria-hidden="true"></div>
          <ol class="tl-list">
            <li
              v-for="(ev, i) in timeline"
              :key="i"
              class="tl-item"
              role="listitem"
              tabindex="0"
              :aria-label="``"
            >
              <div class="tl-card">
                <h3 class="tl-title">第 {{ i + 1 }} 链 · {{ ev.title }}</h3>
                <p class="tl-desc">{{ ev.desc }}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section class="ll-stories" aria-label="长离的故事合集">
        <div class="card" role="region" aria-labelledby="stories-title">
          <header class="card-head">
            <h2 id="stories-title" class="card-title">今汐纪事</h2>
          </header>

          <main class="card-body">
            <transition name="fade-slide" mode="out-in">
              <article
                :key="items[current].id"
                :id="`panel-${items[current].id}`"
                class="story"
                role="tabpanel"
                :aria-labelledby="`tab-${items[current].id}`"
              >
                <h3 class="story-head">{{ items[current].title }}</h3>
                <div
                  class="story-content"
                  v-html="items[current].content"
                ></div>
              </article>
            </transition>
          </main>

          <footer class="card-foot">
            <button class="nav-btn" @click="prev" aria-label="上一则故事">
              ‹
            </button>
            <div class="pager">{{ current + 1 }} / {{ items.length }}</div>
            <button class="nav-btn" @click="next" aria-label="下一则故事">
              ›
            </button>
          </footer>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const timeline = ref([
  {
    title: "沉海洄天溯",
    desc: `今汐施放普攻凌霄·普攻、共鸣技能逐天取月时，获得一层惊蛰效果，可叠加4层，持续6秒。施放共鸣技能惊龙破空时，消耗惊蛰效果的所有层数，每消耗一层，共鸣技能惊龙破空造成的伤害提升20%。`,
  },
  {
    title: "绒雪凝屏息",
    desc: `今汐处于非战斗状态大于4秒时，回复50点【韶光】，每4秒只生效1次。`,
  },
  {
    title: "天定神子身",
    desc: `今汐施放变奏技能蟠龙清辉后，获得一层谪仙效果，每层使攻击提升25%，可叠加2层，效果持续20秒。`,
  },
  {
    title: "自甘佑凡尘",
    desc: `今汐施放共鸣解放移岁诛邪或共鸣技能惊龙破空时，附近队伍中所有角色全属性伤害加成提升20%，持续20秒。`,
  },
  {
    title: "流光化霜雪",
    desc: `共鸣解放移岁诛邪伤害倍率提升120%。`,
  },
  {
    title: "寒尽又逢春",
    desc: `共鸣技能惊龙破空伤害倍率提升45%，消耗【韶光】时带来的倍率增加效果额外提升45%。`,
  },
]);

const reducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const items = [
  {
    id: "legend",
    title: "令尹之名",
    content: `
      <p>今州城地处边塞，提起边塞，大多给人穷天极地、荒山僻壤的印象。</p>
      <p>从未去过今州城的行商接到前往今州的单子，连忙摆手推托：“我身体不好，要去那么远的边陲之地，我可受不了。”</p>
      <p>前辈却只是笑笑：“今州城那地方，你去了才知道。”</p>
      <p>行商被前辈半哄半推着上了路。两人穿过荒瘠蛮地、瘴雾丛林，终于来到了一片山清水秀、风光明媚的地方。</p>
      <p>高耸的城门矗立在林道的尽头，门口站岗的士兵亲切友好，检查过证件，便客客气气放两人进了城。</p>
      <p>城中民熙物阜、政通人和，半点没有囿于边疆，荒凉垂败之色。白墙黑瓦、碧池彩鲤，城中景色一点都不输物产丰饶的内陆之地。在城内走两圈，喝上一壶六羡茶馆的工夫茶，吃上一碟攀花饭馆的龙抬头，看上一场今州剧院的英雄戏，跋山涉水的疲惫被今州独有的风貌人情一扫而光，心中的疑虑也被今州热情质朴的民风吹得烟消云散了。</p>
      <p>“都说今州偏远，没想到这么丰饶啊，跟个桃花源似的！要在这边陲之地把房子建成这样，可不容易吧？”</p>
      <p>“那可不，令尹说了，甭管在什么地方，自己想过什么日子，就努力过什么日子。管它荒山残象，先建了再说。毕竟在不幸到来之前，还有很多幸福的日子可以过呢。”</p>
      <p>“嗯，理是这么个理，做起来可就没那么容易咯。况且你们一城的人，家家户户都是如此，实在难得啊。”</p>
      <p>“有什么难的，跟着令尹就行了。桩桩件件，都有令尹带着我们呢。”</p>
      <p>“你们这令尹，看事情这么通透，还能身体力行地带着你们落实，实在是不简单啊。肯定是老江湖了吧？”</p>
      <p>“老什么呀，令尹年轻着呢，才十几岁！”</p>
      <p>“十几岁？！”</p>
    `,
  },
  {
    id: "wish",
    title: "许愿之俗",
    content: `
      <p>今汐刚被选为令尹时年纪尚幼、资历尚浅，人们信任的多半是岁主的选择，是岁主共鸣者的身份，而不是今汐本身。</p>
      <p>作为一名合格的令尹，即使开局不利，也得用尽全力将今州引领至更好的未来。况且，信任是要靠自己的能力去争取的，今汐很清楚这点。</p>
      <p>比起眼中的怀疑，今汐更在意城民们脸上的疲态——那是一种被生活的苦痛反复碾压，丧失了希望的疲态。</p>
      <p>今汐知道，比起物资匮乏、内忧外患的环境，更难的是让被生活摧残得早已丧失气力的人们恢复期盼明天的勇气和信心。</p>
      <p>在这种情况下，人们需要一个可以信任的精神寄托，而这个寄托是不是目前的自己，并不重要。</p>
      <p>于是，在一次灾后重建中，少女令尹上演了一场“岁主与愿”的“神迹”。这处村庄地势偏远，残象潮虽已退却，连年的频率紊乱却导致了持续异常，乌云压城，雪凝不化。</p>
      <p>少女令尹请村民说出自己的愿望。刚开始无人回应，直到一声喷嚏打破寂静，紧接着，一个小小的声音怯生生地哼唧道：“好冷……要是天气没有这么冷就好了。”</p>
      <p>今汐站在人群中央，手捧龙鳞，闭目颔首：“我会向岁主传达你的愿望。”</p>
      <p>霎时，她的头上生出龙角，一道形似岁主的光芒划破黑压压的乌云，击穿地上的积雪——霎时间，冰消雪融，寒去春来。</p>
      <p>众人惊叹：“岁主……岁主显灵了！”龙形天光倒映在人们的眼中，重新点燃了希望的光芒。</p>
      <p>一传十、十传百，许愿的习俗逐渐风靡今州。</p>
      <p>大大小小的愿望在边庭附近聚集，传进少女令尹的耳中。</p>
      <p>她从这些细碎的愿望中找出关键的信息，制定对应的策略。</p>
      <p>“担心残象溜进城里。”——任命桃祈为天工防事科事务长，带头升级边防城墙。</p>
      <p>“希望战争早点结束，爸爸早点回家。”——将黑石武器科和工学材料科并列为重点研究科，一边应对进化的残象开发新型武器，一边升级防护材料，边攻边守，齐头并进。</p>
      <p>“城里混进了流寇，害怕。”——增设巡宁所，增加巡尉数量，夜归攘外，巡尉安内。</p>
      <p>不出三年，边防城墙焕然一新，新型武器横空出世，残象潮败退至百里之外，城中政通人和，物埠民丰。</p>
      <p>人们逐渐发现，所谓“岁主与愿”，只是少女令尹开的一个善意的玩笑。</p>
      <p>毕竟，无论今州境内发生什么事情，令尹都会第一时间赶到现场，亲自了解状况，解决民众们的难题。</p>
      <p>毕竟，边庭办公室的灯光永不熄灭，即便是节假日的深夜，令尹也一边聆听着大家的愿望，一边奋笔疾书。</p>
      <p>毕竟，即使令尹的手中并没有龙鳞，也一样可以唤来破冰的天光，一样可以使时间流转，寒尽春来。</p>
      <p>……</p>
      <p>时至今日，许愿已经成为了人们的习惯，成为了人们与令尹之间心照不宣的默契。</p>
      <p>“希望令尹别那么忙，有空休息休息，和大家一起看看戏。”这是今年最后一个愿望。</p>
      <p>今汐笑了笑，合上手中的文件，侧身靠在边庭的窗户上，闭眼倾听起今州剧院那边传来的，新戏《龙女与愿》的婉转唱腔。</p>
    `,
  },

  {
    id: "warmth",
    title: "暖心之举",
    content: `
      <p>今令尹总是温和地笑着：“眼下要做的事情还有很多，但请放心，我会带领大家。”</p>
      <p>彼时残象肆虐，将士们在前线杀敌，人们担心再也见不到出发去前线的亲人，也担心临行前的告别即是永别。</p>
      <p>新上任的少女令尹见多了人们目中无光、哭丧着脸的模样，她不忍在大家的愁苦上再添一份愁苦。</p>
      <p>况且，作为一州令尹，如果连她都哭丧着脸，势必会动摇大家好不容易重新建立起来的信心。</p>
      <p>所以，她必须将今州人民所有的苦难和犹疑都抵挡在身后。</p>
      <p>没有实绩支撑的笑容会被认为是伪善敷衍、或者上位者高高在上的不知人间疾苦。所以她的笑容背后，有着废寝忘食的筹谋，有着尽心竭力的付出。</p>
      <p>战场上夜归战士们骁勇奋战，殊死拼搏。城内不比前线腥风血雨，却也是一场漫长而辛劳的无声战役。</p>
      <p>出征士兵的家人们时刻牵挂着前线的亲人，到了食不下咽、寝不安稳的境地。无音区没有信号，终端无法实时通讯，令尹就联合天工和呜呜物流，开办军中特快专递活动。呜呜物流免费以极快的速度为士兵们传递家书，天工则配合修建一些便捷道路作为支持。如此一来，城民们可以及时了解到亲人在军中的情况，悬着的心也就放了下来。</p>
      <p>战死士兵的家人们经历了骨肉分离的切肤之痛，只给抚恤金并不足够。令尹联合军策府和天工商量对策，先是提高了抚恤金的数额，确保英烈家属后世无忧。再是给予相应的荣誉，虽然夜归战士们并非因为看重荣誉才奔赴战场，但每一名战士的付出都该被铭记。边墙升级完成后，鸣钟广场成为了下一个重点基建项目。镌刻战士姓名的石碑选用虎口矿场勘探出的上好矿石制作而成，风吹不坏，雨打不腐，坚硬如铁，可保千年不蠹。鸣钟广场建成后，人们多了一个纪念凭吊之所，心里也就多了一分慰藉。</p>
      <p>如此种种安抚善后之事，令尹总是亲力亲为。人们一看到令尹温和的笑容，就知道她会带来和笑容同样温暖人心的政策。</p>
      <p>这样的温暖抚平了些许战争带给人们的伤痛，带领今州城中的百姓熬过战争的寒冬。</p>
    `,
  },

  {
    id: "anger",
    title: "难见之怒",
    content: `
      <p>今令尹是个难得的好脾气，遇到什么事情都保持着大方得体的笑容，几乎没有人见过她发怒。</p>
      <p>“你说，咱们的今令尹是不是不会生气呀？无论什么时候，都是温柔大方、游刃有余的样子。”</p>
      <p>“是哦，话说我还有点好奇，那么温和的人，生起气来会是什么样子呢……”</p>
      <p>“我见过。”平时沉默寡言只管闷头干活的矿工阿实开了口。</p>
      <p>那是一个异常寒冷的深冬，矿上刚结了一笔工程款，却被承包商悉数吞下，借口说什么设备使用过度，要收损耗费。</p>
      <p>战火刚熄，令尹新任，到处都是一副百废待兴的模样。土木建设对矿产的需求量大，天工自有的勘探设备不够用，就租借了私有的。没想到那商人竞标时有多积极，结款时就有多无赖。更可恶的是，他身为商会会长，仗着自己垄断了市场上的勘探设备，根本不把大小官员放在眼里。</p>
      <p>辛苦了一整年，就等着结款回家过个好年，如今这朴素的愿望却要落空了……阿实看了看自己粗糙、布满裂痕的双手，又想起工友德彪说的，当老实人没前途，不如狠狠心干一票，去抢了那奸商，反正也是不义之财，抢就抢了。</p>
      <p>月黑风高，阿实跟着其他工友悄摸潜进商人的府邸，壮着胆子将耳朵贴在门上，仔细听着门内的动静，准备寻找恰当的时机冲进去。</p>
      <p>“朱老板，我来做个简短的通知。”听着是一个少女的声音，温柔大方，细听却透着一股寒意，“你被商会除名了，经营资格也被吊销，以后无权参加任何今州的商业活动。”</p>
      <p>“哦？今州不是最讲求法度吗？你这小令尹莫非是刚上任不懂事？除名商会会长的流程怎么也得两周吧？吊销经营资格也需要实质性的证据，可不是你空口白牙就能吊销的。”</p>
      <p>“既然你提到法律，我就同你讲讲法律。今州商业律法第一百八十条，除名商会会长需要超过商会半数成员签字同意，并由天工商务部部长、天工事务长签字同意，最终由令尹签字同意。等令尹签完再层层传回，确实需要多花费一些时日……所以，我亲自出现在这里告诉你这个结果，便是为了省下这些时间。这样，工人们才能早点拿回钱款。”</p>
      <p>“至于证据嘛……我从不打无准备之仗，证据早已由巡宁所收集完毕，递交律令院了。”</p>
      <p>“还有你那引以为豪的垄断设备，其实早在矿场动工的第一天，我就叫天工加紧生产设备，今天刚落地一批。至于你的那些，不过是临时借用罢了。”</p>
      <p>后面的话阿实没有听清，屋内传来一阵嘈杂，似乎有人在试图挣扎辩解。但在绝对的证据、万全的准备面前，这种挣扎不过是徒劳。</p>
      <p>不一会儿，阿实的终端上传来了入账信息——正是那笔大家应得的工程款。这下，可以过个好年了。</p>
      <p>此后，矿上再也没有发生过这种情况——令尹颁布了新的律法，禁止任何人垄断市场，还更改了资金结算方式：在结款给商户之前，会优先发放工人们应得的工资。</p>
      <p>度过了这个冬天，年年都是好年。</p>
      <p>“阿实你快说呀，令尹生气是什么样子的？"</p>
      <p>“嗯……令尹生起气来也不可怕，反倒……令人安心。”</p>
      “什么嘛？！”
    `,
  },

  {
    id: "concern",
    title: "在意之人",
    content: `
      <p>大家都说今令尹虽然年纪不大，但是智谋无双，没有什么事情是她不知道的，没有什么事情是她做不成的。</p>
      <p>毕竟，她刚上任就快速了解了城内外的各种动向，颁布了一项又一项利民政策，春芒化雪，济世安民。</p>
      <p>作为今令尹，自然得对今州发生的所有事情都了如指掌，大到军政民生，小到……不，只要会影响民众的事情，就不能算小事。这是今汐对自己的要求。</p>
      <p>但最近她不得不承认，有个对今州十分重要的人，以及和那个人相关的大部分事，她都不清楚……或许正因如此，她对那人格外上心。</p>
      <p>根据今州类书记载，曾经有一位能够肉身吸收残象的英雄，在今州乃至整个瑝珑的历史上留下了浓墨重彩的一笔。</p>
      <p>而如今，有一位奇异之人即将现世，此人或许与那位英雄有着千丝万缕的联系……</p>
      <p>她知道贵客身份特殊，一旦苏醒，就必处于风暴的中央。于是，她筹谋规划，用自己的方式迎接这位贵客。她录下全域通讯留言——没有指明特点，以亲切友善的态度迎接每一位来到今州的客人，让人们感受到宾至如归的温暖；她传递信物——既能寻得与她心有灵犀的贵客，又能引出潜藏在暗处蠢蠢欲动、侵扰贵客、为祸今州的隐患。</p>
      <p>她担心贵客的安危，派出贴身近卫暗中保护；她调动一切可调动的资源，以恰到好处的分寸帮助贵客破解了一个又一个迷局……她历经千辛万苦，只为按时回到今州，以赴三日之约。</p>
      <p>乘霄山原为一处避世桃源，而现今岁主遇险，机关奇诡、神秘红衣在纯白的雪中时隐时现……种种风诡云谲在岁主休憩的平静之地掀起波澜。少女令尹只身入局，一边抵御各种困难，一边探寻岁主的消息。即便强大如令尹，孤身一人踏入如此莫测之境，也很难全身而退。每当她伤痕累累，遥觉前路艰险，她都会模模糊糊看见一个身影，一个正在等待着她的身影——正是那位贵客。苏醒后的贵客已经身体力行地了解了动荡的当下，知悉了飘摇的过往，正等着她一同做出正确的决断，将今州引领至胜利的未来。</p>
      <p>在边庭的露台之上，历经艰险、砥砺而归的少女令尹望着眼前的贵客，目光温柔而欣喜。她颔首致意，落落大方地说出已在心中默念过多遍的开场白：</p>
      <p>“三日为期。”</p>
      <p>“看来你我都未失约。”</p>
      <p>“请容我正式自我介绍一次，我是今汐，很高兴见到你，漂泊者。”</p>
    `,
  },
];
const current = ref(0);

function select(index) {
  current.value = index;
  // 将焦点移回当前 tab（便于无障碍与键盘导航）
  const id = `tab-${items[index].id}`;
  const el = document.getElementById(id);
  if (el) el.focus();
}

function prev() {
  current.value = (current.value - 1 + items.length) % items.length;
  select(current.value);
}

function next() {
  current.value = (current.value + 1) % items.length;
  select(current.value);
}

onMounted(() => {
  if (!reducedMotion) {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".avatar-card", {
      duration: 0.8,
      y: 18,
      opacity: 0,
      scale: 0.99,
    }).from(
      ".right-col > .hero-panel .name",
      { duration: 0.9, x: 24, opacity: 0 },
      "-=0.45"
    );

    gsap.utils.toArray(".tl-item").forEach((it: any, idx: number) => {
      gsap.from(it.querySelector(".tl-card"), {
        scrollTrigger: {
          trigger: it,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 22,
        duration: 0.7,
        delay: idx * 0.06,
      });
    });

    gsap.to(".avatar-card", {
      scale: 1.007,
      duration: 2.8,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
  } else {
    document.documentElement.classList.add("reduced-motion");
  }
});
</script>

<style scoped lang="scss">
$bg-deep: #041718;
$deep-2: #062c2b;

$accent-1: #7fe7d6; // 薄雾海绿
$accent-2: #dffdf9; // 珍珠青
$text-main: #eaf9f8; // 正文浅色
$text-muted: rgba(234, 249, 248, 0.78);
$card-bg: rgba(8, 26, 24, 0.46); // 玻璃卡片底
$card-border: rgba(127, 231, 214, 0.06);
$soft-shadow: rgba(6, 14, 14, 0.5);
$inner-glow: rgba(127, 231, 214, 0.03);
$pearl-warm: rgba(255, 244, 208, 0.03);

.megumi-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(180deg, $bg-deep 0%, $deep-2 72%);
  font-family: "Noto Sans SC", system-ui, -apple-system, "Segoe UI", Roboto,
    Arial;
  color: $text-main;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: clamp(20px, 4vw, 80px);
  box-sizing: border-box;
  padding-top: 60px;

  &.reduced-motion * {
    transition: none !important;
    animation: none !important;
  }

  .container {
    position: relative;
    z-index: 10;
    max-width: 1100px;
    margin: 0 auto;
    padding: clamp(12px, 2vw, 40px);
  }
}

/* ========== HERO 区域 ========== */
.hero {
  position: relative;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 28px;
  align-items: start;
  padding: 12px;
  margin-bottom: 12px;

  .left-col {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .avatar-card {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.01),
      rgba(127, 231, 214, 0.01)
    );
    border-radius: 16px;
    padding: 12px;
    display: grid;
    justify-items: center;
    gap: 8px;
    border: 1px solid $card-border;
    box-shadow: 0 12px 34px $soft-shadow, inset 0 1px 0 $inner-glow;
    cursor: pointer;
    transition: transform 0.28s ease, box-shadow 0.28s ease;
    width: 100%;

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 22px 60px rgba(6, 14, 14, 0.55),
        inset 0 1px 0 rgba(127, 231, 214, 0.045);
    }
  }

  .avatar-wrap {
    width: 100%;
    display: block;
  }

  .avatar {
    width: 100%;
    height: auto;
    border-radius: 12px;
    display: block;
    box-shadow: 0 10px 30px rgba(3, 10, 10, 0.36),
      0 0 18px rgba(127, 231, 214, 0.02);
    transition: transform 0.5s ease;
    background-color: rgba(0, 0, 0, 0.04);
  }

  .avatar-card:hover .avatar {
    transform: translateY(-4px) scale(1.01);
  }

  .avatar-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }

  .avatar-badge {
    font-size: 0.9rem;
    color: $text-main;
    background: rgba(0, 0, 0, 0.16);
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(127, 231, 214, 0.045);
    font-weight: 600;
  }

  .right-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .hero-panel {
    position: relative;
    z-index: 9;
    padding: 20px;
    border-radius: 14px;
    background: $card-bg;
    backdrop-filter: blur(6px) saturate(0.95);
    border: 1px solid $card-border;
    box-shadow: 0 12px 40px rgba(4, 10, 10, 0.44), inset 0 1px 0 $inner-glow;
  }

  .name {
    font-size: clamp(1.8rem, 3vw, 2.8rem);
    margin: 0;
    font-weight: 900;
    letter-spacing: 1px;
    line-height: 1;
    display: inline-block;
    background: linear-gradient(90deg, $accent-1 0%, $accent-2 60%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
    -webkit-text-stroke: 0.2px rgba(0, 0, 0, 0.18);
    text-shadow: 0 6px 18px rgba(8, 40, 38, 0.06);
  }

  .jp {
    font-size: 0.95rem;
    color: $accent-1;
    margin-left: 8px;
    font-weight: 400;
  }

  .subtitle {
    margin: 6px 0 0;
    font-size: 1.1rem;
    color: $accent-1;
    font-weight: 600;
    line-height: 1.4;
  }

  .lead {
    margin: 10px 0 0;
    color: $text-main;
    opacity: 0.95;
    line-height: 1.7;
    max-width: 72ch;
  }
}

/* ========== 通用卡片 ========== */
.card {
  margin-top: 24px;
  background: rgba(6, 18, 16, 0.42);
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 12px 42px rgba(3, 10, 10, 0.4);
  backdrop-filter: blur(4px);
  color: $text-main;
  border: 1px solid $card-border;
  transition: transform 0.28s ease, box-shadow 0.28s ease;

  &:hover {
    transform: translateY(-8px) scale(1.01);
    box-shadow: 0 25px 70px rgba(3, 10, 10, 0.55);
  }

  h2 {
    margin: 0 0 12px 0;
    font-size: 1.3rem;
    color: $accent-2;
  }

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
}

/* personality 列表样式 */
.personality .traits li {
  padding: 12px 0;
  border-bottom: 1px dashed rgba(127, 231, 214, 0.07);
  font-size: 1rem;
  color: rgba($text-main, 0.92);
}

/* overview 双栏布局 */
.overview .two-col {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.overview .text-block {
  flex: 1 1 40%;
  min-width: 240px;
  line-height: 1.6;
  color: rgba($text-main, 0.96);
}

/* special-section：三大主题区公共布局 */
.special-section {
  position: relative;
  overflow: hidden;

  .content {
    display: flex;
    gap: 24px;
    align-items: center;
    margin-top: 16px;
  }

  .img-area {
    flex: 0 0 200px;

    img {
      width: 100%;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 12px 36px rgba(4, 10, 10, 0.36),
        0 0 12px rgba(127, 231, 214, 0.02);
      border: 1px solid rgba(127, 231, 214, 0.03);
    }
  }

  .text-block {
    flex: 1;
    line-height: 1.6;
    color: rgba($text-main, 0.95);
  }
}

/* ll-stories */
.ll-stories {
  .card {
    width: min(1200px, 100%);
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(6, 6, 6, 0.5),
      inset 0 1px 0 rgba(127, 231, 214, 0.02);
    color: $text-main;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: linear-gradient(
      180deg,
      rgba(8, 24, 22, 0.12),
      rgba(8, 20, 18, 0.06)
    );
  }

  .card-head {
    padding: 14px 16px;
    border-bottom: 1px solid rgba(127, 231, 214, 0.03);
    display: flex;
    flex-direction: column;
    gap: 12px;

    .card-title {
      font-size: 24px;
      font-weight: 700;
      color: $accent-1;
      letter-spacing: 0.6px;
    }
  }

  .card-body {
    padding: 18px 16px;
    min-height: 160px;
    position: relative;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0),
      rgba(8, 12, 10, 0.02)
    );
  }

  .story {
    color: rgba($text-main, 0.96);

    .story-head {
      font-size: 18px;
      color: $accent-2;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .story-content {
      line-height: 1.7;
      color: rgba($text-main, 0.92);
    }
  }

  .card-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 14px;
    border-top: 1px solid rgba(127, 231, 214, 0.02);
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.02),
      rgba(0, 0, 0, 0.04)
    );

    .nav-btn {
      background: transparent;
      border: 1px solid rgba(127, 231, 214, 0.06);
      color: $accent-2;
      padding: 6px 10px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 180ms ease;
      &:hover {
        background: rgba(127, 231, 214, 0.03);
      }
    }

    .pager {
      color: rgba($text-main, 0.72);
      font-size: 13px;
      font-weight: 600;
    }
  }

  /* 切换动画：淡入并轻微上移 */
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 320ms cubic-bezier(0.2, 0.9, 0.2, 1);
  }

  .fade-slide-enter-from {
    opacity: 0;
    transform: translateY(6px);
  }

  .fade-slide-enter-to {
    opacity: 1;
    transform: translateY(0);
  }

  .fade-slide-leave-from {
    opacity: 1;
    transform: translateY(0);
  }

  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }
}

/* timeline 样式（薄雾色调） */
.timeline {
  position: relative;

  .tl-wrap {
    position: relative;
    padding: 24px 12px 12px 96px;
  }

  .vl {
    position: absolute;
    left: 80px;
    top: 32px;
    bottom: 20px;
    width: 4px;
    border-radius: 6px;
    background: linear-gradient(
      180deg,
      rgba($accent-2, 0.15),
      rgba($accent-1, 0.12)
    );
    box-shadow: 0 6px 18px rgba(127, 231, 214, 0.06),
      inset 0 0 10px rgba(127, 231, 214, 0.02);
    opacity: 0.95;
  }

  .tl-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .tl-item {
    position: relative;
    display: flex;
    gap: 18px;
    align-items: flex-start;
    margin: 20px 0;
    transition: transform 0.28s ease, box-shadow 0.28s ease;
  }

  .tl-card {
    background: rgba(8, 20, 18, 0.36);
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    width: calc(100% - 130px);
    border-left: 4px solid transparent;
    transition: transform 0.28s ease, box-shadow 0.28s ease,
      border-color 0.28s ease;
    position: relative;
    z-index: 2;
  }

  .tl-item:hover .tl-card,
  .tl-item:focus-within .tl-card {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
    border-left-color: rgba(127, 231, 214, 0.18);
  }

  .tl-title {
    margin: 0 0 6px 0;
    font-size: 1.1rem;
    color: $accent-1;
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .tl-desc {
    margin: 0;
    color: rgba($text-main, 0.92);
    white-space: pre-wrap;
  }
}

/* 小屏响应式调整 */
@media (max-width: 980px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 8px;
  }

  .avatar-card {
    width: 140px;
    padding: 8px;
  }

  .hero-panel {
    padding: 14px;
  }

  .name {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .lead {
    font-size: 0.95rem;
  }

  .card {
    padding: 18px;
    border-radius: 12px;
  }

  .overview .two-col {
    flex-direction: column;
  }

  .special-section .content {
    flex-direction: column;
  }

  .ll-stories {
    .card {
      border-radius: 10px;
    }

    .card-head {
      padding: 12px 12px;
    }

    .card-body {
      padding: 14px 12px;
      min-height: 180px;
    }

    .card-foot {
      padding: 8px 12px;
    }
  }

  .timeline {
    overflow: visible;
  }

  .timeline .tl-wrap {
    padding-left: 14px !important;
    padding-right: 14px;
    min-height: 0;
  }

  .timeline .vl {
    display: none !important;
  }

  .timeline .tl-list {
    overflow: visible;
  }

  .timeline .tl-item {
    display: block !important;
    margin: 14px 0 !important;
    width: 100%;
  }

  .timeline .tl-card {
    width: 100% !important;
    padding: 14px !important;
    border-left: 0 !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    transform: none !important;
  }
}
</style>
