require('dotenv').config();
const express = require('express');
const cors = require('cors');
const client = require("./lieserl-stable"); // Import the bot instance

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "https://jadedsieger.github.io" }));
app.use(express.json());

let botRunning = false; // Track bot status

// Start Bot
app.post('/bot/start', async (req, res) => {
    if (botRunning || client.isReady()) {
        return res.json({ message: "Bot is already running!" });
    }

    try {
        await client.login(process.env.token);
        botRunning = true;
        res.json({ message: "Bot started successfully!" });
    } catch (error) {
        console.error("Error starting bot:", error);
        res.status(500).json({ message: "Error starting bot", error });
    }
});

// Stop Bot
app.post('/bot/stop', async (req, res) => {
    if (!botRunning || !client.isReady()) {
        return res.json({ message: "Bot is not running!" });
    }

    await client.destroy();
    botRunning = false;
    res.json({ message: "Bot stopped successfully!" });
});

// Get Bot Status
app.get('/bot/status', (req, res) => {
    res.json({ status: client.isReady() ? "Online" : "Offline" });
});

// Get Bot Name
app.get('/bot/name', (req, res) => {
    res.json({ name: "Lieserl Einstein" });
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
