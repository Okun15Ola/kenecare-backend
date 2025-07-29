const moment = require("moment");
const he = require("he");
const {
  getFileUrlFromS3Bucket,
  getPublicFileUrlFromS3Bucket,
} = require("./aws-s3.utils");
const { decryptText } = require("./auth.utils");
const availableDaysDB = require("../repository/doctorAvailableDays.repository");

const safeDecrypt = (encryptedText, key) => {
  if (!encryptedText || !key) return null;
  try {
    return decryptText({ encryptedText, key });
  } catch (e) {
    console.error("Decryption failed:", e);
    return null;
  }
};

exports.mapCommonSymptomsRow = async (
  commonSymptoms,
  includeImageUrl = false,
) => {
  const {
    symptom_id: symptomId,
    symptom_name: name,
    symptom_descriptions: description,
    speciality_name: specialty,
    image_url: imageUrl,
    general_consultation_fee: consultationFee,
    tags,
    is_active: isActive,
    inputted_by: inputtedBy,
  } = commonSymptoms;

  let finalImage = null;

  if (imageUrl) {
    finalImage = includeImageUrl
      ? await getPublicFileUrlFromS3Bucket(imageUrl)
      : await getFileUrlFromS3Bucket(imageUrl);
  }

  return {
    symptomId,
    name: name?.toUpperCase() || "",
    description,
    specialty,
    imageUrl: finalImage || null,
    consultationFee,
    tags,
    isActive,
    inputtedBy,
  };
};

exports.mapSpecializationRow = (specialization) => {
  const {
    specialization_id: specializationId,
    specialization_name: specializationName,
    description,
    image_url: imageUrl,
    is_active: isActive,
    inputted_by: inputtedBy,
  } = specialization;
  return {
    specializationId,
    specializationName,
    description,
    imageUrl,
    isActive,
    inputtedBy,
  };
};

exports.mapMedicalCouncilRow = (medicalCouncil) => {
  const {
    council_id: councilId,
    council_name: councilName,
    email,
    address,
    mobile_number: mobileNumber,
    is_active: isActive,
    inputted_by: inputtedBy,
  } = medicalCouncil;
  return {
    councilId,
    councilName,
    email,
    address,
    mobileNumber,
    isActive,
    inputtedBy,
  };
};

exports.mapAdminAppointmentRow = (appointments) => {
  const {
    appointment_id: appointmentId,
    appointment_uuid: appointmentUUID,
    patient_id: patient,
    first_name: firstName,
    last_name: lastName,
    doctor_id: doctorId,
    doc_first_name: doctorFirstName,
    doc_last_name: doctorLastName,
    appointment_type: appointmentType,
    patient_name_on_prescription: patientNameOnPrescription,
    patient_mobile_number: patientMobileNumber,
    patient_symptoms: patientSymptoms,
    consultation_fee: consultationFees,
    specialty_name: specialty,
    time_slot: timeSlot,
    meeting_id: meetingId,
    start_time: appointmentStartTime,
    end_time: appointmentEndTime,
    appointment_status: appointmentStatus,
    cancelled_reason: cancelledReason,
    cancelled_at: cancelledAt,
    cancelled_by: cancelledBy,
    postponed_reason: postponedReason,
    postponed_date: postponeDate,
    postponed_by: postponedBy,
    created_at: createAt,
  } = appointments;
  return {
    appointmentId,
    appointmentUUID,
    patient,
    username: `${firstName} ${lastName}`,
    doctorId,
    doctor: `Dr. ${doctorFirstName} ${doctorLastName}`,
    appointmentType,
    patientNameOnPrescription,
    patientMobileNumber,
    patientSymptoms,
    consultationFees: `SLE ${parseInt(consultationFees, 10)}`,
    specialty,
    timeSlot,
    meetingId,
    appointmentStartTime,
    appointmentEndTime,
    appointmentStatus,
    cancelledReason,
    cancelledAt,
    cancelledBy,
    postponedReason,
    postponeDate,
    postponedBy,
    createAt,
  };
};

exports.mapBlogCategoryRow = (blogCategory) => {
  const {
    category_id: categoryId,
    category_name: categoryName,
    is_active: status,
    inputted_by: inputtedBy,
  } = blogCategory;
  return {
    categoryId,
    categoryName,
    status,
    inputtedBy,
  };
};

exports.mapBlogRow = async (blog, includeImageUrl) => {
  const {
    blog_id: blogId,
    category_name: blogCategory,
    title: blogTitle,
    description,
    image,
    tags,
    disclaimer,
    author,
    is_featured: featured,
    is_active: isActive,
    created_at: createdAt,
  } = blog;
  let imageData = null;
  if (image) {
    imageData = includeImageUrl
      ? await getPublicFileUrlFromS3Bucket(image)
      : await getFileUrlFromS3Bucket(image);
  }
  return {
    blogId,
    blogCategory,
    blogTitle,
    description,
    image: imageData || null,
    tags: tags ? JSON.parse(tags) : null,
    disclaimer,
    author,
    featured,
    isActive,
    createdAt,
  };
};

exports.mapCityRow = (city) => {
  const {
    city_id: cityId,
    city_name: cityName,
    latitude,
    longitude,
    is_active: isActive,
    inputted_by: inputtedBy,
  } = city;
  return {
    cityId,
    cityName,
    latitude,
    longitude,
    isActive,
    inputtedBy,
  };
};

exports.mapCouncilRegistrationRow = async (councilRegistration) => {
  const {
    council_registration_id: registrationId,
    doctor_id: doctorId,
    first_name: firstName,
    last_name: lastName,
    specialty_name: specialty,
    profile_pic_url: doctorPic,
    council_name: councilName,
    years_of_experience: yearsOfExperience,
    is_profile_approved: isProfileApproved,
    registration_number: regNumber,
    registration_year: regYear,
    registration_document_url: regDocumentUrl,
    certificate_issued_date: certIssuedDate,
    certificate_expiry_date: certExpiryDate,
    registration_status: regStatus,
    rejection_reason: rejectionReason,
    verified_by: verifiedBy,
  } = councilRegistration;
  const [documentUrl, profileImageUrl] = await Promise.all([
    regDocumentUrl
      ? getFileUrlFromS3Bucket(regDocumentUrl)
      : Promise.resolve(null),
    doctorPic ? getFileUrlFromS3Bucket(doctorPic) : Promise.resolve(null),
  ]);
  return {
    registrationId,
    doctorId,
    doctor: `Dr. ${firstName} ${lastName}`,
    specialty,
    doctorPic: profileImageUrl,
    councilName,
    yearsOfExperience,
    isProfileApproved,
    regNumber,
    regYear,
    regDocumentUrl: documentUrl,
    certIssuedDate: moment(certIssuedDate).format("YYYY-MM-DD"),
    certExpiryDate: moment(certExpiryDate).format("YYYY-MM-DD"),
    regStatus,
    rejectionReason,
    verifiedBy,
  };
};

exports.mapMarketersRow = (marketer) => {
  const {
    marketer_id: marketerId,
    marketer_uuid: marketerUuid,
    referral_code: referralCode,
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    gender,
    dob: dateOfBirth,
    phone_number: phoneNumber,
    is_phone_verified: isPhoneVerified,
    email,
    is_email_verified: isEmailVerified,
    home_address: homeAddress,
    id_document_type: idDocumentType,
    id_document_number: idDocumentNumber,
    id_document_uuid: idDocumentUuuid,
    nin,
    emergency_contact_name_1: firstEmergencyContactName,
    emergency_contact_phone_1: firstEmergencyContactNumber,
    emergency_contact_address_1: firstEmergencyContactAddress,
    emergency_contact_name_2: secondEmergencyContactName,
    emergency_contact_phone_2: secondEmergencyContactNumber,
    emergency_contact_address_2: secondEmergencyContactAddress,
    created_at: createdAt,
    updated_at: updatedAt,
  } = marketer;
  return {
    marketerId,
    marketerUuid,
    referralCode,
    firstName,
    middleName,
    lastName,
    gender,
    dateOfBirth: moment(dateOfBirth).format("YYYY-MM-DD"),
    phoneNumber,
    isPhoneVerified,
    email,
    isEmailVerified,
    homeAddress,
    idDocumentType,
    idDocumentNumber,
    idDocumentUuuid,
    nin,
    firstEmergencyContactName,
    firstEmergencyContactNumber,
    firstEmergencyContactAddress,
    secondEmergencyContactName,
    secondEmergencyContactNumber,
    secondEmergencyContactAddress,
    createdAt: moment(createdAt).format("YYYY-MM-DD hh:mm"),
    updatedAt: moment(updatedAt).format("YYYY-MM-DD hh:mm"),
  };
};

exports.mapMarketersWithDocumentRow = async (marketer) => {
  const {
    marketer_id: marketerId,
    marketer_uuid: marketerUuid,
    referral_code: referralCode,
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    gender,
    dob: dateOfBirth,
    phone_number: phoneNumber,
    is_phone_verified: isPhoneVerified,
    email,
    is_email_verified: isEmailVerified,
    home_address: homeAddress,
    id_document_type: idDocumentType,
    id_document_number: idDocumentNumber,
    id_document_uuid: idDocumentUuuid,
    nin,
    emergency_contact_name_1: firstEmergencyContactName,
    emergency_contact_phone_1: firstEmergencyContactNumber,
    emergency_contact_address_1: firstEmergencyContactAddress,
    emergency_contact_name_2: secondEmergencyContactName,
    emergency_contact_phone_2: secondEmergencyContactNumber,
    emergency_contact_address_2: secondEmergencyContactAddress,
    created_at: createdAt,
    updated_at: updatedAt,
  } = marketer;
  const documentUrl = await getFileUrlFromS3Bucket(idDocumentUuuid);
  return {
    marketerId,
    marketerUuid,
    referralCode,
    firstName,
    middleName,
    lastName,
    gender,
    dateOfBirth: moment(dateOfBirth).format("YYYY-MM-DD"),
    phoneNumber,
    isPhoneVerified,
    email,
    isEmailVerified,
    homeAddress,
    idDocumentType,
    idDocumentNumber,
    idDocumentUrl: idDocumentUuuid ? documentUrl : null,
    nin,
    firstEmergencyContactName,
    firstEmergencyContactNumber,
    firstEmergencyContactAddress,
    secondEmergencyContactName,
    secondEmergencyContactNumber,
    secondEmergencyContactAddress,
    createdAt: moment(createdAt).format("YYYY-MM-DD hh:mm"),
    updatedAt: moment(updatedAt).format("YYYY-MM-DD hh:mm"),
  };
};

exports.mapSpecializations = (specialization) => {
  const {
    specialization_id: specializationId,
    specialization_name: specializationName,
    description,
    image_url: imageUrl,
    is_active: isActive,
    inputted_by: inputtedBy,
  } = specialization;
  return {
    specializationId,
    specializationName,
    description,
    imageUrl,
    isActive,
    inputtedBy,
  };
};

exports.mapWithdawalRow = (withdrawal) => {
  const {
    request_id: requestId,
    doctor_id: doctorId,
    first_name: fistName,
    last_name: lastName,
    request_status: requestStatus,
    requested_amount: requestedAmount,
    payment_method: paymentMethod,
    mobile_money_number: mobileMoneyNumber,
    bank_name: bankName,
    bank_account_number: bankAccountNumber,
    bank_account_name: bankAccountName,
  } = withdrawal;
  return {
    requestId,
    doctorId,
    fistName,
    lastName,
    requestStatus,
    requestedAmount,
    paymentMethod,
    mobileMoneyNumber,
    bankName,
    bankAccountNumber,
    bankAccountName,
  };
};

exports.mapDoctorAppointmentRow = (doctorAppointment, title) => {
  const {
    appointment_id: appointmentId,
    appointment_uuid: appointmentUUID,
    patient_id: patient,
    first_name: firstName,
    last_name: lastName,
    doctor_id: doctorId,
    doctor_first_name: doctorFirstName,
    doctor_last_name: doctorLastName,
    appointment_type: appointmentType,
    appointment_date: appointmentDate,
    appointment_time: appointmentTime,
    patient_name_on_prescription: patientNameOnPrescription,
    patient_mobile_number: patientMobileNumber,
    patient_symptoms: patientSymptoms,
    consultation_fee: consultationFees,
    specialty_name: specialty,
    time_slot: timeSlot,
    meeting_id: meetingId,
    join_url: meetingJoinUrl,
    start_url: meetingStartUrl,
    start_time: appointmentStartTime,
    end_time: appointmentEndTime,
    appointment_status: appointmentStatus,
    cancelled_reason: cancelledReason,
    cancelled_at: cancelledAt,
    cancelled_by: cancelledBy,
    postponed_reason: postponedReason,
    postponed_date: postponeDate,
    postponed_by: postponedBy,
    created_at: createdAt,
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    transactionId: paymentTransactionId,
  } = doctorAppointment;
  return {
    appointmentId,
    appointmentUUID,
    patient,
    username: `${firstName} ${lastName}`,
    doctorId,
    doctorName: `${title} ${doctorFirstName} ${doctorLastName}`,
    appointmentDate,
    appointmentTime,
    appointmentType,
    patientNameOnPrescription,
    patientMobileNumber,
    patientSymptoms,
    consultationFees: `SLE ${parseInt(consultationFees, 10)}`,
    specialty,
    timeSlot,
    meetingId,
    meetingJoinUrl,
    meetingStartUrl,
    appointmentStartTime,
    appointmentEndTime,
    appointmentStatus,
    paymentMethod,
    paymentStatus,
    paymentTransactionId,
    cancelledReason,
    cancelledAt,
    cancelledBy,
    postponedReason,
    postponeDate,
    postponedBy,
    createdAt,
  };
};

exports.mapFollowUpsRow = (followUp) => {
  const {
    followup_id: followUpId,
    followup_date: followUpDate,
    followup_time: followUpTime,
    reason: followUpReason,
    followup_status: followUpStatus,
    followup_type: followUpType,
    meeting_id: meetingId,
  } = followUp;
  return {
    followUpId,
    followUpDate: moment(followUpDate).format("YYYY-MM-DD"),
    followUpTime,
    followUpReason,
    followUpStatus,
    followUpType,
    meetingId,
  };
};

exports.mapFollowUpRow = (followUp) => {
  const {
    followup_id: followUpId,
    appointment_id: appointmentId,
    followup_date: followUpDate,
    followup_time: followUpTime,
    reason,
    followup_status: followUpStatus,
    followup_type: followUpType,
    created_at: createdAt,
    updated_at: updatedAt,
  } = followUp;
  return {
    followUpId,
    appointmentId,
    followUpDate: moment(followUpDate).format("YYYY-MM-DD"),
    followUpTime,
    reason,
    followUpStatus,
    followUpType,
    createdAt: moment(createdAt).format("YYYY-MM-DD HH:MM"),
    updatedAt: moment(updatedAt).format("YYYY-MM-DD HH:MM"),
  };
};

exports.mapDoctorCouncilRow = async (doctorCouncil) => {
  const {
    council_registration_id: registrationId,
    first_name: firstName,
    last_name: lastName,
    speciality_name: specialty,
    profile_pic_url: doctorPic,
    council_name: councilName,
    years_of_experience: yearsOfExperience,
    is_profile_approved: isProfileApproved,
    registration_number: regNumber,
    registration_year: regYear,
    registration_document_url: regDocumentUrl,
    certificate_issued_date: certIssuedDate,
    certificate_expiry_date: certExpiryDate,
    registration_status: regStatus,
    rejection_reason: rejectionReason,
    verified_by: verifiedBy,
  } = doctorCouncil;
  const [documentUrl, profileImageUrl] = await Promise.all([
    regDocumentUrl
      ? getFileUrlFromS3Bucket(regDocumentUrl)
      : Promise.resolve(null),
    doctorPic ? getFileUrlFromS3Bucket(doctorPic) : Promise.resolve(null),
  ]);
  return {
    registrationId,
    doctor: `${firstName} ${lastName}`,
    specialty,
    doctorPic: profileImageUrl,
    councilName,
    yearsOfExperience,
    isProfileApproved,
    regNumber,
    regYear,
    regDocumentUrl: documentUrl,
    certIssuedDate: moment(certIssuedDate).format("YYYY-MM-DD"),
    certExpiryDate: moment(certExpiryDate).format("YYYY-MM-DD"),
    regStatus,
    rejectionReason,
    verifiedBy,
  };
};

exports.mapDoctorSharedMedicalDocs = async (
  docs,
  title,
  includeDocumentUrl = false,
) => {
  const {
    sharing_id: sharingId,
    document_id: documentId,
    document_uuid: documentUUID,
    document_title: documentTitle,
    patient_id: patientId,
    patient_first_name: patientFirstName,
    patient_last_name: patientLastName,
    doctor_first_name: doctorFirstName,
    doctor_last_name: doctorLastName,
    note,
    created_at: createdAt,
  } = docs;
  const mapped = {
    sharingId,
    documentId,
    documentUUID,
    documentTitle,
    patientId,
    patientName: `${patientFirstName} ${patientLastName}`,
    doctorName: `${title} ${doctorFirstName} ${doctorLastName}`,
    note,
    createdAt,
  };
  if (includeDocumentUrl && documentUUID !== null) {
    const documentUrl = await getFileUrlFromS3Bucket(documentUUID);
    mapped.documentUrl = documentUrl;
  }
  return mapped;
};

exports.mapPatientAppointments = (appointment) => {
  const {
    appointment_id: appointmentId,
    appointment_uuid: appointmentUUID,
    patient_id: patient,
    first_name: firstName,
    last_name: lastName,
    gender,
    doctor_id: doctorId,
    doctor_first_name: doctorFirstName,
    doctor_last_name: doctorLastName,
    appointment_type: appointmentType,
    appointment_date: appointmentDate,
    appointment_time: appointmentTime,
    patient_name_on_prescription: patientNameOnPrescription,
    patient_mobile_number: patientMobileNumber,
    patient_symptoms: patientSymptoms,
    consultation_fee: consultationFees,
    specialization_id: specialtyId,
    specialty_name: specialty,
    time_slot: timeSlot,
    meeting_id: meetingId,
    join_url: meetingJoinUrl,
    start_time: appointmentStartTime,
    end_time: appointmentEndTime,
    appointment_status: appointmentStatus,
    cancelled_reason: cancelledReason,
    cancelled_at: cancelledAt,
    cancelled_by: cancelledBy,
    postponed_reason: postponedReason,
    postponed_date: postponeDate,
    postponed_by: postponedBy,
    created_at: createdAt,
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    transactionId: paymentTransactionId,
  } = appointment;
  return {
    appointmentId,
    appointmentUUID,
    patient,
    username: `${firstName} ${lastName}`,
    gender,
    doctorId,
    doctorName: `Dr. ${doctorFirstName} ${doctorLastName}`,
    appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
    appointmentTime,
    appointmentType: appointmentType.split("_").join(" ").toUpperCase(),
    patientNameOnPrescription,
    patientMobileNumber,
    patientSymptoms,
    consultationFees: `SLE ${parseInt(consultationFees, 10)}`,
    specialtyId,
    specialty,
    timeSlot,
    meetingId,
    meetingJoinUrl,
    appointmentStartTime,
    appointmentEndTime,
    appointmentStatus,
    paymentMethod,
    paymentStatus,
    paymentTransactionId,
    cancelledReason,
    cancelledAt,
    cancelledBy,
    postponedReason,
    postponeDate,
    postponedBy,
    createdAt,
  };
};

exports.mapPatientMedicalHistoryRow = (medicalHistory) => {
  const {
    medical_history_id: medicalHistoryId,
    patient_id: patientId,
    height,
    weight,
    allergies,
    is_patient_disabled: isDisabled,
    disability_description: disabilityDesc,
    tobacco_use: tobaccoIntake,
    tobacco_use_frequency: tobaccoIntakeFreq,
    alcohol_use: alcoholIntake,
    alcohol_use_frequency: alcoholIntakeFreq,
    caffine_use: caffineIntake,
    caffine_use_frequency: caffineIntakeFreq,
  } = medicalHistory;
  return {
    medicalHistoryId,
    patientId,
    height,
    weight,
    allergies,
    isDisabled: isDisabled !== 0,
    disabilityDesc,
    tobaccoIntake: tobaccoIntake !== null,
    tobaccoIntakeFreq,
    alcoholIntake: alcoholIntake !== 0,
    alcoholIntakeFreq,
    caffineIntake: caffineIntake !== null,
    caffineIntakeFreq,
  };
};

exports.mapAppointmentPrescriptionRow = (prescription) => {
  const {
    prescription_id: prescriptionId,
    appointment_id: appointmentId,
    created_at: dateCreated,
    updated_at: dateUpdated,
    access_jwt: hashedToken,
    diagnosis,
    medicines,
    doctors_comment: doctorComment,
  } = prescription;

  const decryptedDiagnosis = safeDecrypt(diagnosis, hashedToken);
  const decryptedMedicines = safeDecrypt(medicines, hashedToken);
  const decryptedComment = safeDecrypt(doctorComment, hashedToken);

  let medicinesParsed = null;
  if (decryptedMedicines) {
    try {
      medicinesParsed = JSON.parse(decryptedMedicines);
    } catch (e) {
      console.error(e);
      medicinesParsed = null;
    }
  }

  return {
    prescriptionId,
    appointmentId,
    diagnosis: decryptedDiagnosis,
    medicines: medicinesParsed,
    comment: decryptedComment,
    createdAt: dateCreated,
    updatedAt: dateUpdated,
  };
};

exports.mapDoctorRow = async (doctor, includeProfilePicBytes = false) => {
  let doctorAvailableDays = [];
  const {
    doctor_id: doctorId,
    title,
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    gender,
    professional_summary: professionalSummary,
    profile_pic_url: profilePic,
    specialization_id: specialtyId,
    speciality_name: specialization,
    qualifications,
    consultation_fee: consultationFee,
    city_name: location,
    latitude,
    longitude,
    years_of_experience: yearOfExperience,
    is_profile_approved: isProfileApproved,
    mobile_number: mobileNumber,
    email,
    user_type: userType,
    is_account_active: isAccountActive,
    is_online: isOnline,
  } = doctor;

  let profilePicData = null;
  if (profilePic) {
    profilePicData = includeProfilePicBytes
      ? await getPublicFileUrlFromS3Bucket(profilePic)
      : await getFileUrlFromS3Bucket(profilePic);
  }

  const mappedAvailableDays =
    await availableDaysDB.getDoctorsAvailableDays(doctorId);
  if (mappedAvailableDays && mappedAvailableDays.length > 0) {
    doctorAvailableDays = mappedAvailableDays.map((day) => ({
      dayId: day.day_slot_id,
      day: day.day_of_week,
      startTime: day.day_start_time,
      endTime: day.day_end_time,
      isAvailable: day.is_available,
    }));
  }
  return {
    doctorId,
    title,
    firstName,
    middleName,
    lastName,
    gender,
    professionalSummary,
    profilePic: profilePicData || null,
    specialtyId,
    specialization,
    qualifications,
    consultationFee,
    location,
    latitude,
    longitude,
    yearOfExperience,
    isProfileApproved,
    mobileNumber,
    email,
    userType,
    isAccountActive,
    isOnline,
    doctorAvailableDays,
  };
};

exports.mapDoctorUserProfileRow = async (doctor) => {
  let doctorAvailableDays = [];
  const {
    doctor_id: doctorId,
    title,
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    gender,
    professional_summary: professionalSummary,
    profile_pic_url: profilePic,
    specialization_id: specialtyId,
    speciality_name: specialization,
    qualifications,
    consultation_fee: consultationFees,
    city_name: city,
    years_of_experience: yearOfExperience,
    is_profile_approved: isProfileApproved,
    mobile_number: mobileNumber,
    email,
    is_online: isOnline,
    user_id: userId,
    user_type: userType,
  } = doctor;
  const imageUrl = profilePic ? await getFileUrlFromS3Bucket(profilePic) : null;
  const mappedAvailableDays =
    await availableDaysDB.getDoctorsAvailableDays(doctorId);
  if (mappedAvailableDays && mappedAvailableDays.length > 0) {
    doctorAvailableDays = mappedAvailableDays.map((day) => ({
      dayId: day.day_slot_id,
      day: day.day_of_week,
      startTime: day.day_start_time,
      endTime: day.day_end_time,
      isAvailable: day.is_available,
    }));
  }
  return {
    doctorId,
    userId,
    userType,
    title,
    firstName,
    middleName,
    lastName,
    gender,
    mobileNumber,
    email,
    professionalSummary,
    profilePic: imageUrl,
    specialtyId,
    specialization,
    qualifications,
    consultationFees,
    city,
    yearOfExperience,
    isProfileApproved,
    isOnline,
    doctorAvailableDays,
  };
};

exports.mapPatientAppointment = (appointment) => {
  const {
    appointment_id: appointmentId,
    appointment_uuid: appointmentUUID,
    patient_id: patient,
    first_name: firstName,
    last_name: lastName,
    gender,
    doctor_id: doctorId,
    doctor_first_name: doctorFirstName,
    doctor_last_name: doctorLastName,
    appointment_type: appointmentType,
    appointment_date: appointmentDate,
    appointment_time: appointmentTime,
    patient_name_on_prescription: patientNameOnPrescription,
    patient_mobile_number: patientMobileNumber,
    patient_symptoms: patientSymptoms,
    consultation_fee: consultationFees,
    specialization_id: specialtyId,
    specialty_name: specialty,
    time_slot: timeSlot,
    meeting_id: meetingId,
    join_url: meetingJoinUrl,
    start_time: appointmentStartTime,
    end_time: appointmentEndTime,
    appointment_status: appointmentStatus,
    cancelled_reason: cancelledReason,
    cancelled_at: cancelledAt,
    cancelled_by: cancelledBy,
    postponed_reason: postponedReason,
    postponed_date: postponeDate,
    postponed_by: postponedBy,
    created_at: createdAt,
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    transactionId: paymentTransactionId,
  } = appointment;
  return {
    appointmentId,
    appointmentUUID,
    patient,
    username: `${firstName} ${lastName}`,
    gender,
    doctorId,
    doctorName: `Dr. ${doctorFirstName} ${doctorLastName}`,
    appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
    appointmentTime,
    appointmentType: appointmentType.split("_").join(" ").toUpperCase(),
    patientNameOnPrescription,
    patientMobileNumber,
    patientSymptoms,
    consultationFees: `SLE ${parseInt(consultationFees, 10)}`,
    specialtyId,
    specialty,
    timeSlot,
    meetingId,
    meetingJoinUrl,
    appointmentStartTime,
    appointmentEndTime,
    appointmentStatus,
    paymentMethod,
    paymentStatus,
    paymentTransactionId,
    cancelledReason,
    cancelledAt,
    cancelledBy,
    postponedReason,
    postponeDate,
    postponedBy,
    createdAt,
  };
};

exports.mapTestimonialRow = async (testimonial, includeImageUrl = false) => {
  const {
    testimonial_id: testimonialId,
    first_name: firstName,
    last_name: lastName,
    profile_pic_url: patientPic,
    testimonial_content: content,
    is_active: isActive,
    is_approved: isApproved,
    approved_by: approvedBy,
  } = testimonial;
  let imageData;
  if (!patientPic) {
    imageData = null;
  } else if (includeImageUrl) {
    imageData = await getPublicFileUrlFromS3Bucket(patientPic);
  } else {
    imageData = await getFileUrlFromS3Bucket(patientPic);
  }
  return {
    testimonialId,
    patientName: `${firstName} ${lastName}`,
    patientPic: imageData,
    content,
    isActive,
    isApproved,
    approvedBy,
  };
};

exports.mapSpecialityRow = async (
  speciality,
  includeTags = false,
  includeImageUrl = false,
) => {
  const {
    speciality_id: specialtyId,
    speciality_name: specialtyName,
    speciality_description: description,
    tags,
    image_url: imageUrl,
    is_active: isActive,
    inputted_by: inputtedBy,
  } = speciality;
  let imageData = null;
  if (imageUrl) {
    imageData = includeImageUrl
      ? await getPublicFileUrlFromS3Bucket(imageUrl)
      : await getFileUrlFromS3Bucket(imageUrl);
  }
  return {
    specialtyId,
    specialtyName: he.decode(specialtyName),
    description: he.decode(description),
    imageUrl: imageData || null,
    tags: includeTags ? JSON.parse(tags) : null,
    isActive,
    inputtedBy,
  };
};

exports.mapUserRow = (
  user,
  includePassword = false,
  includeReferralCode = false,
  includeVerificationToken = false,
  includeExpiryTime = false,
) => {
  const {
    user_id: userId,
    mobile_number: mobileNumber,
    email,
    user_type: userType,
    is_verified: accountVerified,
    is_account_active: accountActive,
    is_online: isOnline,
    is_2fa_enabled: is2faEnabled,
    password,
    referral_code: referralCode,
    verification_token: verificationToken,
    expiry_time: verificationExpiry,
  } = user;
  const mapped = {
    userId,
    mobileNumber,
    email,
    userType,
    accountVerified,
    accountActive,
    isOnline,
    is2faEnabled,
    password,
  };
  if (includePassword) {
    mapped.password = password;
  }

  if (includeReferralCode) {
    mapped.referralCode = referralCode;
  }

  if (includeVerificationToken) {
    mapped.verificationToken = verificationToken;
  }

  if (includeExpiryTime) {
    mapped.verificationExpiry = verificationExpiry;
  }

  return mapped;
};

exports.mapPatientMedicalDocumentRow = async (
  document,
  includeDocumentUrl = false,
) => {
  const {
    sharing_id: sharingId,
    document_id: documentId,
    document_uuid: documentUUID,
    document_title: documentTitle,
    patient_id: patientId,
    patient_first_name: patientFirstName,
    patient_last_name: patientLastName,
    doctor_first_name: doctorFirstName,
    doctor_last_name: doctorLastName,
    note,
    created_at: createdAt,
  } = document;

  const mapped = {
    sharingId,
    documentId,
    documentUUID,
    documentTitle,
    patientId,
    patientName: `${patientFirstName} ${patientLastName}`,
    doctorName: `Dr. ${doctorFirstName} ${doctorLastName}`,
    note,
    createdAt,
  };

  if (includeDocumentUrl) {
    const documentUrl = await getFileUrlFromS3Bucket(documentUUID);
    mapped.documentUrl = documentUrl;
  }

  return mapped;
};

exports.mapPatientDocumentRow = async (document, includeFileUrl = false) => {
  const {
    medical_document_id: documentId,
    document_uuid: documentUUID,
    document_title: documentTitle,
    mimetype: mimeType,
  } = document;

  const mapped = {
    documentId,
    documentUUID,
    documentTitle,
    mimeType,
  };

  if (includeFileUrl) {
    const fileUrl = await getFileUrlFromS3Bucket(documentUUID);
    mapped.fileUrl = fileUrl;
  }

  return mapped;
};

exports.mapPatientRow = async (patient) => {
  const {
    patient_id: patientId,
    title,
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    gender,
    profile_pic_url: profilePic,
    dob,
    mobile_number: mobileNumber,
    email,
    user_type: userType,
    user_id: userId,
    is_account_active: isAccountActive,
    is_online: isOnline,
  } = patient;
  const imageUrl = profilePic ? await getFileUrlFromS3Bucket(profilePic) : null;
  return {
    patientId,
    title,
    firstName,
    middleName,
    lastName,
    gender,
    profilePic: imageUrl,
    dob: moment(dob).format("YYYY-MM-DD"),
    mobileNumber,
    email,
    userType,
    userId,
    isAccountActive,
    isOnline,
  };
};

exports.mapMedicalRecordRow = (medicalRecord) => {
  const {
    height,
    weight,
    allergies,
    is_patient_disabled: isDisabled,
    disability_description: disabilityDesc,
    tobacco_use: tobaccoIntake,
    tobacco_use_frequency: tobaccoIntakeFreq,
    alcohol_use: alcoholIntake,
    alcohol_use_frequency: alcoholIntakeFreq,
    caffine_use: caffineIntake,
    caffine_use_frequency: caffineIntakeFreq,
  } = medicalRecord;
  return {
    height,
    weight,
    allergies,
    isDisabled: isDisabled !== 0,
    disabilityDesc,
    tobaccoIntake: tobaccoIntake !== null,
    tobaccoIntakeFreq,
    alcoholIntake: alcoholIntake !== 0,
    alcoholIntakeFreq,
    caffineIntake: caffineIntake !== null,
    caffineIntakeFreq,
  };
};

exports.mapPrescriptionRow = (
  prescription,
  hashedToken = null,
  includeDiagnosis = false,
  includeMedicines = false,
  includeComments = false,
) => {
  const {
    prescription_id: prescrtiptionId,
    appointment_id: appointmentId,
    diagnosis,
    medicines,
    doctors_comment: doctorComment,
    created_at: dateCreated,
    updated_at: dateUpdated,
  } = prescription;
  const mapped = {
    prescrtiptionId,
    appointmentId,
    createdAt: moment(dateCreated).format("YYYY-MM-DD"),
    updatedAt: moment(dateUpdated).format("YYYY-MM-DD"),
  };

  if (includeDiagnosis) {
    mapped.diagnosis = safeDecrypt(diagnosis, hashedToken);
  }

  if (includeMedicines) {
    const decryptedMedicines = safeDecrypt(medicines, hashedToken);
    let medicinesParsed = null;
    if (decryptedMedicines) {
      try {
        medicinesParsed = JSON.parse(decryptedMedicines);
      } catch (e) {
        console.error(e);
        medicinesParsed = null;
      }
    }
    mapped.medicines = medicinesParsed;
  }

  if (includeComments) {
    mapped.comment = safeDecrypt(doctorComment, hashedToken);
  }

  return mapped;
};

exports.mapApiClientsRow = (client) => {
  const {
    // client_id: clientId,
    client_uuid: clientUuid,
    name: clientName,
    description: clientDescription,
    contact_email: clientEmail,
    contact_phone: clientPhone,
    website: clientWebsite,
    created_at: createdAt,
    updated_at: updatedAt,
  } = client;
  return {
    clientUuid,
    clientName,
    clientDescription: clientDescription || null,
    clientEmail: clientEmail || null,
    clientPhone: clientPhone || null,
    clientWebsite: clientWebsite ? he.decode(clientWebsite) : null,
    createdAt,
    updatedAt,
  };
};

exports.mapApiKeyRow = (key) => {
  const {
    key_uuid: keyUuid,
    name: clientName,
    website,
    name,
    description,
    environment,
    api_key: apiKey,
    is_active: isActive,
    expires_at: expiresAt,
    last_used_at: lastUsed,
    created_at: createdAt,
    updated_at: updatedAt,
  } = key;
  return {
    keyUuid,
    clientName,
    website: website ? he.decode(website) : null,
    name,
    description,
    environment,
    apiKey,
    isActive,
    expiresAt,
    lastUsed,
    createdAt,
    updatedAt,
  };
};
