import mongoose from "mongoose";

const partnershipRequestSchema = new mongoose.Schema({
  companyName : { type: String, required: true },
  companyEmail : { type: String, required: true },
  companyWebsite : { type: String, required: true },
  companyPhone : { type: Number, required: true },
  companyDescription : { type: String, required: true },
  businessType : { type: String, required: true },
  message : { type: String, required: true }
}, { timestamps: true });

const PartnershipRequest = mongoose.model('PartnershipRequest', partnershipRequestSchema);

export default PartnershipRequest;




