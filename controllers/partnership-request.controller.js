import PartnershipRequest from "../models/partnership-request.model.js";

export const requestPartnership = async (req, res) => {
  const { companyName, companyEmail, companyWebsite, companyPhone, companyDescription, businessType, message } = req.body;
  try{
    const partnershipRequest = await PartnershipRequest.create({ companyName, companyEmail, companyWebsite, companyPhone, companyDescription, businessType, message });
    return res.status(201).json({
      success : true,
      message : "Partnership request created successfully",
      partnershipRequest
    });
  }catch(error){
    return res.status(500).json({
      success : false,
      message : "Internal server error",
      error : error.message
    });
  }
}

export const getAllPartnershipRequests = async (req, res) => {
  try{
    const partnershipRequests = await PartnershipRequest.find();
    return res.status(200).json({
      success : true,
      message : "Partnership requests fetched successfully",
      partnershipRequests
    });
  }catch(error){
    return res.status(500).json({
      success : false,
      message : "Internal server error",
      error : error.message
    });
  }
}

export const getPartnershipRequestById = async (req, res) => {
  const { id } = req.params;
  try{
    const partnershipRequest = await PartnershipRequest.findById(id);
    return res.status(200).json({
      success : true,
      message : "Partnership request fetched successfully",
      partnershipRequest
    });
  }catch(error){
    return res.status(500).json({
      success : false,
      message : "Internal server error",
      error : error.message
    });
  }
}