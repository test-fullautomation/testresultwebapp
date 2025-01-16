const express = require("express");
const abortController = require("../controllers/abortController");
const Auth = require("./auth");

const router = express.Router();

router.get("/", abortController.getAll.bind(abortController));
router.get("/:test_result_id", abortController.getByID.bind(abortController));
router.post("/", Auth, abortController.create.bind(abortController));
router.patch("/:test_result_id", Auth, abortController.updateByID.bind(abortController));
router.delete("/:test_result_id", Auth, abortController.deleteByID.bind(abortController));

module.exports = router;