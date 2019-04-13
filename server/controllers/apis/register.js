'use strict';
const express = require('express');
const registerService = require('../../services/users/register_');
let router = express.Router();
router.post('/', registerService.registerUser);
module.exports = router;