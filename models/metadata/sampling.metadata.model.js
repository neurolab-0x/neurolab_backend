import mongoose from 'mongoose';

const samplingDataSchema = new mongoose.Schema({
  samplingRate : { type : Number, required : true },
  samplingStartTime : { type : Date, required : true },
  samplingEndTime : { type : Date, required : true },
  samplingDuration : { type : Number, required : true }
}, { timestamps : true });

const samplingData = mongoose.model('samplingData', samplingDataSchema);

export default samplingData;