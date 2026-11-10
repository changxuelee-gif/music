'use strict';

/** 公共 API 路由汇总 */
const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/favorites', require('./favorites'));
router.use('/complaints', require('./complaints'));
router.use('/stats', require('./stats'));
router.use('/open', require('./open'));
router.use('/', require('./site'));
router.use('/', require('./catalog'));

module.exports = router;
