const { validationResult } = require("express-validator");
const validator = require('./helpers/validate');
const { getTimeSlots } = require('./helpers/common');
var fs = require("fs");
const e = require("express");

exports.saveFeedback = (req, res, next) => {
	const { body } = req;

	const validationRule = {
		"apt_id": "required",
		"feedback_val": "required",
		"apt_type": "required"
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var aptTableName = '';
			if(body.apt_type == 1){
				aptTableName = 'appointment';
			}else if(body.apt_type == 2){
				aptTableName = 'video_consultation';
			}
			connectPool.query('select * from '+aptTableName+' where id =' + body.apt_id, (error, results, fields) => {
				if (error) {
					return res.status(200).json({
						status: 0,
						message: error.sqlMessage
					});
				}
				if(results.length > 0){
					let sqlUpdate = 'UPDATE '+aptTableName+' SET feedback = "'+body.feedback_val+'" WHERE id =' + body.apt_id;
					connectPool.query(sqlUpdate, (updError, updResults, updFields) => {
						if (updError) {
							return res.status(200).json({
								status: 0,
								message: updError.sqlMessage
							});
						}
						id = updResults.insertId;
						return res.status(200).json({
							status: 1,
							message: 'Feedback has been saved successfully'
						});
					});
				}else{
					return res.status(200).json({
						status: 0,
						message: 'Data not found!'
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
exports.getFeedback = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"apt_id": "required",
		"apt_type": "required"
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var aptTableName = '';
			if(body.apt_type == 1){
				aptTableName = 'appointment';
			}else if(body.apt_type == 2){
				aptTableName = 'video_consultation';
			}
			connectPool.query('select id, feedback from '+aptTableName+' where id =' + body.apt_id + ' AND feedback IS NOT NULL ', (error, results, fields) => {
				if (error) {
					return res.status(200).json({
						status: 0,
						message: error.sqlMessage
					});
				}
				if(results.length > 0){
					return res.status(200).json({
						status: 1,
						message: "Data found!",
						data: results,
					});
				}else{
					return res.status(200).json({
						status: 0,
						message: 'Data not found!'
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

exports.getDoctorFeedback = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"doctor_id": "required"
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			let sql1 = 'SELECT a.feedback, b.name as patient_name, b.image as patient_image FROM appointment a LEFT JOIN user b ON a.user_id = b.id WHERE a.doctor_id =' + body.doctor_id + ' AND a.feedback IS NOT NULL';
			connectPool.query(sql1, (error1, results1, fields1) => {
				if (error1) {
					return res.status(200).json({
						status: 0,
						message: error1.sqlMessage
					});
				}
				
				let sql2 = 'SELECT a.feedback, b.name as patient_name, b.image as patient_image FROM video_consultation a LEFT JOIN user b ON a.user_id = b.id WHERE a.doctor_id =' + body.doctor_id + ' AND a.feedback IS NOT NULL';
				connectPool.query(sql2, (error2, results2, fields2) => {
					if (error2) {
						return res.status(200).json({
							status: 0,
							message: error2.sqlMessage
						});
					}
					if(results1.length > 0 || results2.length > 0){
						var data = [];
						for (var x = 0; x < results1.length; x++) {
							arr1 = {};
							arr1['feedback'] = results1[x].feedback;
							arr1['patient_name'] = results1[x].patient_name;
							var img = BASE_URL + 'public/upload/placeholder.png';
							if (results1[x].patient_image != '') {
								var imagePath = 'public/upload/user/' + results1[x].patient_image;
								if (fs.existsSync(imagePath)) {
									var img = BASE_URL + 'public/upload/user/' + results1[x].patient_image;
								}
							}
							arr1['patient_image'] = img;
							data.push(arr1);
						}

						for (var y = 0; y < results2.length; y++) {
							arr2 = {};
							arr2['feedback'] = results2[y].feedback;
							arr2['patient_name'] = results2[y].patient_name;
							var img = BASE_URL + 'public/upload/placeholder.png';
							if (results2[y].patient_image != '') {
								var imagePath = 'public/upload/user/' + results2[y].patient_image;
								if (fs.existsSync(imagePath)) {
									var img = BASE_URL + 'public/upload/user/' + results2[y].patient_image;
								}
							}
							arr2['patient_image'] = img;
							data.push(arr2);
						}

						return res.status(200).json({
							status: 1,
							message: "Data found!",
							data: data,
						});
					}else{
						return res.status(200).json({
							status: 0,
							message: 'Data not found!'
						});
					}
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