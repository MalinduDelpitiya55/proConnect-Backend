import express from 'express';
import dotenv from 'dotenv';
import connectDB from './configs/dbconfig.js';
import routes from './routes/route.js';
import cors from "cors"
import bodyParser from 'body-parser';
// Load environment variables from .env file
dotenv.config();



// Create an Express app
const app = express();


// Increase the body size limit for JSON requests
app.use(bodyParser.json({ limit: '50mb' })); // You can adjust the size as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


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

