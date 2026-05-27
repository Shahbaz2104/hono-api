import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger' // 1. Import logger
import { cors } from 'hono/cors'     // 2. Import CORS
import authorRoutes from './routes/author.ts'

const app = new Hono()

// Plug them in globally
app.use('*', logger())
app.use('*', cors())

app.route('/author', authorRoutes)

app.get('/', (c) => c.text('Welcome to the Hono API!'))

serve({ fetch: app.fetch, port: 3000 })