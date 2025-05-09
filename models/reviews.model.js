import mongoose from "mongoose";

const contactUsSchema = new mongoose.Schema({
  name : { type : String, required : true },
  email : { type : String, required : true },
  subject : { type : String },
  message : { type : String, required : true }
}, { timestamps : true })

const partnershipRequestSchema = new mongoose.Schema({
  companyName : { type : String, required : true },
  representative : { type : String, required : true },
  representativeEmail : { type : String, required : true },
  companyWebsite : { type : String },
  businessType : { type : String, required : true },
  message : { type : String, required : true }
});

const Contact = mongoose.model('contacts', contactUsSchema);
const PartnershipRequest = mongoose.model('partnership_requests', partnershipRequestSchema);

export default { Contact, PartnershipRequest };