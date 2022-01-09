const crypto = require("crypto-js");
const NodeRSA = require("node-rsa");
export const getHash = (publicKey, hashData) => {
  const key = new NodeRSA(publicKey, { encryptionScheme: "pkcs1" });
  return key.encrypt(JSON.stringify(hashData), "base64").toString();
};
export const getSignatue = (secretKey, signatureDatas) => {
  let data = "";
  for (const key in signatureDatas) data += `${key}=${signatureDatas[key]}&`;
  data = data.slice(0, -1);
  console.log("data: ", data);
  return crypto.HmacSHA256(data, secretKey).toString();
};
