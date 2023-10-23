const express = require("express");

// const router = require("express").Router();

// const LoginController = require("../controllers/LoginController.js");
// const DashboardController = require("../controllers/DashboardController.js");


const Admin_DashboardController = require("../../../controllers/admin/Admin_DashboardController.js");
const router = express.Router();


router.get("/admin_dashboard", Admin_DashboardController.view_dashboard);


module.exports = router;
