import bcrypt from 'bcrypt'

export const hashPassword = ({ password = '', saltRound = 8 }) => {
    return bcrypt.hashSync(password, saltRound)
}


// Compare Password asynchronously
export const comparePassword =  ({ password = '', hashPassword = '' }) => {
    return bcrypt.compareSync(password, hashPassword);
}