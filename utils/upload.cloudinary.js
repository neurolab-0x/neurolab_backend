import cloudinary from "../config/cloudinary.config.js";

export const uploadProfilePicture = async (fileBuffer, fileMimetype) => {
  try {
    const dataUrl = `data:${fileMimetype};base64,${fileBuffer}`;
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder : "profile_pictures",
      resource_type : "image"
    })
    return result.secure_url;
  } catch (error) {
    console.log(error.message);
    return error;
  }
}