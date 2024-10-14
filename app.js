// app.js
const express = require("express");
const entrepriseRouter = require("./router/entrepriseRouter");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require('path');
const computerRouter = require("./router/computerRouter");
const employeRouter = require("./router/employeRouter");
const bodyParser = require("body-parser");
const axios = require("axios");

dotenv.config();

const app = express();

// Middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(session({
    secret: "dfghjk?lrtyu!io584fzev54.fb",
    resave: true,
    saveUninitialized: true
}));

// Route pour le résumé
app.post("/api/summarize", async (req, res) => {
    const textToSummarize = req.body.text;
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
            { inputs: textToSummarize },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.json({ summary: response.data[0].summary_text });
    } catch (error) {
        console.error("Erreur lors de la génération du résumé:", error);
        res.status(500).send("Erreur lors de la génération du résumé");
    }
});

// Routes existantes
app.use(entrepriseRouter);
app.use(computerRouter);
app.use(employeRouter);


// Lancer le serveur
app.listen(3000, () => {
    console.log("Écoute sur le port 3000");
});
