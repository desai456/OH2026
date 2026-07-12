-- PostgreSQL DDL Schema for EcoSphere ESG Management Platform

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    head VARCHAR(255),
    employees INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active'
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'CSR Activity' or 'Challenge'
    status VARCHAR(50) DEFAULT 'Active'
);

-- Emission Factors table
CREATE TABLE IF NOT EXISTS emission_factors (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    factor VARCHAR(100) NOT NULL,
    source VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active'
);

-- Product ESG Profiles table
CREATE TABLE IF NOT EXISTS product_profiles (
    id SERIAL PRIMARY KEY,
    product VARCHAR(255) NOT NULL,
    footprint VARCHAR(255) NOT NULL,
    recyclable VARCHAR(50) NOT NULL,
    cert VARCHAR(255)
);

-- Environmental Goals table
CREATE TABLE IF NOT EXISTS environmental_goals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dept VARCHAR(255) NOT NULL,
    target NUMERIC NOT NULL,
    current NUMERIC NOT NULL,
    unit VARCHAR(50) NOT NULL,
    deadline VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active'
);

-- ESG Policies table
CREATE TABLE IF NOT EXISTS policies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    updated VARCHAR(50) NOT NULL
);

-- Policy Acknowledgements
CREATE TABLE IF NOT EXISTS policy_acknowledgements (
    id SERIAL PRIMARY KEY,
    dept VARCHAR(255) NOT NULL,
    acknowledged INTEGER NOT NULL
);

-- Audits table
CREATE TABLE IF NOT EXISTS audits (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    dept VARCHAR(255) NOT NULL,
    auditor VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    findings VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active'
);

-- Compliance Issues table
CREATE TABLE IF NOT EXISTS compliance_issues (
    id SERIAL PRIMARY KEY,
    issue VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    dept VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    due VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Open'
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    xp INTEGER NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    deadline VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft',
    category VARCHAR(255) NOT NULL
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rule VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NOT NULL
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    points INTEGER NOT NULL,
    stock INTEGER NOT NULL
);

-- Employees/Users table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    xp INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0
);

-- CSR Activities table
CREATE TABLE IF NOT EXISTS csr_activities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    joined INTEGER DEFAULT 0,
    evidence BOOLEAN DEFAULT FALSE,
    tone VARCHAR(50) DEFAULT 'env'
);

-- Employee CSR Participation table
CREATE TABLE IF NOT EXISTS participation (
    id SERIAL PRIMARY KEY,
    emp VARCHAR(255) NOT NULL,
    activity VARCHAR(255) NOT NULL,
    proof VARCHAR(255),
    points INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Pending'
);

-- Challenge Participation table
CREATE TABLE IF NOT EXISTS challenge_participation (
    id SERIAL PRIMARY KEY,
    challenge VARCHAR(255) NOT NULL,
    emp VARCHAR(255) NOT NULL,
    progress INTEGER DEFAULT 0,
    proof VARCHAR(255),
    approval VARCHAR(50) DEFAULT 'Pending',
    xp INTEGER DEFAULT 0
);

-- Carbon Transactions table
CREATE TABLE IF NOT EXISTS carbon_transactions (
    id SERIAL PRIMARY KEY,
    date VARCHAR(50) NOT NULL,
    dept VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    qty VARCHAR(50) NOT NULL,
    co2e VARCHAR(50) NOT NULL,
    mode VARCHAR(50) NOT NULL -- Auto or Manual
);

-- Settings/Configuration table
CREATE TABLE IF NOT EXISTS settings_config (
    key VARCHAR(255) PRIMARY KEY,
    value VARCHAR(255) NOT NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(255) NOT NULL,
    tone VARCHAR(50) DEFAULT 'env',
    time VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE
);
