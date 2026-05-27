import { connection } from "../services/connection.js"

const { schema } = connection

await schema.dropTableIfExists("sales")
await schema.dropTableIfExists("tours")
await schema.dropTableIfExists("providers")
await schema.dropTableIfExists("users")

await schema.createTable("users", (table) => {
    table.text("id").notNullable().primary()
    table.text("fullName").notNullable()
    table.text("email").notNullable().unique()
    table.text("password").notNullable()
    table.text("phone")
    table.text("createdAt").notNullable()
})

await schema.createTable("providers", (table) => {
    table.text("id").notNullable().primary()
    table.text("userId").notNullable().references("id").inTable("users")
    table.text("companyName").notNullable()
    table.text("legalId").notNullable()
    table.text("phone").notNullable()
    table.text("email").notNullable()
    table.text("address").notNullable()
    table.text("createdAt").notNullable()
})

await schema.createTable("tours", (table) => {
    table.text("id").notNullable().primary()
    table.text("userId").notNullable().references("id").inTable("users")
    table.text("providerId").notNullable().references("id").inTable("providers")
    table.text("tourName").notNullable()
    table.text("description").notNullable()
    table.text("location").notNullable()
    table.float("pricePerPerson").notNullable()
    table.text("createdAt").notNullable()
})

await schema.createTable("sales", (table) => {
    table.text("id").notNullable().primary()
    table.text("userId").notNullable().references("id").inTable("users")
    table.text("tourId").notNullable().references("id").inTable("tours")
    table.text("saleDate").notNullable()
    table.integer("quantityPeople").notNullable()
    table.float("totalSale").notNullable()
    table.float("commissionTotal").notNullable()
    table.float("commissionWithoutVAT").notNullable()
    table.float("vatAmount").notNullable()
    table.text("createdAt").notNullable()
})

console.log("Base de datos GreenDeal inicializada correctamente.")
process.exit()
