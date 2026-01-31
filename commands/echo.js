export default {
    name: "echo",
    description: "Repite el mensaje enviado",
    async execute(message, args) {
        try {
            const textToEcho = message.content.trim().replace(/^!echo\s+/i, '');

            // Eliminar el mensaje original del usuario
            await message.delete();

            // Enviar el mensaje como mensaje normal (no reply)
            await message.channel.send(textToEcho);
        } catch (error) {
            console.error(error);
            message.channel.send("❌ No pude repetir el mensaje.");
        }
    }
}