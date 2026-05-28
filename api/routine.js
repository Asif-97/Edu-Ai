const { Groq } = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

module.exports = async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            const { subjects } = req.body;
            
            if (!subjects || subjects.length === 0) {
                return res.status(400).json({ success: false, error: "কোনো সাবজেক্ট সিলেক্ট করা হয়নি!" });
            }

            // AI Prompt: AI-কে বলছি যেন সে JSON ফরম্যাটে রুটিন দেয়
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
            
            // AI অনেক সময় ```json ... ``` এর ভেতরে উত্তর দেয়, সেটাকে ক্লিন করার জন্য (Regex Error Fixed)
            if (aiResponse.startsWith('```json')) {
                aiResponse = aiResponse.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            } else if (aiResponse.startsWith('
```')) {
                aiResponse = aiResponse.replace(/\`\`\`/g, '').trim();
            }

            // টেক্সটকে রিয়েল JSON অবজেক্টে কনভার্ট করা
            const routineData = JSON.parse(aiResponse);

            res.status(200).json({ success: true, routine: routineData });
        } catch (error) {
            console.error("Routine API Error:", error);
            res.status(500).json({ success: false, error: "রুটিন জেনারেট করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
};