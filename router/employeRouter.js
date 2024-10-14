const employeRouter = require("express").Router()
const { PrismaClient } = require("@prisma/client")
const upload = require("../services/downloadPicture")
const hashPasswordExtension = require("../services/extensions/hashPasswordExtension")
const authguard = require("../services/authguard")
const authguardEmploye = require("../services/authguardEmploye")
const bcrypt = require("bcrypt")
const prisma = new PrismaClient().$extends(hashPasswordExtension)


employeRouter.get('/addemploye', (req, res) => {
    res.render("pages/home.twig", {
        employe: req.session.employe,
        entreprise: req.session.entreprise
    })
})

employeRouter.post('/addemploye', upload.single('picture'), async (req, res) => {
    try {
        const { firstName, lastName, mail, age, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            throw ({ confirmPassword: "Vos mots de passe ne correspondent pas !" });
        }

        let picturePath = null;
        if (req.file) {
            picturePath = `/uploads/${req.file.filename}`;
        }

        const existingEmploye = await prisma.employe.findUnique({
            where: { mail: mail },
        });

        if (existingEmploye) {
            throw ({ email: "Cet email est déjà utilisé par un autre employé." });
        }

        const employe = await prisma.employe.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                mail: mail,
                age: parseInt(age),
                password: password, 
                picture: picturePath, 
                entrepriseId: req.session.entreprise.id
            }
        });
        res.redirect('/');

    } catch (error) {
        console.error("Erreur lors de la création de l'employé:", error);
        res.render("pages/home.twig", {
            entreprise: req.session.entreprise,
            error: error,
            title: "Inscription"
        });
    }
});


employeRouter.get("/deleteEmploye/:id", authguard, async (req, res) => {
    try {
        const deleteEmploye = await prisma.employe.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })
        res.redirect("/")
    } catch (error) {
        res.redirect("/")
    }
})

employeRouter.get("/updateEmploye",authguardEmploye, async (req, res) => {
    
    res.render("pages/addEmploye.twig", {
        entreprise: req.session.entreprise,
        employe: req.session.employe,
        employe: await prisma.employe.findUnique({
            where: {
                id: parseInt(req.session.employe.id)
            }
        })
    })
})

employeRouter.post("/updateEmploye",authguardEmploye, upload.single('picture'), async (req, res) => {
    try {
        const employe = await prisma.employe.findUnique({
            where: { id: parseInt(req.session.employe.id) }
        });

        if (req.body.password) {
            if (req.body.password !== req.body.confirmPassword) {
                throw new Error("Les mots de passe ne correspondent pas !");
            }

        }
        let picturePath = employe.picture; 
        if (req.file) {
            picturePath = `/uploads/${req.file.filename}`; 
        }

        const updateEmploye = await prisma.employe.update({
            where: { id: parseInt(req.session.employe.id) },
            data: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                mail: req.body.mail,
                age: parseInt(req.body.age),
                password: req.body.password,
                picture: picturePath
            }
        });

        res.redirect("/homeEmploye");
    } catch (error) {
        console.log(error);
        res.redirect("/homeEmploye");
    }
});

employeRouter.post("/loginEmploye", async (req, res) => {
    try {
        console.log("Tentative de connexion:", req.body.mail);
        const employe = await prisma.employe.findUnique({
            where: {
                mail: req.body.mail
            },
            include: {
                entreprise: true  
            }
        });
        if (!employe) {
            console.log("Aucun compte trouvé avec cet email");
            throw { mail: "Aucun compte trouvé avec cet email" };
        }
       
        if (await bcrypt.compare(req.body.password, employe.password)) {
            
            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { recipientId: employe.id },
                        { senderId: employe.id }
                    ]
                },
                orderBy: { createdAt: 'desc' }
            });

            req.session.employe = employe;
            req.session.messages = messages;  
            
            res.redirect("/homeEmploye");
        } else {
            console.log("Mot de passe incorrect");
            throw { password: "Mot de passe incorrect" };
        }
    } catch (error) {
        console.log("Erreur de connexion:", error);
        res.render("pages/login.twig", {
            error: error
        });
    }
});

employeRouter.get("/loginEmploye", (req, res) => {
    if (req.session.employe) {
        return res.redirect("/homeEmploye");
    }
    res.render("pages/login.twig", {
        isEmploye: true 
    });
});


employeRouter.get('/homeEmploye', authguardEmploye, async (req, res) => {
    try {
        const employe = await prisma.employe.findUnique({
            where: { id: req.session.employe.id },
            include: {
                entreprise: {
                    include: {
                        employes: true 
                    }
                },
                receivedMessages: {
                    where: {
                        recipientType: 'EMPLOYE',
                        recipientId: req.session.employe.id
                    },
                    include: { senderEmploye: true },
                }
            }
        });

        res.render('pages/homeEmploye.twig', {
            employe: req.session.employe,
            employe:employe,
            messages: employe.receivedMessages,  
         });
    } catch (error) {
        console.error("Erreur lors du chargement des données de l'employé :", error);
        res.render('pages/homeEmploye.twig');
    }
});



employeRouter.post('/sendMessage', async (req, res) => {
    try {
        const { recipientId, recipientType, content } = req.body;
        const senderId = req.session.employe?.id;
        
        if (!senderId) {
            return res.status(400).json({ error: "Utilisateur non authentifié." });
        }

        const employe = await prisma.employe.findUnique({
            where: { id: senderId }
        });

        if (!employe) {
            return res.status(400).json({ error: "Employé introuvable." });
        }

        const message = await prisma.message.create({
            data: {
                content: content,
                senderId: senderId,
                senderType: 'EMPLOYE',
                recipientId: parseInt(recipientId),
                recipientType: recipientType
            }
        });

        res.render("pages/homeEmploye.twig",{
            employe:employe,
            messages:message
        });
       
       
    } catch (error) {
        console.error("Erreur d'envoi de message:", error);
        res.status(500).json({ error: "Erreur lors de l'envoi du message" });
    }
});


employeRouter.get('/messages', async (req, res) => {   
    try {
        const employeId = req.session.employe.id;
        
        const messages = await prisma.message.findMany({
            where: {
              OR: [
                { recipientId: req.session.employe.id },
                { senderId: req.session.employe.id }
              ]
            },
            orderBy: { createdAt: 'desc' }
          });
          
          res.render("pages/home.twig", {
            entreprise: req.session.entreprise,
            employe : req.session.employe,
            messages: messages,
        });
        
    } catch (error) {
        console.error("Erreur de récupération des messages:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des messages" });
    }
});


employeRouter.post('/deleteMessage', async (req, res) => {
    try {
        const { messageId } = req.body;
        const messageToDelete = await prisma.message.findUnique({
            where: { id: parseInt(messageId) }
        });

        if (!messageToDelete) {
            return res.status(404).json({ error: "Message introuvable." });
        }

        await prisma.message.delete({
            where: { id: parseInt(messageId) }
        });

        return res.redirect('/homeEmploye');
    } catch (error) {
        console.error("Erreur lors de la suppression du message :", error);
        res.status(500).json({ error: "Erreur lors de la suppression du message." });
    }
}); 

employeRouter.get('/api/calendar-events', authguardEmploye, async (req, res) => {
    try {
        const events = await prisma.calendarEvent.findMany({
            where: { employeId: req.session.employe.id },
            orderBy: { date: 'asc' }
        });
        res.json(events);
    } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des événements' });
    }
});

employeRouter.post('/api/calendar-events', authguardEmploye, async (req, res) => {
    try {
        const { title, description, date } = req.body;
        const event = await prisma.calendarEvent.create({
            data: {
                title,
                description,
                date: new Date(date),
                employeId: req.session.employe.id
            }
        });
        res.json(event);
    } catch (error) {
        console.error('Erreur lors de la création de l\'événement:', error);
        res.status(500).json({ error: 'Erreur lors de la création de l\'événement' });
    }
});

employeRouter.put('/api/calendar-events/:id', authguardEmploye, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date } = req.body;
        const event = await prisma.calendarEvent.update({
            where: { 
                id: parseInt(id),
                employeId: req.session.employe.id 
            },
            data: { title, description, date: new Date(date) }
        });
        res.json(event);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'événement:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'événement' });
    }
});

employeRouter.delete('/api/calendar-events/:id', authguardEmploye, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.calendarEvent.delete({
            where: { 
                id: parseInt(id),
                employeId: req.session.employe.id 
            }
        });
        res.render("/homeEmploye")
        // res.json({ message: 'Événement supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de l\'événement' });
    }
});

module.exports = employeRouter  