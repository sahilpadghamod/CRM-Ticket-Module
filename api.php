<?php
include 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

function response($status, $message, $data = null) {
    echo json_encode(["status" => $status, "message" => $message, "data" => $data]);
    exit();
}

if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'register') {
    $name = $input['name'];
    $email = $input['email'];
    $password = password_hash($input['password'], PASSWORD_BCRYPT);
    $role = $input['role'];

    $stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $name, $email, $password, $role);
    
    if ($stmt->execute()) response(true, "User registered successfully");
    else response(false, "Email already exists");
}

if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'login') {
    $email = $input['email'];
    $password = $input['password'];

    $stmt = $conn->prepare("SELECT id, name, role, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if (password_verify($password, $row['password'])) {
            unset($row['password']);
            response(true, "Login success", $row);
        }
    }
    response(false, "Invalid credentials");
}

if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'users') {
    $result = $conn->query("SELECT id, name FROM users WHERE role = 'user'");
    $users = [];
    while ($row = $result->fetch_assoc()) $users[] = $row;
    response(true, "Users fetched", $users);
}

if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'create_ticket') {
    $title = $_POST['title'];
    $desc = $_POST['description'];
    $createdBy = $_POST['created_by'];
    $assignedTo = $_POST['assigned_to'];
    
    $filePath = "";
    if(isset($_FILES['file'])) {
        $targetDir = "uploads/";
        if (!file_exists($targetDir)) mkdir($targetDir, 0777, true);
        $filePath = $targetDir . basename($_FILES["file"]["name"]);
        move_uploaded_file($_FILES["file"]["tmp_name"], $filePath);
    }

    $stmt = $conn->prepare("INSERT INTO tickets (title, description, file_path, created_by, assigned_to) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssii", $title, $desc, $filePath, $createdBy, $assignedTo);
    
    if($stmt->execute()) response(true, "Ticket created");
    else response(false, "Error creating ticket");
}

if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'tickets') {
    $userId = $_GET['user_id'];
    $role = $_GET['role'];

    if ($role === 'author') {
        $stmt = $conn->prepare("SELECT t.*, u.name as assigned_name FROM tickets t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.created_by = ? AND t.deleted_at IS NULL");
    } else {
        $stmt = $conn->prepare("SELECT t.*, u.name as author_name FROM tickets t LEFT JOIN users u ON t.created_by = u.id WHERE t.assigned_to = ? AND t.deleted_at IS NULL");
    }
    
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $tickets = [];
    while ($row = $result->fetch_assoc()) $tickets[] = $row;
    response(true, "Tickets fetched", $tickets);
}

if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'update_ticket') {
    $ticketId = $input['id'];
    $status = $input['status'];
    $role = $input['role'];

    if ($role === 'author') {
        $title = $input['title'];
        $desc = $input['description'];
        $stmt = $conn->prepare("UPDATE tickets SET title=?, description=?, status=? WHERE id=?");
        $stmt->bind_param("sssi", $title, $desc, $status, $ticketId);
    } else {
        if (!in_array($status, ['inprogress', 'completed'])) {
            response(false, "Invalid status update for user");
        }
        $stmt = $conn->prepare("UPDATE tickets SET status=?, completed_at = IF(status='completed', NOW(), NULL) WHERE id=?");
        $stmt->bind_param("si", $status, $ticketId);
    }

    if($stmt->execute()) response(true, "Ticket updated");
    else response(false, "Update failed");
}

// 7. DELETE TICKET (Soft Delete - Author Only)
if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete_ticket') {
    $ticketId = $input['id'];
    $role = $input['role'];

    // Security Check: Only Authors can delete
    if ($role !== 'author') {
        response(false, "Unauthorized: Only Authors can delete tickets.");
    }

    // Perform Soft Delete (Update timestamp)
    $stmt = $conn->prepare("UPDATE tickets SET deleted_at = NOW() WHERE id = ?");
    $stmt->bind_param("i", $ticketId);

    if($stmt->execute()) response(true, "Ticket deleted successfully");
    else response(false, "Deletion failed");
}
?>