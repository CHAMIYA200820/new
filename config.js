const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}
module.exports = {
  SESSION_ID: process.env.SESSION_ID || "PINK-QUEEN-MD-j7hDjIQQ#SYLBss6qo4Hwu8fkim0hnAR8Tqr2pxS8kXOu9YoA-D0",
  MONGODB: process.env.MONGODB || "mongodb://mongo:IEcVaBGSwZNfRMzHDshqhTpKayzYAjwH@shortline.proxy.rlwy.net:43054",
  OWNER_NUM: process.env.OWNER_NUM || "94769040256",
};
