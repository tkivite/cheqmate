'use strict';
const express = require('express');
const userFriendRequestService = require('../../services/users/user_friend_requests_');
let router = express.Router();
router.post('/', userFriendRequestService.userFriendRequests);
module.exports = router;