import { Elysia } from 'elysia'

const port = process.env.API_SERVER_PORT || 7002

const app = new Elysia().get('/', () => 'Hello Elysia').listen(port)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
