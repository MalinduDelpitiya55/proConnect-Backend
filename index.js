import express from 'express';
import dotenv from 'dotenv';
import connectDB from './configs/dbconfig.js';
import routes from './routes/route.js';
import cors from "cors"
// Load environment variables from .env file
dotenv.config();



// Create an Express app
const app = express();

// Enable CORS for all routes
app.use(cors());
// Middleware to parse JSON requests
app.use(express.json());

// Connect to the database
connectDB()
    .then(pool => {
        console.log('Database connected.');

        // Routes
        app.use('/', routes); // Mount the router at the root path

        // Start the server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error('Failed to connect to the database:', error.message);
        process.exit(1);
    });

