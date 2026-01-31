import { CohereClientV2 } from 'cohere-ai';
import dotenv from 'dotenv';
dotenv.config();

let totalTokensUsed = 0;
const DAILY_LIMIT = 5000;

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

const userContexts = {};

export async function getBotResponse(userId, userMessage) {
  if (!userContexts[userId]) {
    userContexts[userId] = [
      `Eres un robot de asistencia para los alumnos de la Escuela Superior de Ingeniería Informática de Sevilla. 
      Hablas español y andaluz. Eres divertido y conoces memes famosos. Nunca escribas mensajes de más de 2000 caracteres.
      Puedes usar humor negro.
    `]
  }

  userContexts[userId].push(`Usuario: ${userMessage}`);

  const prompt = userContexts[userId].join('\n') + '\nETSIIBot:';
  console.log(`⚠️ Tokens usados hasta ahora: ${totalTokensUsed}`);

  try {
    if (totalTokensUsed >= DAILY_LIMIT) {
      return "Ahora mismo no puedo responder preguntas... ¡Inténtalo mañana!"
    } else {
      const response = await cohere.chat({
        model: 'command-a-03-2025',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const reply = response.message.content
        .map(item => item.text)
        .join(" ")
        .trim();

      userContexts[userId].push(`ETSIIBot: ${reply}`);

      const tokensUsed = response.usage.tokens.outputTokens + response.usage.tokens.inputTokens;
      totalTokensUsed += tokensUsed;

      
      return reply;
    }


  } catch (err) {
    console.error(err);
    return '😅 No pude generar una respuesta ahora mismo.';
  }
}

export function resetUserContext(userId) {
  delete userContexts[userId];
}

export function getTotalTokensUsed() {
  return totalTokensUsed;
}
