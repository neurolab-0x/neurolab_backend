import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export const getCart = async (req, res) => {
  const { id } = req.user;
  try {
    const cart = await Cart.findOne({ user: id });
    if (!cart) {
      return res.status(404).json({ message: "No cart found" });
    }
    return res.status(200).json({ cart });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
}

export const addProductToCart = async (req, res) => {
  const { id } = req.user;
  const productId = req.params.productId;
  try {
    const cart = await Cart.findOne({ user: id });
    if (!cart) {
      return res.status(404).json({ message: "No cart found" });
    };
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "No product found" });
    };
    const productInCart = cart.products.find((product) => product.product._id.toString() === productId);
    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }
    return res.status(200).json({ message: "Product added to cart successfully", cart })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
}

export const removeProductFromCart = async (req, res) => {
  const { id } = req.user;
  const productId = req.params.productId;
  try {
    const cart = await Cart.findOne({ user: id });
    if (!cart) {
      return res.status(404).json({ message: "No cart found" });
    }
    const productInCart = cart.products.find((product) => product._id.toString() === productId);
    if(productInCart){
      cart.products = cart.products.filter((product) => product._id.toString() !== productId);
      await cart.save();
    }
    return res.status(200).json({ message : "Product removed from cart successfully", cart });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
}

export const clearCart = async (req, res) => {
  const { id } = req.user;
  try {
    const cart = await Cart.findOne({ user: id });
    if (!cart) {
      return res.status(404).json({ message: "No cart found" });
    }
    cart.products = [];
    await cart.save();
    return res.status(200).json({ message: "Cart cleared successfully", cart });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
}