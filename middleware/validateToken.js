const { verify } = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({ path: './.env'});

module.exports = {
    checkToken: (req, res, next) => {
        const secret = process.env.SECRET
        const token = req.cookies['jwt'];

        try {
            const decoded = verify(token, secret);
            req.decoded = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    }
}