var express = require('express');
var router = express.Router();

router.use('/users', require('./users'));
router.use('/student', require('./student'));

module.exports = router;
