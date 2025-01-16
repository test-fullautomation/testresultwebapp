const express = require("express");
const fileHeaderController = require("../controllers/fileHeaderController");
const Auth = require("./auth");

const router = express.Router();

router.get("/", fileHeaderController.getAll.bind(fileHeaderController));
router.get("/:file_id", fileHeaderController.getByID.bind(fileHeaderController));
router.post("/", Auth, fileHeaderController.create.bind(fileHeaderController));
router.patch("/:file_id", Auth, fileHeaderController.updateByID.bind(fileHeaderController));
router.delete("/:file_id", Auth, fileHeaderController.deleteByID.bind(fileHeaderController));

module.exports = router;