import fs from "fs";
import path from "path";

export default {
    name: "help",
    description: "Muestra una lista de comandos disponibles",
    async execute(message, args) {
        const commands = new Map();
        const commandsPath = path.resolve("./commands");
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
        
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = await import(`file://${filePath}`);
            commands.set(command.default.name, command.default);
        }
        return message.reply(`🛠️ Comandos disponibles:\n\n${[...commands.values()].map(cmd => `**!${cmd.name}**: ${cmd.description}`).join("\n")}`);
  }
}