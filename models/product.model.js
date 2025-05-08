import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name : { type : String, required : true },
  description : { type : String, required : true },
  price : { type : Number, required : true },
  specications : { type : mongoose.Schema.Types.ObjectId, ref : 'product_specifications' }
}, { timestamps : true });

const Product = new mongoose.model('products', productSchema);

export default Product;