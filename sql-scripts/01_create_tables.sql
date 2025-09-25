-- use db_kenecare;

-- Disable foreign key checks so tables can be dropped/recreated safely
SET FOREIGN_KEY_CHECKS = 0;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `appointment_feedbacks`
--

DROP TABLE IF EXISTS `appointment_feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `appointment_followup`
--

DROP TABLE IF EXISTS `appointment_followup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `appointment_payments`
--

DROP TABLE IF EXISTS `appointment_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=376 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `appointment_prescriptions`
--

DROP TABLE IF EXISTS `appointment_prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `appointment_types`
--

DROP TABLE IF EXISTS `appointment_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `blog_categories`
--

DROP TABLE IF EXISTS `blog_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `blogs`
--

DROP TABLE IF EXISTS `blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `common_symptoms`
--

DROP TABLE IF EXISTS `common_symptoms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `doctor_available_days`
--

DROP TABLE IF EXISTS `doctor_available_days`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `doctor_faqs`
--

DROP TABLE IF EXISTS `doctor_faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `doctor_feedbacks`
--

DROP TABLE IF EXISTS `doctor_feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `doctor_time_slots`
--

DROP TABLE IF EXISTS `doctor_time_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `doctors_council_registration`
--

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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=377 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=230 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=535 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=819 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `withdrawal_requests`
--

-- DROP TABLE IF EXISTS `withdrawal_requests`;
-- /*!40101 SET @saved_cs_client     = @@character_set_client */;
-- /*!50503 SET character_set_client = utf8mb4 */;
-- CREATE TABLE `withdrawal_requests` (
--   `request_id` int NOT NULL AUTO_INCREMENT,
--   `doctor_id` int NOT NULL,
--   `requested_amount` decimal(10,2) NOT NULL,
--   `payment_method` varchar(50) NOT NULL,
--   `mobile_money_number` varchar(30) DEFAULT NULL,
--   `bank_name` varchar(150) DEFAULT NULL,
--   `bank_account_name` varchar(150) DEFAULT NULL,
--   `bank_account_number` varchar(150) DEFAULT NULL,
--   `request_status` enum('pending','approved','declined') NOT NULL DEFAULT 'pending',
--   `processed_by` int DEFAULT NULL,
--   `comments` varchar(1000) DEFAULT NULL,
--   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
--   `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   PRIMARY KEY (`request_id`),
--   KEY `fk_request_doctor` (`doctor_id`),
--   KEY `fk_request_processor` (`processed_by`),
--   CONSTRAINT `fk_request_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
--   CONSTRAINT `fk_request_processor` FOREIGN KEY (`processed_by`) REFERENCES `admins` (`admin_id`) ON DELETE CASCADE ON UPDATE CASCADE
-- ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- /*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `zoom_meetings`
--

DROP TABLE IF EXISTS `zoom_meetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

-- DROP TABLE IF EXISTS `api_clients`;

CREATE TABLE IF NOT EXISTS `api_clients` (
  `client_id` INT PRIMARY KEY AUTO_INCREMENT,
  `client_uuid` CHAR(36) UNIQUE NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `contact_email` VARCHAR(255) NULL,
  `contact_phone` VARCHAR(50) NULL,
  `website` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `api_keys` (
  `key_id` INT PRIMARY KEY AUTO_INCREMENT,
  `key_uuid` CHAR(36) UNIQUE NOT NULL,
  `client_id` INT NOT NULL,
  `api_key` VARCHAR(64) UNIQUE NOT NULL,
  `api_secret` VARCHAR(128) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `expires_at` TIMESTAMP NULL,
  `last_used_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `api_clients`(`client_id`) ON DELETE CASCADE
);

ALTER TABLE `users`
  ADD COLUMN `expiry_time` TIMESTAMP NULL DEFAULT NULL COMMENT 'Expiry time for tokens or account',
  ADD COLUMN `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '0 - Active, 1 - Soft Deleted',
  ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
  ADD KEY `idx_is_deleted` (`is_deleted`);

UPDATE `users`
SET
  `expiry_time` = NULL,
  `is_deleted` = 0,
  `deleted_at` = NULL;

-- Add the name column
ALTER TABLE api_keys 
ADD COLUMN name VARCHAR(100) NOT NULL;
AFTER id;

-- Add the description column
ALTER TABLE api_keys 
ADD COLUMN description TEXT;
AFTER id;


-- Add the environment enum column
ALTER TABLE api_keys 
ADD COLUMN environment ENUM('development', 'staging', 'production', 'testing') 
NOT NULL DEFAULT 'development';
AFTER id;


-- Create the table to store blog post details.
CREATE TABLE IF NOT EXISTS `doctor_health_blogs` (
  `blog_id` INT NOT NULL AUTO_INCREMENT,
  `blog_uuid` CHAR(36) UNIQUE NOT NULL,
  `doctor_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `status` ENUM('draft', 'scheduled', 'published', 'archived') NOT NULL DEFAULT 'draft',
  `image` VARCHAR(100),
  `tags` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `published_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`blog_id`),
  CONSTRAINT `fk_health_blogs_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `faqs` (
    `faq_id` INT PRIMARY KEY AUTO_INCREMENT,
    `faq_uuid` CHAR(36) NOT NULL UNIQUE,
    `question` VARCHAR(500) NOT NULL,
    `answer` TEXT NOT NULL,
    `category` VARCHAR(100),
    `is_published` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ALTER TABLE `appointment_prescriptions` DROP COLUMN `access_token`;
-- ALTER TABLE `appointment_prescriptions` DROP COLUMN `access_jwt`;

ALTER TABLE `users`
ADD COLUMN `last_seen_at` timestamp NULL DEFAULT NULL AFTER `is_online`;

ALTER TABLE `doctor_feedbacks`
ADD UNIQUE KEY `uq_patient_doctor_feedback` (`patient_id`, `doctor_id`);

ALTER TABLE `appointment_feedbacks`
ADD UNIQUE KEY `uq_appointment_id_appointment_feedbacks` (`appointment_id`);

ALTER TABLE `patients_testimonial`
ADD UNIQUE KEY `uq_patient_testimonial` (`patient_id`);

update users set last_seen_at = NOW() where is_online=1;

CREATE TABLE IF NOT EXISTS `feature_flags` (
    `flag_id` INT PRIMARY KEY AUTO_INCREMENT,
    `flag_uuid` CHAR(36) NOT NULL UNIQUE,
    `flag_name` VARCHAR(100) UNIQUE NOT NULL,
    `description` TEXT,
    `is_enabled` TINYINT NOT NULL DEFAULT 0,
    `rollout_percentage` INT DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =======================================================================
-- Phase 0: Pre-flight Checks and Data Cleanup (CRITICAL for UNIQUE KEYS and FKs)
-- =======================================================================

-- 0.1. Find duplicates for UNIQUE KEY `uq_doctor_faq_questions`
-- If rows returned, either DELETE or UPDATE `question` to be unique
SELECT question, COUNT(*) FROM `doctor_faqs` GROUP BY question HAVING COUNT(*) > 1;


-- 0.2. Find duplicates for UNIQUE KEY `uq_doctor_health_blogs_title`
SELECT title, COUNT(*) FROM `doctor_health_blogs` GROUP BY title HAVING COUNT(*) > 1;

-- 0.4. Find duplicates for UNIQUE KEY `uq_doctor_datetime_slot` on `medical_appointments`
SELECT doctor_id, appointment_date, appointment_time, COUNT(*)
FROM `medical_appointments`
GROUP BY doctor_id, appointment_date, appointment_time
HAVING COUNT(*) > 1;

-- 0.5. Find and resolve orphan records for `medical_document_sharing.document_id`
-- Ensure all document_id values in medical_document_sharing exist in patient_medical_documents
SELECT mds.*
FROM `medical_document_sharing` mds
LEFT JOIN `patient_medical_documents` pmd ON mds.document_id = pmd.medical_document_id
WHERE pmd.medical_document_id IS NULL;

DELETE FROM `medical_document_sharing` WHERE document_id NOT IN (SELECT medical_document_id FROM `patient_medical_documents`);

-- =======================================================================
-- Phase 1: Drop Foreign Keys and Tables (for `doctor_time_slots`)
-- =======================================================================

-- Drop FK in `medical_appointments` referencing `doctor_time_slots`
ALTER TABLE `medical_appointments`
DROP FOREIGN KEY `fk_appointment_time_slot_id`;

-- Drop `doctor_time_slots` table
DROP TABLE IF EXISTS `doctor_time_slots`;


-- =======================================================================
-- Phase 2: Add UUID Columns (without DEFAULT UUID() to avoid Error 1674)
-- =======================================================================

ALTER TABLE `admins` ADD COLUMN `admin_uuid` CHAR(36) UNIQUE AFTER `admin_id`;
ALTER TABLE `appointment_feedbacks` ADD COLUMN `feedback_uuid` CHAR(36) UNIQUE AFTER `appointment_feedback_id`;
ALTER TABLE `appointment_followup` ADD COLUMN `followup_uuid` CHAR(36) UNIQUE AFTER `followup_id`;
ALTER TABLE `appointment_payments` ADD COLUMN `payment_uuid` CHAR(36) UNIQUE AFTER `payment_id`;
ALTER TABLE `appointment_prescriptions` ADD COLUMN `prescription_uuid` CHAR(36) UNIQUE AFTER `prescription_id`;
ALTER TABLE `appointment_types` ADD COLUMN `appointment_type_uuid` CHAR(36) UNIQUE AFTER `appointment_type_id`;
ALTER TABLE `blog_categories` ADD COLUMN `category_uuid` CHAR(36) UNIQUE AFTER `category_id`;
ALTER TABLE `blogs` ADD COLUMN `blog_uuid` CHAR(36) UNIQUE AFTER `blog_id`;
ALTER TABLE `cities` ADD COLUMN `city_uuid` CHAR(36) UNIQUE AFTER `city_id`;
ALTER TABLE `common_symptoms` ADD COLUMN `symptom_uuid` CHAR(36) UNIQUE AFTER `symptom_id`;
ALTER TABLE `doctor_available_days` ADD COLUMN `day_slot_uuid` CHAR(36) UNIQUE AFTER `day_slot_id`;
ALTER TABLE `doctor_faqs` ADD COLUMN `faq_uuid` CHAR(36) UNIQUE AFTER `faq_id`;
ALTER TABLE `doctor_feedbacks` ADD COLUMN `feedback_uuid` CHAR(36) UNIQUE AFTER `feedback_id`;
ALTER TABLE `doctors` ADD COLUMN `doctor_uuid` CHAR(36) UNIQUE AFTER `doctor_id`;
ALTER TABLE `doctors_council_registration` ADD COLUMN `council_registration_uuid` CHAR(36) UNIQUE AFTER `council_registration_id`;
ALTER TABLE `doctors_educational_background` ADD COLUMN `education_uuid` CHAR(36) UNIQUE AFTER `education_id`;
ALTER TABLE `doctors_wallet` ADD COLUMN `wallet_uuid` CHAR(36) UNIQUE AFTER `wallet_id`;
ALTER TABLE `medical_councils` ADD COLUMN `council_uuid` CHAR(36) UNIQUE AFTER `council_id`;
ALTER TABLE `medical_degrees` ADD COLUMN `degree_uuid` CHAR(36) UNIQUE AFTER `degree_id`;
ALTER TABLE `medical_document_sharing` ADD COLUMN `sharing_uuid` CHAR(36) UNIQUE AFTER `sharing_id`;
ALTER TABLE `medical_specialities` ADD COLUMN `speciality_uuid` CHAR(36) UNIQUE AFTER `speciality_id`;
ALTER TABLE `patient_medical_history` ADD COLUMN `medical_history_uuid` CHAR(36) UNIQUE AFTER `medical_history_id`;
ALTER TABLE `patients` ADD COLUMN `patient_uuid` CHAR(36) UNIQUE AFTER `patient_id`;
ALTER TABLE `patients_testimonial` ADD COLUMN `testimonial_uuid` CHAR(36) UNIQUE AFTER `testimonial_id`;
ALTER TABLE `specializations` ADD COLUMN `specialization_uuid` CHAR(36) UNIQUE AFTER `specialization_id`;
ALTER TABLE `users` ADD COLUMN `user_uuid` CHAR(36) UNIQUE AFTER `user_id`;
ALTER TABLE `user_type` ADD COLUMN `user_type_uuid` CHAR(36) UNIQUE AFTER `user_type_id`;
ALTER TABLE `withdrawal_requests` ADD COLUMN `request_uuid` CHAR(36) UNIQUE AFTER `request_id`;
ALTER TABLE `marketers` MODIFY COLUMN `marketer_uuid` CHAR(36) NOT NULL UNIQUE;
ALTER TABLE `medical_appointments` MODIFY COLUMN `appointment_uuid` CHAR(36) NOT NULL UNIQUE;
ALTER TABLE `zoom_meetings` MODIFY COLUMN `zoom_uuid` CHAR(36) UNIQUE DEFAULT NULL;

-- =======================================================================
-- Phase 3: Populate UUIDs (after columns are added)
-- =======================================================================

UPDATE `admins` SET `admin_uuid` = UUID() WHERE `admin_uuid` IS NULL;
UPDATE `appointment_feedbacks` SET `feedback_uuid` = UUID() WHERE `feedback_uuid` IS NULL;
UPDATE `appointment_followup` SET `followup_uuid` = UUID() WHERE `followup_uuid` IS NULL;
UPDATE `appointment_payments` SET `payment_uuid` = UUID() WHERE `payment_uuid` IS NULL;
UPDATE `appointment_prescriptions` SET `prescription_uuid` = UUID() WHERE `prescription_uuid` IS NULL;
UPDATE `appointment_types` SET `appointment_type_uuid` = UUID() WHERE `appointment_type_uuid` IS NULL;
UPDATE `blog_categories` SET `category_uuid` = UUID() WHERE `category_uuid` IS NULL;
UPDATE `blogs` SET `blog_uuid` = UUID() WHERE `blog_uuid` IS NULL;
UPDATE `cities` SET `city_uuid` = UUID() WHERE `city_uuid` IS NULL;
UPDATE `common_symptoms` SET `symptom_uuid` = UUID() WHERE `symptom_uuid` IS NULL;
UPDATE `doctor_available_days` SET `day_slot_uuid` = UUID() WHERE `day_slot_uuid` IS NULL;
UPDATE `doctor_faqs` SET `faq_uuid` = UUID() WHERE `faq_uuid` IS NULL;
UPDATE `doctor_feedbacks` SET `feedback_uuid` = UUID() WHERE `feedback_uuid` IS NULL;
UPDATE `doctors` SET `doctor_uuid` = UUID() WHERE `doctor_uuid` IS NULL;
UPDATE `doctors_council_registration` SET `council_registration_uuid` = UUID() WHERE `council_registration_uuid` IS NULL;
UPDATE `doctors_educational_background` SET `education_uuid` = UUID() WHERE `education_uuid` IS NULL;
UPDATE `doctors_wallet` SET `wallet_uuid` = UUID() WHERE `wallet_uuid` IS NULL;
UPDATE `medical_councils` SET `council_uuid` = UUID() WHERE `council_uuid` IS NULL;
UPDATE `medical_degrees` SET `degree_uuid` = UUID() WHERE `degree_uuid` IS NULL;
UPDATE `medical_document_sharing` SET `sharing_uuid` = UUID() WHERE `sharing_uuid` IS NULL;
UPDATE `medical_specialities` SET `speciality_uuid` = UUID() WHERE `speciality_uuid` IS NULL;
UPDATE `patient_medical_history` SET `medical_history_uuid` = UUID() WHERE `medical_history_uuid` IS NULL;
UPDATE `patients` SET `patient_uuid` = UUID() WHERE `patient_uuid` IS NULL;
UPDATE `patients_testimonial` SET `testimonial_uuid` = UUID() WHERE `testimonial_uuid` IS NULL;
UPDATE `specializations` SET `specialization_uuid` = UUID() WHERE `specialization_uuid` IS NULL;
UPDATE `users` SET `user_uuid` = UUID() WHERE `user_uuid` IS NULL;
UPDATE `user_type` SET `user_type_uuid` = UUID() WHERE `user_type_uuid` IS NULL;
UPDATE `withdrawal_requests` SET `request_uuid` = UUID() WHERE `request_uuid` IS NULL;


-- =======================================================================
-- Phase 4: Add Remaining UNIQUE and INDEXES
-- =======================================================================

ALTER TABLE `doctor_faqs` ADD UNIQUE KEY `uq_doctor_faq_questions_per_doctor` (`doctor_id`, `question`);
ALTER TABLE `faqs` ADD UNIQUE KEY `uq_faq_questions` (`question`);
ALTER TABLE `doctor_health_blogs` ADD UNIQUE KEY `uq_doctor_health_blogs_title_per_doctor` (`doctor_id`, `title`);
ALTER TABLE `api_clients` ADD UNIQUE KEY `uq_api_clients_name` (`name`);


-- Existing table modifications and index additions
ALTER TABLE `admins` ADD INDEX `idx_admins_fullname` (`fullname`), ADD INDEX `idx_admins_active_email` (`is_account_active`, `email`);
ALTER TABLE `appointment_feedbacks` ADD UNIQUE KEY `uq_feedback_appointment_id` (`appointment_id`), ADD INDEX `idx_feedback_created_at` (`created_at`);
ALTER TABLE `appointment_followup` ADD UNIQUE KEY `uq_followup_appointment_datetime` (`appointment_id`,`followup_date`,`followup_time`), ADD INDEX `idx_followup_doctor_status` (`doctor_id`, `followup_status`), ADD INDEX `idx_followup_date_time` (`followup_date`, `followup_time`);
ALTER TABLE `appointment_payments` MODIFY COLUMN `order_id` VARCHAR(255) NOT NULL UNIQUE, MODIFY COLUMN `transaction_id` VARCHAR(255) UNIQUE DEFAULT NULL, ADD INDEX `idx_payment_status` (`payment_status`), ADD INDEX `idx_payments_appointment_status` (`appointment_id`, `payment_status`);
ALTER TABLE `appointment_prescriptions` ADD UNIQUE KEY `uq_prescription_appointment` (`appointment_id`);
ALTER TABLE `appointment_types` ADD INDEX `idx_appointment_type_active` (`is_active`);
ALTER TABLE `blog_categories` MODIFY COLUMN `is_active` TINYINT NOT NULL DEFAULT '1', ADD INDEX `idx_category_active` (`is_active`);
ALTER TABLE `blogs` ADD INDEX `idx_blog_active_featured` (`is_active`, `is_featured`), ADD INDEX `idx_blog_title` (`title`);
ALTER TABLE `cities` ADD INDEX `idx_city_active` (`is_active`), ADD INDEX `idx_city_lat_lon` (`latitude`, `longitude`);
ALTER TABLE `common_symptoms` ADD UNIQUE KEY `uq_symptom_name` (`symptom_name`), ADD INDEX `idx_symptom_active` (`is_active`);
ALTER TABLE `doctor_available_days` ADD INDEX `idx_available_days_is_available` (`is_available`), ADD INDEX `idx_available_days_time_range` (`day_start_time`, `day_end_time`);
ALTER TABLE `doctor_faqs` ADD INDEX `idx_faq_is_active` (`is_active`), ADD INDEX `idx_faq_question` (`question`);
ALTER TABLE `doctor_feedbacks` ADD UNIQUE KEY `uq_doctor_patient_feedback` (`doctor_id`, `patient_id`), MODIFY COLUMN `is_feedback_approved` TINYINT NOT NULL DEFAULT '0', ADD INDEX `idx_feedback_approved` (`is_feedback_approved`), ADD INDEX `idx_feedback_created_at` (`created_at` DESC);
ALTER TABLE `doctors` MODIFY COLUMN `user_id` INT NOT NULL UNIQUE, MODIFY COLUMN `professional_summary` TEXT DEFAULT NULL, MODIFY COLUMN `qualifications` TEXT DEFAULT NULL, MODIFY COLUMN `is_profile_approved` TINYINT NOT NULL DEFAULT '0', ADD INDEX `idx_doctors_approved_gender_experience` (`is_profile_approved`, `gender`, `years_of_experience`), ADD INDEX `idx_doctors_consultation_fee` (`consultation_fee`);
ALTER TABLE `doctors_council_registration` MODIFY COLUMN `registration_number` VARCHAR(255) NOT NULL UNIQUE, ADD UNIQUE KEY `uq_doctor_council_reg` (`doctor_id`, `medical_council_id`), MODIFY COLUMN `registration_status` ENUM('pending','approved','rejected', 'active', 'expired') NOT NULL DEFAULT 'pending', ADD INDEX `idx_cert_expiry_date_status` (`certificate_expiry_date`, `registration_status`);
ALTER TABLE `doctors_educational_background` ADD UNIQUE KEY `uq_doctor_education` (`doctor_id`, `institution_name`, `degree_attained`, `year_completed`), ADD INDEX `idx_education_institution_degree` (`institution_name`, `degree_attained`);
ALTER TABLE `doctors_wallet` MODIFY COLUMN `doctor_id` INT NOT NULL UNIQUE;
ALTER TABLE `marketers` MODIFY COLUMN `phone_number` VARCHAR(50) NOT NULL UNIQUE, MODIFY COLUMN `email` VARCHAR(150) UNIQUE DEFAULT NULL, MODIFY COLUMN `id_document_number` VARCHAR(50) NOT NULL UNIQUE, MODIFY COLUMN `nin` VARCHAR(50) UNIQUE DEFAULT NULL, ADD INDEX `idx_marketer_name` (`first_name`, `last_name`), ADD INDEX `idx_marketer_phone_verified` (`is_phone_verified`), ADD INDEX `idx_marketer_email_verified` (`is_email_verified`);
ALTER TABLE `medical_appointments` ADD UNIQUE KEY `uq_doctor_datetime_slot` (`doctor_id`, `appointment_date`, `appointment_time`), ADD INDEX `idx_appointment_datetime` (`appointment_date`, `appointment_time`), ADD INDEX `idx_appointment_status` (`appointment_status`), ADD INDEX `idx_appointment_time` (`appointment_time`), ADD INDEX `idx_appointment_created_at` (`created_at`), ADD INDEX `idx_appointment_updated_at` (`updated_at`), ADD INDEX `idx_appointment_type` (`appointment_type`), ADD INDEX `idx_appointment_patient_status_date` (`patient_id`, `appointment_status`, `appointment_date` DESC), ADD INDEX `idx_appointment_doctor_date_status_time` (`doctor_id`, `appointment_date`, `appointment_status`, `appointment_time`), ADD INDEX `idx_appointment_patient_doctor_status` (`patient_id`, `doctor_id`, `appointment_status`);
ALTER TABLE `medical_appointments` ADD CONSTRAINT `fk_appoinment_zoom_id` FOREIGN KEY (`meeting_id`) REFERENCES `zoom_meetings` (`meeting_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `medical_councils` MODIFY COLUMN `council_name` VARCHAR(255) NOT NULL UNIQUE, MODIFY COLUMN `email` VARCHAR(150) UNIQUE DEFAULT NULL, MODIFY COLUMN `mobile_number` VARCHAR(50) UNIQUE DEFAULT NULL, ADD INDEX `idx_council_active` (`is_active`);
ALTER TABLE `medical_document_sharing` MODIFY COLUMN `otp` VARCHAR(6) NOT NULL UNIQUE, ADD UNIQUE KEY `uq_document_patient_doctor` (`document_id`, `patient_id`, `doctor_id`);
ALTER TABLE `medical_document_sharing` ADD CONSTRAINT `fk_sharing_document` FOREIGN KEY (`document_id`) REFERENCES `patient_medical_documents` (`medical_document_id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_sharing_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_sharing_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `medical_specialities` MODIFY COLUMN `speciality_name` VARCHAR(255) NOT NULL UNIQUE, ADD INDEX `idx_speciality_active` (`is_active`);
ALTER TABLE `patient_medical_documents` ADD INDEX `idx_document_title` (`document_title`);
ALTER TABLE `patient_medical_history` MODIFY COLUMN `patient_id` INT NOT NULL UNIQUE, ADD INDEX `idx_medical_history_disabled` (`is_patient_disabled`), ADD INDEX `idx_medical_history_tobacco_alcohol` (`tobacco_use`, `alcohol_use`);
ALTER TABLE `patient_medical_history` ADD CONSTRAINT `fk_medical_history_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `patients` MODIFY COLUMN `user_id` INT NOT NULL UNIQUE, ADD INDEX `idx_patient_mobile_number` (`mobile_number`), ADD INDEX `idx_patient_email` (`email`), ADD INDEX `idx_patient_first_appointment_booked` (`booked_first_appointment`);
ALTER TABLE `patients_testimonial` MODIFY COLUMN `is_approved` TINYINT NOT NULL DEFAULT '0', MODIFY COLUMN `is_active` TINYINT NOT NULL DEFAULT '0', ADD UNIQUE KEY `uq_patient_testimonial` (`patient_id`), ADD INDEX `idx_testimonial_approved_active` (`is_approved`, `is_active`), ADD INDEX `idx_testimonial_created_at` (`created_at` DESC);
ALTER TABLE `specializations` MODIFY COLUMN `is_active` TINYINT NOT NULL DEFAULT '1', ADD INDEX `idx_specialization_active` (`is_active`);
ALTER TABLE `users` ADD COLUMN `two_fa_secret` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL AFTER `is_2fa_enabled`, ADD COLUMN `is_account_locked` TINYINT DEFAULT '0' AFTER `is_otp_enabled`, ADD COLUMN `failed_login_attempts` INT DEFAULT '0' AFTER `is_account_locked`, ADD COLUMN `last_login_at` TIMESTAMP NULL DEFAULT NULL AFTER `failed_login_attempts`, ADD INDEX `idx_users_type_active_online` (`user_type`, `is_account_active`, `is_online`), ADD INDEX `idx_users_is_verified` (`is_verified`), ADD INDEX `idx_users_is_account_active` (`is_account_active`), ADD INDEX `idx_users_is_deleted` (`is_deleted`), ADD INDEX `idx_users_referral_code` (`referral_code`), ADD INDEX `idx_users_created_at` (`created_at` DESC), ADD INDEX `idx_users_updated_at` (`updated_at` DESC), ADD INDEX `idx_users_last_seen_at` (`last_seen_at` DESC), ADD INDEX `idx_users_last_login_at` (`last_login_at`);
ALTER TABLE `withdrawal_requests` ADD INDEX `idx_request_status_doctor` (`request_status`, `doctor_id`), ADD INDEX `idx_request_created_at` (`created_at` DESC);
ALTER TABLE `zoom_meetings` MODIFY COLUMN `join_url` TEXT DEFAULT NULL, MODIFY COLUMN `start_url` TEXT DEFAULT NULL, ADD COLUMN `host_id` INT DEFAULT NULL AFTER `encrypted_password`, ADD CONSTRAINT `fk_meeting_host_id` FOREIGN KEY (`host_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE, ADD INDEX `idx_meetings_host_id` (`host_id`);
ALTER TABLE `api_clients` ADD INDEX `idx_api_clients_name` (`name`);
ALTER TABLE `api_keys` ADD INDEX `idx_api_keys_client_id` (`client_id`), ADD INDEX `idx_api_keys_active_env` (`is_active`, `environment`), ADD INDEX `idx_api_keys_expires_at` (`expires_at`);

--- ========================================
--- Phase 5: Add new family members table
--- ========================================

CREATE TABLE IF NOT EXISTS `family_members` (
  `family_member_id` INT NOT NULL AUTO_INCREMENT,
  `family_member_uuid` CHAR(36) UNIQUE DEFAULT (UUID()),
  `patient_id` INT NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `middle_name` VARCHAR(255),
  `last_name` VARCHAR(255) NOT NULL,
  `relationship` ENUM('Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Other') NOT NULL,
  `date_of_birth` DATE DEFAULT NULL,
  `gender` ENUM('male','female') DEFAULT NULL,
  `phone_number` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`family_member_id`),
  UNIQUE KEY `uq_family_member_patient_name_rel` (`patient_id`, `first_name`, `last_name`, `relationship`),
  KEY `idx_family_members_patient_id` (`patient_id`),
  KEY `idx_family_members_name` (`first_name`, `last_name`),
  CONSTRAINT `fk_family_member_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--- ========================================
--- VIEW ALL INDEXES
--- ========================================

SELECT
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS Columns,
    NON_UNIQUE,
    INDEX_TYPE
FROM
    information_schema.STATISTICS
WHERE
    TABLE_SCHEMA = DATABASE() -- Use DATABASE() to limit to the current database
GROUP BY
    TABLE_NAME, INDEX_NAME, NON_UNIQUE, INDEX_TYPE
ORDER BY
    TABLE_NAME, INDEX_NAME;

CREATE TABLE `withdrawal_requests` (
  `request_id` INT PRIMARY KEY AUTO_INCREMENT,
  `doctor_id` INT NOT NULL,
  `transaction_id` VARCHAR(255) UNIQUE, -- The transaction ID from Monimee
  `order_id` VARCHAR(255) UNIQUE NOT NULL,
  `amount` DECIMAL(18, 2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'SLL',
  `payment_type` ENUM('mobile_money') NOT NULL, 
  `finance_account_id` VARCHAR(255),
  `transaction_reference` VARCHAR(255),
  `mobile_money_provider` ENUM('orange_money', 'afri_money') NOT NULL,
  `mobile_number` VARCHAR(255),  
  `status` ENUM('initiated', 'pending', 'success', 'failed') NOT NULL DEFAULT 'initiated', 
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`doctor_id`) ON DELETE CASCADE,
  INDEX `idx_withdrawal_requests_doctor_id` (`doctor_id`)
);

-- ALTER TABLE `patients`
-- ADD COLUMN `is_deleted` TINYINT NOT NULL DEFAULT 0,
-- ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL;

-- CREATE TABLE user_devices (
--     device_id INT PRIMARY KEY AUTO_INCREMENT,
--     user_id INT NOT NULL,
--     device_token VARCHAR(255) NOT NULL,
--     device_type ENUM('ios', 'android', 'web') NOT NULL,
--     os_version VARCHAR(50),
--     last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     CONSTRAINT unique_user_device UNIQUE (user_id, device_token),
--     FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
-- );

-- CREATE TABLE medicine_categories (
--     category_id INT AUTO_INCREMENT PRIMARY KEY,
--     category_name VARCHAR(100) NOT NULL UNIQUE,
--     description TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- -- Centralized phone number management for users, admin, doctors, patient, pharmacies, etc.
-- CREATE TABLE phone_numbers (
--     phone_id INT AUTO_INCREMENT PRIMARY KEY,
--     country_code VARCHAR(10) NOT NULL,
--     number VARCHAR(20) NOT NULL UNIQUE,
--     is_verified BOOLEAN DEFAULT FALSE,
--     verified_at TIMESTAMP NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- CREATE TABLE countries (
--     country_id INT AUTO_INCREMENT PRIMARY KEY,
--     country_name VARCHAR(100) NOT NULL UNIQUE,
--     country_code_iso CHAR(3) UNIQUE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- -- Centralized address management for pharmacies, users, patients, etc.
-- CREATE TABLE addresses (
--     address_id INT AUTO_INCREMENT PRIMARY KEY,
--     street_address VARCHAR(255) NOT NULL,
--     city VARCHAR(100) NOT NULL,
--     state_province VARCHAR(100),
--     zip_code VARCHAR(20),
--     country_id INT NOT NULL DEFAULT (SELECT country_id FROM countries WHERE country_code_iso = 'SL'), -- Default to Sierra Leone
--     latitude DECIMAL(10, 8), -- Optional: for geo-location
--     longitude DECIMAL(11, 8), -- Optional: for geo-location
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (country_id) REFERENCES countries(country_id)
-- );

-- PHARMACY MANAGEMENT DATABASE SCHEMA

-- -- Table: pharmacy
-- CREATE TABLE pharmacies (
--     pharmacy_id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     address_id INT, -- Foreign key to centralized addresses table
--     contact_phone_id INT,
--     email VARCHAR(100),
--     registration_number VARCHAR(100) UNIQUE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (address_id) REFERENCES addresses(address_id),
--     FOREIGN KEY (contact_phone_id) REFERENCES phone_numbers(phone_id)
-- );

-- -- Stores detailed operating hours for each pharmacy
-- CREATE TABLE pharmacy_operating_hours (
--     hours_id INT AUTO_INCREMENT PRIMARY KEY,
--     pharmacy_id INT NOT NULL,
--     day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
--     open_time TIME,
--     close_time TIME,
--     is_closed BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(pharmacy_id),
--     UNIQUE (pharmacy_id, day_of_week) -- Each pharmacy has one entry per day
-- );

-- -- Table: medicine_types
-- CREATE TABLE medicine_types (
--     type_id INT AUTO_INCREMENT PRIMARY KEY,
--     type_name VARCHAR(100) NOT NULL UNIQUE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- -- Table: medicine
-- CREATE TABLE medicine (
--     medicine_id INT AUTO_INCREMENT PRIMARY KEY,
--     pharmacy_id INT NOT NULL,
--     name VARCHAR(100) NOT NULL,
--     generic_name VARCHAR(100),
--     brand_name VARCHAR(100),
--     description TEXT,
--     medicine_images JSON, -- stores array of image URLs
--     medicine_type_id INT,
--     medicine_strength VARCHAR(50),
--     strength_unit VARCHAR(20),
--     medicine_shape VARCHAR(50),
--     medicine_color VARCHAR(50),
--     mfg_date DATE,
--     manufacturer_details TEXT,
--     unit_price DECIMAL(10, 2),
--     expiry_date DATE,
--     is_discounted BOOLEAN DEFAULT FALSE,
--     discount_percentage DECIMAL(5, 2),
--     discount_price DECIMAL(10, 2),
--     batch_number VARCHAR(100),
--     storage_requirement TEXT,
--     side_effects TEXT,
--     category ENUM('pain_reliever', 'antibiotics', 'antihistamine'),
--     is_prescription_required BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (pharmacy_id) REFERENCES pharmacy(pharmacy_id),
--     FOREIGN KEY (medicine_type_id) REFERENCES medicine_types(type_id)
-- );

-- -- Table: medicine_stocks
-- CREATE TABLE medicine_stocks (
--     stock_id INT AUTO_INCREMENT PRIMARY KEY,
--     medicine_id INT NOT NULL,
--     quantity INT NOT NULL,
--     notification_qty INT DEFAULT 10,
--     last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (medicine_id) REFERENCES medicine(medicine_id)
-- );

-- -- Table: pharmacy_prescriptions
-- CREATE TABLE pharmacy_prescriptions (
--     prescription_id INT AUTO_INCREMENT PRIMARY KEY,
--     pharmacy_id INT NOT NULL,
--     appointment_id INT, -- assumed to reference appointments table
--     date_dispensed DATE,
--     dispensed_by VARCHAR(100),
--     status ENUM('pending', 'fulfilled', 'canceled') DEFAULT 'pending',
--     comments TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (pharmacy_id) REFERENCES pharmacy(pharmacy_id)
-- );

-- -- Table: pharmacy_prescription_dispatch
-- CREATE TABLE pharmacy_prescription_dispatch (
--     dispatch_id INT AUTO_INCREMENT PRIMARY KEY,
--     prescription_id INT NOT NULL,
--     dispatcher_id INT, -- references a user/operator
--     dispatch_status ENUM('dispatched', 'in_transit', 'delivered', 'failed') DEFAULT 'dispatched',
--     dispatched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (prescription_id) REFERENCES pharmacy_prescriptions(prescription_id)
-- );

-- -- Table: pharmacy_operators
-- CREATE TABLE pharmacy_operators (
--     operator_id INT AUTO_INCREMENT PRIMARY KEY,
--     pharmacy_id INT NOT NULL,
--     full_name VARCHAR(100),
--     username VARCHAR(50) UNIQUE NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     email VARCHAR(100),
--     phone_number VARCHAR(20),
--     role ENUM('admin', 'staff') DEFAULT 'staff',
--     last_login TIMESTAMP NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (pharmacy_id) REFERENCES pharmacy(pharmacy_id)
-- );

-- -- Table: pharmacy_operator_permissions
-- CREATE TABLE pharmacy_operator_permissions (
--     permission_id INT AUTO_INCREMENT PRIMARY KEY,
--     role ENUM('admin', 'staff') UNIQUE,
--     can_add_medicine BOOLEAN DEFAULT FALSE,
--     can_update_medicine BOOLEAN DEFAULT FALSE,
--     can_dispense_prescriptions BOOLEAN DEFAULT FALSE,
--     can_manage_pharmacy BOOLEAN DEFAULT FALSE,
--     can_view_logs BOOLEAN DEFAULT FALSE
-- );

-- -- Table: pharmacy_activity_log
-- CREATE TABLE pharmacy_activity_log (
--     log_id INT AUTO_INCREMENT PRIMARY KEY,
--     operator_id INT NOT NULL,
--     pharmacy_id INT NOT NULL,
--     activity_type VARCHAR(100),
--     activity_details TEXT,
--     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     ip_address VARCHAR(45),
--     FOREIGN KEY (operator_id) REFERENCES pharmacy_operators(operator_id),
--     FOREIGN KEY (pharmacy_id) REFERENCES pharmacy(pharmacy_id)
-- );

-- Optional: triggers or constraints to ensure referential integrity and business rules can be added as needed.