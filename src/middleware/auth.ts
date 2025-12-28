import path from 'path';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const auth = (role : string) => {
    return (req : any, res : any, next : any) => {
        const token : string = req.cookies.token
        
        if (!token) {
            return res.redirect('/login')
        }

        try {
            const decoded : any = jwt.verify(token, process.env.JWT_SECRET as string)

            if (!decoded) {
                return res.redirect('/login')
            }

            if (decoded.role !== role) {
                return res.redirect('/login')
            }

            console.log(`token and role checked for ${decoded.username} and granted access to ${req.originalUrl}`)

        } catch (err) {
            console.error(`${err}`)
            return res.status(500).json({msg: 'Server side error'})
        }
        next()
    }
}