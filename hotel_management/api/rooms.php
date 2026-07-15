<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'single' && isset($_GET['id'])) {
            getRoom($pdo, $_GET['id']);
        } else {
            getRooms($pdo);
        }
        break;
    case 'POST':
        createRoom($pdo);
        break;
    case 'PUT':
        updateRoom($pdo);
        break;
    case 'DELETE':
        deleteRoom($pdo, $_GET['id'] ?? 0);
        break;
}

function getRooms($pdo) {
    $search = $_GET['search'] ?? '';
    $sql = "SELECT r.*, h.name as hotelName,
            s.livingArea, s.balcony,
            d.luxuryFeatures, d.extraServices,
            e.workDesk, e.businessFacilities
            FROM Rooms r
            JOIN Hotels h ON r.hotelID = h.hotelID
            LEFT JOIN Suite s ON r.roomID = s.roomID
            LEFT JOIN Deluxe d ON r.roomID = d.roomID
            LEFT JOIN Executive e ON r.roomID = e.roomID";
    if ($search) {
        $sql .= " WHERE r.roomNo LIKE ? OR r.roomType LIKE ? OR h.name LIKE ?";
        $stmt = $pdo->prepare($sql . " ORDER BY r.roomID DESC");
        $stmt->execute(["%$search%", "%$search%", "%$search%"]);
    } else {
        $stmt = $pdo->query($sql . " ORDER BY r.roomID DESC");
    }
    echo json_encode($stmt->fetchAll());
}

function getRoom($pdo, $id) {
    $stmt = $pdo->prepare("SELECT r.*, h.name as hotelName,
            s.livingArea, s.balcony,
            d.luxuryFeatures, d.extraServices,
            e.workDesk, e.businessFacilities
            FROM Rooms r
            JOIN Hotels h ON r.hotelID = h.hotelID
            LEFT JOIN Suite s ON r.roomID = s.roomID
            LEFT JOIN Deluxe d ON r.roomID = d.roomID
            LEFT JOIN Executive e ON r.roomID = e.roomID
            WHERE r.roomID = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
}

function createRoom($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("INSERT INTO Rooms (roomNo, floor, status, price, hotelID, roomType) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$data['roomNo'], $data['floor'], $data['status'], $data['price'], $data['hotelID'], $data['roomType']]);
        $roomID = $pdo->lastInsertId();

        // Insert into specialization table
        switch ($data['roomType']) {
            case 'Suite':
                $stmt = $pdo->prepare("INSERT INTO Suite (roomID, livingArea, balcony) VALUES (?, ?, ?)");
                $stmt->execute([$roomID, $data['livingArea'] ?? 0, $data['balcony'] ?? 0]);
                break;
            case 'Deluxe':
                $stmt = $pdo->prepare("INSERT INTO Deluxe (roomID, luxuryFeatures, extraServices) VALUES (?, ?, ?)");
                $stmt->execute([$roomID, $data['luxuryFeatures'] ?? '', $data['extraServices'] ?? '']);
                break;
            case 'Executive':
                $stmt = $pdo->prepare("INSERT INTO Executive (roomID, workDesk, businessFacilities) VALUES (?, ?, ?)");
                $stmt->execute([$roomID, $data['workDesk'] ?? 1, $data['businessFacilities'] ?? '']);
                break;
        }
        $pdo->commit();
        echo json_encode(['success' => true, 'id' => $roomID, 'message' => 'Room created successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function updateRoom($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("UPDATE Rooms SET roomNo=?, floor=?, status=?, price=?, hotelID=?, roomType=? WHERE roomID=?");
        $stmt->execute([$data['roomNo'], $data['floor'], $data['status'], $data['price'], $data['hotelID'], $data['roomType'], $data['roomID']]);

        // Delete old specialization and insert new
        $pdo->prepare("DELETE FROM Suite WHERE roomID=?")->execute([$data['roomID']]);
        $pdo->prepare("DELETE FROM Deluxe WHERE roomID=?")->execute([$data['roomID']]);
        $pdo->prepare("DELETE FROM Executive WHERE roomID=?")->execute([$data['roomID']]);

        switch ($data['roomType']) {
            case 'Suite':
                $stmt = $pdo->prepare("INSERT INTO Suite (roomID, livingArea, balcony) VALUES (?, ?, ?)");
                $stmt->execute([$data['roomID'], $data['livingArea'] ?? 0, $data['balcony'] ?? 0]);
                break;
            case 'Deluxe':
                $stmt = $pdo->prepare("INSERT INTO Deluxe (roomID, luxuryFeatures, extraServices) VALUES (?, ?, ?)");
                $stmt->execute([$data['roomID'], $data['luxuryFeatures'] ?? '', $data['extraServices'] ?? '']);
                break;
            case 'Executive':
                $stmt = $pdo->prepare("INSERT INTO Executive (roomID, workDesk, businessFacilities) VALUES (?, ?, ?)");
                $stmt->execute([$data['roomID'], $data['workDesk'] ?? 1, $data['businessFacilities'] ?? '']);
                break;
        }
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Room updated successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function deleteRoom($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM Rooms WHERE roomID = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Room deleted successfully']);
}
?>
