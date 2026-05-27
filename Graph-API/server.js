import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@as-integrations/express4"
import express from "express"
import cors from "cors"
import { resolvers } from "./resolvers.js"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { readFile } from "node:fs/promises"
import { createServer as createHttpServer } from "node:http"
import { authMiddleware, getToken } from "./auth.js"

const PORT = 9002
const app = express()
const httpServer = createHttpServer(app)

app.use(cors(), express.json(), authMiddleware)
app.post("/login", getToken)

const typeDefs = await readFile("./schema.graphql", "utf-8")
const graphqlSchema = makeExecutableSchema({ typeDefs, resolvers })
const graphServer = new ApolloServer({ schema: graphqlSchema })

await graphServer.start()

app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(graphServer, {
        context: async ({ req }) => {
            if (req.auth) {
                return { user: req.auth }
            }
            return {}
        },
    })
)

httpServer.listen({ port: PORT }, () => {
    console.log(`GreenDeal API corriendo en: http://localhost:${PORT}/graphql`)
})
