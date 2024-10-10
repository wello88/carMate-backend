import fs from "fs"
import path from "path"
export const deleteFile = (filepath)=>{
    let fullpath = path.resolve(filepath)
    fs.unlinkSync(fullpath)
}