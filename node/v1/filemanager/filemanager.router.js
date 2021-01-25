const router = require("express").Router();
const { checkToken } = require("../auth/token_validation");
const {
  upload,
  getAll,
} = require("./filemanager.controller");

router.post('/upload_file', checkToken, upload);
router.post('/list', checkToken, getAll);
module.exports = router;