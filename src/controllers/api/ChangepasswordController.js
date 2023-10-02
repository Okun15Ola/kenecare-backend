const { validationResult } = require("express-validator");
const validator = require('./helpers/validate');
const { compareSync, hashSync, genSaltSync } = require("bcryptjs");
exports.change_password = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"user_id": "required",
		"old_password": "required",
		"new_password": "required",
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var user_id = body.user_id;
			var old_password = body.old_password;
			var new_password = body.new_password;
			connectPool.query('SELECT * FROM user WHERE id = ' + user_id, (error, results, fields) => {
					if (results.length > 0) {
						const checkPass = compareSync(old_password, results[0].password);
						if (checkPass === true) {
							const salt = genSaltSync(10);
							new_password = hashSync(new_password, salt);
							var fieldsToUpdate = {};
							fieldsToUpdate['password'] = new_password;
							var sqlupdate = 'UPDATE user SET ? WHERE id  = ' + user_id;
							connectPool.query(sqlupdate, fieldsToUpdate, function (errors, results) {
								if (errors) {
									return res.status(200).json({
										status: 0,
										message: errors
									});
								}
								return res.status(200).json({
									status: 1,
									message: 'Password Update Successfully!'
								});
							});
						} else {
							return res.status(200).json({
								status: 0,
								message: 'Wrong Old Password!'
							});
						}
					} else {
						return res.status(200).json({
							status: 0,
							message: 'User not found!'
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