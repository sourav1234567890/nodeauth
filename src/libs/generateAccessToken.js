import { sign } from 'jsonwebtoken';

export default (payload) => {
    console.log(payload)
    return sign(payload, process.env.JWT_SECRET);
}