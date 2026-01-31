import fs from "fs";
import path from "path";

export default {
  name: "info",
  description: "Muestra información del bot, versión y dependencias con sus versiones",
  async execute(message, args) {
    try {
      // Leer package.json
      const packagePath = path.resolve("./package.json");
      const packageData = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

      const name = packageData.name || "Desconocido";
      const version = packageData.version || "0.0.0";
      const description = packageData.description || "Sin descripción";

      let dependenciesList = "Ninguna";
      if (packageData.dependencies && Object.keys(packageData.dependencies).length > 0) {
        dependenciesList = Object.entries(packageData.dependencies)
          .map(([dep, ver]) => `${dep} (${ver.replace("^", "").replace("~", "")})`)
          .join(", ");
      }

      const embedMessage = `🤖 **Nombre del bot:** ${name}\n📄 **Versión:** ${version}\n📝 **Descripción:** ${description}\n📦 **Dependencias:** ${dependenciesList}`;

      message.reply(embedMessage);
    } catch (error) {
      console.error(error);
      message.reply("❌ No se pudo obtener la información del bot.");
    }
  },
};
