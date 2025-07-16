CREATE DATABASE  IF NOT EXISTS `db_kenecare` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db_kenecare`;
-- MySQL dump 10.13  Distrib 8.0.29, for Win64 (x86_64)
--
-- Host: kenecaredb.c21sniyiuhiu.us-east-1.rds.amazonaws.com    Database: db_kenecare
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

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
  CONSTRAINT `fk_appointment_feedback` FOREIGN KEY (`appointment_id`) REFERENCES `medical_appointments` (`appointment_id`) ON DELETE CASCADE ON UPDATE CASCADE
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
  CONSTRAINT `fk_payment_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `medical_appointments` (`appointment_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=131 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_payments`
--

LOCK TABLES `appointment_payments` WRITE;
/*!40000 ALTER TABLE `appointment_payments` DISABLE KEYS */;
INSERT INTO `appointment_payments` VALUES (1,1,500.000000,'SLL','ORNAGE MONEY','98c9c151-901b-49cb-b024-4847687c2c5c','MP240301.1638.A02059','v16ms99r0kve6mmsc27vjnnmj2xyvr5uiffaidk5aipep2xg0qcldcm0g96bvnvq','xlqygnjj8thewejem5fo1xvonafgf9q5','success','2024-03-01 15:37:15','2024-03-01 15:38:35'),(3,3,500.000000,'SLL','ORNAGE MONEY','9e852785-dc26-41aa-97e4-51268a6bf001',NULL,'v1yk0ndrqofle50asytyhatcsvc9xxdw0fgqz3rsu2g01td6i93utzjmusxj2g6p','cfrhtbxp6hf9njegbfqmt7pevshk42ma','initiated','2024-03-01 17:20:12','2024-03-01 17:20:12'),(4,4,500.000000,'SLL','ORNAGE MONEY','c4c48479-9ccd-4178-be74-59395bad49f4',NULL,'v1swr9emmt16vrawoqmo5fs5j7fgeuqljmeewbwzxtnjx2evdql3lwlsjzjm18so','yaxhm9unpvqhgxskh6qx999uqp6gdaqi','initiated','2024-03-01 17:27:22','2024-03-01 17:27:22'),(5,5,500.000000,'SLL','ORNAGE MONEY','3c48f00c-d31c-498e-ab7f-6d7641453487',NULL,'v1qse315cvcnqhttequ0ppiu7iqqwfp81an8zudvtjkm0uadaypxzrcpt0zbgfo9','zkfdniysg5elu4jo1do1pcc1ptcnjcgd','initiated','2024-03-01 17:27:22','2024-03-01 17:27:22'),(6,6,500.000000,'SLL','ORNAGE MONEY','b22f7e9d-3fd4-4088-affd-95b2cfcf61e5','MP240302.1313.A02061','v1ylc2kiuu8r36llswgrif0zjocg8ool4b5zodeaf6jjhtfc4ykk3wsi5trd59r2','ococf7fhqqhplprkqrj1grtq5f70xmoy','success','2024-03-02 12:12:43','2024-03-02 12:13:59'),(7,7,500.000000,'SLL','ORNAGE MONEY','0e666979-6cf9-41e9-84e7-59c07c915656',NULL,'v14lq5y4bstc3g4wxvnrqh5dwfpztw9ups8vulqmxoj6c0gmim7gifeosagbpv2a','arxh6hgzhfxrcmvevlnhwgsk38msbl4x','initiated','2024-03-02 12:21:27','2024-03-02 12:21:27'),(8,8,500.000000,'SLL','ORNAGE MONEY','a81a41f7-ef16-4ad2-aed3-751561b8305f',NULL,'v1dyoofdmbklyzmej2ebmcub7t5w7dg0nbbazkoy2xgsyhdzczuoxcgrpelfp89p','dx93hjzpal3pyrnh9typ5ltizhsfiwj5','initiated','2024-03-03 10:35:44','2024-03-03 10:35:44'),(92,93,500.000000,'SLL','ORNAGE MONEY','3b98239b-8336-49eb-bd29-4764b93852aa',NULL,'v1knffkmkz13h7t6bov8gaaiy02zejrlsnmx3f34ufvucw0kvoi7jgclk5fawefx','zi7rqjfg7qblvxyd1mo6pwskf7bnefmn','initiated','2024-03-20 08:41:05','2024-03-20 08:41:05'),(96,97,500.000000,'SLL','ORNAGE MONEY','da890e78-f22b-43c1-9f38-6dc4df256ba1','MP240401.1657.A02323','v1znf5nyvw9ex9yakm99vckrx3bn4ios7twdx9twkthea3bh1jnax3md3kegedfd','2yxxaipzafdgo2xdxhrio3d9jzkphhbn','success','2024-04-01 14:57:01','2024-04-01 14:57:58'),(97,98,500.000000,'SLL','ORNAGE MONEY','46ba2354-7116-4eb7-8372-2d348815dafa',NULL,'v127xr4spbzwbcvgk8ezhk0ehau4khlotmwuftidomqitcneurq4x1ocudafncwd','sixvyfdsui5makrbaoypf6eqw55lfmxi','initiated','2024-04-01 14:59:13','2024-04-01 14:59:13'),(98,99,500.000000,'SLL','ORNAGE MONEY','7905d167-916c-4857-b688-39820ee7f238','MP240401.1701.A02324','v1sah1jzeeyytxxkkmw20eovplkagrppq3kgzldeowyppwlol0yakzz1bva3l1vs','hloiqo0alc9vo87vp2gkzynvzk7sz3e2','success','2024-04-01 15:00:54','2024-04-01 15:01:33'),(101,102,500.000000,'SLL','ORNAGE MONEY','8ef64274-8632-428c-8a2b-70c93d9765f1','MP240415.1851.B02554','v1eudh9qwlg23k3xo8jrncvyssszj41pbgp48hm0pumxrsvaxzlzxeleem7vpdfs','5zruzqogg2a7afwuxnlvvsnnkcnualk1','success','2024-04-15 16:50:31','2024-04-15 16:51:13'),(102,103,500.000000,'SLL','ORNAGE MONEY','422e03c8-7b63-4305-92bd-b62f9497b5b9','FIRST_FREE_APPOINTMENT','FIRST_FREE_APPOINTMENT','FIRST_FREE_APPOINTMENT','success','2024-04-16 17:04:55','2024-04-16 17:04:55'),(103,104,500.000000,'SLL','ORNAGE MONEY','04ebb5d1-3450-4ee9-8e4a-b927986e6d97',NULL,'v1bh2lzesdnlj9l9gpgtumgzjfanj1jwdwgyhs4ha6qe5lyardzwbt1fkzpa9eot','ccixpu9qsgtynwuimoqfe85gzsgvks8b','initiated','2024-04-16 17:05:59','2024-04-16 17:05:59'),(104,105,500.000000,'SLL','ORNAGE MONEY','3b298bcb-7bb0-4b3e-a231-7d059adfddcf',NULL,'v1s3myteojykkkhtj9s2iyejdxaxqnxnufwwtivhkq8zxxvtxq2pwdsspjkp4v1u','bchxmkabo6glcnlpobjh1hpivc6m6jio','initiated','2024-04-16 17:08:03','2024-04-16 17:08:03'),(106,107,250.000000,'SLL','ORNAGE MONEY','a5c0e736-51aa-4104-9046-f90da3bbe815',NULL,'v1tddvixp3sllqlfabeupwimdhgs23xuslqbm5euhxt6zaxexyzwqbp9o6lwgfki','xtlfpjgocrgppmpz5zi5xr6qnrgt63ym','initiated','2024-05-13 10:53:56','2024-05-13 10:53:56'),(107,108,250.000000,'SLL','ORNAGE MONEY','b9ef7969-a863-4110-a1e0-38ed1a0b5707',NULL,'v16w5kjnex5jwdlzy78qm1gdf9lhazjegb3dh6jclyf22impjziuyem07sm3gkop','mugdxtui8zoeipjkdidwngzyslgppadq','initiated','2024-05-13 10:55:31','2024-05-13 10:55:31'),(108,109,500.000000,'SLL','ORNAGE MONEY','6f8c57bc-db0f-458e-b5a4-f6cd96052a78','FIRST_FREE_APPOINTMENT','FIRST_FREE_APPOINTMENT','FIRST_FREE_APPOINTMENT','success','2024-05-13 11:06:42','2024-05-13 11:06:42'),(109,110,500.000000,'SLL','ORNAGE MONEY','4f1877e5-7446-4aba-8a3f-97d22952a415',NULL,'v1t4l83uxph7ytwdqqeylnnlwybetwszdrfcjdsds5sjtsjujwh7pbohs9mqd5ne','sewvrdmiqwtpqogsmpl2vvxtqxb2fg2p','initiated','2024-05-13 11:07:54','2024-05-13 11:07:54'),(110,111,250.000000,'SLL','ORNAGE MONEY','67e4d006-7094-44f4-a0d8-c6ef0dcdf0be',NULL,'v1r3nfl46j3qs2z6k2kfd6u2zeby3wrnf0olgjbnfkivvkxkzptjhgvvk49pziaa','vfkbt8voktk56pohxtz7uwf4wosrmcss','initiated','2024-05-13 11:09:25','2024-05-13 11:09:25'),(111,112,1.000000,'SLL','ORNAGE MONEY','051fc908-1ea7-4395-95cf-3e2b1eb618da','MP240513.1112.B59578','v1eytxttlqsv3k6xu7zz90tj3jszsuaoxmtqaufw9osg0vv9lu6h3ll7tbxaistk','wjtctemh2x0xgdochchet3baaaawrvtd','success','2024-05-13 11:11:30','2024-05-13 11:12:06'),(112,113,1.000000,'SLL','ORNAGE MONEY','80ef549d-b40e-48bb-b2ee-cf375c83b9fb',NULL,'v1qkbgp9kxyp8dwfdpus4ntjpck5lucbacny6j257kkbhitiqtejhcvz1aevsb4o','2pnejzcsnjwiresdgwvofqoromu9r6pr','initiated','2024-05-13 11:12:29','2024-05-13 11:12:29'),(113,114,1.000000,'SLL','ORNAGE MONEY','dd9751a8-05dc-448c-b140-5d0d7ea3d203',NULL,'v10sxwkaoxzozmhnyslctvotphcmrxfjwlivfrmpw9skghpjmxjfcnrrzzuvqvpn','ewdgymqcmxgu6nsgw9j6gwnkt8d0dss7','initiated','2024-05-13 11:16:15','2024-05-13 11:16:15'),(114,115,1.000000,'SLL','ORNAGE MONEY','a6e49eb0-f4c9-4486-976f-181b8b7c909c',NULL,'v1mkciwb5mnptcw03y0pij0ienor25cxxqyrubpakve8qzog4yblbj6eflkggmoh','ezuuf3ftupsc0l1adic03roigtdhpir6','initiated','2024-05-13 11:18:23','2024-05-13 11:18:23'),(115,116,1.000000,'SLL','ORNAGE MONEY','25355afc-03a5-472b-8fa8-5e61c7c39d83','MP240513.1122.A55739','v1i2h47ep6ggghmjsmfp40q6jcs5r0ivcssh5bc7mrazct7t9wxics2tcbhodimh','v6j4zirsm5vdc6vmqjq1a7emtwzdsvby','success','2024-05-13 11:21:05','2024-05-13 11:22:33'),(116,117,1.000000,'SLL','ORNAGE MONEY','6f3021c6-a932-41d5-b40c-8b2fa226950a',NULL,'v1c34ynwjfxl9leypfzbrra8l2cfubx7bk80orpqvcttyvuyrlupje6x1bdbw29c','czphliikhqdrg1f3mnushgcer7ge7rnx','initiated','2024-05-13 12:11:33','2024-05-13 12:11:33'),(117,118,1.000000,'SLL','ORNAGE MONEY','e09e6999-59e2-4588-80ae-098c8e4a4002','MP240514.1533.B76843','v1rg3fuycpp84lwaogmskmreawcgdjkd1lr9jdf5l1delsd2hjlph7rsdnx5uqwd','wcxufqsl40ag72akznboqfwily4sserl','success','2024-05-14 15:29:18','2024-05-14 15:33:15'),(118,119,1.000000,'SLL','ORNAGE MONEY','c220abb8-21d2-429a-ab2d-333866666624',NULL,'v1pcoqezf96fpcqae1sfocnlgvmhmoxewflfxujj7b6r5k01vb8teyeycvyyvkv3','xa1kcjiqdkatrbr7j5mrvwlgxnmsns2v','initiated','2024-05-14 15:32:56','2024-05-14 15:32:56'),(119,120,250.000000,'SLL','ORNAGE MONEY','336bbbb7-5176-4071-8d20-6c25422f19cf',NULL,'v1cxhwbt7xwrqg9lfmt1577xyvmry1vp0fa38i2miz2cyyzeybldxjl7hyj7w62x','8btwigeo9kt8ksgpaflcgjn7i3ua34xi','initiated','2024-05-28 12:24:28','2024-05-28 12:24:28'),(120,121,250.000000,'SLL','ORNAGE MONEY','55295c08-9faf-4a63-a957-5f020efb583e','FIRST_FREE_APPOINTMENT','FIRST_FREE_APPOINTMENT','FIRST_FREE_APPOINTMENT','success','2024-05-28 12:43:38','2024-05-28 12:43:38'),(121,122,1.000000,'SLL','ORNAGE MONEY','7bb67143-27d2-4399-bb48-fe99ea2dffa0',NULL,'v11bzqrcvradittwo7mqxe5setowymtbqiw7fgir6geg3n5ltrkdbtc4b4njyox9','k7aoox6jzfmulvlmi90refmg462p4g2q','initiated','2024-05-31 12:45:39','2024-05-31 12:45:39'),(122,123,1.000000,'SLL','ORNAGE MONEY','c485cd65-673e-415c-bf04-169d2a3c471d',NULL,'v1xplczahwbwc1uw1kkxqqxn8zbtoqefb5faxoiofdwvbthxhvznsiqrctzn92hd','es0vy2v2qevkgmnlwpqct0niqa341cof','initiated','2024-05-31 13:03:01','2024-05-31 13:03:01'),(123,124,1.000000,'SLL','ORNAGE MONEY','243ed034-f1a7-4c42-8f7d-51bac97c8960',NULL,'v1sbv8p1on9z2qfk6mlnwwkb6hjjzpzurc8i1c7xfax97tpbcxplwqeg4gwcikut','3xo4kdnzgxgd4tzomjrc2yzlrhnxtnif','initiated','2024-06-10 12:07:46','2024-06-10 12:07:46'),(124,125,1.000000,'SLL','ORNAGE MONEY','5e56b696-5562-4348-bac5-ce16d633d990',NULL,'v1heotgb0l54duinx3xa4aelm6uibjkqm6ubjpewamptionqec8tsxpagbrahmya','eydwh7lse0eurqbe7ks3kxx3u4qocztk','initiated','2024-06-10 12:08:06','2024-06-10 12:08:06'),(125,126,1.000000,'SLL','ORNAGE MONEY','c99ec7ca-dc2c-4b33-812b-e73b640ba503',NULL,'v1nevfnkdonoaenhzgdlxwrxhpggnfgf24ecdvkqa1plqi2qkdgezan5k4e0erw5','nlyc65yh30m7jqlp424mxknkafhhldup','initiated','2024-06-26 14:44:37','2024-06-26 14:44:37'),(126,127,10.000000,'SLL','ORNAGE MONEY','c0835c62-a5f0-4644-ba67-766c5121e6bd',NULL,'v1cdrm4nee8el8cbyyddvbssvwxwuwt6lgzfewzsqpbbblbjn6wzmmpdntzbrre4','oeftrjab9xlr96bq85izkkdcftr5rkti','initiated','2024-06-27 08:25:49','2024-06-27 08:25:49'),(127,128,1.000000,'SLL','ORNAGE MONEY','1441b458-a9c8-4d56-94aa-e5fce0548023','MP240627.1622.A45952','v1zed5uigamdldbtx76kormnofvapwrttx5r0myrpulsyqov0ktwsfi1goslmhqr','k2jwzok7rmggiv7qcysxozsvpt9nnhbj','success','2024-06-27 16:21:23','2024-06-27 16:22:02'),(128,129,1.000000,'SLL','ORNAGE MONEY','f72ea468-b081-4724-aaa6-daed413b9bca',NULL,'v1qexekrxffh7crjwpsncrkqidmg2xwydejpolj3r1aptunb5dgtcaxj5metczyo','yzbgpib0zpgunaahiyxdknk3zdfaqscm','initiated','2024-06-29 21:58:08','2024-06-29 21:58:08'),(129,130,1.000000,'SLL','ORNAGE MONEY','69c8308b-9392-441b-9fb0-4a69fba839fd',NULL,'v1w7d9wnalji7lcykxtoqhuuwozw2vmxq52km8dyu5yynotgflixk3aibs9kcvxt','9loi9rzyuuvi4erfljj1gu8jyt9vcdhq','initiated','2024-07-03 15:10:48','2024-07-03 15:10:48'),(130,131,1.000000,'SLL','ORNAGE MONEY','bb6922d1-124d-48bb-9f65-18d69c0ab2ff','MP240703.1513.B61830','v1iq3hijszqh1kptefjmexfn6hon8qbhst85uch4ouzuvbbnyj2wqownukuicmwu','ycqv37insfuezqdzcjxsy4vfvegivrtv','success','2024-07-03 15:12:37','2024-07-03 15:13:48');
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
  `access_token` varchar(10) DEFAULT NULL,
  `access_jwt` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`prescription_id`),
  KEY `fk_prescription_appointment` (`appointment_id`),
  CONSTRAINT `fk_prescription_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `medical_appointments` (`appointment_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_prescriptions`
--

LOCK TABLES `appointment_prescriptions` WRITE;
/*!40000 ALTER TABLE `appointment_prescriptions` DISABLE KEYS */;
INSERT INTO `appointment_prescriptions` VALUES (1,102,'This is just a diagnosis','[{\"medicineName\":\"test meds\",\"strength\":\"500mg\",\"dosage\":\"1-0-1\",\"treatmentDuration\":\"3 months\",\"comment\":\"\"},{\"medicineName\":\"metforminss\",\"strength\":\"500mg\",\"dosage\":\"1-0-1\",\"treatmentDuration\":\"3 months\",\"comment\":\"\"}]',NULL,NULL,NULL,NULL,NULL,'Comment',NULL,NULL,'2024-04-16 12:07:34','2024-04-16 12:14:56'),(2,103,'Test Diagnosis for this appointment, please ensure to follow your daily dosage routine','[{\"medicineName\":\"test medsss\",\"strength\":\"500mg\",\"dosage\":\"1-0-2\",\"treatmentDuration\":\"3 months\",\"comment\":\"\"},{\"medicineName\":\"metforminss\",\"strength\":\"500mg\",\"dosage\":\"1-0-1\",\"treatmentDuration\":\"3 months\",\"comment\":\"\"}]',NULL,NULL,NULL,NULL,NULL,'This is just a comment on how u should take the drugs',NULL,NULL,'2024-04-29 13:06:50','2024-04-29 13:06:50'),(3,103,'Test Diagnosis for this appointment, please ensure to follow your daily dosage routine','[{\"medicineName\":\"test medsssasda\",\"strength\":\"500mg\",\"dosage\":\"1-0-2\",\"treatmentDuration\":\"3 months\",\"comment\":\"\"},{\"medicineName\":\"metforminss\",\"strength\":\"500mg\",\"dosage\":\"1-0-1\",\"treatmentDuration\":\"3 months\",\"comment\":\"\"}]',NULL,NULL,NULL,NULL,NULL,'This is just a comment on how u should take the drugs',NULL,NULL,'2024-04-29 13:49:06','2024-04-29 13:49:06'),(4,99,'vgufugiho','[{\"medicineName\":\"test 3\",\"strength\":\"500gm\",\"dosage\":\"1-3\",\"treatmentDuration\":\"2 days\"}]',NULL,NULL,NULL,NULL,NULL,'oihigfufugig',NULL,NULL,'2024-05-07 13:42:19','2024-05-07 13:42:19'),(5,99,'hhhhjj','[{\"medicineName\":\"test 3\",\"strength\":\"500gm\",\"dosage\":\"1-3\",\"treatmentDuration\":\"2 days\"}]',NULL,NULL,NULL,NULL,NULL,'hnjhhhjhlkj',NULL,NULL,'2024-05-07 13:46:01','2024-05-07 13:46:01'),(6,99,'uvuvibijjo','[{\"medicineName\":\"test 3\",\"strength\":\"500gm\",\"dosage\":\"1-3\",\"treatmentDuration\":\"2 days\"}]',NULL,NULL,NULL,NULL,NULL,'ouygigi',NULL,NULL,'2024-05-07 13:52:09','2024-05-07 13:52:09'),(7,99,'bjhohojpjp','[{\"medicineName\":\"test 3\",\"strength\":\"500gm\",\"dosage\":\"1-3\",\"treatmentDuration\":\"2 days\"}]',NULL,NULL,NULL,NULL,NULL,'hghkjhjhk',NULL,NULL,'2024-05-07 13:55:28','2024-05-07 13:55:28'),(8,99,'ioohihi','[{\"medicineName\":\"test 3\",\"strength\":\"500gm\",\"dosage\":\"1-3\",\"treatmentDuration\":\"2 days\"}]',NULL,NULL,NULL,NULL,NULL,'huogfufufgig',NULL,NULL,'2024-05-07 13:56:49','2024-05-07 13:56:49'),(9,103,'Test Diagnosis for this appointment, please ensure to follow your daily dosage routine','[{\"medicineName\":\"testrr\",\"strength\":\"500mg\",\"dosage\":\"1-0-2\",\"treatmentDuration\":\"3 months\",\"comment\":\"\"},{\"medicineName\":\"metforminss\",\"strength\":\"500mg\",\"dosage\":\"1-0-1\",\"treatmentDuration\":\"3 months\",\"comment\":\"\"}]',NULL,NULL,NULL,NULL,NULL,'This is just a comment on how u should take the drugs',NULL,NULL,'2024-05-07 13:58:33','2024-05-07 13:58:33'),(10,99,'hohhooho','[{\"medicineName\":\"test 3\",\"strength\":\"500gm\",\"dosage\":\"1-3\",\"treatmentDuration\":\"2 days\"}]',NULL,NULL,NULL,NULL,NULL,'hiohohohgiugig',NULL,NULL,'2024-05-07 13:59:39','2024-05-07 13:59:39'),(11,99,'ugugigugu','[{\"medicineName\":\"test 3\",\"strength\":\"500gm\",\"dosage\":\"1-3\",\"treatmentDuration\":\"2 days\"}]',NULL,NULL,NULL,NULL,NULL,'hohooh',NULL,NULL,'2024-05-07 14:02:06','2024-05-07 14:02:06'),(12,99,'jhlllklkh','[{\"medicineName\":\"test 3\",\"strength\":\"500gm\",\"dosage\":\"1-3\",\"treatmentDuration\":\"2 days\"}]',NULL,NULL,NULL,NULL,NULL,'bgkjkh',NULL,NULL,'2024-05-07 14:03:21','2024-05-07 14:03:21'),(13,99,'hdhdhdh','[{\"medicineName\":\"test 3\",\"strength\":\"500gm\",\"dosage\":\"1-3\",\"treatmentDuration\":\"2 days\"}]',NULL,NULL,NULL,NULL,NULL,'hdhdxhh',NULL,NULL,'2024-05-07 14:10:47','2024-05-07 14:10:47'),(14,99,'test','[{\"medicineName\":\"test 3\",\"strength\":\"500gm\",\"dosage\":\"1-3\",\"treatmentDuration\":\"2 days\"}]',NULL,NULL,NULL,NULL,NULL,'jfhfh',NULL,NULL,'2024-05-07 14:54:43','2024-05-07 14:54:43'),(15,99,'test','[{\"medicineName\":\"ddd\",\"strength\":\"fff\",\"dosage\":\"ee\",\"treatmentDuration\":\"1 days\"},{\"medicineName\":\"fr\",\"strength\":\"ref\",\"dosage\":\"sff\",\"treatmentDuration\":\"3 days\"},{\"medicineName\":\"e\",\"strength\":\"fr\",\"dosage\":\"ee\",\"treatmentDuration\":\"2 days\"}]',NULL,NULL,NULL,NULL,NULL,'fdfdvf',NULL,NULL,'2024-05-07 16:16:28','2024-05-07 16:16:28'),(16,99,'test','[{\"medicineName\":\"ss\",\"strength\":\"sss\",\"dosage\":\"sss\",\"treatmentDuration\":\"1 days\"}]',NULL,NULL,NULL,NULL,NULL,'ww',NULL,NULL,'2024-05-07 16:21:27','2024-05-07 16:21:27'),(17,99,'test','[{\"medicineName\":\"dd\",\"strength\":\"ff\",\"dosage\":\"ww\",\"treatmentDuration\":\"1 days\"}]',NULL,NULL,NULL,NULL,NULL,'dfff',NULL,NULL,'2024-05-07 16:25:44','2024-05-07 16:25:44'),(18,99,'gayyy','[{\"medicineName\":\"test 3\",\"strength\":\"500gm\",\"dosage\":\"1-3\",\"treatmentDuration\":\"1 days\"}]',NULL,NULL,NULL,NULL,NULL,'ddddd',NULL,NULL,'2024-05-07 16:26:58','2024-05-07 16:26:58'),(19,112,'8c502b2f85a8c4503a538bd9f2add5e7','a5502f2e1dad5ec304089704b77570819ded7f73fadc4a8981412c3563cc1a8b44c283720835546b612695f26daa29d91e43ac0b47b6e2a8bac521ab3025d608dc6252abd3ec9244f85edbd547ab2ba63a22c3ce2a3f3becd1a980e1d4b98a97',NULL,NULL,NULL,NULL,NULL,'a5502f2e1dad5ec304089704b77570819ded7f73fadc4a8981412c3563cc1a8b44c283720835546b612695f26daa29d91e43ac0b47b6e2a8bac521ab3025d608dc6252abd3ec9244f85edbd547ab2ba63a22c3ce2a3f3becd1a980e1d4b98a97',NULL,'$2a$10$Lg/8wofsR3zu/lilADF/mO/9PTqPVcoSZKndnY7g.lVaJ2GsnTCEG','2024-05-13 12:07:10','2024-05-13 12:07:10'),(20,116,'323ccc18858295597695a0c858979d71','5974d81c71d7d35b60ed4510cf7b07f2399e090da0baf95a846cd7bccd0d00e148e52432d318c80c629f118f2122da4b99dd83cdb3acd419abcf2f0df66668e9909c6412125427e78b8db720ab7006e7569965ab0f03f673b0e146944d4936cdeceb93711568f00dd079b58b4e040f64b4c7061ccac4853384419e2f21a4765ba88d3733f42ac9c617767429698913d77524345e3e201c35e09e034b94e7bc894e91756bb3e9a67dfca6fd7b04233bef',NULL,NULL,NULL,NULL,NULL,'5974d81c71d7d35b60ed4510cf7b07f2399e090da0baf95a846cd7bccd0d00e148e52432d318c80c629f118f2122da4b99dd83cdb3acd419abcf2f0df66668e9909c6412125427e78b8db720ab7006e7569965ab0f03f673b0e146944d4936cdeceb93711568f00dd079b58b4e040f64b4c7061ccac4853384419e2f21a4765ba88d3733f42ac9c617767429698913d77524345e3e201c35e09e034b94e7bc894e91756bb3e9a67dfca6fd7b04233bef',NULL,'$2a$10$Vr1TS5Dd78kR8Cz4Y3R6p.Wh5vOHV2DE.M7HcAvj1GvRHURhf1ZAG','2024-05-13 12:13:26','2024-05-13 12:13:26'),(21,116,'72fd972140baa8122632ef5755916154','fa1f7eab3aaeac450daa541dac125a4203a827792580b6fdb3aecfb5af1fa357b05c6f1effd867ac9eeed5c84f1442be650479c6ae9b4015b11b3edd087fe6679ed5b1a5d595fa57e9dec08722fb39650ae81b67a3228d049b7918f5893cb55ad902944888b8fff66fa6b548aa30e43e9aa32b258dc29439b94d0ff600264afd05b000460895b21d40b9fb1dd27d293d953c869799a1ffa64b169f32dd3e079ec3c4d5d1dbd8e3950f89edad1e9bd50f',NULL,NULL,NULL,NULL,NULL,'fa1f7eab3aaeac450daa541dac125a4203a827792580b6fdb3aecfb5af1fa357b05c6f1effd867ac9eeed5c84f1442be650479c6ae9b4015b11b3edd087fe6679ed5b1a5d595fa57e9dec08722fb39650ae81b67a3228d049b7918f5893cb55ad902944888b8fff66fa6b548aa30e43e9aa32b258dc29439b94d0ff600264afd05b000460895b21d40b9fb1dd27d293d953c869799a1ffa64b169f32dd3e079ec3c4d5d1dbd8e3950f89edad1e9bd50f',NULL,'$2a$10$kkJ.xzhyPENc5JxJRPHjF.5RLMY4xQrW6GpEjW9vLxI9n0gSZkcCG','2024-05-13 12:15:43','2024-05-13 12:15:43'),(22,116,'0e38029dcad2040c19c93bb117b89177','d5bd71324717e5270f4e99b114963e1232f5952a4ac765c78b08d4ac289e83f50b9c0cb0e022154caee48d5d5c51d525542b773e3c889755288f9cabb683a2e8c0da16ec4f6345251fcadf81c5c16187358ac4ff8a4d7161e6b0b7d557eebeba',NULL,NULL,NULL,NULL,NULL,'d5bd71324717e5270f4e99b114963e1232f5952a4ac765c78b08d4ac289e83f50b9c0cb0e022154caee48d5d5c51d525542b773e3c889755288f9cabb683a2e8c0da16ec4f6345251fcadf81c5c16187358ac4ff8a4d7161e6b0b7d557eebeba',NULL,'$2a$10$KVQ7n8avfthhGTTUUiyaKusAXkyOG9ZmSJOJ.cSItbQKFaJ6QVlYC','2024-05-13 12:37:17','2024-05-13 12:37:17'),(23,118,'2a2be98e63bba574e4f27c6707d5f63ff5aae47d5fd37a384922672bb1b6d6aad8b316e8ca0de8ee181a3717cf02ad6a859b89aa2b29209d46fb452830ec74029b124c0bc26e491059c53d3f74705732b6a355fadf4ac01fc8d5fca6d47580b7','0ebea1d11bb4597f24cff734ae06ee1145053744436b073560cd952b9376d8006e852008f07b61f803e40e78dccb2d5a29cb373fc0d854119a08e9a82f8cc8693e53b92cc95b72509a309c989235efce0d7f195de5bceea67eff3b42956f481ad320dbfc1792cfdcbb6b3e63161536c4994a5a9ec79458ceabeed86bea292df9fe34a408f6e658cc850cca831119b81b39c92c7cbb45819faeda6987e361614bfbe48c4db1b594ee2f1e3b9e919c5b85bd6e291706d0c0ad2b9a15e57360e1ee2127d77e31d3ee8172abf9e59e93d4779df80e5576caa245462ef947397ac1a479cdb177046a0e80fc1e1689513fbcb3a019138b090ed67414528b7ecf80b2b08a019a082972f1105a3cc43e48a87bdafd9b088bd07249845b0bdde69286c18f78fff0bb31f6715b9b133a15baa4605dffc7a7cb76024f904672b6e957025b87d20649b598c3dc05e269023e13ec97de',NULL,NULL,NULL,NULL,NULL,'0ebea1d11bb4597f24cff734ae06ee1145053744436b073560cd952b9376d8006e852008f07b61f803e40e78dccb2d5a29cb373fc0d854119a08e9a82f8cc8693e53b92cc95b72509a309c989235efce0d7f195de5bceea67eff3b42956f481ad320dbfc1792cfdcbb6b3e63161536c4994a5a9ec79458ceabeed86bea292df9fe34a408f6e658cc850cca831119b81b39c92c7cbb45819faeda6987e361614bfbe48c4db1b594ee2f1e3b9e919c5b85bd6e291706d0c0ad2b9a15e57360e1ee2127d77e31d3ee8172abf9e59e93d4779df80e5576caa245462ef947397ac1a479cdb177046a0e80fc1e1689513fbcb3a019138b090ed6741452',NULL,'$2a$10$Wyo/sbH5bqTYNA7s9iHvhucztBb/XCtMHIkHWfQwiiWvrCVFLHrCK','2024-05-17 16:32:39','2024-05-17 16:32:39'),(24,118,'fdf87317b5b8ecf7d99dd119183a8a16b565e95bdf1880add281d1783c15e88e4c3c6a6caacd2590a63cc22167e72ca7c2918c16c4d58bc82f384c4cbb8c5ec0a871b56db2d923f2631031289e5491128d88578c26a96703e26a6f1ecca3b9ea','54dc40d4275bfc5725cf18460737d1a3e4cefba194959f2681f23315429556c63db4abaf82351cfe1481320f001281920635d5a1ee003e5ddde5b2b4b1c9acb3f299d4f9f78bd4946f390304ba1bc37a5e22af3e57041109273467282236668f532a9aae7e4086a525d7890a1ceaae7d822a85eae51d7302e91bded93e3a144bc911e78434807a275a027df0bcc7c2b74f7508c2b2a6413e27964b76c76801a8dc63302b348a05bdf58e8b5e0766dc46962264acbc3647170188dad609da9feae1e767e8a0e8ed2382e97c30f1680933c848d4f8ff88e5a1f8aa661ece9140a40743939663a0dbb2279b34235d542c288cf6572a25525bca1c64599128b86fd760e1fed2ad92221393229b735cf31303a0d53a34c9fb98574d0e5aadcee9ff7d88f6fd7f0441ddb79a283954b6b930d61e65e4ddea766b6311a0d3e3d2bc0c18e40331cd0e6336ace2a44e77953caa96',NULL,NULL,NULL,NULL,NULL,'54dc40d4275bfc5725cf18460737d1a3e4cefba194959f2681f23315429556c63db4abaf82351cfe1481320f001281920635d5a1ee003e5ddde5b2b4b1c9acb3f299d4f9f78bd4946f390304ba1bc37a5e22af3e57041109273467282236668f532a9aae7e4086a525d7890a1ceaae7d822a85eae51d7302e91bded93e3a144bc911e78434807a275a027df0bcc7c2b74f7508c2b2a6413e27964b76c76801a8dc63302b348a05bdf58e8b5e0766dc46962264acbc3647170188dad609da9feae1e767e8a0e8ed2382e97c30f1680933c848d4f8ff88e5a1f8aa661ece9140a40743939663a0dbb2279b34235d542c288cf6572a25525bca1c64',NULL,'$2a$10$g57.1Dgrw1Vj7LLcHjTKseZCWsNboJaDAt/nsPz618mf9pyA1qVv.','2024-05-17 16:33:08','2024-05-17 16:33:08'),(25,116,'c3e330716c916dcfc82b28036b80fa96bb891ab3357dc1afbb166f2abee8e133aada672bb2273d67dc3dbf72fae8995941636f8fcbe21c7421a12e0efda53c0be3f11664461b8ab2fe359083759c09ef7ab6303abbf49da0dea84940efab6c19','efa06ae7d7ffae45f043b805d9977491dd5bffb4ba052888a4ac35ba58e8fa644538ad0863d34a4d7345414591fb233c045a9e792a4d4a91f61e8652fc4c172fa7e1fe91171bba0b3174edb593f31d39bb62a40fed12284f83e51d61cecf972e9d15ce35b96280ca23740ccb669a51e971fb1e7e1f68c13b0780f1b154ed57ddb3fb39284ae6a5b75860f156fddea73571c8d36b0a1c659fa50ea568a12ce20988db4ccad983bb0117ed46f2c320973961ef23a58c61941620d38cb195241bfdb0cd9a3818810d9439b61ce2ca593ccb025bc7c0a522ba2444e5c5e7dd14c8497765afb6bd62350e9cdf3e6799a17934c2727ce17b9e19c5ae1679e4b5a9485df7588b1a9efca78020f7cc6a1006a3ff91760acfd9f57c5ad62074689f5dd4badcf55d7641182e9d12ee1b8e0a3f69f3241cfce7f0124f50803f361e16254f9cbc595bb35d222f875e77c9d53dc2c844',NULL,NULL,NULL,NULL,NULL,'95eaa344bea295495758cad431a2a96f8c070734bf99207ae06d0382e03f5499c7d7b40358d1d24c5d24f068b1627c36d8ae04567553b49e9fe298fe9811caf91bc5b7a06aed327c69346a5046777787',NULL,'$2a$10$DGBKbQ2RleXO1M6iTEzsX./Lr/cl92sWvYA59XpJumx.C.Rg.xrvq','2024-05-22 22:55:33','2024-05-22 22:55:33'),(26,118,'47651fdfe94db87c9a690bbb44ba28c523bf029389a1568dfe58b84b4e26c225','855181a675607b90e8e01e646565d010e3cfab05b1f3b2953d418fd33320a41fd9e670998b6c9be2521f63d916c01057cdf08028578df6ea4046b600946c48077df56148acfc6db2ad20d4980c821ef7706215649aa821023fed7fc0c5a0aa2f0d4beac46594e7bf0cca04649861419a1343fbae862a2954382f891838b28cf1bd117b2b1e4b567697dbe3a2dfe318a9e819cff8e11a25b54ec047ad33b1dbf6',NULL,NULL,NULL,NULL,NULL,'6d04cf52af3d95a1f681b98f3222ba5ab055df73ccfb660b755a867655fd31c3',NULL,'$2a$10$0p3VqO0tMbBiL7WvHEEkfu9z0UfR8xLsH16lBmm/W6G6MM7F8rv4a','2024-05-22 23:02:37','2024-05-22 23:02:37'),(27,116,'85905519743632ba3beb067a7ed4b1f1f47ddc9a5e1f1fc4fffd730325a65d12','4f9a2d2e31d77a66ba1136433d24a0e2b62fde44adc2c9f355ef60de8f749cbb52fa5461350d7d84107d2bc1919cff2274d7ed93289e0c181c865d79138d9862f59ac419e2095462006cfa9d3c61af8f3bf20c764ee380b7dcb741887dd0881793f1b6c79289b6e878baa53e14c954db0fc3c8dd3324d4790662ac18f77a1441',NULL,NULL,NULL,NULL,NULL,'f4e174168766f8e9ff91e1cfba7181bff95e082c2bb4241412625fb3c9d04532',NULL,'$2a$10$kV7d0.bYkShysfr29VsFRuYSQMWZkv80hSbN1/wG613j35kUZcnI2','2024-05-22 23:08:44','2024-05-22 23:08:44'),(28,116,'11f134c28eb06ad94c19627d9154f46342dbbc87aee9627a6647cf69d2047de0','4c7304edfc568a75c2fb9503ad315cbc99fb89400a27745984c1717b233c89006a2ff15a58f83a8462d88fc01ac4254eba8ef3db0cc9e596b09473c677617452468b7157630f4c32d243f4d93f347620ea2e32010e9d6e8102a6886d42496df3091e2179ebdb0eb680def19a57a63332453b4246b0d2b056b24568f1933313bd',NULL,NULL,NULL,NULL,NULL,'acc9b62719f324963728a92fc1a888fc7a548f41c72092fd4d5083a2d6552d2f',NULL,'$2a$10$BLd3IsEBM8TIcnVMtmXdeuJsDMuX7RY81QCNEFbtk/EwnIE2DsQoS','2024-05-22 23:09:38','2024-05-22 23:09:38'),(29,116,'1b9d97956bb0192655d156a082fa39c0d430dc46d85cd4b8dfc84e2a4101c1b9','a9d1ad249eb743746d50b841c7966a00d16020512c66a50ed83cce197c377a60d4f1b8aedb0d63b370bd21ae1efa01870bd91aa944097744041b0655b600bbec2edfa3a4e9b75d9297b5841db049755cf5ec9e9cf485c649393eb28faaf3cca5602ab577cc3dbb1c39bfc81db9b3c6a577d8f1b2988000eacabe510df91aee16',NULL,NULL,NULL,NULL,NULL,'b43524889ab2c43c513e5091fa0e7387d7f5a7d48d17ef6ec35a2c883f9523cf',NULL,'$2a$10$XaxZPx06DmjFMaeYVzTQmOkZLyytxBFUln2BvJLYxIsyqbb7AAu2O','2024-05-22 23:11:00','2024-05-22 23:11:00'),(30,112,'172dd99c38c464a903e80eca32fbeec8','6a64e3df9f00a8475c85f043831a23a01542258b1ebb27f4761603908ada23861e82f42d6819ada4b6eecf16f38ed13b210da3a13b7bf164114dcf47cea34b4839bacc2aacac453698514403eec4d6e9c4a16f7d964e1415e91e317cc74e0a517d0ff98d545d33ef227be8836acf33eb9e514cbb75ddb22a24079da869d5eba09d391f43c520ae9bfeef2d47caaebeba0d5b9641f9d6ee8851589770aee74b01abedcf4c4e393035157a3af0676ddd11',NULL,NULL,NULL,NULL,NULL,'19700317b991fa312f91daeeea9ff39f',NULL,'$2a$10$piL5x2BjdwhUuvP2LNw3/uLNfe6u.2pNFq6lOdNRka8c79een9wPG','2024-05-29 08:03:42','2024-05-29 08:03:42'),(31,128,'395c6ea329cda70f356c491dd51c9c42','a6229ac98ff5867a1d48f503c4ed325a5575f6698474af507a7ac06e9c28d5997dffaa512d8d2d55d059c8b911bfff9237fe8026f9024349e7382b5231d6c23eab7a40a4919c540c520cdbb99d18635247438b9f88cfe44d817e32598c8d8dd641578fa55af0c9955d57574af0380670e218b564c0d6cb4fbbbcbe6f0968f5fe7fa200ee7a34ca0401c788010666e3c67452b7610b298a95e05aabf48df4c79b197a724422da098224e2b3527c5b2c80740b162e9bf2e0ba5d2b2e45ea457a1ca3f3728965268a91aa860eab40ac1b3b',NULL,NULL,NULL,NULL,NULL,'1f0b006bae0837af6960d7576be6d355',NULL,'$2a$10$5ZqOTTzwv7jVggpcDEz7TuF9IgGV/9.uvT/13dUfyQq/sg74kd6w6','2024-07-02 13:04:25','2024-07-02 13:04:25'),(32,128,'acbccec86bb54dddd2348b43416cf014','f5f17adaeef730208beb8b0dd025332f478dd5d8e9f44be91c77665073b6328cd3fc4fcc695057253d86b7ada65edaf5a37fea1735d83c44097244d806057fab0b2273ddf6adcf9ed955ff52af8ef798fabc1d23c8c94909b043922ddb93c2f2d19d28dee9a4af59660bb12b7b62b58e',NULL,NULL,NULL,NULL,NULL,'79b943fa7b597ac6d1922276c96977ba',NULL,'$2a$10$AGlcS.NS/dmccyVB9oJop.ezzOiPbBMYJVt0jwUiiWujatVpuLGpe','2024-07-02 15:17:13','2024-07-02 15:17:13');
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
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_categories`
--

LOCK TABLES `blog_categories` WRITE;
/*!40000 ALTER TABLE `blog_categories` DISABLE KEYS */;
INSERT INTO `blog_categories` VALUES (3,'breast cancer',1,1,'2024-01-17 13:54:51','2024-01-17 13:54:51'),(4,'sexually transmitted diseases',1,1,'2024-01-17 13:55:04','2024-01-17 13:55:04'),(5,'food and nutrition',1,1,'2024-01-17 13:55:16','2024-01-17 13:55:16'),(6,'pregnancy',1,1,'2024-01-17 13:55:31','2024-01-17 13:55:31'),(7,'lung diseases',1,1,'2024-01-17 13:55:43','2024-01-17 13:55:43'),(8,'drug abuse',1,1,'2024-01-17 13:55:57','2024-04-08 12:49:28'),(23,'mental health',1,1,'2024-04-08 12:50:35','2024-04-08 12:50:35');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blogs`
--

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;
INSERT INTO `blogs` VALUES (1,23,'Nurturing Mental Health: A Journey of Self-Discovery and Healing\n','In the hustle and bustle of our daily lives, amidst the deadlines, responsibilities, and the constant buzz of notifications, it\'s easy to overlook one of the most crucial aspects of our well-being: mental health. Yet, just like physical health, mental health requires attention, care, and nurturing. In this fast-paced world, where stress and anxiety often take center stage, it\'s essential to pause, reflect, and prioritize our mental well-being.\n \n Understanding Mental Health\n \n Mental health encompasses our emotional, psychological, and social well-being. It affects how we think, feel, and act, influencing every aspect of our lives. From our relationships and work performance to our ability to cope with challenges, mental health plays a pivotal role.\n \n Contrary to common misconceptions, mental health isn\'t just about the absence of mental illness. It\'s about cultivating resilience, self-awareness, and healthy coping mechanisms to navigate life\'s ups and downs effectively.\n \n The Stigma Surrounding Mental Health\n \n Despite the growing awareness of mental health issues, stigma persists, casting a shadow of shame and silence. Many individuals hesitate to seek help due to fear of judgment or societal pressure to appear strong and self-sufficient. However, acknowledging and addressing mental health challenges is a sign of strength, not weakness.\n \n Breaking the stigma requires open conversations, empathy, and understanding. By sharing our experiences and supporting one another, we create a safe space where individuals feel empowered to seek the help they need without fear of stigma or discrimination.\n \n Practical Steps for Nurturing Mental Health\n \n Self-Care: Prioritize self-care by engaging in activities that bring joy and relaxation. Whether it\'s practicing mindfulness, spending time in nature, or pursuing hobbies, carving out moments for self-care is essential for replenishing mental and emotional reserves.\n \n Healthy Boundaries: Establishing healthy boundaries is crucial for preserving mental well-being. Learn to say no to commitments that overwhelm you and set limits on technology use to prevent burnout and maintain balance.\n \n Seek Support: Don\'t hesitate to reach out for support when needed. Whether it\'s confiding in a trusted friend, seeking guidance from a therapist, or joining a support group, connecting with others can provide validation, perspective, and comfort.\n \n Mindful Practices: Incorporate mindfulness practices into your daily routine to cultivate awareness and reduce stress. Techniques such as meditation, deep breathing exercises, and yoga can help calm the mind and promote emotional resilience.\n \n Healthy Lifestyle: prioritize physical health by adopting a balanced diet, getting regular exercise, and prioritizing sleep. Physical well-being is closely intertwined with mental health, and taking care of your body can have profound effects on your overall well-being.\n\n\n Conclusion\n \n Nurturing mental health is an ongoing journey, requiring patience, self-compassion, and dedication. By prioritizing self-care, fostering supportive relationships, and seeking help when needed, we can cultivate resilience and thrive amidst life\'s challenges.\n \n Let\'s break the silence, challenge stigma, and embrace mental health as an integral part of our well-being. Together, let\'s create a world where mental health is nurtured, celebrated, and prioritized for all. Remember, you are not alone, and there is hope and healing on this journey of self-discovery and growth.\n','a9d92d99c48bf07202c5b118c17cb29f.png','\"mental-health, awareness, kenecare, ptsd, anxiety\"',3,1,1,'2024-04-08 12:53:32','2024-04-08 12:53:32'),(2,6,'Preparing for Parenthood: A Guide to Pre-Pregnancy Health and Wellness','Bringing a new life into the world is an extraordinary journey, filled with anticipation, joy, and countless decisions. Preparing for pregnancy is an essential step in this journey, as it sets the foundation for a healthy pregnancy and the well-being of both the mother and the baby. In this blog post, we\'ll explore the importance of pre-pregnancy health, practical tips for preparing your body for pregnancy, and the significance of preconception care.\n \n Why Pre-Pregnancy Health Matters\n \n Pre-pregnancy health plays a crucial role in ensuring a smooth pregnancy, reducing the risk of complications, and promoting the optimal development of the baby. By focusing on preconception health, individuals can address any underlying medical conditions, optimize their nutritional status, and adopt healthy lifestyle habits to support fertility and reproductive health.\n \n Practical Tips for Preparing for Pregnancy\n \n Schedule a Preconception Check-Up: Before trying to conceive, schedule a preconception check-up with your healthcare provider. During this visit, your doctor can assess your overall health, review your medical history, and provide personalized recommendations based on your individual needs.\n \n Address Existing Health Conditions: If you have any chronic health conditions such as diabetes, hypertension, or thyroid disorders, work with your healthcare provider to manage these conditions effectively before pregnancy. Optimal control of pre-existing health conditions can help reduce the risk of complications during pregnancy.\n \n Focus on Nutrition: A balanced diet rich in nutrients is essential for fertility and pre-pregnancy health. Aim to consume a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats to ensure you\'re getting essential vitamins and minerals such as folic acid, iron, and calcium.\n \n Maintain a Healthy Weight: Achieving a healthy weight before pregnancy can improve fertility and reduce the risk of complications such as gestational diabetes and pre-eclampsia. Aim for a body mass index (BMI) within the healthy range and engage in regular physical activity to support overall health and well-being.\n Avoid Harmful Substances: Minimize or eliminate exposure to harmful substances such as tobacco, alcohol, and recreational drugs, as these can negatively impact fertility and increase the risk of birth defects and pregnancy complications.\n \n Manage Stress: Prioritize stress management techniques such as mindfulness, meditation, yoga, or relaxation exercises to reduce stress levels and promote emotional well-being. Chronic stress can affect fertility and reproductive health, so finding healthy ways to cope with stress is essential.\n \n Conclusion\n \n Preparing for pregnancy is an exciting and transformative journey that begins long before conception. By prioritizing pre-pregnancy health, addressing any existing health concerns, and adopting healthy lifestyle habits, individuals can optimize their chances of conception, support a healthy pregnancy, and lay the groundwork for a lifetime of wellness for both parent and child.\n \n Remember, preconception care is about empowering yourself with knowledge, making informed choices, and nurturing your body to create the best possible environment for your future family.\n','e5ec2a09d23e5bb6196f4826fecfb48b.jpg','\"prepregnancy, preconceptionhealth, fertility, pregnancyplanning , healthypregnancy , wellnessjourney , parenthoodprep , healthylifestyle, kenecare\"',3,1,1,'2024-04-08 13:01:09','2024-04-08 13:01:09'),(3,7,'Breathing Easy: Understanding Lung Diseases and How to Protect Respiratory Health','Our lungs are incredible organs, tirelessly working to supply oxygen to every cell in our body. However, lung diseases can significantly impact our ability to breathe freely and lead to serious health complications. In this blog post, we\'ll explore common lung diseases, their causes, symptoms, and preventive measures to help you breathe easy and protect your respiratory health.\n \n Understanding Lung Diseases\n \n Lung diseases encompass a wide range of conditions that affect the lungs and respiratory system. These diseases can affect anyone, regardless of age, gender, or lifestyle, and may range from mild to life-threatening. Some common lung diseases include:\n \n Chronic Obstructive Pulmonary Disease (COPD): COPD is a progressive lung disease characterized by airflow obstruction, making it difficult to breathe. It includes conditions such as emphysema and chronic bronchitis, often caused by long-term exposure to cigarette smoke, air pollution, or occupational hazards.\n \n Asthma: Asthma is a chronic inflammatory condition of the airways, resulting in recurrent episodes of wheezing, breathlessness, chest tightness, and coughing. Triggers for asthma attacks may include allergens, air pollution, exercise, or respiratory infections.\n \n Pneumonia: Pneumonia is an infection that inflames the air sacs in one or both lungs, causing symptoms such as fever, cough, shortness of breath, and chest pain. It can be caused by bacteria, viruses, or fungi and may range from mild to severe.\n \n Lung Cancer: Lung cancer occurs when abnormal cells grow uncontrollably in the lungs, often leading to the formation of tumors. Smoking is the leading cause of lung cancer, although exposure to secondhand smoke, radon, asbestos, and other carcinogens can also increase the risk.\n \n Pulmonary Fibrosis: Pulmonary fibrosis is a progressive lung disease characterized by scarring of the lung tissue, making it difficult for oxygen to pass into the bloodstream. The cause of pulmonary fibrosis may be idiopathic (unknown) or related to factors such as environmental exposures, autoimmune diseases, or genetics.\n \n Protecting Respiratory Health\n \n While some lung diseases are unavoidable, there are steps you can take to protect your respiratory health and reduce the risk of developing lung conditions:\n \n Avoid Tobacco Smoke: Quit smoking and avoid exposure to secondhand smoke, which is a significant risk factor for lung diseases such as COPD, lung cancer, and asthma.\n \n Reduce Exposure to Air Pollution: Minimize exposure to outdoor air pollution by staying indoors on high pollution days, using air purifiers, and avoiding areas with heavy traffic or industrial emissions.\n \n Practice Good Hygiene: Wash your hands frequently, especially during cold and flu season, to reduce the risk of respiratory infections such as pneumonia.\n \n Maintain a Healthy Lifestyle: Eat a balanced diet, exercise regularly, and maintain a healthy weight to support overall lung health and immunity.\n \n Protect Against Occupational Hazards: If you work in an environment with airborne pollutants or respiratory hazards, use protective equipment such as masks or respirators to reduce exposure.\n\nConclusion\n \n Our lungs are invaluable organs that deserve our care and attention. By understanding common lung diseases, recognizing their symptoms, and taking proactive steps to protect respiratory health, we can breathe easy and enjoy a life filled with vitality and well-being.\n \n Remember, your lungs are your lifeline—nurture them, protect them, and prioritize your respiratory health for a brighter, healthier future.','358e4386eb1e9d59a2612fdba9513aca.jpg','\"lungdiseases , kenecare, respiratoryhealth ,asthmaawareness , COPDawareness , lungcancerawareness , pulmonaryfibrosis , healthylungs ,  lunghealth , breatheeasy\"',3,1,1,'2024-04-08 13:05:36','2024-04-08 13:06:08');
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
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'freetown',7.864100,-11.197301,1,1,'2023-10-15 02:31:10','2024-07-05 15:54:20'),(3,'kenema',NULL,NULL,1,1,'2023-10-16 15:04:18','2023-10-16 15:04:18'),(15,'bonthe',7.864100,-11.197301,1,1,'2024-02-15 00:29:40','2024-03-27 11:50:57'),(17,'pujehun',0.000000,0.000000,1,1,'2024-03-13 10:43:50','2024-03-13 10:43:50');
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
INSERT INTO `common_symptoms` VALUES (1,'influenza (flu)','signs and symptoms: fever, chills, cough, sore throat, muscle aches, fatigue, headache, nasal congestion, and sometimes gastrointestinal symptoms like nausea and vomiting.\n\nadditional information: influenza is caused by the influenza virus and can spread easily from person to person, especially during flu seasons. vaccination is recommended annually to prevent infection.',1,'symptom_9b16405b0557ed073710cda2e12274ac.jpg',150,'Fever, chills, cough, sore throat, muscle aches, fatigue, headache, nasal congestion',1,3,'2024-04-16 11:51:13','2024-04-16 11:51:13'),(2,'hypertension (high blood pressure)','signs and symptoms: often asymptomatic, but symptoms can include headaches, shortness of breath, nosebleeds, and dizziness.\n\nadditional information: hypertension is a chronic condition characterized by elevated blood pressure in the arteries. it can lead to serious health complications such as heart disease, stroke, and kidney damage if left untreated.',5,'symptom_d49addf845831958fb134d95987b4dbb.png',200,'headaches, shortness of breath, nosebleeds, and dizziness',1,3,'2024-04-16 11:57:43','2024-04-16 11:57:43'),(3,'diabetes mellitus (type 2 diabetes)','signs and symptoms: increased thirst, frequent urination, fatigue, blurred vision, slow-healing wounds, and tingling or numbness in the extremities..\n\nadditional information: type 2 diabetes is a metabolic disorder characterized by high blood sugar levels due to insulin resistance or insufficient insulin production. it can be managed with lifestyle changes, medication, and insulin therapy.',8,'symptom_27055bed8f823b804ccb559a1cbd2e14.jpg',250,'Increased thirst, frequent urination, fatigue, blurred vision, slow-healing wounds',1,3,'2024-04-16 12:00:57','2024-04-16 12:00:57');
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
  `is_available` tinyint DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`day_slot_id`),
  UNIQUE KEY `uqc_doctor_day` (`doctor_id`,`day_of_week`),
  CONSTRAINT `fk_day_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  CONSTRAINT `fk_faq_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
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
  CONSTRAINT `fk_feedback_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
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
  CONSTRAINT `fk_slot_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_time_slot_day_id` FOREIGN KEY (`day_slot_id`) REFERENCES `doctor_available_days` (`day_slot_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_is_slot_available` CHECK ((`is_slot_available` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  CONSTRAINT `fk_doctor_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (2,11,'Dr.','Nyalema','Victoria','Moiwa','female','With over a decade of dedicated service in the medical field, Nyalema is a seasoned heart surgeon renowned for her expertise and compassionate patient care. Having traversed both governmental and non-governmental spheres, she brings a wealth of experience and a diverse perspective to her practice.\n\nNyalema\'s journey in healthcare has been marked by over 50 successful heart surgeries, each a testament to her precision, skill, and unwavering commitment to excellence. Her journey has evolved to include the establishment of her own private medical center, where she continues to provide cutting-edge treatments and personalized care to her patients.\n\nBeyond her clinical practice, Nyalema is a passionate advocate for child health, recognizing the importance of early intervention and preventive measures in shaping healthier futures. Her collaboration with esteemed organizations such as the World Health Organization (WHO) reflects her dedication to advancing global health initiatives and addres','1fec5e146395499c9dfba21cb60a3f37.png',1,'Heart Surgeon | Healthcare Advocate',1.00,NULL,1,12,1,3,'2024-03-01 11:36:30','2024-05-13 11:09:57'),(11,56,'Dr.','Nathaniel','Ainajoko','Williams','male','A medical officer with years of experience in both clinical and administrative fields','b9efd764e570bcfac1c0f9c9deba2cdb.jpeg',2,'MBChB',250.00,NULL,1,9,1,3,'2024-05-08 14:44:34','2024-05-08 16:28:21'),(12,67,'Nur','Amarachi','Josephine','Eke','male','My name is Chinedum Roland and I am a very professional doctor\n',NULL,1,'Mba Nursing',1.00,NULL,1,5,1,3,'2024-05-28 16:54:42','2024-06-27 16:20:10'),(13,71,'Dr.','Haja','Safiyatu','Sovula','female','To be changed ','f9da2601c15b87694f03c5ea3d17f83e.jpeg',1,'Mb.Ch.B, MPH, Pgdip.Child Health, Pgdip.Neonatology, MWACP',200.00,NULL,1,8,1,3,'2024-06-18 10:45:14','2024-06-18 15:18:37'),(14,73,'Dr.','Peter','','Mac-Jajua','male','.','bf3d21c0b45672c0c09caa71e32e1fd2.jpeg',7,'MB.ChB',400.00,NULL,1,4,1,3,'2024-06-21 12:12:27','2024-06-24 12:48:04'),(15,74,'Dr.','Amara','','Conteh','male','.','3aa0b9afa7175d860403b710e90403c5.png',1,'Registrar Grade 11',300.00,NULL,1,5,1,3,'2024-06-21 14:03:14','2024-06-24 12:39:04');
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
  CONSTRAINT `fk_councilReg_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_doctor_registration_admin_id` FOREIGN KEY (`verified_by`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_doctor_registration_council_id` FOREIGN KEY (`medical_council_id`) REFERENCES `medical_councils` (`council_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors_council_registration`
--

LOCK TABLES `doctors_council_registration` WRITE;
/*!40000 ALTER TABLE `doctors_council_registration` DISABLE KEYS */;
INSERT INTO `doctors_council_registration` VALUES (1,2,1,'ASFGGH','2018','5a9aa1ec52d2934bd0c48cb0f7916cda.pdf','2018-03-12','2028-03-12','approved',NULL,3,'2024-03-01 11:52:45','2024-03-12 15:28:09'),(8,11,1,'672','2016','council_cert_f388bc248ee5e1cf34cfb4f49cd77da4.jpeg','2024-04-16','2024-12-31','approved',NULL,3,'2024-05-08 14:46:09','2024-05-08 16:29:06'),(9,12,1,'234','2024','council_cert_2eeff9fe209eef23bf3d6e11496478ef.pdf','2024-05-23','2024-05-31','pending',NULL,NULL,'2024-05-28 16:55:51','2024-05-28 16:55:51'),(10,13,1,'PM 755','2016','council_cert_67316992370a979fd271ea01620a197f.jpeg','2019-12-19','2025-12-19','approved',NULL,3,'2024-06-18 13:00:15','2024-06-24 12:51:47'),(11,14,1,'ER2343','2018','council_cert_eefd1da51de87bdee6bbd7641ca31a70.jpg','2024-06-13','2024-07-06','pending',NULL,NULL,'2024-06-21 12:21:43','2024-06-21 12:21:43'),(12,15,1,'23234','2018','council_cert_d86f6d40368ebcc60cd9f9dbe7850a8a.jpg','2024-06-05','2024-06-22','pending',NULL,NULL,'2024-06-22 00:17:04','2024-06-22 00:17:04');
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
  CONSTRAINT `fk_education_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors_wallet`
--

LOCK TABLES `doctors_wallet` WRITE;
/*!40000 ALTER TABLE `doctors_wallet` DISABLE KEYS */;
INSERT INTO `doctors_wallet` VALUES (1,2,1702.55,'$2a$10$jfEUyjhfz4hS2L1KMwwoze/iv.5Is7RKaBw1KcImGivgLutt7xRDa','2024-03-25 14:42:29','2024-05-14 15:33:15'),(6,11,0.00,'$2a$10$zVi/lralQKnaDapsshQ2PeF1jFk8UE2QxUipXp60Xo08KRRTlNEvi','2024-05-08 14:44:35','2024-05-08 14:44:35'),(7,12,1.70,'$2a$10$63TQa7I3ZAo21BBPiGCyh.9HsXgzxPxsxN4pCIkpd2OwHA/Cts.fC','2024-05-28 16:54:42','2024-07-03 15:13:48'),(8,13,0.00,'$2a$10$yPIJlo1FIfVR/9zDeGC8IuRiqgYq74qmERAVIpTgwbPHmif4hAjLO','2024-06-18 10:45:14','2024-06-18 10:45:14'),(9,14,0.00,'$2a$10$BMFPekZiyH3XSRhuc9Z6auOkgeypWJRWEH/OGPuN3weW82uvbro2e','2024-06-21 12:12:27','2024-06-21 12:12:27'),(10,15,0.00,'$2a$10$wAt.ON0vR5yscBZHCmW9nOTbbZjhVn51X9ZP9xM7jtDEG85Od2N2m','2024-06-21 14:03:14','2024-06-21 14:03:14');
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
  CONSTRAINT `fk_appointment_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_appointment_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fK_appointment_speciality_id` FOREIGN KEY (`speciality_id`) REFERENCES `medical_specialities` (`speciality_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_appointment_time_slot_id` FOREIGN KEY (`time_slot_id`) REFERENCES `doctor_time_slots` (`time_slot_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_appointments`
--

LOCK TABLES `medical_appointments` WRITE;
/*!40000 ALTER TABLE `medical_appointments` DISABLE KEYS */;
INSERT INTO `medical_appointments` VALUES (1,'98c9c151-901b-49cb-b024-4847687c2c5c',5,2,'online_consultation','manso sesay','34444',1,'headache',500.000000,'2024-03-08','18:42:00',NULL,22,NULL,NULL,'approved',NULL,NULL,NULL,NULL,NULL,NULL,'2024-03-01 15:37:14','2024-04-01 14:27:59'),(3,'9e852785-dc26-41aa-97e4-51268a6bf001',10,2,'online_consultation','fatmata','+23279149126',1,'head ache',500.000000,'2024-03-03','17:19:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-03-01 17:20:11','2024-03-01 17:20:11'),(4,'c4c48479-9ccd-4178-be74-59395bad49f4',10,2,'online_consultation','fatmata','+23279149126',1,'head ache',500.000000,'2024-03-01','17:26:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-03-01 17:27:21','2024-03-01 17:27:21'),(5,'3c48f00c-d31c-498e-ab7f-6d7641453487',10,2,'online_consultation','fatmata','+23279149126',1,'head ache',500.000000,'2024-03-01','17:26:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-03-01 17:27:22','2024-03-01 17:27:22'),(6,'b22f7e9d-3fd4-4088-affd-95b2cfcf61e5',5,2,'online_consultation','manso sesay','34444',1,'test 1',500.000000,'2024-03-02','16:16:00',NULL,18,NULL,NULL,'approved',NULL,NULL,NULL,NULL,NULL,NULL,'2024-03-02 12:12:41','2024-04-01 14:27:33'),(7,'0e666979-6cf9-41e9-84e7-59c07c915656',5,2,'online_consultation','manso sesay','34444',1,'headache, cold',500.000000,'2024-03-03','12:23:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-03-02 12:21:27','2024-03-02 12:21:27'),(8,'a81a41f7-ef16-4ad2-aed3-751561b8305f',5,2,'online_consultation','samuel sesay','34444',1,'headache, cold',500.000000,'2024-03-05','10:39:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-03-03 10:35:43','2024-03-03 10:35:43'),(93,'3b98239b-8336-49eb-bd29-4764b93852aa',20,2,'online_consultation','mustapha fofanah','+23276614608',1,'fever',500.000000,'2024-03-20','04:38:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-03-20 08:41:04','2024-03-20 08:41:04'),(97,'da890e78-f22b-43c1-9f38-6dc4df256ba1',5,2,'online_consultation','manso moiwa','34444',1,'test 1',500.000000,'2024-04-10','18:59:00',NULL,23,NULL,NULL,'approved',NULL,NULL,NULL,NULL,NULL,NULL,'2024-04-01 14:56:59','2024-04-01 15:02:29'),(98,'46ba2354-7116-4eb7-8372-2d348815dafa',5,2,'online_consultation','samuel sesay','34444',1,'test 1',500.000000,'2024-04-01','18:03:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-04-01 14:59:12','2024-04-01 14:59:12'),(99,'7905d167-916c-4857-b688-39820ee7f238',5,2,'online_consultation','hassan moiwa','34444',1,'test 1',500.000000,'2024-04-01','18:05:00',NULL,24,NULL,NULL,'approved',NULL,NULL,NULL,NULL,NULL,NULL,'2024-04-01 15:00:53','2024-04-03 13:42:22'),(102,'8ef64274-8632-428c-8a2b-70c93d9765f1',5,2,'online_consultation','manso sesay','34444',1,'hdhgdgd',500.000000,'2024-04-17','20:50:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-04-15 16:50:31','2024-04-15 16:50:31'),(103,'422e03c8-7b63-4305-92bd-b62f9497b5b9',5,2,'online_consultation','manso sesay','34444',1,'hkcgjfuuyi',500.000000,'2024-04-17','07:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-04-16 17:04:55','2024-04-16 17:04:55'),(104,'04ebb5d1-3450-4ee9-8e4a-b927986e6d97',5,2,'online_consultation','manso sesay','34444',1,'hkcgjfuuyi',500.000000,'2024-04-17','08:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-04-16 17:05:59','2024-04-16 17:05:59'),(105,'3b298bcb-7bb0-4b3e-a231-7d059adfddcf',5,2,'online_consultation','manso sesay','34444',1,'odhgcigdii',500.000000,'2024-04-17','07:30:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-04-16 17:08:02','2024-04-16 17:08:02'),(107,'a5c0e736-51aa-4104-9046-f90da3bbe815',5,11,'online_consultation','manso sesay','+23279356563',2,'headache, cold',250.000000,'2024-05-13','15:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-13 10:53:55','2024-05-13 10:53:55'),(108,'b9ef7969-a863-4110-a1e0-38ed1a0b5707',5,11,'online_consultation','hassan moiwa','+23279356563',2,'headache, cold',250.000000,'2024-05-14','15:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-13 10:55:30','2024-05-13 10:55:30'),(109,'6f8c57bc-db0f-458e-b5a4-f6cd96052a78',36,2,'online_consultation','chinedum','+23278822683',1,'headache',500.000000,'2024-05-22','12:30:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-13 11:06:42','2024-05-13 11:06:42'),(110,'4f1877e5-7446-4aba-8a3f-97d22952a415',36,2,'online_consultation','chinedum roland eke','+23278822683',1,'nausea',500.000000,'2024-05-23','14:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-13 11:07:53','2024-05-13 11:07:53'),(111,'67e4d006-7094-44f4-a0d8-c6ef0dcdf0be',5,11,'online_consultation','gfgh','0987654',2,'dfgh',250.000000,'2024-05-13','13:30:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-13 11:09:24','2024-05-13 11:09:24'),(112,'051fc908-1ea7-4395-95cf-3e2b1eb618da',36,2,'online_consultation','chinedum roland eke','+23278822683',1,'fever, runny nose',1.000000,'2024-05-15','13:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-13 11:11:29','2024-05-13 11:11:29'),(113,'80ef549d-b40e-48bb-b2ee-cf375c83b9fb',5,2,'online_consultation','gfgh','0987654',1,'dfgh',1.000000,'2024-05-14','11:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-13 11:12:28','2024-05-13 11:12:28'),(114,'dd9751a8-05dc-448c-b140-5d0d7ea3d203',5,2,'online_consultation','gfgh','0987654',1,'dfgh',1.000000,'2024-05-13','17:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-13 11:16:14','2024-05-13 11:16:14'),(115,'a6e49eb0-f4c9-4486-976f-181b8b7c909c',5,2,'online_consultation','gfgh','0987654',1,'dfgh',1.000000,'2024-05-31','08:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-13 11:18:22','2024-05-13 11:18:22'),(116,'25355afc-03a5-472b-8fa8-5e61c7c39d83',5,2,'online_consultation','gf','0987654',1,'dfgh',1.000000,'2024-05-23','08:00:00',NULL,26,NULL,NULL,'approved',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-13 11:21:05','2024-05-13 11:25:08'),(117,'6f3021c6-a932-41d5-b40c-8b2fa226950a',5,2,'online_consultation','peter','075668909',1,'malaria',1.000000,'2024-05-13','12:30:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-13 12:11:33','2024-05-13 12:11:33'),(118,'e09e6999-59e2-4588-80ae-098c8e4a4002',5,2,'online_consultation','manso sesay','+23279356563',1,'headache, cold',1.000000,'2024-05-15','16:00:00',NULL,27,NULL,NULL,'approved',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-14 15:29:17','2024-05-14 15:34:04'),(119,'c220abb8-21d2-429a-ab2d-333866666624',5,2,'online_consultation','peter','075668061',1,'malaria',1.000000,'2024-05-15','17:30:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-14 15:32:56','2024-05-14 15:32:56'),(120,'336bbbb7-5176-4071-8d20-6c25422f19cf',36,11,'online_consultation','lebbie','+23278822683',2,'hello',250.000000,'2024-05-29','12:23:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-28 12:24:27','2024-05-28 12:24:27'),(121,'55295c08-9faf-4a63-a957-5f020efb583e',39,11,'online_consultation','alberta','076946894',2,'cold',250.000000,'2024-05-31','15:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-28 12:43:38','2024-05-28 12:43:38'),(122,'7bb67143-27d2-4399-bb48-fe99ea2dffa0',36,2,'online_consultation','jhfkghdkfsgsd','+23278888888',1,'skngksbgn,sfbgn,fsdgsdfg',1.000000,'2024-06-06','12:35:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-31 12:45:39','2024-05-31 12:45:39'),(123,'c485cd65-673e-415c-bf04-169d2a3c471d',36,2,'online_consultation','jbdsfbjhsd','+23278888888',1,'mbanmcbaxmncbxmc',1.000000,'2024-06-13','01:02:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-31 13:03:00','2024-05-31 13:03:00'),(124,'243ed034-f1a7-4c42-8f7d-51bac97c8960',36,2,'online_consultation','zcxvzxvxcv','23456789',1,'have jzcxb vjhcxvjhxc vj',1.000000,'2024-06-20','12:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-06-10 12:07:46','2024-06-10 12:07:46'),(125,'5e56b696-5562-4348-bac5-ce16d633d990',36,2,'online_consultation','zcxvzxvxcv','23456789',1,'have jzcxb vjhcxvjhxc vj',1.000000,'2024-06-20','12:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-06-10 12:08:06','2024-06-10 12:08:06'),(126,'c99ec7ca-dc2c-4b33-812b-e73b640ba503',5,2,'online_consultation','manso sesay','+23279356563',1,'headache, cold',1.000000,'2024-06-28','10:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-06-26 14:44:36','2024-06-26 14:44:36'),(127,'c0835c62-a5f0-4644-ba67-766c5121e6bd',36,12,'online_consultation','alex','+23278822683',1,'cold, headache',10.000000,'2024-06-28','08:30:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-06-27 08:25:49','2024-06-27 08:25:49'),(128,'1441b458-a9c8-4d56-94aa-e5fce0548023',36,12,'online_consultation','alex kamara','+23278822683',1,'hello',1.000000,'2024-06-28','07:00:00',NULL,28,NULL,NULL,'approved',NULL,NULL,NULL,NULL,NULL,NULL,'2024-06-27 16:21:21','2024-06-27 16:34:47'),(129,'f72ea468-b081-4724-aaa6-daed413b9bca',36,12,'online_consultation','judah','+@32377600218',1,'judah alvin dore',1.000000,'2024-06-30','12:00:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-06-29 21:58:07','2024-06-29 21:58:07'),(130,'69c8308b-9392-441b-9fb0-4a69fba839fd',36,2,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',1.000000,'2024-07-29','16:50:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-07-03 15:10:47','2024-07-03 15:10:47'),(131,'bb6922d1-124d-48bb-9f65-18d69c0ab2ff',36,12,'online_consultation','chinedum roland eke','+23278822683',1,'running stomache, cough, headache, loss of appetite again and again',1.000000,'2024-07-29','16:50:00',NULL,NULL,NULL,NULL,'pending',NULL,NULL,NULL,NULL,NULL,NULL,'2024-07-03 15:12:36','2024-07-03 15:12:36');
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_councils`
--

LOCK TABLES `medical_councils` WRITE;
/*!40000 ALTER TABLE `medical_councils` DISABLE KEYS */;
INSERT INTO `medical_councils` VALUES (1,'Sierra Leone Medical and Dental Council','info@slmdc.org','+23278500300','new england ville, freetown',1,1,'2024-01-23 18:53:33','2024-01-23 18:53:33');
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
  KEY `fk_sharing_doctor` (`doctor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_document_sharing`
--

LOCK TABLES `medical_document_sharing` WRITE;
/*!40000 ALTER TABLE `medical_document_sharing` DISABLE KEYS */;
INSERT INTO `medical_document_sharing` VALUES (1,8,7,2,'this is the documetn for jeneba lab test','123455','2024-03-05 17:25:05'),(2,10,18,2,'This is my document','123455','2024-03-05 18:05:18'),(3,10,18,3,'This is my note','123455','2024-03-05 18:10:34'),(4,7,7,2,'Hello','123455','2024-03-11 01:18:34'),(5,7,7,3,'Hello','123455','2024-03-11 01:23:19'),(6,2,7,2,'Hello','123455','2024-03-13 18:34:59'),(7,13,1,3,'Hi doc','123455','2024-03-13 18:43:04'),(8,12,1,4,'Chbjh','123455','2024-03-14 12:18:29'),(9,12,1,3,'Testing share functionality','123455','2024-03-16 06:53:13'),(10,15,1,4,'Sharing again and again for my doctor to see','123455','2024-03-16 06:53:48'),(11,17,1,2,'Hello doctor na u gh','123455','2024-03-16 17:24:08'),(12,17,1,3,'Eh yoh doctor na u gh','123455','2024-03-16 17:24:59'),(13,18,1,2,'Noteeee','123455','2024-03-18 14:04:41'),(14,14,7,2,'this is the documetn for jeneba lab test','123455','2024-03-20 13:40:06'),(15,4,5,2,'test','123455','2024-03-20 14:20:28'),(16,5,5,2,'test','123455','2024-03-20 14:43:49'),(17,18,1,3,'tHIS IS TA RAFAS','123455','2024-03-25 08:27:36'),(18,11,1,2,'sdasdas','123455','2024-03-25 11:49:33'),(19,18,1,7,'Fhchvbc','123455','2024-03-27 17:13:10'),(20,25,36,2,'This is my xray','123455','2024-06-26 17:08:40'),(21,26,36,2,'This is my lungs','123455','2024-06-26 17:14:39'),(23,27,36,12,'Test note','123455','2024-07-01 16:53:29');
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_specialities`
--

LOCK TABLES `medical_specialities` WRITE;
/*!40000 ALTER TABLE `medical_specialities` DISABLE KEYS */;
INSERT INTO `medical_specialities` VALUES (1,'pediatricians','they care for children from birth to young adulthood. some pediatricians specialize in pre-teens and teens, child abuse, or children&#x27;s developmental issues.','aeec0b5c63696a74c72ae3daa68f391a.png',NULL,1,1,'2023-12-19 18:21:53','2024-02-15 11:44:48'),(2,'family physician','they care for the whole family, including children, adults, and the elderly. they do routine checkups and screening tests, give you flu and immunization shots, and manage diabetes and other ongoing medical conditions.','549750abedee23c34f6f260843dd6154.jpg',NULL,1,1,'2023-12-19 18:23:00','2024-02-15 11:45:50'),(3,'anesthesiologists','these doctors give you drugs to numb your pain or to put you under during surgery, childbirth, or other procedures. they monitor your vital signs while you’re under anesthesia.','74bb95e07cd473e3dee44e198837022d.png',NULL,1,3,'2024-02-15 11:46:12','2024-02-15 11:46:12'),(4,'allergists&#x2F;immunologist','they treat immune system disorders such as asthma, eczema, food allergies, insect sting allergies, and some autoimmune diseases.','c10c6ef6fe29dcf7b9f54ee034049f80.jpg',NULL,1,3,'2024-02-15 11:46:57','2024-02-15 11:46:57'),(5,'cardiologist','they’re experts on the heart and blood vessels. you might see them for heart failure, a heart attack, high blood pressure, or an irregular heartbeat.','583c7966903a348ea61ae12a7e134bad.png',NULL,1,3,'2024-02-15 11:48:20','2024-02-15 11:48:20'),(6,'dermatologists','have problems with your skin, hair, nails? do you have moles, scars, acne, or skin allergies? dermatologists can help.','f7f6b34914ed8c4451f9c561188ef15b.png',NULL,1,3,'2024-02-15 11:50:07','2024-02-15 11:50:07'),(7,'critical care medicine specialists','they care for people who are critically ill or injured, often heading intensive care units in hospitals. you might see them if your heart or other organs are failing or if you’ve been in an accident.','acf64cd5c1ac222ce81968d946c3f7cd.png',NULL,1,3,'2024-02-15 11:52:18','2024-02-15 11:52:18'),(8,'endocrinologists','these are experts on hormones and metabolism. they can treat conditions like diabetes, thyroid problems, infertility, and calcium and bone disorders.','9bc73e1d5591d2a99aed6a33f6c8e08c.png',NULL,1,3,'2024-02-15 11:53:30','2024-02-15 11:53:30'),(9,'internal medcine','Internists often work as primary care physicians, providing comprehensive care and coordinating with specialists when necessary to ensure patients receive appropriate treatment for their specific conditions.','9f583ced4d2551627a7a1cc125c0cd81.jpg',NULL,1,3,'2024-07-01 13:21:19','2024-07-05 15:31:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_medical_documents`
--

LOCK TABLES `patient_medical_documents` WRITE;
/*!40000 ALTER TABLE `patient_medical_documents` DISABLE KEYS */;
INSERT INTO `patient_medical_documents` VALUES (1,'b4c1be0b-ff55-427c-a443-2390d3aa45a9',6,'profit.png',NULL,'2024-03-01 17:34:18','2024-03-01 17:34:18'),(4,'06c6f6b3-deff-4a09-9afb-67f738d0d782',5,'name test',NULL,'2024-03-02 08:45:35','2024-03-02 08:45:35'),(5,'d7ae5840-9f32-409e-ba9f-24965db88223',5,'Diagnostics Lab Document 3',NULL,'2024-03-05 01:09:53','2024-03-05 01:09:53'),(9,'d3a71da8-59c0-4283-964f-2b00c0566354',17,'Lab test March',NULL,'2024-03-05 15:00:55','2024-03-05 15:00:55'),(19,'10a6f45f-f530-49bd-88e4-34bcc507788c',35,'Choitram XRay Hip result',NULL,'2024-05-13 10:20:02','2024-05-13 10:20:02'),(27,'e7f5e14a-ecde-4653-b43e-8c52e928827c',36,'X-ray',NULL,'2024-07-01 13:44:55','2024-07-01 13:44:55');
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_medical_history`
--

LOCK TABLES `patient_medical_history` WRITE;
/*!40000 ALTER TABLE `patient_medical_history` DISABLE KEYS */;
INSERT INTO `patient_medical_history` VALUES (1,4,'12cm','12kg','Cold',0,'',NULL,'',0,NULL,0,'','2024-03-01 10:59:02','2024-03-01 10:59:02'),(2,5,'12 cm','40kg','girls, ladies, women',0,'no',NULL,'no',0,'weekends',0,'almost everyday','2024-03-01 13:23:18','2024-03-01 13:23:18'),(3,6,'4.6','50','None',0,'None',NULL,'None',0,'None',0,'None','2024-03-01 17:03:20','2024-03-01 17:03:20'),(5,12,'Nil','Nil','None ',0,'',NULL,'',0,'',0,'','2024-03-01 17:14:45','2024-03-01 17:14:45'),(6,19,'12cm','12kg','Cold',0,'',NULL,'',0,NULL,0,'','2024-03-12 01:33:52','2024-03-12 01:33:52'),(8,20,'67cm','180kg','',0,'',NULL,'',0,NULL,0,'','2024-03-20 08:35:48','2024-03-20 08:35:48'),(10,24,'1.2','50','',0,'',NULL,'',0,'',0,'','2024-04-25 10:28:28','2024-04-25 10:28:28'),(12,27,'1.59','50','',0,'',NULL,'',0,'',0,'','2024-05-06 14:08:28','2024-05-06 14:08:28'),(13,29,'','','',0,'',NULL,'',0,'',0,'','2024-05-06 14:43:57','2024-05-06 14:43:57'),(14,30,'5.5cm','78kg','',0,'',NULL,'',0,'',0,'','2024-05-06 16:28:10','2024-05-06 16:28:10'),(15,31,'','','',0,'',NULL,'',0,'',0,'','2024-05-08 08:00:17','2024-05-08 08:00:17'),(16,32,'1.5','50kg','No',0,'',NULL,'No',0,'No',0,'No','2024-05-10 11:00:12','2024-05-10 11:00:12'),(17,33,'5.4cm','40kg','Chloramphenicol Ceftazidime',0,'',NULL,'',0,'',0,'','2024-05-10 11:48:53','2024-05-10 11:48:53'),(18,35,'185','95','Ceptrine',0,'',NULL,'',0,'',0,'2 cups a day ','2024-05-13 08:45:39','2024-05-13 08:45:39'),(19,37,'1.5','65','',0,'',NULL,'',0,'Daily ',0,'Seldomly ','2024-05-17 10:30:13','2024-05-17 10:30:13'),(20,41,'140cm','55kg','Pawpaw',0,'',NULL,'',0,'',0,'Once in a while ','2024-05-29 10:16:25','2024-05-29 10:16:25'),(21,36,'1.2cm','40kg','Cauliflower, paracetamol, and green beans',0,'',NULL,'5 per week',1,NULL,1,'3 per day','2024-07-01 14:14:55','2024-07-01 15:53:21');
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
  CONSTRAINT `fk_patient_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (4,10,NULL,'Alvin','Yabom','Conteh','male',NULL,'1998-03-01',0,'2024-03-01 10:58:15','2024-03-01 10:58:15'),(5,12,NULL,'Abdulai','Samuel','Moiwa','male','2e999cc923e2430c74fc96be7d9d6161.jpg','1996-01-01',1,'2024-03-01 13:22:19','2024-06-19 13:56:47'),(6,14,NULL,'Bailor','','Bah','male','d483febc5d7b32bd69794f23a57e9b23.jpg','2004-09-17',0,'2024-03-01 17:01:44','2024-03-01 17:04:07'),(8,17,NULL,'ALUSINE','','KALOKOH','male',NULL,'1998-10-20',0,'2024-03-01 17:04:10','2024-03-01 17:04:10'),(9,18,NULL,'SANNOH','KELFALA','SHEKU','male',NULL,'1997-05-22',0,'2024-03-01 17:07:36','2024-03-01 17:07:36'),(10,20,NULL,'Fatmata','','Sesay','female',NULL,'2001-08-06',0,'2024-03-01 17:12:10','2024-03-01 17:12:10'),(11,20,NULL,'Fatmata','','Sesay','female',NULL,'2001-08-06',0,'2024-03-01 17:12:10','2024-03-01 17:12:10'),(12,21,NULL,'Dauda','Charles','Conteh','male','b69eaba0e59b9f0f4b498af0748d97ce.jpeg','1998-01-01',0,'2024-03-01 17:13:48','2024-03-01 17:20:57'),(13,23,NULL,'Santigie','Ahmed','Conteh','male',NULL,'1999-05-26',0,'2024-03-01 17:57:33','2024-03-01 17:57:33'),(14,24,NULL,'solomon','','kanu','male',NULL,'1998-12-10',0,'2024-03-04 16:07:13','2024-03-04 16:07:13'),(15,26,NULL,'Theresa','Terrain','Kamara','female','f9344d537b44a0afec77194e420ded35.jpg','1993-04-05',0,'2024-03-05 14:16:40','2024-03-05 15:06:41'),(16,27,NULL,'Isha','Tia','Fofanah','female',NULL,'1995-02-14',0,'2024-03-05 14:20:23','2024-03-05 14:20:23'),(17,28,NULL,'Sia','Agnes','Chakanda','female',NULL,'1995-04-06',0,'2024-03-05 14:49:25','2024-03-05 14:49:25'),(19,30,NULL,'Judah','Alvin','Dore','male',NULL,'1998-06-24',0,'2024-03-11 14:46:03','2024-03-11 14:46:03'),(20,34,NULL,'Mustapha','R','Fofanah','male','cde59571f9ef045624eb6dc1ec6fa4ee.jpg','1980-07-02',0,'2024-03-20 08:34:54','2024-03-20 08:44:07'),(23,43,NULL,'Foday','','Mansaray','male',NULL,'1996-10-12',0,'2024-04-16 00:40:40','2024-04-16 00:40:40'),(24,45,NULL,'Emmanuel','','Saati','male',NULL,'2001-02-05',0,'2024-04-25 10:27:37','2024-04-25 10:27:37'),(27,50,NULL,'Yusifu','Gibrilla','Koroma','male','0af1fd11d01b32e586a2df4090a1c6e5.jpg','1994-04-01',0,'2024-05-06 14:07:03','2024-05-06 14:09:02'),(28,51,NULL,'ALUSINE','','KALOKOH','male','fafdde01e0c30962e20e93a4928f5717.jpg','1999-10-20',0,'2024-05-06 14:27:13','2024-05-06 14:34:55'),(29,52,NULL,'Samuel','Manor','Kargbo','male','afa5c88cd2141275d924e55b5425de71.jpg','1998-10-10',0,'2024-05-06 14:43:18','2024-05-06 14:48:50'),(30,54,NULL,'MARIAMA','','KALLAY','female',NULL,'1994-11-30',0,'2024-05-06 16:26:43','2024-05-06 16:26:43'),(31,55,NULL,'Chinedum','Roland','Eke','male',NULL,'1984-05-08',1,'2024-05-08 07:59:47','2024-05-08 08:02:37'),(32,57,NULL,'Ruth','Salma','Kargbo','female','a0d27d985058869c9c7d4b8f747a50bf.jpeg','1999-05-18',0,'2024-05-10 10:55:56','2024-05-10 11:02:11'),(33,58,NULL,'Theresa','','Williams','female','1fed8c84c4636c35cbb50ffb5afff4e1.jpg','1994-04-01',0,'2024-05-10 11:44:43','2024-05-10 11:52:46'),(34,59,NULL,'Isha','Sia','Yongai','female',NULL,'2001-03-15',0,'2024-05-11 20:33:03','2024-05-11 20:33:03'),(35,60,NULL,'Robert','Tamba','Chakanda','male',NULL,'1964-07-25',0,'2024-05-13 08:44:14','2024-05-13 08:44:14'),(36,61,NULL,'CHINEDUM','ROLAND','EKE','male','977b7565becbad7c1d3a138f288a896d.jpg','1998-06-01',1,'2024-05-13 11:05:52','2024-06-27 16:33:43'),(37,62,NULL,'Robert','Anthony Ponga Hindowa','Magbity','male',NULL,'1992-06-13',0,'2024-05-17 10:29:07','2024-05-17 10:29:07'),(38,64,NULL,'Dugba','','Kenneh','male',NULL,'1993-05-07',0,'2024-05-28 12:39:44','2024-05-28 12:39:44'),(39,65,NULL,'Alberta','Mattu','Bonnie','female',NULL,'1994-01-10',1,'2024-05-28 12:40:53','2024-05-28 12:43:38'),(40,68,NULL,'Hawa','','Jalloh','female',NULL,'1998-01-12',0,'2024-05-29 09:54:31','2024-05-29 09:54:31'),(41,69,NULL,'ELIZABETH','Mamie','Monson','female',NULL,'1982-11-17',0,'2024-05-29 10:14:25','2024-05-29 10:14:25');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients_testimonial`
--

LOCK TABLES `patients_testimonial` WRITE;
/*!40000 ALTER TABLE `patients_testimonial` DISABLE KEYS */;
INSERT INTO `patients_testimonial` VALUES (2,4,'I cannot express how grateful I am for Kenecare Telehealth! As a busy working mom, finding time to schedule and attend in-person medical appointments was always a challenge. With Kenecare, I can conveniently consult with healthcare professionals from the comfort of my home. Recently, I used the app to discuss pre-pregnancy health concerns, and the doctor provided valuable insights and personalized recommendations. Kenecare has truly simplified healthcare for me, and I highly recommend it to anyo',1,1,1,'2024-03-26 06:01:18','2024-03-26 06:01:18');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specializations`
--

LOCK TABLES `specializations` WRITE;
/*!40000 ALTER TABLE `specializations` DISABLE KEYS */;
INSERT INTO `specializations` VALUES (1,'cardiologist','Study of the heart and blood vessels','updated_cardiology.jpg',0,1,'2023-10-16 15:30:53','2023-10-16 15:32:08'),(2,'dermatologist','Study of the skin','dermatologist.jpg',1,1,'2023-10-16 15:30:53','2023-10-16 15:30:53'),(3,'cardiologists','deals with the heart','https://example.com/cardiology.jpg',1,1,'2024-02-16 11:38:36','2024-02-16 11:38:36');
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
  `device_notif_token` varchar(250) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_user_mobile_number` (`mobile_number`),
  UNIQUE KEY `uq_user_email` (`email`),
  KEY `fk_user_type_id` (`user_type`),
  CONSTRAINT `fk_user_type_id` FOREIGN KEY (`user_type`) REFERENCES `user_type` (`user_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_is_user_account_active` CHECK ((`is_account_active` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (8,'+23231851053',NULL,0,NULL,1,'$2a$10$NNHzhHiE5hqy4Ft/UACST.uafR7tY1T9ozya8ANzAP7odDTzuG2Dy',NULL,1,'2024-03-01 10:35:25',1,1,0,NULL,NULL,'2024-03-01 10:35:08','2024-03-01 10:35:25'),(10,'+23272340127',NULL,0,NULL,1,'$2a$10$KANf9DzesjueJoy7Jv23xO5JrLcshtjPeW11nS6rbdqJ2DeHTATB.',NULL,1,'2024-03-01 10:57:25',1,1,0,NULL,NULL,'2024-03-01 10:57:06','2024-03-01 10:57:24'),(11,'+23279356563','samuelmoiwa@gmail.com',0,NULL,2,'$2a$10$pXBcncjMCVrGtctS2CIfsepggAvriUuR5P/wV5S7oaLUEz9da7HzC','646895',1,'2024-03-01 11:28:01',1,1,0,NULL,NULL,'2024-03-01 11:27:38','2024-06-12 16:34:54'),(12,'+23279972611',NULL,0,NULL,1,'$2a$10$A77iEKuuk/0PPKG269IyS.pz7p3xLDe9u3x4DcIfk6cyf2kW1WWOi',NULL,1,'2024-03-01 13:21:41',1,1,0,NULL,NULL,'2024-03-01 13:21:13','2024-03-01 13:21:41'),(13,'+23272017272',NULL,0,NULL,1,'$2a$10$nRtTCIxxP5ogUYsSDh7Gru0hqowh.jm/YMpqdoQJ/vUDVK38zD/RC',NULL,1,'2024-03-01 16:59:22',1,1,0,NULL,NULL,'2024-03-01 16:58:20','2024-03-01 16:59:21'),(14,'+23279343497',NULL,0,NULL,1,'$2a$10$vg9jjEx8JVCsOYOUH5XSnOtwCieVdq6rpgp914u/PdlH8TqyBSj4.',NULL,1,'2024-03-01 17:01:06',1,1,0,NULL,NULL,'2024-03-01 17:00:38','2024-03-01 17:01:06'),(16,'+23275836786',NULL,0,NULL,1,'$2a$10$8SOxZpcytsWQ/5u4LOwWQ.v3FBdprMOb9W6RPUP6aoEChZ3s/38ku',NULL,1,'2024-03-01 17:02:27',1,1,0,NULL,NULL,'2024-03-01 17:01:43','2024-03-01 17:02:27'),(17,'+23279001362',NULL,0,NULL,1,'$2a$10$DF1wk09E4bxGdA4MVFaShOQWhcnQxBCfDij7MwGLjZ6QF4NxeD1EW',NULL,1,'2024-03-01 17:02:34',1,1,0,NULL,NULL,'2024-03-01 17:01:57','2024-03-01 17:02:33'),(18,'+23288000766',NULL,0,NULL,1,'$2a$10$tbEbqfQE6Iv2HV0OV8nFSeogvUqRFP3PV25SfNo8VHgFi5REcMEcG',NULL,1,'2024-03-01 17:03:16',1,1,0,NULL,NULL,'2024-03-01 17:02:50','2024-03-01 17:03:16'),(19,'+23232898985',NULL,0,NULL,1,'$2a$10$PavouBLenezfSN9riGfnE.JCzsyU5UA/V6dHTdncl7ke/iPVbvFFC',NULL,1,'2024-03-01 17:06:46',1,1,0,NULL,NULL,'2024-03-01 17:06:09','2024-03-01 17:06:45'),(20,'+23279149126',NULL,0,NULL,1,'$2a$10$npaOoteLPSbANuKcDK3D3.U6KHy1pmXUcsUHMvN3/zkniJu2F/8sC',NULL,1,'2024-03-01 17:10:12',1,1,0,NULL,NULL,'2024-03-01 17:09:14','2024-03-01 17:10:11'),(21,'+23280048025',NULL,0,NULL,1,'$2a$10$4ZSuCcCwfnMdtq99V1jObeVa0Jth7XW3ZAb/J/QzXsU/iqYPWv53a',NULL,1,'2024-03-01 17:12:16',1,1,0,NULL,NULL,'2024-03-01 17:10:50','2024-03-01 17:12:16'),(23,'+23230191088',NULL,0,NULL,1,'$2a$10$yn/LDtqKpxJ6UHE5l9s4GOUdzWKX7vDbf1KwVdlIZZxtziHMKdg6q',NULL,1,'2024-03-01 17:56:56',1,1,0,NULL,NULL,'2024-03-01 17:56:27','2024-03-01 17:56:55'),(24,'+23233800146',NULL,0,NULL,1,'$2a$10$i.FbLuheO54tDfieSWRYguJ780DTeNITnsDbQfJA5bD.2re.wmwpG',NULL,1,'2024-03-04 16:06:18',1,1,0,NULL,NULL,'2024-03-04 16:05:45','2024-03-04 16:06:17'),(26,'+23276999910',NULL,0,NULL,1,'$2a$10$vW1YKiHpCQh8Xe/P4paPPeUp9PnfUZggfkrgK1MwweweNw46YNdSO',NULL,1,'2024-03-05 14:14:53',1,1,0,NULL,NULL,'2024-03-05 14:14:27','2024-03-05 14:14:52'),(27,'+23279855533',NULL,0,NULL,1,'$2a$10$sdni3XjnfxTWx9HW0XLs.OSNoNcIVxDoA3FbnnhshV.l7uMJSWtHq',NULL,1,'2024-03-05 14:18:55',1,1,0,NULL,NULL,'2024-03-05 14:18:36','2024-03-05 14:18:54'),(28,'+23276357132',NULL,0,NULL,1,'$2a$10$vMi3P1RnnjnY/DYnYwljZOyrs2cczOSs9HzRsbef81WVSC29oODkq','278090',1,'2024-03-05 14:47:11',1,1,0,NULL,NULL,'2024-03-05 14:46:57','2024-06-05 14:24:36'),(30,'+23230138546',NULL,0,NULL,1,'$2a$10$6Kj5RKMXsOlx.q/.o5akbuB6KClcTTI1ZS42sdHplW1HR5c6zK0Ni',NULL,1,'2024-03-11 14:45:21',1,1,0,NULL,NULL,'2024-03-11 14:45:03','2024-06-18 11:09:24'),(34,'+23276614608',NULL,0,NULL,1,'$2a$10$mkGNrD8SEQYWuG2O98GWceDh5m0WpKd.b67yQXtKLRKPgJivqh.QC',NULL,1,'2024-03-20 08:32:31',1,1,0,NULL,NULL,'2024-03-19 23:48:54','2024-03-20 08:32:31'),(43,'+23278473628',NULL,0,NULL,1,'$2a$10$mQ59hARpBXzL9.WLYnVXXuDrVaefp7UtoDpHDYxz4GRYOnEbLMRlq',NULL,1,'2024-04-16 00:40:08',1,1,0,NULL,NULL,'2024-04-16 00:39:46','2024-04-16 00:40:07'),(45,'+23274622773',NULL,0,NULL,1,'$2a$10$ErTV1LjT5/EPQhUZz.uLc.ssZmLhf6x63QI.U57qqYqPnQg4YbER6',NULL,1,'2024-04-25 10:26:03',1,1,0,NULL,NULL,'2024-04-25 10:25:18','2024-04-25 10:26:02'),(46,'+23288180226',NULL,0,NULL,1,'$2a$10$5mk/JdZaidOuTHqCaTQRgutpSPMjzcLxC3Cv2j6kmy0SI0hwuk4bq',NULL,1,'2024-05-03 13:40:46',1,1,0,NULL,NULL,'2024-05-03 13:39:29','2024-05-03 13:40:45'),(50,'+23279922699',NULL,0,NULL,1,'$2a$10$d2LUAx85KjnOmtSGLOtrb.a44SY8wZiAoXMh.YwxUw62Sxgiiwy.y',NULL,1,'2024-05-06 14:04:58',1,1,0,NULL,NULL,'2024-05-06 14:04:26','2024-05-06 14:04:57'),(51,'+23234241706',NULL,0,NULL,1,'$2a$10$xOlRbngkFzQytkWUSTXGX.p4.ac4XIdiF0/T9/gfhMuBRkrL3JIrK',NULL,1,'2024-05-06 14:26:07',1,1,0,NULL,NULL,'2024-05-06 14:25:36','2024-05-06 14:26:06'),(52,'+23278084004',NULL,0,NULL,1,'$2a$10$lBvh7WT04uXOW2ni6wclOeplmEftZOSLrTppcK8.mg9O5RJBxzxwO',NULL,1,'2024-05-06 14:40:50',1,1,0,NULL,NULL,'2024-05-06 14:40:09','2024-05-06 14:40:49'),(54,'+23274866543',NULL,0,NULL,1,'$2a$10$lQzX8.YQAYc60AyJfQjHUOLUbcgS4t3MTsFwx6SFxtBnQC0Oa3aXq',NULL,1,'2024-05-06 16:23:30',1,1,0,NULL,NULL,'2024-05-06 16:22:41','2024-05-06 16:23:30'),(55,'+23275247292',NULL,0,NULL,1,'$2a$10$HWup32ixf5JJWe7xd7U4z.hAyuP1.9rowY1X52G9ZsIJRuV1yRppq',NULL,1,'2024-05-08 07:59:15',1,1,0,NULL,NULL,'2024-05-08 07:58:36','2024-05-08 07:59:14'),(56,'+23230700056','natdinero@live.com',0,NULL,2,'$2a$10$o3oyGmj6JzJKiuRshLyDueCAGZeeE3U6TZfXrI9jBQErmKZlAVqTq',NULL,1,'2024-05-08 14:41:27',1,1,0,NULL,NULL,'2024-05-08 14:40:51','2024-05-08 14:41:27'),(57,'+23234830749',NULL,0,NULL,1,'$2a$10$uoGJ3O3zfJi8jBI7JLldveuVmf5.BueP.wuShN2P4LN9LaSwUidha',NULL,1,'2024-05-10 10:55:13',1,1,0,NULL,NULL,'2024-05-10 10:54:50','2024-05-10 10:55:13'),(58,'+23299200756',NULL,0,NULL,1,'$2a$10$vLBmYRKadz3n9ZsjAYWkCutpKELcuvpRHKBzrrnl6EvOdZdHWexou',NULL,1,'2024-05-10 11:43:50',1,1,0,NULL,NULL,'2024-05-10 11:43:21','2024-05-10 11:43:50'),(59,'+23278397893',NULL,0,NULL,1,'$2a$10$m3.o6m97BY8Gt2y/sab/n.3DtqV4fqfFs78HZYNCrUVt34yStDuQW',NULL,1,'2024-05-11 20:31:54',1,1,0,NULL,NULL,'2024-05-11 20:31:28','2024-05-11 20:31:53'),(60,'+23278051704',NULL,0,NULL,1,'$2a$10$iSRfYYA78epiPDNinAGqweOF5DvKbhCTBe8/8fHT/HFw3mteXGYVG',NULL,1,'2024-05-13 08:43:14',1,1,0,NULL,NULL,'2024-05-13 08:42:49','2024-05-13 08:43:13'),(61,'+23278822683',NULL,0,NULL,1,'$2a$10$6.4IpwoYfY1nFpYLi9qsR.f/rsFxTuGRqlOAe8h.MnQl.rYYeWFkC','103189',1,'2024-05-13 11:05:33',1,1,0,'ExponentPushToken[WKJu10OpuUwIMEU1f7JTma]',NULL,'2024-05-13 11:05:14','2024-07-03 15:10:24'),(62,'+23276539195',NULL,0,NULL,1,'$2a$10$3FXKB/dWbaAzQZfgSlkhD.07BTlnZbfZ6gnP8ADxXfwAaWHOI4yiK',NULL,1,'2024-05-17 10:25:54',1,1,0,NULL,NULL,'2024-05-17 10:25:26','2024-05-17 10:25:54'),(64,'+23275347443',NULL,0,NULL,1,'$2a$10$xQaP9aNyety3SdvcrLYUVuvAHLMb6jVzhnx1rDWRd5O1VCwWd7ktq',NULL,1,'2024-05-28 12:37:24',1,1,0,NULL,NULL,'2024-05-28 12:36:57','2024-05-28 12:37:24'),(65,'+23276946894',NULL,0,NULL,1,'$2a$10$Xh66c.3GdbDes545DDOaJeCEvuMfs6jUNnD7U2f1ihAVxuJ4TXTry',NULL,1,'2024-05-28 12:39:57',1,1,0,NULL,NULL,'2024-05-28 12:39:38','2024-05-28 12:39:57'),(67,'+23299822683','rolandeke49@gmail.com',0,NULL,2,'$2a$10$OwxKivVFn.Ti.ZBrH18.euRL37GL3dV1H5KNTNwaKhCbUERGnnZkm',NULL,1,'2024-05-28 16:52:59',1,1,0,NULL,NULL,'2024-05-28 16:52:36','2024-05-28 16:52:59'),(68,'+23234700269',NULL,0,NULL,1,'$2a$10$vaAiMmEkfVcBM.QPZqMU5ON0.IpKM3Xf5pEPbcTpnIb39ydlRJTPi',NULL,1,'2024-05-29 09:53:54',1,1,0,NULL,NULL,'2024-05-29 09:51:35','2024-05-29 09:53:53'),(69,'+23278454870',NULL,0,NULL,1,'$2a$10$HJZTiEsrjTDF1wdszQa9kulexmbyK8uf5RZ.XHJqZYHguHw/J0zDi',NULL,1,'2024-05-29 10:13:27',1,1,0,NULL,NULL,'2024-05-29 10:12:49','2024-05-29 10:13:26'),(71,'+23278722255','sovulahaja@gmail.com',0,NULL,2,'$2a$10$w/TX2ljI6QIcqL3tVR30geKbf.hJCMoyHTl.LNIb4a/vDoquZtjyK',NULL,1,'2024-06-18 10:28:17',1,1,0,NULL,NULL,'2024-06-18 10:25:33','2024-06-18 10:28:17'),(72,'+23299229399',NULL,0,NULL,1,'$2a$10$4CE6H0KbJEfG/hE/mygxFOxA6OxJziI8tdNkDTioCOhFL7yPGcbQq',NULL,1,'2024-06-19 13:49:58',1,1,0,NULL,NULL,'2024-06-19 13:49:33','2024-06-19 13:49:58'),(73,'+23278767090','macjajuapeter@gmail.com',0,NULL,2,'$2a$10$AFhUD2yjcheHhynDJF2pDeI1TLWYJfeHRhlgkzGTHGxlrdqzVC9vW',NULL,1,'2024-06-21 11:45:56',1,1,0,NULL,NULL,'2024-06-21 11:42:14','2024-06-21 11:45:55'),(74,'+23278271034','contehamara5839@gmail.com',0,NULL,2,'$2a$10$cx334BgOoWT8C6n3r880n.S82S.JEniQek0yociTtv29VkYjUYE/6',NULL,1,'2024-06-21 13:58:37',1,1,0,NULL,NULL,'2024-06-21 12:31:32','2024-06-21 13:58:36'),(76,'+23231428732','tambakemoh@gmail.com',0,NULL,2,'$2a$10$4xoj2TAlw3sG5VQUglhNLutsxvapDcyOVGHfv4lm3LTl0mtKwVEMm',NULL,1,'2024-06-24 13:19:14',1,1,0,NULL,NULL,'2024-06-24 13:16:51','2024-06-24 13:19:13');
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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zoom_meetings`
--

LOCK TABLES `zoom_meetings` WRITE;
/*!40000 ALTER TABLE `zoom_meetings` DISABLE KEYS */;
INSERT INTO `zoom_meetings` VALUES (1,'78518927238','TW/Ng4dcTe6lpjUTJpnnSw==','chinedum eke Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/78518927238?pwd=yB3jX7oamxFg9t0E2uB9XY3zDTIDUM.1','https://us04web.zoom.us/s/78518927238?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6Ijc4NTE4OTI3MjM4IiwiZXhwIjoxNzA5MzIxMjk4LCJpYXQiOjE3MDkzMTQwOTgsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.DsaAD3SpXuD1Kt0GtB1yVdjD1GDVwf3QOrlYkH_tB7E','yB3jX7oamxFg9t0E2uB9XY3zDTIDUM.1','2024-03-01 17:28:18','2024-03-01 17:28:18'),(2,'77209650751','uXZO13hVSwqXtd0kedlmAA==','judah Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/77209650751?pwd=Ii4EaeeOiJSx7IAN7Tj1xgMDOAbrY3.1','https://us04web.zoom.us/s/77209650751?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6Ijc3MjA5NjUwNzUxIiwiZXhwIjoxNzEwNzgxMzMzLCJpYXQiOjE3MTA3NzQxMzMsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.dzGOf63ceSs0WqNKkLg1-x15x_N9eqPT1VIVAILpjPc','Ii4EaeeOiJSx7IAN7Tj1xgMDOAbrY3.1','2024-03-18 15:02:13','2024-03-18 15:02:13'),(3,'79137347614','WrlP2kvaRYq+gQsIT9I4PA==','judah Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/79137347614?pwd=pOJtmmGsTaj37ceWb3dtEvIfCVSlIW.1','https://us04web.zoom.us/s/79137347614?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6Ijc5MTM3MzQ3NjE0IiwiZXhwIjoxNzEwODc2MzAxLCJpYXQiOjE3MTA4NjkxMDEsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.byN0tuLiJwFQjVjTY9t3PlnK0pR-km88iURVDXdhMbw','pOJtmmGsTaj37ceWb3dtEvIfCVSlIW.1','2024-03-19 17:25:01','2024-03-19 17:25:01'),(4,'72258390639','uwjDqxGkTwaMm6dOhppJtw==','judah Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/72258390639?pwd=MiaPk1kbDIWvU2wUDbmcyl8TuS3xyH.1','https://us04web.zoom.us/s/72258390639?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6IjcyMjU4MzkwNjM5IiwiZXhwIjoxNzEwODc2MzM3LCJpYXQiOjE3MTA4NjkxMzcsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.FGJVMYfnQ86nOup0B8b1iZW5nNASPMBPm61gMB8emt0','MiaPk1kbDIWvU2wUDbmcyl8TuS3xyH.1','2024-03-19 17:25:37','2024-03-19 17:25:37'),(5,'74831591152','R6Bckk6KRZ+wj0dR53l+oA==','jad Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/74831591152?pwd=kY3NxintuMGHkKOL7fb4KbCAIdoSJb.1','https://us04web.zoom.us/s/74831591152?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6Ijc0ODMxNTkxMTUyIiwiZXhwIjoxNzEwODc3MDQwLCJpYXQiOjE3MTA4Njk4NDAsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.jzaFisQA9kyugbSO4y73YfLlcerka9Sz9IKuj23yHDI','kY3NxintuMGHkKOL7fb4KbCAIdoSJb.1','2024-03-19 17:37:20','2024-03-19 17:37:20'),(6,'72332833340','aAIipRICRp+Pl3yISu9OOQ==','chinedum eke Meidical Appointment with Dr. Nathaniel Williams','https://us04web.zoom.us/j/72332833340?pwd=V3AQAhuAN60A9lhnTaQIn1bmkadHnR.1','https://us04web.zoom.us/s/72332833340?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6IjcyMzMyODMzMzQwIiwiZXhwIjoxNzExNTY1MDg2LCJpYXQiOjE3MTE1NTc4ODYsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.FM5zT_i3TEd-fXxO5_VsNu6BINQmXQUrTUMHH7ZfRT8','V3AQAhuAN60A9lhnTaQIn1bmkadHnR.1','2024-03-27 16:44:46','2024-03-27 16:44:46'),(7,'74056139694','kjOxleCaSMONcfq79TvRGg==','john karbg Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/74056139694?pwd=sXPWpi1MOB3XhVNlCk5NIfMES9lT4C.1','https://us04web.zoom.us/s/74056139694?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6Ijc0MDU2MTM5Njk0IiwiZXhwIjoxNzExOTg0NjE4LCJpYXQiOjE3MTE5Nzc0MTgsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.WgcWvRpHU_mY73nbXNMr4Ep4nUMz-Ty4-9P73R6KdVw','sXPWpi1MOB3XhVNlCk5NIfMES9lT4C.1','2024-04-01 13:16:58','2024-04-01 13:16:58'),(8,'79431789833','SRcsdDx6RHKG4vpPeUtyZA==','john karbg Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/79431789833?pwd=5flGqTiLpzDMUK5qvc7TsJkUnw4oWz.1','https://us04web.zoom.us/s/79431789833?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6Ijc5NDMxNzg5ODMzIiwiZXhwIjoxNzExOTg0NjE4LCJpYXQiOjE3MTE5Nzc0MTgsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.sotsk9vdTun10TROYnjthJ-6QS1wL1_t0G34yg8xbnA','5flGqTiLpzDMUK5qvc7TsJkUnw4oWz.1','2024-04-01 13:16:58','2024-04-01 13:16:58'),(9,'74728643885','j7RUORfTQoGRcLvl3gOvUg==','john karbg Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/74728643885?pwd=vXUKYuwaCnOnYEQAU2YeQWVR9yKhu5.1','https://us04web.zoom.us/s/74728643885?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6Ijc0NzI4NjQzODg1IiwiZXhwIjoxNzExOTg0NjE4LCJpYXQiOjE3MTE5Nzc0MTgsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.3zXqD-6h67xj8CjzX_Qx19b5tV4-kPMrlYz5BsD4OPs','vXUKYuwaCnOnYEQAU2YeQWVR9yKhu5.1','2024-04-01 13:16:58','2024-04-01 13:16:58'),(10,'71854650304','ZQU/q+2iRvKCjula9r2b4g==','john karbg Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/71854650304?pwd=es2bRkRw49tFR5FVKX4nTbSiZJ4VsE.1','https://us04web.zoom.us/s/71854650304?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6IjcxODU0NjUwMzA0IiwiZXhwIjoxNzExOTg0NjE4LCJpYXQiOjE3MTE5Nzc0MTgsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.IOeUaMMfkjKjCXY_Ee3NwLwWZNGTOH_4zvYfoGkmg8E','es2bRkRw49tFR5FVKX4nTbSiZJ4VsE.1','2024-04-01 13:16:58','2024-04-01 13:16:58'),(11,'72361398359','S7Fw2dSsTqOhlOjYx7w9aw==','john karbg Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/72361398359?pwd=D9xYL2kwoUlU39HcGWzbl1zH9PvbZr.1','https://us04web.zoom.us/s/72361398359?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6IjcyMzYxMzk4MzU5IiwiZXhwIjoxNzExOTg0NjE4LCJpYXQiOjE3MTE5Nzc0MTgsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.1fT6nQi604NiIbr50X1XZb7t1HhALFBjUdeTulX-HlQ','D9xYL2kwoUlU39HcGWzbl1zH9PvbZr.1','2024-04-01 13:16:58','2024-04-01 13:16:58'),(12,'76092129972','1eMbo0VeQRuP2tTE/oA4ow==','john karbg Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/76092129972?pwd=Aee2g9hTWHzoXaPUmW1lyYkuF1d2cG.1','https://us04web.zoom.us/s/76092129972?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6Ijc2MDkyMTI5OTcyIiwiZXhwIjoxNzExOTg0NjE4LCJpYXQiOjE3MTE5Nzc0MTgsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.WLn3v_gLYdqzIO45hR-fI_ZtdyuQKCkOZCxJUWVlieo','Aee2g9hTWHzoXaPUmW1lyYkuF1d2cG.1','2024-04-01 13:16:58','2024-04-01 13:16:58'),(13,'79940890960','fvRDYyuWSBKVMcCibyRtXw==','manso sesay Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/79940890960?pwd=ltSXzj4TKquyJJGbwiQYBapjO5R6VZ.1','https://us04web.zoom.us/s/79940890960?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6Ijc5OTQwODkwOTYwIiwiZXhwIjoxNzExOTg4ODUzLCJpYXQiOjE3MTE5ODE2NTMsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.rEj3tbsYdEAC3GM-iS5RLQGNe5nOjVk1gAVxdafuZnE','ltSXzj4TKquyJJGbwiQYBapjO5R6VZ.1','2024-04-01 14:27:33','2024-04-01 14:27:33'),(14,'73624633705','QMPNiKH5QG+ZzkfYLbuWwA==','manso sesay Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/73624633705?pwd=rwavBYJgO8dIyFlDHGLdzZx9a4Sa2M.1','https://us04web.zoom.us/s/73624633705?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6IjczNjI0NjMzNzA1IiwiZXhwIjoxNzExOTg4ODUzLCJpYXQiOjE3MTE5ODE2NTMsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.94Q8PT5_AZFUkb8-aUBEw8YrOMDXJfm9PREDmsj1CnM','rwavBYJgO8dIyFlDHGLdzZx9a4Sa2M.1','2024-04-01 14:27:33','2024-04-01 14:27:33'),(15,'78395368733','hr2ySZ3lQymJymZOg/b6Hg==','manso sesay Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/78395368733?pwd=2YZuJLCQSXw5yRk2sSlLKYL5pFrqEI.1','https://us04web.zoom.us/s/78395368733?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6Ijc4Mzk1MzY4NzMzIiwiZXhwIjoxNzExOTg4ODUzLCJpYXQiOjE3MTE5ODE2NTMsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.jiGUaX6yV3PEsYS0v7cYn8DQ3tZJy0hllRYXB1D9szk','2YZuJLCQSXw5yRk2sSlLKYL5pFrqEI.1','2024-04-01 14:27:33','2024-04-01 14:27:33'),(16,'73230917636','0hbMPl4mRfy1VE8cavlV/A==','manso sesay Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/73230917636?pwd=bQCTp1aLZKFxCZmaJqtsDDBJgbEV6Y.1','https://us04web.zoom.us/s/73230917636?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6IjczMjMwOTE3NjM2IiwiZXhwIjoxNzExOTg4ODUzLCJpYXQiOjE3MTE5ODE2NTMsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.FDJVfmVyLgukDDfB4GQNIXnIB3mV79XI5PF-0_Y30Wk','bQCTp1aLZKFxCZmaJqtsDDBJgbEV6Y.1','2024-04-01 14:27:33','2024-04-01 14:27:33'),(17,'71791202581','MIV8q/BeTK+P9vlTCFrsZw==','manso sesay Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/71791202581?pwd=8QmQvEb2B5SKsapbqCgQOqBUUOxGYQ.1','https://us04web.zoom.us/s/71791202581?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6IjcxNzkxMjAyNTgxIiwiZXhwIjoxNzExOTg4ODUzLCJpYXQiOjE3MTE5ODE2NTMsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.QPQ4QLBSAnp_-trVRNxd48Pq1RdWfAGnAbHBQNd-jCo','8QmQvEb2B5SKsapbqCgQOqBUUOxGYQ.1','2024-04-01 14:27:33','2024-04-01 14:27:33'),(18,'74762895669','U0uG4CEhSvGMGmosE9DLYQ==','manso sesay Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/74762895669?pwd=esLjirgHk6Fljz9K1KvMC3BPEAOTTs.1','https://us04web.zoom.us/s/74762895669?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6Ijc0NzYyODk1NjY5IiwiZXhwIjoxNzExOTg4ODUzLCJpYXQiOjE3MTE5ODE2NTMsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.mn1Ahqmr-c6E6VnBdhe_FgaZ0D62aitPVanl4mDPueA','esLjirgHk6Fljz9K1KvMC3BPEAOTTs.1','2024-04-01 14:27:33','2024-04-01 14:27:33'),(19,'71894893764','xRRJEKyrQuWUNavjTyoEzg==','manso sesay Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/71894893764?pwd=Ml6yfyxTkxccRE9JqXRxzqNceVGab4.1','https://us04web.zoom.us/s/71894893764?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6IjcxODk0ODkzNzY0IiwiZXhwIjoxNzExOTg4ODc5LCJpYXQiOjE3MTE5ODE2NzksImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.noD8YHPl03qHcKtMAAbfvfhKmjZCHXbLejQwFdixmq0','Ml6yfyxTkxccRE9JqXRxzqNceVGab4.1','2024-04-01 14:27:59','2024-04-01 14:27:59'),(20,'76204551793','guLskduPTJelRIULvM/VeA==','manso sesay Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/76204551793?pwd=OeQ3hqJMnIrEDWgW38agqacsqPgGdM.1','https://us04web.zoom.us/s/76204551793?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6Ijc2MjA0NTUxNzkzIiwiZXhwIjoxNzExOTg4ODc5LCJpYXQiOjE3MTE5ODE2NzksImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.Aie-kWJa1EMF5aQwQW57NkvZm48MNGaYj3n5zQPk1IE','OeQ3hqJMnIrEDWgW38agqacsqPgGdM.1','2024-04-01 14:27:59','2024-04-01 14:27:59'),(21,'74566290899','7g4osNMgRRyeeR/Ilki3sA==','manso sesay Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/74566290899?pwd=44s7jM0ocwBSWoEtrI8zrbQJl2aadh.1','https://us04web.zoom.us/s/74566290899?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6Ijc0NTY2MjkwODk5IiwiZXhwIjoxNzExOTg4ODc5LCJpYXQiOjE3MTE5ODE2NzksImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.GsOwkbxaxQdY1VmsicJHXyM_Om5Ae17Yby-rSCF6KR0','44s7jM0ocwBSWoEtrI8zrbQJl2aadh.1','2024-04-01 14:27:59','2024-04-01 14:27:59'),(22,'74649860421','fplJ/GkMRMSuarkF80DRjA==','manso sesay Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/74649860421?pwd=Mo0cfuwAWKFlXZLUwfgTAEpCuY7zQr.1','https://us04web.zoom.us/s/74649860421?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6Ijc0NjQ5ODYwNDIxIiwiZXhwIjoxNzExOTg4ODc5LCJpYXQiOjE3MTE5ODE2NzksImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.RLvxmpR94CQJxJfXvNw3gn4_zxXdM9PVD6Z8_Gatju0','Mo0cfuwAWKFlXZLUwfgTAEpCuY7zQr.1','2024-04-01 14:27:59','2024-04-01 14:27:59'),(23,'71345462129','7vYeBhbqR+qIgBmjV3Pd/g==','manso moiwa Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/71345462129?pwd=wcVmnVW5rWNP1vJ26NkbGEgwz5X2A8.1','https://us04web.zoom.us/s/71345462129?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6IjcxMzQ1NDYyMTI5IiwiZXhwIjoxNzExOTkwOTQ5LCJpYXQiOjE3MTE5ODM3NDksImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.M1Bf9xmvnqaqhdnWOJN6FFMoqo9vnqcCDlfleOZfN4E','wcVmnVW5rWNP1vJ26NkbGEgwz5X2A8.1','2024-04-01 15:02:29','2024-04-01 15:02:29'),(24,'73650637812','zEfG2U7aTSWPUaCuM0TXKg==','hassan moiwa Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/73650637812?pwd=rBbaTKbKX1S95AHzNQ9NNhYhseSGWC.1','https://us04web.zoom.us/s/73650637812?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6IjczNjUwNjM3ODEyIiwiZXhwIjoxNzEyMTU4OTQyLCJpYXQiOjE3MTIxNTE3NDIsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.Xge-D09RGGa9oxr8izniPnrLeLROZm9AHbrbK6t38B0','rBbaTKbKX1S95AHzNQ9NNhYhseSGWC.1','2024-04-03 13:42:22','2024-04-03 13:42:22'),(25,'74033865859','mjdEBykXQvegeaABTH/viA==','alfred kamara Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/74033865859?pwd=nKoo8apKiydfPwQ952Q6iZG5LAHalh.1','https://us04web.zoom.us/s/74033865859?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6Ijc0MDMzODY1ODU5IiwiZXhwIjoxNzEyOTMzNjIyLCJpYXQiOjE3MTI5MjY0MjIsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.1916vvcCNvv9j8zuA6KuTlHDY0T9Ybbi0izo1IrjQ-8','nKoo8apKiydfPwQ952Q6iZG5LAHalh.1','2024-04-12 12:53:42','2024-04-12 12:53:42'),(26,'79744984245','3my9Ib44QTqHworz5ygQCg==','gf Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/79744984245?pwd=fiSAp4a4alMmx1BetVLBMWqCOojgQo.1','https://us04web.zoom.us/s/79744984245?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6Ijc5NzQ0OTg0MjQ1IiwiZXhwIjoxNzE1NjA2NzA4LCJpYXQiOjE3MTU1OTk1MDgsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ._j2LN6LPS4piTXoBmM9A0TxIeLNKWtK4554AwDUO6jM','fiSAp4a4alMmx1BetVLBMWqCOojgQo.1','2024-05-13 11:25:08','2024-05-13 11:25:08'),(27,'72642953450','4U431ka9RiaN3hEOvyTkRw==','manso sesay Meidical Appointment with Dr. Nyalema Moiwa','https://us04web.zoom.us/j/72642953450?pwd=aDqC5q6zSalr36GcS8iVJZMawqg8On.1','https://us04web.zoom.us/s/72642953450?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6Inl4LVM5U0F3UjBtNGpLZGJ6dGFURGciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoidXMwNCIsImNsdCI6MCwibW51bSI6IjcyNjQyOTUzNDUwIiwiZXhwIjoxNzE1NzA4MDQ0LCJpYXQiOjE3MTU3MDA4NDQsImFpZCI6Ik5hNFZWc0JpU05XZHUtWlhHNVNya3ciLCJjaWQiOiIifQ.jLVv87NDuOi7oKF0e0Z6loy9UssTLk9GsMQtvhs3cd4','aDqC5q6zSalr36GcS8iVJZMawqg8On.1','2024-05-14 15:34:04','2024-05-14 15:34:04'),(28,'78551150888','4RtdAdsTRT6nyZuNzubiEw==','alex kamara Meidical Appointment with Dr. Amarachi Eke','https://us04web.zoom.us/j/78551150888?pwd=mzCfwf7U0yJAAYTIgCvYfMPoEeWA39.1','https://us04web.zoom.us/s/78551150888?zak=eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJpc3MiOiJ3ZWIiLCJjbHQiOjAsIm1udW0iOiI3ODU1MTE1MDg4OCIsImF1ZCI6ImNsaWVudHNtIiwidWlkIjoieXgtUzlTQXdSMG00aktkYnp0YVREZyIsInppZCI6ImQzMjkxNmVhMWYzNTRlMGQ4NzQzMmVjNDJmZDk3YmVlIiwic2siOiIwIiwic3R5IjoxMDAsIndjZCI6InVzMDQiLCJleHAiOjE3MTk1MTMyODcsImlhdCI6MTcxOTUwNjA4NywiYWlkIjoiTmE0VlZzQmlTTldkdS1aWEc1U3JrdyIsImNpZCI6IiJ9.LtyitI0Jw3gCHFGoaJUaQig4v8wHjdtbKMsxztVOo4w','mzCfwf7U0yJAAYTIgCvYfMPoEeWA39.1','2024-06-27 16:34:47','2024-06-27 16:34:47');
/*!40000 ALTER TABLE `zoom_meetings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'db_kenecare'
--

--
-- Dumping routines for database 'db_kenecare'
--
/*!50003 DROP PROCEDURE IF EXISTS `Sp_DeleteCity` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_DeleteCity`(IN p_city_id INT)
BEGIN
    DELETE FROM cities WHERE city_id = p_city_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_DeleteSpecializationById` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_DeleteSpecializationById`(
	IN p_specialization_id INT
)
BEGIN
   DELETE FROM specializations WHERE specialization_id = p_specialization_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_GetAdminById` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_GetAdminById`(
	IN p_admin_id INT
)
BEGIN
   SELECT * FROM admins WHERE admin_id = p_admin_id LIMIT 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_GetAllAdmin` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_GetAllAdmin`()
BEGIN
   SELECT * FROM admins;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_GetAllSpecializations` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_GetAllSpecializations`()
BEGIN
   SELECT * FROM specializations;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_GetAllUserType` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_GetAllUserType`()
BEGIN
   SELECT * FROM user_type;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_GetCities` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_GetCities`()
BEGIN
    SELECT * FROM cities;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_GetCity` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_GetCity`()
BEGIN
    SELECT * FROM cities;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_GetCityById` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_GetCityById`(IN p_city_id INT)
BEGIN
    SELECT * FROM cities WHERE city_id = p_city_id LIMIT 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_GetMedicalAppointmentById` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_GetMedicalAppointmentById`(
IN p_appointment_id INT
)
BEGIN
SELECT appointment_id,appointment_uuid,
p.patient_id,
p.first_name,
p.last_name,
d.doctor_id,
d.first_name,
d.last_name,
appointment_type,
appointment_date,
appointment_time,
time_slot_id,
patient_name_on_prescription,
patient_mobile_number,
patient_symptoms, 
speciality_name, 
medical_appointments.meeting_id,
join_url,
start_url,
start_time,
end_time,
appointment_status,
cancelled_reason,
cancelled_at,
canceled_by,
postponed_by,
postponed_date,
postponed_reason,
medical_appointments.created_at,
medical_appointments.updated_at
FROM medical_appointments
INNER JOIN patients as p on medical_appointments.patient_id = p.patient_id
INNER JOIN doctors as d on medical_appointments.doctor_id = d.doctor_id
INNER JOIN medical_specialities as ms on medical_appointments.speciality_id = ms.speciality_id
INNER JOIN zoom_meetings on medical_appointments.meeting_id = zoom_meetings.zoom_id 
 WHERE medical_appointments.appointment_id = p_appointment_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_GetMedicalAppointmentByUUID` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_GetMedicalAppointmentByUUID`(
    IN p_appointment_uuid VARCHAR(150)
)
BEGIN
SELECT appointment_id,appointment_uuid,
p.patient_id,
p.first_name,
p.last_name,
d.doctor_id,
d.first_name AS 'doctor_first_name',
d.last_name AS 'doctor_last_name',
appointment_type,
medical_appointments.consultation_fee,
appointment_date,
appointment_time,
time_slot_id,
patient_name_on_prescription,
patient_mobile_number,
patient_symptoms, 
speciality_name, 
medical_appointments.meeting_id,
join_url,
start_url,
start_time,
end_time,
appointment_status,
cancelled_reason,
cancelled_at,
canceled_by,
postponed_by,
postponed_date,
postponed_reason,
medical_appointments.created_at,
medical_appointments.updated_at
FROM medical_appointments
INNER JOIN patients as p on medical_appointments.patient_id = p.patient_id
INNER JOIN doctors as d on medical_appointments.doctor_id = d.doctor_id
INNER JOIN medical_specialities as ms on medical_appointments.speciality_id = ms.speciality_id
LEFT JOIN zoom_meetings on medical_appointments.meeting_id = zoom_meetings.zoom_id 
WHERE medical_appointments.appointment_uuid = p_appointment_uuid LIMIT 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_GetMedicalAppointmentsByPatientId` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_GetMedicalAppointmentsByPatientId`(
IN p_patient_id INT
)
BEGIN
SELECT appointment_id,appointment_uuid,
p.patient_id,
p.first_name,
p.last_name,
d.doctor_id,
d.first_name AS 'doctor_first_name',
d.last_name AS 'doctor_last_name',
appointment_type,
medical_appointments.consultation_fee,
appointment_date,
appointment_time,
time_slot_id,
patient_name_on_prescription,
patient_mobile_number,
patient_symptoms, 
speciality_name, 
medical_appointments.meeting_id,
join_url,
start_url,
start_time,
end_time,
appointment_status,
cancelled_reason,
cancelled_at,
canceled_by,
postponed_by,
postponed_date,
postponed_reason,
medical_appointments.created_at,
medical_appointments.updated_at
FROM medical_appointments
INNER JOIN patients as p on medical_appointments.patient_id = p.patient_id
INNER JOIN doctors as d on medical_appointments.doctor_id = d.doctor_id
INNER JOIN medical_specialities as ms on medical_appointments.speciality_id = ms.speciality_id
LEFT JOIN zoom_meetings on medical_appointments.meeting_id = zoom_meetings.zoom_id 
WHERE medical_appointments.patient_id = p_patient_id 
ORDER BY medical_appointments.created_at DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_GetPatientMedicalAppointmentById` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_GetPatientMedicalAppointmentById`(
IN p_patient_id INT,
    IN p_appointment_id INT
)
BEGIN
SELECT appointment_id,appointment_uuid,
p.patient_id,
p.first_name,
p.last_name,
d.doctor_id,
d.first_name AS 'doctor_first_name',
d.last_name AS 'doctor_last_name',
appointment_type,
medical_appointments.consultation_fee,
appointment_date,
appointment_time,
time_slot_id,
patient_name_on_prescription,
patient_mobile_number,
patient_symptoms, 
speciality_name, 
medical_appointments.meeting_id,
join_url,
start_url,
start_time,
end_time,
appointment_status,
cancelled_reason,
cancelled_at,
canceled_by,
postponed_by,
postponed_date,
postponed_reason,
medical_appointments.created_at,
medical_appointments.updated_at
FROM medical_appointments
INNER JOIN patients as p on medical_appointments.patient_id = p.patient_id
INNER JOIN doctors as d on medical_appointments.doctor_id = d.doctor_id
INNER JOIN medical_specialities as ms on medical_appointments.speciality_id = ms.speciality_id
LEFT JOIN zoom_meetings on medical_appointments.meeting_id = zoom_meetings.zoom_id 
WHERE medical_appointments.appointment_id = p_appointment_id AND medical_appointments.patient_id = p_patient_id LIMIT 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_GetSpecializationById` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_GetSpecializationById`(
	IN p_specialization_id INT
)
BEGIN
   SELECT * FROM specializations WHERE specialization_id = p_specialization_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_InsertAdmin` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_InsertAdmin`(
    IN p_fullname VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_mobile_number VARCHAR(50),
    IN p_password VARCHAR(255)
)
BEGIN
    INSERT INTO admins (fullname, email, mobile_number, password)
    VALUES (p_fullname, p_email, p_mobile_number, p_password);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_InsertCity` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_InsertCity`(
    IN p_city_name VARCHAR(255),
    IN p_latitude DECIMAL(10, 6),
    IN p_longitude DECIMAL(10, 6),
    IN p_inputted_by INT
)
BEGIN
    INSERT INTO cities (city_name, latitude, longitude, inputted_by)
    VALUES (p_city_name, p_latitude, p_longitude, p_inputted_by);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_InsertSpecialization` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_InsertSpecialization`(
    IN p_specialization_name VARCHAR(255),
    IN p_description VARCHAR(255),
    IN p_image_url VARCHAR(255),
    IN p_inputted_by INT
)
BEGIN
    INSERT INTO specializations (specialization_name, description, image_url, inputted_by)
    VALUES (p_specialization_name, p_description, p_image_url, p_inputted_by);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_InsertUserType` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_InsertUserType`(
    IN p_type_name VARCHAR(50),
    IN p_inputted_by INT
)
BEGIN
    INSERT INTO user_type (type_name, inputted_by)
    VALUES (p_type_name, p_inputted_by);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_UpdateCityById` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_UpdateCityById`(
    IN p_city_id INT,
    IN p_city_name VARCHAR(255),
    IN p_latitude DECIMAL(10, 6),
    IN p_longitude DECIMAL(10, 6),
    IN p_inputted_by INT
)
BEGIN
    UPDATE cities
    SET city_name = p_city_name, latitude = p_latitude, longitude = p_longitude, inputted_by = p_inputted_by
    WHERE city_id = p_city_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_UpdateSpecialization` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_UpdateSpecialization`(
    IN p_specialization_id INT,
    IN p_specialization_name VARCHAR(255),
    IN p_description VARCHAR(255),
    IN p_image_url VARCHAR(255)
)
BEGIN
    UPDATE specializations
    SET specialization_name = p_specialization_name,
        description = p_description,
        image_url = p_image_url
    WHERE specialization_id = p_specialization_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `Sp_UpdateSpecializationStatus` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`kenecare`@`%` PROCEDURE `Sp_UpdateSpecializationStatus`(
    IN p_specialization_id INT,
    IN p_specialization_status TINYINT
)
BEGIN
    UPDATE specializations
    SET is_active = p_specialization_status
    WHERE specialization_id = p_specialization_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-09 11:15:57
