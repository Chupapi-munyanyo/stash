<?php
require_once 'api/config.php';

echo "<h1>Database Population Script</h1>";

try {
    $pdo->beginTransaction();

    // Insert categories
    echo "<h2>1. Inserting Categories</h2>";
    $categories = ['Pulveris', 'Šķidrums', 'Tabletes', 'Pārtika', 'Dzērieni'];
    
    foreach ($categories as $category) {
        $query = "INSERT IGNORE INTO categories (name) VALUES (?)";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$category]);
    }
    echo "✅ Categories inserted<br>";

    // Insert sample products
    echo "<h2>2. Inserting Sample Products</h2>";
    $products = [
        ['Milti', 'Pulveris', 12.00, 'Raicha', 50],
        ['Ūdens', 'Šķidrums', 1.50, 'Raicha', 100],
        ['Tabletes', 'Tabletes', 25.99, 'Raicha', 30],
        ['Maize', 'Pārtika', 2.50, 'Lāči', 25],
        ['Kafija', 'Dzērieni', 8.99, 'Kafijas Nams', 40]
    ];

    foreach ($products as $product) {
        // Get category ID
        $query = "SELECT id FROM categories WHERE name = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$product[1]]);
        $categoryId = $stmt->fetch(PDO::FETCH_ASSOC)['id'];

        // Insert product
        $query = "INSERT IGNORE INTO products (name, category_id, price, company_id, quantity) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$product[0], $categoryId, $product[2], $product[3], $product[4]]);
    }
    echo "✅ Sample products inserted<br>";

    // Insert sample users (if they don't exist)
    echo "<h2>3. Inserting Sample Users</h2>";
    $users = [
        ['admin', 'admin123', 'System Administrator', 'admin', 'active'],
        ['worker', 'worker123', 'Warehouse Worker', 'worker', 'active'],
        ['organizer', 'org123', 'Shelf Organizer', 'organizer', 'active'],
        ['user', 'user123', 'Regular User', 'user', 'active']
    ];

    foreach ($users as $user) {
        $hashedPassword = password_hash($user[1], PASSWORD_DEFAULT);
        $query = "INSERT IGNORE INTO users (username, password, full_name, role, status) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$user[0], $hashedPassword, $user[2], $user[3], $user[4]]);
    }
    echo "✅ Sample users inserted<br>";

    $pdo->commit();
    echo "<h2>✅ Database population completed successfully!</h2>";
    echo "<p>You can now test the application with the sample data.</p>";

} catch (PDOException $e) {
    $pdo->rollBack();
    echo "<h2>❌ Database Error</h2>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
}
?> 