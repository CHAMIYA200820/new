const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}
module.exports = {
  SESSION_ID: process.env.SESSION_ID || "PINK-QUEEN-MD-TzxAVBzA#X10vqcFzw4endOIqnyHnizICqlGlDRfVWMqE7PVPJHM",
  MONGODB: process.env.MONGODB || "mongodb://mongo:IDPYBEItnuhAcxIAzqczLerkMYmeFXSN@switchback.proxy.rlwy.net:11696",
  OWNER_NUM: process.env.OWNER_NUM || "94769040256",
};
