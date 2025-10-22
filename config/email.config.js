// email.config.js
const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  from: process.env.EMAIL_FROM,
  tls: {
    rejectUnauthorized: false,
    ciphers: "SSLv3",
  },
};

export default {
   emailConfig,
  appUrl: process.env.APP_URL
};
