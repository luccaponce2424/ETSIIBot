import puppeteer from "puppeteer";

async function getRiverLevel() {
    let browser;
    try {
        // Lanzar navegador
        browser = await puppeteer.launch({
            headless: "new",
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage"
          ]
        });

        const page = await browser.newPage();
        
        // Navegar a la página
        console.log("📡 Navegando a la página de aforos...");
        await page.goto("https://www.chguadalquivir.es/saih/AforosSE.aspx#mapaAforos", {
            waitUntil: "networkidle2", // Espera a que cargue completamente
        });

        // Esperar a que el elemento específico esté presente
        console.log("⏳ Esperando elemento con id=ContentPlaceHolder1_M09_divtabla...");
        await page.waitForSelector("#ContentPlaceHolder1_M09_divtabla", { timeout: 10000 });

        // Extraer datos de la segunda fila, tercera columna
        const riverData = await page.$eval(
            "#ContentPlaceHolder1_M09_divtabla",
            (el) => {
                // Obtener todas las filas de la tabla
                const rows = el.querySelectorAll("table tr");
                
                if (rows.length < 2) {
                    return { text: "No data", color: null };
                }
                
                // Segunda fila (índice 1)
                const secondRow = rows[1];
                // Obtener todas las celdas de la segunda fila
                const cells = secondRow.querySelectorAll("td");
                
                if (cells.length < 3) {
                    return { text: "No data", color: null };
                }
                
                // Tercera columna (índice 2)
                const thirdCell = cells[2];
                // Buscar el span dentro de esa celda
                const span = thirdCell.querySelector("span");
                
                if (!span) {
                    return { text: "No span found", color: null };
                }
                
                const text = span.textContent.trim();
                const style = span.getAttribute("style") || "";
                
                return { text, style };
            }
        );

        console.log("✅ Elemento obtenido correctamente:", riverData);
        return riverData;
    } catch (error) {
        console.error("❌ Error en getRiverLevel:", error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}


/**
 * Mapea el color del estilo a un emoji correspondiente
 * @param {*} style 
 * @returns {String} emoji
 */
function getEmojiByColor(style) {
    if (!style) return "⚪"; // Default: círculo blanco
    
    const colorMap = {
        "red": "🔴",
        "yellow": "🟡",
        "orange": "🟠"
    };
    
    for (const [color, emoji] of Object.entries(colorMap)) {
        if (style.toLowerCase().includes(color)) {
            return emoji;
        }
    }
    
    return "";
}

/**
 * Extrae datos el nombre del embalse, caudal y emoji de un embalse específico
 * @param {Page} page - Página de Puppeteer
 * @param {String} selector - Selector CSS del elemento
 * @returns {Object} { nombreEmbalse, caudalEmbalse, emoji }
 */
async function extractTableData(page, selector) {
    try {
        const data = await page.$eval(
            selector,
            (el) => {
                // Mapear color a emoji (lógica embebida)
                function getEmojiByColor(style) {
                    if (!style) return "⚪";
                    
                    const colorMap = {
                        "red": "🔴",
                        "yellow": "🟡",
                        "orange": "🟠"
                    };
                    
                    for (const [color, emoji] of Object.entries(colorMap)) {
                        if (style.toLowerCase().includes(color)) {
                            return emoji;
                        }
                    }
                    
                    return "⚪";
                }

                // Obtener el nombre del embalse
                const caption = el.querySelector("caption");
                const nombreEmbalse = caption ? caption.textContent.trim() : "Desconocido";

                // Obtener caudal del embalse
                const rows = el.querySelectorAll("table tr");
                const thirdRow = rows[2];
                const cells = thirdRow.querySelectorAll("td");
                
                if (rows.length < 3 || cells.length < 3) {
                    return { nombreEmbalse, caudalEmbalse: "No data", emoji: "" };
                } else {
                    const thirdCell = cells[2];
                    const caudalEmbalse = thirdCell.textContent.trim();

                    const span = thirdCell.querySelector("span");
                    const style = span ? span.getAttribute("style") || "" : "";
                    const emoji = getEmojiByColor(style);
                
                    return { nombreEmbalse, caudalEmbalse, emoji };
                }
            }
        );
        return data;
    } catch (error) {
        console.error(`❌ Error al extraer datos del selector ${selector}:`, error.message);
        return { nombreEmbalse: "Error", caudalEmbalse: "Error", emoji: "❌" };
    }
}

async function getReservoirLevel() {
    let browser;
    try {
        // Lanzar navegador
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        
        // Navegar a la página de embalses
        console.log("📡 Navegando a la página de embalses...");
        await page.goto("https://www.chguadalquivir.es/saih/EmbalSE.aspx", {
            waitUntil: "networkidle2", // Espera a que cargue completamente
        });

        // Esperar a que el elemento específico esté presente
        console.log("⏳ Esperando elemento con id=ContentPlaceHolder1_E65_divtabla...");
        await page.waitForSelector("#ContentPlaceHolder1_E65_divtabla", { timeout: 10000 });
        const embalses = ["#ContentPlaceHolder1_E65_divtabla","#ContentPlaceHolder1_E63_divtabla"]
        let reservoirsData = [];
        
        // Extraer datos de nombre del embalse y caudal
        for (const selector of embalses) {
            const reservoirData = await extractTableData(page, selector);
            reservoirsData.push(reservoirData);
        }

        console.log("✅ Datos del embalse obtenidos:", reservoirsData);
        return reservoirsData;
    } catch (error) {
        console.error("❌ Error en getReservoirLevel:", error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

export default {
    name: "riverlevel",
    description: "Informa del nivel del río y estado de los embalses en tiempo real.",
    async execute(message) {
        try {
            await message.channel.sendTyping();
            
            const riverData = await getRiverLevel();
            const emoji = getEmojiByColor(riverData.style);

            const reservoirData = await getReservoirLevel();
            
            if (!riverData.text || riverData.text === "No data") {
                message.channel.send("❌ No se encontraron datos de nivel del río.");
                return;
            }

            const reservoirInfo = reservoirData
                .filter(r => r.nombreEmbalse !== "Error" && r.nombreEmbalse !== "Desconocido" && r.caudalEmbalse !== "No data" && r.caudalEmbalse !== undefined)  // Filtrar errores
                .map(r => `- ${r.emoji} **${r.nombreEmbalse}:** ${r.caudalEmbalse}`)
                .join("\n");
            
            const embalseSection = reservoirInfo.length > 0 
                ? `## Embalses:\n${reservoirInfo}`
                : "## Embalses:\n*(No hay datos disponibles)*";
            
            // Construir el mensaje final
            const result = `## 📊 Nivel del Río Guadalquivir:
${emoji} ${riverData.text}

${embalseSection}

**Fuente:** https://www.chguadalquivir.es/saih/`.trim();
            
            message.channel.send(result);
            
        } catch (error) {
            console.error(error);
            message.channel.send("❌ No pude obtener el nivel del río. Intenta más tarde.");
        }
    }
}
