require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/api/questions', async (req, res) => {
    try {
        const { topic } = req.body;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: "openai/gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `Generate a quiz with 10 multiple-choice questions about ${topic}.
                    Each question should have:
                    {
                        "question": "question text",
                        "options": ["option1", "option2", "option3", "option4"],
                        "correctAnswer": index (0-3)
                    }
                    Return ONLY the JSON array, no extra text or markdown.`
                },
                {
                    role: "user",
                    content: `Generate 10 questions on ${topic}.`
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        let questionsText = response.data.choices[0].message.content;
        questionsText = questionsText.replace(/```json|```/g, '').trim();

        let questions;
        try {
            questions = JSON.parse(questionsText);
        } catch (err) {
            console.error('Parsing error:', err);
            return res.status(500).json({ error: 'Invalid quiz format returned from API.' });
        }

        if (!Array.isArray(questions) || !questions.length) {
            throw new Error("No questions returned from API.");
        }

        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error.message);
        res.status(500).json({ error: 'Failed to fetch questions', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
