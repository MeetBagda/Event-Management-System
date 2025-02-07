const express = require('express');
const userRouter = require('./user')
const eventRouter = require('./event')
const router = express.Router()

router.use('/user',userRouter);
router.use('/event',eventRouter)

module.exports = router;