import dotenv from "dotenv";
import { getTotalTokensUsed } from '../ai.js';
dotenv.config();

export default {
    name: "tokens",
    description: "Muestra información sobre el uso de tokens de Cohere",
    async execute(message, args) {
        let usage = getTotalTokensUsed();

        let res = `Tokens usados hoy: ${usage}\nTokens restantes (aprox.): ${5000 - usage}`

        return message.reply(res.trim());
    }
}
