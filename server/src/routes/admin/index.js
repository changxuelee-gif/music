'use strict';

/** 后台 API 路由汇总（统一挂在 /api/admin） */
const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/', require('./playlists'));
router.use('/', require('./content'));
router.use('/', require('./complaints'));
router.use('/', require('./dashboard'));
router.use('/', require('./upload'));
router.use('/', require('./site'));
router.use('/', require('./users'));

module.exports = router;
