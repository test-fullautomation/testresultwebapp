const express = require("express");
const resultController = require("../controllers/resultController");
const Auth = require("./auth");

const router = express.Router();

router.get("/", resultController.getAll.bind(resultController));
router.get("/:test_result_id", resultController.getByID.bind(resultController));
router.post("/", Auth, resultController.create.bind(resultController));
router.patch("/:test_result_id", Auth, resultController.updateByID.bind(resultController));
router.delete("/:test_result_id", Auth, resultController.deleteByID.bind(resultController));

module.exports = router;