<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'single' && isset($_GET['id'])) {
            getPayment($pdo, $_GET['id']);
        } else {
            getPayments($pdo);
        }
        break;
    case 'POST':
        createPayment($pdo);
        break;
    case 'PUT':
        updatePayment($pdo);
        break;
    case 'DELETE':
        deletePayment($pdo, $_GET['id'] ?? 0);
        break;
}

function getPayments($pdo) {
    $search = $_GET['search'] ?? '';
    $sql = "SELECT p.*, r.reservationID as resID, g.name as guestName
            FROM Payment p
            JOIN Reservations r ON p.reservationID = r.reservationID
            JOIN Guests g ON r.guestID = g.guestID";
    if ($search) {
        $sql .= " WHERE g.name LIKE ? OR p.paymentMethod LIKE ? OR p.status LIKE ?";
        $stmt = $pdo->prepare($sql . " ORDER BY p.paymentID DESC");
        $stmt->execute(["%$search%", "%$search%", "%$search%"]);
    } else {
        $stmt = $pdo->query($sql . " ORDER BY p.paymentID DESC");
    }
    echo json_encode($stmt->fetchAll());
}

function getPayment($pdo, $id) {
    $stmt = $pdo->prepare("SELECT p.*, g.name as guestName FROM Payment p
            JOIN Reservations r ON p.reservationID = r.reservationID
            JOIN Guests g ON r.guestID = g.guestID WHERE p.paymentID = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
}

function createPayment($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("INSERT INTO Payment (paymentMethod, amount, status, reservationID) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data['paymentMethod'], $data['amount'], $data['status'], $data['reservationID']]);
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Payment created successfully']);
}

function updatePayment($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("UPDATE Payment SET paymentMethod=?, amount=?, status=? WHERE paymentID=?");
    $stmt->execute([$data['paymentMethod'], $data['amount'], $data['status'], $data['paymentID']]);
    echo json_encode(['success' => true, 'message' => 'Payment updated successfully']);
}

function deletePayment($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM Payment WHERE paymentID = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Payment deleted successfully']);
}
?>
