import { customAlphabet } from "nanoid"

const ITEMS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
export const genId = customAlphabet(ITEMS, 10)
