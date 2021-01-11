import { Router } from 'express';
import mysql from 'mysql2';
import { hash, compare } from 'bcrypt';

import generateAccessToken from '../libs/generateAccessToken';
import auth from '../middlewares/auth';

const saltRounds = 10;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: "",
    database: 'lms'
});

const login = (req, res) => {
    const { email, password } = req.body;
    connection.promise().query('SELECT * FROM users WHERE email = ?', [email]).then(([rows, fields]) => {
        if (rows.length == 0) return res.status(404).json({ message: "Email or Password is incorrect!" });
        const user = rows[0];
        compare(password, user.password, function (err, result) {
            if (err) return res.status(404).json({ message: "Email or Password is incorrect!" });
            const token = generateAccessToken({ email, id: user.id });
            return res.json({ user: { name: user.name, email, id: user.id }, token });
        });
    }).catch((error) => {
        return res.status(400).json({ message: error.message });
    });
}

const register = (req, res) => {
    const { name, email, password } = req.body;
    hash(password, saltRounds, function (err, password) {
        if (err) return res.status(400).json({ msg: "Something Error!" });
        connection.promise().query('INSERT INTO users SET ?', { name, email, password }).then(([rows, fields]) => {
            const token = generateAccessToken({ email, id: rows.insertId });
            return res.json({ user: { name, email, id: rows.insertId }, token });
        }).catch((error) => {
            return res.status(400).json({ message: error.message });
        });
    });
}

const me = (req, res) => {
    connection.promise().query('SELECT * FROM users WHERE id = ?', [req.user.id]).then(([rows, fields]) => {
        if (rows.length == 0) return res.status(404).json({ message: "Invalid credential!" });
        const user = rows[0];
        return res.json({ user: { name: user.name, email: user.email, id: user.id } });
    }).catch((error) => {
        return res.status(400).json({ message: error.message });
    });
}

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', auth, me);

export default router;