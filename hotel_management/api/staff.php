<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'single' && isset($_GET['id'])) {
            getStaff($pdo, $_GET['id']);
        } else {
            getAllStaff($pdo);
        }
        break;
    case 'POST':
        createStaff($pdo);
        break;
    case 'PUT':
        updateStaff($pdo);
        break;
    case 'DELETE':
        deleteStaff($pdo, $_GET['id'] ?? 0);
        break;
}

function getAllStaff($pdo) {
    $search = $_GET['search'] ?? '';
    $sql = "SELECT st.*, h.name as hotelName,
            m.department, m.bonus,
            rc.shift as recShift, rc.workingHours,
            ch.specialization, ch.experience,
            cl.assignedFloor,
            sg.shift as sgShift, sg.securityLevel
            FROM Staff st
            JOIN Hotels h ON st.hotelID = h.hotelID
            LEFT JOIN Manager m ON st.staffID = m.staffID
            LEFT JOIN Receptionist rc ON st.staffID = rc.staffID
            LEFT JOIN Chef ch ON st.staffID = ch.staffID
            LEFT JOIN Cleaner cl ON st.staffID = cl.staffID
            LEFT JOIN SecurityGuard sg ON st.staffID = sg.staffID";
    if ($search) {
        $sql .= " WHERE st.name LIKE ? OR st.role LIKE ? OR h.name LIKE ?";
        $stmt = $pdo->prepare($sql . " ORDER BY st.staffID DESC");
        $stmt->execute(["%$search%", "%$search%", "%$search%"]);
    } else {
        $stmt = $pdo->query($sql . " ORDER BY st.staffID DESC");
    }
    echo json_encode($stmt->fetchAll());
}

function getStaff($pdo, $id) {
    $stmt = $pdo->prepare("SELECT st.*, h.name as hotelName,
            m.department, m.bonus,
            rc.shift as recShift, rc.workingHours,
            ch.specialization, ch.experience,
            cl.assignedFloor,
            sg.shift as sgShift, sg.securityLevel
            FROM Staff st
            JOIN Hotels h ON st.hotelID = h.hotelID
            LEFT JOIN Manager m ON st.staffID = m.staffID
            LEFT JOIN Receptionist rc ON st.staffID = rc.staffID
            LEFT JOIN Chef ch ON st.staffID = ch.staffID
            LEFT JOIN Cleaner cl ON st.staffID = cl.staffID
            LEFT JOIN SecurityGuard sg ON st.staffID = sg.staffID
            WHERE st.staffID = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
}

function createStaff($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("INSERT INTO Staff (name, salary, hotelID, role) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['name'], $data['salary'], $data['hotelID'], $data['role']]);
        $staffID = $pdo->lastInsertId();

        switch ($data['role']) {
            case 'Manager':
                $pdo->prepare("INSERT INTO Manager (staffID, department, bonus) VALUES (?, ?, ?)")
                    ->execute([$staffID, $data['department'] ?? '', $data['bonus'] ?? 0]);
                break;
            case 'Receptionist':
                $pdo->prepare("INSERT INTO Receptionist (staffID, shift, workingHours) VALUES (?, ?, ?)")
                    ->execute([$staffID, $data['shift'] ?? 'Morning', $data['workingHours'] ?? 8]);
                break;
            case 'Chef':
                $pdo->prepare("INSERT INTO Chef (staffID, specialization, experience) VALUES (?, ?, ?)")
                    ->execute([$staffID, $data['specialization'] ?? '', $data['experience'] ?? 0]);
                break;
            case 'Cleaner':
                $pdo->prepare("INSERT INTO Cleaner (staffID, assignedFloor) VALUES (?, ?)")
                    ->execute([$staffID, $data['assignedFloor'] ?? 1]);
                break;
            case 'SecurityGuard':
                $pdo->prepare("INSERT INTO SecurityGuard (staffID, shift, securityLevel) VALUES (?, ?, ?)")
                    ->execute([$staffID, $data['shift'] ?? 'Morning', $data['securityLevel'] ?? 'Level1']);
                break;
        }
        $pdo->commit();
        echo json_encode(['success' => true, 'id' => $staffID, 'message' => 'Staff created successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function updateStaff($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("UPDATE Staff SET name=?, salary=?, hotelID=?, role=? WHERE staffID=?");
        $stmt->execute([$data['name'], $data['salary'], $data['hotelID'], $data['role'], $data['staffID']]);

        // Clear all specializations
        $pdo->prepare("DELETE FROM Manager WHERE staffID=?")->execute([$data['staffID']]);
        $pdo->prepare("DELETE FROM Receptionist WHERE staffID=?")->execute([$data['staffID']]);
        $pdo->prepare("DELETE FROM Chef WHERE staffID=?")->execute([$data['staffID']]);
        $pdo->prepare("DELETE FROM Cleaner WHERE staffID=?")->execute([$data['staffID']]);
        $pdo->prepare("DELETE FROM SecurityGuard WHERE staffID=?")->execute([$data['staffID']]);

        switch ($data['role']) {
            case 'Manager':
                $pdo->prepare("INSERT INTO Manager (staffID, department, bonus) VALUES (?, ?, ?)")
                    ->execute([$data['staffID'], $data['department'] ?? '', $data['bonus'] ?? 0]);
                break;
            case 'Receptionist':
                $pdo->prepare("INSERT INTO Receptionist (staffID, shift, workingHours) VALUES (?, ?, ?)")
                    ->execute([$data['staffID'], $data['shift'] ?? 'Morning', $data['workingHours'] ?? 8]);
                break;
            case 'Chef':
                $pdo->prepare("INSERT INTO Chef (staffID, specialization, experience) VALUES (?, ?, ?)")
                    ->execute([$data['staffID'], $data['specialization'] ?? '', $data['experience'] ?? 0]);
                break;
            case 'Cleaner':
                $pdo->prepare("INSERT INTO Cleaner (staffID, assignedFloor) VALUES (?, ?)")
                    ->execute([$data['staffID'], $data['assignedFloor'] ?? 1]);
                break;
            case 'SecurityGuard':
                $pdo->prepare("INSERT INTO SecurityGuard (staffID, shift, securityLevel) VALUES (?, ?, ?)")
                    ->execute([$data['staffID'], $data['shift'] ?? 'Morning', $data['securityLevel'] ?? 'Level1']);
                break;
        }
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Staff updated successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function deleteStaff($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM Staff WHERE staffID = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Staff deleted successfully']);
}
?>
