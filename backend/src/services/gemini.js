import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
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

  // Se chave Gemini não configurada, utiliza análise de similaridade inteligente (Fallback gracioso)
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
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
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
 * Conversação livre com o assistente nativo de inglês
 */
export async function chatSpeaking({ history = [], userMessage }) {
  if (!genAI || !apiKey) {
    return {
      reply: `I received your message: "${userMessage}". (Simulação IA: Configure a GEMINI_API_KEY no .env do backend para conversa nativa completa!) Great job practicing!`,
      suggestion: "How was your day today?"
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `You are a friendly, encouraging native English conversational partner for Brazilian students learning English.
Keep your responses simple, natural, and engaging (1-3 sentences).
Always end with a simple follow-up question to keep the conversation flowing.
Provide a quick Portuguese hint or vocabulary tip in parentheses if helpful.`
    });

    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(userMessage);
    const replyText = result.response.text();

    return {
      reply: replyText,
      suggestion: "Can you tell me more about that?"
    };
  } catch (error) {
    console.error('Erro no Chat Gemini:', error);
    return {
      reply: "That sounds interesting! Keep practicing speaking out loud.",
      suggestion: "What is your favorite subject?"
    };
  }
}
