# Docker Setup para ETSIIBot

Esta guía te ayudará a ejecutar ETSIIBot usando Docker en **Windows 11**.

## Requisitos previos (Windows 11)

- **Docker Desktop para Windows** ([Descargar](https://www.docker.com/products/docker-desktop))
- **WSL 2** (Windows Subsystem for Linux 2) - Se instala automáticamente con Docker Desktop
- **CPU con virtualización habilitada** (Intel VT-x o AMD-V) - Generalmente activado por defecto
- Archivo `.env` con las variables de entorno necesarias (ver sección de Configuración)

### Verificar requisitos en Windows 11

1. **Verificar que WSL 2 está instalado:**
   ```powershell
   wsl --list --verbose
   ```
   Deberías ver una distribución con VERSION 2.

2. **Verificar que Docker está funcionando:**
   ```powershell
   docker --version
   docker-compose --version
   ```

3. **Si necesitas instalar/actualizar WSL 2:**
   ```powershell
   wsl --install
   # Reinicia tu PC después
   ```

## Instalación paso a paso (Windows 11)

1. **Descargar Docker Desktop**
   - Ve a https://www.docker.com/products/docker-desktop
   - Descarga "Docker Desktop for Windows"

2. **Instalar Docker Desktop**
   - Ejecuta el instalador
   - Marca "Install required Windows components for WSL 2"
   - Completa la instalación
   - **Reinicia tu PC**

3. **Verificar la instalación**
   ```powershell
   docker run hello-world
   ```
   Si ves un mensaje de bienvenida, ¡Docker está listo!

4. **Habilitar Hyper-V (si no está habilitado)**
   - Abre "Características de Windows"
   - Marca "Hyper-V"
   - Reinicia tu PC

## Configuración

## Configuración

### 1. Variables de entorno (`.env`)

Crea un archivo `.env` en la raíz del proyecto con:

```env
TOKEN=tu_token_discord_aqui
COHERE_API_KEY=tu_key_cohere_aqui
CLOUDINARY_URL=tu_url_cloudinary_aqui
PORT=3000
```

### 2. Archivo `.dockerignore` (ya incluido)

El archivo `.dockerignore` ya está configurado para excluir archivos innecesarios de la imagen Docker.

## Uso en Windows 11

### Opción 1: Docker Compose (Recomendado) - PowerShell

**Paso 1: Abre PowerShell en la carpeta del proyecto**
```powershell
# Navega a la carpeta del proyecto
cd "C:\Users\TuUsuario\Documents\Repositorios GitHub\ETSIIBot"
```

**Paso 2: Construir la imagen**
```powershell
docker-compose build
```

**Paso 3: Ejecutar el contenedor**
```powershell
docker-compose up -d
```

**Paso 4: Ver logs en tiempo real**
```powershell
docker-compose logs -f etsiibot
```

**Paso 5: Parar el bot cuando quieras**
```powershell
docker-compose down
```

**Actualizar después de cambios:**
```powershell
docker-compose up -d --build
```

### Opción 2: Docker directo - PowerShell

**Construir:**
```powershell
docker build -t etsiibot:latest .
```

**Ejecutar:**
```powershell
docker run -d `
  --name etsiibot `
  --restart unless-stopped `
  --env-file .env `
  -e PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser `
  etsiibot:latest
```

**Ver logs:**
```powershell
docker logs -f etsiibot
```

**Parar:**
```powershell
docker stop etsiibot
docker rm etsiibot
```

### Opción 3: Docker Desktop GUI (Visual)

1. Abre **Docker Desktop** (ya debería estar en la bandeja del sistema)
2. Ve a la pestaña **Containers**
3. Haz clic en el botón **+** o busca la carpeta del proyecto
4. Selecciona el archivo `docker-compose.yml`
5. ¡Docker Desktop manejará todo!

## Monitoreo en Windows 11

## Monitoreo en Windows 11

### Usar PowerShell para monitoreo

**Ver estado del contenedor:**
```powershell
docker ps  # Contenedores activos
docker ps -a  # Todos los contenedores
```

**Ver logs:**
```powershell
docker logs etsiibot  # Últimos logs
docker logs -f etsiibot  # Follow (en tiempo real)
docker logs --tail 50 etsiibot  # Últimas 50 líneas
```

**Entrar en el contenedor (debugging):**
```powershell
docker exec -it etsiibot /bin/bash
```

**Eliminar la imagen:**
```powershell
docker rmi etsiibot:latest
```

### Usar Docker Desktop GUI

1. Abre **Docker Desktop**
2. Ve a **Containers** → busca `etsiibot`
3. Haz clic para ver:
   - ✅ Estado (Running, Exited, etc.)
   - 📊 Uso de CPU y memoria en tiempo real
   - 📝 Logs en la pestaña "Logs"
   - 🔧 Opciones para reiniciar, pausar, eliminar

### Ver uso de recursos en tiempo real

**PowerShell:**
```powershell
docker stats etsiibot
```

**Docker Desktop:**
Ve a la pestaña **Containers** y observa los gráficos de CPU/memoria

## Acceso a archivos del contenedor (Windows 11)

## Acceso a archivos del contenedor (Windows 11)

Los archivos del contenedor se encuentran en:
- **Datos de Docker en Windows:** `%APPDATA%\Docker\`
- **Volúmenes:** `\\wsl$\docker-desktop-data\mnt\docker`

**Desde PowerShell, acceder a archivos:**
```powershell
# Copiar archivo desde contenedor a tu PC
docker cp etsiibot:/app/archivo.txt C:\Users\TuUsuario\Desktop\

# Copiar archivo desde tu PC al contenedor
docker cp C:\Users\TuUsuario\Desktop\archivo.txt etsiibot:/app/
```

## Troubleshooting en Windows 11

### Error: "Docker daemon is not running"
**Solución:**
1. Abre **Docker Desktop** desde el menú de inicio
2. Espera a que cargue completamente (aparecerá un ícono verde)
3. Intenta de nuevo

### Error: "Cannot start service: port 3000 is already in use"
**PowerShell:**
```powershell
# Encuentra qué proceso está usando el puerto 3000
netstat -ano | findstr :3000

# Mata el proceso (reemplaza PID con el número encontrado)
taskkill /PID PID /F
```

### Error: "WSL 2 installation incomplete"
**Solución:**
1. Abre PowerShell como **Administrador**
2. Ejecuta:
```powershell
wsl --install
wsl --update
```
3. Reinicia tu PC

### El contenedor usa mucha memoria o CPU
**Solución en `docker-compose.yml`:**
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'      # Limita a 50% de un núcleo
      memory: 512M     # Limita a 512MB
    reservations:
      cpus: '0.25'
      memory: 256M
```

### El bot se desconecta o crashea
**Verifica logs:**
```powershell
docker logs -f etsiibot  # Ver en tiempo real
```

**Soluciones comunes:**
1. Aumenta memoria en `docker-compose.yml`
2. Reinicia el contenedor: `docker-compose restart etsiibot`
3. Verifica que el `.env` tiene variables correctas
4. Revisa que el token de Discord es válido

### Docker Desktop consume muchos recursos
**Soluciones:**
1. Ve a **Docker Desktop Settings** → **Resources**
2. Reduce CPU cores asignados (ej: 2 en lugar de 4)
3. Reduce Memory (ej: 2GB en lugar de 4GB)
4. Haz clic en **Apply & Restart**

## Actualizaciones en Windows 11

## Rendimiento

### Límites de recursos recomendados (docker-compose.yml)

**Para servidor pequeño (VPS 1GB RAM):**
```yaml
resources:
  limits:
    memory: 512M
  reservations:
    memory: 256M
```

**Para servidor mediano (VPS 2GB RAM):**
```yaml
resources:
  limits:
    memory: 1G
  reservations:
    memory: 512M
```

**Para servidor grande (VPS 4GB+ RAM):**
```yaml
resources:
  limits:
    memory: 2G
  reservations:
    memory: 1G
```

## Actualizaciones en Windows 11

**Actualizar a la última versión del bot:**
```powershell
# En PowerShell
git pull origin master
docker-compose up -d --build
```

**Actualizar Docker Desktop:**
1. Abre **Docker Desktop**
2. Haz clic en el ícono de perfil (arriba a la derecha)
3. Haz clic en **Check for updates**
4. Si hay actualizaciones, haz clic en **Update**
5. Docker se reiniciará automáticamente

## Despliegue en servidores en la nube desde Windows 11

### Opción 1: Usar SCP/WinSCP para subir archivos

**Con PowerShell (usando SSH):**
```powershell
# Copiar proyecto a un servidor VPS Linux
scp -r "C:\Users\TuUsuario\Documents\Repositorios GitHub\ETSIIBot\*" usuario@tuservidor.com:/home/usuario/etsiibot/
```

**Luego en el servidor:**
```bash
ssh usuario@tuservidor.com
cd /home/usuario/etsiibot
docker-compose up -d
```

### Opción 2: Usar Git en el servidor

```powershell
# En PowerShell, desde tu PC
git push origin master
```

```bash
# En el servidor
git pull origin master
docker-compose up -d --build
```

### Opción 3: Usar Docker Hub

**Desde PowerShell en tu PC:**
```powershell
# Login a Docker Hub
docker login

# Construir con tu usuario de Docker Hub
docker build -t tuusuario/etsiibot:latest .

# Subir a Docker Hub
docker push tuusuario/etsiibot:latest
```

**En el servidor:**
```bash
docker pull tuusuario/etsiibot:latest
docker run -d --name etsiibot --restart unless-stopped --env-file .env tuusuario/etsiibot:latest
```

## Iniciar el bot automáticamente en Windows 11

### Opción 1: Tarea programada de Windows (Recomendado)

**Crear un script PowerShell (`start-bot.ps1`):**
```powershell
Set-Location "C:\Users\TuUsuario\Documents\Repositorios GitHub\ETSIIBot"
docker-compose up -d
```

**Crear tarea programada:**
1. Abre **Programador de tareas** (Task Scheduler)
2. Haz clic en **Crear tarea básica**
3. Nombre: `ETSIIBot`
4. En **Desencadenadores**: Elige "Al iniciar sesión"
5. En **Acciones**: 
   - Programa: `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`
   - Argumentos: `-File "C:\Users\TuUsuario\start-bot.ps1"`
6. Haz clic en **Finalizar**

### Opción 2: Comando de inicio automático en Docker Desktop

1. Abre **Docker Desktop Settings**
2. Ve a **General**
3. Marca **Start Docker Desktop when you log in**
4. Marca **Run the Docker daemon when Docker Desktop starts** (si no está marcado)

### Opción 3: Crear un atajo (shortcut) en Inicio

1. Crea un archivo `run-bot.bat`:
```batch
@echo off
cd /d "C:\Users\TuUsuario\Documents\Repositorios GitHub\ETSIIBot"
docker-compose up -d
pause
```

2. Copia el archivo a:
```
C:\Users\TuUsuario\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
```

3. El bot se iniciará automáticamente al reiniciar Windows

## Comandos rápidos para Windows 11

## Comandos rápidos para Windows 11

**Crear alias en PowerShell (opcional):**

Abre PowerShell como **Administrador** y ejecuta:
```powershell
# Ver localización del perfil
$PROFILE

# Crear/editar perfil si no existe
New-Item -Path $PROFILE -Type File -Force

# Abrir el perfil con editor
notepad $PROFILE
```

**Añade esto al archivo:**
```powershell
# Alias para Docker Compose
Set-Alias -Name dcu -Value "docker-compose up -d"
Set-Alias -Name dcd -Value "docker-compose down"
Set-Alias -Name dcl -Value "docker-compose logs -f"
Set-Alias -Name dcb -Value "docker-compose up -d --build"

# Ir al proyecto rápidamente
function bot { Set-Location "C:\Users\TuUsuario\Documents\Repositorios GitHub\ETSIIBot" }
```

**Luego puedes usar:**
```powershell
bot          # Ir al proyecto
dcu          # Ejecutar el bot
dcl          # Ver logs
dcd          # Parar el bot
dcb          # Reconstruir y ejecutar
```

## Notas finales

- **Seguridad:** 
  - Nunca commits tu `.env` con tokens reales
  - Usa `.gitignore` para excluir `.env`
  - En Windows, asegúrate de que Docker Desktop está actualizado
  
- **Rendimiento en Windows 11:**
  - Docker Desktop usa Hyper-V que consume memoria
  - Ajusta los recursos en Docker Desktop Settings según tu PC
  - Si tu PC tiene <8GB RAM, reduce memoria asignada a Docker

- **Actualización de dependencias:** 
  - Actualiza regularmente: `npm update`
  - Reconstruye la imagen: `docker-compose up -d --build`

- **Backups:** 
  - Haz backup de tu `.env` (en lugar seguro)
  - Haz backup de tu código en GitHub/GitLab
  - Guarda logs importantes

- **Logs:** 
  - Revisa regularmente: `docker-compose logs -f`
  - Los logs también están disponibles en Docker Desktop GUI

## Soporte en Windows 11

**Si tienes problemas:**
1. Verifica que Docker Desktop está corriendo (ícono en bandeja del sistema)
2. Abre PowerShell y ejecuta `docker ps`
3. Revisa logs: `docker-compose logs -f etsiibot`
4. Reinicia Docker Desktop si nada funciona
5. Consulta la documentación oficial: https://docs.docker.com/desktop/install/windows-install/
