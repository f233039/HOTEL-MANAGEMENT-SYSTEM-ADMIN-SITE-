<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'stats') {
            getStats($pdo);
        } else if ($action === 'single' && isset($_GET['id'])) {
            getHotel($pdo, $_GET['id']);
        } else {
            getHotels($pdo);
        }
        break;
    case 'POST':
        createHotel($pdo);
        break;
    case 'PUT':
        updateHotel($pdo);
        break;
    case 'DELETE':
        deleteHotel($pdo, $_GET['id'] ?? 0);
        break;
}

function getStats($pdo) {
    $hotels = $pdo->query("SELECT COUNT(*) as count FROM Hotels")->fetch()['count'];
    $rooms = $pdo->query("SELECT COUNT(*) as count FROM Rooms")->fetch()['count'];
    $guests = $pdo->query("SELECT COUNT(*) as count FROM Guests")->fetch()['count'];
    $reservations = $pdo->query("SELECT COUNT(*) as count FROM Reservations")->fetch()['count'];
    $staff = $pdo->query("SELECT COUNT(*) as count FROM Staff")->fetch()['count'];
    $services = $pdo->query("SELECT COUNT(*) as count FROM Services")->fetch()['count'];
    $revenue = $pdo->query("SELECT COALESCE(SUM(amount),0) as total FROM Payment WHERE status='Completed'")->fetch()['total'];
    echo json_encode(['hotels'=>$hotels,'rooms'=>$rooms,'guests'=>$guests,'reservations'=>$reservations,'staff'=>$staff,'services'=>$services,'revenue'=>$revenue]);
}

function getHotels($pdo) {
    $search = $_GET['search'] ?? '';
    if ($search) {
        $stmt = $pdo->prepare("SELECT * FROM Hotels WHERE name LIKE ? OR location LIKE ? ORDER BY hotelID DESC");
        $stmt->execute(["%$search%", "%$search%"]);
    } else {
        $stmt = $pdo->query("SELECT * FROM Hotels ORDER BY hotelID DESC");
    }
    echo json_encode($stmt->fetchAll());
}

function getHotel($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM Hotels WHERE hotelID = ?");
    $stmt->execute([$id]);
    $hotel = $stmt->fetch();
    if ($hotel) {
        echo json_encode($hotel);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Hotel not found']);
    }
}

function createHotel($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("INSERT INTO Hotels (name, location, rating, contactNo) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data['name'], $data['location'], $data['rating'], $data['contactNo']]);
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Hotel created successfully']);
}

function updateHotel($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("UPDATE Hotels SET name=?, location=?, rating=?, contactNo=? WHERE hotelID=?");
    $stmt->execute([$data['name'], $data['location'], $data['rating'], $data['contactNo'], $data['hotelID']]);
    echo json_encode(['success' => true, 'message' => 'Hotel updated successfully']);
}

function deleteHotel($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM Hotels WHERE hotelID = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Hotel deleted successfully']);
}
?>
