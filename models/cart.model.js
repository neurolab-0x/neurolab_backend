import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId : { type : mongoose.Schema.Types.ObjectId, ref : 'users' },
  products : [{ type : mongoose.Schema.Types.ObjectId, ref : 'products' }],
  totalPrice : { type : Number, default : 0 },
  totalItems : { type : Number, default : 0 }
}, { timestamps : true });

const Cart = mongoose.model('carts', cartSchema);

export default Cart;