const computerRouter = require("express").Router()
const { PrismaClient } = require("@prisma/client")
const authguard = require("../services/authguard")

const prisma = new PrismaClient()

computerRouter.get("/addcomputer", authguard, async (req, res) => {
    res.render("pages/home.twig", {
        entreprise: req.session.entreprise
    })
})

computerRouter.post("/addcomputer", authguard, async (req, res) => {
    try {
        const computer = await prisma.computer.create({
            data: {
                mac : req.body.mac,
                entrepriseId : req.session.entreprise.id
            }
        })
        res.redirect("/") 
    } 
    catch (error) {
        res.render("pages/addComputer.twig", {
            entreprise: req.session.entreprise, 
            error 
        })
    } 
})

computerRouter.get("/deleteComputer/:id", authguard, async (req, res) => {
    try {
        const deleteComputer = await prisma.computer.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })
        res.redirect("/")
    } catch (error) {
        res.redirect("/")
    } 
})

computerRouter.post("/updateComputer/:id", authguard, async (req, res) => {
    try {
        const updateComputer = await prisma.computer.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                mac : req.body.mac,
                entrepriseId : req.session.entreprise.id
            }
        })
        res.redirect("/")
    } catch (error) {
        res.redirect("/")
    }
})
computerRouter.post("/addEmployeToComputer", authguard, async (req, res) => {
    try {
        const { computerId, employeId } = req.body;
        const parsedComputerId = parseInt(computerId);
        const parsedEmployeId = parseInt(employeId);

        if (isNaN(parsedComputerId) || isNaN(parsedEmployeId)) {
            console.error("ID d'employé ou d'ordinateur invalide");
            return res.status(400).send("ID invalide.");
        }

        const computer = await prisma.computer.findUnique({
            where: { id: parsedComputerId },
            include: { employe: true }
        });

        if (computer.employe) {
            console.log("Cet ordinateur est déjà assigné à un employé");
            return res.status(400).send("Cet ordinateur est déjà assigné à un employé.");
        }

        // Assigner l'ordinateur à l'employé
        const updatedEmploye = await prisma.employe.update({
            where: { id: parsedEmployeId },
            data: {
                computerId: parsedComputerId
            }
        });

        res.redirect("/"); // Rediriger vers la page d'accueil après l'assignation
    } catch (error) {
        console.error("Erreur lors de l'assignation de l'ordinateur:", error);
        res.redirect("/"); // Rediriger en cas d'erreur
    }
});

computerRouter.get("/removeEmployeFromComputer/:computerId/:employeId", authguard, async (req, res) => {
    try {
        const { computerId, employeId } = req.params;
        const employe = await prisma.employe.findUnique({
            where: { id: parseInt(employeId) },
        });

        if (employe && employe.computerId === parseInt(computerId)) {
            await prisma.employe.update({
                where: { id: parseInt(employeId) },
                data: {
                    computerId: null,
                }
            });
        }
        res.redirect("/");
    } catch (error) {
        res.redirect("/");
    }
});

computerRouter.get("/addEmployeToComputer", authguard, async (req, res) => {
    try {
        const computers = await prisma.computer.findMany({
            where: { entrepriseId: req.session.entreprise.id },
            include: { employe: true } // Inclure l'employé assigné à chaque ordinateur
        });

        const employes = await prisma.employe.findMany({
            where: {
                entrepriseId: req.session.entreprise.id,
                computerId: null // Seulement les employés sans ordinateur assigné
            }
        });

        res.render("pages/home.twig", {
            entreprise: req.session.entreprise, 
            computers, // Passer les ordinateurs dans la vue
            employes   // Passer les employés dans la vue
        });
    } catch (error) {
        res.redirect("/");
    }
});


// computerRouter.post("/addEmployeToComputer", authguard, async (req, res) => {
//     try {
//         const { computerId, employeId } = req.body;
//         const updatedComputer = await prisma.employe.update({
//             where: { id: parseInt(employeId) },
//             data: {
//                computerId :parseInt(computerId),
//             }
//         });
//         res.redirect("/");
//     } catch (error) {
        
//         res.redirect("/");
//     }
// });


module.exports = computerRouter