require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend access
app.use(cors());
app.use(express.json());

// Discord Bot Setup
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// Start Bot
app.post('/bot/start', async (req, res) => {
    if (!client.isReady()) {
        try {
            await client.login(process.env.BOT_TOKEN);
            res.json({ message: "Bot started successfully!" });
        } catch (error) {
            res.status(500).json({ message: "Error starting bot", error });
        }
    } else {
        res.json({ message: "Bot is already running!" });
    }
});

// Stop Bot
app.post('/bot/stop', async (req, res) => {
    if (client.isReady()) {
        await client.destroy();
        res.json({ message: "Bot stopped successfully!" });
    } else {
        res.json({ message: "Bot is not running!" });
    }
});

// Get Bot Status
app.get('/bot/status', (req, res) => {
    res.json({ status: client.isReady() ? "Online" : "Offline" });
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
