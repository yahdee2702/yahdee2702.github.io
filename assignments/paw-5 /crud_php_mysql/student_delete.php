<?php
  session_start();
  header("Content-Type: application/json; charset=UTF-8");

  // Hanya admin yang sudah login yang boleh menghapus data
  if (!isset($_SESSION["username"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Sesi login berakhir, silakan login kembali"]);
    exit;
  }

  // Hanya menerima permintaan POST
  if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Metode permintaan tidak diizinkan"]);
    exit;
  }

  include("connection.php");

  $nim = htmlentities(strip_tags(trim($_POST["nim"] ?? "")));

  if (!preg_match("/^[0-9]{8}$/", $nim)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "NIM tidak valid"]);
    exit;
  }

  $nim = mysqli_real_escape_string($connection, $nim);

  // Ambil nama mahasiswa untuk pesan konfirmasi
  $result = mysqli_query($connection, "SELECT name FROM student WHERE nim='$nim'");
  if (mysqli_num_rows($result) == 0) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Data mahasiswa tidak ditemukan"]);
    exit;
  }
  $data = mysqli_fetch_assoc($result);
  mysqli_free_result($result);

  $query = "DELETE FROM student WHERE nim='$nim'";
  if (mysqli_query($connection, $query)) {
    echo json_encode([
      "success" => true,
      "message" => "Mahasiswa dengan nama = \"" . htmlspecialchars($data["name"]) . "\" sudah berhasil dihapus"
    ]);
  }
  else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Query gagal dijalankan: " . mysqli_error($connection)]);
  }

  mysqli_close($connection);
?>
