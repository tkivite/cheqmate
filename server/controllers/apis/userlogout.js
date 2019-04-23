'use strict';
'use strict';
const express = require('express');
const loginService = require('../../services/users/logout_');
let router = express.Router();
router.post('/', loginService.userLogout);
module.exports = router;