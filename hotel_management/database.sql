
-- Hotel Management System - Database Schem
CREATE DATABASE IF NOT EXISTS hotel_management;
USE hotel_management;

-- ============================================================
-- 1. Hotels (Parent Entity)
-- ============================================================
CREATE TABLE Hotels (
    hotelID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    contactNo VARCHAR(20) NOT NULL
);

-- ============================================================
-- 2. Rooms (Weak/Child of Hotels) - Generalization parent
-- ============================================================
CREATE TABLE Rooms (
    roomID INT PRIMARY KEY AUTO_INCREMENT,
    roomNo VARCHAR(10) NOT NULL,
    floor INT NOT NULL,
    status ENUM('Available', 'Occupied', 'Maintenance', 'Reserved') DEFAULT 'Available',
    price DECIMAL(10,2) NOT NULL,
    hotelID INT NOT NULL,
    roomType ENUM('Suite', 'Deluxe', 'Executive') NOT NULL,
    FOREIGN KEY (hotelID) REFERENCES Hotels(hotelID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 3. Suite (Specialization of Rooms)
-- ============================================================
CREATE TABLE Suite (
    roomID INT PRIMARY KEY,
    livingArea DECIMAL(8,2),
    balcony BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 4. Deluxe (Specialization of Rooms)
-- ============================================================
CREATE TABLE Deluxe (
    roomID INT PRIMARY KEY,
    luxuryFeatures TEXT,
    extraServices TEXT,
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 5. Executive (Specialization of Rooms)
-- ============================================================
CREATE TABLE Executive (
    roomID INT PRIMARY KEY,
    workDesk BOOLEAN DEFAULT TRUE,
    businessFacilities TEXT,
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 6. Staff (Child of Hotels) - Generalization parent
-- ============================================================
CREATE TABLE Staff (
    staffID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    hotelID INT NOT NULL,
    role ENUM('Manager', 'Receptionist', 'Chef', 'Cleaner', 'SecurityGuard') NOT NULL,
    FOREIGN KEY (hotelID) REFERENCES Hotels(hotelID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 7. Manager (Specialization of Staff)
-- ============================================================
CREATE TABLE Manager (
    staffID INT PRIMARY KEY,
    department VARCHAR(50),
    bonus DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (staffID) REFERENCES Staff(staffID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 8. Receptionist (Specialization of Staff)
-- ============================================================
CREATE TABLE Receptionist (
    staffID INT PRIMARY KEY,
    shift ENUM('Morning', 'Evening', 'Night') NOT NULL,
    workingHours INT DEFAULT 8,
    FOREIGN KEY (staffID) REFERENCES Staff(staffID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 9. Chef (Specialization of Staff)
-- ============================================================
CREATE TABLE Chef (
    staffID INT PRIMARY KEY,
    specialization VARCHAR(100),
    experience INT DEFAULT 0,
    FOREIGN KEY (staffID) REFERENCES Staff(staffID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 10. Cleaner (Specialization of Staff)
-- ============================================================
CREATE TABLE Cleaner (
    staffID INT PRIMARY KEY,
    assignedFloor INT,
    FOREIGN KEY (staffID) REFERENCES Staff(staffID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 11. SecurityGuard (Specialization of Staff)
-- ============================================================
CREATE TABLE SecurityGuard (
    staffID INT PRIMARY KEY,
    shift ENUM('Morning', 'Evening', 'Night') NOT NULL,
    securityLevel ENUM('Level1', 'Level2', 'Level3') DEFAULT 'Level1',
    FOREIGN KEY (staffID) REFERENCES Staff(staffID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 12. Guests
-- ============================================================
CREATE TABLE Guests (
    guestID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(200),
    guestType ENUM('Regular', 'VIP', 'Corporate') DEFAULT 'Regular'
);

-- ============================================================
-- 13. Reservations
-- ============================================================
CREATE TABLE Reservations (
    reservationID INT PRIMARY KEY AUTO_INCREMENT,
    checkInDate DATE NOT NULL,
    checkOutDate DATE NOT NULL,
    totalAmount DECIMAL(10,2) DEFAULT 0,
    bookingDate DATE NOT NULL,
    roomID INT NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled') DEFAULT 'Pending',
    guestID INT NOT NULL,
    FOREIGN KEY (roomID) REFERENCES Rooms(roomID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (guestID) REFERENCES Guests(guestID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 14. Services
-- ============================================================
CREATE TABLE Services (
    serviceID INT PRIMARY KEY AUTO_INCREMENT,
    serviceName VARCHAR(100) NOT NULL,
    cost DECIMAL(10,2) NOT NULL
);

-- ============================================================
-- 15. Reservation_Services (M:N relationship)
-- ============================================================
CREATE TABLE Reservation_Services (
    reservationID INT NOT NULL,
    serviceID INT NOT NULL,
    PRIMARY KEY (reservationID, serviceID),
    FOREIGN KEY (reservationID) REFERENCES Reservations(reservationID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (serviceID) REFERENCES Services(serviceID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 16. Payment (1:1 with Reservations)
-- ============================================================
CREATE TABLE Payment (
    paymentID INT PRIMARY KEY AUTO_INCREMENT,
    paymentMethod ENUM('Cash', 'Credit Card', 'Debit Card', 'Online', 'Bank Transfer') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
    reservationID INT UNIQUE NOT NULL,
    FOREIGN KEY (reservationID) REFERENCES Reservations(reservationID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Hotels
INSERT INTO Hotels (name, location, rating, contactNo) VALUES
('Grand Palace Hotel', 'Islamabad, Pakistan', 4.8, '+92-51-1234567'),
('Pearl Continental', 'Lahore, Pakistan', 4.5, '+92-42-7654321'),
('Serena Hotel', 'Karachi, Pakistan', 4.7, '+92-21-9876543');

-- Rooms
INSERT INTO Rooms (roomNo, floor, status, price, hotelID, roomType) VALUES
('101', 1, 'Available', 15000.00, 1, 'Suite'),
('102', 1, 'Available', 12000.00, 1, 'Deluxe'),
('201', 2, 'Occupied', 18000.00, 1, 'Executive'),
('301', 3, 'Available', 14000.00, 2, 'Suite'),
('302', 3, 'Maintenance', 11000.00, 2, 'Deluxe'),
('401', 4, 'Available', 20000.00, 3, 'Executive');

-- Suite specialization
INSERT INTO Suite (roomID, livingArea, balcony) VALUES
(1, 450.50, TRUE),
(4, 500.00, TRUE);

-- Deluxe specialization
INSERT INTO Deluxe (roomID, luxuryFeatures, extraServices) VALUES
(2, 'King Bed, Jacuzzi, Mini Bar', 'Room Service, Laundry'),
(5, 'Queen Bed, Spa Access', 'Breakfast Included');

-- Executive specialization
INSERT INTO Executive (roomID, workDesk, businessFacilities) VALUES
(3, TRUE, 'Conference Room Access, Printer, High-speed WiFi'),
(6, TRUE, 'Meeting Room, Projector, Video Conferencing');

-- Staff
INSERT INTO Staff (name, salary, hotelID, role) VALUES
('Ahmed Khan', 120000.00, 1, 'Manager'),
('Sara Ali', 60000.00, 1, 'Receptionist'),
('Bilal Hussain', 80000.00, 2, 'Chef'),
('Fatima Noor', 40000.00, 2, 'Cleaner'),
('Usman Tariq', 55000.00, 3, 'SecurityGuard');

-- Manager specialization
INSERT INTO Manager (staffID, department, bonus) VALUES
(1, 'Operations', 25000.00);

-- Receptionist specialization
INSERT INTO Receptionist (staffID, shift, workingHours) VALUES
(2, 'Morning', 8);

-- Chef specialization
INSERT INTO Chef (staffID, specialization, experience) VALUES
(3, 'Continental Cuisine', 12);

-- Cleaner specialization
INSERT INTO Cleaner (staffID, assignedFloor) VALUES
(4, 3);

-- SecurityGuard specialization
INSERT INTO SecurityGuard (staffID, shift, securityLevel) VALUES
(5, 'Night', 'Level2');

-- Guests
INSERT INTO Guests (name, email, phone, address, guestType) VALUES
('Ali Raza', 'ali.raza@email.com', '+92-300-1111111', 'Islamabad, Pakistan', 'VIP'),
('Zainab Ahmed', 'zainab@email.com', '+92-321-2222222', 'Lahore, Pakistan', 'Regular'),
('Hassan Malik', 'hassan.m@email.com', '+92-333-3333333', 'Karachi, Pakistan', 'Corporate');

-- Services
INSERT INTO Services (serviceName, cost) VALUES
('Spa & Wellness', 5000.00),
('Airport Pickup', 3000.00),
('Room Service (24hr)', 2000.00),
('Laundry & Dry Cleaning', 1500.00),
('Guided City Tour', 8000.00);

-- Reservations
INSERT INTO Reservations (checkInDate, checkOutDate, totalAmount, bookingDate, roomID, status, guestID) VALUES
('2026-05-01', '2026-05-05', 60000.00, '2026-04-25', 1, 'Confirmed', 1),
('2026-05-10', '2026-05-12', 24000.00, '2026-04-28', 2, 'Pending', 2),
('2026-05-15', '2026-05-20', 100000.00, '2026-04-30', 6, 'Confirmed', 3);

-- Reservation_Services
INSERT INTO Reservation_Services (reservationID, serviceID) VALUES
(1, 1), (1, 2), (2, 3), (3, 2), (3, 4), (3, 5);

-- Payment
INSERT INTO Payment (paymentMethod, amount, status, reservationID) VALUES
('Credit Card', 68000.00, 'Completed', 1),
('Cash', 26000.00, 'Pending', 2),
('Online', 112500.00, 'Completed', 3);
