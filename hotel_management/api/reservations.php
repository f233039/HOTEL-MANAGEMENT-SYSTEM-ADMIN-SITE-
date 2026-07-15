<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'single' && isset($_GET['id'])) {
            getReservation($pdo, $_GET['id']);
        } else {
            getReservations($pdo);
        }
        break;
    case 'POST':
        createReservation($pdo);
        break;
    case 'PUT':
        updateReservation($pdo);
        break;
    case 'DELETE':
        deleteReservation($pdo, $_GET['id'] ?? 0);
        break;
}

function getReservations($pdo) {
    $search = $_GET['search'] ?? '';
    $sql = "SELECT r.*, g.name as guestName, rm.roomNo, h.name as hotelName
            FROM Reservations r
            JOIN Guests g ON r.guestID = g.guestID
            JOIN Rooms rm ON r.roomID = rm.roomID
            JOIN Hotels h ON rm.hotelID = h.hotelID";
    if ($search) {
        $sql .= " WHERE g.name LIKE ? OR r.status LIKE ? OR h.name LIKE ?";
        $stmt = $pdo->prepare($sql . " ORDER BY r.reservationID DESC");
        $stmt->execute(["%$search%", "%$search%", "%$search%"]);
    } else {
        $stmt = $pdo->query($sql . " ORDER BY r.reservationID DESC");
    }
    echo json_encode($stmt->fetchAll());
}

function getReservation($pdo, $id) {
    $stmt = $pdo->prepare("SELECT r.*, g.name as guestName, rm.roomNo, h.name as hotelName
            FROM Reservations r
            JOIN Guests g ON r.guestID = g.guestID
            JOIN Rooms rm ON r.roomID = rm.roomID
            JOIN Hotels h ON rm.hotelID = h.hotelID
            WHERE r.reservationID = ?");
    $stmt->execute([$id]);
    $res = $stmt->fetch();

    // Get associated services
    $svc = $pdo->prepare("SELECT s.* FROM Services s JOIN Reservation_Services rs ON s.serviceID = rs.serviceID WHERE rs.reservationID = ?");
    $svc->execute([$id]);
    $res['services'] = $svc->fetchAll();
    echo json_encode($res);
}

function createReservation($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("INSERT INTO Reservations (checkInDate, checkOutDate, totalAmount, bookingDate, roomID, status, guestID) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$data['checkInDate'], $data['checkOutDate'], $data['totalAmount'], $data['bookingDate'], $data['roomID'], $data['status'], $data['guestID']]);
        $resID = $pdo->lastInsertId();

        // Insert services if provided
        if (!empty($data['serviceIDs'])) {
            $svcStmt = $pdo->prepare("INSERT INTO Reservation_Services (reservationID, serviceID) VALUES (?, ?)");
            foreach ($data['serviceIDs'] as $svcID) {
                $svcStmt->execute([$resID, $svcID]);
            }
        }
        $pdo->commit();
        echo json_encode(['success' => true, 'id' => $resID, 'message' => 'Reservation created successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function updateReservation($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("UPDATE Reservations SET checkInDate=?, checkOutDate=?, totalAmount=?, bookingDate=?, roomID=?, status=?, guestID=? WHERE reservationID=?");
        $stmt->execute([$data['checkInDate'], $data['checkOutDate'], $data['totalAmount'], $data['bookingDate'], $data['roomID'], $data['status'], $data['guestID'], $data['reservationID']]);

        // Update services
        $pdo->prepare("DELETE FROM Reservation_Services WHERE reservationID=?")->execute([$data['reservationID']]);
        if (!empty($data['serviceIDs'])) {
            $svcStmt = $pdo->prepare("INSERT INTO Reservation_Services (reservationID, serviceID) VALUES (?, ?)");
            foreach ($data['serviceIDs'] as $svcID) {
                $svcStmt->execute([$data['reservationID'], $svcID]);
            }
        }
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Reservation updated successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function deleteReservation($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM Reservations WHERE reservationID = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Reservation deleted successfully']);
}
?>
