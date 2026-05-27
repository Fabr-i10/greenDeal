import { GraphQLError } from "graphql"
import { buildToken } from "./auth.js"
import { createUser, getUser } from "./services/userservice.js"
import {
    createProvider,
    deleteProvider,
    getProvider,
    getProviders,
    updateProvider,
} from "./services/providerservice.js"
import {
    createTour,
    deleteTour,
    getTour,
    getTours,
    updateTour,
} from "./services/tourservice.js"
import {
    createSale,
    deleteSale,
    getSale,
    getSales,
} from "./services/salesservice.js"
import { getMonthlyReport, getDateRangeReport } from "./services/reportservice.js"

function requireAuth(context) {
    if (!context.user) {
        throw new GraphQLError("No autorizado", {
            extensions: { code: "UNAUTHORIZED" },
        })
    }
    return context.user.sub
}

function handleTourError(err) {
    if (err.message === "PROVIDER_NOT_FOUND") {
        throw new GraphQLError("Proveedor no existe", {
            extensions: { code: "BAD_USER_INPUT" },
        })
    }
    throw err
}

function handleSaleError(err) {
    if (err.message === "TOUR_NOT_FOUND") {
        throw new GraphQLError("Tour no existe", {
            extensions: { code: "BAD_USER_INPUT" },
        })
    }
    if (err.message === "INVALID_QUANTITY") {
        throw new GraphQLError("La cantidad de personas debe ser mayor a cero", {
            extensions: { code: "BAD_USER_INPUT" },
        })
    }
    throw err
}

export const resolvers = {
    Query: {
        me: async (_root, _args, context) => {
            requireAuth(context)
            const user = await getUser(context.user.sub)
            if (!user) {
                throw new GraphQLError("Usuario no existe", {
                    extensions: { code: "NOT_FOUND" },
                })
            }
            return user
        },
        provider: async (_root, { id }, context) => {
            const userId = requireAuth(context)
            const provider = await getProvider(id, userId)
            if (!provider) {
                throw new GraphQLError("Proveedor no existe", {
                    extensions: { code: "NOT_FOUND" },
                })
            }
            return provider
        },
        providers: async (_root, _args, context) => {
            const userId = requireAuth(context)
            const data = await getProviders(userId)
            return { data }
        },
        tour: async (_root, { id }, context) => {
            const userId = requireAuth(context)
            const tour = await getTour(id, userId)
            if (!tour) {
                throw new GraphQLError("Tour no existe", {
                    extensions: { code: "NOT_FOUND" },
                })
            }
            return tour
        },
        tours: async (_root, _args, context) => {
            const userId = requireAuth(context)
            const data = await getTours(userId)
            return { data }
        },
        sale: async (_root, { id }, context) => {
            const userId = requireAuth(context)
            const sale = await getSale(id, userId)
            if (!sale) {
                throw new GraphQLError("Venta no existe", {
                    extensions: { code: "NOT_FOUND" },
                })
            }
            return sale
        },
        sales: async (_root, _args, context) => {
            const userId = requireAuth(context)
            const data = await getSales(userId)
            return { data }
        },
        monthlyReport: async (_root, { year, month }, context) => {
            const userId = requireAuth(context)

            if (month < 1 || month > 12) {
                throw new GraphQLError("El mes debe estar entre 1 y 12", {
                    extensions: { code: "BAD_USER_INPUT" },
                })
            }

            return await getMonthlyReport(userId, year, month)
        },
        dateRangeReport: async (_root, { startDate, endDate }, context) => {
            const userId = requireAuth(context)

            if (!startDate || !endDate) {
                throw new GraphQLError("Debes indicar fecha de inicio y fin", {
                    extensions: { code: "BAD_USER_INPUT" },
                })
            }

            if (startDate > endDate) {
                throw new GraphQLError("La fecha de inicio no puede ser posterior a la fecha fin", {
                    extensions: { code: "BAD_USER_INPUT" },
                })
            }

            return await getDateRangeReport(userId, startDate, endDate)
        },
    },
    Tour: {
        provider: async (tour, _args, context) => {
            const userId = requireAuth(context)
            const provider = await getProvider(tour.providerId, userId)
            if (!provider) {
                throw new GraphQLError("Proveedor no existe", {
                    extensions: { code: "NOT_FOUND" },
                })
            }
            return provider
        },
    },
    Sale: {
        tour: async (sale, _args, context) => {
            const userId = requireAuth(context)
            const tour = await getTour(sale.tourId, userId)
            if (!tour) {
                throw new GraphQLError("Tour no existe", {
                    extensions: { code: "NOT_FOUND" },
                })
            }
            return tour
        },
    },
    Mutation: {
        register: async (_root, { input }) => {
            try {
                const user = await createUser(input)
                const token = buildToken(user)
                return { token, user }
            } catch (err) {
                if (err.message === "EMAIL_EXISTS") {
                    throw new GraphQLError("El correo ya está registrado", {
                        extensions: { code: "BAD_USER_INPUT" },
                    })
                }
                throw err
            }
        },
        createProvider: async (_root, { input }, context) => {
            const userId = requireAuth(context)
            return await createProvider({ userId, ...input })
        },
        updateProvider: async (_root, { id, input }, context) => {
            const userId = requireAuth(context)
            const provider = await updateProvider(id, userId, input)
            if (!provider) {
                throw new GraphQLError("Proveedor no existe", {
                    extensions: { code: "NOT_FOUND" },
                })
            }
            return provider
        },
        deleteProvider: async (_root, { id }, context) => {
            const userId = requireAuth(context)
            const deleted = await deleteProvider(id, userId)
            if (!deleted) {
                throw new GraphQLError("Proveedor no existe", {
                    extensions: { code: "NOT_FOUND" },
                })
            }
            return true
        },
        createTour: async (_root, { input }, context) => {
            const userId = requireAuth(context)
            try {
                return await createTour({ userId, ...input })
            } catch (err) {
                handleTourError(err)
            }
        },
        updateTour: async (_root, { id, input }, context) => {
            const userId = requireAuth(context)
            try {
                const tour = await updateTour(id, userId, input)
                if (!tour) {
                    throw new GraphQLError("Tour no existe", {
                        extensions: { code: "NOT_FOUND" },
                    })
                }
                return tour
            } catch (err) {
                if (err.extensions?.code) throw err
                handleTourError(err)
            }
        },
        deleteTour: async (_root, { id }, context) => {
            const userId = requireAuth(context)
            const deleted = await deleteTour(id, userId)
            if (!deleted) {
                throw new GraphQLError("Tour no existe", {
                    extensions: { code: "NOT_FOUND" },
                })
            }
            return true
        },
        createSale: async (_root, { input }, context) => {
            const userId = requireAuth(context)
            try {
                return await createSale({ userId, ...input })
            } catch (err) {
                handleSaleError(err)
            }
        },
        deleteSale: async (_root, { id }, context) => {
            const userId = requireAuth(context)
            const deleted = await deleteSale(id, userId)
            if (!deleted) {
                throw new GraphQLError("Venta no existe", {
                    extensions: { code: "NOT_FOUND" },
                })
            }
            return true
        },
    },
}
