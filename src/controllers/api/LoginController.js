const { validationResult } = require("express-validator");
const validator = require('./helpers/validate');
const bcrypt = require('bcryptjs');
var fs = require('fs');
exports.login = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"mobile_no": "required",
		"password": "required",
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			try {
				var mobile_no = body.mobile_no;
				var password = body.password;
				if (mobile_no) {
					connectPool.query('SELECT * FROM user WHERE mobile_no ="' + mobile_no + '"', async function (error, results, fields) {
						if (error) {
							return res.status(200).json({
								status: 0,
								message: error
							});
						}
						if (results.length > 0) {
							const checkPass = bcrypt.compareSync(password, results[0].password);
							if (checkPass === true) {
								if(results[0].type == 2){
									if(results[0].doctor_approval_status === 0){
										return res.status(200).json({
											status: 0,
											message: 'Your account approval status is pending yet.'
										});
									}else if(results[0].doctor_approval_status === 2){
										return res.status(200).json({
											status: 0,
											message: 'Your account access has been denied by an administrator.'
										});
									}
								}
								
								try {
									// JWT Auth Token
									var userObj = new Object;
									userObj['id'] = results[0].id;
									const auth_token = await jwt.sign(userObj, jwtConfig.secret, { expiresIn: jwtConfig.accessTokenLife });
									var data = {};
									data['id'] = results[0].id;
									data['name'] = results[0].name;
									data['email'] = results[0].email;
									data['mobile_no'] = results[0].mobile_no;
									data['type'] = results[0].type;
									var img = BASE_URL + 'public/upload/placeholder.png';
									if (results[0].image != '') {
										var imagePath = 'public/upload/user/' + results[0].image;
										if (fs.existsSync(imagePath)) {
											var img = BASE_URL + 'public/upload/user/' + results[0].image;
										}
									}
									data['image'] = img;
									data['specialization_id'] = results[0].specialization_id;
									data['gender'] = results[0].gender;
									data['position'] = results[0].position;
									data['city_id'] = results[0].city_id;
									data['registration_number'] = results[0].registration_number;
									data['registration_council_id'] = results[0].registration_council_id;
									data['registration_year'] = results[0].registration_year;
									data['degree_id'] = results[0].degree_id;
									data['college'] = results[0].college;
									data['year_of_completion'] = results[0].year_of_completion;
									data['year_of_experience'] = results[0].year_of_experience;
									data['doctor_approval_status'] = results[0].doctor_approval_status;
									data['auth_token'] = auth_token;
									return res.status(200).json({
										status: 1,
										message: 'Logged in!',
										data: data
									});
								} catch (error) {
									return res.status(200).json({
										status: 0,
										message: error.message
									});
								}
							}else{
								return res.status(200).json({
									status: 0,
									message: 'Mobile No or password is incorrect!'
								});
							}
						} else {
							return res.status(200).json({
								status: 0,
								message: 'Mobile No or password is incorrect!'
							});
						}
						res.end();
					});
				} else {
					return res.status(200).json({
						status: 0,
						message: 'Please enter Mobile No and Password.'
					});
				}
			} catch (e) {
				next(e);
			}
		} else {
			return res.status(200).json({
				status: 0,
				message: 'All Field Required'
			});
		}
	});
};

exports.doctor_login = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"mobile_no": "required",
		"password": "required",
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			try {
				var mobile_no = body.mobile_no;
				var password = body.password;
				if (mobile_no) {
					connectPool.query('SELECT * FROM user WHERE type =2 and mobile_no ="' + mobile_no + '"', function (error, results, fields) {
						if (error) {
							return res.status(200).json({
								status: 0,
								message: error
							});
						}
						if (results.length > 0) {
							const checkPass = bcrypt.compareSync(password, results[0].password);
							if (checkPass === true) {
								var data = {};
								data['id'] = results[0].id;
								data['name'] = results[0].name;
								data['email'] = results[0].email;
								data['mobile_no'] = results[0].mobile_no;
								data['type'] = results[0].type;
								var img = BASE_URL + 'public/upload/placeholder.png';
								if (results[0].image != '') {
									var imagePath = 'public/upload/user/' + results[0].image;
									if (fs.existsSync(imagePath)) {
										var img = BASE_URL + 'public/upload/user/' + results[0].image;
									}
								}
								data['image'] = img;
								data['specialization_id'] = results[0].specialization_id;
								data['gender'] = results[0].gender;
								data['position'] = results[0].position;
								data['city_id'] = results[0].city_id;
								data['registration_number'] = results[0].registration_number;
								data['registration_council_id'] = results[0].registration_council_id;
								data['registration_year'] = results[0].registration_year;
								data['degree_id'] = results[0].degree_id;
								data['college'] = results[0].college;
								data['year_of_completion'] = results[0].year_of_completion;
								data['year_of_experience'] = results[0].year_of_experience;
								return res.status(200).json({
									status: 1,
									message: 'Logged in!',
									data: data
								});
							}
							return res.status(200).json({
								status: 0,
								message: 'Mobile No or password is incorrect!'
							});
						} else {
							return res.status(200).json({
								status: 0,
								message: 'Mobile No or password is incorrect!'
							});
						}
						res.end();
					});
				} else {
					return res.status(200).json({
						status: 0,
						message: 'Please enter Mobile No and Password.'
					});
				}
			} catch (e) {
				next(e);
			}
		} else {
			return res.status(200).json({
				status: 0,
				message: 'All Field Required'
			});
		}
	});
};

exports.login_otp = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"mobile_no": "required",
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			try {
				var mobile_no = body.mobile_no;
				if (mobile_no) {
					connectPool.query('SELECT * FROM user WHERE mobile_no ="' + mobile_no + '"', async function (error, results, fields) {
						if (error) {
							return res.status(200).json({
								status: 0,
								message: error
							});
						}
						if (results.length > 0) {
							if(results[0].type == 2){
								if(results[0].doctor_approval_status === 0){
									return res.status(200).json({
										status: 0,
										message: 'Your account approval status is pending yet.'
									});
								}else if(results[0].doctor_approval_status === 2){
									return res.status(200).json({
										status: 0,
										message: 'Your account access has been denied by an administrator.'
									});
								}
							}

							try {
								// JWT Auth Token
								var userObj = new Object;
								userObj['id'] = results[0].id;
								const auth_token = await jwt.sign(userObj, jwtConfig.secret, { expiresIn: jwtConfig.accessTokenLife });
	
								var data = {};
								data['id'] = results[0].id;
								data['name'] = results[0].name;
								data['email'] = results[0].email;
								data['mobile_no'] = results[0].mobile_no;
								data['type'] = results[0].type;
								var img = BASE_URL + 'public/upload/placeholder.png';
								if (results[0].image != '') {
									var imagePath = 'public/upload/user/' + results[0].image;
									if (fs.existsSync(imagePath)) {
										var img = BASE_URL + 'public/upload/user/' + results[0].image;
									}
								}
								data['image'] = img;
								data['specialization_id'] = results[0].specialization_id;
								data['gender'] = results[0].gender;
								data['position'] = results[0].position;
								data['city_id'] = results[0].city_id;
								data['registration_number'] = results[0].registration_number;
								data['registration_council_id'] = results[0].registration_council_id;
								data['registration_year'] = results[0].registration_year;
								data['degree_id'] = results[0].degree_id;
								data['college'] = results[0].college;
								data['year_of_completion'] = results[0].year_of_completion;
								data['year_of_experience'] = results[0].year_of_experience;
								data['doctor_approval_status'] = results[0].doctor_approval_status;
								data['auth_token'] = auth_token;
								return res.status(200).json({
									status: 1,
									message: 'Logged in!',
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
								status: 0,
								message: 'Mobile No is incorrect!'
							});
						}
						res.end();
					});
				} else {
					return res.status(200).json({
						status: 0,
						message: 'Please enter Mobile No.'
					});
				}
			} catch (e) {
				next(e);
			}
		} else {
			return res.status(200).json({
				status: 0,
				message: 'All Field Required'
			});
		}
	});
};

exports.notification = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"user_id": "required",
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var user_id = body.user_id;
			connectPool.query('SELECT * FROM chat_messages WHERE to_id ="' + user_id + '" and read_status=0', function (error, results, fields) {
				if (error) {
					return res.status(200).json({
						status: 0,
						message: error
					});
				}
				var count = results.length;
				return res.status(200).json({
					status: 1,
					message: '',
					count: count
				});
			});
		} else {
			return res.status(200).json({
				status: 0,
				message: 'All Field Required'
			});
		}
	});
};
