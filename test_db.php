<?php
require_once 'api/config.php';

echo "<h1>Database Connection Test</h1>";

try {
    // Test database connection
    echo "<h2>1. Testing Database Connection</h2>";
    $testQuery = "SELECT 1 as test";
    $stmt = $pdo->prepare($testQuery);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✅ Database connection successful<br>";

    // Test users table
    echo "<h2>2. Testing Users Table</h2>";
    $query = "SELECT COUNT(*) as count FROM users";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✅ Users table exists with " . $result['count'] . " records<br>";

    // Test products table
    echo "<h2>3. Testing Products Table</h2>";
    $query = "SELECT COUNT(*) as count FROM products";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✅ Products table exists with " . $result['count'] . " records<br>";

    // Test orders table
    echo "<h2>4. Testing Orders Table</h2>";
    $query = "SELECT COUNT(*) as count FROM orders";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✅ Orders table exists with " . $result['count'] . " records<br>";

    // Test categories table
    echo "<h2>5. Testing Categories Table</h2>";
    $query = "SELECT COUNT(*) as count FROM categories";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✅ Categories table exists with " . $result['count'] . " records<br>";

    // Test order_items table
    echo "<h2>6. Testing Order Items Table</h2>";
    $query = "SELECT COUNT(*) as count FROM order_items";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✅ Order items table exists with " . $result['count'] . " records<br>";

    echo "<h2>✅ All database tests passed!</h2>";
    echo "<p>The database connection is working correctly and all required tables exist.</p>";

} catch (PDOException $e) {
    echo "<h2>❌ Database Error</h2>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
}
?> 