const multer = require('multer');
const path = require('path');
const fs = require("fs");


const uploadDir = path.join(__dirname, "..", "uploads")
if(!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`uploads folder created at : ${uploadDir}`)
}

const storage = multer.memoryStorage();

const upload = multer ({ storage });

module.exports = upload;