import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

// Register a new buyer
const registerBuyer = asyncHandler(async (req, res) => {
    try {
        await getPool();
        const { name, email, password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const { exists } = await userExists(email);

        if (exists) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const sql = 'INSERT INTO Buyer (name, email, password, role) VALUES (?, ?, ?, ?)';
        await pool.query(sql, [name, email, hashedPassword, 'buyer']);

        res.status(201).json({ message: 'Buyer account created successfully' });
    } catch (error) {
        console.error('Error during buyer registration:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//read
const getBuyer = asyncHandler(async (req, res) => {
    try {
        await getPool();
        const { id } = req.params;

        const sql = 'SELECT * FROM Buyer WHERE id = ?';
        const [buyer] = await pool.query(sql, [id]);

        if (!buyer.length) {
            return res.status(404).json({ error: 'Buyer not found' });
        }

        res.status(200).json(buyer[0]);
    } catch (error) {
        console.error('Error retrieving buyer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// update
const updateBuyer = asyncHandler(async (req, res) => {
    try {
        await getPool();
        const { id } = req.params;
        const { name, email, password } = req.body;

        let sql = 'UPDATE Buyer SET name = ?, email = ?';
        const values = [name, email];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            sql += ', password = ?';
            values.push(hashedPassword);
        }

        sql += ' WHERE id = ?';
        values.push(id);

        await pool.query(sql, values);

        res.status(200).json({ message: 'Buyer updated successfully' });
    } catch (error) {
        console.error('Error updating buyer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//delete
const deleteBuyer = asyncHandler(async (req, res) => {
    try {
        await getPool();
        const { id } = req.params;

        const sql = 'DELETE FROM Buyer WHERE id = ?';
        await pool.query(sql, [id]);

        res.status(200).json({ message: 'Buyer deleted successfully' });
    } catch (error) {
        console.error('Error deleting buyer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Export controller functions
export { registerBuyer, updateBuyer,getBuyer,deleteBuyer };
