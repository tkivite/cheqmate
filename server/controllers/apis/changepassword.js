'use strict';
const express = require('express');
const changePasswordService = require('../../services/users/change_password_');
let router = express.Router();
router.post('/', changePasswordService.changePassword);
module.exports = router;