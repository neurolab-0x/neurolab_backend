import mongoose from "mongoose";

const productMetadataSchema = new mongoose.Schema({
  category : { type : String, required : true },
  brand : { type : String, required : true },
  frequency : { type : Number },
  power : { type : Number },
  connectionType : { type : String, enum : ["USB Cable", "Bluetooth", "Wi-Fi"] },
  batteryLife : { type : Number }
});

const ProductMetadata = mongoose.model("product_metadata", productMetadataSchema);

export default ProductMetadata;