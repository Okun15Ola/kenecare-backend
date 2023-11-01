const { validationResult } = require("express-validator");
const validator = require('./helpers/validate');
const { getTimeSlots } = require('./helpers/common');
var fs = require("fs");

exports.getNotifications = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"user_id": "required"
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var sql = 'SELECT *, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i") as created_at FROM notifications WHERE user_id = '+body.user_id+' AND status = 1 ORDER BY id DESC';
			// console.log(sql);
			connectPool.query(sql, (error, results, fields) => {
				if (error) {
					return res.status(200).json({
						status: 0,
						message: error
					});
				}
				if (results.length > 0) {
					return res.status(200).json({
						status: 1,
						message: "Data found!",
						data: results
					});
				} else {
					return res.status(200).json({
						status: 0,
						message: "Data not found!",
					});
				}
			});
		} else {
			return res.status(200).json({
				status: 0,
				message: err
			});
		}
	});
};
