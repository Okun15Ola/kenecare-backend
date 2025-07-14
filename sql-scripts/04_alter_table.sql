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
