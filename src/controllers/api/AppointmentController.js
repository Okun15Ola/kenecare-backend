const { validationResult } = require("express-validator");
const validator = require('./helpers/validate');
const { getTimeSlots } = require('./helpers/common');
var fs = require("fs");

exports.appointment = (req, res, next) => {
	const { body } = req;

	const validationRule = {
		"user_id": "required",
		"doctor_id": "required",
		"symptoms": "required",
		"specialty": "required",
		"mobile_no": "required",
		"appointment_date": "required",
		"patient_name": "required",
		"selected_slot": "required",
		"booking_type": "required",
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			connectPool.query('select * from user where type=2 and id =' + body.doctor_id, (error, results, fields) => {
				if (error) {
					return res.status(200).json({
						status: 0,
						message: error
					});
				}
				if(results.length > 0){
					var start_time = body.selected_slot;
					const start_time_arr = start_time.split(":", 3);
					var end_time = (parseInt(start_time_arr[0]) + 1)+':'+start_time_arr[1]+':'+start_time_arr[2];
					
					let sqlInsert = 'INSERT INTO appointment SET user_id = '+body.user_id+', doctor_id = '+body.doctor_id+', symptoms = "'+body.symptoms+'", specialty = '+body.specialty+', mobile_no = "'+body.mobile_no+'", appointment_date = "'+body.appointment_date+'", patient_name = "'+body.patient_name+'", start_time = "'+start_time+'", end_time = "'+end_time+'", consultation_fee = '+results[0].consultation_fee+', booking_type = '+body.booking_type;
					connectPool.query(sqlInsert, (insError, insResults, insFields) => {
						if (insError) {
							return res.status(200).json({
								status: 0,
								message: insError
							});
						}
						id = insResults.insertId;

						// Save notification data
						const notif_title = 'Appointment booking';
						const notif_body = 'Your appointment (000'+id+') has been booked.';
						const notif_type = 'appointment';

						let sqlInsertNotif = 'INSERT INTO notifications SET user_id = '+body.user_id+', title = "'+notif_title+'", body = "'+notif_body+'", type = "'+notif_type+'" ';
						connectPool.query(sqlInsertNotif, (insNotifError, insNotifResults, insNotifFields) => {
							if (insNotifError) {
								return res.status(200).json({
									status: 0,
									message: insNotifError.sqlMessage
								});
							}
							const notif_title1 = 'Appointment booking';
							const notif_body1 = 'New appointment (000'+id+') has been booked.';
							const notif_type1 = 'appointment';
							let sqlInsertNotif1 = 'INSERT INTO notifications SET user_id = '+body.doctor_id+', title = "'+notif_title1+'", body = "'+notif_body1+'", type = "'+notif_type1+'" ';
							connectPool.query(sqlInsertNotif1, (insNotifError1, insNotifResults1, insNotifFields1) => {
								if (insNotifError1) {
									return res.status(200).json({
										status: 0,
										message: insNotifError1.sqlMessage
									});
								}
								let sqlUser = 'select * from user where type=1 and id =' + body.user_id;
								connectPool.query(sqlUser, (userError, userResults, userFields) => {
									if (userError) {
										return res.status(200).json({
											status: 0,
											message: userError.sqlMessage
										});
									}
	
									if(userResults[0].email !== null && results[0].email !== null){
										// Send patient email
										var aptMailHtml='<p>Your appointment has been booked with <b>Dr. '+results[0].name+'</b> on <b>'+body.appointment_date+' '+start_time+'-'+end_time+'</b>.</p>';
								
										var mailOptions = {
											from: process.env.MAIL_SENDER,
											to: userResults[0].email,
											subject: 'Appointment Booking',
											html: aptMailHtml
										};
									
										mailerConfig.sendMail(mailOptions, function(mailError, mailInfo) {
											if (mailError) {
												return res.status(200).json({
													status: 0,
													message: mailError.response
												});
											}
											if(results[0].email !== ''){
												// Send doctor email
												var aptMailHtml='<p>New appointment has been booked by <b>'+userResults[0].name+'</b> on <b>'+body.appointment_date+' '+start_time+'-'+end_time+'.</b></p>';
										
												var mailOptions = {
													from: process.env.MAIL_SENDER,
													to: results[0].email,
													subject: 'Appointment Booking',
													html: aptMailHtml
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
														message: 'Appointment has been booked successfully'
													});
												});
											}
											return res.status(200).json({
												status: 1,
												message: 'Appointment has been booked successfully'
											});
										});
									}else{
										return res.status(200).json({
											status: 1,
											message: 'Appointment has been booked successfully'
										});
									}
								});
							});
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
exports.checkDoctorAppointments = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"specialty": "required",
		"appointment_date": "required"
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			let sql = 'SELECT a.*, a.id as doctor_id, c.name as specialty FROM user a LEFT JOIN specialization c ON a.specialization_id = c.id WHERE a.type = 2 AND a.specialization_id = ' + body.specialty + ' AND (a.doc_morning_start_time <> "" AND a.doc_morning_end_time <> "" AND a.doc_evening_start_time <> "" AND a.doc_evening_end_time <> "") ORDER BY a.id DESC';
			connectPool.query(sql, (error, results, fields) => {
				if (error) {
					return res.status(200).json({
						status: 0,
						message: error
					});
				}
				if (results.length > 0) {
					var data = [];
					var i = 0;
					for (var x = 0; x < results.length; x++) {
						let ts = getTimeSlots(results[x].doc_morning_start_time, results[x].doc_morning_end_time, results[x].doc_evening_start_time, results[x].doc_evening_end_time, body.appointment_date);
						let total_ts = ts.morning_time_slots.concat(ts.evening_time_slots);
						// console.log('TimeSlots: ', total_ts);
						var booked_slot_count = 0;
						total_ts.forEach(element => {
							if((element == results[x].start_time) && (results[x].appointment_date == body.appointment_date)){
								booked_slot_count++;
							}
						});
						arr = {};
						arr = results[x];
						if (booked_slot_count === total_ts.length) {
							arr["is_full_booked"] = 1;
						}else{
							arr["is_full_booked"] = 0;
						}
						data.push(arr);
						i++;
					}
					// console.log('Modified Arr: ', data);
					return res.status(200).json({
						status: 1,
						message: "Data found!",
						data: data,
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
				message: 'All Field Required'
			});
		}
	});
};
exports.getAppointments = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"user_id": "required",
		"type": "required"
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var filterSingle = '';
			if(body.id){
				filterSingle = 'AND a.id='+body.id;
			}
			if(body.type == 1){
				var sql = 'SELECT a.*, a.specialty as specialty_id, c.image as doctor_image, b.name, c.name as doctor_name, COALESCE(d.name, "") as specialty, DATE_FORMAT(a.appointment_date, "%d %b %Y") as appointment_date, DATE_FORMAT(a.start_time, "%h:%i %p") as appointment_time, DATE_FORMAT(a.end_time, "%h:%i %p") as appointment_end_time, DATE_FORMAT(a.created_at, "%d %b %Y") as booking_date, a.consultation_fee as amount, a.booking_type, a.user_id as patient_id, a.feedback, DATE_FORMAT(a.appointment_date, "%Y-%m-%d") as appointment_date_og FROM appointment a LEFT JOIN user b ON a.user_id = b.id LEFT JOIN user c ON a.doctor_id = c.id LEFT JOIN specialization d ON c.specialization_id = d.id WHERE a.user_id = ' + body.user_id + ' AND b.type=1 ' + filterSingle + ' ORDER BY a.appointment_date DESC, a.start_time ASC';
			}else if(body.type == 2){
				var sql = 'SELECT a.*, a.specialty as specialty_id, b.image as doctor_image, b.name, c.name as patient_name, c.mobile_no, COALESCE(d.name, "") as specialty, DATE_FORMAT(a.appointment_date, "%d %b %Y") as appointment_date, DATE_FORMAT(a.start_time, "%h:%i %p") as appointment_time, DATE_FORMAT(a.end_time, "%h:%i %p") as appointment_end_time, DATE_FORMAT(a.created_at, "%d %b %Y") as booking_date, a.consultation_fee as amount, a.booking_type, a.user_id as patient_id, a.feedback, DATE_FORMAT(a.appointment_date, "%Y-%m-%d") as appointment_date_og FROM appointment a LEFT JOIN user b ON a.doctor_id = b.id LEFT JOIN user c ON a.user_id = c.id LEFT JOIN specialization d ON b.specialization_id = d.id WHERE a.doctor_id = ' + body.user_id + ' AND b.type=2 ' + filterSingle + ' ORDER BY a.appointment_date DESC, a.start_time ASC';
			}
			connectPool.query(sql, (error, results, fields) => {
				if (error) {
					return res.status(200).json({
						status: 0,
						message: error
					});
				}
				if (results.length > 0) {
					var data = [];
					var i = 0;
					for (var x = 0; x < results.length; x++) {
						arr = {};
						arr = results[x];
						var img = BASE_URL + 'public/upload/placeholder.png';
						if (results[x].doctor_image != '') {
							var imagePath = 'public/upload/user/' + results[x].doctor_image;
							if (fs.existsSync(imagePath)) {
								var img = BASE_URL + 'public/upload/user/' + results[x].doctor_image;
							}
						}
						arr['doctor_image'] = img;
						data.push(arr);
						i++;
					}
					return res.status(200).json({
						status: 1,
						message: "Data found!",
						data: data,
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
exports.edit_appointment = (req, res, next) => {
	const { body } = req;

	const validationRule = {
		"user_id": "required",
		"doctor_id": "required",
		"appointment_date": "required",
		"selected_slot": "required",
		"booking_type": "required",
		"apt_id": "required",
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			connectPool.query('select * from user where type=2 and id =' + body.doctor_id, (error, results, fields) => {
				if (error) {
					return res.status(200).json({
						status: 0,
						message: error
					});
				}
				if(results.length > 0){
					var start_time = body.selected_slot;
					const start_time_arr = start_time.split(":", 3);
					var end_time = (parseInt(start_time_arr[0]) + 1)+':'+start_time_arr[1]+':'+start_time_arr[2];
					
					let sqlUpdate = 'UPDATE appointment SET appointment_date = "'+body.appointment_date+'", start_time = "'+start_time+'", end_time = "'+end_time+'"  WHERE id = '+body.apt_id+' AND user_id = '+body.user_id;
					connectPool.query(sqlUpdate, (updError, updResults, updFields) => {
						if (updError) {
							return res.status(200).json({
								status: 0,
								message: updError
							});
						}
						return res.status(200).json({
							status: 1,
							message: 'Appointment has been updated successfully'
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
exports.update_appointment_status = (req, res, next) => {
	const { body } = req;

	const validationRule = {
		"user_id": "required",
		"apt_id": "required",
		"apt_status": "required",
		"booking_type": "required"
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			connectPool.query('select * from user where type=1 and id =' + body.user_id, (error, results, fields) => {
				if (error) {
					return res.status(200).json({
						status: 0,
						message: error
					});
				}
				if(results.length > 0){
					let sqlUpdate = 'UPDATE appointment SET appointment_status = "'+body.apt_status+'", cancelled_at = NOW(), is_refund = '+body.is_refund+' WHERE id = '+body.apt_id+' AND user_id = '+body.user_id+' AND booking_type = '+body.booking_type;
					connectPool.query(sqlUpdate, (updError, updResults, updFields) => {
						if (updError) {
							return res.status(200).json({
								status: 0,
								message: updError
							});
						}
						return res.status(200).json({
							status: 1,
							message: 'Appointment status has been updated successfully'
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

exports.getMonthWiseAppointmentsCount = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"user_id": "required"
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			// var sql = 'SELECT YEAR(appointment_date) AS apt_year, MONTH(appointment_date) AS apt_month, COUNT(DISTINCT id) as total_apt FROM appointment WHERE booking_type = 1 AND doctor_id = '+body.user_id+' AND YEAR(appointment_date) = year(curdate()) GROUP BY apt_year, apt_month';
			var sql = 'SELECT DATE_FORMAT(appointment_date,"%Y-%m-%d") as appointment_date, DATE(appointment_date) AS apt_date, COUNT(DISTINCT id) as total_apt FROM appointment WHERE booking_type = 1 AND doctor_id = '+body.user_id+' GROUP BY apt_date';
			// console.log(sql);
			connectPool.query(sql, (error, results, fields) => {
				if (error) {
					return res.status(200).json({
						status: 0,
						message: error
					});
				}
				if (results.length > 0) {
					/* OLD Start */
					/* var data = [];
					for (let i = 1; i <= 12; i++) {
						arr = {};
						arr['apt_month'] = i;
						var total_apt = 0;
						for (var x = 0; x < results.length; x++) {
							if(results[x].apt_month == i){
								total_apt = results[x].total_apt;
							}
						}
						arr['total_apt'] = total_apt;
						data.push(arr);
					} */
					/* OLD End */
					var data = [];
					for (var x = 0; x < results.length; x++) {
						arr = {};
						arr['apt_date'] = results[x].appointment_date;
						arr['total_apt'] = results[x].total_apt;
						data.push(arr);
					}
					return res.status(200).json({
						status: 1,
						message: "Data found!",
						data: data,
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

exports.saveUserBankDetails = (req, res, next) => {
	const { body } = req;

	const validationRule = {
		"user_id": "required",
		"account_holder_name": "required",
		"email": "required",
		"bank_name": "required",
		"account_number": "required",
		"swift_code": "required",
		"branch": "required"
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			connectPool.query('select * from user_bank_details where user_id =' + body.user_id, (error, results, fields) => {
				if (error) {
					return res.status(200).json({
						status: 0,
						message: error.sqlMessage
					});
				}
				if(results.length <= 0){
					let sqlInsert = 'INSERT INTO user_bank_details SET user_id = '+body.user_id+', account_holder_name = "'+body.account_holder_name+'", email = "'+body.email+'", bank_name = "'+body.bank_name+'", account_number = "'+body.account_number+'", swift_code = "'+body.swift_code+'", branch = "'+body.branch+'" ';
					connectPool.query(sqlInsert, (insError, insResults, insFields) => {
						if (insError) {
							return res.status(200).json({
								status: 0,
								message: insError.sqlMessage
							});
						}
						id = insResults.insertId;
						return res.status(200).json({
							status: 1,
							message: 'Data has been saved successfully!'
						});
					});
				}else{
					let sqlInsert = 'UPDATE user_bank_details SET account_holder_name = "'+body.account_holder_name+'", email = "'+body.email+'", bank_name = "'+body.bank_name+'", account_number = "'+body.account_number+'", swift_code = "'+body.swift_code+'", branch = "'+body.branch+'" WHERE user_id = '+body.user_id+' ';
					connectPool.query(sqlInsert, (insError, insResults, insFields) => {
						if (insError) {
							return res.status(200).json({
								status: 0,
								message: insError.sqlMessage
							});
						}
						id = insResults.insertId;
						return res.status(200).json({
							status: 1,
							message: 'Data has been saved successfully!'
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

exports.getUserBankDetails = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"user_id": "required"
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var sql = 'SELECT * FROM user_bank_details WHERE user_id = '+body.user_id+' AND status = 1 LIMIT 1';
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
