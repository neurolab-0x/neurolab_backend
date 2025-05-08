import Product from "../models/product.model.js";

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

export const getAllProducts = async (req, res) => {
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
  const { name, description, price, specifications } = req.body;
}