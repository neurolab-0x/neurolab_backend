import mongoose from 'mongoose';
import { type } from 'os';

const metadataSchema = new mongoose.Schema({
  deviceMetadata : { type : mongoose.Schema.Types.ObjectId, ref : 'deviceMetadata' },
  samplingMetadata : { type : mongoose.Schema.Types.ObjectId, ref : 'samplingMetadata' },
  userMetadata : { type : mongoose.Schema.Types.ObjectId, ref : 'userMetadata' },
  medicalMetadata : { type : mongoose.Schema.Types.ObjectId, ref : 'medicalMetadata' }
});

const Metadata = mongoose.model('metadata', metadataSchema);

export default Metadata;