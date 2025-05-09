import mongoose from 'mongoose';

const activitySchema = mongoose.Schema({
  type : { type : String, enum : ["SESSION_COMPLETION", "ACCOUNT_CREATION", "USER_DELETION", "PARTNERSHIP_REQUEST"], required : true },
  message : { type : String, required : true },
  user : { type : mongoose.Schema.Types.ObjectId, ref : 'user' }
}, { timestamps : true });

const Activity = mongoose.model("activities", activitySchema);

export default Activity;