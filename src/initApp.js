import path from "path"
import dotenv from 'dotenv'
import { connectDB } from "../db/connection.js"
import { globalErrorHandler } from "./utils/appError.js"
import * as allRouters from './index.js'
import { User } from "../db/index.js"
import { verifyToken } from "./utils/token.js"
import { verificationSuccessTemplate } from "./utils/htmlTemplate.js"

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
    // app.get('/verify/:token', async (req, res) => {
    //     try {
    //         const payload = verifyToken({ token: req.params.token });
    
    //         await User.update(
    //             { status: 'verified' }, 
    //             { where: { email: payload.email } }
    //         );
    
    //         res.status(200).json({ 
    //             message: 'Email verified successfully', 
    //             success: true 
    //         });
    //     } catch (err) {
    //         res.status(401).json({ 
    //             message: 'Verification failed', 
    //             success: false 
    //         });
    //     }
    // });



    app.get('/verify/:token', async (req, res) => {
        try {
            const payload = verifyToken({ token: req.params.token });
    
            await User.update(
                { status: 'verified' }, 
                { where: { email: payload.email } }
            );
    
            // Send the HTML verification success page instead of JSON
            res.status(200).send(verificationSuccessTemplate());
        } catch (err) {
            // Send an HTML error page for failed verification
            res.status(401).send(`
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta http-equiv="x-ua-compatible" content="ie=edge">
                  <title>Verification Failed</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style type="text/css">
                    @font-face {
                      font-family: 'Source Sans Pro';
                      font-style: normal;
                      font-weight: 400;
                      src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
                    }
                    @font-face {
                      font-family: 'Source Sans Pro';
                      font-style: normal;
                      font-weight: 700;
                      src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
                    }
                    
                    body {
                      font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
                      background-color: #000000;
                      margin: 0;
                      padding: 0;
                      color: #ffffff;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      min-height: 100vh;
                    }
                    
                    .container {
                      max-width: 600px;
                      width: 100%;
                      margin: 0 auto;
                    }
                    
                    .card {
                      background-color: #1a1a1a;
                      border-radius: 8px;
                      border-top: 3px solid #c41e3a;
                      border-bottom: 3px solid #c41e3a;
                      overflow: hidden;
                      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                    }
                    
                    .card-header {
                      padding: 36px 24px 0;
                      text-align: center;
                    }
                    
                    .logo {
                      width: 60px;
                      height: 60px;
                      margin-bottom: 24px;
                    }
                    
                    h1 {
                      margin: 0;
                      font-size: 32px;
                      font-weight: 700;
                      letter-spacing: -1px;
                      line-height: 48px;
                      color: #ffffff;
                      margin-bottom: 12px;
                    }
                    
                    .card-body {
                      padding: 24px;
                      font-size: 16px;
                      line-height: 24px;
                      text-align: center;
                    }
                    
                    .error-icon {
                      display: block;
                      width: 90px;
                      height: 90px;
                      margin: 0 auto 24px;
                      border-radius: 50%;
                      background-color: #c41e3a;
                      position: relative;
                    }
                    
                    .error-icon:before,
                    .error-icon:after {
                      content: '';
                      position: absolute;
                      width: 40px;
                      height: 4px;
                      background-color: #fff;
                      top: 50%;
                      left: 50%;
                      margin-top: -2px;
                      margin-left: -20px;
                    }
                    
                    .error-icon:before {
                      transform: rotate(45deg);
                    }
                    
                    .error-icon:after {
                      transform: rotate(-45deg);
                    }
                    
                    .button {
                      display: inline-block;
                      padding: 16px 36px;
                      font-size: 16px;
                      color: #ffffff;
                      text-decoration: none;
                      background-color: #c41e3a;
                      border-radius: 6px;
                      margin-top: 24px;
                      transition: background-color 0.3s ease;
                    }
                    
                    .button:hover {
                      background-color: #a31b31;
                    }
                    
                    .card-footer {
                      padding: 24px;
                      font-size: 14px;
                      line-height: 20px;
                      color: #777;
                      text-align: center;
                      background-color: #000000;
                    }
                    
                    @media screen and (max-width: 600px) {
                      .container {
                        width: 90%;
                      }
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="card">
                      <div class="card-header">
                        <img src="https://drive.google.com/uc?id=1Rb4DcjXtkUXWAS65e3JBhDB6AqSmTEqc" alt="Logo" class="logo">
                        <h1>Verification Failed</h1>
                      </div>
                      <div class="card-body">
                        <div class="error-icon"></div>
                        <p>We couldn't verify your email address. The verification link may have expired or is invalid.</p>
                        <a href="https://fb-m90x.onrender.com/login" class="button">Return to Login</a>
                      </div>
                    </div>
                    <div class="card-footer">
                      <p>If you continue to experience issues, please contact our support team.</p>
                    </div>
                  </div>
                </body>
                </html>
            `);
        }
    });



    app.use('/auth', allRouters.authRouter)
    app.use('/user', allRouters.userRouter)
    app.use('/workers', allRouters.workerRouter)
    app.use('/admin', allRouters.adminRouter)
    app.use('/seller', allRouters.sellerRouter)
    app.use('/superAdmin', allRouters.superAdminRouter)
    app.use('/community', allRouters.communityRouter)
    app.use('/winch', allRouters.winchRouter)
    app.use('/post', allRouters.postRouter)
    app.use('/offer', allRouters.offerRouter)
    app.use('/notification', allRouters.notificationRouter)
    app.use('/comment', allRouters.commentRouter)
    app.use('/session', allRouters.sessionRouter)
    app.use('/', allRouters.contactUsRouter)
    app.use('/cron', allRouters.cronRouter)
    app.use(globalErrorHandler)
}   