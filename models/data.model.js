import mongoose from 'mongoose';

const dataSchema = new mongoose.Schema({
  user : { type : mongoose.Schema.Types.ObjectId, ref : 'users' },
  data : { type : mongoose.Schema.Types.ObjectId, ref : 'eegData' },
  metadata : { type : mongoose.Schema.Types.ObjectId, ref : 'metadata' }
}, { timestamps : true });

const Data = mongoose.model('data', dataSchema);

export default Data;