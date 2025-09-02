--
-- Table structure for lab_managers to handle authentication and authorization
--
CREATE TABLE lab_managers (
  manager_id INT AUTO_INCREMENT,
  manager_uuid CHAR(36) NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  is_account_active TINYINT NOT NULL DEFAULT '1',
  is_account_verified TINYINT NOT NULL DEFAULT '0',
  is_online TINYINT DEFAULT '0',
  last_seen_at TIMESTAMP,
  is_email_verified TINYINT DEFAULT '0',
  email_verification_token VARCHAR(20) DEFAULT NULL,
  email_verified_at TIMESTAMP,
  is_phone_verified TINYINT DEFAULT '0',
  phone_verification_token VARCHAR(20) DEFAULT NULL,
  phone_verified_at TIMESTAMP,
  token_expired_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (manager_id),
  UNIQUE KEY uq_manager_uuid (manager_uuid),
  UNIQUE KEY uq_manager_email (email),
  UNIQUE KEY uq_manager_mobile_number (mobile_number),
  INDEX idx_manager_email_verification (email, is_email_verified),
  INDEX idx_manager_status (is_account_active, is_online),
  CONSTRAINT chk_manager_account_status CHECK (is_account_active IN (0, 1) AND is_account_verified IN (0, 1))
);

CREATE TABLE labs (
    lab_id INT AUTO_INCREMENT,
    lab_uuid CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website_url VARCHAR(255),
    logo_url VARCHAR(255),
    registration_number VARCHAR(100),
    certificate_url VARCHAR(255),
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    manager_id INT,
    is_active TINYINT DEFAULT '1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (lab_id),
    UNIQUE KEY uq_lab_uuid (lab_uuid),
    UNIQUE KEY uq_lab_registration_number (registration_number),
    INDEX idx_lab_manager_id (manager_id),
    INDEX idx_lab_approval_status (approval_status),
    INDEX idx_lab_is_active (is_active),
    FULLTEXT INDEX ft_lab_name_desc (name, description),
    FOREIGN KEY fk_lab_manager (manager_id) REFERENCES lab_managers(manager_id) ON DELETE SET NULL,
    CONSTRAINT chk_lab_is_active CHECK (is_active IN (0, 1))
);

CREATE TABLE lab_test_categories (
    test_category_id INT AUTO_INCREMENT,
    category_uuid CHAR(36) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    description TEXT,
    lab_id INT NOT NULL,
    added_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT DEFAULT '1',
    PRIMARY KEY (test_category_id),
    UNIQUE KEY uq_category_uuid (category_uuid),
    UNIQUE KEY uq_category_name_lab_id (category_name, lab_id),
    INDEX idx_category_lab_id (lab_id),
    INDEX idx_category_added_by (added_by),
    INDEX idx_category_is_active (is_active),
    FOREIGN KEY fk_category_lab (lab_id) REFERENCES labs(lab_id) ON DELETE CASCADE,
    FOREIGN KEY fk_category_added_by (added_by) REFERENCES lab_managers(manager_id) ON DELETE RESTRICT
);

CREATE TABLE lab_contacts (
    contact_id INT AUTO_INCREMENT,
    contact_uuid CHAR(36) NOT NULL,
    lab_id INT NOT NULL,
    contact_type ENUM('phone', 'email', 'address') NOT NULL,
    value VARCHAR(255) NOT NULL,
    label VARCHAR(50), -- e.g., "primary", "support"
    is_primary TINYINT DEFAULT '0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (contact_id),
    UNIQUE KEY uq_contact_uuid (contact_uuid),
    INDEX idx_contact_lab_id (lab_id),
    FOREIGN KEY fk_contact_lab (lab_id) REFERENCES labs(lab_id) ON DELETE CASCADE,
    CONSTRAINT chk_contact_type CHECK (contact_type IN ('phone', 'email', 'address'))
);

CREATE TABLE lab_operating_hours (
    hours_id INT AUTO_INCREMENT,
    hours_uuid CHAR(36) NOT NULL,
    lab_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (hours_id),
    UNIQUE KEY uq_hours_uuid (hours_uuid),
    UNIQUE KEY uq_hours_lab_day (lab_id, day_of_week),
    FOREIGN KEY fk_hours_lab (lab_id) REFERENCES labs(lab_id) ON DELETE CASCADE
);

CREATE TABLE lab_tests (
    test_id INT AUTO_INCREMENT,
    test_uuid CHAR(36) NOT NULL,
    lab_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    common_name VARCHAR(255),
    test_category_id INT NOT NULL,
    test_image VARCHAR(255),
    description TEXT,
    preparation_details TEXT,
    result_explanation TEXT,
    test_type ENUM('blood', 'urine', 'imaging', 'genetic', 'other') NOT NULL,
    estimated_completion_time VARCHAR(50),
    e_record_completion_time VARCHAR(50),
    is_active TINYINT DEFAULT '1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (test_id),
    UNIQUE KEY uq_test_uuid (test_uuid),
    INDEX idx_test_lab_id (lab_id),
    INDEX idx_test_category_id (test_category_id),
    INDEX idx_test_is_active (is_active),
    FULLTEXT INDEX ft_test_name_desc (name, description),
    FOREIGN KEY fk_test_lab (lab_id) REFERENCES labs(lab_id) ON DELETE CASCADE,
    FOREIGN KEY fk_test_category (test_category_id) REFERENCES lab_test_categories(test_category_id) ON DELETE CASCADE
);

CREATE TABLE lab_test_pricing (
    price_id INT AUTO_INCREMENT,
    price_uuid CHAR(36) NOT NULL,
    test_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_home_pickup TINYINT DEFAULT '0',
    effective_from DATETIME NOT NULL,
    effective_to DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (price_id),
    UNIQUE KEY uq_price_uuid (price_uuid),
    INDEX idx_price_test_id (test_id),
    FOREIGN KEY fk_price_test (test_id) REFERENCES lab_tests(test_id) ON DELETE CASCADE
);

CREATE TABLE lab_test_requests (
    request_id INT AUTO_INCREMENT,
    request_uuid CHAR(36) NOT NULL,
    price_id INT NOT NULL,
    appointment_id INT,
    patient_id INT NOT NULL,
    doctor_id INT,
    requested_by ENUM('patient', 'doctor', 'lab_manager') NOT NULL,
    request_date DATETIME NOT NULL,
    additional_notes TEXT,
    status ENUM(
        'pending',
        'confirmed',
        'sample_collected',
        'in_progress',
        'results_ready',
        'completed',
        'cancelled',
        'rescheduled'
    ) DEFAULT 'pending',
    conducted_by INT,
    priority ENUM('normal', 'urgent') DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (request_id),
    UNIQUE KEY uq_request_uuid (request_uuid),
    INDEX idx_request_price_id (price_id),
    INDEX idx_request_patient_id (patient_id),
    INDEX idx_request_doctor_id (doctor_id),
    INDEX idx_request_status (status),
    INDEX idx_request_payment_status (payment_status),
    FOREIGN KEY fk_request_price (price_id) REFERENCES lab_test_pricing(price_id) ON DELETE CASCADE,
    FOREIGN KEY fk_request_conducted_by (conducted_by) REFERENCES lab_managers(manager_id) ON DELETE CASCADE,
    FOREIGN KEY fk_request_patient (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY fk_request_doctor (doctor_id) REFERENCES doctors(doctor_id) ON DELETE SET NULL,
    FOREIGN KEY fk_request_appointment (appointment_id) REFERENCES medical_appointments(appointment_id) ON DELETE SET NULL
);

CREATE TABLE lab_request_notes (
    note_id INT AUTO_INCREMENT,
    note_uuid CHAR(36) NOT NULL,
    request_id INT NOT NULL,
    user_id INT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id),
    UNIQUE KEY uq_note_uuid (note_uuid),
    INDEX idx_note_request_id (request_id),
    INDEX idx_note_user_id (user_id),
    FOREIGN KEY fk_note_request (request_id) REFERENCES lab_test_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY fk_note_user (user_id) REFERENCES lab_managers(manager_id) ON DELETE CASCADE
);

CREATE TABLE lab_test_results (
    result_id INT AUTO_INCREMENT,
    results_uuid CHAR(36) NOT NULL,
    request_id INT NOT NULL,
    patient_id INT NOT NULL,
    result_status ENUM('draft', 'final', 'revised') DEFAULT 'draft',
    result_file_url VARCHAR(255),
    result_values JSON,
    comment TEXT,
    issued_by INT,
    issued_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (result_id),
    UNIQUE KEY uq_results_uuid (results_uuid),
    UNIQUE KEY uq_result_request_id (request_id),
    INDEX idx_results_patient_id (patient_id),
    INDEX idx_results_issued_by (issued_by),
    FOREIGN KEY fk_results_request (request_id) REFERENCES lab_test_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY fk_results_issued_by (issued_by) REFERENCES lab_managers(manager_id) ON DELETE SET NULL,
    FOREIGN KEY fk_results_patient (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

CREATE TABLE lab_test_payments (
    payment_id INT AUTO_INCREMENT,
    payment_uuid CHAR(36) NOT NULL,
    request_id INT NOT NULL,
    payment_method ENUM('mobile_money') NOT NULL,
    transaction_id VARCHAR(255),
    transaction_token VARCHAR(255),
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
    payment_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (payment_id),
    UNIQUE KEY uq_payment_uuid (payment_uuid),
    UNIQUE KEY uq_payment_request_id (request_id),
    INDEX idx_payment_status (payment_status),
    FOREIGN KEY fk_payment_request (request_id) REFERENCES lab_test_requests(request_id) ON DELETE CASCADE
);

CREATE TABLE lab_withdrawal_requests (
  request_id INT PRIMARY KEY AUTO_INCREMENT,
  withdrawal_uuid CHAR(36) NOT NULL UNIQUE,
  lab_id INT NOT NULL,
  manager_id INT NOT NULL,
  order_id VARCHAR(255) NOT NULL UNIQUE,
  amount DECIMAL(18, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'SLL',
  payment_type ENUM('mobile_money') NOT NULL,
  finance_account_id VARCHAR(255),
  transaction_reference VARCHAR(255),
  mobile_money_provider ENUM('orange_money', 'afri_money') NOT NULL,
  mobile_number VARCHAR(255),
  status ENUM('initiated', 'pending', 'success', 'failed') NOT NULL DEFAULT 'initiated',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY fk_withdrawal_lab (lab_id) REFERENCES labs(lab_id) ON DELETE CASCADE,
  FOREIGN KEY fk_withdrawal_manager (manager_id) REFERENCES lab_managers(manager_id) ON DELETE CASCADE,
  INDEX idx_withdrawal_lab_id (lab_id),
  INDEX idx_withdrawal_manager_id (manager_id),
  INDEX idx_withdrawal_status (status)
);

CREATE TABLE lab_wallets (
    wallet_id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_uuid CHAR(36) NOT NULL UNIQUE,
    lab_id INT NOT NULL UNIQUE, -- One wallet per lab
    balance DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY fk_wallet_lab (lab_id) REFERENCES labs(lab_id) ON DELETE CASCADE
);

--
-- Logs every transaction (credit or debit) for a lab's wallet.
--
CREATE TABLE lab_wallet_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_uuid CHAR(36) NOT NULL UNIQUE,
    wallet_id INT NOT NULL,
    transaction_type ENUM('credit', 'debit') NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    source_type ENUM('payment', 'withdrawal') NOT NULL,
    source_id INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY fk_transaction_wallet (wallet_id) REFERENCES lab_wallets(wallet_id) ON DELETE CASCADE
);

