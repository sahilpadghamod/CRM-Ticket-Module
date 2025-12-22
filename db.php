<!-- <?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

$host = "sql204.infinityfree.com";
$user = "if0_40742506";
$pass = "Sahi95612";
$dbname = "if0_40742506_demo";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
?> -->

<?php
// InfinityFree Remote Database Configuration
// Replace these with your actual InfinityFree credentials

$host = 'sql204.infinityfree.com'; // Your InfinityFree database host
$dbname = 'if0_40742506_demo'; // Your database name - UPDATE THIS with your actual database name
$username = 'if0_40742506'; // Your database username
$password = 'Sahi95612'; // REPLACE THIS with your actual database password from InfinityFree panel

// Create connection
$conn = @new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    // Connection failed - the api.php will handle the error response
    $conn = null;
}

// Set charset to utf8mb4 for better character support (only if connection successful)
if ($conn && !$conn->connect_error) {
    $conn->set_charset("utf8mb4");
}
?>