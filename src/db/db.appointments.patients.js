const { connectionPool } = require("./db.connection");

exports.getAllPatientAppointments = ({ patientId, page = 1, limit = 20 }) => {
  page = page || 1;
  limit = limit || 20;

  const offset = (page - 1) * limit;

  const sql = `SELECT medical_appointments.appointment_id,appointment_uuid, p.patient_id, p.first_name, p.last_name,p.gender, d.doctor_id, d.first_name AS 'doctor_first_name', d.last_name AS 'doctor_last_name', appointment_type, medical_appointments.consultation_fee, appointment_date, appointment_time, time_slot_id, patient_name_on_prescription, patient_mobile_number, patient_symptoms,  speciality_name,  medical_appointments.meeting_id, join_url, start_url, start_time, end_time, appointment_status, cancelled_reason, cancelled_at, canceled_by, postponed_by, postponed_date, postponed_reason, medical_appointments.created_at, medical_appointments.updated_at, amount_paid, currency, payment_method, order_id, transaction_id, payment_status FROM medical_appointments INNER JOIN patients as p on medical_appointments.patient_id = p.patient_id INNER JOIN doctors as d on medical_appointments.doctor_id = d.doctor_id INNER JOIN appointment_payments on medical_appointments.appointment_id = appointment_payments.appointment_id INNER JOIN medical_specialities as ms on medical_appointments.speciality_id = ms.speciality_id LEFT JOIN zoom_meetings on medical_appointments.meeting_id = zoom_meetings.meeting_id  WHERE medical_appointments.patient_id = ? AND payment_status = 'success' ORDER BY medical_appointments.created_at DESC LIMIT ${limit} OFFSET ${offset} ;`;

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [patientId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.getPatientAppointmentById = ({ patientId, appointmentId }) => {
  const sql = `SELECT medical_appointments.appointment_id,appointment_uuid, p.patient_id, p.first_name, p.last_name,p.gender, d.doctor_id, d.first_name AS 'doctor_first_name', d.last_name AS 'doctor_last_name', appointment_type, medical_appointments.consultation_fee, appointment_date, appointment_time, time_slot_id, patient_name_on_prescription, patient_mobile_number, patient_symptoms,  speciality_name,  medical_appointments.meeting_id, join_url, start_url, start_time, end_time, appointment_status, cancelled_reason, cancelled_at, canceled_by, postponed_by, postponed_date, postponed_reason, medical_appointments.created_at, medical_appointments.updated_at, amount_paid, currency, payment_method, order_id, transaction_id, payment_status FROM medical_appointments INNER JOIN patients as p on medical_appointments.patient_id = p.patient_id INNER JOIN doctors as d on medical_appointments.doctor_id = d.doctor_id INNER JOIN appointment_payments on medical_appointments.appointment_id = appointment_payments.appointment_id INNER JOIN medical_specialities as ms on medical_appointments.speciality_id = ms.speciality_id LEFT JOIN zoom_meetings on medical_appointments.meeting_id = zoom_meetings.meeting_id  WHERE medical_appointments.patient_id = ? AND payment_status = 'success' AND medical_appointments.appointment_id = ? LIMIT 1;`;

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [patientId, appointmentId], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.getPatientAppointmentByUUID = ({ patientId, appointmentUUID }) => {
  const sql = `SELECT medical_appointments.appointment_id,appointment_uuid, p.patient_id, p.first_name, p.last_name,p.gender, d.doctor_id, d.first_name AS 'doctor_first_name', d.last_name AS 'doctor_last_name', appointment_type, medical_appointments.consultation_fee, appointment_date, appointment_time, time_slot_id, patient_name_on_prescription, patient_mobile_number, patient_symptoms,  speciality_name,  medical_appointments.meeting_id, join_url, start_url, start_time, end_time, appointment_status, cancelled_reason, cancelled_at, canceled_by, postponed_by, postponed_date, postponed_reason, medical_appointments.created_at, medical_appointments.updated_at, amount_paid, currency, payment_method, order_id, transaction_id, payment_status FROM medical_appointments INNER JOIN patients as p on medical_appointments.patient_id = p.patient_id INNER JOIN doctors as d on medical_appointments.doctor_id = d.doctor_id INNER JOIN appointment_payments on medical_appointments.appointment_id = appointment_payments.appointment_id INNER JOIN medical_specialities as ms on medical_appointments.speciality_id = ms.speciality_id LEFT JOIN zoom_meetings on medical_appointments.meeting_id = zoom_meetings.meeting_id  WHERE medical_appointments.patient_id = ? AND medical_appointments.appointment_uuid = ? LIMIT 1;`;

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [patientId, appointmentUUID],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results[0]);
      }
    );
  });
};
exports.getAppointmentByUUID = (appointmentUUID) => {
  const sql = `SELECT medical_appointments.appointment_id,appointment_uuid, p.patient_id, p.first_name, p.last_name,p.gender, d.doctor_id, d.first_name AS 'doctor_first_name', d.last_name AS 'doctor_last_name', appointment_type, medical_appointments.consultation_fee, appointment_date, appointment_time, time_slot_id, patient_name_on_prescription, patient_mobile_number, patient_symptoms,  speciality_name,  medical_appointments.meeting_id, join_url, start_url, start_time, end_time, appointment_status, cancelled_reason, cancelled_at, canceled_by, postponed_by, postponed_date, postponed_reason, medical_appointments.created_at, medical_appointments.updated_at, amount_paid, currency, payment_method, order_id, transaction_id, payment_status FROM medical_appointments INNER JOIN patients as p on medical_appointments.patient_id = p.patient_id INNER JOIN doctors as d on medical_appointments.doctor_id = d.doctor_id INNER JOIN appointment_payments on medical_appointments.appointment_id = appointment_payments.appointment_id INNER JOIN medical_specialities as ms on medical_appointments.speciality_id = ms.speciality_id LEFT JOIN zoom_meetings on medical_appointments.meeting_id = zoom_meetings.meeting_id  WHERE  medical_appointments.appointment_uuid = ? LIMIT 1;`;

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [appointmentUUID], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};

exports.createNewPatientAppointment = ({
  uuid,
  patientId,
  doctorId,
  patientName,
  patientNumber,
  symptoms,
  appointmentType,
  consultationFee,
  specialtyId,
  appointmentDate,
  appointmentTime,
}) => {
  const sql =
    "INSERT INTO medical_appointments (appointment_uuid,patient_id, doctor_id, appointment_type, patient_name_on_prescription, patient_mobile_number, speciality_id, patient_symptoms, consultation_fee, appointment_date, appointment_time) VALUES (?,?,?,?,?,?,?,?,?,?,?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [
        uuid,
        patientId,
        doctorId,
        appointmentType,
        patientName,
        patientNumber,
        specialtyId,
        symptoms,
        consultationFee,
        appointmentDate,
        appointmentTime,
      ],
      (error, results) => {
        if (error) return reject(error);

        console.log(results);
        return resolve(results);
      }
    );
  });
};

exports.deleteAppointmentById = ({ appointmentId }) => {
  const sql =
    "DELETE FROM medical_appointments WHERE appointment_id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [appointmentId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
