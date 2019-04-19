'use strict';
const express = require('express');
const profileService = require('../../services/users/user_profile_');
let router = express.Router();
router.post('/', profileService.userProfile);

module.exports = router;