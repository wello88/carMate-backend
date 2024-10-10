import jwt from "jsonwebtoken"

export const genrateToken =  ({ payload={} ,secretKey = process.env.JWT_SECRET_KEY, expiresIn='100d' })=>{
return jwt.sign(payload,secretKey,{expiresIn})
}


export const verifyToken = ({token="",secretKey= process.env.JWT_SECRET_KEY})=>{

   return jwt.verify(token,secretKey)

}



