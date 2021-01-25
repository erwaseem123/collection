const router = require("express").Router();
const { checkToken } = require("../auth/token_validation");
const {
  authenticate,
  register,
  getById,
  update_profile,
  password,
  resend_verification_email,
  verifyemail,
  validate_verified_account,
  forgot,
  reset
} = require("./user.controller");
router.post('/authenticate', authenticate);
router.post('/register', register);
router.post('/get', checkToken, getById);
router.post('/update', checkToken, update_profile);
router.post('/password', checkToken, password);
router.post('/resendemail', resend_verification_email);
router.post('/verifyemail', verifyemail);
router.post('/validate_verified_account', checkToken, validate_verified_account);
router.post('/forgot', forgot);
router.post('/reset', reset);
module.exports = router;