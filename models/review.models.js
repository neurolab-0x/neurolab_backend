import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  email : { type: String, required: true },
  name : { type: String, required: true },
  subject : { type : String , required : true },
  message : { type : String, required : true }
}, { timestamps : true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;


