<?php
class Database {
    private $host = "localhost";
    private $db_name = "stash_warehouse";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"
                )
            );
        } catch(PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            // Instead of echoing, throw the exception to be caught by the API endpoints
            throw new PDOException("Database connection failed: " . $e->getMessage());
        }

        return $this->conn;
    }
}
?> 