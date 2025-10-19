import axios from "axios";

const API_KEY = "sk-749495b62f9d4c04a0d7a6688b6690f1";

const BASE_URL = "https://api.deepseek.com/v1"; // DeepSeek 官方 API 地址

// 创建 axios 实例
const deepseekApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
});

// 定义聊天消息接口
interface ChatMsg {
  id: number;
  role: "user" | "bot";
  text: string;
}

// 系统提示语
const SYSTEM_PROMPT = `
你是《鸣潮》中的长离（Changli）。  
你熟知并基于已有公开资料了解长离的身份、经历与人物关系：她曾为明庭中政省长史，现任今州令尹参事，并且是今汐的老师与旁辅；你熟悉她在剧情中的主要事迹、处世方式与为达愿望的算筹布局。  
性格与语气：你言辞平静、温和而沉着；表面不显波澜，但内里精于推演与权衡，常以低语与若有若无的微笑化解对话的锋芒。你有谋士的冷静与教师的耐心：对下属与民众温柔周到；独处或布阵时则不怒自威、深谋远虑。回答时以中文为主，语气克制细腻，必要时带一点轻柔的讥诮或沉稳的评断，但不做戏剧化夸饰。  
称呼与互动习惯：你与对话者语气亲近但不越界，常用自然的第二人称称呼对方，让交流像日常对话；当话题触及“今汐”或其他重要人物时，你会选择不直白表露私人情绪——或借轻描淡写转移话题，或用含蓄一句点到为止。  
知识边界与诚实原则：你的记忆基于公开剧情与资料，能就已公布的设定、人物关系与主要事件提供详实说明；如果用户询问未公开或高度推测的细节，请诚实说明不确定，并可以给出标明“推测”的合理解读，但不得捏造“官方”信息。  
表达限制与格式要求：全程用中文，不自称或揭露为 AI；不要使用专业术语或晦涩学术语言；保持简洁、富有人物感的表达；严禁在回复中出现字符序列 <p>、</p>等。  
`;

const MAX_HISTORY_MESSAGES = 16; // 限制上下文长度，避免token超限

/**
 * 发送消息给 DeepSeek API
 * @param inputMessage 用户输入的消息
 * @param history 历史聊天记录
 * @returns
 */
export async function sendMessageToHui(
  inputMessage: string,
  history: ChatMsg[],
  retry = true
): Promise<string> {
  try {
    // 构建消息数组（包含系统提示和历史上下文）
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-MAX_HISTORY_MESSAGES).map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: inputMessage },
    ];

    // 发送请求到 DeepSeek API
    const response = await deepseekApi.post("/chat/completions", {
      model: "deepseek-chat", // DeepSeek 专用模型
      messages,
      temperature: 0.7, // 控制回复的随机性
      max_tokens: 512, // 限制回复长度
      top_p: 0.9, // 多样性控制
    });

    return response.data.choices[0].message.content;
  } catch (error: any) {
    if (error.response?.status === 400 && retry) {
      console.warn("⚠️ 请求 400，自动降级：从 16 条历史改为 8 条后重试");
      const reducedHistory = history.slice(-8);
      return await sendMessageToHui(inputMessage, reducedHistory, false);
    }
    console.error("与 DeepSeek API 通信时出错:", error.response?.data || error);
    return "（出错了，请稍后再试）";
  }
}
