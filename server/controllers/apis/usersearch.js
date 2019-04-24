'use strict';
const express = require('express');
const userSearch = require('../../services/users/user_search_');
let router = express.Router();
router.post('/', userSearch.userSearch);
module.exports = router;