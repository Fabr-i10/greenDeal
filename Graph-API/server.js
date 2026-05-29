import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@as-integrations/express4"
import express from "express"
import cors from "cors"
import { resolvers } from "./resolvers.js"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { readFile } from "node:fs/promises"
import { createServer as createHttpServer } from "node:http"
import { authMiddleware, getToken, verifyToken } from "./auth.js"
import { useServer } from "graphql-ws/use/ws"
import { WebSocketServer } from "ws"

const PORT = 9002
const app = express()

app.use(cors(), express.json(), authMiddleware)
app.post("/login", getToken)

const typeDefs = await readFile("./schema.graphql", "utf-8")
const graphqlSchema = makeExecutableSchema({ typeDefs, resolvers })
const graphServer = new ApolloServer({ schema: graphqlSchema })

await graphServer.start()

/** Http Server de node */
const httpServer = createHttpServer(app)

async function getContext({ req }) {
    if (req.auth) {
        return { user: req.auth }
    }
    return {}
}

app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(graphServer, { context: getContext })
)

async function getWsContext({ connectionParams }) {
    const accessToken = connectionParams?.accessToken
    if (accessToken) {
        const payload = await verifyToken(accessToken)
        return { user: payload }
    }
    return {}
}

const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" })
useServer({ schema: graphqlSchema, context: getWsContext }, wsServer)

httpServer.listen({ port: PORT }, () => {
    console.log(`GreenDeal API corriendo en: http://localhost:${PORT}/graphql`)
})
