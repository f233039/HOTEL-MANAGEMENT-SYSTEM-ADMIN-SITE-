<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'single' && isset($_GET['id'])) {
            getService($pdo, $_GET['id']);
        } else {
            getServices($pdo);
        }
        break;
    case 'POST':
        createService($pdo);
        break;
    case 'PUT':
        updateService($pdo);
        break;
    case 'DELETE':
        deleteService($pdo, $_GET['id'] ?? 0);
        break;
}

function getServices($pdo) {
    $search = $_GET['search'] ?? '';
    if ($search) {
        $stmt = $pdo->prepare("SELECT * FROM Services WHERE serviceName LIKE ? ORDER BY serviceID DESC");
        $stmt->execute(["%$search%"]);
    } else {
        $stmt = $pdo->query("SELECT * FROM Services ORDER BY serviceID DESC");
    }
    echo json_encode($stmt->fetchAll());
}

function getService($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM Services WHERE serviceID = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
}

function createService($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("INSERT INTO Services (serviceName, cost) VALUES (?, ?)");
    $stmt->execute([$data['serviceName'], $data['cost']]);
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Service created successfully']);
}

function updateService($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("UPDATE Services SET serviceName=?, cost=? WHERE serviceID=?");
    $stmt->execute([$data['serviceName'], $data['cost'], $data['serviceID']]);
    echo json_encode(['success' => true, 'message' => 'Service updated successfully']);
}

function deleteService($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM Services WHERE serviceID = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Service deleted successfully']);
}
?>
