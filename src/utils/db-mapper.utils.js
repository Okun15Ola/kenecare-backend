const moment = require("moment");
const he = require("he");
const { decryptText } = require("./auth.utils");
const availableDaysDB = require("../repository/doctorAvailableDays.repository");
const {
  getApprovedDoctorReviewsByDoctorId,
} = require("../repository/doctorReviews.repository");
const { fetchAndCacheUrl, fetchAndCachePublicUrl } = require("./caching.utils");

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

  if (includeImageUrl) {
    finalImage = await fetchAndCachePublicUrl(
      `symptom_public_img:${symptomId}`,
      imageUrl,
    );
  } else {
    finalImage = await fetchAndCacheUrl(
      `symptom_private_img:${symptomId}`,
      imageUrl,
    );
  }

  return {
    symptomId,
    name: name?.toUpperCase() || "",
    description: description || "",
    specialty,
    imageUrl: finalImage,
    consultationFee,
    tags: tags || "",
    isActive: Boolean(isActive),
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
    description: description || "",
    imageUrl,
    isActive: Boolean(isActive),
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
    email: email || "N/A",
    address: address || "N/A",
    mobileNumber,
    isActive: Boolean(isActive),
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
    updated_at: updatedAt,
  } = appointments;
  const patientFirstName = decryptText(firstName);
  const patientLastName = decryptText(lastName);
  const patientDecryptedSymptoms = decryptText(patientSymptoms);
  return {
    appointmentId,
    appointmentUUID,
    patient,
    username: `${patientFirstName} ${patientLastName}`,
    doctorId,
    doctor: `Dr. ${doctorFirstName} ${doctorLastName}`,
    appointmentType,
    patientNameOnPrescription,
    patientMobileNumber,
    patientSymptoms: patientDecryptedSymptoms
      ? he.decode(patientDecryptedSymptoms)
      : null,
    consultationFees: `SLE ${parseInt(consultationFees, 10)}`,
    specialty,
    timeSlot,
    meetingId,
    appointmentStartTime: moment(appointmentStartTime).format("HH:mm:ss"),
    appointmentEndTime: moment(appointmentEndTime).format("HH:mm:ss"),
    appointmentStatus,
    cancelledReason: cancelledReason || "",
    cancelledAt: moment(cancelledAt).format("YYYY-MM-DD HH:mm"),
    cancelledBy,
    postponedReason: postponedReason || "",
    postponeDate: moment(postponeDate).format("YYYY-MM-DD HH:mm"),
    postponedBy,
    createAt: moment(createAt).format("YYYY-MM-DD HH:mm"),
    updatedAt: moment(updatedAt).format("YYYY-MM-DD HH:mm:ss"),
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
  let imageUrl = null;

  if (includeImageUrl) {
    imageUrl = await fetchAndCachePublicUrl(`blog_public_img:${blogId}`, image);
  } else {
    imageUrl = await fetchAndCacheUrl(`blog_private_img:${blogId}`, image);
  }
  return {
    blogId,
    blogCategory,
    blogTitle,
    description,
    image: imageUrl || null,
    tags: tags ? JSON.parse(tags) : null,
    disclaimer,
    author,
    featured,
    isActive: Boolean(isActive),
    createdAt: moment(createdAt).format("YYYY-MM-DD HH:mm"),
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
    isActive: Boolean(isActive),
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
  const documentUrl = await fetchAndCacheUrl(
    `doctor_reg_doc:${doctorId}`,
    regDocumentUrl,
  );

  const profileImageUrl = await fetchAndCacheUrl(
    `doctor_pic:${doctorId}`,
    doctorPic,
  );
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
    certIssuedDate: moment(certIssuedDate).format("YYYY-MM-DD HH:mm"),
    certExpiryDate: moment(certExpiryDate).format("YYYY-MM-DD HH:mm"),
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
    createdAt: moment(createdAt).format("YYYY-MM-DD HH:mm"),
    updatedAt: moment(updatedAt).format("YYYY-MM-DD HH:mm:ss"),
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
  const documentUrl = await fetchAndCacheUrl(
    `marketer_doc:${marketerId}`,
    idDocumentUuuid,
  );
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
    idDocumentUrl: documentUrl,
    nin,
    firstEmergencyContactName,
    firstEmergencyContactNumber,
    firstEmergencyContactAddress,
    secondEmergencyContactName,
    secondEmergencyContactNumber,
    secondEmergencyContactAddress,
    createdAt: moment(createdAt).format("YYYY-MM-DD HH:mm"),
    updatedAt: moment(updatedAt).format("YYYY-MM-DD HH:mm"),
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
    updated_at: updatedAt,
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    transactionId: paymentTransactionId,
  } = doctorAppointment;
  const patientFirstName = decryptText(firstName);
  const patientLastName = decryptText(lastName);
  const patientDecryptedSymptoms = decryptText(patientSymptoms);
  const decryptedPatientNameOnPrescription = decryptText(
    patientNameOnPrescription,
  );
  return {
    appointmentId,
    appointmentUUID,
    patient,
    username: `${patientFirstName} ${patientLastName}`,
    doctorId,
    doctorName: `${title} ${doctorFirstName} ${doctorLastName}`,
    appointmentDate,
    appointmentTime,
    appointmentType,
    patientNameOnPrescription: decryptedPatientNameOnPrescription,
    patientMobileNumber,
    patientSymptoms: patientDecryptedSymptoms
      ? he.decode(patientDecryptedSymptoms)
      : null,
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
    createdAt: moment(createdAt).format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment(updatedAt).format("YYYY-MM-DD HH:mm:ss"),
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
    createdAt: moment(createdAt).format("YYYY-MM-DD HH:mm"),
    updatedAt: moment(updatedAt).format("YYYY-MM-DD HH:mm:ss"),
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
  const documentUrl = await fetchAndCacheUrl(
    `registration_doc:${regDocumentUrl}`,
    regDocumentUrl,
  );

  const profileImageUrl = await fetchAndCacheUrl(
    `doctor_pic:${doctorPic}`,
    doctorPic,
  );
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
    certIssuedDate: moment(certIssuedDate).format("YYYY-MM-DD HH:mm"),
    certExpiryDate: moment(certExpiryDate).format("YYYY-MM-DD HH:mm"),
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
  const decryptedPatientFirstName = decryptText(patientFirstName);
  const decryptedPatientLastName = decryptText(patientLastName);
  const mapped = {
    sharingId,
    documentId,
    documentUUID,
    documentTitle,
    patientId,
    patientName: `${decryptedPatientFirstName} ${decryptedPatientLastName}`,
    doctorName: `${title} ${doctorFirstName} ${doctorLastName}`,
    note,
    createdAt,
  };
  if (includeDocumentUrl && documentUUID !== null) {
    const documentUrl = await fetchAndCacheUrl(
      `shared_doc:${documentUUID}`,
      documentUUID,
    );
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
  const patientFirstName = decryptText(firstName);
  const patientLastName = decryptText(lastName);
  const patientDecryptedSymptoms = decryptText(patientSymptoms);
  const decryptedPatientNameOnPrescription = decryptText(
    patientNameOnPrescription,
  );
  return {
    appointmentId,
    appointmentUUID,
    patient,
    username: `${patientFirstName} ${patientLastName}`,
    gender,
    doctorId,
    doctorName: `Dr. ${doctorFirstName} ${doctorLastName}`,
    appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
    appointmentTime,
    appointmentType: appointmentType.split("_").join(" ").toUpperCase(),
    patientNameOnPrescription: decryptedPatientNameOnPrescription,
    patientMobileNumber,
    patientSymptoms: patientDecryptedSymptoms
      ? he.decode(patientDecryptedSymptoms)
      : null,
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

exports.mapDoctorRow = async (doctor, includeProfilePicBytes = false) => {
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
    last_seen_at: lastSeen,
    registration_status: councilRegistrationStatus,
  } = doctor;

  let profilePicData = null;

  if (includeProfilePicBytes) {
    profilePicData = await fetchAndCachePublicUrl(
      `doctor_public_profile_pic:${doctorId}`,
      profilePic,
    );
  } else {
    profilePicData = await fetchAndCacheUrl(
      `doctor_private_profile_pic:${doctorId}`,
      profilePic,
    );
  }

  let mappedReviews = [];
  const fetchedReviews = await getApprovedDoctorReviewsByDoctorId(doctorId);
  if (fetchedReviews && fetchedReviews.length) {
    mappedReviews = fetchedReviews.map((review) => {
      const {
        feedback_id: reviewId,
        first_name: patientFirstName,
        last_name: patientLastName,
        feedback_content: reviewContent,
      } = review;

      const decryptedPatientFirstName = decryptText(patientFirstName);
      const decryptedPatientLastName = decryptText(patientLastName);

      return {
        reviewId,
        patient: `${decryptedPatientFirstName} ${decryptedPatientLastName}`,
        review: reviewContent,
      };
    });
  }

  const mapped = {
    doctorId,
    title,
    firstName,
    middleName,
    lastName,
    gender,
    professionalSummary: he.decode(professionalSummary),
    profilePic: profilePicData || null,
    specialtyId,
    specialization,
    qualifications: he.decode(qualifications),
    consultationFee,
    location,
    latitude,
    longitude,
    yearOfExperience,
    isProfileApproved: Boolean(isProfileApproved),
    mobileNumber,
    email,
    userType,
    isAccountActive: Boolean(isAccountActive),
    isOnline: Boolean(isOnline),
    councilRegistrationStatus,
    reviews: mappedReviews,
  };

  if (isOnline === 0) {
    mapped.lastSeen = moment(lastSeen, "YYYY-MM-DD HH:mm:ss").fromNow();
  }

  return mapped;
};

exports.mapDoctorUserProfileRow = async (doctor) => {
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
    last_seen_at: lastSeen,
    user_id: userId,
    user_type: userType,
    registration_status: councilRegistrationStatus,
    certificate_expiry_date: certificateExpiryDate,
  } = doctor;
  const imageUrl = await fetchAndCacheUrl(
    `doctor_private_profile_pic:${doctorId}`,
    profilePic,
  );
  const rawAvailableDays =
    await availableDaysDB.getDoctorsAvailableDays(doctorId);
  const doctorAvailableDays =
    rawAvailableDays && rawAvailableDays.length > 0
      ? rawAvailableDays.map((day) => ({
          dayId: day.day_slot_id,
          day: day.day_of_week,
          startTime: day.day_start_time,
          endTime: day.day_end_time,
          isAvailable: Boolean(day.is_available),
        }))
      : [];
  const mapped = {
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
    professionalSummary: he.decode(professionalSummary),
    profilePic: imageUrl,
    specialtyId,
    specialization,
    qualifications: he.decode(qualifications),
    consultationFees,
    city,
    yearOfExperience,
    isProfileApproved: Boolean(isProfileApproved),
    isOnline: Boolean(isOnline),
    councilRegistrationStatus,
  };

  if (isOnline === 0) {
    mapped.lastSeen = moment(lastSeen, "YYYY-MM-DD HH:mm:ss").fromNow();
  }

  const expiryMoment = moment(certificateExpiryDate);
  const now = moment();
  if (expiryMoment.isSameOrBefore(now, "day")) {
    mapped.certificateExpiryDate = moment(certificateExpiryDate).format(
      "YYYY-MM-DD",
    );
  }

  mapped.doctorAvailableDays = doctorAvailableDays;

  return mapped;
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
    updated_at: updatedAt,
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    transactionId: paymentTransactionId,
  } = appointment;
  const patientFirstName = decryptText(firstName);
  const patientLastName = decryptText(lastName);
  const patientDecryptedSymptoms = decryptText(patientSymptoms);
  const decryptedPatientNameOnPrescription = decryptText(
    patientNameOnPrescription,
  );
  return {
    appointmentId,
    appointmentUUID,
    patient,
    username: `${patientFirstName} ${patientLastName}`,
    gender,
    doctorId,
    doctorName: `Dr. ${doctorFirstName} ${doctorLastName}`,
    appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
    appointmentTime,
    appointmentType: appointmentType.split("_").join(" ").toUpperCase(),
    patientNameOnPrescription: decryptedPatientNameOnPrescription,
    patientMobileNumber,
    patientSymptoms: patientDecryptedSymptoms
      ? he.decode(patientDecryptedSymptoms)
      : null,
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
    createdAt: moment(createdAt).format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment(updatedAt).format("YYYY-MM-DD HH:mm:ss"),
  };
};

exports.mapTestimonialRow = async (
  testimonial,
  includeImageUrl = false,
  includeAprroval = false,
) => {
  const {
    testimonial_id: testimonialId,
    first_name: firstName,
    last_name: lastName,
    profile_pic_url: patientPic,
    patient_id: patientId,
    testimonial_content: content,
    is_active: isActive,
    is_approved: isApproved,
    approved_by: approvedBy,
  } = testimonial;
  let imageData;
  const patientFirstName = decryptText(firstName);
  const patientLastName = decryptText(lastName);
  const mapped = {
    testimonialId,
    patientName: `${patientFirstName} ${patientLastName}`,
    patientPic: imageData,
    content: he.decode(content),
  };

  if (includeImageUrl) {
    imageData = await fetchAndCachePublicUrl(
      `patient_public_profile_pic:${patientId}`,
      patientPic,
    );
    mapped.patientPic = imageData;
  } else {
    imageData = await fetchAndCacheUrl(
      `patient_private_profile_pic:${patientId}`,
      patientPic,
    );
    mapped.patientPic = imageData;
  }

  if (includeAprroval) {
    mapped.isActive = Boolean(isActive);
    mapped.isApproved = Boolean(isApproved);
    mapped.approvedBy = approvedBy;
  }

  return mapped;
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
  if (includeImageUrl) {
    imageData = await fetchAndCachePublicUrl(
      `speciality_public_img:${specialtyId}`,
      imageUrl,
    );
  } else {
    imageData = await fetchAndCacheUrl(
      `speciality_private_img:${specialtyId}`,
      imageUrl,
    );
  }
  return {
    specialtyId,
    specialtyName: he.decode(specialtyName),
    description: he.decode(description),
    imageUrl: imageData || null,
    tags: includeTags ? JSON.parse(tags) : null,
    isActive: Boolean(isActive),
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
  const decryptedPatientFirstName = decryptText(patientFirstName);
  const decryptedPatientLastName = decryptText(patientLastName);
  const mapped = {
    sharingId,
    documentId,
    // documentUUID,
    documentTitle,
    patientId,
    patientName: `${decryptedPatientFirstName} ${decryptedPatientLastName}`,
    doctorName: `Dr. ${doctorFirstName} ${doctorLastName}`,
    note,
    createdAt: moment(createdAt).format("YYYY-MM-DD HH:mm"),
  };

  if (includeDocumentUrl) {
    const documentUrl = await fetchAndCacheUrl(
      `patient_med_doc:${patientId}`,
      documentUUID,
    );
    mapped.documentUrl = documentUrl;
  }

  return mapped;
};

exports.mapPatientDocumentRow = async (document, includeFileUrl = false) => {
  const {
    medical_document_id: documentId,
    document_uuid: documentUUID,
    document_title: documentTitle,
    // mimetype: mimeType,
  } = document;

  const mapped = {
    documentId,
    // documentUUID,
    documentTitle,
    // mimeType,
  };

  if (includeFileUrl) {
    const fileUrl = await fetchAndCacheUrl(
      `patient_doc:${documentId}`,
      documentUUID,
    );
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
    last_seen_at: lastSeen,
    created_at: createdAt,
    updated_at: updatedAt,
  } = patient;
  const imageUrl = await fetchAndCacheUrl(
    `patient_pic:${patientId}`,
    profilePic,
  );
  const mapped = {
    patientId,
    firstName: decryptText(firstName),
    middleName: decryptText(middleName),
    lastName: decryptText(lastName),
    gender,
    profilePic: imageUrl,
    dob: moment(dob).format("YYYY-MM-DD"),
    mobileNumber,
    email: email || null,
    userType,
    userId,
    isAccountActive: Boolean(isAccountActive),
    isOnline: Boolean(isOnline),
    createdAt: moment(createdAt).format("YYYY-MM-DD: HH:mm"),
    updatedAt: moment(updatedAt).format("YYYY-MM-DD HH:mm:ss"),
  };

  if (title) {
    mapped.title = title;
  }

  if (isOnline === 0) {
    mapped.lastSeen = moment(lastSeen, "YYYY-MM-DD HH:mm:ss").fromNow();
  }

  return mapped;
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
    createdAt: moment(dateCreated).format("YYYY-MM-DD HH:mm"),
    updatedAt: moment(dateUpdated).format("YYYY-MM-DD HH:mm:ss"),
  };

  if (includeDiagnosis) {
    const decryptedDiagnosis = decryptText(diagnosis);
    mapped.diagnosis = decryptedDiagnosis || null;
  }

  if (includeMedicines) {
    const decryptedMedicines = decryptText(medicines);
    mapped.medicines = decryptedMedicines
      ? JSON.parse(decryptedMedicines)
      : null;
  }

  if (includeComments) {
    const decryptedComment = decryptText(doctorComment);
    mapped.comment = decryptedComment || null;
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
    description: description || null,
    environment,
    apiKey,
    isActive: Boolean(isActive),
    expiresAt: moment(expiresAt).format("YYYY-MM-DD HH:mm"),
    lastUsed: moment(lastUsed).format("YYYY-MM-DD HH:mm:ss"),
    createdAt: moment(createdAt).format("YYYY-MM-DD HH:mm"),
    updatedAt: moment(updatedAt).format("YYYY-MM-DD HH:mm:ss"),
  };
};

exports.mapDoctorBlog = async (blog) => {
  const {
    blog_uuid: blogUuid,
    doctor_id: doctorId,
    title,
    content,
    status,
    image,
    tags,
    created_at: createdAt,
    published_at: publishedAt,
    updated_at: updatedAt,
  } = blog;

  let imageUrl = null;
  if (image) {
    imageUrl = await fetchAndCachePublicUrl(
      `doctor_blog_img:${doctorId}`,
      image,
    );
  }

  let parsedTags = null;
  if (tags) {
    try {
      parsedTags = JSON.parse(tags);
      if (Array.isArray(parsedTags)) {
        parsedTags = parsedTags.map((tag) => he.decode(tag));
      }
    } catch (error) {
      console.error("Error parsing blog tags:", error);
      parsedTags = null;
    }
  }

  return {
    blogUuid,
    doctorId,
    title: title ? he.decode(title) : null,
    content: content ? he.decode(content) : null,
    status,
    image: imageUrl,
    tags: parsedTags,
    createdAt: moment(createdAt).format("YYYY-MM-DD HH:mm"),
    publishedAt: publishedAt
      ? moment(publishedAt).format("YYYY-MM-DD HH:mm")
      : null,
    updatedAt: moment(updatedAt).format("YYYY-MM-DD HH:mm:ss"),
  };
};

exports.mapAppointmentFeedback = (feedbacks) => {
  const {
    appointment_feedback_id: feedbackId,
    appointment_id: appointmentId,
    feedback_content: feedback,
    created_at: createdAt,
    updated_at: updatedAt,
  } = feedbacks;
  return {
    feedbackId,
    appointmentId,
    feedback: feedback ? he.decode(feedback) : null,
    createdAt: moment(createdAt).format("YYYY-MM-DD HH:mm"),
    updatedAt: moment(updatedAt).format("YYYY-MM-DD HH:mm:ss"),
  };
};

exports.mapDoctorReview = (reviews, includeApproval = false) => {
  const {
    feedback_id: reviewId,
    doctor_id: doctorId,
    doctorName,
    first_name: patientFirstName,
    last_name: patientLastName,
    patient_id: patientId,
    feedback_content: review,
    is_feedback_approved: isApproved,
    created_at: createdAt,
    updated_at: updatedAt,
  } = reviews;
  const decryptedPatientFirstName = decryptText(patientFirstName);
  const decryptedPatientLastName = decryptText(patientLastName);
  const mapped = {
    reviewId,
    doctorId,
    doctor: `Dr. ${doctorName}`,
    patientId,
    patient: `${decryptedPatientFirstName} ${decryptedPatientLastName}`,
    review,
    createdAt: moment(createdAt).format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment(updatedAt).format("YYYY-MM-DD HH:mm:ss"),
  };

  if (includeApproval) {
    mapped.isApproved = isApproved;
  }
  return mapped;
};
