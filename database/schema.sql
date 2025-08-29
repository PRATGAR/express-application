-- SecureBank Database Schema

CREATE DATABASE IF NOT EXISTS securebank;
USE securebank;

-- Users table for authentication
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin', 'manager') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Customers table for customer management
CREATE TABLE customers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    ssn_last_four VARCHAR(4),
    account_status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    credit_score INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_name (name),
    INDEX idx_phone (phone),
    INDEX idx_status (account_status)
);

-- Accounts table for banking accounts
CREATE TABLE accounts (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type ENUM('checking', 'savings', 'credit', 'loan') NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('active', 'inactive', 'frozen') DEFAULT 'active',
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_account_number (account_number),
    INDEX idx_account_type (account_type)
);

-- Transactions table for financial transactions
CREATE TABLE transactions (
    id VARCHAR(36) PRIMARY KEY,
    from_account VARCHAR(36),
    to_account VARCHAR(36),
    account_id VARCHAR(36),
    transaction_type ENUM('transfer', 'deposit', 'withdrawal', 'payment', 'fee') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    note TEXT,
    note_html TEXT,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    reference_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    note_updated TIMESTAMP NULL,
    INDEX idx_from_account (from_account),
    INDEX idx_to_account (to_account),
    INDEX idx_account_id (account_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Documents table for document management
CREATE TABLE documents (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100),
    document_type ENUM('statement', 'tax', 'contract', 'identity', 'other') DEFAULT 'other',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE NULL,
    access_level ENUM('public', 'private', 'restricted') DEFAULT 'private',
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_document_type (document_type),
    INDEX idx_upload_date (upload_date)
);

-- Reports table for report tracking
CREATE TABLE reports (
    id VARCHAR(36) PRIMARY KEY,
    report_type VARCHAR(100) NOT NULL,
    generated_by VARCHAR(36),
    command TEXT,
    parameters JSON,
    file_path TEXT,
    status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    error_message TEXT NULL,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_report_type (report_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Audit log table for security tracking
CREATE TABLE audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(36),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Insert sample data
INSERT INTO users (id, name, email, password, role) VALUES
('user-1', 'John Doe', 'john.doe@securebank.com', '$2b$10$example.hash.here', 'customer'),
('user-2', 'Jane Smith', 'jane.smith@securebank.com', '$2b$10$example.hash.here', 'customer'),
('admin-1', 'Admin User', 'admin@securebank.com', '$2b$10$example.hash.here', 'admin');

INSERT INTO customers (id, name, email, phone, address, account_status, credit_score) VALUES
('cust-1', 'John Doe', 'john.doe@securebank.com', '(555) 123-4567', '123 Main St, Anytown, USA', 'active', 750),
('cust-2', 'Jane Smith', 'jane.smith@securebank.com', '(555) 987-6543', '456 Oak Ave, Another City, USA', 'active', 820),
('cust-3', 'Bob Johnson', 'bob.johnson@email.com', '(555) 246-8135', '789 Pine St, Somewhere, USA', 'active', 680);

INSERT INTO accounts (id, customer_id, account_number, account_type, balance) VALUES
('acc-1', 'cust-1', '1001234567890', 'checking', 5420.75),
('acc-2', 'cust-1', '1001234567891', 'savings', 12850.00),
('acc-3', 'cust-2', '1002345678901', 'checking', 3210.50),
('acc-4', 'cust-2', '1002345678902', 'savings', 25600.25);

INSERT INTO transactions (id, from_account, to_account, account_id, transaction_type, amount, description, status) VALUES
('txn-1', 'acc-1', 'acc-3', 'acc-1', 'transfer', -500.00, 'Monthly rent payment', 'completed'),
('txn-2', NULL, 'acc-1', 'acc-1', 'deposit', 2500.00, 'Salary deposit', 'completed'),
('txn-3', 'acc-2', NULL, 'acc-2', 'withdrawal', -200.00, 'ATM withdrawal', 'completed'),
('txn-4', 'acc-3', 'acc-4', 'acc-3', 'transfer', -1000.00, 'Savings transfer', 'pending');