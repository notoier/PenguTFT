# 🐧 PenguTFT
**A Discord bot that displays, syncs, and automatically manages Teamfight Tactics ranks.**

---

## 🚀 Main Features

- 🔗 **Command `/link Name#TAG`** — Links your Riot account.  
- 🏆 **Command `/tft`** — Displays your current TFT rank.  
- 🎨 **Automatic roles** by rank (Challenger, Diamond, Gold, etc.).  
- 🧱 **Automatic role creation** with custom colors.  
- 🔄 **Periodic rank and role updates** (every 6 hours).  
- 🧹 **Automatic cleanup** of roles for unlinked users.  
- 🌈 **Color palette** inspired by official TFT rank colors.  
- 💾 **Local persistence** using `data.json`.  

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/PenguTFT.git
cd PenguTFT

### 2️⃣ Install dependencies
npm install

### 3️⃣ Configure bot variables
Copy the example config and edit it:

cp config.json.example config.json

Then open config.json and fill in your values:

{
  "DISCORD_TOKEN": "YOUR_DISCORD_BOT_TOKEN",
  "CLIENT_ID": "YOUR_DISCORD_APPLICATION_ID",
  "RIOT_API_KEY": "YOUR_RIOT_API_KEY"
}

### 🧠 Requirements
    
Node.js v18 or higher (includes native fetch)

A bot application in the Discord Developer Portal

### ▶️ Running the Bot
npm start

Once the bot is online, test it on your Discord server:

/link YourName#TAG → links your Riot account.

/tft → shows your current TFT rank.

The bot will automatically assign your TFT role (for example, TFT – Gold)
and update all player ranks every 6 hours.

### 🔁 Automatic Updates

Every 6 hours, the bot will:

Fetch the latest TFT rank for all linked players.

Update their roles if they’ve climbed or dropped ranks.

Remove roles from users who are no longer linked.

You can easily adjust the update interval in the code (setInterval).

### 🧹 Automatic Cleanup

If a user leaves the server or is removed from data.json,
the bot will remove their TFT roles during the next update cycle.

### 📄 License

This project is under a custom proprietary license.
Redistribution, modification, or commercial use is not allowed without explicit written permission from the author.
See the LICENSE

Spanish: 

# 🐧 PenguTFT
**Bot de Discord para mostrar, sincronizar y gestionar automáticamente los rangos de Teamfight Tactics.**

---

## 🚀 Características principales

- 🔗 **Comando `/link Nombre#TAG`** — Vincula tu cuenta de Riot.
- 🏆 **Comando `/tft`** — Muestra tu rango actual en TFT.
- 🎨 **Roles automáticos** por rango (Challenger, Diamond, Gold, etc.).
- 🧱 **Creación automática de roles** con colores personalizados.
- 🔄 **Actualización periódica** de rangos y roles (cada 6 horas).
- 🧹 **Limpieza automática** de roles de usuarios no vinculados.
- 🌈 Paleta de colores inspirada en los rangos oficiales de TFT.
- 💾 Persistencia local con `data.json`.

---

## 🧩 Estructura del proyecto

PenguTFT/
├── .gitignore
├── README.md
├── package.json
├── index.js
├── config.json.example
├── data.json
└── src/
├── roles.js
├── commands.js
└── utils/
└── riotApi.js


---

## ⚙️ Instalación y configuración

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/PenguTFT.git
cd PenguTFT

### 2️⃣ Instalar dependencias

npm install

### 3️⃣ Configurar variables del bot

Copia el archivo de ejemplo y edítalo:

cp config.json.example config.json

Luego abre config.json y completa los valores:

{
  "DISCORD_TOKEN": "TU_TOKEN_DE_DISCORD",
  "CLIENT_ID": "TU_APPLICATION_ID",
  "RIOT_API_KEY": "TU_API_KEY_DE_RIOT"
}

### 🧠 Requisitos

Node.js v18 o superior (incluye fetch nativo)

Una aplicación de bot en el Discord Developer Portal

### ▶️ Ejecución

npm start

Cuando el bot esté en línea, pruébalo en tu servidor de Discord:

/link TuNombre#TAG → vincula tu cuenta de Riot.

/tft → muestra tu rango actual.

El bot asignará automáticamente tu rol de TFT (por ejemplo, TFT – Gold)
y actualizará todos los rangos cada 6 horas.

### 🔁 Actualización automática

Cada 6 horas, el bot:

Consulta el rango actual de todos los jugadores vinculados.

Actualiza sus roles si subieron o bajaron.

Elimina roles de quienes ya no estén vinculados.

Puedes modificar el intervalo fácilmente desde el código (setInterval)

### 🧹 Limpieza automática
    
Si un usuario abandona el servidor o se borra de data.json,
el bot elimina sus roles TFT la próxima vez que actualice.