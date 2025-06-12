<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// Temporary debug: Log server variables for GET requests with ID
if ($method === 'GET' && isset($_GET['id'])) {
    file_put_contents('debug_products_get_vars.log', 'Method received: ' . $method . "\n", FILE_APPEND);
    file_put_contents('debug_products_get_vars.log', 'GET parameters:\n' . print_r($_GET, true) . "\n", FILE_APPEND);
    file_put_contents('debug_products_get_vars.log', 'Server variables:\n' . print_r($_SERVER, true) . "\n\n", FILE_APPEND);
}

switch($method) {
    case 'GET':
        try {
            // Check if specific product ID is requested
            if (isset($_GET['id'])) {
                $query = "SELECT p.*, c.name as category_name 
                         FROM products p 
                         LEFT JOIN categories c ON p.category_id = c.id 
                         WHERE p.id = ?";
                $stmt = $pdo->prepare($query);
                $stmt->execute([$_GET['id']]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($product) {
                    echo json_encode([
                        'success' => true,
                        'product' => $product
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Product not found'
                    ]);
                }
            } else {
                // Get all products
                $query = "SELECT p.*, c.name as category_name 
                         FROM products p 
                         LEFT JOIN categories c ON p.category_id = c.id 
                         ORDER BY p.name ASC";
                $stmt = $pdo->prepare($query);
                $stmt->execute();
                
                $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'products' => $products
                ]);
            }
        } catch(PDOException $e) {
            error_log("Database error (GET): " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching products: ' . $e->getMessage()
            ]);
        }
        break;
        
    case 'POST':
        try {
            $data = json_decode(file_get_contents("php://input"));
            
            if(!isset($data->name) || !isset($data->price) || !isset($data->quantity)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required fields'
                ]);
                exit();
            }
            
            $pdo->beginTransaction();
            
            // Handle category
            $categoryId = null;
            if(isset($data->category) && !empty($data->category)) {
                // Check if category exists
                $query = "SELECT id FROM categories WHERE name = ?";
                $stmt = $pdo->prepare($query);
                $stmt->execute([$data->category]);
                
                if($stmt->rowCount() > 0) {
                    $categoryId = $stmt->fetch(PDO::FETCH_ASSOC)['id'];
                } else {
                    // Create new category
                    $query = "INSERT INTO categories (name) VALUES (?)";
                    $stmt = $pdo->prepare($query);
                    $stmt->execute([$data->category]);
                    $categoryId = $pdo->lastInsertId();
                }
            }
            
            // Insert product
            $query = "INSERT INTO products (name, price, quantity, category_id, company_id) 
                     VALUES (?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($query);
            
            $result = $stmt->execute([
                $data->name,
                $data->price,
                $data->quantity,
                $categoryId,
                $data->company_id ?? null
            ]);
            
            if($result) {
                $pdo->commit();
                echo json_encode([
                    'success' => true,
                    'message' => 'Product created successfully',
                    'product_id' => $pdo->lastInsertId()
                ]);
            } else {
                throw new PDOException("Failed to create product");
            }
        } catch(PDOException $e) {
            $pdo->rollBack();
            error_log("Database error (POST): " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error creating product: ' . $e->getMessage()
            ]);
        }
        break;
        
    case 'PUT':
        try {
            $data = json_decode(file_get_contents("php://input"));
            
            if(!isset($data->id) || !isset($data->name) || !isset($data->price) || !isset($data->quantity)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required fields'
                ]);
                exit();
            }
            
            $pdo->beginTransaction();
            
            // Handle category
            $categoryId = null;
            if(isset($data->category) && !empty($data->category)) {
                // Check if category exists
                $query = "SELECT id FROM categories WHERE name = ?";
                $stmt = $pdo->prepare($query);
                $stmt->execute([$data->category]);
                
                if($stmt->rowCount() > 0) {
                    $categoryId = $stmt->fetch(PDO::FETCH_ASSOC)['id'];
                } else {
                    // Create new category
                    $query = "INSERT INTO categories (name) VALUES (?)";
                    $stmt = $pdo->prepare($query);
                    $stmt->execute([$data->category]);
                    $categoryId = $pdo->lastInsertId();
                }
            }
            
            // Update product
            $query = "UPDATE products 
                     SET name = ?, price = ?, quantity = ?, category_id = ?, company_id = ? 
                     WHERE id = ?";
            $stmt = $pdo->prepare($query);
            
            $result = $stmt->execute([
                $data->name,
                $data->price,
                $data->quantity,
                $categoryId,
                $data->company_id ?? null,
                $data->id
            ]);
            
            if($result) {
                $pdo->commit();
                echo json_encode([
                    'success' => true,
                    'message' => 'Product updated successfully'
                ]);
            } else {
                throw new PDOException("Failed to update product");
            }
        } catch(PDOException $e) {
            $pdo->rollBack();
            error_log("Database error (PUT): " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error updating product: ' . $e->getMessage()
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
                    'message' => 'Product ID is required'
                ]);
                exit();
            }
            
            $query = "DELETE FROM products WHERE id = ?";
            $stmt = $pdo->prepare($query);
            
            if($stmt->execute([$data->id])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Product deleted successfully'
                ]);
            } else {
                throw new PDOException("Failed to delete product");
            }
        } catch(PDOException $e) {
            error_log("Database error (DELETE): " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error deleting product: ' . $e->getMessage()
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