const express = require("express");
const callRoutine = require("../controllers/storeProcedureController");
const Auth = require("./auth");

const router = express.Router();

router.post("/", Auth, callRoutine.callEvtblResults);
router.patch("/:test_result_id", Auth, callRoutine.callEvtblResult);

module.exports = router;