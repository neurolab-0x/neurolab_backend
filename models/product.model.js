import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  userId : { type : mongoose.Schema.Types.ObjectId, ref : 'users', index : true },
  categoryId : [{ type : mongoose.Schema.Types.ObjectId, ref : 'categories', index : true }],
  images : [{ type : String, required : true }],
  name : { type : String, required : true, index : true },
  description : { type : String, required : true },
  price : { type : Number, required : true, index : true },
  specications : { type : mongoose.Schema.Types.ObjectId, ref : 'product_metadata' }
}, { timestamps : true });

const Product = new mongoose.model('products', productSchema);

export default Product;