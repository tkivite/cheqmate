'use strict';
const registerController = require('../../controllers/apis/register');
const countryController = require('../../controllers/apis/country');
const confirmCodeController = require('../../controllers/apis/confirmcode');
const loginController = require('../../controllers/apis/login');

const generateRandomNumber = require('../../controllers/apis/generaterandomnumber');
const userProfile = require('../../controllers/apis/userprofile');
const userLogout = require('../../controllers/apis/userlogout');
const editProfile = require('../../controllers/apis/editprofile');
const userFriendRequests = require('../../controllers/apis/userfriendrequests');
const userSearch = require('../../controllers/apis/usersearch');

const express = require('express');
let router = express.Router();
router.get('/', function (req, res) {
    res.send('This is the version 1 of Cheqmate APIS !');
});

router.use('/register', registerController);
/** sprint 1 - 10 apis*/
router.use('/registration_user', registerController);
router.use('/countries_code_get', countryController);
router.use('/user_confirm_code', confirmCodeController);
router.use('/user_login', loginController);
router.use('/user_generate_random_num', generateRandomNumber);
router.use('/user_profile', userProfile);
router.use('/user_logout', userLogout);
router.use('/edit_profile', editProfile);
router.use('/user_friend_requests', userFriendRequests);
router.use('/user_search', userSearch)

module.exports = router;