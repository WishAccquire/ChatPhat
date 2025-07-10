import express, { response } from 'express'
import morgan from 'morgan';
import connect from './dB/db.js';
import userRoutes from './routes/user.routes.js'
import ProjectRoutes from './routes/project.routes.js'
import cookieParser from 'cookie-parser';
import aiRoutes from './routes/ai.routes.js';
import cors from 'cors'
connect();

const app = express();

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});

app.use(cors())
app.use(morgan('dev'))
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use("/users", userRoutes)
app.use("/project", ProjectRoutes)
app.use("/ai", aiRoutes)

app.get('/', (req, res) => {
    res.send("Chal gaya Mein");
})


export default app;
