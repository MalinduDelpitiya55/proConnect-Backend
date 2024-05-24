import asyncHandler from 'express-async-handler';
import JWT from 'jsonwebtoken';

const validateToken = asyncHandler(async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];

        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'User is not authorized' });
            }
            req.user = decoded.user;
            next();
        });
    } else {
        return res.status(401).json({ error: 'User is not authorized or token is missing' });
    }
});

export default validateToken;
