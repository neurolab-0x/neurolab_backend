import Review from '../models/review.models.js';

export const createReview = async (req, res) => {
  const { email, name, subject, message } = req.body;
  try{
    const review = await Review.create({ email, name, subject, message });
    return res.status(201).json({
      success : true,
      message : "Review created successfully",
      review
    });
  }catch(error){
    return res.status(500).json({
      success : false,
      message : "Internal server error",
      error : error.message
    });
  }
};

export const getAllReviews = async (req, res) => {
  try{
    const reviews = await Review.find();
    return res.status(200).json({
      success : true,
      message : "Reviews fetched successfully",
      reviews
    });
  }catch(error){
    return res.status(500).json({
      success : false,
      message : "Internal server error",
      error : error.message
    });
  }
}

export const getReviewById = async (req, res) => {
  const { id } = req.params;
  try{
    const review = await Review.findById(id);
    return res.status(200).json({
      success : true,
      message : "Review fetched successfully",
      review
    });
  }catch(error){
    return res.status(500).json({
      success : false,
      message : "Internal server error",
      error : error.message
    });
  }
}
