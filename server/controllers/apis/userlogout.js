'use strict';
'use strict';
const express = require('express');
const loginService = require('../../services/users/login_');
let router = express.Router();
//router.post('/', loginService.userLogout);
router.post('/', loginService.userLogin);
module.exports = router;