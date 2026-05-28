const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq AI
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Chat API Route
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "You are an expert AI teacher for class 9-10 students in Bangladesh. You help them with physics, math, english, and other SSC subjects. Always explain concepts simply. You can speak both English and Bengali." 
                },
                { role: "user", content: message }
            ],
            model: "llama3-8b-8192", // Groq's fast model
        });

        res.json({ success: true, reply: chatCompletion.choices[0].message.content });
    } catch (error) {
        console.error("Groq API Error:", error);
        res.status(500).json({ success: false, error: "Backend Server Error" });
    }
});

// VERY IMPORTANT FOR VERCEL: Export the app
module.exports = app;

// Local testing fallback
if (require.main === module) {
    app.listen(5000, () => console.log("Server running on port 5000"));
}