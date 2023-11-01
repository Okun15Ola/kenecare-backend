const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");
const { getTimeSlots } = require("./helpers/common");
var fs = require("fs");
const KJUR = require("jsrsasign");
const axios = require("axios").default;
const encode = require('html-entities');
var multer = require('multer');
var fs = require('fs');

function htmlEntitiesEncode(str) {
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function htmlEntitiesDecode(str) {
	return String(str).replace('&amp;', /&/g).replace('&lt;', /</g).replace('&gt;', />/g).replace('&quot;', /"/g);
}

exports.saveVideoConsultantData = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		user_id: "required",
		specialty: "required",
		symptoms: "required",
		mobile_no: "required",
		patient_name: "required",
		doctor_id: "required",
	};
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			connectPool.query(
				"select * from user where type=1 and id =" + body.user_id,
				(errorUser, resultsUser, fieldsUser) => {
					if (errorUser) {
						return res.status(200).json({
							status: 0,
							message: errorUser,
						});
					}
					if (resultsUser.length > 0) {
						connectPool.query("select * from user where type=2 and id =" + body.doctor_id,(error, results, fields) => {
							if (error) {
								return res.status(200).json({
									status: 0,
									message: error,
								});
							}
							if (results.length > 0) {
								let sqlInsert = "INSERT INTO video_consultation SET user_id = " + body.user_id + ", doctor_id = " + body.doctor_id +', symptoms = "' + body.symptoms +'", specialty = ' + body.specialty + ', mobile_no = "' + body.mobile_no + '", patient_name = "' + body.patient_name + '", consultation_fee = ' + results[0].consultation_fee;
								connectPool.query(sqlInsert, (insError, insResults, insFields) => {
									if (insError) {
										return res.status(200).json({
											status: 0,
											message: insError,
										});
									}
									id = insResults.insertId;

									// Save notification data
									const notif_title = 'Video Consultation';
									const notif_body = 'Your video consultation has been created successfully.';
									const notif_type = 'video_consultation';

									let sqlInsertNotif = 'INSERT INTO notifications SET user_id = '+body.user_id+', title = "'+notif_title+'", body = "'+notif_body+'", type = "'+notif_type+'" ';
									connectPool.query(sqlInsertNotif, (insNotifError, insNotifResults, insNotifFields) => {
										if (insNotifError) {
											return res.status(200).json({
												status: 0,
												message: insNotifError.sqlMessage
											});
										}
										// Send patient email
										var vcMailHtml='<p>Your video consultation with <b>Dr. '+results[0].name+'</b> has been created successfully.</p>';
											
										var mailOptions = {
											from: process.env.MAIL_SENDER,
											to: resultsUser[0].email,
											subject: 'Video Consultation',
											html: vcMailHtml
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
												message: "Video consultation data has been saved successfully",
											});
										});
									});

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
							message: "User not found!",
						});
					}
				}
			);
		} else {
			return res.status(200).json({
				status: 0,
				message: "All Field Required",
			});
		}
	});
};
exports.getVideoConsultantData = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		user_id: "required",
		type: "required",
	};
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var filterSingle = "";
			if (body.id) {
				filterSingle = "AND a.id=" + body.id;
			}

			if (body.type == 1) { // Get Doctor List
				var filterGroup = "";
				if (body.list_type && body.list_type == 'chat') {
					filterGroup = " GROUP BY a.doctor_id";
				}
				var sql = 'SELECT a.id, c.image as doctor_image, b.name, c.name as doctor_name, COALESCE(d.name, "") as specialty, a.consultation_fee as amount, DATE_FORMAT(a.created_at, "%d %b %Y") as payment_date, c.id as doctor_id, a.user_id, a.feedback FROM video_consultation a LEFT JOIN user b ON a.user_id = b.id LEFT JOIN user c ON a.doctor_id = c.id LEFT JOIN specialization d ON c.specialization_id = d.id WHERE a.user_id = ' + body.user_id + " AND b.type=1 " + filterSingle + " " + filterGroup + " ORDER BY a.id DESC";
			} else if (body.type == 2) { // Get Patient List
				var filterGroup = "";
				if (body.list_type && body.list_type == 'chat') {
					filterGroup = " GROUP BY a.user_id";
				}
				var sql = 'SELECT a.id, b.image as doctor_image, b.name, c.name as patient_name, c.image as patient_image, c.mobile_no, COALESCE(d.name, "") as specialty, a.consultation_fee as amount, DATE_FORMAT(a.created_at, "%d %b %Y") as payment_date, c.id as patient_id, a.user_id, a.feedback FROM video_consultation a LEFT JOIN user b ON a.doctor_id = b.id LEFT JOIN user c ON a.user_id = c.id LEFT JOIN specialization d ON b.specialization_id = d.id WHERE a.doctor_id = ' + body.user_id + " AND b.type=2 " + filterSingle + " " + filterGroup + " ORDER BY a.id DESC";
			}
			connectPool.query(sql, (error, results, fields) => {
				if (error) {
					return res.status(200).json({
						status: 0,
						message: error,
					});
				}
				if (results.length > 0) {
					var data = [];
					var i = 0;
					for (var x = 0; x < results.length; x++) {
						arr = {};
						arr = results[x];
						arr['doctor_name'] = (results[x].doctor_name) ? results[x].doctor_name : "";
						var doctor_image = BASE_URL + "public/upload/placeholder.png";
						if (results[x].doctor_image != "") {
							var imagePath = "public/upload/user/" + results[x].doctor_image;
							if (fs.existsSync(imagePath)) {
								var doctor_image = BASE_URL + "public/upload/user/" + results[x].doctor_image;
							}
						}

						var patient_image = BASE_URL + "public/upload/placeholder.png";
						if (results[x].patient_image != "") {
							var imagePath = "public/upload/user/" + results[x].patient_image;
							if (fs.existsSync(imagePath)) {
								var patient_image = BASE_URL + "public/upload/user/" + results[x].patient_image;
							}
						}
						arr["doctor_image"] = doctor_image;
						arr["patient_image"] = patient_image;
						arr["patient_name"] = (results[x].patient_name !== null) ? results[x].patient_name : '';
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
				message: err,
			});
		}
	});
};
exports.send_msg = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		from_id: "required",
		to_id: "required",
		msg: "required",
	};
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			let sqlInsert =
				"INSERT INTO chat_messages SET from_id = " +
				body.from_id +
				", to_id = " +
				body.to_id +
				', message = "' +
				body.msg +
				'" ';
			connectPool.query(sqlInsert, (insError, insResults, insFields) => {
				if (insError) {
					return res.status(200).json({
						status: 0,
						message: insError,
					});
				}
				let id = insResults.insertId;
				let sql =
					"select a.from_id, a.to_id, a.message, a.created_at as sent_at, b.name as from_user_name, b.image as from_user_image from chat_messages a LEFT JOIN user b ON a.from_id = b.id where a.id =" +
					id;
				connectPool.query(sql, (error, results, fields) => {
					if (error) {
						return res.status(200).json({
							status: 0,
							message: error,
						});
					}
					return res.status(200).json({
						status: 1,
						message: "Message has been sent successfully",
						data: results,
					});
				});
			});
		} else {
			return res.status(200).json({
				status: 0,
				message: "All Field Required",
			});
		}
	});
};
exports.getall_message = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		from_id: "required",
		to_id: "required",
	};
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var from_id = body.from_id;
			var to_id = body.to_id;
			if (from_id != "" && to_id != "") {
				connectPool.query(
					"select cht.id, cht.from_id, cht.to_id, cht.message, DATE_FORMAT(cht.created_at, '%d/%m/%Y %H:%i:%s') AS msgdate,usr.image, usr.name as fromfname from chat_messages cht INNER JOIN user usr ON cht.from_id = usr.id where ((cht.from_id = '" +
					from_id +
					"' AND cht.to_id = '" +
					to_id +
					"') OR (cht.from_id = '" +
					to_id +
					"' AND cht.to_id = '" +
					from_id +
					"')) ORDER BY cht.id ASC",
					(error, results, fields) => {
						if (results.length > 0) {
							if (error) {
								return res.status(200).json({
									status: 0,
									message: error,
									result: "",
								});
							}
							var data = [];
							var i = 0;
							for (var x = 0; x < results.length; x++) {
								let sqlInsert =
									'update chat_messages SET read_status = 1 where id="' +
									results[x].id +
									'" and to_id="' +
									from_id +
									'"';
								connectPool.query(
									sqlInsert,
									(insError, insResults, insFields) => {
										if (insError) {
											/*return res.status(200).json({
															  status: 0,
															  message: insError
														  });*/
										}
									}
								);
								arr = {};
								arr["id"] = results[x].id;
								arr["from_id"] = results[x].from_id;
								arr["to_id"] = results[x].to_id;
								arr["message"] = results[x].message;
								arr["msgdate"] = results[x].msgdate;
								arr["image"] = results[x].image;
								arr["fromfname"] = results[x].fromfname;
								data.push(arr);
								i++;
							}
							return res.status(200).json({
								status: 1,
								message: "Data found!",
								result: data,
							});
						} else {
							return res.status(200).json({
								status: 0,
								message: "Data not found!",
								result: "",
							});
						}
					}
				);
			} else {
				return res.status(200).json({
					status: 0,
					message: "Data not found!",
					result: "",
				});
			}
		} else {
			return res.status(200).json({
				status: 0,
				message: "All Field Required",
				result: "",
			});
		}
	});
};
exports.getlive_message = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		from_id: "required",
		to_id: "required",
		len: "required",
	};
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var from_id = body.from_id;
			var to_id = body.to_id;
			var length = body.len;
			if (from_id != "" && to_id != "" && length >= 0) {
				connectPool.query(
					"select cht.id, cht.from_id, cht.to_id, cht.message, DATE_FORMAT(cht.created_at, '%d/%m/%Y %H:%i:%s') AS msgdate,usr.image, usr.name as fromfname from chat_messages cht INNER JOIN user usr ON cht.from_id = usr.id where ((cht.from_id = '" +
					from_id +
					"' AND cht.to_id = '" +
					to_id +
					"') OR (cht.from_id = '" +
					to_id +
					"' AND cht.to_id = '" +
					from_id +
					"')) ORDER BY cht.id ASC limit " +
					length +
					",100",
					(error, results, fields) => {
						if (error) {
							return res.status(200).json({
								status: 0,
								message: error,
								result: "",
							});
						}
						if (results.length > 0) {
							var data = [];
							var i = 0;
							for (var x = 0; x < results.length; x++) {
								let sqlInsert =
									'update chat_messages SET read_status = 1 where id="' +
									results[x].id +
									'" and to_id="' +
									from_id +
									'"';
								connectPool.query(
									sqlInsert,
									(insError, insResults, insFields) => {
										if (insError) {
											// return res.status(200).json({
											// 	status: 0,
											// 	message: insError
											// });
										}
									}
								);
								if (results[x].from_id != from_id) {
									arr = {};
									arr["id"] = results[x].id;
									arr["from_id"] = results[x].from_id;
									arr["to_id"] = results[x].to_id;
									arr["message"] = results[x].message;
									arr["msgdate"] = results[x].msgdate;
									arr["image"] = results[x].image;
									arr["fromfname"] = results[x].fromfname;
									//arr['image']=BASE_URL+'public/upload/blog/'+results[x].image;
									data.push(arr);
									i++;
								}
							}
							return res.status(200).json({
								status: 1,
								message: "Data found!",
								result: data,
							});
						} else {
							return res.status(200).json({
								status: 0,
								message: "Data not found!",
								result: "",
							});
						}
					}
				);
			} else {
				return res.status(200).json({
					status: 0,
					message: "Data not found!",
					result: "",
				});
			}
		} else {
			return res.status(200).json({
				status: 0,
				message: "All Field Required",
				result: "",
			});
		}
	});
};

exports.get_unread_message_count = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		user_id: "required",
	};
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			let sql = "select COUNT(id) as total_unread_msgs from chat_messages where to_id = '" + body.user_id + "' AND read_status = 0 ORDER BY id ASC";
			connectPool.query(sql, (error, results, fields) => {
				if (error) {
					return res.status(200).json({
						status: 0,
						message: error,
						result: "",
					});
				}
				if (results.length > 0) {
					return res.status(200).json({
						status: 1,
						message: "Data found!",
						result: results,
					});
				} else {
					return res.status(200).json({
						status: 0,
						message: "Data not found!",
						result: "",
					});
				}
			}
			);
		} else {
			return res.status(200).json({
				status: 0,
				message: "All Field Required",
				result: "",
			});
		}
	});
};
/* Zoom API Start */
exports.generateSignature = (req, res, next) => {
	const iat = Math.round(new Date().getTime() / 1000) - 30;
	const exp = iat + 60 * 60 * 2;
	const oHeader = { alg: "HS256", typ: "JWT" };
	const oPayload = {
		sdkKey: process.env.ZOOM_SDK_KEY,
		mn: req.body.meetingNumber,
		role: req.body.role,
		iat: iat,
		exp: exp,
		appKey: process.env.ZOOM_SDK_KEY,
		tokenExp: iat + 60 * 60 * 2,
	};
	const sHeader = JSON.stringify(oHeader);
	const sPayload = JSON.stringify(oPayload);
	const signature = KJUR.jws.JWS.sign(
		"HS256",
		sHeader,
		sPayload,
		process.env.ZOOM_SDK_SECRET
	);
	return res.status(200).json({
		status: 1,
		message: "Signature generated successfully!",
		data: signature,
	});
};
exports.createZoomMeeting = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		topic: "required",
		type: "required",
		private_meeting_settings: "required",
		join_before_host_settings: "required",
	};
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {

			// Check zoom user
			let sql = "SELECT * FROM user WHERE id = " + body.from_id;
			connectPool.query(sql, (zuError, zuResults, zuFields) => {
				if (zuError) {
					return res.status(200).json({
						status: 0,
						message: zuError,
					});
				}

				if (zuResults.length > 0) {
					if (zuResults[0].doc_zoom_user_id !== null) {
						// Create zoom meeting
						let payload = {
							topic: body.topic,
							type: body.type,
							password: body.password,
							settings: {
								private_meeting: body.private_meeting_settings,
								join_before_host: body.join_before_host_settings,
								participant_video: body.participant_video,
								host_video: body.host_video
							},
						};
						let zoom_user_id = zuResults[0].doc_zoom_user_id;
						axios.post(process.env.ZOOM_API_URL + "/users/" + zoom_user_id + "/meetings", payload, {
							headers: {
								Authorization: "Bearer " + process.env.ZOOM_ACCESS_TOKEN,
								"Content-Type": "application/json",
							},
						})
							.then(function (response) {
								var result = [];
								arr = {};
								arr["host_email"] = response.data.host_email;
								arr["topic"] = response.data.topic;
								arr["type"] = response.data.type;
								arr["status"] = response.data.status;
								arr["start_time"] = response.data.start_time;
								arr["duration"] = response.data.duration;
								arr["start_url"] = response.data.start_url;
								arr["join_url"] = response.data.join_url;
								arr["meeting_id"] = response.data.id;
								arr["password"] = response.data.password;
								result.push(arr);
								// Save meeting url in chat
								let join_url = response.data.join_url;
								const meetingID = response.data.id;
								const meetingPWD = response.data.password;
								var mParams = meetingID + '|' + meetingPWD;
								// var mParams = 'data-meeting="'+response.data.id+'" data-passcode="'+response.data.password+'"';
								var encParams = Buffer.from(mParams.toString(), "utf8").toString("base64");
								var meeting_type = body.meeting_type;
								let rawMessage = '<a href="javascript:;" class="btn btn-dark join_meeting" data-meeting="' + encParams + '">Join ' + meeting_type.charAt(0).toUpperCase() + meeting_type.slice(1) + '</a>';
								var message = htmlEntitiesEncode(rawMessage);
								let sqlInsert = "INSERT INTO chat_messages SET from_id = " + body.from_id + ", to_id = " + body.to_id + ', message = "' + message + '" ';
								connectPool.query(sqlInsert, (insError, insResults, insFields) => {
									if (insError) {
										return res.status(200).json({
											status: 0,
											message: insError,
										});
									}
									return res.status(200).json({
										status: 1,
										message: "Meeting has been created successfully!",
										data: result,
									});
								});
							})
							.catch(function (error) {
								return res.status(200).json({
									status: 0,
									message: error.response.data.message,
								});
							});
					} else {
						// Create zoom user
						const nameArr = (zuResults[0].name).split(' ');
						let first_name = nameArr[0];
						let last_name = nameArr[1];
						let payloadUser = {
							action: "custCreate",
							user_info: {
								email: zuResults[0].email,
								type: 1,
								first_name: first_name,
								last_name: last_name,
								password: "12345678",
								feature: {
									zoom_phone: false
								}
							}
						};
						axios.post(process.env.ZOOM_API_URL + "/users", payloadUser, {
							headers: {
								Authorization: "Bearer " + process.env.ZOOM_ACCESS_TOKEN,
								"Content-Type": "application/json",
							},
						})
							.then(function (response) {
								const zoomUserID = response.data.id;
								let sqlUpdate = "UPDATE user SET doc_zoom_user_id = '" + zoomUserID + "' WHERE id = " + body.from_id;
								connectPool.query(sqlUpdate, (updError, updResults, updFields) => {
									if (updError) {
										return res.status(200).json({
											status: 0,
											message: updError,
										});
									}

									// Create zoom meeting
									let payload = {
										topic: body.topic,
										type: body.type,
										password: body.password,
										settings: {
											private_meeting: body.private_meeting_settings,
											join_before_host: body.join_before_host_settings,
											participant_video: body.participant_video,
											host_video: body.host_video
										},
									};
									let zoom_user_id = zoomUserID;
									axios.post(process.env.ZOOM_API_URL + "/users/" + zoom_user_id + "/meetings", payload, {
										headers: {
											Authorization: "Bearer " + process.env.ZOOM_ACCESS_TOKEN,
											"Content-Type": "application/json",
										},
									})
										.then(function (response) {
											var result = [];
											arr = {};
											arr["host_email"] = response.data.host_email;
											arr["topic"] = response.data.topic;
											arr["type"] = response.data.type;
											arr["status"] = response.data.status;
											arr["start_time"] = response.data.start_time;
											arr["duration"] = response.data.duration;
											arr["start_url"] = response.data.start_url;
											arr["join_url"] = response.data.join_url;
											arr["meeting_id"] = response.data.id;
											arr["password"] = response.data.password;
											result.push(arr);
											// Save meeting url in chat
											let join_url = response.data.join_url;
											const meetingID = response.data.id;
											const meetingPWD = response.data.password;
											var mParams = meetingID + '|' + meetingPWD;
											// var mParams = 'data-meeting="'+response.data.id+'" data-passcode="'+response.data.password+'"';
											var encParams = Buffer.from(mParams.toString(), "utf8").toString("base64");
											var meeting_type = body.meeting_type;
											let rawMessage = '<a href="javascript:;" class="btn btn-dark join_meeting" data-meeting="' + encParams + '">Join ' + meeting_type.charAt(0).toUpperCase() + meeting_type.slice(1) + '</a>';
											var message = htmlEntitiesEncode(rawMessage);
											let sqlInsert = "INSERT INTO chat_messages SET from_id = " + body.from_id + ", to_id = " + body.to_id + ', message = "' + message + '" ';
											connectPool.query(sqlInsert, (insError, insResults, insFields) => {
												if (insError) {
													return res.status(200).json({
														status: 0,
														message: insError,
													});
												}
												return res.status(200).json({
													status: 1,
													message: "Meeting has been created successfully!",
													data: result,
												});
											});
										})
										.catch(function (error) {
											return res.status(200).json({
												status: 0,
												message: error.response.data.message,
											});
										});
								});
							})
							.catch(function (error) {
								return res.status(200).json({
									status: 0,
									message: error.response.data.message,
								});
							});
					}
				}
			});
		} else {
			return res.status(200).json({
				status: 0,
				message: "All Field Required",
			});
		}
	});
};
exports.deleteZoomMeeting = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		meeting_id: "required",
		user_id: "required"
	};
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			axios.delete(process.env.ZOOM_API_URL + '/meetings/' + body.meeting_id, {
				headers: {
					Authorization: "Bearer " + process.env.ZOOM_ACCESS_TOKEN,
					"Content-Type": "application/json",
				},
			})
				.then(function (response) {
					let sqlUpdate = "UPDATE user SET current_zoom_meeting_signature = '' WHERE id = " + body.user_id;
					connectPool.query(sqlUpdate, (updError, updResults, updFields) => {
						if (updError) {
							return res.status(200).json({
								status: 0,
								message: updError,
							});
						}

						return res.status(200).json({
							status: 1,
							message: "Meeting has been deleted successfully!",
							data: [],
						});
					});

				})
				.catch(function (error) {
					return res.status(200).json({
						status: 0,
						message: error.message,
					});
				});
		} else {
			return res.status(200).json({
				status: 0,
				message: "All Field Required",
			});
		}
	});
};
exports.saveZoomMeetingSignature = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		signature: "required",
		user_id: "required"
	};
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			let sqlUpdate = "UPDATE user SET current_zoom_meeting_signature = '" + body.signature + "' WHERE id = " + body.user_id;
			connectPool.query(sqlUpdate, (updError, updResults, updFields) => {
				if (updError) {
					return res.status(200).json({
						status: 0,
						message: updError,
					});
				}
				return res.status(200).json({
					status: 1,
					message: "Meeting signature has been saved successfully!",
					data: [],
				});
			});
		} else {
			return res.status(200).json({
				status: 0,
				message: "All Field Required",
			});
		}
	});
};
exports.getMeetingSignature = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		user_id: "required",
	};
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			let sql = "select current_zoom_meeting_signature from user where id = " + body.user_id;
			connectPool.query(sql, (error, results, fields) => {
				if (error) {
					return res.status(200).json({
						status: 0,
						message: error,
						result: "",
					});
				}
				if (results.length > 0) {
					var data = [];
					arr = {};
					arr["signature"] = results[0].current_zoom_meeting_signature;
					data.push(arr);
					return res.status(200).json({
						status: 1,
						message: "Data found!",
						result: data,
					});
				} else {
					return res.status(200).json({
						status: 0,
						message: "Data not found!",
						result: "",
					});
				}
			}
			);
		} else {
			return res.status(200).json({
				status: 0,
				message: "All Field Required",
				result: "",
			});
		}
	});
};
/* Zoom API End */

var storage = multer.diskStorage({
	destination: function (req, file, callback) {
		var dir = './public/upload/prescriptions';
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
		callback(null, dir);
	},
	filename: function (req, file, callback) {
		let extArray = file.originalname.split(".");
		let extension = extArray[extArray.length - 1];
		callback(null, file.fieldname + '-' + Date.now() + '.' + extension);
	}
});
const uploadFiles = multer({ storage: storage }).array('presc_docs');
exports.addPrescription = (req, res, next) => {
	uploadFiles(req, res, function (err) {
		const validationRule = {
			"user_id": "required",
			"con_id": "required",
			"description": "required"
		}
		validator(req.body, validationRule, {}, (err, status) => {
			if (status) {
				var data = req.body;
				connectPool.query('select * from user where type=2 and id =' + data.user_id, (error, results, fields) => {
					if (results.length > 0) {
						const docFiles = [];
						var fileKeys = Object.keys(req.files);
						if (req.files != '') {
							fileKeys.forEach(function (key) {
								docFiles.push(req.files[key].filename);
							});
							var stringObj = JSON.stringify(docFiles);
							const sqlInsert = "INSERT INTO `prescriptions` (`consultation_id`, `description`, `documents`) VALUES (" + data.con_id + ", '" + data.description + "', '" + stringObj + "')";
							connectPool.query(sqlInsert, function (error, results) {
								if (error) {
									return res.status(200).json({
										status: 0,
										message: error.sqlMessage
									});
								}
								return res.status(200).json({
									status: 1,
									message: "Data has been saved successfully!",
								});
							});
						} else {
							return res.status(200).json({
								status: 0,
								message: 'Data not saved!'
							});
						}
					} else {
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
	});
};

exports.getPrescription = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"user_id": "required",
		"con_id": "required",
		"type": "required",
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var user_id = body.user_id;
			var con_id = body.con_id;
			var type = body.type;
			var userField = '';
			if (type == 1) {
				userField = 'b.user_id';
			} else if (type == 2) {
				userField = 'b.doctor_id';
			}
			connectPool.query('select * from user where type=' + type + ' and id =' + user_id, (error, results, fields) => {
				if (error) {
					return res.status(200).json({
						status: 0,
						message: error
					});
				}
				if (results.length > 0) {
					connectPool.query('select a.id, a.consultation_id, a.description, a.documents, DATE_FORMAT(a.created_at, "%d %M %Y %h:%i %p") as created_at from prescriptions a LEFT JOIN video_consultation b ON a.consultation_id = b.id where a.consultation_id =' + con_id + ' AND ' + userField + ' = ' + user_id, (error1, results1, fields1) => {
						if (error1) {
							return res.status(200).json({
								status: 0,
								message: error1
							});
						}
						if (results1.length > 0) {
							var data = [];
							for (var x = 0; x < results1.length; x++) {
								arr = {};
								arr = results1[x];
								var documents = JSON.parse(results1[x].documents);
								var docs = [];
								documents.forEach(element => {
									docs.push(BASE_URL + 'public/upload/prescriptions/' + element);
								});
								arr['documents'] = docs;
								data.push(arr);
							}
							return res.status(200).json({
								status: 1,
								message: "Data found!",
								data: data
							});
						} else {
							return res.status(200).json({
								status: 0,
								message: 'Data not found!'
							});
						}
					});
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

exports.deletePrescription = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"user_id": "required",
		"con_id": "required",
		"prescription_id": "required"
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var user_id = body.user_id;
			var con_id = body.con_id;
			var prescription_id = body.prescription_id;
			connectPool.query('select * from user where type=2 and id =' + user_id, (error, results, fields) => {
				if (error) {
					return res.status(200).json({
						status: 0,
						message: error
					});
				}
				if (results.length > 0) {
					connectPool.query('select * from prescriptions where consultation_id =' + con_id + ' AND id=' + prescription_id, (error1, results1, fields1) => {
						if (error1) {
							return res.status(200).json({
								status: 0,
								message: error1
							});
						}
						if (results1.length > 0) {
							const sqlDelete = 'DELETE FROM `prescriptions` WHERE consultation_id = ' + con_id + ' AND id = ' + prescription_id;
							connectPool.query(sqlDelete, function (errorDel, resultDel) {
								if (errorDel) {
									return res.status(200).json({
										status: 0,
										message: errorDel
									});
								}
								return res.status(200).json({
									status: 1,
									message: "Prescription has been deleted successfully!"
								});
							});
						} else {
							return res.status(200).json({
								status: 0,
								message: 'Data not found!'
							});
						}
					});
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
