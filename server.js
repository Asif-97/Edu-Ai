const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');
require('dotenv').config(); // লোকাল .env ফাইল পড়ার জন্য

const app = express();
app.use(cors());
app.use(express.json());

// Groq AI ইনিশিয়ালাইজেশন
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// ==========================================
// ১. AI Teacher (Chat API)
// ==========================================
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
            model: "llama3-8b-8192",
        });

        res.json({ success: true, reply: chatCompletion.choices[0].message.content });
    } catch (error) {
        console.error("Groq Chat API Error:", error);
        res.status(500).json({ success: false, error: "Backend Server Error" });
    }
});

// ==========================================
// ২. Dynamic Routine Generator API
// ==========================================
app.post('/api/routine', async (req, res) => {
    try {
        const { subjects } = req.body;
        
        if (!subjects || subjects.length === 0) {
            return res.status(400).json({ success: false, error: "কোনো সাবজেক্ট সিলেক্ট করা হয়নি!" });
        }

        const prompt = `You are an expert academic planner for Class 9-10 (SSC) students in Bangladesh. 
        A student is weak in the following subjects: ${subjects.join(', ')}. 
        Create a highly effective 3-day study routine focusing ONLY on these subjects. 
        Format your response strictly as a JSON array of objects. Do not write any other text.
        Example format:
        [
            { "day": "Day 1: Focus on Physics", "morning": "Read chapter 2 and memorize formulas.", "evening": "Solve board questions of 2023." },
            { "day": "Day 2: Chemistry Basics", "morning": "Practice valency and equations.", "evening": "Read chapter 4 deeply." }
        ]`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama3-8b-8192", 
            temperature: 0.7
        });

        let aiResponse = chatCompletion.choices[0].message.content.trim();
        
        // Regex Error Fixed
        const jsonRegex = new RegExp('```json', 'gi');
        const tickRegex = new RegExp('```', 'g');
        aiResponse = aiResponse.replace(jsonRegex, '').replace(tickRegex, '').trim();

        const routineData = JSON.parse(aiResponse);
        res.status(200).json({ success: true, routine: routineData });
    } catch (error) {
        console.error("Routine API Error:", error);
        res.status(500).json({ success: false, error: "রুটিন জেনারেট করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।" });
    }
});

// ==========================================
// Vercel এবং Localhost এর জন্য এক্সপোর্ট
// ==========================================
module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}