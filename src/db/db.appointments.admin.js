const { connectionPool } = require("./db.connection");

exports.getAllAppointments = () => {
  const sql =
    "SELECT appointment_id,appointment_uuid, patients.patient_id,patients.first_name, patients.last_name, doctors.doctor_id, doctors.first_name as 'doc_first_name', doctors.last_name as 'doc_last_name', medical_appointments.consultation_fee, appointment_type, appointment_date, appointment_time, time_slot_id, patient_name_on_prescription, patient_mobile_number, patient_symptoms,  speciality_name,meeting_id, start_time, end_time, appointment_status,cancelled_reason,cancelled_at,canceled_by,postponed_by,postponed_date,postponed_reason,medical_appointments.created_at, medical_appointments.updated_at FROM medical_appointments INNER JOIN patients on medical_appointments.patient_id = patients.patient_id INNER JOIN doctors on medical_appointments.doctor_id = doctors.doctor_id INNER JOIN medical_specialities on medical_appointments.speciality_id = medical_specialities.speciality_id;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.getAppointmentsByDoctorId = (doctorId) => {
  const sql =
    "SELECT appointment_id,appointment_uuid, patients.patient_id,patients.first_name, patients.last_name, doctors.doctor_id, doctors.first_name as 'doc_first_name', doctors.last_name as 'doc_last_name', medical_appointments.consultation_fee, appointment_type, appointment_date, appointment_time, time_slot_id, patient_name_on_prescription, patient_mobile_number, patient_symptoms,  speciality_name,meeting_id, start_time, end_time, appointment_status,cancelled_reason,cancelled_at,canceled_by,postponed_by,postponed_date,postponed_reason,medical_appointments.created_at, medical_appointments.updated_at FROM medical_appointments INNER JOIN patients on medical_appointments.patient_id = patients.patient_id INNER JOIN doctors on medical_appointments.doctor_id = doctors.doctor_id INNER JOIN medical_specialities on medical_appointments.speciality_id = medical_specialities.speciality_id WHERE medical_appointments.doctor_id = ?;";

  return new Promise((resolve, [doctorId], reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.getAppointmentById = (appointmentId) => {
  const sql =
    "SELECT appointment_id,appointment_uuid, patients.patient_id,patients.first_name, patients.last_name, doctors.doctor_id, doctors.first_name as 'doc_first_name', doctors.last_name as 'doc_last_name', medical_appointments.consultation_fee, appointment_type, appointment_date, appointment_time, time_slot_id, patient_name_on_prescription, patient_mobile_number, patient_symptoms,  speciality_name,meeting_id, start_time, end_time, appointment_status,cancelled_reason,cancelled_at,canceled_by,postponed_by,postponed_date,postponed_reason,medical_appointments.created_at, medical_appointments.updated_at FROM medical_appointments INNER JOIN patients on medical_appointments.patient_id = patients.patient_id INNER JOIN doctors on medical_appointments.doctor_id = doctors.doctor_id INNER JOIN medical_specialities on medical_appointments.speciality_id = medical_specialities.speciality_id WHERE medical_appointments.appointment_id = ?;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [appointmentId], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.getAppointmentByUUID = (appointmentUUID) => {
  console.log(appointmentUUID);
  const sql =
    "SELECT appointment_id,appointment_uuid,p.patient_id,p.first_name,p.last_name,d.doctor_id,d.first_name,d.last_name,appointment_type,medical_appointments.consultation_fee, appointment_type,appointment_date,appointment_time,time_slot_id,patient_name_on_prescription,patient_mobile_number,patient_symptoms, speciality_name, meeting_url,start_time,end_time,appointment_status,cancelled_reason,cancelled_at,canceled_by,postponed_by,postponed_date,postponed_reason,medical_appointments.created_at,medical_appointments.updated_at FROM medical_appointments INNER JOIN patients as p on medical_appointments.patient_id = p.patient_id INNER JOIN doctors as d on medical_appointments.doctor_id = d.doctor_id INNER JOIN medical_specialities as ms on medical_appointments.speciality_id = ms.speciality_id WHERE medical_appointments.appointment_uuid = ?  LIMIT 1;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [appointmentUUID], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
