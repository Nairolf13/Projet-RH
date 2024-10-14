// router/openaiRouter.js
const express = require('express');
const { OpenAI } = require('openai'); // Vérifiez que cela fonctionne avec la bonne importation
const router = express.Router();

// Créez une instance du client OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Assurez-vous que la clé API est définie dans votre .env
});

// Route pour gérer les requêtes de chat
router.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message; // Suppose que le message est dans le corps de la requête

    try {   
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Modèle à utiliser
            messages: [{ role: 'user', content: userMessage }],
        }); 

        res.json({ response: response.choices[0].message.content });
    } catch (error) {
        console.error('Erreur lors de l\'appel à OpenAI:', error);
        res.status(500).send('Erreur lors de l\'envoi du message à OpenAI');
    }  
});
 
module.exports = router;
   