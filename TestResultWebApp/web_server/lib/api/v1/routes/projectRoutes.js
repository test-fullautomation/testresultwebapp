const express = require("express");
const projectController = require("../controllers/projectController");
const Auth = require("./auth");

const router = express.Router();

router.get("/", projectController.get.bind(projectController));
// router.get("/:project", projectController.getByID.bind(projectController));
router.post("/", Auth, projectController.create.bind(projectController));
router.patch("", Auth, projectController.notImplementedMethod.bind(projectController));
router.delete("*", Auth, projectController.notImplementedMethod.bind(projectController));

module.exports = router;