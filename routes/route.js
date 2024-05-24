import express from 'express';
import { registerUser, userLogin, home, registerSeller } from './../controllers/userControllers.js'; // Adjust the path as needed
import validateToken from '../middleware/validation.js';

// Create an Express app
const app = express();
const router = express.Router();

router.post('/register/user', registerUser);
router.post('/login', userLogin);
router.get('/home', home);
router.post('/register/seller', registerSeller); // Changed to GET for accessing the home route
router.get('/example', (req, res) => {
    res.send('This is an example route');
});

export default router;