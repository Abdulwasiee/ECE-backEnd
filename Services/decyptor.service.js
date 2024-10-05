const CryptoJS = require("crypto-js");
require("dotenv").config();

const secretKey = process.env.CRYPTO_SECRET_KEY;

const decrypt = (cipherText) => {
  // Replace underscores back to slashes before decryption
  const formattedCipherText = cipherText.replace(/_/g, "/");

  const bytes = CryptoJS.AES.decrypt(formattedCipherText, secretKey);
  const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

  // Handle case where decryption does not return a valid string
  if (!decryptedText) {
    throw new Error("Decryption failed: Invalid ciphertext or key.");
  }

  return decryptedText;
};

module.exports = { decrypt };
