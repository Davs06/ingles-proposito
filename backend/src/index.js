import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { evaluateSpeaking, chatSpeaking, getWeeklySentences } from './services/gemini.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ingles-proposito-speaking-microservice',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Endpoint: Frases Dinâmicas da Semana via Gemini IA
app.get('/api/speaking/sentences', async (req, res) => {
  try {
    const data = await getWeeklySentences();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro em /api/speaking/sentences:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: Avaliação de Pronúncia/Speaking via Gemini AI
app.post('/api/speaking/eval', async (req, res) => {
  try {
    const { targetText, userTranscript } = req.body;
    const result = await evaluateSpeaking({ targetText, userTranscript });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Erro em /api/speaking/eval:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: Conversação Livre via Gemini AI
app.post('/api/speaking/chat', async (req, res) => {
  try {
    const { history, userMessage } = req.body;
    const result = await chatSpeaking({ history, userMessage });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Erro em /api/speaking/chat:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Microserviço Speaking rodando na porta ${PORT}`);
});
