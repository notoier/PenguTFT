const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const config = require('./config.json');

const { DISCORD_TOKEN, CLIENT_ID, RIOT_API_KEY } = config;

const DATA_PATH = './data.json';
let linkedAccounts = {};

if (fs.existsSync(DATA_PATH)) {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    // quitar BOM si lo hay
    const clean = raw.replace(/^\uFEFF/, '');
    linkedAccounts = JSON.parse(clean || '{}');
} else {
    fs.writeFileSync(DATA_PATH, JSON.stringify({}, null, 2));
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const TIER_ROLE_MAP = {
    'CHALLENGER': 'TFT – Challenger',
    'GRANDMASTER': 'TFT – Grandmaster',
    'MASTER': 'TFT – Master',
    'DIAMOND': 'TFT – Diamond',
    'EMERALD' : 'TFT EMERALD',
    'PLATINUM': 'TFT – Platinum',
    'GOLD': 'TFT – Gold',
    'SILVER': 'TFT – Silver',
    'BRONZE': 'TFT – Bronze',
    'IRON': 'TFT – Iron',
};

const UNRANKED_ROLE_NAME = 'TFT – Unranked';


const ROLE_COLORS = {
    'CHALLENGER': '#00FFFF',
    'GRANDMASTER': '#E74C3C',
    'MASTER': '#A569BD',
    'DIAMOND': '#4FC3F7',
    'EMERALD': '#1ABC9C',
    'PLATINUM': '#9ABBBD',
    'GOLD': '#F1C40F',
    'SILVER': '#BDC3C7',
    'BRONZE': '#A97142',
    'IRON': '#5C5C5C',
    'UNRANKED': '#2B2D31',
};

async function ensureTftRolesExist(guild) {
    try {
        const existingRoles = guild.roles.cache.map(r => r.name);
        const allRoles = [...Object.values(TIER_ROLE_MAP), UNRANKED_ROLE_NAME];

        for (const roleName of allRoles) {
            if (!existingRoles.includes(roleName)) {
                let color = '#2B2D31';
                for (const [tier, mappedName] of Object.entries(TIER_ROLE_MAP)) {
                    if (mappedName === roleName) color = ROLE_COLORS[tier];
                }
                if (roleName === UNRANKED_ROLE_NAME) color = ROLE_COLORS.UNRANKED;

                await guild.roles.create({
                    name: roleName,
                    color,
                    reason: 'Automatic role creation with custom color based on rank ',
                });
                console.log(`🎨 Creado rol ${roleName} (${color}) en ${guild.name}`);
            }
        }

        console.log(`✅ Roles created ${guild.name}`);
    } catch (err) {
        console.error(`❌ Error creating roles ${guild.name}:`, err);
    }
}


async function removeAllTftRoles(member) {
    const allRoleNames = [...Object.values(TIER_ROLE_MAP), UNRANKED_ROLE_NAME];
    for (const roleName of allRoleNames) {
        const role = member.guild.roles.cache.find(r => r.name === roleName);
        if (role && member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
        }
    }
}

async function assignTftRole(member, rankedData) {
    await removeAllTftRoles(member);

    let roleName;
    if (rankedData?.unranked) {
        roleName = UNRANKED_ROLE_NAME;
    } else {
        const tier = rankedData.tier?.toUpperCase();
        roleName = TIER_ROLE_MAP[tier];
    }

    if (!roleName) return;

    const role = member.guild.roles.cache.find(r => r.name === roleName);
    if (!role) {
        console.log(`⚠️ No encontré el rol ${roleName} en ${member.guild.name}`);
        return;
    }

    await member.roles.add(role);
    console.log(`✅ Asignado rol ${roleName} a ${member.user.tag}`);
}

async function updateAllTftRoles() {
    console.log('🔄 Iniciando actualización automática de roles TFT...');

    // recorremos todos los servers donde está el bot
    for (const [guildId, guild] of client.guilds.cache) {
        // 1) aseguramos que los roles existen
        await ensureTftRolesExist(guild);

        // 2) ACTUALIZAR: para cada usuario vinculado, actualizar su rol
        for (const [userId, account] of Object.entries(linkedAccounts)) {
            const member = await guild.members.fetch(userId).catch(() => null);
            if (!member) continue;

            const ranked = await getTftRankFromPuuid(account.puuid);
            await assignTftRole(member, ranked || { unranked: true });
        }

        // 3) LIMPIAR: para cada miembro del servidor, si tiene rol TFT pero NO está en linkedAccounts, se lo quitamos
        const allTftRoleNames = [...Object.values(TIER_ROLE_MAP), UNRANKED_ROLE_NAME];

        for (const [memberId, member] of await guild.members.fetch()) {
            // si no está vinculado…
            if (!linkedAccounts[memberId]) {
                // …pero sí tiene algún rol TFT → se lo quitamos
                const hasTftRole = member.roles.cache.some(role =>
                    allTftRoleNames.includes(role.name)
                );
                if (hasTftRole) {
                    await removeAllTftRoles(member);
                    console.log(`🧹 Quitados roles TFT a ${member.user.tag} (no está linkeado)`);
                }
            }
        }
    }

    console.log('✅ Actualización + limpieza de roles TFT completada.');
}


// 1. Define slash commands
const commands = [
    new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your TFT account')
        .addStringOption(opt =>
            opt
                .setName('riot')
                .setDescription('State your Riot name as Name#TAG')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('tft')
        .setDescription('Show your rank in TFT'),
].map(cmd => cmd.toJSON());

// 2. Register discord commands
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function registerCommands() {
    try {
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );
        console.log('✅ Commands registered (/link y /tft)');
    } catch (err) {
        console.error('Error when registering commands:', err);
    }
}

// Helper: Save data in disc
function saveData() {
    fs.writeFileSync(DATA_PATH, JSON.stringify(linkedAccounts, null, 2));
}

// Helper: Get rank from riot
async function getTftRankFromPuuid(puuid) {
    // 1. Get Summoner
    const summRes = await fetch(
        `https://euw1.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`
    );
    if (!summRes.ok) return null;
    const summoner = await summRes.json();

    // 2. Get league (EUW1)
    const leagueRes = await fetch(
        `https://euw1.api.riotgames.com/tft/league/v1/entries/by-summoner/${summoner.id}?api_key=${RIOT_API_KEY}`
    );
    if (!leagueRes.ok) {
        return { gameName: summoner.name, unranked: true };
    }
    const leagues = await leagueRes.json();

    // 3. Check for rank
    const ranked = leagues.find(l => l.queueType === 'RANKED_TFT') || leagues[0];

    // If Unranked
    if (!ranked) {
        return {
            gameName: summoner.name,
            unranked: true,
        };
    }

    return {
        gameName: summoner.name,
        tier: ranked.tier,
        rank: ranked.rank,
        lp: ranked.leaguePoints,
        wins: ranked.wins,
        losses: ranked.losses,
    };
}

client.on('guildCreate', async guild => {
    console.log(`🤝 El bot se ha unido a ${guild.name}`);
    await ensureTftRolesExist(guild);
});

client.once('clientReady', async () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);

    // Verify roles on server
    for (const [guildId, guild] of client.guilds.cache) {
        await ensureTftRolesExist(guild);
    }

    // Execute once
    await updateAllTftRoles();

    // Repeat once for every 6 hours 
    setInterval(async () => {
        await updateAllTftRoles();
    }, 6 * 60 * 60 * 1000);

});

client.once('clientReady', () => {
    console.log(`✅ Bot connected as ${client.user.tag}`);
});

// Manage commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // /link Nombre#TAG
    if (interaction.commandName === 'link') {
        const riotInput = interaction.options.getString('riot');
        const [gameName, tagLine] = riotInput.split('#');

        if (!gameName || !tagLine) {
            await interaction.reply('Formato inválido. Usa: `Nombre#TAG`.');
            return;
        }

        try {
            // Get Riot account
            const res = await fetch(
                `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
                    gameName
                )}/${encodeURIComponent(tagLine)}?api_key=${RIOT_API_KEY}`
            );

            if (!res.ok) {
                await interaction.reply('No pude encontrar esa cuenta en Riot. Revisa el nombre y el tag.');
                return;
            }

            const account = await res.json();

            // Save
            linkedAccounts[interaction.user.id] = {
                puuid: account.puuid,
                gameName,
                tagLine,
                regionPlatform: 'euw1',
                regionCluster: 'europe',
            };
            saveData();

            // ⚠️ Check rank and asign role
            // First get guild member
            const member = await interaction.guild.members.fetch(interaction.user.id);

            const ranked = await getTftRankFromPuuid(account.puuid);

            if (!ranked) {
                // If unable to get data set as unranked
                await assignTftRole(member, { unranked: true });
                await interaction.reply(
                    `✅ Account linked to **${gameName}#${tagLine}**, but I couldn't get your rank. You'll be assigned unranked.`
                );
                return;
            }

            await assignTftRole(member, ranked);

            if (ranked.unranked) {
                await interaction.reply(
                    `✅ Account linked to **${gameName}#${tagLine}**. You are unranked, so you'll be **TFT – Unranked**.`
                );
            } else {
                await interaction.reply(
                    `✅ Account linked to **${gameName}#${tagLine}**. You're in **${ranked.tier} ${ranked.rank}**, role assigned.`
                );
            }
        } catch (err) {
            console.error(err);
            await interaction.reply('❌ Error when linking accounts');
        }
    }


    // /tft
    if (interaction.commandName === 'tft') {
        const linked = linkedAccounts[interaction.user.id];
        if (!linked) {
            await interaction.reply('First link your account with `/link Nombre#TAG`.');
            return;
        }

        try {
            const ranked = await getTftRankFromPuuid(linked.puuid);
            if (!ranked) {
                await interaction.reply('Unable to get account data.');
                return;
            }

            if (ranked.unranked) {
                await interaction.reply(
                    `👋 **${ranked.gameName}** Unranked. Play some ranked games and use \`/tft\`. again` 
                );
                return;
            }

            await interaction.reply(
                `🏆 **${linked.gameName}#${linked.tagLine}** is in **${ranked.tier} ${ranked.rank}** (${ranked.lp} LP)\nW:${ranked.wins} / L:${ranked.losses}`
            );
        } catch (err) {
            console.error(err);
            await interaction.reply('❌ Error while checking your elo.');
        }
    }
});

// Start up
(async () => {
    await registerCommands();
    client.login(DISCORD_TOKEN);
})();
