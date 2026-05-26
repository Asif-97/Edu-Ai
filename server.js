require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Groq API
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// API Route for Chat
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const systemPrompt = "You are a friendly and expert AI Teacher for Class 9-10 students in Bangladesh. Explain things simply, sometimes using a mix of Bengali and English if helpful.";

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant", // সঠিক এবং নতুন মডেল
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ]
        });

        res.json({ success: true, reply: completion.choices[0].message.content });
    } catch (error) {
        console.error("Groq API Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`EduCore Backend running on http://localhost:${port}`);
});