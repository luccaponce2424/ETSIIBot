import { v2 as cloudinary } from "cloudinary";

export default {
  name: "meme",
  description: "Envía una imagen meme aleatoria desde Cloudinary",
  async execute(message, args) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    try {
          // Buscar recursos en la carpeta especificada
          const result = await cloudinary.search
            .expression(`folder:${process.env.CLOUDINARY_FOLDER}`)
            .max_results(100)
            .execute();
    
          if (result.resources.length === 0) {
            return message.reply("No encontré imágenes en Cloudinary 😢");
          }
    
          // Elegir una imagen al azar
          const randomImage =
            result.resources[Math.floor(Math.random() * result.resources.length)];
    
          await message.channel.send(randomImage.secure_url);
        } catch (error) {
          console.error(error);
          message.reply("Hubo un error al obtener la imagen 😔");
        }
  },
};