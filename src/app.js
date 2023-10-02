const mysql = require("mysql");
const express = require("express");
var expressSession = require("express-session");
const path = require("path");
require("dotenv").config();

const hostname = process.env.HOST;
const PORT = process.env.PORT;
global.BASE_URL = process.env.BASE_URL;
global.API_BASE_URL = process.env.API_BASE_URL;
global.FRONTEND_URL = process.env.FRONTEND_URL;

global.UPLOAD_DIR = "public/upload/";

global.connectPool = require("./config/database.js");
global.__basedir = __dirname;
global.dateAndTime = require("date-and-time");
const app = express();

const http = require("http").Server(app);

global.nodemailer = require("nodemailer");
global.mailerConfig = require("./config/mailer.config.js");
global.html_entities = require("./controllers/helpers/html_entities");
global.jwt = require("jsonwebtoken");
global.jwtConfig = require("./config/auth.jwtConfig.js");

const bCrypt = require("bcryptjs");

const multer = require("multer");

const apirouter = require("./apiroute.js");

const cors = require("cors");

app.use(cors());
const bodyParser = require("body-parser");
app.use("/public", express.static("public"));
app.use(
  expressSession({
    secret: "D%$*&^lk32",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(function (req, res, next) {
  if (!req.path.includes("/api/")) {
    global.session_user_id = "";
    global.session_user_full_name = "";
    if (typeof req.session.userID !== "undefined") {
      global.session_user_id = req.session.userID;
      global.session_user_full_name = req.session.userFullName;
    }
  }
  next();
});

const adminrouter = require("./adminrouter.js");
const expressValidator = require("express-validator");
var flash = require("req-flash");

connectPool.on("error", function (err) {
  console.log("[mysql error]", err);
});

//For set layouts of html view
//const expressLayouts = require('express-ejs-layouts');
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
//app.use(expressLayouts);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(flash());

app.use("/", adminrouter);

app.use("/api", apirouter);

var server = http.listen(PORT, hostname, () => {
  console.log(`Server running at http://${hostname}:${PORT}/`);
});

server.timeout = 0;
