-- MySQL dump 10.13  Distrib 8.0.34, for Linux (x86_64)
--
-- Host: localhost    Database: db_kenecare
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

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
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Chinedum Eke','chinedum.eke@kenecare.com','+23278822683','$2a$10$gZyXrYQY6YrhtMHE9bnjvuRvpsjE7fSpOWlNylrdt1v4J1GFLWaVK',1,'2023-10-14 19:32:16','2023-12-19 19:26:19'),(3,'Administrator','admin@kenecare.com','+23278500300','$2a$10$H2ER195UtdAVURbulL1gAe.8W4bpg4NZCo.Qpx51hq3v/c2BPAW9S',1,'2023-12-19 19:30:16','2023-12-19 19:30:16');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

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
  CONSTRAINT `fk_feedback_appointment_id` FOREIGN KEY (`appointment_id`) REFERENCES `medical_appointments` (`appointment_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_feedbacks`
--

LOCK TABLES `appointment_feedbacks` WRITE;
/*!40000 ALTER TABLE `appointment_feedbacks` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointment_feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `fk_payment_appointment_id` (`appointment_id`),
  CONSTRAINT `fk_payment_appointment_id` FOREIGN KEY (`appointment_id`) REFERENCES `medical_appointments` (`appointment_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_payments`
--

LOCK TABLES `appointment_payments` WRITE;
/*!40000 ALTER TABLE `appointment_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointment_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointment_prescriptions`
--

DROP TABLE IF EXISTS `appointment_prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_prescriptions` (
  `prescription_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `prescription_title` varchar(255) NOT NULL,
  `prescription_description` text NOT NULL,
  `prescription_document_url` varchar(255) DEFAULT NULL,
  `prescription_status` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`prescription_id`),
  KEY `fk_prescription_appointment_id` (`appointment_id`),
  CONSTRAINT `fk_prescription_appointment_id` FOREIGN KEY (`appointment_id`) REFERENCES `medical_appointments` (`appointment_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_prescriptions`
--

LOCK TABLES `appointment_prescriptions` WRITE;
/*!40000 ALTER TABLE `appointment_prescriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointment_prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `appointment_types`
--

LOCK TABLES `appointment_types` WRITE;
/*!40000 ALTER TABLE `appointment_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointment_types` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_categories`
--

LOCK TABLES `blog_categories` WRITE;
/*!40000 ALTER TABLE `blog_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `blog_categories` ENABLE KEYS */;
UNLOCK TABLES;

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
  `inputted_by` int NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1' COMMENT '0 - False , 1 - True',
  `is_featured` tinyint NOT NULL DEFAULT '0' COMMENT '0 - False , 1 - True',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`blog_id`),
  KEY `fk_blog_category_id` (`blog_category_id`),
  KEY `fk_blog_admin_id` (`inputted_by`),
  CONSTRAINT `fk_blog_admin_id` FOREIGN KEY (`inputted_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_blog_category_id` FOREIGN KEY (`blog_category_id`) REFERENCES `blog_categories` (`category_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blogs`
--

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;
/*!40000 ALTER TABLE `blogs` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'freetown',NULL,NULL,1,1,'2023-10-15 02:31:10','2023-10-15 02:31:45'),(3,'kenema',NULL,NULL,1,1,'2023-10-16 15:04:18','2023-10-16 15:04:18'),(4,'bo',NULL,NULL,1,1,'2023-10-16 15:04:18','2023-10-16 15:04:18');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `common_symptoms`
--

LOCK TABLES `common_symptoms` WRITE;
/*!40000 ALTER TABLE `common_symptoms` DISABLE KEYS */;
INSERT INTO `common_symptoms` VALUES (1,'fever','elevated body temperature, often a sign of infection.',1,'ebdf6581853eb07162c2e680805df739.jpg',50,'fever,infection,general-health',1,3,'2023-12-19 19:33:14','2023-12-19 19:33:14'),(2,'fever','elevated body temperature, often a sign of infection.',1,'5125c6472cf2ffd7de5cecca2d2253ce.jpg',50,'fever,infection,general-health',1,3,'2024-01-04 13:43:07','2024-01-04 13:43:07');
/*!40000 ALTER TABLE `common_symptoms` ENABLE KEYS */;
UNLOCK TABLES;

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
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`day_slot_id`),
  UNIQUE KEY `uqc_doctor_day` (`doctor_id`,`day_of_week`),
  CONSTRAINT `fk_day_slot_doctor_id` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_available_days`
--

LOCK TABLES `doctor_available_days` WRITE;
/*!40000 ALTER TABLE `doctor_available_days` DISABLE KEYS */;
INSERT INTO `doctor_available_days` VALUES (2,1,'monday','09:00:00','17:00:00','2024-01-04 17:19:58','2024-01-04 17:19:58'),(3,1,'tuesday','09:00:00','17:00:00','2024-01-04 17:20:24','2024-01-04 17:20:24'),(4,1,'wednesday','09:00:00','17:00:00','2024-01-04 17:20:34','2024-01-04 17:20:34'),(5,1,'thursday','09:00:00','17:00:00','2024-01-04 17:20:48','2024-01-04 17:20:48'),(6,1,'friday','09:00:00','17:00:00','2024-01-04 17:20:57','2024-01-04 17:20:57'),(7,1,'saturday','09:00:00','14:00:00','2024-01-04 17:21:19','2024-01-04 17:21:19'),(8,1,'sunday','12:00:00','15:00:00','2024-01-04 17:21:38','2024-01-04 17:21:38');
/*!40000 ALTER TABLE `doctor_available_days` ENABLE KEYS */;
UNLOCK TABLES;

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
  CONSTRAINT `fk_faq_doctor_id` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON UPDATE CASCADE,
  CONSTRAINT `chk_is_faq_active` CHECK ((`is_active` in (0,1)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_faqs`
--

LOCK TABLES `doctor_faqs` WRITE;
/*!40000 ALTER TABLE `doctor_faqs` DISABLE KEYS */;
/*!40000 ALTER TABLE `doctor_faqs` ENABLE KEYS */;
UNLOCK TABLES;

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
  CONSTRAINT `fk_feedback_doctor_id` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_feedback_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON UPDATE CASCADE,
  CONSTRAINT `chk_is_feedback_approved` CHECK ((`is_feedback_approved` in (0,1)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_feedbacks`
--

LOCK TABLES `doctor_feedbacks` WRITE;
/*!40000 ALTER TABLE `doctor_feedbacks` DISABLE KEYS */;
/*!40000 ALTER TABLE `doctor_feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

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
  CONSTRAINT `fk_time_slot_day_id` FOREIGN KEY (`day_slot_id`) REFERENCES `doctor_available_days` (`day_slot_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_time_slot_doctor_id` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_is_slot_available` CHECK ((`is_slot_available` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_time_slots`
--

LOCK TABLES `doctor_time_slots` WRITE;
/*!40000 ALTER TABLE `doctor_time_slots` DISABLE KEYS */;
INSERT INTO `doctor_time_slots` VALUES (1,1,2,'09:00:00','09:30:00',1,'2024-01-04 17:31:37','2024-01-04 17:31:37'),(2,1,2,'10:00:00','10:30:00',1,'2024-01-04 17:31:51','2024-01-04 17:31:51'),(3,1,2,'11:00:00','11:30:00',1,'2024-01-04 17:32:11','2024-01-04 17:32:11'),(4,1,2,'13:00:00','13:30:00',1,'2024-01-04 17:32:24','2024-01-04 17:32:24'),(5,1,2,'14:00:00','14:30:00',1,'2024-01-04 17:32:42','2024-01-04 17:32:42'),(6,1,2,'15:00:00','15:30:00',1,'2024-01-04 17:32:56','2024-01-04 17:32:56'),(7,1,2,'16:00:00','16:30:00',1,'2024-01-04 17:33:05','2024-01-04 17:33:05'),(8,1,2,'17:00:00','17:30:00',1,'2024-01-04 17:33:15','2024-01-04 17:33:15');
/*!40000 ALTER TABLE `doctor_time_slots` ENABLE KEYS */;
UNLOCK TABLES;

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
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`doctor_id`),
  KEY `fk_doctor_user_id` (`user_id`),
  KEY `fk_doctor_city_id` (`city_id`),
  KEY `fk_doctor_specialization` (`specialization_id`),
  CONSTRAINT `fk_doctor_city_id` FOREIGN KEY (`city_id`) REFERENCES `cities` (`city_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_doctor_specialization` FOREIGN KEY (`specialization_id`) REFERENCES `specializations` (`specialization_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_doctor_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (1,2,'Dr.','Chinedum','Roland','Eke','male','A professional doctor with loads of experience',NULL,1,'Heart Surgeon',200.00,NULL,1,5,0,'2024-01-04 17:14:46','2024-01-04 17:14:46');
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;

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
  `verified_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`council_registration_id`),
  KEY `fk_doctor_id` (`doctor_id`),
  KEY `fk_doctor_registration_council_id` (`medical_council_id`),
  KEY `fk_doctor_registration_admin_id` (`verified_by`),
  CONSTRAINT `fk_doctor_id` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_doctor_registration_admin_id` FOREIGN KEY (`verified_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_doctor_registration_council_id` FOREIGN KEY (`medical_council_id`) REFERENCES `medical_councils` (`council_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors_council_registration`
--

LOCK TABLES `doctors_council_registration` WRITE;
/*!40000 ALTER TABLE `doctors_council_registration` DISABLE KEYS */;
/*!40000 ALTER TABLE `doctors_council_registration` ENABLE KEYS */;
UNLOCK TABLES;

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
  CONSTRAINT `fk_education_doctor_id` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors_educational_background`
--

LOCK TABLES `doctors_educational_background` WRITE;
/*!40000 ALTER TABLE `doctors_educational_background` DISABLE KEYS */;
/*!40000 ALTER TABLE `doctors_educational_background` ENABLE KEYS */;
UNLOCK TABLES;

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
  `meeting_url` varchar(500) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `appointment_status` enum('pending','completed','canceled','postponed') NOT NULL DEFAULT 'pending',
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
  CONSTRAINT `fk_appointment_doctor_id` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_appointment_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON UPDATE CASCADE,
  CONSTRAINT `fK_appointment_speciality_id` FOREIGN KEY (`speciality_id`) REFERENCES `medical_specialities` (`speciality_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_appointment_time_slot_id` FOREIGN KEY (`time_slot_id`) REFERENCES `doctor_time_slots` (`time_slot_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_appointments`
--

LOCK TABLES `medical_appointments` WRITE;
/*!40000 ALTER TABLE `medical_appointments` DISABLE KEYS */;
INSERT INTO `medical_appointments` VALUES (1,'ba8a30bc-1c32-4492-9364-1e823966cc39',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 10:32:14','2024-01-08 10:32:14'),(2,'894aef76-4b6e-43bc-99a7-e052ff853f69',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 10:33:29','2024-01-08 10:33:29'),(3,'cb01c861-23e8-4911-8d44-b9e341904cbc',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 10:34:13','2024-01-08 10:34:13'),(4,'dc69a99d-5e76-40bc-9baa-497108861ce3',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 12:42:04','2024-01-08 12:42:04'),(5,'6c082aa2-9fb0-470d-8cad-3b6ca54e4276',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 12:43:44','2024-01-08 12:43:44'),(6,'a8a4e2c9-1adc-4264-9756-1751946f8a1d',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 12:45:54','2024-01-08 12:45:54'),(7,'aec492ed-e02d-4442-aaee-49eec36dae4d',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 12:46:25','2024-01-08 12:46:25'),(8,'92afbc47-8cab-4239-a387-cffd6366aba5',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 12:47:08','2024-01-08 12:47:08'),(9,'c20a014f-8bfd-4b35-97ac-1ddae71a80a7',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 13:43:50','2024-01-08 13:43:50'),(10,'2e1d1778-351f-4f3a-8543-363ea6204187',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 13:44:20','2024-01-08 13:44:20'),(11,'e6403278-6c93-45e1-913e-fb4e544253b1',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 13:45:28','2024-01-08 13:45:28'),(12,'5e180dea-25d1-489b-96e7-1504e5e3185d',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 13:46:49','2024-01-08 13:46:49'),(13,'26859ae6-c3ca-45ee-8d64-8b6653ae4f89',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 13:49:41','2024-01-08 13:49:41'),(14,'352bfd79-5f07-4519-a091-331908d367b8',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 14:00:01','2024-01-08 14:00:01'),(15,'5a592f54-71c2-4290-9f72-93044dccc7e6',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 14:04:48','2024-01-08 14:04:48'),(16,'ab0b8b3c-0e45-4c5a-9d4d-b519153299ed',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 14:08:24','2024-01-08 14:08:24'),(17,'81533581-dc2c-4665-ad60-235f5d32dc96',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 14:09:55','2024-01-08 14:09:55'),(18,'b0795aaa-004c-4a74-96a5-e28a2ee4dd9e',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 14:14:03','2024-01-08 14:14:03'),(19,'6aa2e34c-a0aa-408f-80e7-4a8170a1c8a2',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-08','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-08 14:15:18','2024-01-08 14:15:18'),(20,'7b6ddf3c-b96e-4b43-b51c-198d97a5de97',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 10:10:30','2024-01-09 10:10:30'),(21,'cbd5500d-84fa-4be6-8a1d-e6520f35699d',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 10:13:51','2024-01-09 10:13:51'),(22,'89b03788-11f8-43d3-bbc3-8150216158f6',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 10:48:43','2024-01-09 10:48:43'),(23,'22b3a0aa-30f3-400d-b551-5d104fed8a08',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 10:49:53','2024-01-09 10:49:53'),(24,'af72596e-afc1-4638-b828-12252d2a5c41',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 10:50:17','2024-01-09 10:50:17'),(25,'ebb91c6a-ec13-4e27-ba79-b4093fb4a951',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 10:54:09','2024-01-09 10:54:09'),(26,'fc8544d6-0e07-45fa-ad8b-db99675ed34b',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 11:53:55','2024-01-09 11:53:55'),(27,'5f9d7fcd-3d48-4290-b8cb-4e0db6152496',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 13:55:52','2024-01-09 13:55:52'),(28,'12aaa31d-2f93-46da-82d4-56728b4b0b6d',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 14:07:36','2024-01-09 14:07:36'),(29,'15ac9086-3f42-4386-9b6a-f2e15874d7e4',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 14:09:08','2024-01-09 14:09:08'),(30,'d3163ce0-f745-4b71-89e1-e75ef92fc77a',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 14:09:35','2024-01-09 14:09:35'),(31,'70a5d706-e886-4c63-811d-76af55924a64',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 14:11:26','2024-01-09 14:11:26'),(32,'cc0c65d0-0d76-4e17-ab8a-4466ea61fe84',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 14:20:01','2024-01-09 14:20:01'),(33,'8f395936-41ce-485b-8546-73e3c448c217',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 14:21:48','2024-01-09 14:21:48'),(34,'f5c2d39b-3d35-425f-90f2-bc05c389bae1',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 17:35:56','2024-01-09 17:35:56'),(35,'a1fbcbfa-f854-4697-9865-a8448c886b78',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 17:38:55','2024-01-09 17:38:55'),(36,'cd475fc3-bf08-4dec-91aa-73121d9c4c3b',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'headache, nausea, dizziness, running stomach, fast breathing',200.000000,'2024-01-09','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-01-09 17:39:22','2024-01-09 17:39:22');
/*!40000 ALTER TABLE `medical_appointments` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_councils`
--

LOCK TABLES `medical_councils` WRITE;
/*!40000 ALTER TABLE `medical_councils` DISABLE KEYS */;
/*!40000 ALTER TABLE `medical_councils` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `medical_degrees`
--

LOCK TABLES `medical_degrees` WRITE;
/*!40000 ALTER TABLE `medical_degrees` DISABLE KEYS */;
/*!40000 ALTER TABLE `medical_degrees` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_specialities`
--

LOCK TABLES `medical_specialities` WRITE;
/*!40000 ALTER TABLE `medical_specialities` DISABLE KEYS */;
INSERT INTO `medical_specialities` VALUES (1,'pediatrics','pediatrics focuses on the healthcare of children and adolescents. specializations include neonatology (care of premature newborns), pediatric cardiology (heart conditions in children), and pediatric gastroenterology (digestive issues in children).','8d3f5f7b2fe0f40898ea7c4decd682ac.jpg',NULL,1,1,'2023-12-19 18:21:53','2023-12-19 18:21:53'),(2,'family doctor','pediatrics focuses on the healthcare of children and adolescents. specializations include neonatology (care of premature newborns), pediatric cardiology (heart conditions in children), and pediatric gastroenterology (digestive issues in children).','bc265d1bccf10887d354059f3ed563e5.jpg',NULL,1,1,'2023-12-19 18:23:00','2023-12-19 18:23:00');
/*!40000 ALTER TABLE `medical_specialities` ENABLE KEYS */;
UNLOCK TABLES;

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
  `document_url` varchar(255) NOT NULL,
  `is_password_protected` tinyint NOT NULL DEFAULT '0',
  `document_password` varchar(255) DEFAULT NULL,
  `access_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`medical_document_id`),
  KEY `fk_document_patient_id` (`patient_id`),
  CONSTRAINT `fk_document_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_medical_documents`
--

LOCK TABLES `patient_medical_documents` WRITE;
/*!40000 ALTER TABLE `patient_medical_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `patient_medical_documents` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_medical_history`
--

LOCK TABLES `patient_medical_history` WRITE;
/*!40000 ALTER TABLE `patient_medical_history` DISABLE KEYS */;
INSERT INTO `patient_medical_history` VALUES (1,1,'1.2cm','40kg','Cauliflower, paracetamol',0,'',NULL,'',0,NULL,0,'','2023-11-08 20:34:54','2023-11-08 20:34:54');
/*!40000 ALTER TABLE `patient_medical_history` ENABLE KEYS */;
UNLOCK TABLES;

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
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`patient_id`),
  KEY `fk_patient_user_id` (`user_id`),
  CONSTRAINT `fk_patient_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (1,1,NULL,'Chinedum','Roland','Eke','male','d5a3e125eb232a47eaa1ce224c259d8a.jpg','1998-06-01','2023-11-08 18:33:43','2023-11-09 10:22:02');
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

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
  `approved_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`testimonial_id`),
  KEY `fk_testimonial_patient_id` (`patient_id`),
  KEY `fk_testimonial_admin_id` (`approved_by`),
  CONSTRAINT `fk_testimonial_admin_id` FOREIGN KEY (`approved_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_testimonial_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON UPDATE CASCADE,
  CONSTRAINT `chk_is_patient_testimonial_active` CHECK ((`is_active` in (0,1)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients_testimonial`
--

LOCK TABLES `patients_testimonial` WRITE;
/*!40000 ALTER TABLE `patients_testimonial` DISABLE KEYS */;
/*!40000 ALTER TABLE `patients_testimonial` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `services_offered`
--

LOCK TABLES `services_offered` WRITE;
/*!40000 ALTER TABLE `services_offered` DISABLE KEYS */;
/*!40000 ALTER TABLE `services_offered` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specializations`
--

LOCK TABLES `specializations` WRITE;
/*!40000 ALTER TABLE `specializations` DISABLE KEYS */;
INSERT INTO `specializations` VALUES (1,'cardiologist','Study of the heart and blood vessels','updated_cardiology.jpg',0,1,'2023-10-16 15:30:53','2023-10-16 15:32:08'),(2,'dermatologist','Study of the skin','dermatologist.jpg',1,1,'2023-10-16 15:30:53','2023-10-16 15:30:53');
/*!40000 ALTER TABLE `specializations` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `user_type`
--

LOCK TABLES `user_type` WRITE;
/*!40000 ALTER TABLE `user_type` DISABLE KEYS */;
INSERT INTO `user_type` VALUES (1,'patient',1,'2023-10-14 19:51:34','2023-10-14 19:51:34'),(2,'doctor',1,'2023-10-14 19:51:34','2023-10-14 19:51:34');
/*!40000 ALTER TABLE `user_type` ENABLE KEYS */;
UNLOCK TABLES;

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
  `user_type` int NOT NULL,
  `password` varchar(255) NOT NULL,
  `verification_token` varchar(6) DEFAULT NULL,
  `is_verified` tinyint NOT NULL DEFAULT '0' COMMENT '0 - False 1 - True',
  `verified_at` timestamp NULL DEFAULT NULL,
  `is_account_active` tinyint NOT NULL DEFAULT '1' COMMENT '0 - False 1 - True',
  `is_online` tinyint NOT NULL DEFAULT '0' COMMENT '0 - False 1 - True',
  `is_2fa_enabled` tinyint NOT NULL DEFAULT '0' COMMENT '0 - False 1 - True',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_user_mobile_number` (`mobile_number`),
  UNIQUE KEY `uq_user_email` (`email`),
  KEY `fk_user_type_id` (`user_type`),
  CONSTRAINT `fk_user_type_id` FOREIGN KEY (`user_type`) REFERENCES `user_type` (`user_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_is_user_account_active` CHECK ((`is_account_active` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'+23278822683','comroland85@gmail.com',1,'$2a$10$Kkigv7Mk5Zp4IXjiCHd.t.nEv7Yjb1lYbTUrjc5dcjVOnU2jFnctu',NULL,1,'2024-01-08 12:41:17',1,1,0,'2023-11-07 18:37:11','2024-01-08 12:41:16'),(2,'+232781213212','developer@imo-tech.com',2,'$2a$10$jTgIRT90eCWmWKoysRyBCONBCSRl8TnnGLx1G.CAQ4Ck756SBsO5q',NULL,1,'2024-01-04 17:13:43',1,1,0,'2024-01-04 17:13:04','2024-01-08 14:12:13');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-01-09 19:20:07
