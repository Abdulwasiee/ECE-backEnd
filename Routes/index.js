const express = require("express");
const router = express.Router();
const installRouter = require("./install.router");
const userRouter = require("./user.router");
const loginRouter = require("./login.router");
const contactRouter = require("./contact.router");
const newsRouter = require("./news.router");
const courseRouter = require("./course.router");
const batchRouter = require("./batch.router");
const materialRouter = require("./material.router");
const studentRouter = require("./student.router");
const checkUserRouter = require("./checkUser.router");
router.use(installRouter);
router.use(userRouter);
router.use(loginRouter);
router.use(contactRouter);
router.use(newsRouter);
router.use(courseRouter);
router.use(batchRouter);
router.use(materialRouter);
router.use(studentRouter);
router.use(checkUserRouter);
module.exports = router;
