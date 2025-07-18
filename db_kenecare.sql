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
  UNIQUE KEY `uq_appointment_id` (`appointment_id`),
  KEY `fk_payment_appointment_id` (`appointment_id`),
  CONSTRAINT `fk_payment_appointment_id` FOREIGN KEY (`appointment_id`) REFERENCES `medical_appointments` (`appointment_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_payments`
--

LOCK TABLES `appointment_payments` WRITE;
/*!40000 ALTER TABLE `appointment_payments` DISABLE KEYS */;
INSERT INTO `appointment_payments` VALUES (1,1,100.000000,'SLL','ORNAGE MONEY','ef186827-1a26-4eff-a59d-e9fd855fd735','MP240321.1304.A02286','v1jeuvwqiieyvph1rbvuy9pn8ls7dhzyjgpeypgqbvopey7demltwgjfief0lxsn','niezmrfkqqssvjmwsliqvsyihtljumdj','success','2024-03-21 12:03:40','2024-03-21 12:05:25'),(2,2,100.000000,'SLL','ORNAGE MONEY','d5af9e87-a03d-4b1b-b2ad-a9af98b6325a','MP240321.1349.B02362','v1xqcg0qs3dsnicoxbbglpundwisvahpwy6bv6rcrrntgeear3x0dlkxy1r4fpgs','3byo9zwteygy3rv77nkym1voynvdln0v','success','2024-03-21 12:48:22','2024-03-21 12:49:34'),(3,4,100.000000,'SLL','ORNAGE MONEY','d4c48ddf-27d5-4912-b6db-9c5e3059720d','FIRST_FREE_APPOINTMENT','FIRST_FREE_APPOINTMENT','FIRST_FREE_APPOINTMENT','success','2024-04-08 12:24:48','2024-04-08 12:24:48'),(4,5,100.000000,'SLL','ORNAGE MONEY','060dba8a-37f8-4ac6-9c40-4c28c8ca1f42',NULL,'v15fxtdoytt0zs0qeyzii9zmbhusicfpptlg7tpkhf60yuhzvglxymf5kieb9wtl','1vp1x53cewq1wldz0lmg8qqn6qp7r884','initiated','2024-04-08 12:27:16','2024-04-08 12:27:16'),(5,6,100.000000,'SLL','ORNAGE MONEY','dd9bb1f8-f3f3-4a49-86a1-2fee5e6d16a5','FIRST_FREE_APPOINTMENT','FIRST_FREE_APPOINTMENT','FIRST_FREE_APPOINTMENT','success','2024-05-06 16:22:04','2024-05-06 16:22:04'),(6,9,100.000000,'SLL','ORNAGE MONEY','11660f26-90f2-42c6-aa11-c5494c158df1',NULL,'v1taheax6h8fc7rf2e780iuxucua8fqzkxxltbx03dsp9yx7onoet5ads0m3ce3w','gjjpbxmmsme38xwxz7dljsui79ambr0e','initiated','2024-05-07 12:50:12','2024-05-07 12:50:12'),(7,10,100.000000,'SLL','ORNAGE MONEY','f07acbc0-a531-4a14-963c-7d5cae11c983',NULL,'v11bgk6jegiokcr0qwlrran6ds3ydcfuyk2vfc1plc3svcirzpwqhnjmamsr4byc','rdyw42nbs4cu6qritw35nryjoxdhjmrl','initiated','2024-05-07 12:53:38','2024-05-07 12:53:38'),(8,11,100.000000,'SLL','ORNAGE MONEY','866ba16e-4b9a-4c5c-acb3-e4d64f9cc046',NULL,'v1g8a6yr5hkwva2id61tifdmlpyffgax7qgtpnpo06ni4adcgiidwkfsrq1nk5db','mimf4wdidalvod6c9dcbpqgr9hjt4fuw','initiated','2024-05-07 12:55:44','2024-05-07 12:55:44'),(9,12,100.000000,'SLL','ORNAGE MONEY','cf0b98fb-e2ff-4946-bf7d-b00a4f9836f8',NULL,'v1apb6frc2uqo3lbpn8hr99c7ssmjmjshclp5uyth5na6lygi4rrue2d0nebecwd','9nd5pftwe5lcgswjnzkprcbv96krsnnx','initiated','2024-05-07 12:57:38','2024-05-07 12:57:38'),(10,15,100.000000,'SLL','ORNAGE MONEY','258f36f7-82e8-4f72-84bf-b87c26b73cf2',NULL,'v1wnirtso1jejychkohc47cikk8edtfy6suhw2xbu9vrgykpn3wgkaxw6cv8g5ri','tiiabvfzb9qqwbagmjqi1tewxcnjbdnd','initiated','2024-05-07 13:04:01','2024-05-07 13:04:01'),(11,16,100.000000,'SLL','ORNAGE MONEY','e5a73965-2ed5-4bec-8de9-bf8f65d1cd85',NULL,'v1a0f75dvf62urti1dxwmxl3ifj1rqworbzxtlo7tdyoan88iclbxyhi4a1fu92y','8gjjulb2ifcbnwxpey0nbddq7vsnzmyc','initiated','2024-05-07 13:06:58','2024-05-07 13:06:58'),(12,17,100.000000,'SLL','ORNAGE MONEY','2e45a32a-2ad0-4509-b30f-40f1b27d76de',NULL,'v1dzvywza8w2yiuppkiql6w7dmiajamkd09zympnvjtoklnbg030dhsyry2vzf9t','tptqd73bighfa0wb46iuoeikju0lyqeb','initiated','2024-05-07 13:10:37','2024-05-07 13:10:37'),(13,18,100.000000,'SLL','ORNAGE MONEY','362bf509-a197-4c22-81e7-3daa1fc8122c',NULL,'v1stfpk7dbuxss27o9k9nlea2epdebn3ukvxwn6zu63jobx8jk5vtcxca9zw9d4v','dlkpoahjzh1igs4se7tes0bs6feawgkv','initiated','2024-05-07 13:13:39','2024-05-07 13:13:39'),(14,19,100.000000,'SLL','ORNAGE MONEY','3deaa58e-4991-4ff1-bbb7-8f9f2f537b5f',NULL,'v11ulioyjqxxbaov6hgkzupk7b16y77i2jpc2w4tefze6wzspa8uvsqcwok3br8u','qiqazduq3ylbu1nfeu0n7gdna1i27akh','initiated','2024-05-07 13:25:09','2024-05-07 13:25:09'),(15,20,100.000000,'SLL','ORNAGE MONEY','e6b2b72a-bc46-4dca-9f34-5489624ce3dc',NULL,'v1afqfla8zj4ouyrlodwqckewxhktdzsac33qgpjzki5y0x7xzimzonurzsz5yso','lg39krajho5jweuuegijfazsxvwqd2ly','initiated','2024-05-07 13:26:15','2024-05-07 13:26:15'),(16,21,100.000000,'SLL','ORNAGE MONEY','418478ac-c902-4b2c-b766-77c88d77df05',NULL,'v15rhfjd163om5iozmkk6dtrttypezuuzjyyyy3unnezjw0fiblwq4cojegomzpe','vealawafy0z2g43ifybn3rovgyxaz66s','initiated','2024-05-15 16:39:54','2024-05-15 16:39:54'),(17,22,100.000000,'SLL','ORNAGE MONEY','b5311b87-5d1f-417b-a406-6e58ff600213',NULL,'v1bg7vytv80qh8rkykmlpohsypmfgoymcqa5hgqqpi0bdcakhsgnzfam9fdrksz3','oefdolm1gb6blsizx6rcitzoddmguja8','initiated','2024-05-15 16:42:13','2024-05-15 16:42:13'),(18,23,100.000000,'SLL','ORNAGE MONEY','6059cbd5-4a6d-4a88-9223-c5d7a071b022','MP240515.1848.A02902','v1oz6yezeepekbhdhpf8cpfstzzy1dklxckpbzkdseryldd0k0t88unidqlvsrtl','pp6pohb8leftqouzkg4uhyysaqwysmo3','success','2024-05-15 16:47:23','2024-05-15 16:48:08');
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
  `diagnosis` varchar(1000) DEFAULT NULL,
  `medicines` text NOT NULL,
  `pharmacy_id` int DEFAULT NULL,
  `date_dispensed` date DEFAULT NULL,
  `pharmacist_name` varchar(200) DEFAULT NULL,
  `paharmacy_name` varchar(500) DEFAULT NULL,
  `pharmacy_contact` varchar(50) DEFAULT NULL,
  `doctors_comment` varchar(500) DEFAULT NULL,
  `access_jwt` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`prescription_id`),
  KEY `fk_prescription_appointment` (`appointment_id`),
  CONSTRAINT `fk_prescription_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `medical_appointments` (`appointment_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_prescriptions`
--

LOCK TABLES `appointment_prescriptions` WRITE;
/*!40000 ALTER TABLE `appointment_prescriptions` DISABLE KEYS */;
INSERT INTO `appointment_prescriptions` VALUES (1,6,'fd7a199c244d509868e0a609fd8c859783b5bda66d8464184ff80528a130f98c53f96a306158c717212bcb4a0daf818adc552f155bf350eaf1de8b74c1793300a543b3927b8dbc42fde5d98d0f6eb480f240cf414c6e5377314be1a5cfec31d9','749132a00bd42e0f7d68541a4425f6feb373690658b96cf9a7bce82f42c72991dac35f0d1a0eec447fc06061f554ca1417b395113ce9c251801e1ed686686fb0acfd2e2df94d2b8a46ed3f5fae5fead0d856fbc02df6ea984b3a16cefb78587b262018adc92930638600b3b922f717d92e906b57ada2fcc61ad2eafe5bf439068ba71265e155f60e8dd7217b6cc52c1d9c7d00356ddf1fc281abcc58cd5e456258ad4feea5c77c44c46a92258012c8c2cdb3f12a271d6a68b32fc5cb7fefb37cf0457ab5ef892f39efe8373f793ab73c853ecf860efe1c62fdac045873e17e6f',NULL,NULL,NULL,NULL,NULL,'749132a00bd42e0f7d68541a4425f6feb373690658b96cf9a7bce82f42c72991dac35f0d1a0eec447fc06061f554ca1417b395113ce9c251801e1ed686686fb0acfd2e2df94d2b8a46ed3f5fae5fead0d856fbc02df6ea984b3a16cefb78587b262018adc92930638600b3b922f717d92e906b57ada2fcc61ad2eafe5bf439068ba71265e155f60e8dd7217b6cc52c1d9c7d00356ddf1fc281abcc58cd5e456258ad4feea5c77c44c46a92258012c8c2cdb3f12a271d6a68b32fc5cb7fefb37cf0457ab5ef892f39efe8373f793ab73c853ecf860efe1c62fdac045873e17e6f','$2a$10$wuauSA3OcBlNOIrjCiDsBeMLbfo0TF8MFnfDtpPr0YLL8mBsgv/DK','2024-05-13 12:59:56','2024-05-13 12:59:56'),(2,6,'a70bc272281107c58ed331b6742bac04caa33b845ef8f86a1a14f47f14d76e88fa393454f8e8c341a848f18075ed56b0c6ea8055b4ea6ac50d22e309c9229225054a00540bc3610eced11879edf48f6a746beb8bb775e5db55a1aad98b28a3c6','57f59434c2089c097374713994f5f5206157d1f440adc5b4a530dc3ded261f435d0d2f28f29bc7f915598018cba630848b68cba8f58cb498e9b84105c15e8d59c30b8ff55f03615a645a094bf9e150bf88091f409e3fa74be55c642a49fb3b0d74c85763befeed7cc992d034c147a377ac6a980b0ea908f3e1beff5269e8c07c58e2012f380ecce1844f28257047967f709522e202c4e48afb5465a752cca3ec7962746b71bb18768614b2e429fa5b341ec8a2f0b9c173e91edd308e84af09997a3b068cf5b167e78c834be8c2aca5f654949d3809db873cd5348fed42ba532c',NULL,NULL,NULL,NULL,NULL,'57f59434c2089c097374713994f5f5206157d1f440adc5b4a530dc3ded261f435d0d2f28f29bc7f915598018cba630848b68cba8f58cb498e9b84105c15e8d59c30b8ff55f03615a645a094bf9e150bf88091f409e3fa74be55c642a49fb3b0d74c85763befeed7cc992d034c147a377ac6a980b0ea908f3e1beff5269e8c07c58e2012f380ecce1844f28257047967f709522e202c4e48afb5465a752cca3ec7962746b71bb18768614b2e429fa5b341ec8a2f0b9c173e91edd308e84af09997a3b068cf5b167e78c834be8c2aca5f654949d3809db873cd5348fed42ba532c','$2a$10$To5CxhC4h26LTL727uFUK.4DYaFEOv8hKrsx7LaoDl8a44mlwTeby','2024-05-13 13:00:05','2024-05-13 13:00:05'),(3,6,'5c630dee067d7bff7b415ccd51ab0a6fff4057045e9eb559ef7e40acffa7c9a02fbbcaadff9fb48a939df55ef23749939c559cb1ca5dde42d8aa0f7e522ace0280d97995b529113f3f6a4e413d654d4173446e0a42e99b24cc1ce28a604132fa','0d3adea623fda4c8d2477da65174087793f9ea73d5f687199376b3261b1e6a8e908bc8cf5f693cf90961b48386c619a41691aaed1ebd21fa54ee20bf3db7fcceb245e0ab64f1b8a5b869a40f1a6299e5a72457080bc59c63c2c851f176a9c23afd50830fb122b739540d819b4392ee9118c330c3efc7e80deda694eb9860c11cb72ca887eada0b81b193973bb3a5702c5355b60bc1bc94a72ffa4606de2973771023fa311f520483433411a9c112944e213d6911dfa4cb46e75495d376216f89b6f5cd22e151a394ee88459c767d07500d2f55a4b5cdf28afd7413277b5c7c4bf11b4cd04d65d8b3d3e82a90c06bb564b4a2aa851f481dde38438fe3a7226db0b602b3e6a6ad9b93d924588dbc9cf0829e4b19e3f597f7e3c121e680f99bfdf35b79ac835ddc7c6618d95f65e9f182807dca6e4e5fd0e3218e3ca257504efc5131fc4687ca0211e8bc782d157d871a69',NULL,NULL,NULL,NULL,NULL,'9c258098266617003f91e7c53e01131f26c94dba6a48424f730bf54d87b8870467fc638ddf5f38d32df929a4858f025ff9e4101117c0ef0e997d082b73e5ed0920dace85eb4442a388d9cb9e97f83a63','$2a$10$oGr5wO29qojZY6oaSgwXlu46QfdC4jCn/3vGVFZ68bE1H6gfULM2G','2024-05-15 16:29:32','2024-05-15 16:29:32'),(4,6,'19a560da918fe47593ade875ffbbaebeee01744380d84dd1ba6cd105c08e8fe5b66148df3cd28a2cef4248d4a2c861e78c940bc3d5e531e9df864287b90d30e2ec09482c5faf02c9094334481ca5b4ef17ea52191c4ed5f31b6c5a1025dd73a1','a6e6298d5b100ea50f33ec1e308cca677e312c30508f7a32dcf2705a2283a780e8a83dd8b857d144e7b395665616d367e35d6e1a2ca59ac2c7ee1281d2fed94f179b3606fc50275f083493568b91a9a94b62a0d0180a649a29dfacc39899598dc7b5fb5aeb21a97cbee93bf4b5e7af73ff47e5c3bbefd4ddbcef24fa9a50995cd4016ee702589c544c535c55d2c65d85ece2e3b7b250c559bf99e263bbd6e771c93be68ff6aecd4904479c0032c147c2b02be5c51b82acabfbc70305aa768268245a8325389593da7a93b92dac1d218aa5ba3d4b4e6644669b5cb285d3decc1e5281ef3810dddf7c4c18563e6a16a1cf12bcd85672afeea3848cdf875c33cd3d16ca873e9ebcf40c3ec9bac0a18d127132607a98dd004ea5f9b219ea5bbb15f4ac4beee8b0b307073fae5d8020456611c5f30b3c2aa26f25993180f2861cba1eaff35c2256b40288d90ff0422d00e704',NULL,NULL,NULL,NULL,NULL,'de33acbc8c2916535ecac0e2841f90085b17f46f57cc3cdf73b0aaa47d7620ae24a0dfa5eeaf8dba2d2b70cc594f3ad8865591dfc1eb57c9b9d0dd3a19dcd2968ef50be0b22d46b5a384cdf7356b0597','$2a$10$HvdlIjiOVuJKq5IOY6E0Yumpclm.9.2vrRwm7ounpJ0bVKWCGCqMG','2024-05-15 16:32:07','2024-05-15 16:32:07');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_categories`
--

LOCK TABLES `blog_categories` WRITE;
/*!40000 ALTER TABLE `blog_categories` DISABLE KEYS */;
INSERT INTO `blog_categories` VALUES (1,'breast cancer',1,1,'2024-02-01 14:22:16','2024-02-01 14:22:16'),(2,'mental health',1,1,'2024-02-01 14:22:26','2024-02-01 14:22:26');
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
  CONSTRAINT `fk_blog_admin` FOREIGN KEY (`inputted_by`) REFERENCES `admins` (`admin_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_blog_category_id` FOREIGN KEY (`blog_category_id`) REFERENCES `blog_categories` (`category_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blogs`
--

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;
INSERT INTO `blogs` VALUES (2,2,'Understanding Mental Health','October is Breast Cancer Awareness Month, a time when individuals and organizations come together to raise awareness about breast cancer and promote early detection. Breast cancer is one of the most common cancers worldwide, affecting both men and women. In this blog post, we aim to provide information and resources to empower everyone in the fight against breast cancer. What is Breast Cancer? Breast cancer is a type of cancer that begins in the cells of the breast. It can occur in both men and women, although it is far more common in women. The disease usually starts in the milk ducts or glands and can spread to other parts of the body if not detected and treated early. Know Your Body: Understanding the normal look and feel of your breasts is essential for early detection. If you notice any changes, such as lumps, swelling, or skin changes, it\'s important to consult with a healthcare professional promptly.','5e69591f062517ae4eb7478ac2193e8d.jpg','\"[\\\"BreastCancerAwareness\\\",\\\"EarlyDetectionSavesLives\\\",\\\"KnowYourBody\\\",\\\"SupportEachOther\\\", \\\"HealthyLiving \\\",\\\"CancerPrevention\\\",\\\"FightLikeAGirl\\\",\\\"OctoberPink\\\" ]\"',3,1,1,'2024-03-26 06:17:05','2024-03-26 06:17:05');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `common_symptoms`
--

LOCK TABLES `common_symptoms` WRITE;
/*!40000 ALTER TABLE `common_symptoms` DISABLE KEYS */;
INSERT INTO `common_symptoms` VALUES (1,'common cold updated','the common cold is an infection of your nose, sinuses, throat and windpipe. colds spread easily, especially within homes, classrooms and workplaces. more than 200 different viruses can cause colds. there’s no cure for a common cold, but it usually goes away within a week to 10 days. if you don’t feel better in 10 days, see a healthcare provider.',1,'symptom_6fd5cdfd55fe354d0ec5437a2ddebaed.jpg',200,'sneezing, runny nose, stuffy nose, cough, headaches, fatigue',1,3,'2024-04-08 16:01:19','2024-04-08 16:34:24'),(2,'allergies','an allergy is a reaction the body has to a particular food or substance.\n\nallergies are very common. they’re thought to affect more than 1 in 4 people in the uk at some point in their lives.\n\nthey are particularly common in children. some allergies go away as a child gets older, although many are lifelong. adults can develop allergies to things they weren’t previously allergic to.\n\nhaving an allergy can be a nuisance and affect your everyday activities, but most allergic reactions are mild and can be largely kept under control. severe reactions can occasionally occur, but these are uncommon.',1,'symptom_24d4344d8d17441c8f3e6a6ac5e8591f.jpg',200,'sneezing, runny nose, stuffy nose, cough, headaches, fatigue',1,3,'2024-04-08 16:41:31','2024-04-08 16:41:31'),(3,'influenza (flu) updated','signs and symptoms: fever, chills, cough, sore throat, muscle aches, fatigue, headache, nasal congestion, and sometimes gastrointestinal symptoms like nausea and vomiting.\n\nadditional information: influenza is caused by the influenza virus and can spread easily from person to person, especially during flu seasons. vaccination is recommended annually to prevent infection.',1,'symptom_349f454efc051cb569c05c13b9a9785c.jpg',150,'Fever, chills, cough, sore throat, muscle aches, fatigue, headache, nasal congestion',1,3,'2024-04-16 11:42:10','2024-04-16 11:44:28');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_available_days`
--

LOCK TABLES `doctor_available_days` WRITE;
/*!40000 ALTER TABLE `doctor_available_days` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_time_slots`
--

LOCK TABLES `doctor_time_slots` WRITE;
/*!40000 ALTER TABLE `doctor_time_slots` DISABLE KEYS */;
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
  CONSTRAINT `fk_doctor_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (1,1,'Dr.','Amarachi','Josephine','Eke','female','A highly skilled and dedicated pediatrician, possessing a wealth of professional experience in the specialized care of infants, children, and adolescents. With a robust clinical background and a commitment to providing exceptional healthcare for the younger population, this seasoned pediatric doctor is well-versed in the nuances of pediatric medicine. Their extensive experience spans a broad spectrum of pediatric conditions, enabling them to offer comprehensive and compassionate care to young patients and their families. The doctor\'s commitment to staying abreast of the latest advancements in pediatric healthcare ensures that they deliver optimal and evidence-based medical interventions. With a passion for promoting the health and well-being of children, this professional pediatrician brings a depth of knowledge and expertise to the practice, making a positive impact on the lives of the young ones under their care.',NULL,1,'DipIMC - Diploma in immediate care',100.00,NULL,1,20,1,3,'2024-03-21 11:03:46','2024-03-21 11:13:36');
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
  `verified_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`council_registration_id`),
  KEY `fk_doctor_id` (`doctor_id`),
  KEY `fk_doctor_registration_council_id` (`medical_council_id`),
  KEY `fk_doctor_registration_admin_id` (`verified_by`),
  CONSTRAINT `fk_doctor_registration_admin_id` FOREIGN KEY (`verified_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_doctor_registration_council_id` FOREIGN KEY (`medical_council_id`) REFERENCES `medical_councils` (`council_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_registration_doctor_id` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors_council_registration`
--

LOCK TABLES `doctors_council_registration` WRITE;
/*!40000 ALTER TABLE `doctors_council_registration` DISABLE KEYS */;
INSERT INTO `doctors_council_registration` VALUES (2,1,1,'SLMDC-2012-23212','2012','council_cert_977d186bc9debbd9a0e800d34d05e5fc.pdf','2012-09-30','2024-09-30','pending',NULL,NULL,'2024-03-28 11:08:48','2024-03-31 08:55:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors_wallet`
--

LOCK TABLES `doctors_wallet` WRITE;
/*!40000 ALTER TABLE `doctors_wallet` DISABLE KEYS */;
INSERT INTO `doctors_wallet` VALUES (1,1,1085.00,'$2a$10$zMlmz68TO.cGwQE9jfeIH.sL4fay8LvTMiPp4XM0jD8g.86gWZ8ha','2024-03-21 11:03:46','2024-05-15 16:48:08');
/*!40000 ALTER TABLE `doctors_wallet` ENABLE KEYS */;
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
  `meeting_id` int DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `appointment_status` enum('approved','pending','completed','canceled','postponed') DEFAULT 'pending',
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
  CONSTRAINT `fk_appoinment_zoom_id` FOREIGN KEY (`meeting_id`) REFERENCES `zoom_meetings` (`meeting_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_appointment_doctor_id` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_appointment_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON UPDATE CASCADE,
  CONSTRAINT `fK_appointment_speciality_id` FOREIGN KEY (`speciality_id`) REFERENCES `medical_specialities` (`speciality_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_appointment_time_slot_id` FOREIGN KEY (`time_slot_id`) REFERENCES `doctor_time_slots` (`time_slot_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_appointments`
--

LOCK TABLES `medical_appointments` WRITE;
/*!40000 ALTER TABLE `medical_appointments` DISABLE KEYS */;
INSERT INTO `medical_appointments` VALUES (1,'ef186827-1a26-4eff-a59d-e9fd855fd735',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-03-29','15:30:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-03-21 12:03:39','2024-03-21 12:03:39'),(2,'d5af9e87-a03d-4b1b-b2ad-a9af98b6325a',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-03-29','16:30:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-03-21 12:48:21','2024-03-21 12:48:21'),(4,'d4c48ddf-27d5-4912-b6db-9c5e3059720d',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-04-29','16:30:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-04-08 12:24:48','2024-04-08 12:24:48'),(5,'060dba8a-37f8-4ac6-9c40-4c28c8ca1f42',1,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-04-29','16:54:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-04-08 12:27:14','2024-04-08 12:27:14'),(6,'dd9bb1f8-f3f3-4a49-86a1-2fee5e6d16a5',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:54:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-06 16:22:04','2024-05-06 16:22:04'),(7,'5a41b405-9438-4134-89bc-48c77559ff64',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-07 12:45:42','2024-05-07 12:45:42'),(8,'ac47bf60-72e0-4991-8179-132903dd9bad',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-07 12:45:53','2024-05-07 12:45:53'),(9,'11660f26-90f2-42c6-aa11-c5494c158df1',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-07 12:50:08','2024-05-07 12:50:08'),(10,'f07acbc0-a531-4a14-963c-7d5cae11c983',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-07 12:53:34','2024-05-07 12:53:34'),(11,'866ba16e-4b9a-4c5c-acb3-e4d64f9cc046',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-07 12:55:40','2024-05-07 12:55:40'),(12,'cf0b98fb-e2ff-4946-bf7d-b00a4f9836f8',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-07 12:57:34','2024-05-07 12:57:34'),(13,'8a721ff4-103b-4fa0-8fe7-8023877deae5',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-07 13:00:12','2024-05-07 13:00:12'),(14,'3e305366-6211-499d-93c4-98393f23f308',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-07 13:01:31','2024-05-07 13:01:31'),(15,'258f36f7-82e8-4f72-84bf-b87c26b73cf2',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-07 13:03:57','2024-05-07 13:03:57'),(16,'e5a73965-2ed5-4bec-8de9-bf8f65d1cd85',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-07 13:06:54','2024-05-07 13:06:54'),(17,'2e45a32a-2ad0-4509-b30f-40f1b27d76de',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-07 13:10:33','2024-05-07 13:10:33'),(18,'362bf509-a197-4c22-81e7-3daa1fc8122c',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-07 13:13:34','2024-05-07 13:13:34'),(19,'3deaa58e-4991-4ff1-bbb7-8f9f2f537b5f',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-07 13:25:04','2024-05-07 13:25:04'),(20,'e6b2b72a-bc46-4dca-9f34-5489624ce3dc',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-07 13:26:10','2024-05-07 13:26:10'),(21,'418478ac-c902-4b2c-b766-77c88d77df05',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-15 16:39:53','2024-05-15 16:39:53'),(22,'b5311b87-5d1f-417b-a406-6e58ff600213',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-15 16:42:13','2024-05-15 16:42:13'),(23,'6059cbd5-4a6d-4a88-9223-c5d7a071b022',2,1,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',100.000000,'2024-06-29','16:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-15 16:47:22','2024-05-15 16:47:22');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_councils`
--

LOCK TABLES `medical_councils` WRITE;
/*!40000 ALTER TABLE `medical_councils` DISABLE KEYS */;
INSERT INTO `medical_councils` VALUES (1,'Sierra Leone Medical and Dental Council','slmdc@gmail.com','+23278500300','23 New England Ville, Freetown',1,3,'2024-01-14 03:48:58','2024-01-14 03:48:58'),(2,'Kenema Medical and Dental Council','kenememedicalcouncil@gmail.com','+23278300400','23 New England Ville, Freetown',1,3,'2024-01-14 03:50:20','2024-01-14 03:50:20'),(3,'Port Loko Medical and Dental Council','portlokomedicalcouncil@gmail.com','+23276100405','23 New England Ville, Freetown',1,3,'2024-01-14 03:50:57','2024-01-14 03:50:57');
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
  KEY `fk_sharing_doctor` (`doctor_id`),
  CONSTRAINT `fk_sharing_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sharing_document` FOREIGN KEY (`document_id`) REFERENCES `patient_medical_documents` (`medical_document_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sharing_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_document_sharing`
--

LOCK TABLES `medical_document_sharing` WRITE;
/*!40000 ALTER TABLE `medical_document_sharing` DISABLE KEYS */;
/*!40000 ALTER TABLE `medical_document_sharing` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_specialities`
--

LOCK TABLES `medical_specialities` WRITE;
/*!40000 ALTER TABLE `medical_specialities` DISABLE KEYS */;
INSERT INTO `medical_specialities` VALUES (1,'pediatricians','they care for children from birth to young adulthood. some pediatricians specialize in pre-teens and teens, child abuse, or children&#x27;s developmental issues.','8d3f5f7b2fe0f40898ea7c4decd682ac.jpg',NULL,1,1,'2023-12-19 18:21:53','2024-02-15 10:36:39'),(2,'family physicians','they care for the whole family, including children, adults, and the elderly. they do routine checkups and screening tests, give you flu and immunization shots, and manage diabetes and other ongoing medical conditions.','b7054aaeefe86ecece59af413c006396.jpg',NULL,1,1,'2023-12-19 18:23:00','2024-02-15 11:26:49'),(3,'allergists&#x2F;immunologists','they treat immune system disorders such as asthma, eczema, food allergies, insect sting allergies, and some autoimmune diseases.','73e63a231f17d9f80e48bca479db78ab.jpg',NULL,1,1,'2024-02-15 10:43:28','2024-02-15 10:43:28'),(4,'anesthesiologists','these doctors give you drugs to numb your pain or to put you under during surgery, childbirth, or other procedures. they monitor your vital signs while you’re under anesthesia.','c49a64e741e250b69ea2b7ea2356fa44.png',NULL,1,1,'2024-02-15 10:45:16','2024-02-15 10:45:16');
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
  `access_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`medical_document_id`),
  KEY `fk_document_patient_id` (`patient_id`),
  CONSTRAINT `fk_document_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_medical_documents`
--

LOCK TABLES `patient_medical_documents` WRITE;
/*!40000 ALTER TABLE `patient_medical_documents` DISABLE KEYS */;
INSERT INTO `patient_medical_documents` VALUES (1,'946dff5b-2e86-488f-a394-45fea45e3cbe',1,'Diagnostics Lab Document 3',NULL,'2024-04-04 13:57:16','2024-04-04 13:57:16');
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
INSERT INTO `patient_medical_history` VALUES (1,1,'1.2cm','40kg','Cauliflower, paracetamol',0,'',NULL,'',0,NULL,1,'daily','2024-03-01 14:58:18','2024-03-01 14:58:18');
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
  `booked_first_appointment` tinyint DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`patient_id`),
  KEY `fk_patient_user_id` (`user_id`),
  CONSTRAINT `fk_patient_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (1,2,NULL,'Chinedum','Roland','Eke','male','c883644a11ce3667af84d2bf61705a8a.jpg','1992-07-28',1,'2024-03-21 12:02:12','2024-04-08 12:24:49'),(2,3,NULL,'Chinedum','Roland','Eke','male','104b47339cdad0dee173dc002b9b84af.jpg','1992-07-28',1,'2024-05-06 16:21:27','2024-05-07 13:23:11');
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
  `approved_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`testimonial_id`),
  KEY `fk_testimonial_patient_id` (`patient_id`),
  KEY `fk_testimonial_admin_id` (`approved_by`),
  CONSTRAINT `fk_testimonial_admin_id` FOREIGN KEY (`approved_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_testimonial_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON UPDATE CASCADE,
  CONSTRAINT `chk_is_patient_testimonial_active` CHECK ((`is_active` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients_testimonial`
--

LOCK TABLES `patients_testimonial` WRITE;
/*!40000 ALTER TABLE `patients_testimonial` DISABLE KEYS */;
INSERT INTO `patients_testimonial` VALUES (1,1,'Using Kenecare was a game-changer for me. I had some health concerns, but with Kenecare, I could consult with a doctor from the comfort of my home. The doctors were knowledgeable, and the platform was easy to use. Highly recommend it!',1,1,3,'2024-03-01 15:04:19','2024-03-01 15:04:19'),(2,1,'Kenecare made it so convenient for me to get medical advice without having to leave my house. The doctors were attentive, and the whole process was seamless. I felt reassured and well taken care of. Thank you, Kenecare!',1,1,3,'2024-03-01 15:05:08','2024-03-01 15:05:08'),(3,1,'I was skeptical about telehealth at first, but Kenecare exceeded my expectations. The doctors were professional and thorough in their assessments. I appreciated the convenience of scheduling appointments and accessing medical records online. Kenecare is definitely the future of healthcare!',1,1,3,'2024-03-01 15:05:31','2024-03-01 15:05:31'),(4,1,'Kenecare provided me with prompt medical assistance when I needed it the most. I was impressed by the ease of use of the platform and the professionalism of the doctors. It saved me time and hassle compared to traditional doctor visits. I highly recommend Kenecare to anyone looking for accessible healthcare solutions.',1,1,3,'2024-03-01 15:05:46','2024-03-01 15:05:46');
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
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_user_mobile_number` (`mobile_number`),
  UNIQUE KEY `uq_user_email` (`email`),
  KEY `fk_user_type_id` (`user_type`),
  CONSTRAINT `fk_user_type_id` FOREIGN KEY (`user_type`) REFERENCES `user_type` (`user_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_is_user_account_active` CHECK ((`is_account_active` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'+23299822683','comroland85@gmail.com',0,NULL,2,'$2a$10$9Liex0PFWMZxoNLK558Ak.HZbA4r60vWK/cbu5XVpP0AIGfFPEZsW',NULL,1,'2024-03-21 10:58:53',1,1,0,NULL,'2024-03-21 10:58:24','2024-03-21 10:58:53'),(3,'+23278822683',NULL,0,NULL,1,'$2a$10$8aS1wj6aXZarspZ8n5dxRuw1u1co2MjXWru6xlcq9LhXIqawZ.Mri',NULL,1,'2024-05-06 16:17:38',1,1,0,NULL,'2024-05-06 16:17:14','2024-05-06 16:17:38');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `withdrawal_requests`
--

DROP TABLE IF EXISTS `withdrawal_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `withdrawal_requests`
--

LOCK TABLES `withdrawal_requests` WRITE;
/*!40000 ALTER TABLE `withdrawal_requests` DISABLE KEYS */;
INSERT INTO `withdrawal_requests` VALUES (1,1,150.00,'orange_money','078121212','ZENITH','Chinedum Roland Eke','1234567893','declined',3,'The withdrawal was denied because of lack of duncs jasdkalsda','2024-03-22 16:14:13','2024-03-25 14:06:38'),(2,1,150.00,'orange_money','078121212','ZENITH','Chinedum Roland Eke','1234567893','pending',NULL,NULL,'2024-03-22 16:38:54','2024-03-22 16:38:54'),(3,1,150.00,'orange_money','078121212','ZENITH','Chinedum Roland Eke','1234567893','approved',3,'Comment','2024-03-22 16:39:19','2024-03-25 12:23:09');
/*!40000 ALTER TABLE `withdrawal_requests` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zoom_meetings`
--

LOCK TABLES `zoom_meetings` WRITE;
/*!40000 ALTER TABLE `zoom_meetings` DISABLE KEYS */;
/*!40000 ALTER TABLE `zoom_meetings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-05-19 11:14:54
