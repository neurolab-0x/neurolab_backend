import mongoose from 'mongoose';

const deviceMetadataSchema = new mongoose.Schema({
  deviceName : { type : String, required : true },
  deviceModel : { type : String, required : true },
  deviceSerialNumber : { type : String, required : true },
  deviceFirmwareVersion : { type : String, required : true },
  deviceManufacturer : { type : String, required : true },
  deviceBatteryLevel : { type : Number, required : true },
  deviceStatus : { type : String, required : true },
}, { timestamps : true });

const DeviceMetadata = mongoose.model('deviceMetadata', deviceMetadataSchema);

export default DeviceMetadata;