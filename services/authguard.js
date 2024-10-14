const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient()

const authguard = async (req, res, next) => {
    try {
        if (req.session.entreprise) {
            let entreprise = await prisma.entreprise.findUnique({
                where: {
                    mail: req.session.entreprise.mail
                }
            })
            if (entreprise) {
                return next()
            }
            throw { authguard: "L'utilisateur n'est pas connecté" }
        }
        throw { authguard: "L'utilisateur n'est pas connecté" }
    } catch (error) {
        res.redirect("/login")
    }

}



module.exports = authguard