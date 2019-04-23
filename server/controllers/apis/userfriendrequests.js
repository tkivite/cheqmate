'use strict';
const express = require('express');
const userFriendRequestService = require('../../services/users/user_friend_requests_');
let router = express.Router();
router.get('/', userFriendRequestService.userFriendRequests);
module.exports = router;