import fs from "fs";
import path from "path";
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { getBotResponse } from "./ai.js";
import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();

// Webpage
app.use(express.static("static"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "static" });
});

app.listen(PORT, () => console.log(`Servidor web en puerto ${PORT}`));

export let botStatus = "Desconectado ❌";



// Discord Bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once("clientReady", () => {
    console.log(`🤖✅ Bot iniciado como ${client.user.tag}`);
    console.log("🔹 Bot conectado:", botStatus);
});

client.on("error", (err) => {
  botStatus = `Error ❌: ${err.message}`;
  console.error("🔹 Error en el bot:", err);
});

client.on("shardDisconnect", () => {
  botStatus = "Desconectado ❌";
  console.log("🔹 Bot desconectado");
});

const commands = new Map();
const commandsPath = path.resolve("./commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(`file://${filePath}`);
    commands.set(command.default.name, command.default);
}



client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const prefix = "!"; // prefijo de comandos

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (commands.has(commandName) && message.content.startsWith(prefix)) {
        try {
            await commands.get(commandName).execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply("❌ Ocurrió un error al ejecutar ese comando.");
        }

    } else if (message.mentions.has(client.user)) {
        try {
            const userId = message.author.id;
            const userMessage = message.content.replace(`<@${client.user.id}>`, "").trim();
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

            message.reply(reply);
        } catch (error) {
            console.error(error);
            message.reply("❌ Ocurrió un error al procesar tu mensaje:" + error.message);
        }

    } else {
        return
    }
});

client.login(process.env.TOKEN)
    .then(() => console.log("🔹 Bot login iniciado"))
    .catch(err => console.error("🔹 Error login:", err));