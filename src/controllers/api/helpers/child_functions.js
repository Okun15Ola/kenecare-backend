
module.exports.checkSlotBooked = function(data,callback) {
	let sql = 'SELECT *, DATE_FORMAT(appointment_date, "%Y-%m-%d") as appointment_date FROM appointment WHERE doctor_id = ' + data.doctor_id + ' AND appointment_date = "'+data.appointment_date+'" AND start_time = "'+data.appointment_time+'" ORDER BY id ASC';
    connectPool.query(sql, (error, results, fields) => {

    });
}