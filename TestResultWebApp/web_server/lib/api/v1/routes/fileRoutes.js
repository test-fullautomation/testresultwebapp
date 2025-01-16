const express = require("express");
const fileController = require("../controllers/fileController");
const Auth = require("./auth");

const router = express.Router();

router.get("/", fileController.getAll.bind(fileController));
router.get("/last", fileController.getLast.bind(fileController));
router.get("/:file_id", fileController.getByID.bind(fileController));
router.post("/", Auth, fileController.create.bind(fileController));
router.patch("/:file_id", Auth, fileController.updateByID.bind(fileController));
router.delete("/:file_id", Auth, fileController.deleteByID.bind(fileController));

module.exports = router;