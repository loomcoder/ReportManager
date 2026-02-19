-- ==================== HR & EMPLOYEE DATABASE ====================
-- Test Data Generated: 2026-01-27
-- Tables: HR, Employees, Finance, Sales

-- ==================== HR MODULE ====================

DROP TABLE IF EXISTS departments CASCADE;
CREATE TABLE departments (
    DeptID INT PRIMARY KEY,
    DeptName VARCHAR(100) NOT NULL,
    Manager VARCHAR(100),
    Location VARCHAR(50)
);

DROP TABLE IF EXISTS job_titles CASCADE;
CREATE TABLE job_titles (
    JobID INT PRIMARY KEY,
    JobTitle VARCHAR(100) NOT NULL,
    DeptID INT NOT NULL,
    SalaryMin INT,
    SalaryMax INT,
    FOREIGN KEY (DeptID) REFERENCES departments(DeptID)
);

-- ==================== EMPLOYEE MODULE ====================

DROP TABLE IF EXISTS employees CASCADE;
CREATE TABLE employees (
    EmpID INT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100),
    Phone VARCHAR(15),
    DeptID INT NOT NULL,
    JobID INT NOT NULL,
    HireDate DATE,
    Salary DECIMAL(10,2),
    EmploymentStatus VARCHAR(20),
    Gender CHAR(1),
    Age INT,
    FOREIGN KEY (DeptID) REFERENCES departments(DeptID),
    FOREIGN KEY (JobID) REFERENCES job_titles(JobID)
);

DROP TABLE IF EXISTS attendance CASCADE;
CREATE TABLE attendance (
    AttendanceID INT PRIMARY KEY,
    EmpID INT NOT NULL,
    Date DATE,
    Status VARCHAR(20),
    CheckInTime VARCHAR(10),
    CheckOutTime VARCHAR(10),
    FOREIGN KEY (EmpID) REFERENCES employees(EmpID)
);

-- ==================== SALES MODULE ====================

DROP TABLE IF EXISTS customers CASCADE;
CREATE TABLE customers (
    CustomerID INT PRIMARY KEY,
    CustomerName VARCHAR(100) NOT NULL,
    Email VARCHAR(100),
    Phone VARCHAR(15),
    City VARCHAR(50),
    Country VARCHAR(50),
    Industry VARCHAR(50),
    Status VARCHAR(20),
    CreatedDate DATE
);

DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products (
    ProductID INT PRIMARY KEY,
    ProductName VARCHAR(100) NOT NULL,
    Price DECIMAL(10,2)
);

DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
    OrderID INT PRIMARY KEY,
    CustomerID INT NOT NULL,
    OrderDate DATE,
    DeliveryDate DATE,
    OrderValue DECIMAL(12,2),
    Status VARCHAR(20),
    SalesPerson INT,
    FOREIGN KEY (CustomerID) REFERENCES customers(CustomerID),
    FOREIGN KEY (SalesPerson) REFERENCES employees(EmpID)
);

DROP TABLE IF EXISTS order_items CASCADE;
CREATE TABLE order_items (
    OrderItemID INT PRIMARY KEY,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL,
    ProductName VARCHAR(100),
    Quantity INT,
    UnitPrice DECIMAL(10,2),
    ItemTotal DECIMAL(12,2),
    FOREIGN KEY (OrderID) REFERENCES orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES products(ProductID)
);

DROP TABLE IF EXISTS payments CASCADE;
CREATE TABLE payments (
    PaymentID INT PRIMARY KEY,
    OrderID INT NOT NULL,
    Amount DECIMAL(12,2),
    PaymentDate DATE,
    PaymentMethod VARCHAR(50),
    Status VARCHAR(20),
    FOREIGN KEY (OrderID) REFERENCES orders(OrderID)
);

-- ==================== FINANCE MODULE ====================

DROP TABLE IF EXISTS accounts CASCADE;
CREATE TABLE accounts (
    AccountID INT PRIMARY KEY,
    AccountCode VARCHAR(20),
    AccountName VARCHAR(100) NOT NULL,
    AccountType VARCHAR(50)
);

DROP TABLE IF EXISTS transactions CASCADE;
CREATE TABLE transactions (
    TransactionID INT PRIMARY KEY,
    Date DATE,
    DebitAccountID INT NOT NULL,
    DebitAccountName VARCHAR(100),
    CreditAccountID INT NOT NULL,
    CreditAccountName VARCHAR(100),
    Amount DECIMAL(12,2),
    Description VARCHAR(200),
    Reference VARCHAR(50),
    FOREIGN KEY (DebitAccountID) REFERENCES accounts(AccountID),
    FOREIGN KEY (CreditAccountID) REFERENCES accounts(AccountID)
);

DROP TABLE IF EXISTS invoices CASCADE;
CREATE TABLE invoices (
    InvoiceID INT PRIMARY KEY,
    OrderID INT NOT NULL,
    CustomerID INT NOT NULL,
    InvoiceDate DATE,
    DueDate DATE,
    InvoiceAmount DECIMAL(12,2),
    PaidAmount DECIMAL(12,2),
    Status VARCHAR(20),
    FOREIGN KEY (OrderID) REFERENCES orders(OrderID),
    FOREIGN KEY (CustomerID) REFERENCES customers(CustomerID)
);

DROP TABLE IF EXISTS expenses CASCADE;
CREATE TABLE expenses (
    ExpenseID INT PRIMARY KEY,
    EmpID INT NOT NULL,
    ExpenseDate DATE,
    Category VARCHAR(50),
    Amount DECIMAL(10,2),
    Description VARCHAR(200),
    Status VARCHAR(20),
    FOREIGN KEY (EmpID) REFERENCES employees(EmpID)
);

-- ==================== INSERT DATA ====================


-- departments
INSERT INTO departments (DeptID, DeptName, Manager, Location) VALUES (1, 'Engineering', 'Rajesh Kumar', 'Pune');
INSERT INTO departments (DeptID, DeptName, Manager, Location) VALUES (2, 'Sales', 'Priya Sharma', 'Mumbai');
INSERT INTO departments (DeptID, DeptName, Manager, Location) VALUES (3, 'Finance', 'Amit Patel', 'Bangalore');
INSERT INTO departments (DeptID, DeptName, Manager, Location) VALUES (4, 'HR', 'Neha Singh', 'Pune');
INSERT INTO departments (DeptID, DeptName, Manager, Location) VALUES (5, 'Operations', 'Vikram Desai', 'Chennai');

-- job_titles
INSERT INTO job_titles (JobID, JobTitle, DeptID, SalaryMin, SalaryMax) VALUES (1, 'Senior Software Engineer', 1, 80000, 150000);
INSERT INTO job_titles (JobID, JobTitle, DeptID, SalaryMin, SalaryMax) VALUES (2, 'Software Developer', 1, 50000, 90000);
INSERT INTO job_titles (JobID, JobTitle, DeptID, SalaryMin, SalaryMax) VALUES (3, 'Sales Executive', 2, 40000, 70000);
INSERT INTO job_titles (JobID, JobTitle, DeptID, SalaryMin, SalaryMax) VALUES (4, 'Senior Sales Manager', 2, 70000, 120000);
INSERT INTO job_titles (JobID, JobTitle, DeptID, SalaryMin, SalaryMax) VALUES (5, 'Finance Analyst', 3, 50000, 85000);
INSERT INTO job_titles (JobID, JobTitle, DeptID, SalaryMin, SalaryMax) VALUES (6, 'Finance Manager', 3, 75000, 130000);
INSERT INTO job_titles (JobID, JobTitle, DeptID, SalaryMin, SalaryMax) VALUES (7, 'HR Specialist', 4, 45000, 75000);
INSERT INTO job_titles (JobID, JobTitle, DeptID, SalaryMin, SalaryMax) VALUES (8, 'Operations Coordinator', 5, 35000, 60000);

-- employees
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1001, 'Nikhil', 'Kumar', 'emp1001@company.com', '917599355172', 5, 8, '2020-11-05', 40604, 'On Leave', 'M', 56);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1002, 'Amit', 'Chopra', 'emp1002@company.com', '916299389488', 4, 7, '2020-12-11', 61115, 'Inactive', 'M', 38);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1003, 'Aisha', 'Rao', 'emp1003@company.com', '917256117995', 3, 5, '2023-09-05', 67844, 'Active', 'F', 48);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1004, 'Zara', 'Rao', 'emp1004@company.com', '919636972318', 3, 6, '2023-07-26', 90839, 'Active', 'M', 53);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1005, 'Sana', 'Patel', 'emp1005@company.com', '919450280380', 4, 7, '2023-04-06', 48161, 'Active', 'F', 56);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1006, 'Neha', 'Desai', 'emp1006@company.com', '916270933654', 1, 1, '2020-12-21', 108380, 'Inactive', 'M', 48);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1007, 'Rohan', 'Patel', 'emp1007@company.com', '918931573723', 5, 8, '2023-11-03', 53417, 'On Leave', 'F', 25);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1008, 'Sana', 'Kumar', 'emp1008@company.com', '919655944799', 2, 4, '2022-12-25', 105158, 'Active', 'M', 50);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1009, 'Priya', 'Sharma', 'emp1009@company.com', '918848983959', 2, 3, '2020-11-23', 52263, 'Active', 'M', 43);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1010, 'Deepika', 'Malhotra', 'emp1010@company.com', '916888250770', 4, 7, '2022-01-09', 59664, 'Inactive', 'M', 56);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1011, 'Sana', 'Nair', 'emp1011@company.com', '917533602672', 5, 8, '2020-02-17', 46152, 'Active', 'F', 29);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1012, 'Amit', 'Kumar', 'emp1012@company.com', '919147860312', 1, 2, '2021-05-28', 51160, 'On Leave', 'M', 57);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1013, 'Nikhil', 'Singh', 'emp1013@company.com', '917823663488', 5, 8, '2022-07-28', 56750, 'On Leave', 'F', 58);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1014, 'Vikram', 'Singh', 'emp1014@company.com', '919086644865', 5, 8, '2021-08-24', 37248, 'Inactive', 'M', 46);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1015, 'Zara', 'Malhotra', 'emp1015@company.com', '917415756593', 3, 6, '2021-12-25', 91423, 'Active', 'M', 56);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1016, 'Priya', 'Patel', 'emp1016@company.com', '916626121812', 5, 8, '2023-07-29', 38295, 'Inactive', 'F', 41);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1017, 'Arjun', 'Desai', 'emp1017@company.com', '917460084626', 2, 3, '2020-04-29', 50497, 'Active', 'F', 49);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1018, 'Zara', 'Sharma', 'emp1018@company.com', '917656073898', 4, 7, '2022-11-25', 61649, 'Active', 'M', 54);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1019, 'Neha', 'Patel', 'emp1019@company.com', '917489299578', 3, 6, '2023-11-27', 98933, 'Active', 'F', 40);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1020, 'Aisha', 'Patel', 'emp1020@company.com', '918146016972', 2, 4, '2022-10-21', 93302, 'Active', 'F', 48);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1021, 'Sana', 'Malhotra', 'emp1021@company.com', '918678829358', 5, 8, '2023-05-19', 43138, 'Inactive', 'F', 60);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1022, 'Rajesh', 'Nair', 'emp1022@company.com', '917173813353', 4, 7, '2021-12-04', 58161, 'Inactive', 'F', 35);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1023, 'Vikram', 'Khan', 'emp1023@company.com', '917179645488', 4, 7, '2020-08-13', 52198, 'Inactive', 'M', 43);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1024, 'Zara', 'Verma', 'emp1024@company.com', '917758731753', 3, 6, '2023-09-25', 96912, 'Active', 'F', 47);
INSERT INTO employees (EmpID, FirstName, LastName, Email, Phone, DeptID, JobID, HireDate, Salary, EmploymentStatus, Gender, Age) VALUES (1025, 'Arjun', 'Singh', 'emp1025@company.com', '917298094193', 1, 2, '2023-04-23', 85359, 'Active', 'F', 52);

-- attendance
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (1, 1001, '2026-01-01', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (2, 1001, '2026-01-02', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (3, 1001, '2026-01-03', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (4, 1001, '2026-01-04', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (5, 1001, '2026-01-05', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (6, 1001, '2026-01-06', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (7, 1001, '2026-01-07', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (8, 1001, '2026-01-08', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (9, 1001, '2026-01-09', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (10, 1001, '2026-01-10', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (11, 1001, '2026-01-11', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (12, 1001, '2026-01-12', 'Leave', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (13, 1001, '2026-01-13', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (14, 1001, '2026-01-14', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (15, 1001, '2026-01-15', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (16, 1001, '2026-01-16', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (17, 1001, '2026-01-17', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (18, 1001, '2026-01-18', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (19, 1001, '2026-01-19', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (20, 1001, '2026-01-20', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (21, 1002, '2026-01-01', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (22, 1002, '2026-01-02', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (23, 1002, '2026-01-03', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (24, 1002, '2026-01-04', 'Absent', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (25, 1002, '2026-01-05', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (26, 1002, '2026-01-06', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (27, 1002, '2026-01-07', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (28, 1002, '2026-01-08', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (29, 1002, '2026-01-09', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (30, 1002, '2026-01-10', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (31, 1002, '2026-01-11', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (32, 1002, '2026-01-12', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (33, 1002, '2026-01-13', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (34, 1002, '2026-01-14', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (35, 1002, '2026-01-15', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (36, 1002, '2026-01-16', 'Leave', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (37, 1002, '2026-01-17', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (38, 1002, '2026-01-18', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (39, 1002, '2026-01-19', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (40, 1002, '2026-01-20', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (41, 1003, '2026-01-01', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (42, 1003, '2026-01-02', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (43, 1003, '2026-01-03', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (44, 1003, '2026-01-04', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (45, 1003, '2026-01-05', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (46, 1003, '2026-01-06', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (47, 1003, '2026-01-07', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (48, 1003, '2026-01-08', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (49, 1003, '2026-01-09', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (50, 1003, '2026-01-10', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (51, 1003, '2026-01-11', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (52, 1003, '2026-01-12', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (53, 1003, '2026-01-13', 'Absent', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (54, 1003, '2026-01-14', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (55, 1003, '2026-01-15', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (56, 1003, '2026-01-16', 'Absent', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (57, 1003, '2026-01-17', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (58, 1003, '2026-01-18', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (59, 1003, '2026-01-19', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (60, 1003, '2026-01-20', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (61, 1004, '2026-01-01', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (62, 1004, '2026-01-02', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (63, 1004, '2026-01-03', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (64, 1004, '2026-01-04', 'Absent', NULL, NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (65, 1004, '2026-01-05', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (66, 1004, '2026-01-06', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (67, 1004, '2026-01-07', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (68, 1004, '2026-01-08', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (69, 1004, '2026-01-09', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (70, 1004, '2026-01-10', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (71, 1004, '2026-01-11', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (72, 1004, '2026-01-12', 'Leave', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (73, 1004, '2026-01-13', 'Absent', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (74, 1004, '2026-01-14', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (75, 1004, '2026-01-15', 'Present', NULL, NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (76, 1004, '2026-01-16', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (77, 1004, '2026-01-17', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (78, 1004, '2026-01-18', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (79, 1004, '2026-01-19', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (80, 1004, '2026-01-20', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (81, 1005, '2026-01-01', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (82, 1005, '2026-01-02', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (83, 1005, '2026-01-03', 'Absent', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (84, 1005, '2026-01-04', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (85, 1005, '2026-01-05', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (86, 1005, '2026-01-06', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (87, 1005, '2026-01-07', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (88, 1005, '2026-01-08', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (89, 1005, '2026-01-09', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (90, 1005, '2026-01-10', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (91, 1005, '2026-01-11', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (92, 1005, '2026-01-12', 'Absent', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (93, 1005, '2026-01-13', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (94, 1005, '2026-01-14', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (95, 1005, '2026-01-15', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (96, 1005, '2026-01-16', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (97, 1005, '2026-01-17', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (98, 1005, '2026-01-18', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (99, 1005, '2026-01-19', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (100, 1005, '2026-01-20', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (101, 1006, '2026-01-01', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (102, 1006, '2026-01-02', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (103, 1006, '2026-01-03', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (104, 1006, '2026-01-04', 'Present', NULL, NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (105, 1006, '2026-01-05', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (106, 1006, '2026-01-06', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (107, 1006, '2026-01-07', 'Absent', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (108, 1006, '2026-01-08', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (109, 1006, '2026-01-09', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (110, 1006, '2026-01-10', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (111, 1006, '2026-01-11', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (112, 1006, '2026-01-12', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (113, 1006, '2026-01-13', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (114, 1006, '2026-01-14', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (115, 1006, '2026-01-15', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (116, 1006, '2026-01-16', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (117, 1006, '2026-01-17', 'Leave', NULL, NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (118, 1006, '2026-01-18', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (119, 1006, '2026-01-19', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (120, 1006, '2026-01-20', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (121, 1007, '2026-01-01', 'Present', NULL, NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (122, 1007, '2026-01-02', 'Absent', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (123, 1007, '2026-01-03', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (124, 1007, '2026-01-04', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (125, 1007, '2026-01-05', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (126, 1007, '2026-01-06', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (127, 1007, '2026-01-07', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (128, 1007, '2026-01-08', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (129, 1007, '2026-01-09', 'Absent', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (130, 1007, '2026-01-10', 'Leave', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (131, 1007, '2026-01-11', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (132, 1007, '2026-01-12', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (133, 1007, '2026-01-13', 'Leave', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (134, 1007, '2026-01-14', 'Leave', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (135, 1007, '2026-01-15', 'Leave', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (136, 1007, '2026-01-16', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (137, 1007, '2026-01-17', 'Absent', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (138, 1007, '2026-01-18', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (139, 1007, '2026-01-19', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (140, 1007, '2026-01-20', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (141, 1008, '2026-01-01', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (142, 1008, '2026-01-02', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (143, 1008, '2026-01-03', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (144, 1008, '2026-01-04', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (145, 1008, '2026-01-05', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (146, 1008, '2026-01-06', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (147, 1008, '2026-01-07', 'Leave', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (148, 1008, '2026-01-08', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (149, 1008, '2026-01-09', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (150, 1008, '2026-01-10', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (151, 1008, '2026-01-11', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (152, 1008, '2026-01-12', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (153, 1008, '2026-01-13', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (154, 1008, '2026-01-14', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (155, 1008, '2026-01-15', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (156, 1008, '2026-01-16', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (157, 1008, '2026-01-17', 'Present', NULL, NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (158, 1008, '2026-01-18', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (159, 1008, '2026-01-19', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (160, 1008, '2026-01-20', 'Absent', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (161, 1009, '2026-01-01', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (162, 1009, '2026-01-02', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (163, 1009, '2026-01-03', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (164, 1009, '2026-01-04', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (165, 1009, '2026-01-05', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (166, 1009, '2026-01-06', 'Leave', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (167, 1009, '2026-01-07', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (168, 1009, '2026-01-08', 'Absent', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (169, 1009, '2026-01-09', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (170, 1009, '2026-01-10', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (171, 1009, '2026-01-11', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (172, 1009, '2026-01-12', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (173, 1009, '2026-01-13', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (174, 1009, '2026-01-14', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (175, 1009, '2026-01-15', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (176, 1009, '2026-01-16', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (177, 1009, '2026-01-17', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (178, 1009, '2026-01-18', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (179, 1009, '2026-01-19', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (180, 1009, '2026-01-20', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (181, 1010, '2026-01-01', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (182, 1010, '2026-01-02', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (183, 1010, '2026-01-03', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (184, 1010, '2026-01-04', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (185, 1010, '2026-01-05', 'Present', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (186, 1010, '2026-01-06', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (187, 1010, '2026-01-07', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (188, 1010, '2026-01-08', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (189, 1010, '2026-01-09', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (190, 1010, '2026-01-10', 'Leave', NULL, '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (191, 1010, '2026-01-11', 'Present', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (192, 1010, '2026-01-12', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (193, 1010, '2026-01-13', 'Leave', '09:00', NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (194, 1010, '2026-01-14', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (195, 1010, '2026-01-15', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (196, 1010, '2026-01-16', 'Present', NULL, NULL);
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (197, 1010, '2026-01-17', 'Leave', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (198, 1010, '2026-01-18', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (199, 1010, '2026-01-19', 'Present', '09:00', '18:00');
INSERT INTO attendance (AttendanceID, EmpID, Date, Status, CheckInTime, CheckOutTime) VALUES (200, 1010, '2026-01-20', 'Present', '09:00', '18:00');

-- customers
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2001, 'Aisha Chopra', 'cust2001@email.com', '919429120127', 'Pune', 'India', 'Retail', 'Active', '2025-02-09');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2002, 'Aisha Malhotra', 'cust2002@email.com', '916199942662', 'Mumbai', 'India', 'Finance', 'Active', '2025-02-01');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2003, 'Arjun Nair', 'cust2003@email.com', '919504203520', 'Hyderabad', 'India', 'Manufacturing', 'Active', '2025-07-12');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2004, 'Deepika Kumar', 'cust2004@email.com', '919269357722', 'Hyderabad', 'India', 'Finance', 'Inactive', '2025-11-23');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2005, 'Priya Nair', 'cust2005@email.com', '919502898657', 'Hyderabad', 'India', 'Retail', 'Active', '2025-05-23');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2006, 'Vikram Sharma', 'cust2006@email.com', '919857312057', 'Bangalore', 'India', 'Healthcare', 'Active', '2025-02-19');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2007, 'Sana Gupta', 'cust2007@email.com', '917161254418', 'Pune', 'India', 'IT', 'Active', '2025-03-20');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2008, 'Nikhil Verma', 'cust2008@email.com', '918539438008', 'Mumbai', 'India', 'Finance', 'Active', '2025-03-03');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2009, 'Priya Kumar', 'cust2009@email.com', '917925668379', 'Pune', 'India', 'Retail', 'Active', '2025-11-01');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2010, 'Vikram Gupta', 'cust2010@email.com', '918495266426', 'Bangalore', 'India', 'Manufacturing', 'Active', '2025-05-13');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2011, 'Rajesh Sharma', 'cust2011@email.com', '918018905312', 'Mumbai', 'India', 'Healthcare', 'Active', '2025-02-22');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2012, 'Neha Nair', 'cust2012@email.com', '917783252153', 'Chennai', 'India', 'Retail', 'Active', '2025-12-04');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2013, 'Arjun Rao', 'cust2013@email.com', '916458137243', 'Delhi', 'India', 'Manufacturing', 'Inactive', '2025-10-07');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2014, 'Zara Kumar', 'cust2014@email.com', '919411598911', 'Pune', 'India', 'Manufacturing', 'Active', '2025-07-08');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2015, 'Amit Kumar', 'cust2015@email.com', '917158412375', 'Chennai', 'India', 'Finance', 'Active', '2025-10-31');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2016, 'Arjun Malhotra', 'cust2016@email.com', '917588426036', 'Pune', 'India', 'Finance', 'Active', '2025-08-02');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2017, 'Sana Khan', 'cust2017@email.com', '919080058668', 'Mumbai', 'India', 'Finance', 'Active', '2025-08-28');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2018, 'Priya Sharma', 'cust2018@email.com', '917064961886', 'Pune', 'India', 'Retail', 'Active', '2025-09-10');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2019, 'Vikram Verma', 'cust2019@email.com', '917007940237', 'Hyderabad', 'India', 'Retail', 'Inactive', '2025-06-25');
INSERT INTO customers (CustomerID, CustomerName, Email, Phone, City, Country, Industry, Status, CreatedDate) VALUES (2020, 'Arjun Chopra', 'cust2020@email.com', '917761455670', 'Delhi', 'India', 'Manufacturing', 'Inactive', '2025-07-26');

-- products
INSERT INTO products (ProductID, ProductName, Price) VALUES (101, 'Software License', 5000);
INSERT INTO products (ProductID, ProductName, Price) VALUES (102, 'Cloud Service', 2000);
INSERT INTO products (ProductID, ProductName, Price) VALUES (103, 'Consulting Hours', 1000);
INSERT INTO products (ProductID, ProductName, Price) VALUES (104, 'Support Package', 3000);
INSERT INTO products (ProductID, ProductName, Price) VALUES (105, 'Training Course', 4000);

-- orders
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5001, 2015, '2025-08-26', '2025-09-05', 99214.53, 'Completed', 1020);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5002, 2019, '2025-05-05', '2025-05-27', 71947.96, 'Completed', 1017);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5003, 2011, '2025-01-11', '2025-01-23', 28950.64, 'Completed', 1008);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5004, 2005, '2025-03-24', '2025-04-09', 13351.87, 'Pending', 1009);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5005, 2018, '2025-12-08', '2026-01-06', 46133.73, 'Completed', 1017);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5006, 2002, '2025-09-07', '2025-09-26', 52648.19, 'Completed', 1009);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5007, 2013, '2025-09-20', '2025-09-29', 74387.31, 'Pending', 1017);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5008, 2012, '2025-11-02', '2025-11-25', 15746.83, 'Completed', 1009);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5009, 2002, '2025-09-21', '2025-10-01', 63113.75, 'Completed', 1009);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5010, 2004, '2025-10-14', '2025-11-12', 83731.12, 'Completed', 1020);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5011, 2010, '2025-11-09', '2025-11-27', 83347.48, 'Completed', 1017);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5012, 2001, '2025-04-12', '2025-05-03', 17854.1, 'Pending', 1008);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5013, 2006, '2025-05-04', '2025-05-30', 16494.97, 'Cancelled', 1008);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5014, 2008, '2025-08-03', '2025-08-11', 76969.19, 'Completed', 1009);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5015, 2016, '2025-02-23', '2025-03-22', 96309.98, 'Completed', 1008);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5016, 2012, '2025-01-31', '2025-02-23', 88434.36, 'Completed', 1009);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5017, 2017, '2025-08-19', '2025-09-14', 64862.72, 'Cancelled', 1008);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5018, 2018, '2025-10-12', '2025-11-10', 11023.17, 'Completed', 1009);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5019, 2016, '2025-03-16', '2025-04-12', 42126.25, 'Completed', 1017);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5020, 2009, '2025-03-18', '2025-03-27', 64350.01, 'Completed', 1020);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5021, 2010, '2025-12-23', '2026-01-07', 52790.59, 'Cancelled', 1020);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5022, 2018, '2025-04-14', '2025-04-30', 33381.25, 'Pending', 1009);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5023, 2007, '2025-09-21', '2025-10-02', 81180.01, 'Completed', 1020);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5024, 2009, '2025-02-23', '2025-03-17', 55254.8, 'Pending', 1008);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5025, 2012, '2025-03-07', '2025-03-23', 25360.12, 'Completed', 1017);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5026, 2011, '2025-04-10', '2025-04-27', 93740.83, 'Pending', 1020);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5027, 2012, '2025-05-04', '2025-05-17', 10116.81, 'Cancelled', 1009);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5028, 2005, '2025-11-01', '2025-11-06', 96745.55, 'Completed', 1009);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5029, 2009, '2025-05-18', '2025-06-11', 47224.25, 'Pending', 1020);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5030, 2008, '2025-03-03', '2025-03-22', 47463.37, 'Pending', 1017);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5031, 2006, '2025-12-07', '2025-12-26', 78535.12, 'Completed', 1017);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5032, 2003, '2025-04-04', '2025-04-24', 23593.78, 'Pending', 1020);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5033, 2018, '2025-05-03', '2025-05-10', 39955.36, 'Completed', 1017);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5034, 2020, '2025-12-21', '2026-01-07', 75359.02, 'Pending', 1008);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5035, 2016, '2025-12-03', '2025-12-17', 9635.5, 'Completed', 1008);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5036, 2013, '2025-05-29', '2025-06-24', 76339.41, 'Cancelled', 1009);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5037, 2003, '2025-09-25', '2025-10-15', 20286.94, 'Completed', 1009);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5038, 2005, '2025-12-14', '2025-12-29', 67728.05, 'Pending', 1009);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5039, 2015, '2025-01-19', '2025-01-24', 86724.43, 'Pending', 1009);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5040, 2009, '2025-02-27', '2025-03-07', 55554.17, 'Cancelled', 1009);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5041, 2017, '2025-06-12', '2025-07-03', 85931.92, 'Completed', 1008);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5042, 2016, '2025-12-23', '2025-12-30', 27239.61, 'Pending', 1008);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5043, 2001, '2025-09-13', '2025-09-30', 74889.44, 'Completed', 1020);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5044, 2020, '2025-10-23', '2025-11-13', 46681.66, 'Completed', 1008);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5045, 2002, '2025-07-21', '2025-08-06', 56006.64, 'Pending', 1020);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5046, 2017, '2025-07-15', '2025-07-28', 14240.0, 'Completed', 1009);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5047, 2010, '2025-06-06', '2025-06-23', 84551.48, 'Completed', 1020);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5048, 2019, '2025-11-25', '2025-12-13', 42566.77, 'Completed', 1017);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5049, 2019, '2025-02-19', '2025-03-10', 94070.79, 'Cancelled', 1017);
INSERT INTO orders (OrderID, CustomerID, OrderDate, DeliveryDate, OrderValue, Status, SalesPerson) VALUES (5050, 2007, '2025-02-18', '2025-03-17', 54338.84, 'Cancelled', 1017);

-- order_items
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (1, 5001, 105, 'Training Course', 2, 4000, 8000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (2, 5001, 101, 'Software License', 4, 5000, 20000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (3, 5001, 103, 'Consulting Hours', 4, 1000, 4000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (4, 5001, 102, 'Cloud Service', 3, 2000, 6000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (5, 5002, 105, 'Training Course', 2, 4000, 8000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (6, 5002, 101, 'Software License', 2, 5000, 10000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (7, 5003, 104, 'Support Package', 4, 3000, 12000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (8, 5003, 101, 'Software License', 3, 5000, 15000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (9, 5003, 104, 'Support Package', 2, 3000, 6000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (10, 5003, 104, 'Support Package', 3, 3000, 9000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (11, 5004, 104, 'Support Package', 5, 3000, 15000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (12, 5004, 105, 'Training Course', 5, 4000, 20000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (13, 5004, 105, 'Training Course', 4, 4000, 16000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (14, 5005, 101, 'Software License', 5, 5000, 25000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (15, 5005, 102, 'Cloud Service', 4, 2000, 8000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (16, 5006, 104, 'Support Package', 2, 3000, 6000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (17, 5006, 101, 'Software License', 3, 5000, 15000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (18, 5006, 103, 'Consulting Hours', 4, 1000, 4000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (19, 5006, 103, 'Consulting Hours', 5, 1000, 5000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (20, 5007, 102, 'Cloud Service', 5, 2000, 10000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (21, 5008, 103, 'Consulting Hours', 1, 1000, 1000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (22, 5008, 104, 'Support Package', 4, 3000, 12000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (23, 5008, 105, 'Training Course', 5, 4000, 20000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (24, 5009, 101, 'Software License', 1, 5000, 5000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (25, 5009, 101, 'Software License', 2, 5000, 10000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (26, 5009, 104, 'Support Package', 3, 3000, 9000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (27, 5010, 103, 'Consulting Hours', 2, 1000, 2000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (28, 5010, 101, 'Software License', 4, 5000, 20000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (29, 5011, 104, 'Support Package', 4, 3000, 12000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (30, 5011, 105, 'Training Course', 4, 4000, 16000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (31, 5012, 105, 'Training Course', 1, 4000, 4000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (32, 5012, 103, 'Consulting Hours', 3, 1000, 3000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (33, 5012, 105, 'Training Course', 2, 4000, 8000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (34, 5012, 105, 'Training Course', 4, 4000, 16000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (35, 5013, 105, 'Training Course', 3, 4000, 12000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (36, 5013, 105, 'Training Course', 4, 4000, 16000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (37, 5013, 102, 'Cloud Service', 3, 2000, 6000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (38, 5013, 102, 'Cloud Service', 5, 2000, 10000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (39, 5014, 101, 'Software License', 1, 5000, 5000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (40, 5014, 101, 'Software License', 3, 5000, 15000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (41, 5014, 101, 'Software License', 5, 5000, 25000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (42, 5015, 101, 'Software License', 4, 5000, 20000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (43, 5015, 102, 'Cloud Service', 2, 2000, 4000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (44, 5015, 104, 'Support Package', 5, 3000, 15000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (45, 5016, 101, 'Software License', 4, 5000, 20000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (46, 5016, 105, 'Training Course', 1, 4000, 4000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (47, 5016, 101, 'Software License', 5, 5000, 25000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (48, 5016, 105, 'Training Course', 1, 4000, 4000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (49, 5017, 102, 'Cloud Service', 1, 2000, 2000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (50, 5017, 104, 'Support Package', 2, 3000, 6000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (51, 5017, 104, 'Support Package', 1, 3000, 3000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (52, 5017, 101, 'Software License', 1, 5000, 5000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (53, 5018, 103, 'Consulting Hours', 5, 1000, 5000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (54, 5018, 105, 'Training Course', 5, 4000, 20000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (55, 5018, 105, 'Training Course', 3, 4000, 12000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (56, 5018, 105, 'Training Course', 4, 4000, 16000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (57, 5019, 103, 'Consulting Hours', 2, 1000, 2000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (58, 5019, 104, 'Support Package', 5, 3000, 15000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (59, 5020, 102, 'Cloud Service', 4, 2000, 8000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (60, 5020, 104, 'Support Package', 1, 3000, 3000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (61, 5020, 105, 'Training Course', 1, 4000, 4000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (62, 5020, 105, 'Training Course', 1, 4000, 4000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (63, 5021, 101, 'Software License', 4, 5000, 20000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (64, 5021, 101, 'Software License', 5, 5000, 25000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (65, 5022, 102, 'Cloud Service', 5, 2000, 10000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (66, 5022, 101, 'Software License', 2, 5000, 10000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (67, 5022, 102, 'Cloud Service', 3, 2000, 6000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (68, 5023, 105, 'Training Course', 1, 4000, 4000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (69, 5023, 102, 'Cloud Service', 2, 2000, 4000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (70, 5024, 105, 'Training Course', 3, 4000, 12000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (71, 5024, 103, 'Consulting Hours', 3, 1000, 3000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (72, 5024, 101, 'Software License', 5, 5000, 25000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (73, 5025, 101, 'Software License', 2, 5000, 10000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (74, 5025, 103, 'Consulting Hours', 1, 1000, 1000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (75, 5026, 101, 'Software License', 5, 5000, 25000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (76, 5026, 102, 'Cloud Service', 4, 2000, 8000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (77, 5026, 104, 'Support Package', 5, 3000, 15000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (78, 5026, 102, 'Cloud Service', 4, 2000, 8000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (79, 5027, 102, 'Cloud Service', 3, 2000, 6000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (80, 5027, 101, 'Software License', 5, 5000, 25000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (81, 5028, 101, 'Software License', 3, 5000, 15000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (82, 5028, 103, 'Consulting Hours', 1, 1000, 1000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (83, 5029, 102, 'Cloud Service', 3, 2000, 6000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (84, 5029, 103, 'Consulting Hours', 1, 1000, 1000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (85, 5029, 102, 'Cloud Service', 3, 2000, 6000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (86, 5029, 105, 'Training Course', 5, 4000, 20000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (87, 5030, 104, 'Support Package', 3, 3000, 9000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (88, 5030, 105, 'Training Course', 4, 4000, 16000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (89, 5030, 102, 'Cloud Service', 5, 2000, 10000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (90, 5030, 102, 'Cloud Service', 3, 2000, 6000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (91, 5031, 105, 'Training Course', 4, 4000, 16000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (92, 5032, 105, 'Training Course', 4, 4000, 16000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (93, 5033, 105, 'Training Course', 4, 4000, 16000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (94, 5033, 105, 'Training Course', 5, 4000, 20000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (95, 5033, 105, 'Training Course', 4, 4000, 16000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (96, 5033, 102, 'Cloud Service', 3, 2000, 6000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (97, 5034, 103, 'Consulting Hours', 5, 1000, 5000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (98, 5034, 102, 'Cloud Service', 4, 2000, 8000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (99, 5034, 102, 'Cloud Service', 3, 2000, 6000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (100, 5035, 104, 'Support Package', 4, 3000, 12000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (101, 5036, 102, 'Cloud Service', 4, 2000, 8000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (102, 5036, 101, 'Software License', 2, 5000, 10000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (103, 5036, 101, 'Software License', 3, 5000, 15000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (104, 5037, 101, 'Software License', 3, 5000, 15000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (105, 5037, 102, 'Cloud Service', 2, 2000, 4000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (106, 5038, 104, 'Support Package', 1, 3000, 3000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (107, 5038, 102, 'Cloud Service', 4, 2000, 8000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (108, 5038, 104, 'Support Package', 5, 3000, 15000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (109, 5039, 104, 'Support Package', 5, 3000, 15000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (110, 5040, 103, 'Consulting Hours', 1, 1000, 1000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (111, 5040, 101, 'Software License', 5, 5000, 25000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (112, 5040, 103, 'Consulting Hours', 3, 1000, 3000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (113, 5040, 101, 'Software License', 1, 5000, 5000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (114, 5041, 105, 'Training Course', 1, 4000, 4000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (115, 5042, 101, 'Software License', 1, 5000, 5000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (116, 5042, 102, 'Cloud Service', 2, 2000, 4000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (117, 5042, 105, 'Training Course', 1, 4000, 4000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (118, 5042, 105, 'Training Course', 5, 4000, 20000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (119, 5043, 105, 'Training Course', 5, 4000, 20000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (120, 5043, 103, 'Consulting Hours', 3, 1000, 3000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (121, 5043, 102, 'Cloud Service', 3, 2000, 6000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (122, 5044, 104, 'Support Package', 1, 3000, 3000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (123, 5044, 103, 'Consulting Hours', 5, 1000, 5000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (124, 5044, 101, 'Software License', 2, 5000, 10000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (125, 5044, 104, 'Support Package', 2, 3000, 6000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (126, 5045, 101, 'Software License', 3, 5000, 15000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (127, 5045, 104, 'Support Package', 2, 3000, 6000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (128, 5045, 102, 'Cloud Service', 4, 2000, 8000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (129, 5046, 101, 'Software License', 4, 5000, 20000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (130, 5046, 104, 'Support Package', 3, 3000, 9000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (131, 5046, 103, 'Consulting Hours', 2, 1000, 2000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (132, 5047, 102, 'Cloud Service', 5, 2000, 10000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (133, 5047, 104, 'Support Package', 2, 3000, 6000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (134, 5047, 104, 'Support Package', 4, 3000, 12000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (135, 5047, 103, 'Consulting Hours', 2, 1000, 2000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (136, 5048, 102, 'Cloud Service', 2, 2000, 4000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (137, 5049, 105, 'Training Course', 2, 4000, 8000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (138, 5049, 105, 'Training Course', 5, 4000, 20000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (139, 5050, 105, 'Training Course', 1, 4000, 4000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (140, 5050, 101, 'Software License', 2, 5000, 10000);
INSERT INTO order_items (OrderItemID, OrderID, ProductID, ProductName, Quantity, UnitPrice, ItemTotal) VALUES (141, 5050, 102, 'Cloud Service', 5, 2000, 10000);

-- payments
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (1, 5001, 99214.53, '2025-09-08', 'Credit Card', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (2, 5002, 71947.96, '2025-05-06', 'Check', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (3, 5003, 28950.64, '2025-01-21', 'Credit Card', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (4, 5005, 46133.73, '2025-12-10', 'Credit Card', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (5, 5006, 52648.19, '2025-09-20', 'Check', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (6, 5008, 15746.83, '2025-11-05', 'Bank Transfer', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (7, 5009, 63113.75, '2025-09-24', 'Online', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (8, 5010, 83731.12, '2025-10-20', 'Check', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (9, 5011, 83347.48, '2025-11-15', 'Check', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (10, 5014, 76969.19, '2025-08-15', 'Credit Card', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (11, 5015, 96309.98, '2025-03-01', 'Bank Transfer', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (12, 5016, 88434.36, '2025-02-05', 'Check', 'Pending');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (13, 5018, 11023.17, '2025-10-20', 'Check', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (14, 5019, 42126.25, '2025-03-21', 'Check', 'Pending');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (15, 5020, 64350.01, '2025-03-25', 'Check', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (16, 5023, 81180.01, '2025-10-05', 'Credit Card', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (17, 5025, 25360.12, '2025-03-17', 'Credit Card', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (18, 5028, 96745.55, '2025-11-08', 'Online', 'Pending');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (19, 5031, 78535.12, '2025-12-10', 'Bank Transfer', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (20, 5033, 39955.36, '2025-05-14', 'Credit Card', 'Pending');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (21, 5035, 9635.5, '2025-12-18', 'Credit Card', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (22, 5037, 20286.94, '2025-09-30', 'Online', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (23, 5041, 85931.92, '2025-06-20', 'Bank Transfer', 'Pending');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (24, 5043, 74889.44, '2025-09-25', 'Bank Transfer', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (25, 5044, 46681.66, '2025-11-05', 'Online', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (26, 5046, 14240.0, '2025-07-30', 'Bank Transfer', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (27, 5047, 84551.48, '2025-06-08', 'Check', 'Completed');
INSERT INTO payments (PaymentID, OrderID, Amount, PaymentDate, PaymentMethod, Status) VALUES (28, 5048, 42566.77, '2025-12-10', 'Check', 'Pending');

-- accounts
INSERT INTO accounts (AccountID, AccountCode, AccountName, AccountType) VALUES (1001, '1000', 'Cash', 'Asset');
INSERT INTO accounts (AccountID, AccountCode, AccountName, AccountType) VALUES (1002, '1200', 'Accounts Receivable', 'Asset');
INSERT INTO accounts (AccountID, AccountCode, AccountName, AccountType) VALUES (1003, '1500', 'Equipment', 'Asset');
INSERT INTO accounts (AccountID, AccountCode, AccountName, AccountType) VALUES (1004, '2000', 'Accounts Payable', 'Liability');
INSERT INTO accounts (AccountID, AccountCode, AccountName, AccountType) VALUES (1005, '2100', 'Salary Payable', 'Liability');
INSERT INTO accounts (AccountID, AccountCode, AccountName, AccountType) VALUES (1006, '3000', 'Capital', 'Equity');
INSERT INTO accounts (AccountID, AccountCode, AccountName, AccountType) VALUES (1007, '4000', 'Sales Revenue', 'Revenue');
INSERT INTO accounts (AccountID, AccountCode, AccountName, AccountType) VALUES (1008, '5000', 'COGS', 'Expense');
INSERT INTO accounts (AccountID, AccountCode, AccountName, AccountType) VALUES (1009, '5100', 'Salaries Expense', 'Expense');
INSERT INTO accounts (AccountID, AccountCode, AccountName, AccountType) VALUES (1010, '5200', 'Rent Expense', 'Expense');

-- transactions
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (1, '2026-01-02', 1002, 'Accounts Receivable', 1007, 'Sales Revenue', 18974.45, 'Transaction 1', 'REF-20260102-1');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (2, '2026-01-11', 1007, 'Sales Revenue', 1004, 'Accounts Payable', 23817.89, 'Transaction 2', 'REF-20260111-2');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (3, '2026-01-15', 1005, 'Salary Payable', 1010, 'Rent Expense', 40820.65, 'Transaction 3', 'REF-20260115-3');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (4, '2026-01-05', 1007, 'Sales Revenue', 1006, 'Capital', 2287.05, 'Transaction 4', 'REF-20260105-4');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (5, '2026-01-06', 1007, 'Sales Revenue', 1006, 'Capital', 38563.78, 'Transaction 5', 'REF-20260106-5');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (6, '2026-01-18', 1005, 'Salary Payable', 1008, 'COGS', 7943.8, 'Transaction 6', 'REF-20260118-6');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (7, '2026-01-23', 1005, 'Salary Payable', 1007, 'Sales Revenue', 30336.84, 'Transaction 7', 'REF-20260123-7');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (8, '2026-01-27', 1005, 'Salary Payable', 1007, 'Sales Revenue', 19474.33, 'Transaction 8', 'REF-20260127-8');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (9, '2026-01-15', 1010, 'Rent Expense', 1003, 'Equipment', 3219.56, 'Transaction 9', 'REF-20260115-9');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (10, '2026-01-03', 1002, 'Accounts Receivable', 1009, 'Salaries Expense', 48524.68, 'Transaction 10', 'REF-20260103-10');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (11, '2026-01-23', 1003, 'Equipment', 1004, 'Accounts Payable', 35555.82, 'Transaction 11', 'REF-20260123-11');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (12, '2026-01-14', 1004, 'Accounts Payable', 1009, 'Salaries Expense', 29169.56, 'Transaction 12', 'REF-20260114-12');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (13, '2026-01-26', 1004, 'Accounts Payable', 1008, 'COGS', 12690.24, 'Transaction 13', 'REF-20260126-13');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (14, '2026-01-08', 1006, 'Capital', 1005, 'Salary Payable', 12828.79, 'Transaction 14', 'REF-20260108-14');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (15, '2026-01-15', 1010, 'Rent Expense', 1002, 'Accounts Receivable', 31558.37, 'Transaction 15', 'REF-20260115-15');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (16, '2026-01-23', 1002, 'Accounts Receivable', 1009, 'Salaries Expense', 4829.73, 'Transaction 16', 'REF-20260123-16');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (17, '2026-01-02', 1007, 'Sales Revenue', 1002, 'Accounts Receivable', 35712.9, 'Transaction 17', 'REF-20260102-17');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (18, '2026-01-10', 1006, 'Capital', 1009, 'Salaries Expense', 3724.82, 'Transaction 18', 'REF-20260110-18');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (19, '2026-01-06', 1005, 'Salary Payable', 1003, 'Equipment', 3944.25, 'Transaction 19', 'REF-20260106-19');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (20, '2026-01-18', 1006, 'Capital', 1001, 'Cash', 36617.6, 'Transaction 20', 'REF-20260118-20');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (21, '2026-01-24', 1007, 'Sales Revenue', 1001, 'Cash', 4007.26, 'Transaction 21', 'REF-20260124-21');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (22, '2026-01-25', 1002, 'Accounts Receivable', 1006, 'Capital', 33290.68, 'Transaction 22', 'REF-20260125-22');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (23, '2026-01-26', 1005, 'Salary Payable', 1002, 'Accounts Receivable', 44424.8, 'Transaction 23', 'REF-20260126-23');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (24, '2026-01-26', 1002, 'Accounts Receivable', 1004, 'Accounts Payable', 34906.55, 'Transaction 24', 'REF-20260126-24');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (25, '2026-01-18', 1006, 'Capital', 1003, 'Equipment', 5447.48, 'Transaction 25', 'REF-20260118-25');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (26, '2026-01-08', 1009, 'Salaries Expense', 1006, 'Capital', 38525.95, 'Transaction 26', 'REF-20260108-26');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (27, '2026-01-09', 1007, 'Sales Revenue', 1010, 'Rent Expense', 38219.26, 'Transaction 27', 'REF-20260109-27');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (28, '2026-01-27', 1001, 'Cash', 1002, 'Accounts Receivable', 15090.24, 'Transaction 28', 'REF-20260127-28');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (29, '2026-01-16', 1005, 'Salary Payable', 1003, 'Equipment', 18577.38, 'Transaction 29', 'REF-20260116-29');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (30, '2026-01-09', 1003, 'Equipment', 1007, 'Sales Revenue', 6410.46, 'Transaction 30', 'REF-20260109-30');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (31, '2026-01-16', 1008, 'COGS', 1005, 'Salary Payable', 20951.24, 'Transaction 31', 'REF-20260116-31');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (32, '2026-01-23', 1001, 'Cash', 1003, 'Equipment', 35018.53, 'Transaction 32', 'REF-20260123-32');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (33, '2026-01-06', 1009, 'Salaries Expense', 1002, 'Accounts Receivable', 34526.83, 'Transaction 33', 'REF-20260106-33');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (34, '2026-01-08', 1003, 'Equipment', 1007, 'Sales Revenue', 2008.78, 'Transaction 34', 'REF-20260108-34');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (35, '2026-01-11', 1010, 'Rent Expense', 1006, 'Capital', 4673.98, 'Transaction 35', 'REF-20260111-35');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (36, '2026-01-22', 1008, 'COGS', 1005, 'Salary Payable', 28934.42, 'Transaction 36', 'REF-20260122-36');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (37, '2026-01-04', 1007, 'Sales Revenue', 1010, 'Rent Expense', 6348.0, 'Transaction 37', 'REF-20260104-37');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (38, '2026-01-19', 1007, 'Sales Revenue', 1008, 'COGS', 46168.75, 'Transaction 38', 'REF-20260119-38');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (39, '2026-01-11', 1002, 'Accounts Receivable', 1007, 'Sales Revenue', 29755.42, 'Transaction 39', 'REF-20260111-39');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (40, '2026-01-27', 1003, 'Equipment', 1008, 'COGS', 48436.07, 'Transaction 40', 'REF-20260127-40');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (41, '2026-01-19', 1006, 'Capital', 1009, 'Salaries Expense', 3429.12, 'Transaction 41', 'REF-20260119-41');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (42, '2026-01-07', 1005, 'Salary Payable', 1006, 'Capital', 35422.27, 'Transaction 42', 'REF-20260107-42');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (43, '2026-01-14', 1001, 'Cash', 1007, 'Sales Revenue', 49841.92, 'Transaction 43', 'REF-20260114-43');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (44, '2026-01-06', 1005, 'Salary Payable', 1002, 'Accounts Receivable', 1742.18, 'Transaction 44', 'REF-20260106-44');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (45, '2026-01-14', 1010, 'Rent Expense', 1002, 'Accounts Receivable', 8264.57, 'Transaction 45', 'REF-20260114-45');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (46, '2026-01-17', 1008, 'COGS', 1003, 'Equipment', 12209.62, 'Transaction 46', 'REF-20260117-46');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (47, '2026-01-18', 1004, 'Accounts Payable', 1003, 'Equipment', 15555.37, 'Transaction 47', 'REF-20260118-47');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (48, '2026-01-08', 1003, 'Equipment', 1001, 'Cash', 25788.76, 'Transaction 48', 'REF-20260108-48');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (49, '2026-01-24', 1008, 'COGS', 1007, 'Sales Revenue', 43203.47, 'Transaction 49', 'REF-20260124-49');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (50, '2026-01-13', 1010, 'Rent Expense', 1007, 'Sales Revenue', 27896.92, 'Transaction 50', 'REF-20260113-50');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (51, '2026-01-21', 1004, 'Accounts Payable', 1008, 'COGS', 40967.16, 'Transaction 51', 'REF-20260121-51');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (52, '2026-01-03', 1003, 'Equipment', 1008, 'COGS', 26418.35, 'Transaction 52', 'REF-20260103-52');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (53, '2026-01-21', 1009, 'Salaries Expense', 1006, 'Capital', 23495.65, 'Transaction 53', 'REF-20260121-53');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (54, '2026-01-27', 1006, 'Capital', 1002, 'Accounts Receivable', 36102.28, 'Transaction 54', 'REF-20260127-54');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (55, '2026-01-06', 1010, 'Rent Expense', 1009, 'Salaries Expense', 15005.52, 'Transaction 55', 'REF-20260106-55');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (56, '2026-01-12', 1009, 'Salaries Expense', 1003, 'Equipment', 1740.8, 'Transaction 56', 'REF-20260112-56');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (57, '2026-01-23', 1009, 'Salaries Expense', 1002, 'Accounts Receivable', 33852.09, 'Transaction 57', 'REF-20260123-57');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (58, '2026-01-21', 1007, 'Sales Revenue', 1001, 'Cash', 1120.96, 'Transaction 58', 'REF-20260121-58');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (59, '2026-01-12', 1009, 'Salaries Expense', 1003, 'Equipment', 49069.1, 'Transaction 59', 'REF-20260112-59');
INSERT INTO transactions (TransactionID, Date, DebitAccountID, DebitAccountName, CreditAccountID, CreditAccountName, Amount, Description, Reference) VALUES (60, '2026-01-01', 1010, 'Rent Expense', 1004, 'Accounts Payable', 29449.94, 'Transaction 60', 'REF-20260101-60');

-- invoices
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1001, 5001, 2015, '2025-08-26', '2025-09-25', 99214.53, 99214.53, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1002, 5002, 2019, '2025-05-05', '2025-06-04', 71947.96, 71947.96, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1003, 5003, 2011, '2025-01-11', '2025-02-10', 28950.64, 28950.64, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1004, 5004, 2005, '2025-03-24', '2025-04-23', 13351.87, 0, 'Unpaid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1005, 5005, 2018, '2025-12-08', '2026-01-07', 46133.73, 46133.73, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1006, 5006, 2002, '2025-09-07', '2025-10-07', 52648.19, 52648.19, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1007, 5007, 2013, '2025-09-20', '2025-10-20', 74387.31, 0, 'Unpaid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1008, 5008, 2012, '2025-11-02', '2025-12-02', 15746.83, 15746.83, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1009, 5009, 2002, '2025-09-21', '2025-10-21', 63113.75, 63113.75, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1010, 5010, 2004, '2025-10-14', '2025-11-13', 83731.12, 83731.12, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1011, 5011, 2010, '2025-11-09', '2025-12-09', 83347.48, 83347.48, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1012, 5012, 2001, '2025-04-12', '2025-05-12', 17854.1, 0, 'Unpaid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1013, 5014, 2008, '2025-08-03', '2025-09-02', 76969.19, 76969.19, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1014, 5015, 2016, '2025-02-23', '2025-03-25', 96309.98, 96309.98, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1015, 5016, 2012, '2025-01-31', '2025-03-02', 88434.36, 88434.36, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1016, 5018, 2018, '2025-10-12', '2025-11-11', 11023.17, 11023.17, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1017, 5019, 2016, '2025-03-16', '2025-04-15', 42126.25, 42126.25, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1018, 5020, 2009, '2025-03-18', '2025-04-17', 64350.01, 64350.01, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1019, 5022, 2018, '2025-04-14', '2025-05-14', 33381.25, 0, 'Unpaid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1020, 5023, 2007, '2025-09-21', '2025-10-21', 81180.01, 81180.01, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1021, 5024, 2009, '2025-02-23', '2025-03-25', 55254.8, 0, 'Unpaid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1022, 5025, 2012, '2025-03-07', '2025-04-06', 25360.12, 25360.12, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1023, 5026, 2011, '2025-04-10', '2025-05-10', 93740.83, 0, 'Unpaid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1024, 5028, 2005, '2025-11-01', '2025-12-01', 96745.55, 96745.55, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1025, 5029, 2009, '2025-05-18', '2025-06-17', 47224.25, 0, 'Unpaid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1026, 5030, 2008, '2025-03-03', '2025-04-02', 47463.37, 0, 'Unpaid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1027, 5031, 2006, '2025-12-07', '2026-01-06', 78535.12, 78535.12, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1028, 5032, 2003, '2025-04-04', '2025-05-04', 23593.78, 0, 'Unpaid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1029, 5033, 2018, '2025-05-03', '2025-06-02', 39955.36, 39955.36, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1030, 5034, 2020, '2025-12-21', '2026-01-20', 75359.02, 0, 'Unpaid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1031, 5035, 2016, '2025-12-03', '2026-01-02', 9635.5, 9635.5, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1032, 5037, 2003, '2025-09-25', '2025-10-25', 20286.94, 20286.94, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1033, 5038, 2005, '2025-12-14', '2026-01-13', 67728.05, 0, 'Unpaid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1034, 5039, 2015, '2025-01-19', '2025-02-18', 86724.43, 0, 'Unpaid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1035, 5041, 2017, '2025-06-12', '2025-07-12', 85931.92, 85931.92, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1036, 5042, 2016, '2025-12-23', '2026-01-22', 27239.61, 0, 'Unpaid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1037, 5043, 2001, '2025-09-13', '2025-10-13', 74889.44, 74889.44, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1038, 5044, 2020, '2025-10-23', '2025-11-22', 46681.66, 46681.66, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1039, 5045, 2002, '2025-07-21', '2025-08-20', 56006.64, 0, 'Unpaid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1040, 5046, 2017, '2025-07-15', '2025-08-14', 14240.0, 14240.0, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1041, 5047, 2010, '2025-06-06', '2025-07-06', 84551.48, 84551.48, 'Paid');
INSERT INTO invoices (InvoiceID, OrderID, CustomerID, InvoiceDate, DueDate, InvoiceAmount, PaidAmount, Status) VALUES (1042, 5048, 2019, '2025-11-25', '2025-12-25', 42566.77, 42566.77, 'Paid');

-- expenses
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (1, 1002, '2025-12-03', 'Meals', 1586.12, 'Expense 1', 'Pending');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (2, 1011, '2025-12-25', 'Office Supplies', 2271.9, 'Expense 2', 'Approved');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (3, 1016, '2026-01-15', 'Meals', 7241.5, 'Expense 3', 'Approved');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (4, 1013, '2025-12-19', 'Travel', 2292.64, 'Expense 4', 'Approved');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (5, 1006, '2025-12-02', 'Travel', 4129.38, 'Expense 5', 'Rejected');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (6, 1015, '2025-12-23', 'Equipment', 2179.11, 'Expense 6', 'Rejected');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (7, 1004, '2026-01-06', 'Equipment', 2463.23, 'Expense 7', 'Approved');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (8, 1006, '2026-01-13', 'Training', 9454.33, 'Expense 8', 'Approved');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (9, 1019, '2025-12-21', 'Travel', 5192.66, 'Expense 9', 'Pending');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (10, 1017, '2026-01-23', 'Travel', 6122.6, 'Expense 10', 'Rejected');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (11, 1008, '2025-12-13', 'Travel', 5977.42, 'Expense 11', 'Approved');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (12, 1015, '2025-12-09', 'Equipment', 614.05, 'Expense 12', 'Approved');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (13, 1004, '2025-12-27', 'Meals', 754.42, 'Expense 13', 'Rejected');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (14, 1012, '2025-12-28', 'Office Supplies', 9451.75, 'Expense 14', 'Rejected');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (15, 1025, '2025-12-13', 'Office Supplies', 8806.6, 'Expense 15', 'Pending');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (16, 1004, '2026-01-07', 'Training', 1861.29, 'Expense 16', 'Approved');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (17, 1004, '2026-01-02', 'Office Supplies', 3603.41, 'Expense 17', 'Rejected');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (18, 1022, '2025-12-13', 'Equipment', 3571.54, 'Expense 18', 'Approved');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (19, 1025, '2026-01-02', 'Equipment', 9013.91, 'Expense 19', 'Rejected');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (20, 1020, '2025-12-25', 'Meals', 6442.67, 'Expense 20', 'Rejected');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (21, 1005, '2025-12-22', 'Office Supplies', 1017.68, 'Expense 21', 'Approved');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (22, 1002, '2026-01-24', 'Training', 2787.19, 'Expense 22', 'Pending');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (23, 1002, '2026-01-08', 'Office Supplies', 1650.24, 'Expense 23', 'Rejected');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (24, 1007, '2026-01-21', 'Office Supplies', 1331.61, 'Expense 24', 'Approved');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (25, 1019, '2026-01-11', 'Travel', 1464.38, 'Expense 25', 'Approved');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (26, 1015, '2026-01-21', 'Equipment', 5911.84, 'Expense 26', 'Pending');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (27, 1023, '2025-12-09', 'Office Supplies', 8269.58, 'Expense 27', 'Approved');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (28, 1004, '2025-12-17', 'Office Supplies', 9089.84, 'Expense 28', 'Rejected');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (29, 1007, '2026-01-25', 'Equipment', 7220.7, 'Expense 29', 'Pending');
INSERT INTO expenses (ExpenseID, EmpID, ExpenseDate, Category, Amount, Description, Status) VALUES (30, 1006, '2025-12-24', 'Office Supplies', 4283.67, 'Expense 30', 'Pending');
