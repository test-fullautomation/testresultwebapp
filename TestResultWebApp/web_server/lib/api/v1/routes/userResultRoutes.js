const express = require("express");
const userResultController = require("../controllers/userResultController");
const Auth = require("./auth");

const router = express.Router();

router.get("/", userResultController.getAll.bind(userResultController));
router.get("/:test_result_id", userResultController.getByID.bind(userResultController));
router.post("/", Auth, userResultController.create.bind(userResultController));
router.patch("/:test_result_id", Auth, userResultController.updateByID.bind(userResultController));
router.delete("/:test_result_id", Auth, userResultController.deleteByID.bind(userResultController));


module.exports = router;