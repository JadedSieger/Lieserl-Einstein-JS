require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process'); // For restarting the bot
let client = require("./lieserl-stable"); // Load bot module

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend access
app.use(cors({ origin: "https://jadedsieger.github.io" }));
app.use(express.json());

let botProcess = null;

// Function to start the bot
function startBot() {
    if (botProcess) botProcess.kill(); // Kill previous instance if running
    botProcess = exec("node lieserl-stable.js", (error, stdout, stderr) => {
        if (error) console.error(`Bot Error: ${error.message}`);
        if (stderr) console.error(`Bot Stderr: ${stderr}`);
        console.log(`Bot Output: ${stdout}`);
    });
}

// Start Bot
app.post('/bot/start', async (req, res) => {
    if (!client.isReady()) {
        try {
            await client.login(process.env.token);
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

        setTimeout(() => {
            console.log("Bot is now stopped.");
        }, 2000);
    } else {
        res.json({ message: "Bot is not running!" });
    }
});

// Restart Bot
app.post('/bot/restart', (req, res) => {
    console.log("Restarting bot...");
    startBot();
    res.json({ message: "Bot is restarting..." });
});

// Get API Root
app.get("/", (req, res) => {
    res.json({ message: "Lieserl Bot API is running!" });
});

// Get Bot Status
app.get('/bot/status', (req, res) => {
    res.json({ status: botProcess ? "Online" : "Offline" });
});

// Get Bot Name
app.get('/bot/name', (req, res) => {
    res.json({ name: "Lieserl Einstein" });
});

// Start the Express Server & Bot on startup
startBot();
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
