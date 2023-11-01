const { validationResult } = require("express-validator");
const validator = require('./helpers/validate');
const { hashSync, genSaltSync } = require("bcryptjs");
var fs = require('fs');
exports.register = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"name": "required",
		"mobile_no": "required",
		"password": "required",
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var name = body.name;
			var mobile_no = body.mobile_no;
			var password = body.password;
			var type = body.type;
			var email = '';
			if (type == 2) {
				email = body.email;
			}
			const salt = genSaltSync(10);
			password = hashSync(password, salt);
			connectPool.query('SELECT * FROM user WHERE mobile_no ="' + mobile_no + '"', function (erro, result, field) {
				if (erro) {
					return res.status(200).json({
						status: 0,
						message: erro
					});
				}
				if (result.length > 0) {
					return res.status(200).json({
						status: 0,
						message: 'This Mobile No is already exist'
					});
				} else {
					var insQry = 'INSERT INTO user SET type = ' + type + ',name = "' + name + '", mobile_no = "' + mobile_no + '", password = "' + password + '"';
					connectPool.query(insQry, (error, results, fields) => {
						if (error) {
							return res.status(200).json({
								status: 0,
								message: error
							});
						}
						id = results.insertId;
						connectPool.query('SELECT * FROM user WHERE id ="' + id + '"', async function (errors, result, fields) {
							if (errors) {
								return res.status(200).json({
									status: 0,
									message: errors
								});
							}
							if (result.length > 0) {
								try {
									// JWT Auth Token
									var userObj = new Object;
									userObj['id'] = result[0].id;
									const auth_token = await jwt.sign(userObj, jwtConfig.secret, { expiresIn: jwtConfig.accessTokenLife });

									var data = {};
									data['id'] = result[0].id;
									data['name'] = result[0].name;
									data['email'] = result[0].email;
									data['mobile_no'] = result[0].mobile_no;
									data['type'] = result[0].type;
									var img = BASE_URL + 'public/upload/placeholder.png';
									if (result[0].image != '') {
										var imagePath = 'public/upload/user/' + result[0].image;
										if (fs.existsSync(imagePath)) {
											var img = BASE_URL + 'public/upload/user/' + result[0].image;
										}
									}
									data['image'] = img;
									data['specialization_id'] = result[0].specialization_id;
									data['gender'] = result[0].gender;
									data['position'] = result[0].position;
									data['city_id'] = result[0].city_id;
									data['registration_number'] = result[0].registration_number;
									data['registration_council_id'] = result[0].registration_council_id;
									data['registration_year'] = result[0].registration_year;
									data['degree_id'] = result[0].degree_id;
									data['college'] = result[0].college;
									data['year_of_completion'] = result[0].year_of_completion;
									data['year_of_experience'] = result[0].year_of_experience;
									data['auth_token'] = auth_token;
									return res.status(200).json({
										status: 1,
										message: 'Register created successfully',
										data: data
									});
									
								} catch (error) {
									return res.status(200).json({
										status: 0,
										message: error.message
									});
								}
							} else {
								return res.status(200).json({
									status: 1,
									message: 'Register created successfully',
									data: []
								});
							}
						});
					});
				}
			});
		} else {
			return res.status(200).json({
				status: 0,
				message: 'All Field Required'
			});
		}
	});
};
exports.doctor_register = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"name": "required",
		"email": "required",
		"mobile_no": "required",
		"password": "required",
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var name = body.name;
			var email = body.email;
			var mobile_no = body.mobile_no;
			var password = body.password;
			var type = 2;
			const salt = genSaltSync(10);
			password = hashSync(password, salt);
			connectPool.query('SELECT * FROM user WHERE mobile_no ="' + mobile_no + '"', function (erro, result, field) {
				if (erro) {
					return res.status(200).json({
						status: 0,
						message: erro
					});
				}
				if (result.length > 0) {
					return res.status(200).json({
						status: 0,
						message: 'This Mobile No is already exist'
					});
				} else {
					connectPool.query('SELECT * FROM user WHERE email ="' + email + '"', function (error1, result1, field) {
						if (error1) {
							return res.status(200).json({
								status: 0,
								message: error1
							});
						}
						if (result1.length > 0) {
							return res.status(200).json({
								status: 0,
								message: 'The email is already exist'
							});
						}else{
							var insQry = 'INSERT INTO user SET type = ' + type + ', name = "' + name + '", email = "' + email + '", mobile_no = "' + mobile_no + '", password = "' + password + '"';
							connectPool.query(insQry, (error, results, fields) => {
								if (error) {
									return res.status(200).json({
										status: 0,
										message: error
									});
								}
								id = results.insertId;
								connectPool.query('SELECT * FROM user WHERE id ="' + id + '"', async function (errors, result, fields) {
									if (errors) {
										return res.status(200).json({
											status: 0,
											message: errors
										});
									}
									if (result.length > 0) {
										try {
											// JWT Auth Token
											var userObj = new Object;
											userObj['id'] = result[0].id;
											const auth_token = await jwt.sign(userObj, jwtConfig.secret, { expiresIn: jwtConfig.accessTokenLife });

											var data = {};
											data['id'] = result[0].id;
											data['name'] = result[0].name;
											data['email'] = result[0].email;
											data['mobile_no'] = result[0].mobile_no;
											data['type'] = result[0].type;
											var img = BASE_URL + 'public/upload/placeholder.png';
											if (result[0].image != '') {
												var imagePath = 'public/upload/user/' + result[0].image;
												if (fs.existsSync(imagePath)) {
													var img = BASE_URL + 'public/upload/user/' + result[0].image;
												}
											}
											data['image'] = img;
											data['specialization_id'] = result[0].specialization_id;
											data['gender'] = result[0].gender;
											data['position'] = result[0].position;
											data['city_id'] = result[0].city_id;
											data['registration_number'] = result[0].registration_number;
											data['registration_council_id'] = result[0].registration_council_id;
											data['registration_year'] = result[0].registration_year;
											data['degree_id'] = result[0].degree_id;
											data['college'] = result[0].college;
											data['year_of_completion'] = result[0].year_of_completion;
											data['year_of_experience'] = result[0].year_of_experience;
											data['auth_token'] = auth_token;
	
											let sqlAdmin = 'select * from admin LIMIT 1';
											connectPool.query(sqlAdmin, (adminError, adminResults, adminFields) => {
												if (adminError) {
													return res.status(200).json({
														status: 0,
														message: adminError.sqlMessage
													});
												}
												if(adminResults[0].email !== null){
													// Send admin mail
													var drMailHtml='<p>A new doctor is registered. The basic details are as below:</p>';
													drMailHtml += '<p><b>Doctor Name:</b> '+result[0].name+'</p>';
													drMailHtml += '<p><b>Email:</b> '+result[0].email+'</p>';
													drMailHtml += '<p><b>Mobile No:</b> '+result[0].mobile_no+'</p>';
													
													var mailOptions = {
														from: process.env.MAIL_SENDER,
														to: adminResults[0].email,
														subject: 'New doctor registration',
														html: drMailHtml
													};
												
													mailerConfig.sendMail(mailOptions, function(mailError, mailInfo) {
														if (mailError) {
															return res.status(200).json({
																status: 0,
																message: mailError.response
															});
														}
														return res.status(200).json({
															status: 1,
															message: 'Register created successfully',
															data: data
														});
													});
												}else{
													return res.status(200).json({
														status: 1,
														message: 'Register created successfully',
														data: data
													});
												}
											});
										} catch (error) {
											return res.status(200).json({
												status: 0,
												message: error.message
											});
										}
									} else {
										return res.status(200).json({
											status: 1,
											message: 'Register created successfully',
											data: []
										});
									}
								});
							});
						}
					});
				}
			});
		} else {
			return res.status(200).json({
				status: 0,
				message: 'All Field Required'
			});
		}
	});
};
exports.register_mobile_chk = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"mobile_no": "required",
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var mobile_no = body.mobile_no;
			connectPool.query('SELECT * FROM user WHERE mobile_no ="' + mobile_no + '"', function (erro, result, field) {
				if (erro) {
					return res.status(200).json({
						status: 0,
						message: erro
					});
				}
				if (result.length > 0) {
					return res.status(200).json({
						status: 0,
						message: 'This Mobile No is already exist'
					});
				} else {
					return res.status(200).json({
						status: 1,
						message: '',
					});
				}
			});
		} else {
			return res.status(200).json({
				status: 0,
				message: 'All Field Required'
			});
		}
	});
};

exports.register_data_chk_doc = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"mobile_no": "required",
		"email": "required",
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var mobile_no = body.mobile_no;
			var email = body.email;
			connectPool.query('SELECT * FROM user WHERE mobile_no ="' + mobile_no + '"', function (erro, result, field) {
				if (erro) {
					return res.status(200).json({
						status: 0,
						message: erro
					});
				}
				if (result.length > 0) {
					return res.status(200).json({
						status: 0,
						message: 'This Mobile No is already exist'
					});
				} else {
					connectPool.query('SELECT * FROM user WHERE email ="' + email + '"', function (error1, result1, field1) {
						if (error1) {
							return res.status(200).json({
								status: 0,
								message: error1
							});
						}
						if (result1.length > 0) {
							return res.status(200).json({
								status: 0,
								message: 'Email already exist'
							});
						}else{
							return res.status(200).json({
								status: 1,
								message: '',
							});
						}
					});
				}
			});
		} else {
			return res.status(200).json({
				status: 0,
				message: 'All Field Required'
			});
		}
	});
};