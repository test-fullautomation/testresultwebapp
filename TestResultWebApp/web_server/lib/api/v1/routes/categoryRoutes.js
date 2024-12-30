const express = require("express");
const categoryController = require("../controllers/categoryController");
const Auth = require("./auth");

const router = express.Router();

router.get("/", categoryController.get.bind(categoryController));
router.get("/:category_id", categoryController.getByID.bind(categoryController));
router.post("/", Auth, categoryController.create.bind(categoryController));
router.patch("", Auth, categoryController.notImplementedMethod.bind(categoryController));
router.delete("*", Auth, categoryController.notImplementedMethod.bind(categoryController));

module.exports = router;