<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $query = "SELECT o.*, u.username as created_by_username 
                 FROM orders o 
                 LEFT JOIN users u ON o.created_by = u.id 
                 ORDER BY o.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get order items for each order
        foreach ($orders as &$order) {
            $query = "SELECT oi.*, p.name as product_name 
                     FROM order_items oi 
                     JOIN products p ON oi.product_id = p.id 
                     WHERE oi.order_id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$order['id']]);
            $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        echo json_encode([
            "status" => "success",
            "data" => $orders
        ]);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->items) && !empty($data->created_by)) {
            $maxRetries = 3;
            $retryCount = 0;
            $success = false;
            
            while (!$success && $retryCount < $maxRetries) {
                try {
                    $db->beginTransaction();
                    
                    // Lock products first to prevent deadlocks
                    $productIds = array_map(function($item) {
                        return $item->product_id;
                    }, $data->items);
                    
                    $placeholders = str_repeat('?,', count($productIds) - 1) . '?';
                    $query = "SELECT id, quantity FROM products WHERE id IN ($placeholders) FOR UPDATE";
                    $stmt = $db->prepare($query);
                    $stmt->execute($productIds);
                    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    // Verify quantities
                    foreach ($products as $product) {
                        $requestedQuantity = 0;
                        foreach ($data->items as $item) {
                            if ($item->product_id == $product['id']) {
                                $requestedQuantity += $item->quantity;
                            }
                        }
                        if ($product['quantity'] < $requestedQuantity) {
                            throw new Exception("Insufficient quantity for product ID: " . $product['id']);
                        }
                    }
                    
                    // Create order
                    $query = "INSERT INTO orders (order_number, status, created_by) VALUES (?, 'pending', ?)";
                    $stmt = $db->prepare($query);
                    $orderNumber = 'ORD-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
                    $stmt->execute([$orderNumber, $data->created_by]);
                    $orderId = $db->lastInsertId();
                    
                    // Add order items and update quantities
                    foreach ($data->items as $item) {
                        // Insert order item
                        $query = "INSERT INTO order_items (order_id, product_id, quantity, price_at_time) 
                                 VALUES (?, ?, ?, (SELECT price FROM products WHERE id = ?))";
                        $stmt = $db->prepare($query);
                        $stmt->execute([$orderId, $item->product_id, $item->quantity, $item->product_id]);
                        
                        // Update product quantity
                        $query = "UPDATE products SET quantity = quantity - ? WHERE id = ?";
                        $stmt = $db->prepare($query);
                        $stmt->execute([$item->quantity, $item->product_id]);
                    }
                    
                    $db->commit();
                    $success = true;
                    
                    echo json_encode([
                        "status" => "success",
                        "message" => "Order created successfully",
                        "order_id" => $orderId
                    ]);
                } catch (Exception $e) {
                    $db->rollBack();
                    
                    // Check if it's a deadlock
                    if (strpos($e->getMessage(), 'Deadlock found') !== false) {
                        $retryCount++;
                        if ($retryCount < $maxRetries) {
                            // Wait a bit before retrying (exponential backoff)
                            usleep(pow(2, $retryCount) * 100000); // 100ms, 200ms, 400ms
                            continue;
                        }
                    }
                    
                    echo json_encode([
                        "status" => "error",
                        "message" => "Error creating order: " . $e->getMessage()
                    ]);
                    break;
                }
            }
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Missing required fields"
            ]);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id) && !empty($data->status)) {
            $query = "UPDATE orders SET status = ? WHERE id = ?";
            $stmt = $db->prepare($query);
            
            if ($stmt->execute([$data->status, $data->id])) {
                echo json_encode([
                    "status" => "success",
                    "message" => "Order updated successfully"
                ]);
            } else {
                echo json_encode([
                    "status" => "error",
                    "message" => "Unable to update order"
                ]);
            }
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Missing required fields"
            ]);
        }
        break;
        
    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            try {
                $db->beginTransaction();
                
                // Get order items to restore product quantities
                $query = "SELECT product_id, quantity FROM order_items WHERE order_id = ?";
                $stmt = $db->prepare($query);
                $stmt->execute([$data->id]);
                $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Restore product quantities
                foreach ($items as $item) {
                    $query = "UPDATE products SET quantity = quantity + ? WHERE id = ?";
                    $stmt = $db->prepare($query);
                    $stmt->execute([$item['quantity'], $item['product_id']]);
                }
                
                // Delete order items
                $query = "DELETE FROM order_items WHERE order_id = ?";
                $stmt = $db->prepare($query);
                $stmt->execute([$data->id]);
                
                // Delete order
                $query = "DELETE FROM orders WHERE id = ?";
                $stmt = $db->prepare($query);
                $stmt->execute([$data->id]);
                
                $db->commit();
                
                echo json_encode([
                    "status" => "success",
                    "message" => "Order deleted successfully"
                ]);
            } catch (Exception $e) {
                $db->rollBack();
                echo json_encode([
                    "status" => "error",
                    "message" => "Error deleting order: " . $e->getMessage()
                ]);
            }
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Order ID is required"
            ]);
        }
        break;
        
    default:
        echo json_encode([
            "status" => "error",
            "message" => "Method not allowed"
        ]);
        break;
}
?> 