import multer from "multer";

const fileValidation = {
    image:['image/jpg','image/jpeg','image/png'],
    file:['application/pdf','application/msword'],
    video:['video/mp4']
}

export const cloudupload = ({allowFile = fileValidation.image}={}) => {
    const storage = multer.memoryStorage(); // Use memory storage for buffers
    
    const fileFilter = (req, file, cb) => {
        if(allowFile.includes(file.mimetype)) return cb(null, true)
        cb(new Error("Invalid file type"), false)
    }
    
    return multer({storage, fileFilter, limits: {fileSize: 50 * 1024 * 1024}}) // 50MB limit
}