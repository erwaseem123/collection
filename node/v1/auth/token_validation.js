const jwt = require("jsonwebtoken");
const helper = require("../config/helper");
const user = require("../users/user.service");
module.exports = {
  checkToken: async (req, res, next) => {
    let token = req.get("authorization");
    if (token) {
      // Remove Bearer from string
      token = token.slice(7);
      jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
        let is_error = false;
        if (err) {
          return res.status(200).json(await helper.error("Access Denied!! Unauthorized User"));
        }
        req.decoded = decoded;
        next();

      });
    } else {
      return res.status(200).json(await helper.error("Access Denied! Unauthorized User"));
    }

  }
};