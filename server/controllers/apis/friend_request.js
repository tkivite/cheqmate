'use strict';
const express = require('express');
const friendRequestService = require('../../services/users/friend_request_');
let router = express.Router();
router.post('/', friendRequestService.friendRequest);
module.exports = router;