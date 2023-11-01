const { validationResult } = require("express-validator");
const validator = require('./helpers/validate');

exports.getRevenueChartData = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"user_id": "required",
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var sql_apt = 'SELECT YEAR(appointment_date) AS rev_year, SUM(consultation_fee) as total_apt_revenue FROM appointment WHERE booking_type = 1 AND doctor_id = '+body.user_id+' GROUP BY rev_year'; // Appointments

			var sql_visit = 'SELECT YEAR(appointment_date) AS rev_year, SUM(consultation_fee) as total_visit_revenue FROM appointment WHERE booking_type = 2 AND doctor_id = '+body.user_id+' GROUP BY rev_year'; // Visit

			var sql_vc = 'SELECT YEAR(a.created_at) as rev_year, SUM(a.consultation_fee) as total_vc_revenue FROM video_consultation a LEFT JOIN user b ON a.doctor_id = b.id LEFT JOIN user c ON a.user_id = c.id LEFT JOIN specialization d ON b.specialization_id = d.id WHERE a.doctor_id = ' + body.user_id + " AND b.type=2 GROUP BY rev_year"; // Video Consultation
			connectPool.query(sql_apt, (error1, results1, fields1) => {
				if (error1) {
					return res.status(200).json({
						status: 0,
						message: error1
					});
				}
				connectPool.query(sql_visit, (error2, results2, fields2) => {
					if (error2) {
						return res.status(200).json({
							status: 0,
							message: error2
						});
					}
					connectPool.query(sql_vc, (error3, results3, fields3) => {
						if (error3) {
							return res.status(200).json({
								status: 0,
								message: error3
							});
						}

						/* FINAL */
						var apt_data = results1;
						var visit_data = results2;
						var vc_data = results3;

						let merged = [];
						for (let i = 0; i < apt_data.length; i++) {
							merged.push(apt_data[i].rev_year);
						}
						for (let i = 0; i < visit_data.length; i++) {
							merged.push(visit_data[i].rev_year);
						}
						for (let i = 0; i < vc_data.length; i++) {
							merged.push(vc_data[i].rev_year);
						}
						var unique = merged.filter((value, index, array) => array.indexOf(value) === index);
						let merged1 = [];
						for (let j = 0; j < unique.length; j++) {
							let mer = [unique[j].toString()];
							var a = 0
							for (let i = 0; i < apt_data.length; i++) {
								if (apt_data[i].rev_year === unique[j]) {
									mer.push(apt_data[i].total_apt_revenue);
									a++;
								}
							}
							if (a == 0) {
								mer.push(0);
							}
							var b = 0;
							for (let i = 0; i < visit_data.length; i++) {
								if (visit_data[i].rev_year === unique[j]) {
									mer.push(visit_data[i].total_visit_revenue);
									b++;
								}
							}
							if (b == 0) {
								mer.push(0);
							}
							var c = 0;
							for (let i = 0; i < vc_data.length; i++) {
								if (vc_data[i].rev_year === unique[j]) {
									mer.push(vc_data[i].total_vc_revenue);
									c++;
								}
							}
							if (c == 0) {
								mer.push(0);
							}
							merged1.push(mer);
						}
						/* FINAL */

						return res.status(200).json({
							status: 1,
							message: "Data found!",
							data: merged1,
						});
					});
				});
			});
		} else {
			return res.status(200).json({
				status: 0,
				message: err
			});
		}
	});
};

exports.getRevenueChartCounts = (req, res, next) => {
	const { body } = req;
	const validationRule = {
		"user_id": "required",
	}
	validator(req.body, validationRule, {}, (err, status) => {
		if (status) {
			var sql_apt = 'SELECT SUM(consultation_fee) as total_apt_revenue FROM appointment WHERE booking_type = 1 AND doctor_id = '+body.user_id+' '; // Appointments

			var sql_visit = 'SELECT SUM(consultation_fee) as total_visit_revenue FROM appointment WHERE booking_type = 2 AND doctor_id = '+body.user_id+' '; // Visit

			var sql_vc = 'SELECT SUM(a.consultation_fee) as total_vc_revenue FROM video_consultation a LEFT JOIN user b ON a.doctor_id = b.id LEFT JOIN user c ON a.user_id = c.id LEFT JOIN specialization d ON b.specialization_id = d.id WHERE a.doctor_id = ' + body.user_id + " AND b.type=2 "; // Video Consultation
			connectPool.query(sql_apt, (error1, results1, fields1) => {
				if (error1) {
					return res.status(200).json({
						status: 0,
						message: error1
					});
				}
				connectPool.query(sql_visit, (error2, results2, fields2) => {
					if (error2) {
						return res.status(200).json({
							status: 0,
							message: error2
						});
					}
					connectPool.query(sql_vc, (error3, results3, fields3) => {
						if (error3) {
							return res.status(200).json({
								status: 0,
								message: error3
							});
						}

						var data = [];
						arr = {};
						arr['total_apt_revenue'] = results1[0].total_apt_revenue;
						arr['total_visit_revenue'] = results2[0].total_visit_revenue;
						arr['total_vc_revenue'] = results3[0].total_vc_revenue;
						arr['total_revenue'] = results1[0].total_apt_revenue + results2[0].total_visit_revenue + results3[0].total_vc_revenue;
						data.push(arr);

						return res.status(200).json({
							status: 1,
							message: "Data found!",
							data: data,
						});
					});
				});
			});
		} else {
			return res.status(200).json({
				status: 0,
				message: err
			});
		}
	});
};