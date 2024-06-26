import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt, { decode } from 'jsonwebtoken';
import connectDB from '../configs/dbconfig.js';

let pool;
const maxRetries = 5;
let retries = 0;

const initializePool = async () => {
    try {
        if (!pool) {
            pool = await connectDB();
        }
        console.log('Database connected.');
        retries = 0; // Reset retries on successful connection
        return pool;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        if (retries < maxRetries) {
            retries++;
            console.log(`Retrying connection (${retries}/${maxRetries})...`);
            return initializePool();
        } else {
            console.error('Max retries reached. Exiting...');
            process.exit(1);
        }
    }
};

const getPool = async () => {
    if (!pool) {
        pool = await initializePool();
    }
    return pool;
};

// Utility function to check if a user exists in either Buyers or Sellers table
const userExists = async (email) => {
    const pool = await getPool();
    const [buyerExists] = await pool.query('SELECT * FROM Buyer WHERE email = ?', [email]);
    if (buyerExists.length > 0) {
        return { exists: true, role: 'buyer' };
    }
    const [sellerExists] = await pool.query('SELECT * FROM Sellers WHERE email = ?', [email]);
    if (sellerExists.length > 0) {
        return { exists: true, role: 'seller' };
    }
    return { exists: false };
};

// Login user or seller
const userLogin = asyncHandler(async (req, res) => {
    try {
        await getPool();
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const sql = `
            SELECT id, name AS firstname, email, password, 'buyer' AS role FROM Buyer WHERE email = ?
            UNION
            SELECT id, fname AS firstname, email, password, 'seller' AS role FROM Sellers WHERE email = ?`;

        const [users] = await pool.query(sql, [email, email]);

        if (!users.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        if (await bcrypt.compare(password, user.password)) {
            const accessToken = jwt.sign({
                user: {
                    firstname: user.firstname,
                    email: user.email,
                    id: user.id,
                    role: user.role,
                }
            }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '100s' });
            console.log(jwt.decode(accessToken, { complete: true }));
            return res.status(200).json({
                status: 'success',
                message: 'Logged in successfully',
                accessToken,
                user: {
                    firstname: user.firstname,
                    email: user.email,
                    _id: user.id,
                    role: user.role,
                }
               
            });
        } else {
            return res.status(401).json({ error: "Email or password is not valid" });
        }
        
    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Protected resource accessible after login
const home = async (req, res) => {
    console.log('User accessed protected resource:', req.user); // User data from decoded token
    res.json({ message: 'Welcome, authorized user!' });
};

// Export controller functions
export { userLogin, home };