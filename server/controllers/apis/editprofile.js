'use strict';
const express = require('express');
const editProfileService = require('../../services/users/edit_profile_');
let router = express.Router();
router.post('/', editProfileService.editProfile);
module.exports = router;