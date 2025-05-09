import express from 'express';
import { connectToMongoDB } from './config/db.config.js';
import dotenv from 'dotenv';
import auth_router from './routes/auth.routes.js';
import user_router from './routes/user.routes.js';
import product_router from './routes/product.routes.js';
import cart_router from './routes/cart.routes.js';
import review_router from './routes/reviews.routes.js';
import cors from 'cors';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', product_router, cart_router, review_router);
app.use('/api/auth', auth_router, user_router);


app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  connectToMongoDB();
})