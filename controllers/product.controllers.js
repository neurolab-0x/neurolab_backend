import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findOne({ _id : productId });
    if(!product){
      return res.status(404).json({ message : "No product found" });
    };
    return res.status(200).json({ product });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const getAllProducts = async (res) => {
  try {
    const products = await Product.find();
    if(!products){
      return res.status(404).json({ message : "No products found" });
    };
    return res.status(200).json({ products });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
}

export const createProduct = async (req, res) => {
  const { id } = req.user;
  const { name, description, price, specifications } = req.body;
  try {
    const user = await User.findById(id);
    if(!user){
      return res.status(404).json({ message : "User not found" });
    };
    const product = new Product({ name, description, price, specifications, user: id });
    await product.save();
    return res.status(200).json({ message : "Product created successfully", product });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message : "Internal Server error" });
  }
}

export const updateProduct = async (req, res) => {
  const { id } = req.user;
  const { productId } = req.params;
  const { name, description, price, specifications } = req.body;
  try {
    const user = await User.findById(id);
    if(!user){
      return res.status(404).json({ message : "User not found" });
    };
    const product = await Product.findById(productId);
    if(!product){
      return res.status(404).json({ message : "Product not found" });
    }
    if(product.user.toString() !== id){
      return res.status(403).json({ message : "You are not allowed to update this product" });
    };
    product.name = name ? name : product.name;
    product.description = description ? description : product.description;
    product.price = price ? price : product.price;
    product.specifications = specifications ? specifications : product.specifications;
    await product.save();
    return res.status(200).json({ message : "Product updated successfully", product });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message : "Internal Server error" });
  }
}

export const deleteProduct = async (req, res) => {
  const { id } = req.user;
  const { productId } = req.params;

  try {
    const user = await User.findById(id);
    if(!user){
      return res.status(404).json({ message : "User not found" });
    };
    const product = await Product.findById(productId);
    if(!product){
      return res.status(404).json({ message : "Product not found" });
    };
    await Product.findByIdAndDelete(productId);
    return res.status(200).json({ message : "Product deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message : "Internal Server error" });
  }
}