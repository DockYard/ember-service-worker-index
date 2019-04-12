const crypto = require("crypto");

const md5Hash = (buf) => {
  let md5 = crypto.createHash("md5");
  md5.update(buf);
  return md5.digest("hex");
}

module.exports = {
  md5Hash
};
