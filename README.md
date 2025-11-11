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

Invite the bot to your discord server via this [link](https://discord.com/oauth2/authorize?client_id=1437860257106890834).

## 🚀 Other Features

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

# Spanish: 

# 🐧 PenguTFT
**Bot de Discord para mostrar, sincronizar y gestionar automáticamente los rangos de Teamfight Tactics.**

## 🚀 Características principales

- 🔗 **Comando `/link Nombre#TAG`** — Vincula tu cuenta de Riot.
- 🏆 **Comando `/tft`** — Muestra tu rango actual en TFT.
- 🎨 **Roles automáticos** por rango (Challenger, Diamond, Gold, etc.).
- 🧱 **Creación automática de roles** con colores personalizados.
- 🔄 **Actualización periódica** de rangos y roles (cada 6 horas).
- 🧹 **Limpieza automática** de roles de usuarios no vinculados.
- 🌈 Paleta de colores inspirada en los rangos oficiales de TFT.
- 💾 Persistencia local con `data.json`.


## ⚙️ Instalación y configuración

Invita el bot a tu servidor de Discord mediante este [link](https://discord.com/oauth2/authorize?client_id=1437860257106890834).


## 🚀 Otras características

### 🔁 Actualización automática

Cada 6 horas, el bot:

Consulta el rango actual de todos los jugadores vinculados.

Actualiza sus roles si subieron o bajaron.

Elimina roles de quienes ya no estén vinculados.

Puedes modificar el intervalo fácilmente desde el código (setInterval)

### 🧹 Limpieza automática
    
Si un usuario abandona el servidor o se borra de data.json,
el bot elimina sus roles TFT la próxima vez que actualice.