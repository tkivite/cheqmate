'use strict';
const express = require('express');
let UtilityFunction = require('../../common/functions')
let router = express.Router();
router.get('/', function (req, res) {
    res.send('This is the version 1 of Cheqmate APIS !');
});
//sprint 1
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
const changePassword = require('../../controllers/apis/changepassword');


router.use('/register', registerController);
/** sprint 1 - 10 apis*/
router.use('/registration_user', registerController);
router.use('/user_confirm_code', confirmCodeController);
router.use('/user_login', loginController);
router.use('/change_password', changePassword);


router.use(UtilityFunction.verifyToken, function (req, res, next) {
    // Put some preprocessing here.
    console.log(res);

    next();
});


router.use('/countries_code_get', countryController);

router.use('/user_generate_random_num', generateRandomNumber);
router.use('/user_profile', userProfile);
router.use('/user_logout', userLogout);
router.use('/edit_profile', editProfile);
router.use('/user_friend_requests', userFriendRequests);
router.use('/user_search', userSearch);

//sprint 2

const friendRequestController = require('../../controllers/apis/friend_request');
/*const phoneNumbersController = require('../../controllers/apis/upload_phone_numbers');

const deleteFriendController = require('../../controllers/apis/delete_friend');
const promotionsController = require('../../controllers/apis/promotions');
const restaurantDetailsController = require('../../controllers/apis/restaurant_details');
const restaurantStarsController = require('../../controllers/apis/restaurant_stars');
const restaurantFollowController = require('../../controllers/apis/restaurant_follow');
const promotionsSaveController = require('../../controllers/apis/promotions_save');
const promotionStarsController = require('../../controllers/apis/promotions_star');
const promotionsSaveGetController = require('../../controllers/apis/promotions_save_get');


/** sprint 2 - 10 apis*/
router.use('/user_friend_request', friendRequestController);
/*router.use('/phone_numbers', phoneNumbersController); //upload contacts

router.use('/users_delete_friend', deleteFriendController);
router.use('/promotions', promotionsController);
router.use('/restaurants_details', restaurantDetailsController);
router.use('/user_restaurant_stars', restaurantStarsController);
router.use('/user_restaurant_follow', restaurantFollowController);
router.use('/user_promotions_save', promotionsSaveController);
router.use('/user_promotions_stars', promotionStarsController);
router.use('/user_promotions_save_get', promotionsSaveGetController);



*/

/** sprint 3 - The Cheque Process*/

const userChequeRequestController = require('../../controllers/apis/cheque/user_cheque_request');
const receiveChequeResponseController = require('../../controllers/apis/cheque/receive_cheque_response');
/*const chooseChequeFriendsController = require('../../controllers/apis/choose_cheque_friends');
const chooseItemsFromChequesController = require('../../controllers/apis/choose_items_from_cheques');
const activityLogController = require('../../controllers/apis/activity_log');
const validateChequeData = require('../../controllers/apis/validate_cheque_data');
const chequeFriendsController = require('../../controllers/apis/cheque_friends');
const userItemsController = require('../../controllers/apis/user_items');
const chequeSplitController = require('../../controllers/apis/cheque_split');
const userSplitController = require('../../controllers/apis/user_split');*/


router.use('/user_cheque_request', userChequeRequestController);
router.use('/receive_cheque_response', receiveChequeResponseController);
/*router.use('/choose_cheque_friends', chooseChequeFriendsController);
router.use('/choose_items_from_cheques', chooseItemsFromChequesController);
router.use('/activity_log', activityLogController);
router.use('/validate_cheque_data', validateChequeData);
router.use('/cheque_friends', chequeFriendsController);
router.use('/user_items', userItemsController);
router.use('/cheque_split', chequeSplitController);
router.use('/user_split', userSplitController);
*/





module.exports = router;