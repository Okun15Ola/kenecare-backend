const {
  getDoctorAppointByDateAndTime,
  getDoctorAppointmentById,
} = require("../../db/db.appointments.doctors");
const { getDoctorByUserId } = require("../../db/db.doctors");
const dbObject = require("../../db/db.follow-up");
const { getPatientById } = require("../../db/db.patients");
const Response = require("../../utils/response.utils");
const { newFollowAppointmentSms } = require("../../utils/sms.utils");

exports.createFollowUp = async ({
  appointmentId,
  followUpDate,
  followUpTime,
  followUpReason,
  followUpType,
  userId,
}) => {
  try {
    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please Login as a doctor before proceeding",
      });
    }

    const {
      doctor_id: doctorId,
      first_name: doctorFirstName,
      title: doctorTitle,
      last_name: doctorLastName,
    } = doctor;

    // Check if an appointment has not been booked on the selected followup date
    const followUpDateBooked = await getDoctorAppointByDateAndTime({
      doctorId,
      date: followUpDate,
      time: followUpTime,
    });

    if (followUpDateBooked) {
      return Response.BAD_REQUEST({
        message:
          "An Appointment Has Already Been Booked for the Specified Date/Time slot. Please Select Another Date or Time",
      });
    }

    const appointment = await getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });

    const {
      patient_id: patientId,
      patient_name_on_prescription: patientNameOnPrescription,
    } = appointment;
    const { mobile_number: mobileNumber } = await getPatientById(patientId);

    // Save follow-up to database
    await dbObject.createNewFollowUp({
      appointmentId,
      followUpDate,
      followUpTime,
      followUpReason,
      followUpType,
    });

    //  Send notfication to user for new follow-up
    await newFollowAppointmentSms({
      patientNameOnPrescription,
      mobileNumber,
      doctorName: `${doctorTitle} ${doctorFirstName} ${doctorLastName}`,
      followUpDate,
      followUpTime,
    });

    return Response.CREATED({
      message: "Appointment Follow-up created successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
