use db_kenecare;

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

ALTER TABLE `appointment_prescriptions` DROP COLUMN `access_token`;
ALTER TABLE `appointment_prescriptions` DROP COLUMN `access_jwt`;

-- Start
SELECT ma1.*
FROM medical_appointments ma1
JOIN (
    SELECT 
        MIN(appointment_id) AS keep_id,  -- this is the row we will keep
        doctor_id,
        appointment_date,
        appointment_time,
        appointment_status
    FROM medical_appointments
    GROUP BY doctor_id, appointment_date, appointment_time, appointment_status
    HAVING COUNT(*) > 1
) dup
ON ma1.doctor_id = dup.doctor_id
AND ma1.appointment_date = dup.appointment_date
AND ma1.appointment_time = dup.appointment_time
AND ma1.appointment_status = dup.appointment_status
AND ma1.appointment_id <> dup.keep_id;



DELETE ma1
FROM medical_appointments ma1
JOIN (
    SELECT 
        MIN(appointment_id) AS keep_id,  -- keep the lowest id per duplicate group
        doctor_id,
        appointment_date,
        appointment_time,
        appointment_status
    FROM medical_appointments
    GROUP BY doctor_id, appointment_date, appointment_time, appointment_status
    HAVING COUNT(*) > 1
) dup
ON ma1.doctor_id = dup.doctor_id
AND ma1.appointment_date = dup.appointment_date
AND ma1.appointment_time = dup.appointment_time
AND ma1.appointment_status = dup.appointment_status
AND ma1.appointment_id <> dup.keep_id;


DELETE m1
FROM medical_appointments m1
JOIN medical_appointments m2
  ON m1.doctor_id = m2.doctor_id
 AND m1.appointment_date = m2.appointment_date
 AND m1.appointment_time = m2.appointment_time
 AND IFNULL(m1.appointment_status, '') = IFNULL(m2.appointment_status, '')
 AND m1.appointment_id > m2. appointment_id;
-- End 
-- ALTER TABLE `users` ADD COLUMN `last_used` TIMESTAMP NULL DEFAULT NULL;
-- ALTER TABLE `users`
-- ADD `two_factor_secret` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL;


-- =======================================================================
-- Phase 0: Pre-flight Checks and Data Cleanup (CRITICAL for UNIQUE KEYS and FKs)
-- =======================================================================

-- 0.1. Find duplicates for UNIQUE KEY `uq_doctor_faq_questions`
-- If rows returned, either DELETE or UPDATE `question` to be unique
SELECT question, COUNT(*) FROM `doctor_faqs` GROUP BY question HAVING COUNT(*) > 1;


-- 0.2. Find duplicates for UNIQUE KEY `uq_doctor_health_blogs_title`
SELECT title, COUNT(*) FROM `doctor_health_blogs` GROUP BY title HAVING COUNT(*) > 1;

-- 0.4. Find duplicates for UNIQUE KEY `uq_doctor_datetime_slot` on `medical_appointments`
SELECT doctor_id, appointment_date, appointment_time, appointment_status, COUNT(*)
FROM `medical_appointments`
GROUP BY doctor_id, appointment_date, appointment_time, appointment_status
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
ALTER TABLE `patients` MODIFY COLUMN `user_id` INT NOT NULL UNIQUE, ADD INDEX `idx_patient_first_appointment_booked` (`booked_first_appointment`);
ALTER TABLE `patients_testimonial` MODIFY COLUMN `is_approved` TINYINT NOT NULL DEFAULT '0', MODIFY COLUMN `is_active` TINYINT NOT NULL DEFAULT '0', ADD INDEX `idx_testimonial_approved_active` (`is_approved`, `is_active`), ADD INDEX `idx_testimonial_created_at` (`created_at` DESC);
ALTER TABLE `specializations` MODIFY COLUMN `is_active` TINYINT NOT NULL DEFAULT '1', ADD INDEX `idx_specialization_active` (`is_active`);
ALTER TABLE `users` ADD COLUMN `two_fa_secret` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL AFTER `is_2fa_enabled`, ADD COLUMN `is_account_locked` TINYINT DEFAULT '0' AFTER `is_2fa_enabled`, ADD COLUMN `failed_login_attempts` INT DEFAULT '0' AFTER `is_account_locked`, ADD COLUMN `last_login_at` TIMESTAMP NULL DEFAULT NULL AFTER `failed_login_attempts`, ADD INDEX `idx_users_type_active_online` (`user_type`, `is_account_active`, `is_online`), ADD INDEX `idx_users_is_verified` (`is_verified`), ADD INDEX `idx_users_is_account_active` (`is_account_active`), ADD INDEX `idx_users_is_deleted` (`is_deleted`), ADD INDEX `idx_users_referral_code` (`referral_code`), ADD INDEX `idx_users_created_at` (`created_at` DESC), ADD INDEX `idx_users_updated_at` (`updated_at` DESC), ADD INDEX `idx_users_last_seen_at` (`last_seen_at` DESC), ADD INDEX `idx_users_last_login_at` (`last_login_at`);
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

-- SELECT
--     TABLE_NAME,
--     INDEX_NAME,
--     GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS Columns,
--     NON_UNIQUE,
--     INDEX_TYPE
-- FROM
--     information_schema.STATISTICS
-- WHERE
--     TABLE_SCHEMA = DATABASE() -- Use DATABASE() to limit to the current database
-- GROUP BY
--     TABLE_NAME, INDEX_NAME, NON_UNIQUE, INDEX_TYPE
-- ORDER BY
-- TABLE_NAME, INDEX_NAME;

ALTER TABLE `family_members`
  MODIFY COLUMN `relationship` ENUM('spouse', 'child', 'parent', 'sibling', 'grandparent', 'other') NOT NULL;

ALTER TABLE `withdrawal_requests`
  MODIFY COLUMN `status` ENUM('pending', 'completed', 'failed', 'processing') NOT NULL DEFAULT 'pending',
  ADD COLUMN `failure_details` TEXT DEFAULT NULL AFTER `status`;

ALTER TABLE `doctors`
ADD COLUMN `signature_url` VARCHAR(255) DEFAULT NULL AFTER `profile_pic_url`;


ALTER TABLE `appointment_followup`
MODIFY COLUMN `followup_status` ENUM('pending', 'completed', 'canceled', 'approved') NOT NULL DEFAULT 'pending',
ADD COLUMN `followup_count` TINYINT;

-- NEW DB CHANGES

ALTER TABLE `medical_appointments`
MODIFY COLUMN `appointment_status` enum('approved','pending','started','completed','canceled','postponed','referred','missed') DEFAULT 'pending';

INSERT INTO doctor_available_days (
        doctor_id,
        day_of_week,
        day_start_time,
        day_end_time,
        is_available
    )
    SELECT
        d.doctor_id,
        days.day,
        '09:00:00',
        '17:00:00',
        1
    FROM
        doctors d
    CROSS JOIN
        (SELECT 'monday' AS day UNION ALL
         SELECT 'tuesday' UNION ALL
         SELECT 'wednesday' UNION ALL
         SELECT 'thursday' UNION ALL
         SELECT 'friday') AS days
    WHERE
        d.doctor_id NOT IN (
            SELECT DISTINCT doctor_id
            FROM doctor_available_days
        );