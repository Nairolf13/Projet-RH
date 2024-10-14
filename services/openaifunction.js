// openaifunction.js
const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function getChatbotResponse(prompt) {
    try {
        const response = await axios.post(OPENAI_API_URL, {
            model: "gpt-3.5-turbo", // Vous pouvez changer le modèle si nécessaire
            messages: [{ role: "user", content: prompt }],
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data.choices[0].message.content; // Renvoie la réponse du chatbot
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API d\'OpenAI:', error);
        throw error; // Propagation de l'erreur pour gestion ultérieure
    }
}

module.exports = { getChatbotResponse };
