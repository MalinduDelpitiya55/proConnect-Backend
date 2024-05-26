import express from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import cloudinary from '../utils/cloudinary.js';
import upload from '../middleware/multer.js';
import connectDB from '../configs/dbconfig.js';

const router = express.Router();
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

const registerSeller = asyncHandler(async (req, res) => {
    const {
        fname, lname, uname, email, phoneNumber, dob, gender, password, country, timezone, description, skills
    } = req.body;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            transformation: [
                { gravity: "face", height: 150, width: 150, crop: "thumb" },
                { radius: 20 },
                { effect: "sepia" },
                { overlay: "cloudinary_icon" },
                { effect: "brightness:90" },
                { opacity: 60 },
                { width: 50, crop: "scale" },
                { flags: "layer_apply", gravity: "south_east", x: 5, y: 5 },
                { angle: 10 }
            ]
        });

        const ProfilePicturePublicID = result.public_id;
        const ProfilePictureURL = result.secure_url;

        const pool = await getPool();
        const hashedPassword = await bcrypt.hash(password, 10);
        const { exists } = await userExists(email);

        if (exists) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const sql = `INSERT INTO Sellers 
      (fname, lname, uname, email, phoneNumber, dob, gender, password, country, timezone, description, skills, ProfilePictureURL, ProfilePicturePublicID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await pool.query(sql, [fname, lname, uname, email, phoneNumber, dob, gender, hashedPassword, country, timezone, description, JSON.stringify(skills), ProfilePictureURL, ProfilePicturePublicID]);

        res.status(201).json({ message: 'Seller registered successfully' });
    } catch (error) {
        console.error('Error registering seller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const getSeller = asyncHandler(async (req, res) => {
    try {
        const pool = await getPool();
        const { id } = req.params;

        const sql = `SELECT * FROM Sellers WHERE id = ?`;
        const [seller] = await pool.query(sql, [id]);

        if (!seller.length) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        res.status(200).json(seller[0]);
    } catch (error) {
        console.error('Error retrieving seller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const updateSeller = asyncHandler(async (req, res) => {
    try {
        const pool = await getPool();
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

const deleteSeller = asyncHandler(async (req, res) => {
    try {
        const pool = await getPool();
        const { id } = req.params;

        const sql = `DELETE FROM Sellers WHERE id = ?`;
        await pool.query(sql, [id]);

        res.status(200).json({ message: 'Seller deleted successfully' });
    } catch (error) {
        console.error('Error deleting seller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export { registerSeller, getSeller, updateSeller, deleteSeller };
