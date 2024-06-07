const router = require("express").Router();

router.get("/", (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post("/:id", (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post("/", (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.put("/:id", (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return next(error);
  }
});
