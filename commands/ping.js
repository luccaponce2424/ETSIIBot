import { getBotResponse } from "../ai.js";

export default {
  name: "ping",
  description: "Mide tiempo de respuesta generando un mensaje con IA",
  async execute(message, args) {

    const sent = await message.channel.send("⏳ Calculando latencia...");
    const latency = sent.createdTimestamp - message.createdTimestamp;
    sent.edit(`⏱️ Latencia del bot: ${latency} ms`);

    const userMessage = args.join(" escribe una palabra al azar");
    
    const reply = await getBotResponse(message.author.id, userMessage);
    if(reply){
        message.reply(`⏱️ Tardé ${latency} ms en responder. Cohere funciona correctamente.\n🤖 Respuesta de IA: ${reply}`);
    }else{
        message.reply(`⏱️ Tardé ${latency} ms en responder. Cohere NO funciona correctamente.`);
    }
  },
};
