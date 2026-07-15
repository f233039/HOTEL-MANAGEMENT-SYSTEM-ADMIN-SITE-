<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'single' && isset($_GET['id'])) {
            getGuest($pdo, $_GET['id']);
        } else {
            getGuests($pdo);
        }
        break;
    case 'POST':
        createGuest($pdo);
        break;
    case 'PUT':
        updateGuest($pdo);
        break;
    case 'DELETE':
        deleteGuest($pdo, $_GET['id'] ?? 0);
        break;
}

function getGuests($pdo) {
    $search = $_GET['search'] ?? '';
    if ($search) {
        $stmt = $pdo->prepare("SELECT * FROM Guests WHERE name LIKE ? OR email LIKE ? OR guestType LIKE ? ORDER BY guestID DESC");
        $stmt->execute(["%$search%", "%$search%", "%$search%"]);
    } else {
        $stmt = $pdo->query("SELECT * FROM Guests ORDER BY guestID DESC");
    }
    echo json_encode($stmt->fetchAll());
}

function getGuest($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM Guests WHERE guestID = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
}

function createGuest($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("INSERT INTO Guests (name, email, phone, address, guestType) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$data['name'], $data['email'], $data['phone'], $data['address'], $data['guestType']]);
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Guest created successfully']);
}

function updateGuest($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("UPDATE Guests SET name=?, email=?, phone=?, address=?, guestType=? WHERE guestID=?");
    $stmt->execute([$data['name'], $data['email'], $data['phone'], $data['address'], $data['guestType'], $data['guestID']]);
    echo json_encode(['success' => true, 'message' => 'Guest updated successfully']);
}

function deleteGuest($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM Guests WHERE guestID = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Guest deleted successfully']);
}
?>
