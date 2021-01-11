import { verify } from 'jsonwebtoken';

export default (req, res, next) => {
    const token = req.cookies['token'];
    if (!token) return res.sendStatus(401);
    verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user
        next()
    })
}