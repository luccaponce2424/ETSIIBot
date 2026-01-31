import fs from "fs";
import path from "path";
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { getBotResponse } from "./ai.js";
import express from 'express';

dotenv.config();
export let botStatus = "Desconectado ❌";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Página web para mantener el bot activo
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send("Bot activo en local 🚀");
});

app.listen(PORT, () => {
  console.log(`Servidor web escuchando en http://localhost:${PORT}`);
});
// Fin página web

client.once("clientReady", () => {
    botStatus = "Conectado ✅";
    console.log(`🤖✅ Bot iniciado como ${client.user.tag}`);
    console.log("🔹 Bot conectado:", botStatus);
});


client.on("error", (err) => {
  botStatus = `Error ❌: ${err.message}`;
  console.error("🔹 Error en el bot:", err);
});


client.on('shardDisconnect', () => {
  botStatus = 'Desconectado ❌';
  console.log("🔹 Bot conectado:", botStatus);
});

client.on('shardReconnecting', () => {
  botStatus = `Reconectando... 🔄`;
  console.log("🔹 Bot conectado:", botStatus);
});

client.on('shardResume', () => {
  botStatus = "Conectado ✅";
  console.log("🔹 Bot conectado:", botStatus);
});


async function setCommands() {
    const commands = new Map();
    const commandsPath = path.resolve("./commands");
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(`file://${filePath}`);
        commands.set(command.default.name, command.default);
    }
    return commands;
}

const commands = await setCommands();

async function answerWithCommand(commandName, message, args) {
    try {
        await commands.get(commandName).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply("❌ Ocurrió un error al ejecutar ese comando.");
    }
}

async function answerWithMention(message) {
    try {
        const userId = message.author.id;
        const userMessage = message.content.replace(`<@${client.user.id}>`, "").trim();
        
        // Mostrar que está escribiendo
        await message.channel.sendTyping();
        
        const start = Date.now(); // inicio del tiempo de respuesta

        console.log("===================================");
        console.log(`📩 Usuario: ${message.author.tag} (${message.author.id})`);
        console.log(`💬 Mensaje recibido: "${userMessage}"`);

        // Generar respuesta usando IA
        var reply = await getBotResponse(userId, userMessage);

        if (reply.length > 2000) {
            reply = reply.slice(0, 1997) + '...';
        }

        const end = Date.now();
        const latency = end - start;

        console.log(`🤖 Respuesta: "${reply}"`);
        console.log(`⏱️ Tiempo de respuesta: ${latency} ms`);
        console.log("===================================");
        return reply;
    } catch (error) {
        console.error(error);
        reply = "❌ Ocurrió un error al procesar tu mensaje: " + error.message;
        return reply;
    }
    
}

client.on("messageCreate", async (message) => {
    if (message.author.bot) return; // ignorar mensajes de bots

    const prefix = "!"; // prefijo de comandos

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const hasCommand = commands.has(commandName) && message.content.startsWith(prefix);
    const hasMention = message.mentions.has(client.user);

    if (hasCommand) {
        await answerWithCommand(commandName, message, args);
    } else if (hasMention) {

        const reply = await answerWithMention(message);
        message.reply(reply);
    } else {
        return
    }
});

client.login(process.env.TOKEN)
    .then(() => console.log("🔹 Bot login iniciado"))
    .catch(err => console.error("🔹 Error login:", err));