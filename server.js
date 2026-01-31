// server.js
import express from "express";
import { botStatus } from "./index.js";

console.log("🔹 server.js cargado");

const app = express();
const PORT = 3000;

app.use(express.static("public"));
console.log("🔹 express.static configurado");

app.get("/status", (req, res) => {
  console.log("🔹 /status fue solicitado"); // <-- verificamos si se llega aquí
  res.json({ status: botStatus });
});

app.listen(PORT, () => console.log(`🔹 Servidor Express activo en puerto ${PORT}`));
