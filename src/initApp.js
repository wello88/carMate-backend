import path from "path"
import dotenv from 'dotenv'
import { connectDB } from "../db/connection.js"
import { globalErrorHandler } from "./utils/appError.js"
import * as allRouters from './index.js'
import { User } from "../db/index.js"
import { verifyToken } from "./utils/token.js"

dotenv.config({ path: path.resolve('./config/.env') })


export const initApp =  (app,express) => {
    // app.post('/webhook',
    //     express.raw({ type: 'application/json' }),
    //     webhook
    //   );
    // app.use('/uploads', express.static('uploads'))
    app.use(express.json())
    const port = process.env.PORT || 3000
    app.get("/", (req, res) => res.send("Hello World!"))
    app.listen(port, () => console.log(`app listening on port ${port}!`))
    app.get('/verify/:token', async (req, res) => {
        try {
            const payload = verifyToken({ token: req.params.token });
    
            await User.update(
                { status: 'verified' }, 
                { where: { email: payload.email } }
            );
    
            res.status(200).json({ 
                message: 'Email verified successfully', 
                success: true 
            });
        } catch (err) {
            res.status(401).json({ 
                message: 'Verification failed', 
                success: false 
            });
        }
    });
    app.use('/auth', allRouters.authRouter)
    app.use(globalErrorHandler)
}   