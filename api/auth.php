<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password)) {
    // Check for default credentials first
    $defaultUsers = [
        'admin' => ['password' => 'admin123', 'role' => 'admin', 'full_name' => 'System Administrator'],
        'worker' => ['password' => 'worker123', 'role' => 'worker', 'full_name' => 'Warehouse Worker'],
        'organizer' => ['password' => 'org123', 'role' => 'organizer', 'full_name' => 'Shelf Organizer'],
        'user' => ['password' => 'user123', 'role' => 'user', 'full_name' => 'Regular User']
    ];

    if (isset($defaultUsers[$data->username]) && $defaultUsers[$data->username]['password'] === $data->password) {
        // Check if user exists in database
        $query = "SELECT id FROM users WHERE username = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$data->username]);
        
        if ($stmt->rowCount() === 0) {
            // Create user in database if not exists, with hashed default password
            $query = "INSERT INTO users (username, password, full_name, role, status) VALUES (?, ?, ?, ?, 'active')";
            $stmt = $pdo->prepare($query);
            $hashedPassword = password_hash($defaultUsers[$data->username]['password'], PASSWORD_DEFAULT);
            $stmt->execute([$data->username, $hashedPassword, $defaultUsers[$data->username]['full_name'], $defaultUsers[$data->username]['role']]);
            $userId = $pdo->lastInsertId();
        } else {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $userId = $row['id'];
        }

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Login successful",
            "user" => [
                "id" => $userId,
                "username" => $data->username,
                "full_name" => $defaultUsers[$data->username]['full_name'],
                "role" => $defaultUsers[$data->username]['role']
            ]
        ]);
    } else {
        // Check database for other users
        $query = "SELECT id, username, password, full_name, role FROM users WHERE username = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$data->username]);
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (password_verify($data->password, $row['password'])) {
                http_response_code(200);
                echo json_encode([
                    "success" => true,
                    "message" => "Login successful",
                    "user" => [
                        "id" => $row['id'],
                        "username" => $row['username'],
                        "full_name" => $row['full_name'],
                        "role" => $row['role']
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid password"
                ]);
            }
        } else {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "User not found"
            ]);
        }
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Username and password are required"
    ]);
}
?> 