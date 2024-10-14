const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient()

const authguardEmploye = async (req, res, next) => {
    try {
        if (req.session.employe) {
            let employe = await prisma.employe.findUnique({
                where: {
                    mail: req.session.employe.mail
                }
            })
            if (employe) {
                return next()
            }
            throw { authguard: "L'utilisateur n'est pas connecté" }
        }
        throw { authguard: "L'utilisateur n'est pas connecté" }
    } catch (error) {
        res.redirect("/login")
    }

}



module.exports = authguardEmploye