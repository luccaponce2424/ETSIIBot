import { resetUserContext } from "../ai.js";

export default {
    name: "reset",
    description: "Resetea la memoria del bot para el usuario que envía el comando",
    async execute(message, args) {
        resetUserContext(userId);
        return message.reply("🧹 He olvidado nuestra conversación anterior.");
  }
}