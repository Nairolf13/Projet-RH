const { Prisma } = require("@prisma/client");
const bcrypt = require("bcrypt");

module.exports = Prisma.defineExtension({
    query: {
        entreprise: {
            create: async ({ args, query }) => {
                try {
                    if (args.data.password) {
                        const hash = await bcrypt.hash(args.data.password, 10);
                        args.data.password = hash;
                    }
                    return query(args);
                } catch (error) {
                    throw error;
                }
            },
            update: async ({ args, query }) => {
                try {
                    if (args.data.password) {
                        const hash = await bcrypt.hash(args.data.password, 10);
                        args.data.password = hash;
                    }
                    return query(args);
                } catch (error) {
                    throw error;
                }
            }
        },
        employe: {
            create: async ({ args, query }) => {
                try {
                    if (args.data.password) {
                        const hash = await bcrypt.hash(args.data.password, 10);
                        args.data.password = hash;
                    }
                    return query(args);
                } catch (error) {
                    throw error;
                }
            },
            update: async ({ args, query }) => {
                try {
                    if (args.data.password) {
                        const hash = await bcrypt.hash(args.data.password, 10);
                        args.data.password = hash;
                    }
                    return query(args);
                } catch (error) {
                    throw error;
                }
            }
        }
    }
});