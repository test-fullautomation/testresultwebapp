const express = require("express");
const testcaseController = require("../controllers/testcaseController");
const Auth = require("./auth");

const router = express.Router();

router.get("/", testcaseController.getAll.bind(testcaseController));
router.get("/:test_case_id", testcaseController.getByID.bind(testcaseController));
router.post("/", Auth, testcaseController.create.bind(testcaseController));
router.patch("/:test_case_id", Auth, testcaseController.updateByID.bind(testcaseController));
router.delete("/:test_case_id", Auth, testcaseController.deleteByID.bind(testcaseController));

module.exports = router;