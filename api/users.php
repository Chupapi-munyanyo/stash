<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// Temporary debug: Log server variables for GET requests with ID
if ($method === 'GET' && isset($_GET['id'])) {
    file_put_contents('debug_users_get_vars.log', 'Method received: ' . $method . "\n", FILE_APPEND);
    file_put_contents('debug_users_get_vars.log', 'GET parameters:\n' . print_r($_GET, true) . "\n", FILE_APPEND);
    file_put_contents('debug_users_get_vars.log', 'Server variables:\n' . print_r($_SERVER, true) . "\n\n", FILE_APPEND);
}

switch($method) {
    case 'GET':
        try {
            // Check if specific user ID is requested
            if (isset($_GET['id'])) {
                $query = "SELECT id, username, full_name, role, status, created_at FROM users WHERE id = ?";
                $stmt = $pdo->prepare($query);
                $stmt->execute([$_GET['id']]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($user) {
                    echo json_encode([
                        'success' => true,
                        'user' => $user
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'message' => 'User not found'
                    ]);
                }
            } else {
                // Get all users
                $query = "SELECT id, username, full_name, role, status, created_at FROM users ORDER BY created_at DESC";
                $stmt = $pdo->prepare($query);
                $stmt->execute();
                
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'users' => $users
                ]);
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching users: ' . $e->getMessage()
            ]);
        }
        break;
        
    case 'POST':
        try {
            $data = json_decode(file_get_contents("php://input"));
            
            if(!isset($data->username) || !isset($data->password) || !isset($data->full_name)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required fields'
                ]);
                exit();
            }
            
            // Check if username already exists
            $query = "SELECT id FROM users WHERE username = ?";
            $stmt = $pdo->prepare($query);
            $stmt->execute([$data->username]);
            
            if($stmt->rowCount() > 0) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Username already exists'
                ]);
                exit();
            }
            
            // Insert new user
            $query = "INSERT INTO users (username, password, full_name, role, status) VALUES (?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($query);
            
            $password = password_hash($data->password, PASSWORD_DEFAULT);
            $role = isset($data->role) ? $data->role : 'pending';
            $status = isset($data->status) ? $data->status : 'pending';
            
            if($stmt->execute([
                $data->username,
                $password,
                $data->full_name,
                $role,
                $status
            ])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'User created successfully'
                ]);
            } else {
                throw new PDOException("Failed to create user");
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error creating user: ' . $e->getMessage()
            ]);
        }
        break;
        
    case 'PUT':
        try {
            $data = json_decode(file_get_contents("php://input"));
            
            if(!isset($data->id) || !isset($data->full_name) || !isset($data->username)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required fields'
                ]);
                exit();
            }
            
            // Check if new username already exists (excluding current user)
            $query = "SELECT id FROM users WHERE username = ? AND id != ?";
            $stmt = $pdo->prepare($query);
            $stmt->execute([$data->username, $data->id]);
            
            if($stmt->rowCount() > 0) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Username already exists'
                ]);
                exit();
            }
            
            // Update user
            $query = "UPDATE users SET username = ?, full_name = ?, role = ?, status = ? WHERE id = ?";
            $stmt = $pdo->prepare($query);
            
            if($stmt->execute([
                $data->username,
                $data->full_name,
                $data->role,
                $data->status,
                $data->id
            ])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'User updated successfully'
                ]);
            } else {
                throw new PDOException("Failed to update user");
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error updating user: ' . $e->getMessage()
            ]);
        }
        break;
        
    case 'DELETE':
        try {
            $data = json_decode(file_get_contents("php://input"));
            
            if(!isset($data->id)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'User ID is required'
                ]);
                exit();
            }
            
            $query = "DELETE FROM users WHERE id = ?";
            $stmt = $pdo->prepare($query);
            
            if($stmt->execute([$data->id])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'User deleted successfully'
                ]);
            } else {
                throw new PDOException("Failed to delete user");
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error deleting user: ' . $e->getMessage()
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
        break;
}
?> 