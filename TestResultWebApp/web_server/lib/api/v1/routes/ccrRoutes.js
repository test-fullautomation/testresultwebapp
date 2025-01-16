const express = require("express");
const ccrController = require("../controllers/ccrController");
const Auth = require("./auth");

const router = express.Router();

router.get("/", ccrController.getAll.bind(ccrController));
router.get("/:ccr_components_id", ccrController.getByID.bind(ccrController));
router.post("/", Auth, ccrController.create.bind(ccrController));
router.patch("/:ccr_components_id", Auth, ccrController.updateByID.bind(ccrController));
router.delete("/:ccr_components_id", Auth, ccrController.deleteByID.bind(ccrController));

module.exports = router;