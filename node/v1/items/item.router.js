const router = require("express").Router();
const { checkToken } = require("../auth/token_validation");
const {
  getAll,
  export_to_csv,
  getById,
  getCurrent,
  _delete,
  count_records,
  find_by_item_id,
  update_partial
} = require("./item.controller");

// routes
router.post('/', checkToken, getAll);
router.post('/export_to_csv', checkToken, export_to_csv);
router.post('/get/:id', checkToken, getById);
router.post('/current', checkToken, getCurrent);
router.delete('/:id', checkToken, _delete);
router.post('/count', checkToken, count_records);
router.post('/find/:id', checkToken, find_by_item_id);
router.put('/update_partial/:id/:step', checkToken, update_partial);
module.exports = router;