import express from 'express';
import 'dotenv/config';
import path from 'path';
import pool from './config/db.ts';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import {auth} from './middleware/auth.ts';

const app = express();
const PORT : number = Number(process.env.PORT) || 3000
const __dirname : string = import.meta.dirname

app.use(express.static('public'));
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Home page')
})

app.get('/login', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.sendFile(path.join(__dirname, '../public/login.html'))
    }

    try {
        const decoded :any = jwt.verify(token, process.env.JWT_SECRET as string)

        if (decoded.role === 'admin') {
            return res.redirect('/admin/dashboard')
        } else {
            return res.redirect('/user/dashboard')
        }

    } catch (err) {
        res.clearCookie('token')
        return res.sendFile(path.join(__dirname, '../public/login.html'))
    }

})

app.post('/login', async (req, res) => {
    try {
        const {username, password} = req.body

        let [rows] : any= await pool.execute('SELECT * from users WHERE username = ? AND password = ?', [username, password])

        if (rows.length === 0) {
            return res.status(401).json({msg: 'wrong credentials'})
        } 

        rows = rows[0]

        const payload = {
            id: rows.id,
            username: username,
            role: rows.role
        }

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET as string,
            {expiresIn: '2h'}

        )

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7200000
        })

        return res.status(200).json({role: rows.role})

    } catch (err) {
        console.log(err)
        return res.status(500).json({msg: 'Server side error'})
    }

})

app.use('/admin', auth('admin'))

app.get('/admin/dashboard', (req, res) => {
    res.send('Admin dashboard')
})

app.use((req, res) => {
    res.status(404).send('Resource not found')
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})