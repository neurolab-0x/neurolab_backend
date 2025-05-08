import express from 'express';
import { authenticateAdmin, authenticate } from '../middleware/auth.middleware.js';
import { getAllProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/product.controllers.js';

const product_router = express.Router();

product_router.get('/products', authenticate, getAllProducts);
product_router.get('products/:productId', authenticate, getProduct);
product_router.post('/products', authenticateAdmin, createProduct);
product_router.put('/products/:productId', authenticateAdmin, updateProduct);
product_router.delete('/products/:productId', authenticateAdmin, deleteProduct);

export default product_router;