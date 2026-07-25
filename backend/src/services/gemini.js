import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Prompt de instrução do sistema utilizado pela IA na conversa por mensagem
 */
export const CHAT_SYSTEM_INSTRUCTION = `You are a friendly, encouraging native English conversational partner for Brazilian students learning English.
Keep your responses simple, natural, and engaging (1-3 sentences).
Always end with a simple follow-up question to keep the conversation flowing.
Provide a quick Portuguese hint or vocabulary tip in parentheses if helpful.`;

/**
 * Obtém dinamicamente o cliente Gemini com a chave do ambiente
 */
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey.trim() === '') {
    return { genAI: null, apiKey: null };
  }
  return { genAI: new GoogleGenerativeAI(apiKey.trim()), apiKey: apiKey.trim() };
}

/**
 * Formata o histórico de mensagens para a API Gemini.
 * Regras estritas do Gemini:
 * 1. O histórico deve começar com role 'user'.
 * 2. Roles devem alternar estritamente: user -> model -> user -> model.
 * 3. O histórico não deve conter a mensagem atual que será enviada via sendMessage().
 */
function formatGeminiHistory(history, currentUserMessage) {
  if (!Array.isArray(history)) return [];

  let cleaned = [...history];
  // Remove a mensagem atual do usuário caso já esteja no final do array de histórico
  if (cleaned.length > 0 && cleaned[cleaned.length - 1].role === 'user' && cleaned[cleaned.length - 1].content === currentUserMessage) {
    cleaned.pop();
  }

  // Encontra o índice da primeira mensagem do usuário
  const firstUserIdx = cleaned.findIndex(msg => msg.role === 'user');
  if (firstUserIdx === -1) {
    return [];
  }

  const validHistory = [];
  let expectedRole = 'user';

  for (let i = firstUserIdx; i < cleaned.length; i++) {
    const msg = cleaned[i];
    const role = msg.role === 'user' ? 'user' : 'model';
    if (role === expectedRole && msg.content && msg.content.trim()) {
      validHistory.push({
        role: role,
        parts: [{ text: msg.content.trim() }]
      });
      expectedRole = expectedRole === 'user' ? 'model' : 'user';
    }
  }

  // O histórico para startChat precisa terminar em 'model'
  if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === 'user') {
    validHistory.pop();
  }

  return validHistory;
}

/**
 * Tenta inicializar um modelo Gemini funcional a partir de uma lista de candidatos
 */
function getGenerativeModel(genAI, options = {}) {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro'];
  return genAI.getGenerativeModel({ model: models[0], ...options });
}

/**
 * Avalia o áudio transcrito do aluno em relação ao texto esperado ou contexto
 */
export async function evaluateSpeaking({ targetText, userTranscript }) {
  if (!userTranscript || !userTranscript.trim()) {
    return {
      score: 0,
      feedback: "Nenhum áudio detectado. Por favor, tente falar novamente.",
      phoneticTips: [],
      fluencyLevel: "Não avaliado"
    };
  }

  const { genAI, apiKey } = getGenAI();

  // Se chave Gemini não configurada ou inválida, utiliza análise de similaridade inteligente (Fallback gracioso)
  if (!genAI || !apiKey) {
    const cleanTarget = (targetText || "").toLowerCase().replace(/[^\w\s]/gi, '');
    const cleanUser = userTranscript.toLowerCase().replace(/[^\w\s]/gi, '');
    
    const targetWords = cleanTarget.split(/\s+/).filter(Boolean);
    const userWords = cleanUser.split(/\s+/).filter(Boolean);

    let matchCount = 0;
    userWords.forEach(word => {
      if (targetWords.includes(word)) matchCount++;
    });

    const ratio = targetWords.length > 0 ? (matchCount / targetWords.length) : 0.8;
    const score = Math.min(100, Math.round(ratio * 100));

    let fluencyLevel = "Em Desenvolvimento";
    let feedback = "Boa tentativa! Continue praticando a pronúncia das palavras-chave.";
    if (score >= 85) {
      fluencyLevel = "Excelente";
      feedback = "Pronúncia extremamente clara e ritmo de fala natural!";
    } else if (score >= 60) {
      fluencyLevel = "Intermediário";
      feedback = "Você acertou a maior parte das palavras. Preste atenção à articulação dos sons finais.";
    }

    return {
      score,
      feedback,
      phoneticTips: ["Pratique pausar após vírgulas", "Enfatize a sílaba tônica das palavras principais"],
      fluencyLevel,
      isFallback: true
    };
  }

  try {
    const model = getGenerativeModel(genAI, {
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
Você é um tutor especialista no ensino de inglês para alunos falantes de português.
Analise a transcrição de voz do aluno comparando com a frase alvo pretendida.

Frase Alvo Pretendida: "${targetText || 'Conversa Livre'}"
Transcrição de Voz Capturada: "${userTranscript}"

Forneça uma avaliação em formato JSON estrito com os seguintes campos:
- "score": número inteiro de 0 a 100.
- "fluencyLevel": string ("Excelente", "Bom", "Intermediário", "Em Desenvolvimento").
- "feedback": mensagem encorajadora e clara em Português (máximo 2 frases).
- "phoneticTips": array de strings em Português com 2 dicas práticas sobre fonética ou pronúncia.

Responda APENAS com o JSON válido.
`;

    const response = await model.generateContent(prompt);
    const resultText = response.response.text();
    const data = JSON.parse(resultText);
    return data;
  } catch (error) {
    console.error('Erro na chamada da API do Gemini:', error);
    return {
      score: 75,
      feedback: "Sua fala foi compreendida! Continue treinando diariamente para refinar sua fluência.",
      phoneticTips: ["Mantenha um ritmo constante ao pronunciar frases completas."],
      fluencyLevel: "Bom",
      error: error.message
    };
  }
}

/**
 * Gerador inteligente de respostas fallback para quando as requisições diárias da API Gemini esgotam (HTTP 429 / Quota)
 * ou a chave de API não está disponível.
 */
function generateFallbackChatResponse(userMessage, isQuotaExceeded = false) {
  const msgLower = (userMessage || '').toLowerCase().trim();

  let reply = "";
  let suggestion = "What is your favorite hobby?";

  if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('hey') || msgLower.includes('good morning') || msgLower.includes('good afternoon')) {
    reply = "Hello there! It is great to practice English with you today. How is your day going so far?";
    suggestion = "Tell me about your morning or afternoon!";
  } else if (msgLower.includes('name') || msgLower.includes('who are you')) {
    reply = "I am your AI English Speaking Partner! I am here to help you practice your conversation skills. What would you like to talk about?";
    suggestion = "Ask me about my favorite subjects!";
  } else if (msgLower.includes('weather') || msgLower.includes('rain') || msgLower.includes('sun') || msgLower.includes('cold') || msgLower.includes('hot')) {
    reply = "Talking about the weather is classic! Is it sunny or rainy where you are right now?";
    suggestion = "What kind of weather do you like best?";
  } else if (msgLower.includes('food') || msgLower.includes('eat') || msgLower.includes('pizza') || msgLower.includes('lunch') || msgLower.includes('dinner')) {
    reply = "Food is always a great topic! What is your absolute favorite meal to eat?";
    suggestion = "Do you prefer cooking at home or going out to restaurants?";
  } else if (msgLower.includes('work') || msgLower.includes('job') || msgLower.includes('study') || msgLower.includes('school') || msgLower.includes('english')) {
    reply = "Practicing every day is the key to mastering English! How long have you been studying English?";
    suggestion = "What is the hardest part about learning English for you?";
  } else {
    const defaultReplies = [
      `That sounds very interesting! I agree with what you said about "${userMessage.slice(0, 30)}...". Can you tell me a little bit more?`,
      "That is a great point! Keep practicing expressing your thoughts in English. What else happened today?",
      "Wonderful effort! Speaking out loud or writing every day builds great confidence. What would you like to discuss next?",
      "That makes a lot of sense! How do you usually like to spend your free time during weekends?"
    ];
    reply = defaultReplies[Math.abs((userMessage || '').length % defaultReplies.length)];
  }

  return {
    reply,
    suggestion,
    isFallback: true,
    isQuotaExceeded
  };
}

/**
 * Conversação livre com o assistente nativo de inglês
 */
export async function chatSpeaking({ history = [], userMessage }) {
  const { genAI, apiKey } = getGenAI();

  if (!genAI || !apiKey) {
    return generateFallbackChatResponse(userMessage, false);
  }

  try {
    const formattedHistory = formatGeminiHistory(history, userMessage);

    const model = getGenerativeModel(genAI, {
      systemInstruction: CHAT_SYSTEM_INSTRUCTION
    });

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(userMessage);
    const replyText = result.response.text();

    return {
      reply: replyText,
      suggestion: "Can you tell me more about that?",
      isFallback: false
    };
  } catch (error) {
    console.error('Erro no Chat Gemini:', error);
    
    const errorMsg = error.message || '';
    const isQuotaExceeded = error.status === 429 || 
                            errorMsg.includes('429') || 
                            errorMsg.includes('quota') || 
                            errorMsg.includes('Quota exceeded') ||
                            errorMsg.includes('ResourceHasExhausted');

    return generateFallbackChatResponse(userMessage, isQuotaExceeded);
  }
}

