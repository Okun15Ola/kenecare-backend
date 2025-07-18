
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile_number` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `is_account_active` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `uq_admin_email` (`email`),
  UNIQUE KEY `uq_admin_mobile_number` (`mobile_number`),
  CONSTRAINT `chk_is_account_active` CHECK ((`is_account_active` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `appointment_feedbacks`;

CREATE TABLE `appointment_feedbacks` (
  `appointment_feedback_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `feedback_content` varchar(1000) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_feedback_id`),
  KEY `fk_feedback_appointment_id` (`appointment_id`),
  CONSTRAINT `fk_appointment_feedback` FOREIGN KEY (`appointment_id`) REFERENCES `medical_appointments` (`appointment_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `appointment_followup`;

CREATE TABLE `appointment_followup` (
  `followup_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `followup_date` date NOT NULL,
  `followup_time` time NOT NULL,
  `reason` varchar(1000) DEFAULT NULL,
  `followup_status` enum('pending','completed','canceled') DEFAULT 'pending',
  `followup_type` enum('online_consultation','doctor_visit','patient_visit') DEFAULT NULL,
  `meeting_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `doctor_id` int DEFAULT NULL,
  PRIMARY KEY (`followup_id`),
  KEY `fk_followup_appointment` (`appointment_id`),
  KEY `fk_followup_meeting` (`meeting_id`),
  KEY `fk_followup_doctor` (`doctor_id`),
  CONSTRAINT `fk_followup_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `medical_appointments` (`appointment_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_followup_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_followup_meeting` FOREIGN KEY (`meeting_id`) REFERENCES `zoom_meetings` (`meeting_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `appointment_payments`;

CREATE TABLE `appointment_payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `amount_paid` decimal(10,6) NOT NULL,
  `currency` varchar(15) DEFAULT 'SLL',
  `payment_method` varchar(100) NOT NULL,
  `order_id` varchar(255) NOT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `payment_token` varchar(255) DEFAULT NULL,
  `notification_token` varchar(255) DEFAULT NULL,
  `payment_status` varchar(100) NOT NULL DEFAULT 'initiated',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `uq_appointment_id` (`appointment_id`),
  KEY `fk_payment_appointment_id` (`appointment_id`),
  CONSTRAINT `fk_payment_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `medical_appointments` (`appointment_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=351 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `appointment_prescriptions`;

CREATE TABLE `appointment_prescriptions` (
  `prescription_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `diagnosis` varchar(1000) DEFAULT NULL,
  `medicines` text NOT NULL,
  `pharmacy_id` int DEFAULT NULL,
  `date_dispensed` date DEFAULT NULL,
  `pharmacist_name` varchar(200) DEFAULT NULL,
  `paharmacy_name` varchar(500) DEFAULT NULL,
  `pharmacy_contact` varchar(50) DEFAULT NULL,
  `doctors_comment` varchar(500) DEFAULT NULL,
  `access_token` varchar(10) DEFAULT NULL,
  `access_jwt` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`prescription_id`),
  KEY `fk_prescription_appointment` (`appointment_id`),
  CONSTRAINT `fk_prescription_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `medical_appointments` (`appointment_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `appointment_types`;

CREATE TABLE `appointment_types` (
  `appointment_type_id` int NOT NULL AUTO_INCREMENT,
  `appointment_type_name` varchar(255) NOT NULL,
  `inputted_by` int NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_type_id`),
  UNIQUE KEY `uq_appointment_name` (`appointment_type_name`),
  KEY `fk_appointment_type_inputted_by` (`inputted_by`),
  CONSTRAINT `fk_appointment_type_inputted_by` FOREIGN KEY (`inputted_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE,
  CONSTRAINT `chk_is_appointment_type_active` CHECK ((`is_active` in (0,1)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `blog_categories`;

CREATE TABLE `blog_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  `inputted_by` int NOT NULL,
  `is_active` int NOT NULL DEFAULT '1' COMMENT '0 - False , 1 - True',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  KEY `fk_category_admin_id` (`inputted_by`),
  CONSTRAINT `fk_category_admin_id` FOREIGN KEY (`inputted_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `blogs`;

CREATE TABLE `blogs` (
  `blog_id` int NOT NULL AUTO_INCREMENT,
  `blog_category_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(255) NOT NULL,
  `tags` text,
  `disclaimer` varchar(1000) DEFAULT 'This content is for informational purposes only. Please consult your healthcare provider for personalized advice.',
  `inputted_by` int NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1' COMMENT '0 - False , 1 - True',
  `is_featured` tinyint NOT NULL DEFAULT '0' COMMENT '0 - False , 1 - True',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`blog_id`),
  KEY `fk_blog_category_id` (`blog_category_id`),
  KEY `fk_blog_admin_id` (`inputted_by`),
  CONSTRAINT `fk_blog_admin` FOREIGN KEY (`inputted_by`) REFERENCES `admins` (`admin_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_blog_category_id` FOREIGN KEY (`blog_category_id`) REFERENCES `blog_categories` (`category_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `cities`;

CREATE TABLE `cities` (
  `city_id` int NOT NULL AUTO_INCREMENT,
  `city_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `inputted_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`city_id`),
  UNIQUE KEY `uq_city_name` (`city_name`),
  KEY `fk_city_admin_id` (`inputted_by`),
  CONSTRAINT `fk_city_admin_id` FOREIGN KEY (`inputted_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `common_symptoms`;

CREATE TABLE `common_symptoms` (
  `symptom_id` int NOT NULL AUTO_INCREMENT,
  `symptom_name` varchar(255) NOT NULL,
  `symptom_descriptions` text NOT NULL,
  `speciality_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `general_consultation_fee` int NOT NULL DEFAULT '1',
  `tags` longtext,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `inputted_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`symptom_id`),
  KEY `fk_common_symptom_admin_id` (`inputted_by`),
  KEY `fk_common_symptom_speciality` (`speciality_id`),
  CONSTRAINT `fk_common_symptom_admin_id` FOREIGN KEY (`inputted_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_common_symptom_speciality` FOREIGN KEY (`speciality_id`) REFERENCES `medical_specialities` (`speciality_id`) ON UPDATE CASCADE,
  CONSTRAINT `general_consultation_fee` CHECK ((`general_consultation_fee` <> 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `doctor_available_days`;

CREATE TABLE `doctor_available_days` (
  `day_slot_id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `day_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `day_start_time` time DEFAULT NULL,
  `day_end_time` time DEFAULT NULL,
  `is_available` tinyint DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`day_slot_id`),
  UNIQUE KEY `uqc_doctor_day` (`doctor_id`,`day_of_week`),
  CONSTRAINT `fk_day_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `doctor_faqs`;

CREATE TABLE `doctor_faqs` (
  `faq_id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `question` varchar(255) DEFAULT NULL,
  `answer` varchar(1000) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1' COMMENT '0 - inactive, 1 - active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`faq_id`),
  KEY `fk_faq_doctor_id` (`doctor_id`),
  CONSTRAINT `fk_faq_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_is_faq_active` CHECK ((`is_active` in (0,1)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `doctor_feedbacks`;

CREATE TABLE `doctor_feedbacks` (
  `feedback_id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `feedback_content` varchar(1000) NOT NULL,
  `is_feedback_approved` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`feedback_id`),
  KEY `fk_feedback_doctor_id` (`doctor_id`),
  KEY `fk_feedback_patient_id` (`patient_id`),
  CONSTRAINT `fk_feedback_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_feedback_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON UPDATE CASCADE,
  CONSTRAINT `chk_is_feedback_approved` CHECK ((`is_feedback_approved` in (0,1)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `doctor_time_slots`;

CREATE TABLE `doctor_time_slots` (
  `time_slot_id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `day_slot_id` int NOT NULL,
  `slot_start_time` time NOT NULL,
  `slot_end_time` time NOT NULL,
  `is_slot_available` tinyint NOT NULL DEFAULT '1' COMMENT '0 - False | 1 - True',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`time_slot_id`),
  KEY `fk_time_slot_doctor_id` (`doctor_id`),
  KEY `fk_time_slot_day_id` (`day_slot_id`),
  CONSTRAINT `fk_slot_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_time_slot_day_id` FOREIGN KEY (`day_slot_id`) REFERENCES `doctor_available_days` (`day_slot_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_is_slot_available` CHECK ((`is_slot_available` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `doctors`;

CREATE TABLE `doctors` (
  `doctor_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(50) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `gender` enum('male','female') NOT NULL,
  `professional_summary` varchar(1000) DEFAULT NULL,
  `profile_pic_url` varchar(255) DEFAULT NULL,
  `specialization_id` int NOT NULL,
  `qualifications` varchar(1000) DEFAULT NULL,
  `consultation_fee` decimal(10,2) NOT NULL,
  `hospital_id` int DEFAULT NULL,
  `city_id` int NOT NULL,
  `years_of_experience` int NOT NULL DEFAULT '1',
  `is_profile_approved` tinyint NOT NULL DEFAULT '0' COMMENT '0 - False | 1 - True',
  `approved_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`doctor_id`),
  KEY `fk_doctor_user_id` (`user_id`),
  KEY `fk_doctor_city_id` (`city_id`),
  KEY `fk_doctor_specialization` (`specialization_id`),
  KEY `fk_doctor_approved_by` (`approved_by`),
  CONSTRAINT `fk_doctor_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_doctor_city_id` FOREIGN KEY (`city_id`) REFERENCES `cities` (`city_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_doctor_specialty` FOREIGN KEY (`specialization_id`) REFERENCES `medical_specialities` (`speciality_id`),
  CONSTRAINT `fk_doctor_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `doctors_council_registration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors_council_registration` (
  `council_registration_id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `medical_council_id` int NOT NULL,
  `registration_number` varchar(255) NOT NULL,
  `registration_year` varchar(6) DEFAULT NULL,
  `registration_document_url` varchar(255) DEFAULT NULL,
  `certificate_issued_date` date NOT NULL,
  `certificate_expiry_date` date NOT NULL,
  `registration_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `rejection_reason` text,
  `verified_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`council_registration_id`),
  KEY `fk_doctor_id` (`doctor_id`),
  KEY `fk_doctor_registration_council_id` (`medical_council_id`),
  KEY `fk_doctor_registration_admin_id` (`verified_by`),
  CONSTRAINT `fk_councilReg_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_doctor_registration_admin_id` FOREIGN KEY (`verified_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_doctor_registration_council_id` FOREIGN KEY (`medical_council_id`) REFERENCES `medical_councils` (`council_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `doctors_educational_background`
--

DROP TABLE IF EXISTS `doctors_educational_background`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors_educational_background` (
  `education_id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `institution_name` varchar(255) NOT NULL,
  `year_started` varchar(6) DEFAULT NULL,
  `year_completed` varchar(6) DEFAULT NULL,
  `degree_attained` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`education_id`),
  KEY `fk_education_doctor_id` (`doctor_id`),
  CONSTRAINT `fk_education_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `doctors_wallet`
--

DROP TABLE IF EXISTS `doctors_wallet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors_wallet` (
  `wallet_id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `balance` decimal(10,2) DEFAULT '0.00',
  `wallet_pin` varchar(100) DEFAULT '$2a$10$vP7hZi0rsfGzGlI44aKkKOFGpn8pTc5y04dvzXydBBjmfxrA18iD.',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`wallet_id`),
  KEY `fk_wallet_doctor` (`doctor_id`),
  CONSTRAINT `fk_wallet_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `marketers`
--

DROP TABLE IF EXISTS `marketers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketers` (
  `marketer_id` int NOT NULL AUTO_INCREMENT,
  `marketer_uuid` varchar(100) NOT NULL,
  `referral_code` varchar(20) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `middle_name` varchar(150) DEFAULT NULL,
  `last_name` varchar(150) NOT NULL,
  `gender` enum('male','female') NOT NULL,
  `dob` date DEFAULT NULL,
  `phone_number` varchar(50) NOT NULL,
  `phone_verification_token` varchar(10) DEFAULT NULL,
  `is_phone_verified` tinyint(1) DEFAULT '0',
  `phone_verified_at` timestamp NULL DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `email_verification_token` varchar(255) DEFAULT NULL,
  `is_email_verified` tinyint(1) DEFAULT '0',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `home_address` varchar(255) NOT NULL,
  `id_document_type` enum('passport','drivers_license','national_id') NOT NULL,
  `id_document_number` varchar(50) NOT NULL,
  `id_document_uuid` varchar(255) DEFAULT NULL,
  `nin` varchar(50) DEFAULT NULL,
  `emergency_contact_name_1` varchar(150) NOT NULL,
  `emergency_contact_phone_1` varchar(50) NOT NULL,
  `emergency_contact_address_1` varchar(255) NOT NULL,
  `emergency_contact_name_2` varchar(150) NOT NULL,
  `emergency_contact_phone_2` varchar(50) NOT NULL,
  `emergency_contact_address_2` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`marketer_id`),
  UNIQUE KEY `uq_marketer_referral_code` (`referral_code`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medical_appointments`
--

DROP TABLE IF EXISTS `medical_appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_appointments` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `appointment_uuid` varchar(150) NOT NULL,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `appointment_type` enum('online_consultation','doctor_visit','patient_visit') NOT NULL DEFAULT 'online_consultation',
  `patient_name_on_prescription` varchar(255) NOT NULL,
  `patient_mobile_number` varchar(50) NOT NULL,
  `speciality_id` int NOT NULL,
  `patient_symptoms` text NOT NULL,
  `consultation_fee` decimal(10,6) NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `time_slot_id` int DEFAULT NULL,
  `meeting_id` int DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `appointment_status` enum('approved','pending','started','completed','canceled','postponed','referred') DEFAULT 'pending',
  `cancelled_reason` text,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `canceled_by` enum('patient','doctor') DEFAULT NULL,
  `postponed_reason` text,
  `postponed_date` date DEFAULT NULL,
  `postponed_by` enum('patient','doctor') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_id`),
  KEY `fk_appointment_patient_id` (`patient_id`),
  KEY `fk_appointment_doctor_id` (`doctor_id`),
  KEY `fK_appointment_speciality_id` (`speciality_id`),
  KEY `fk_appointment_time_slot_id` (`time_slot_id`),
  KEY `fk_appoinment_zoom_id` (`meeting_id`),
  CONSTRAINT `fk_appointment_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_appointment_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fK_appointment_speciality_id` FOREIGN KEY (`speciality_id`) REFERENCES `medical_specialities` (`speciality_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_appointment_time_slot_id` FOREIGN KEY (`time_slot_id`) REFERENCES `doctor_time_slots` (`time_slot_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=352 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medical_councils`
--

DROP TABLE IF EXISTS `medical_councils`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_councils` (
  `council_id` int NOT NULL AUTO_INCREMENT,
  `council_name` varchar(255) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `mobile_number` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `inputted_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`council_id`),
  KEY `fk_medical_council_admin_id` (`inputted_by`),
  CONSTRAINT `fk_medical_council_admin_id` FOREIGN KEY (`inputted_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medical_degrees`
--

DROP TABLE IF EXISTS `medical_degrees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_degrees` (
  `degree_id` int NOT NULL AUTO_INCREMENT,
  `degree_name` varchar(355) NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `inputted_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`degree_id`),
  KEY `fk_medical_degree_admin_id` (`inputted_by`),
  CONSTRAINT `fk_medical_degree_admin_id` FOREIGN KEY (`inputted_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medical_document_sharing`
--

DROP TABLE IF EXISTS `medical_document_sharing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_document_sharing` (
  `sharing_id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `note` text,
  `otp` varchar(6) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sharing_id`),
  KEY `fk_sharing_document` (`document_id`),
  KEY `fk_sharing_patient` (`patient_id`),
  KEY `fk_sharing_doctor` (`doctor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medical_specialities`
--

DROP TABLE IF EXISTS `medical_specialities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_specialities` (
  `speciality_id` int NOT NULL AUTO_INCREMENT,
  `speciality_name` varchar(255) NOT NULL,
  `speciality_description` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `tags` text,
  `is_active` tinyint NOT NULL DEFAULT '1' COMMENT '0 - False | 1 - True',
  `inputted_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`speciality_id`),
  UNIQUE KEY `uq_speciality_name` (`speciality_name`),
  KEY `fk_medical_speciality_admin_id` (`inputted_by`),
  CONSTRAINT `fk_medical_speciality_admin_id` FOREIGN KEY (`inputted_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE,
  CONSTRAINT `chk_is_specialty_active` CHECK ((`is_active` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patient_medical_documents`
--

DROP TABLE IF EXISTS `patient_medical_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_medical_documents` (
  `medical_document_id` int NOT NULL AUTO_INCREMENT,
  `document_uuid` varchar(255) NOT NULL,
  `patient_id` int NOT NULL,
  `document_title` varchar(255) NOT NULL,
  `mimetype` varchar(30) DEFAULT NULL,
  `access_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`medical_document_id`),
  KEY `fk_document_patient_id` (`patient_id`),
  CONSTRAINT `fk_document_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patient_medical_history`
--

DROP TABLE IF EXISTS `patient_medical_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_medical_history` (
  `medical_history_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `height` varchar(20) DEFAULT NULL,
  `weight` varchar(20) DEFAULT NULL,
  `allergies` varchar(500) DEFAULT NULL,
  `is_patient_disabled` tinyint NOT NULL DEFAULT '0',
  `disability_description` varchar(255) DEFAULT NULL,
  `tobacco_use` tinyint DEFAULT '0',
  `tobacco_use_frequency` text,
  `alcohol_use` tinyint DEFAULT '0',
  `alcohol_use_frequency` text,
  `caffine_use` tinyint DEFAULT '0',
  `caffine_use_frequency` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`medical_history_id`),
  KEY `fk_patient_id` (`patient_id`),
  CONSTRAINT `fk_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=225 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `patient_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(20) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `gender` enum('male','female') NOT NULL,
  `profile_pic_url` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `booked_first_appointment` tinyint DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`patient_id`),
  KEY `fk_patient_user_id` (`user_id`),
  CONSTRAINT `fk_patient_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=492 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patients_testimonial`
--

DROP TABLE IF EXISTS `patients_testimonial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients_testimonial` (
  `testimonial_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `testimonial_content` varchar(500) NOT NULL,
  `is_approved` tinyint NOT NULL DEFAULT '0',
  `is_active` tinyint NOT NULL DEFAULT '0',
  `approved_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`testimonial_id`),
  KEY `fk_testimonial_patient_id` (`patient_id`),
  KEY `fk_testimonial_admin_id` (`approved_by`),
  CONSTRAINT `fk_testimonial_admin_id` FOREIGN KEY (`approved_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_testimonial_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON UPDATE CASCADE,
  CONSTRAINT `chk_is_patient_testimonial_active` CHECK ((`is_active` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `services_offered`
--

DROP TABLE IF EXISTS `services_offered`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services_offered` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `service_name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `is_featured` tinyint NOT NULL DEFAULT '1',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `inputted_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_id`),
  UNIQUE KEY `uq_service_name` (`service_name`),
  KEY `fk_service_offered_admin_id` (`inputted_by`),
  CONSTRAINT `fk_service_offered_admin_id` FOREIGN KEY (`inputted_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE,
  CONSTRAINT `chk_is_service_active` CHECK ((`is_active` in (0,1)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `specializations`
--

DROP TABLE IF EXISTS `specializations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `specializations` (
  `specialization_id` int NOT NULL AUTO_INCREMENT,
  `specialization_name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1' COMMENT '0 - False | 1 - True',
  `inputted_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`specialization_id`),
  UNIQUE KEY `uq_specialization_name` (`specialization_name`),
  KEY `fk_specialization_admin_id` (`inputted_by`),
  CONSTRAINT `fk_specialization_admin_id` FOREIGN KEY (`inputted_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE,
  CONSTRAINT `chk_is_active` CHECK ((`is_active` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_type`
--

DROP TABLE IF EXISTS `user_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_type` (
  `user_type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL,
  `inputted_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_type_id`),
  UNIQUE KEY `uq_type_name` (`type_name`),
  KEY `fk_inputted_by_admin_id` (`inputted_by`),
  CONSTRAINT `fk_inputted_by_admin_id` FOREIGN KEY (`inputted_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `mobile_number` varchar(50) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `is_email_verified` tinyint DEFAULT '0',
  `email_verification_token` varchar(255) DEFAULT NULL,
  `user_type` int NOT NULL,
  `password` varchar(255) NOT NULL,
  `verification_token` varchar(6) DEFAULT NULL,
  `is_verified` tinyint NOT NULL DEFAULT '0' COMMENT '0 - False 1 - True',
  `verified_at` timestamp NULL DEFAULT NULL,
  `is_account_active` tinyint NOT NULL DEFAULT '1' COMMENT '0 - False 1 - True',
  `is_online` tinyint NOT NULL DEFAULT '0' COMMENT '0 - False 1 - True',
  `is_2fa_enabled` tinyint NOT NULL DEFAULT '0' COMMENT '0 - False 1 - True',
  `notification_token` varchar(250) DEFAULT NULL,
  `device_notif_token` varchar(250) DEFAULT NULL,
  `referral_code` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_user_mobile_number` (`mobile_number`),
  UNIQUE KEY `uq_user_email` (`email`),
  KEY `fk_user_type_id` (`user_type`),
  CONSTRAINT `fk_user_type_id` FOREIGN KEY (`user_type`) REFERENCES `user_type` (`user_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_is_user_account_active` CHECK ((`is_account_active` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=750 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `withdrawal_requests`
--

DROP TABLE IF EXISTS `withdrawal_requests`;

CREATE TABLE `withdrawal_requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `requested_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `mobile_money_number` varchar(30) DEFAULT NULL,
  `bank_name` varchar(150) DEFAULT NULL,
  `bank_account_name` varchar(150) DEFAULT NULL,
  `bank_account_number` varchar(150) DEFAULT NULL,
  `request_status` enum('pending','approved','declined') NOT NULL DEFAULT 'pending',
  `processed_by` int DEFAULT NULL,
  `comments` varchar(1000) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `fk_request_doctor` (`doctor_id`),
  KEY `fk_request_processor` (`processed_by`),
  CONSTRAINT `fk_request_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_request_processor` FOREIGN KEY (`processed_by`) REFERENCES `admins` (`admin_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;




DROP TABLE IF EXISTS `zoom_meetings`;

CREATE TABLE `zoom_meetings` (
  `meeting_id` int NOT NULL AUTO_INCREMENT,
  `zoom_id` varchar(50) DEFAULT NULL,
  `zoom_uuid` varchar(250) DEFAULT NULL,
  `meeting_topic` text,
  `join_url` varchar(250) DEFAULT NULL,
  `start_url` varchar(500) DEFAULT NULL,
  `encrypted_password` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`meeting_id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
