import express from 'express';
import cors from 'cors';
import { userLogin, home } from './../controllers/userControllers.js'; // Adjust the path as needed
import { registerBuyer, updateBuyer, getBuyer, deleteBuyer } from './../controllers/buyerControllers.js'; // Adjust the path as needed
import { registerSeller, getSeller, updateSeller, deleteSeller } from './../controllers/sellerControllers.js'; // Adjust the path as needed
import validateToken from '../middleware/validation.js';
import upload from '../middleware/multer.js';

// Create an Express app
const app = express();
const router = express.Router();
app.use(cors());

router.post('/login', userLogin);
router.get('/home', home);

//buyer routes
router.post('/register/buyer', registerBuyer);
router.get('/buyer/read/:id', getBuyer);
router.put('/buyer/update/:id', updateBuyer);
router.delete('/buyer/delete/:id', deleteBuyer);


// seller routes
router.post('/register/seller', upload.single('image'), registerSeller); // Changed to GET for accessing the home route
router.put('/seller/update/:id', updateSeller);
router.get('/seller/read/:id', getSeller);
router.delete('/seller/delete/:id', deleteSeller);

router.get('/example', (req, res) => {
    res.send('This is an example route');
});

export default router;