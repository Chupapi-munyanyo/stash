<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    try {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->type)) {
            throw new Exception('Report type is required');
        }
        
        $dateFrom = isset($data->date_from) ? $data->date_from : date('Y-m-d', strtotime('-30 days'));
        $dateTo = isset($data->date_to) ? $data->date_to : date('Y-m-d');
        
        switch ($data->type) {
            case 'products':
                // Get product sales report
                $query = "SELECT 
                            p.name as product_name,
                            c.name as category_name,
                            COALESCE(SUM(oi.quantity), 0) as total_sold,
                            COALESCE(SUM(oi.quantity * oi.price_at_time), 0) as total_value
                         FROM products p
                         LEFT JOIN order_items oi ON p.id = oi.product_id
                         LEFT JOIN orders o ON oi.order_id = o.id
                         LEFT JOIN categories c ON p.category_id = c.id
                         WHERE o.created_at BETWEEN ? AND ?
                         GROUP BY p.id, p.name, c.name
                         ORDER BY total_sold DESC";
                $stmt = $pdo->prepare($query);
                $stmt->execute([$dateFrom, $dateTo]);
                break;
                
            case 'orders':
                // Get orders report
                $query = "SELECT 
                            o.order_number,
                            o.created_at,
                            o.status,
                            COALESCE(SUM(oi.quantity * oi.price_at_time), 0) as total_value
                         FROM orders o
                         LEFT JOIN order_items oi ON o.id = oi.order_id
                         WHERE o.created_at BETWEEN ? AND ?
                         GROUP BY o.id, o.order_number, o.created_at, o.status
                         ORDER BY o.created_at DESC";
                $stmt = $pdo->prepare($query);
                $stmt->execute([$dateFrom, $dateTo]);
                break;
                
            case 'inventory':
                // Get inventory report
                $query = "SELECT 
                            name as product_name,
                            quantity as current_quantity,
                            COALESCE(min_quantity, 0) as min_quantity,
                            CASE 
                                WHEN quantity <= COALESCE(min_quantity, 0) THEN 'low'
                                ELSE 'ok'
                            END as status
                         FROM products
                         ORDER BY quantity ASC";
                $stmt = $pdo->prepare($query);
                $stmt->execute();
                break;
                
            default:
                throw new Exception('Invalid report type');
        }
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $results
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error generating report: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}
?> 