const { validationResult } = require("express-validator");
const validator = require('./helpers/validate');
exports.view_appointment = (req, res, next) => {
	
	var sql = 'SELECT a.*, a.specialty as specialty_id, c.image as doctor_image, b.name as patient_name, c.name as doctor_name, COALESCE(d.name, "") as specialty, DATE_FORMAT(a.appointment_date, "%d %b %Y") as appointment_date, DATE_FORMAT(a.start_time, "%h:%i %p") as appointment_time, DATE_FORMAT(a.end_time, "%h:%i %p") as appointment_end_time, DATE_FORMAT(a.created_at, "%d %b %Y") as booking_date, a.consultation_fee as amount, a.booking_type, a.user_id as patient_id, a.feedback, DATE_FORMAT(a.appointment_date, "%Y-%m-%d") as appointment_date_og FROM appointment a LEFT JOIN user b ON a.user_id = b.id LEFT JOIN user c ON a.doctor_id = c.id LEFT JOIN specialization d ON c.specialization_id = d.id ORDER BY a.appointment_date DESC, a.start_time ASC';
	// console.log(sql);
	// var sql = 'select a.*,u.name as uname,us.name as dname,d.name as dpname from appointment a LEFT JOIN user u ON a.user_id = u.id LEFT JOIN user us ON a.doctor_id = us.id LEFT JOIN department_type d ON a.department_type_id = d.id order by a.id DESC';
	connectPool.query(sql, (error, results, fields) => {
			if (error) {
				return res.render('view_appointment', {
					title: 'Manage Appointment',
					error: error,
					data: []
				});
			}
			res.render("view_appointment", {
				title: 'Manage Appointment',
				data: results,
				success: req.flash('success'),
				error: req.flash('error'),
			});
		});
};
exports.delete_appointment = (req, res) => {
	const id = req.params.id;
	let sql = 'SELECT * FROM appointment WHERE id = ' + id + ' LIMIT 1';
	connectPool.query(sql, (error, results, fields) => {
		if (error) {
			req.flash('error', error);
			return res.redirect('/view_appointment');
		}
		if (results.length > 0) {
			connectPool.query(
				'DELETE FROM appointment WHERE id = "' + id + '" ', (errors, result, fields) => {
					if (errors) {
						return res.render('view_appointment', {
							title: 'Manage Appointment',
							error: errors
						});
					}
					req.flash('success', 'Appointment Delete Successfully!')
					return res.redirect('/view_appointment');
				}
			);
		}
	});
};