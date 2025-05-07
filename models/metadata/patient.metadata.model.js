import mongoose from 'mongoose';

const medicalMetadataSchema = new mongoose.Schema({
  user : { type : mongoose.Schema.Types.ObjectId, ref : 'users' },
  age : { type : Number, required : true },
  gender : { type : String, enum : ["Male", "Female"] },
  dominantHand : { type : String, enum : ["Left", "Right", "Ambidextrous"] },
  cognitiveStatus : { type : String, required : true }
});

const MedicalMetadata = mongoose.model('medicalMetadata', medicalMetadataSchema); 

export default MedicalMetadata;