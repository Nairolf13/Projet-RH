const entrepriseRouter = require('express').Router();
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")
const upload = require("../services/downloadPicture")
const hashPasswordExtension = require("../services/extensions/hashPasswordExtension")
const authguard = require("../services/authguard")

const prisma = new PrismaClient().$extends(hashPasswordExtension)

entrepriseRouter.get("/register", (req, res) => {
    res.render("pages/register.twig", {
        entreprise: req.session.entreprise
    }); 
});


entrepriseRouter.get("/login", (req, res) => {
    res.render("pages/login.twig")
})

entrepriseRouter.get("/logout", (req, res) => {
    req.session.destroy()
    res.redirect("login")

})


entrepriseRouter.get("/", authguard, async (req, res) => {
    try {
        const entreprise = await prisma.entreprise.findUnique({
            where: {
                id: req.session.entreprise.id
            },
            include: {
                computers: {
                    include: {
                        employe: true
                    } 
                },
                employes: true
            }
        })
        res.render("pages/home.twig", {
            entreprise,
            computers: entreprise.computers
        })

    } catch (error) {
        console.log(error);
        res.render("pages/home.twig", {
            error,
        })
    }
})


entrepriseRouter.get("/updateEmploye/:id", async (req, res) => {
    res.render("pages/addEmploye.twig", {
        entreprise: req.session.entreprise,
        employe: req.session.employe,
        employe: await prisma.employe.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        })
    })
})


entrepriseRouter.post("/updateEmploye/:id", upload.single('picture'), async (req, res) => {
    console.log("Mise à jour de l'employé : ", req.params.id);
    try {
        const employe = await prisma.employe.findUnique({
            where: { id: parseInt(req.params.id) }
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
            where: { id: parseInt(req.params.id) },
            data: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                mail: req.body.mail,
                age: parseInt(req.body.age),
                password: req.body.password,
                picture: picturePath
            }
        });

        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.redirect("/");
    }
});

entrepriseRouter.post("/register", async (req, res) => {
    try {
        if (req.body.password === req.body.confirmPassword) {
            const entreprise = await prisma.entreprise.create({
                data: {
                    socialReason: req.body.socialReason,
                    siret: req.body.siret,
                    mail: req.body.mail,
                    password: req.body.password
                }
            })
            res.redirect("/login")
        }
        else throw ({ confirmPassword: "Les mots de passe ne correspondent pas !" })

    }
    catch (error) {
        res.render("pages/register.twig", {
            error: error,
            title: "Inscription"
        })
    }
})

entrepriseRouter.post("/login", async (req, res) => {
    try {
        const entreprise = await prisma.entreprise.findUnique({
            where: {
                mail: req.body.mail
            }
        });

        if (entreprise) {
            if (await bcrypt.compare(req.body.password, entreprise.password)) {
                req.session.entreprise = entreprise;
                res.redirect("/");
            } else {
                throw { password: "Mot de passe incorrect" };
            }
        } else {
            throw { mail: "Aucun compte trouvé avec cet email" };
        }
    } catch (error) {
        res.render("pages/login.twig", {
            error
        });
    }
});


entrepriseRouter.get("/deleteEntreprise/:id", authguard, async (req, res) => {
    try {
        const deleteEntreprise = await prisma.entreprise.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })
        res.redirect("/")
    } catch (error) {
        res.redirect("/")
    }
})

entrepriseRouter.post("/updateEntreprise/:id", authguard, async (req, res) => {
    try {
        const entreprise = await prisma.entreprise.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        });

        let newPassword = null;

        if (req.body.password && req.body.password !== '') {
            if (req.body.password !== req.body.confirmPassword) {
                throw new Error("Les mots de passe ne correspondent pas !");
            }

            newPassword = await bcrypt.hash(req.body.password, 10);
        }

        await prisma.entreprise.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                socialReason: req.body.socialReason,
                siret: req.body.siret,
                mail: req.body.mail,
                ...(newPassword && { password: newPassword })
            }
        });

        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.redirect("/");
    }
});






module.exports = entrepriseRouter       