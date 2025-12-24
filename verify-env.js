
const { loadEnvConfig } = require('@next/env')

const projectDir = process.cwd()
loadEnvConfig(projectDir)

if (process.env.AUTH_SECRET) {
    console.log("AUTH_SECRET is set (Length: " + process.env.AUTH_SECRET.length + ")")
} else {
    console.log("AUTH_SECRET is MISSING in environment!")
}

if (process.env.DATABASE_URL) {
    console.log("DATABASE_URL is set.")
} else {
    console.log("DATABASE_URL is MISSING!")
}
