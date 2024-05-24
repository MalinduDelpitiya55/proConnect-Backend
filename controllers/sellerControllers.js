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

// Register a new seller
const registerSeller = asyncHandler(async (req, res) => {
    try {
        await getPool();
        const {
            fname, lname, uname, email, phoneNumber, dob, gender, password, country, timezone, description, skills,
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const { exists } = await userExists(email);

        if (exists) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const sql = `INSERT INTO Sellers 
        (fname, lname, uname, email, phoneNumber, dob, gender, password, country, timezone, description, skills) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await pool.query(sql, [fname, lname, uname, email, phoneNumber, dob, gender, hashedPassword, country, timezone, description, JSON.stringify(skills)]);

        res.status(201).json({ message: 'Seller registered successfully' });
    } catch (error) {
        console.error('Error registering seller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//read
const getSeller = asyncHandler(async (req, res) => {
    try {
        await getPool();
        const { id } = req.params;

        const sql = `SELECT * FROM Sellers WHERE id = ?`;
        const [seller] = await pool.query(sql, [id]);

        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        res.status(200).json(seller);
    } catch (error) {
        console.error('Error retrieving seller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//update

const updateSeller = asyncHandler(async (req, res) => {
    try {
        await getPool();
        const {
            fname, lname, uname, email, phoneNumber, dob, gender, country, timezone, description, skills,
        } = req.body;
        const { id } = req.params;

        const sql = `UPDATE Sellers SET 
        fname = ?, lname = ?, uname = ?, email = ?, phoneNumber = ?, dob = ?, gender = ?, country = ?, timezone = ?, description = ?, skills = ? 
        WHERE id = ?`;
        await pool.query(sql, [fname, lname, uname, email, phoneNumber, dob, gender, country, timezone, description, JSON.stringify(skills), id]);

        res.status(200).json({ message: 'Seller updated successfully' });
    } catch (error) {
        console.error('Error updating seller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//delete

const deleteSeller = asyncHandler(async (req, res) => {
    try {
        await getPool();
        const { id } = req.params;

        const sql = `DELETE FROM Sellers WHERE id = ?`;
        await pool.query(sql, [id]);

        res.status(200).json({ message: 'Seller deleted successfully' });
    } catch (error) {
        console.error('Error deleting seller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




// Export controller functions
export {  registerSeller, getSeller, updateSeller, deleteSeller};
