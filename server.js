require('dotenv').config();
const express = require('express');
const cors = require('cors');
const client = require("./lieserl-stable");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend access
app.use(cors({origin: "https://jadedsieger.github.io"}));
app.use(express.json());

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
    } else {
        res.json({ message: "Bot is not running!" });
    }
});

app.get("/", (req, res) => {
    res.json({ message: "Lieserl Bot API is running!" });
});
// Get Bot Status
app.get('/bot/status', (req, res) => {
    res.json({ status: client.isReady() ? "Online" : "Offline" });
});
app.get('/bot/name', (req, res) => {
    res.json({ name: "Lieserl Einstein" });
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
