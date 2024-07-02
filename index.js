const express = require('express');
const session = require('express-session');
const fs = require('fs').promises;
const { G4F } = require('g4f');

const PORT = process.env.PORT || 3000;
const app = express();
const router = express.Router();
const g4f = new G4F();

// Generate a secure secret key
const secretKey = "tMZP74pxVwZD4cZ9OTg3r4Gh7F58hLZacT1Fov2lt6E="; // Replace with your generated secret key

// Set up session middleware with your_secret_key
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true
}));

// Serve static files (like HTML)
app.use(express.static('public'));

// Endpoint for handling GET requests
router.get('/api/gptconvo', async (req, res) => {
    const { ask } = req.query;
    const id = req.sessionID; // Use session ID as the unique identifier

    if (!ask || !id) {
        return res.status(400).json({ error: 'Both "ask" and session ID are required' });
    }

    let messages = [];

    try {
        const data = await fs.readFile(`./${id}.json`, 'utf8');
        messages = JSON.parse(data);
    } catch (error) {
        messages = [
            { role: "system", content: "Welcome! You're starting a new conversation." }
        ];
    }

    messages.push({ role: "user", content: ask });

    try {
        const response = await g4f.chatCompletion(messages);
        messages.push({ role: "assistant", content: response });

        await fs.writeFile(`./${id}.json`, JSON.stringify(messages, null, 2));

        res.json({ response });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
