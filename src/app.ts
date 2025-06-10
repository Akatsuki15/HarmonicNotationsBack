import express, {Response, Request} from 'express'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import morgan from 'morgan'
import authRouter from '../src/routes/auth.routes'
import scoreRouter from '../src/routes/score.routes'
import userRouter from './routes/user.routes'

const app = express()

app.use(cors({
    origin: 'http://localhost:5173', // Especificar exactamente el origen
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(cookieParser())
app.use(helmet())
app.use(compression())
app.use(morgan('tiny'))

const limiter = rateLimit({
    max: 1000,
    windowMs: 1000 * 15 * 60 //15 minutos
})

app.use(limiter)

app.use('/api/auth', authRouter)
app.use('/api/score', scoreRouter)
app.use('/api/user', userRouter)

app.get('/', (req: Request, res: Response)=>{
    res.send('Bienvenido al backend (api)')
})

export default app