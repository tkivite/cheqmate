"use strict";
const UtilityFunctions = require("../../common/functions");
const mysqlpool = require("../../../configs/mysqlconfig");

let responseMessage = {
	status_msg: "false",
	status_code: 400,
	user: {
		u_phone: "",
		u_token: "",
		ud_token: "",
		access_token: ""
	}
};
// User Login
function userLogin(request, response) {
	if (!validInput(request)) {
		responseMessage.status_code = 400;
		console.log("invalid data");
		response.status(responseMessage.status_code).send(responseMessage);
	} else {

		let u_password_v = request.headers.user_password,
			login_text_v = request.body.login_text_v,
			ud_device_type_v = request.body.user_device.ud_device_type_v,
			ud_device_version_v = request.body.user_device.ud_device_version_v,
			ud_device_id_v = request.body.user_device.ud_device_id_v,
			ud_app_version_v = request.body.user_device.ud_app_version_v,
			ul_login_type_v = request.body.user_log.ul_login_type_v,
			ul_third_party_token_v = request.body.user_log.ul_third_party_token_v,
			ul_ip_v = request.body.user_log.ul_ip_v,
			ul_mac_v = request.body.user_log.ul_mac_v;

		let u_id_v,
			ud_id_v,
			ul_state_v = 0,
			ud_token_v,
			u_token_v,
			u_name_v,
			u_email_v,
			user_o;

		if (UtilityFunctions.isStringEmptyOrNull(login_text_v, 1)) {
			responseMessage.status_msg = "Code_or_email_must_be_entered";
			responseMessage.status_code = 400;
			response.status(400).send(responseMessage);
			return;
		} else if (UtilityFunctions.isStringEmptyOrNull(u_password_v, 5)) {
			responseMessage.status_msg = "Password_must_be_entered";
			responseMessage.status_code = 400;
			response.status(400).send(responseMessage);
			return;
		} else if (UtilityFunctions.isStringEmptyOrNull(ul_login_type_v, 1)) {
			responseMessage.status_msg = "Login_type_must_be_entered";
			responseMessage.status_code = 400;
			response.status(400).send(responseMessage);
			return;
		} else if (
			ul_login_type_v != "chqmate" &&
			UtilityFunctions.isStringEmptyOrNull(ul_third_party_token_v, 1)
		) {
			responseMessage.status_msg = "third_party_token_must_be_entered";
			responseMessage.status_code = 400;
			response.status(400).send(responseMessage);
			return;
		} else if (ud_device_type_v != "ios" && ud_device_type_v != "android") {
			responseMessage.status_msg = "Device_type_must_be_entered";
			responseMessage.status_code = 400;
			response.status(400).send(responseMessage);
			return;
		} else if (UtilityFunctions.isStringEmptyOrNull(ud_device_version_v, 1)) {
			responseMessage.status_msg = "Device_version_must_be_entered";
			responseMessage.status_code = 400;
			response.status(400).send(responseMessage);
			return;
		} else if (UtilityFunctions.isStringEmptyOrNull(ud_device_id_v, 1)) {
			responseMessage.status_msg = "Device_id_must_be_entered";
			responseMessage.status_code = 400;
			response.status(400).send(responseMessage);
			return;
		} else if (UtilityFunctions.isStringEmptyOrNull(ud_app_version_v, 1)) {
			responseMessage.status_msg = "App_version_must_be_entered";
			responseMessage.status_code = 400;
			response.status(400).send(responseMessage);
			return;
		} else {
			mysqlpool.getConnection(function (err, conn) {
				if (err) {
					console.error("error connecting: " + err.stack);
					responseMessage.status_msg = "Error connecting to database";
					responseMessage.status_code = 400;
					response.status(400).send(responseMessage);
					return;
				} else {
					conn.beginTransaction(function (err) {
						if (err) {
							throw err;
						} else {
							conn.query(
								"select * from users where(u_code = ? or u_email = ?) and u_password = ? and u_state = 1",
								[
									login_text_v,
									login_text_v,
									UtilityFunctions.generateMD5(u_password_v)
								],
								function (err, result) {
									if (err) {
										conn.rollback(function () {
											throw err;
										});
									} else if (result.length == 0) {
										responseMessage.status_msg = "Incorrect_login_data";
										responseMessage.status_code = 404;
										response.status(404).send(responseMessage);
										conn.release();
										return;
									} else {
										user_o = result[0];
										conn.query(
											"select * from users where(u_code = ? or u_email = ?) and u_password = ? and u_state = 1 and (u_confirm_phone = 1 or u_confirm_email = 1)",
											[
												login_text_v,
												login_text_v,
												UtilityFunctions.generateMD5(u_password_v)
											],
											function (err, result) {
												if (err) {
													conn.rollback(function () {
														throw err;
													});
												} else if (result.length == 0) {
													conn.query(
														"select u_id, u_name, u_email, u_token, ud_token from users, user_devices where ud_user_id = u_id and(u_code = ? or u_email = ?) and u_password = ? and u_state = 1 order by ud_id DESC limit 1;",
														[
															login_text_v,
															login_text_v,
															UtilityFunctions.generateMD5(u_password_v)
														],
														function (err, result) {
															if (err) {
																conn.rollback(function () {
																	throw err;
																});
															} else {
																u_id_v = result[0].u_id;
																u_name_v = result[0].u_name;
																u_email_v = result[0].u_email;
																u_token_v = result[0].u_token;
																ud_token_v = result[0].ud_token;
															}
														}
													);
													conn.query(
														"select u_phone, ud_token_v as 'ud_token', u_code, u_token, ctry_code from users, countries where u_country_id = ctry_id and(u_code = ? or u_email = ?) and u_password = ? and u_state = 1",
														[
															login_text_v,
															login_text_v,
															UtilityFunctions.generateMD5(u_password_v)
														],
														function (err, result) {
															if (err) {
																conn.rollback(function () {
																	throw err;
																});
															} else {
																responseMessage.user.u_phone =
																	result[0].u_phone;
																responseMessage.user.u_token =
																	result[0].u_token;
																responseMessage.user.ud_token =
																	result[0].ud_token;
															}
														}
													);

													responseMessage.status_msg =
														"Your_account_not_confirmed_yet";
													responseMessage.status_code = 400;
													response.status(400).send(responseMessage);
													conn.release();
													return;
												} else {
													conn.query(
														"select u_id, u_name, u_email, u_token from users where(u_code = ? or u_email = ?) and u_password = ? and u_state = 1",
														[
															login_text_v,
															login_text_v,
															UtilityFunctions.generateMD5(u_password_v)
														],
														function (err, result) {
															if (err) {
																conn.rollback(function () {
																	throw err;
																});
															} else {
																u_id_v = result[0].u_id;
																u_name_v = result[0].u_name;
																u_email_v = result[0].u_email;
																u_token_v = result[0].u_token;
															}
														}
													);

													conn.query(
														"update users set u_last_login = NOW(), u_login_type = ?, u_third_party_token = ? where u_id = ?",
														[ul_login_type_v, ul_third_party_token_v, u_id_v],
														function (err, result) {
															if (err) {
																conn.rollback(function () {
																	throw err;
																});
															}
														}
													);
													conn.query(
														"select * from user_devices where ud_user_id = ? and ud_device_id = ?",
														[u_id_v, ud_device_id_v],
														function (err, result) {
															if (err) {
																conn.rollback(function () {
																	throw err;
																});
															} else if (result.length > 0) {
																conn.query(
																	"select ud_id, ud_token, ud_token_v from user_devices where ud_user_id = ? and ud_device_id = ?",
																	[u_id_v, ud_device_id_v],
																	function (err, result) {
																		if (err) {
																			conn.rollback(function () {
																				throw err;
																			});
																		} else if (result.length > 0) {
																			ud_id_v = result[0].ud_id;
																			ud_token_v = result[0].ud_token;
																		}
																	}
																);

																conn.query(
																	"update users set u_last_active = now() where u_id = ? and u_token = ?",
																	[u_id_v, u_token_v],
																	function (err, result) {
																		if (err) {
																			conn.rollback(function () {
																				throw err;
																			});
																		}
																	}
																);

																conn.query(
																	"update user_devices	set ud_device_type = ?, ud_device_version = ?, ud_last_active = now(), ud_logout = 0, ud_app_version = ?	where ud_id = ? ",
																	[ud_device_type_v, ud_app_version_v, ud_id_v],
																	function (err, result) {
																		if (err) {
																			conn.rollback(function () {
																				throw err;
																			});
																		}
																	}
																);

																let token = UtilityFunctions.getToken(JSON.parse(JSON.stringify(user_o)));
																ul_state_v = 1;
																responseMessage.status_msg =
																	"Login_successfully";
																responseMessage.status_code = 201;
																responseMessage.user.access_token = token;



																if ((ul_state_v = 1)) {
																	conn.query(
																		"insert into users_login_log(ul_login_text, ul_name, ul_email, ul_password, ul_login_type, ul_third_party_token, ul_device_type, ul_device_version, ul_device_id, ul_ip, ul_mac, ul_date, ul_state, ul_app_version) values (?,?,?,?,?,?,?,?,?,?,?,now(),?,?)",
																		[
																			login_text_v,
																			u_name_v,
																			u_email_v,
																			UtilityFunctions.generateMD5(u_password_v),
																			ul_login_type_v,
																			ul_third_party_token_v,
																			ud_device_type_v,
																			ud_device_version_v,
																			ud_device_id_v,
																			ul_ip_v,
																			ul_mac_v,

																			ul_state_v,
																			ud_app_version_v
																		],
																		function (err, result) {
																			if (err) {
																				conn.rollback(function () {
																					throw err;
																				});
																			}
																		}
																	);
																} else {
																	conn.query(
																		"insert into users_login_log(ul_login_text, ul_name, ul_email, ul_password, ul_login_type, ul_third_party_token, ul_device_type, ul_device_version, ul_device_id, ul_ip, ul_mac, ul_date, ul_state, ul_app_version) values (?,?,?,?,?,?,?,?,?,?,?,now(),?,?)",
																		[
																			login_text_v,
																			u_name_v,
																			u_email_v,
																			u_password_v,
																			ul_login_type_v,
																			ul_third_party_token_v,
																			ud_device_type_v,
																			ud_device_version_v,
																			ud_device_id_v,
																			ul_ip_v,
																			ul_mac_v,
																			ul_state_v,
																			ud_app_version_v
																		],
																		function (err, result) {
																			if (err) {
																				conn.rollback(function () {
																					throw err;
																				});
																			}
																		}
																	);
																}








															} else {
																let register_date = '',
																	device_type = ud_device_type_v;

																conn.query(
																	"insert into user_devices(ud_user_id, ud_device_type, ud_device_version, ud_device_id, ud_token, ud_app_version, ud_register_date) values (?,?,?,?,?,?,NOW())",
																	[
																		u_id_v,
																		ud_device_type_v,
																		ud_device_version_v,
																		ud_device_id_v,
																		"",
																		ud_app_version_v
																	],
																	function (err, result) {
																		if (err) {
																			conn.rollback(function () {
																				throw err;
																			});
																		} else {
																			console.log("user inserted" + result);
																			console.log(result);
																			ud_id_v = result.insertId;


																			conn.query(
																				"update user_devices set ud_last_active = now() and ud_first_active = now() where ud_id = ?",
																				[ud_id_v],
																				function (err, result) {
																					if (err) {
																						conn.rollback(function () {
																							throw err;
																						});
																					}
																				}
																			);

																			conn.query(
																				"update users set u_last_active=now() where u_id=? and u_token=?;",
																				[u_id_v, u_token_v],
																				function (err, result) {
																					if (err) {
																						conn.rollback(function () {
																							throw err;
																						});
																					}
																				}
																			);

																			conn.query(
																				"select ud_register_date, ud_device_type from user_devices where ud_id = ?",
																				[ud_id_v],
																				function (err, result) {
																					if (err) {
																						conn.rollback(function () {
																							throw err;
																						});
																					} else if (result.length > 0) {
																						register_date =
																							result[0].ud_register_date;
																						device_type = result[0].ud_device_type;

																						console.log("ud id v: " + ud_id_v);

																						ud_token_v = UtilityFunctions.userDevicesToken(
																							u_id_v,
																							ud_id_v,
																							login_text_v,
																							register_date,
																							device_type
																						);
																						console.log("ud_token_v: " + ud_token_v);

																						conn.query(
																							"insert into user_devices_token(udt_device_id, udt_token, udt_date) values (?,?,now() )",
																							[ud_id_v, ud_token_v],
																							function (err, result) {
																								if (err) {
																									conn.rollback(function () {
																										throw err;
																									});
																								}
																							}
																						);

																						if (
																							UtilityFunctions.isStringEmptyOrNull(
																								ud_token_v
																							)
																						) {
																							responseMessage.status_msg =
																								"User_device_token_must_be_generated";
																						} else {
																							conn.query(
																								"select * from users, user_devices where u_id = ? and ud_token = ? and ud_state != 2 and u_state != 2",
																								[u_id_v, ud_token_v],
																								function (err, result) {
																									if (err) {
																										conn.rollback(function () {
																											throw err;
																										});
																									} else if (result.length > 0) {
																										responseMessage.status_msg =
																											"Generated_user_device_token_already_exists";
																									} else {
																										conn.query(
																											"update user_devices set ud_token = ? where ud_id = ?",
																											[ud_token_v, ud_id_v],
																											function (err, result) {
																												if (err) {
																													conn.rollback(function () {
																														throw err;
																													});
																												} else {
																													ul_state_v = 1;

																													let token = UtilityFunctions.getToken(JSON.parse(JSON.stringify(user_o)));

																													responseMessage.status_msg =
																														"Login_successfully";
																													responseMessage.status_code = 201;
																													responseMessage.user.access_token = token;


																													if ((ul_state_v = 1)) {
																														conn.query(
																															"insert into users_login_log(ul_login_text, ul_name, ul_email, ul_password, ul_login_type, ul_third_party_token, ul_device_type, ul_device_version, ul_device_id, ul_ip, ul_mac, ul_date, ul_state, ul_app_version) values (?,?,?,?,?,?,?,?,?,?,?,now(),?,?)",
																															[
																																login_text_v,
																																u_name_v,
																																u_email_v,
																																UtilityFunctions.generateMD5(u_password_v),
																																ul_login_type_v,
																																ul_third_party_token_v,
																																ud_device_type_v,
																																ud_device_version_v,
																																ud_device_id_v,
																																ul_ip_v,
																																ul_mac_v,

																																ul_state_v,
																																ud_app_version_v
																															],
																															function (err, result) {
																																if (err) {
																																	conn.rollback(function () {
																																		throw err;
																																	});
																																}
																															}
																														);
																													} else {
																														conn.query(
																															"insert into users_login_log(ul_login_text, ul_name, ul_email, ul_password, ul_login_type, ul_third_party_token, ul_device_type, ul_device_version, ul_device_id, ul_ip, ul_mac, ul_date, ul_state, ul_app_version) values (?,?,?,?,?,?,?,?,?,?,?,now(),?,?)",
																															[
																																login_text_v,
																																u_name_v,
																																u_email_v,
																																u_password_v,
																																ul_login_type_v,
																																ul_third_party_token_v,
																																ud_device_type_v,
																																ud_device_version_v,
																																ud_device_id_v,
																																ul_ip_v,
																																ul_mac_v,
																																ul_state_v,
																																ud_app_version_v
																															],
																															function (err, result) {
																																if (err) {
																																	conn.rollback(function () {
																																		throw err;
																																	});
																																}
																															}
																														);
																													}

																													conn.commit(function (err) {
																														if (err) {
																															conn.rollback(function () {
																																throw err;
																															});
																															// responseMessage.status_msg = 'The_Record_has_been_successfully_saved';
																															//responseMessage.status_code = 201;
																															response.status(400).send(responseMessage);
																															conn.release();
																															return;


																														} else {
																															response.status(responseMessage.status_code).send(responseMessage);
																															console.log('Transaction Complete.');
																															conn.release();
																															return;
																														}
																													});
















																												}
																											}
																										);
																									}
																								}
																							);
																						}

																					}
																				}
																			);


																		}
																	}
																);
															}
														}
													);

													/*	conn.query('select u_phone, ud_token_v as \'ud_token\', u_token from users, countries where u_id = ? and u_country_id = ctry_id', [u_id_v],
																								function (err, result) {
																									if (err) {
																										conn.rollback(function () {
																											throw err;
																										});
																									}
																								});
																							*/






												}
											}
										);
									}
								}
							);








						}




					});
				}
			});
		}
	}
}

function validInput(request) {
	console.log(request.headers);
	console.log(request.body);
	if (
		!request.headers ||
		!request.body ||
		!request.body.user_device ||
		!request.body.user_log
	) {
		responseMessage.status_msg = "false";
		return false;
	} else {
		return true;
	}
}
module.exports = {
	userLogin: userLogin
};