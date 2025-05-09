import models from '../models/reviews.model.js';
import User from '../models/user.model.js';

const { Contact, PartnershipRequest } = models;

export const contactUs = async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    const review = new Contact({ name, email, subject, message });
    await review.save();
    return res.status(200).json({ message : "Contact request sent successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message : "Internal Server error" })
  }
}

export const requestPartnership = async (req, res) => {
  const { companyName, representative, representativeEmail, companyWebsite, businessType, message } = req.body;
  try {
    const review = new PartnershipRequest({ companyName, representative, representativeEmail, companyWebsite, businessType, message });
    await review.save();
    return res.status(200).json({ message : "Partnership request sent successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message : "Internal Server error" })
  }
};

export const getContacts = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findById(id);
    if(!user){
      return res.status(404).json({ message : "User not found" });
    }
    const contacts = await Contact.find();
    if(!contacts){
      return res.status(404).json({ message : "No contacts found" });
    };
    return res.status(200).json({ contacts });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message : "Internal Server error" });
  }
};

export const getPartnershipRequests = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findById(id);
    if(!user){
      return res.status(404).json({ message : "User not found" });
    };
    const requests = await PartnershipRequest.find();
    if(!requests){
      return res.status(404).json({ message : "No partnership requests found" });
    };
    return res.status(200).json({ requests });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message : "Internal Server error" });
  }
}