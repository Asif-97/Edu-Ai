const { Groq } = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

module.exports = async function handler(req, res) {
    // CORS Error যেন না হয় সেজন্য এই হেডারগুলো দেওয়া হলো
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // প্রি-ফ্লাইট রিকোয়েস্ট হ্যান্ডেলিং
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // মূল চ্যাট লজিক
    if (req.method === 'POST') {
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

            res.status(200).json({ success: true, reply: chatCompletion.choices[0].message.content });
        } catch (error) {
            console.error("Groq API Error:", error);
            res.status(500).json({ success: false, error: "Backend Error: " + error.message });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
};