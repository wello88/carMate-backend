//import modules

import multer,{diskStorage} from "multer";

const fileValidation = {
    image:['image/jpg','image/jpeg','image/png'],
    file:['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    video:['video/mp4']
}

export const cloudupload = ({allowFile = fileValidation.image}={})=>{
  const storage =   diskStorage({
        
    })
    const fileFilter = (req,file,cb)=>{
        if(allowFile.includes(file.mimetype)){
            return cb(null,true)
        }
        return cb(new Error("file not allowed"),false)
    }
    return multer({storage,fileFilter})
}