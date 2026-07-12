-- Seed data for EcoSphere ESG Management Platform

-- Departments
INSERT INTO departments (name, code, head, employees, status) VALUES
('Manufacturing', 'MFG', 'S. Nair', 214, 'Active'),
('Sales', 'SLS', 'V. Kapoor', 96, 'Active'),
('Logistics', 'LOG', 'A. Roy', 58, 'Active'),
('Corporate', 'COR', 'N. Desai', 41, 'Active'),
('R&D', 'RND', 'P. Menon', 73, 'Active')
ON CONFLICT (code) DO NOTHING;

-- Categories
INSERT INTO categories (name, type, status) VALUES
('Tree Plantation', 'CSR Activity', 'Active'),
('Blood Donation', 'CSR Activity', 'Active'),
('Recycling', 'Challenge', 'Active'),
('Commute', 'Challenge', 'Active');

-- Emission Factors
INSERT INTO emission_factors (category, unit, factor, source, status) VALUES
('Diesel (fleet)', 'litre', '2.68 kg CO₂e', 'DEFRA 2026', 'Active'),
('Grid electricity', 'kWh', '0.71 kg CO₂e', 'CEA India', 'Active'),
('Air travel (domestic)', 'passenger-km', '0.15 kg CO₂e', 'DEFRA 2026', 'Active'),
('Packaging (cardboard)', 'kg', '0.94 kg CO₂e', 'Internal LCA', 'Draft'),
('Natural gas', 'm³', '2.03 kg CO₂e', 'DEFRA 2026', 'Active');

-- Product ESG Profiles
INSERT INTO product_profiles (product, footprint, recyclable, cert) VALUES
('EcoLine Packaging A2', '0.42 kg CO₂e / unit', '92%', 'FSC Certified'),
('Industrial Component X9', '3.1 kg CO₂e / unit', '48%', '—'),
('Retail Bag – Kraft', '0.08 kg CO₂e / unit', '100%', 'Compostable');

-- Environmental Goals
INSERT INTO environmental_goals (name, dept, target, current, unit, deadline, status) VALUES
('Reduce fleet emissions', 'Logistics', 500, 390, 't CO₂e', '31 Dec 2026', 'Active'),
('Cut packaging waste', 'Manufacturing', 120, 98, 't', '30 Sep 2026', 'On track'),
('Office energy cut', 'Corporate', 80, 80, 'MWh', '30 Jun 2026', 'Completed'),
('Water usage reduction', 'R&D', 40, 22, 'kL', '31 Oct 2026', 'Active'),
('Renewable energy adoption', 'Corporate', 60, 34, '%', '31 Mar 2027', 'At risk');

-- ESG Policies
INSERT INTO policies (name, owner, version, updated) VALUES
('Anti-Corruption Policy', 'Legal', 'v3.2', '12 Mar 2026'),
('Data Privacy Policy', 'IT Governance', 'v2.0', '01 Feb 2026'),
('Code of Conduct', 'HR', 'v4.1', '18 May 2026'),
('Whistleblower Policy', 'Legal', 'v1.4', '22 Jan 2026');

-- Policy Acknowledgements
INSERT INTO policy_acknowledgements (dept, acknowledged) VALUES
('Manufacturing', 96),
('Sales', 88),
('Logistics', 79),
('Corporate', 100),
('R&D', 91);

-- Audits
INSERT INTO audits (title, dept, auditor, date, findings, status) VALUES
('Q2 waste audit', 'Manufacturing', 'S. Nair', '12 Jun 2026', '3 minor issues', 'Completed'),
('Vendor compliance check', 'Procurement', 'R. Iyer', '01 Jul 2026', '1 open issue', 'Under review'),
('Data handling review', 'IT', 'M. Fernandes', '22 Jun 2026', 'No issues', 'Completed');

-- Compliance Issues
INSERT INTO compliance_issues (issue, severity, dept, owner, due, status) VALUES
('Missing MSDS sheets', 'High', 'Manufacturing', 'S. Nair', '2026-07-20', 'Open'),
('Late vendor disclosure', 'Medium', 'Procurement', 'R. Iyer', '2026-07-05', 'Resolved'),
('Incomplete audit trail', 'Low', 'IT', 'M. Fernandes', '2026-07-30', 'Open');

-- Challenges
INSERT INTO challenges (name, xp, difficulty, deadline, status, category) VALUES
('Sustainability Sprint', 200, 'Hard', '20 Jul', 'Active', 'Environmental'),
('Recycle Challenge', 80, 'Easy', '15 Jul', 'Active', 'Environmental'),
('Commute Green Week', 120, 'Medium', '25 Jul', 'Draft', 'Social'),
('Paperless July', 60, 'Easy', '31 Jul', 'Under review', 'Governance'),
('Energy Watch Q2', 150, 'Medium', '30 Jun', 'Completed', 'Environmental');

-- Badges
INSERT INTO badges (name, rule, icon) VALUES
('Green Beginner', 'Earn 100 XP', 'Sparkles'),
('Carbon Saver', 'Complete 3 environmental challenges', 'Leaf'),
('Sustainability Champion', 'Earn 2,000 XP', 'Crown'),
('Team Player', 'Join 5 CSR activities', 'Medal');

-- Rewards
INSERT INTO rewards (name, points, stock) VALUES
('Eco tumbler', 150, 34),
('Extra WFH day', 300, 12),
('Plant-a-tree donation', 100, 999),
('Amazon voucher ₹1,000', 800, 6);

-- Employees
INSERT INTO employees (name, email, xp, points) VALUES
('Nisha Patel', 'nisha@ecosphere.com', 2450, 640),
('Priya Menon', 'priya@ecosphere.com', 1200, 430),
('Aditi Rao', 'aditi@ecosphere.com', 1800, 520),
('Rohan Verma', 'rohan@ecosphere.com', 950, 210),
('Karan Shah', 'karan@ecosphere.com', 3120, 890);

-- CSR Activities
INSERT INTO csr_activities (name, icon, joined, evidence, tone) VALUES
('Tree plantation', 'TreePine', 24, true, 'env'),
('Blood donation drive', 'HeartPulse', 18, true, 'social'),
('Beach cleanup', 'Waves', 31, false, 'env'),
('ESG workshop', 'GraduationCap', 52, false, 'social');

-- Employee CSR Participation Queue
INSERT INTO participation (emp, activity, proof, points, status) VALUES
('Aditi Rao', 'Tree plantation', 'photo.jpg', 50, 'Pending'),
('Karan Shah', 'ESG workshop', 'cert.pdf', 30, 'Approved'),
('Rohan Verma', 'Blood donation drive', 'receipt.pdf', 40, 'Pending'),
('Priya Menon', 'Beach cleanup', '—', 25, 'Approved');

-- Challenge Participation
INSERT INTO challenge_participation (challenge, emp, progress, proof, approval, xp) VALUES
('Sustainability Sprint', 'Aditi Rao', 80, 'log.pdf', 'Pending', 0),
('Recycle Challenge', 'Karan Shah', 100, 'photo.jpg', 'Approved', 80),
('Recycle Challenge', 'Rohan Verma', 60, '—', 'Pending', 0),
('Energy Watch Q2', 'Priya Menon', 100, 'report.pdf', 'Approved', 150);

-- Carbon Transactions
INSERT INTO carbon_transactions (date, dept, source, qty, co2e, mode) VALUES
('10 Jul', 'Logistics', 'Fleet', '1,240 L', '3.32 t', 'Auto'),
('10 Jul', 'Manufacturing', 'Purchase', '3,800 kg', '3.57 t', 'Auto'),
('09 Jul', 'Corporate', 'Expense', '6,120 kWh', '4.35 t', 'Auto'),
('08 Jul', 'R&D', 'Manufacturing', '410 m³', '0.83 t', 'Manual'),
('07 Jul', 'Sales', 'Fleet', '860 L', '2.30 t', 'Auto');

-- Configuration Settings
INSERT INTO settings_config (key, value) VALUES
('autoEmission', 'true'),
('evidence', 'true'),
('badgeAuto', 'true'),
('notifIssue', 'true'),
('notifApproval', 'true'),
('notifPolicy', 'false'),
('notifBadge', 'true'),
('weight_env', '40'),
('weight_social', '30'),
('weight_gov', '30')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Recent Activities / Notifications Seed
INSERT INTO notifications (title, message, tone, time, is_read) VALUES
('Priya completed ‘Zero Waste Week’', 'Priya Menon finished the challenge successfully.', 'env', '2h ago', false),
('New compliance issue raised in Logistics', 'A high-severity issue was logged during the fleet audit.', 'gov', '4h ago', false),
('42 new Carbon Transactions logged (auto)', 'Automatically calculated carbon footprints from ERP logs.', 'env', '6h ago', false),
('R&D acknowledged Anti-Corruption Policy', 'Data indicates full compliance of R&D department.', 'gov', '1d ago', false),
('Karan Shah unlocked ‘Carbon Saver’ badge', 'Unlock rule met: 3 environmental challenges completed.', 'game', '1d ago', false);
