const router = require("express").Router();
const { checkToken } = require("../auth/token_validation");
const {
  save,
  getAll,
  getById,
  getCurrent,
  update,
  _delete,
  count_records,
  get_with_default
} = require("./category.controller");

// routes
router.post('/save', checkToken, save);
router.post('/', checkToken, getAll);
router.post('/get/:id', checkToken, getById);
router.post('/current', checkToken, getCurrent);
router.put('/:id', checkToken, update);
router.delete('/:id', checkToken, _delete);
router.post('/count', checkToken, count_records);
router.post('/get_with_default', checkToken, get_with_default);
module.exports = router;