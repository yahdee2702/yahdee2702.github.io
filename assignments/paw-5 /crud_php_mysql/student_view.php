<?php
  session_start();
  if (!isset($_SESSION["username"])) {
     header("Location: login.php");
     exit;
  }

  include("connection.php");
  
  if (isset($_GET["message"])) {
      $message = $_GET["message"];
  }
     
  $query = "SELECT * FROM student ORDER BY nim ASC";
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Data Mahasiswa</title>
  <link href="assets/style.css" rel="stylesheet" >
  <script src="https://cdn.jsdelivr.net/npm/axios@1.7.9/dist/axios.min.js"></script>
</head>
<body>
  <div class="container">
    <div id="header">
      <h1 id="logo">Data Mahasiswa</h1>
    </div>
    <hr>
    <nav>
      <ul>
        <li><a href="student_view.php">Tampil</a></li>
        <li><a href="student_add.php">Tambah</a>
        <li><a href="logout.php">Logout</a>
      </ul>
    </nav>
    <?php
      if (isset($message)) {
          echo "<div class='pesan'>$message</div>";
      }
    ?>
    <table border="1">
    <tr>
      <th>NIM</th>
      <th>Nama</th>
      <th>Tempat Lahir</th>
      <th>Tanggal Lahir</th>
      <th>Fakultas</th>
      <th>Jurusan</th>
      <th>IPK</th>
      <th>Aksi</th>
    </tr>
    <?php
      $result = mysqli_query($connection, $query);
      if(!$result) {
          die ("Query Error: ".mysqli_errno($connection)." - ".mysqli_error($connection));
      }
    
      while($data = mysqli_fetch_assoc($result)){ 
        $birth_date = strtotime($data["birth_date"]);
        $formatted_date = date("d-m-Y", $birth_date);
        
        echo "<tr id='row-$data[nim]'>";
        echo "<td>$data[nim]</td>";
        echo "<td>$data[name]</td>";
        echo "<td>$data[birth_city]</td>";
        echo "<td>$formatted_date</td>";
        echo "<td>$data[faculty]</td>";
        echo "<td>$data[department]</td>";
        echo "<td>$data[gpa]</td>";
        echo "<td>";
        echo "<button type='button' onclick=\"location.href='student_edit.php?nim=$data[nim]'\">Edit</button> ";
        echo "<button type='button' class='btn-hapus' data-nim='$data[nim]' data-name='".htmlspecialchars($data["name"], ENT_QUOTES)."'>Hapus</button>";
        echo "</td>";
        echo "</tr>";
      }
      
      mysqli_free_result($result);
      mysqli_close($connection);
    ?>
    </table>
  </div>

  <script>
    // Tombol hapus: kirim NIM ke student_delete.php menggunakan Axios
    document.querySelectorAll(".btn-hapus").forEach(function (button) {
      button.addEventListener("click", function () {
        const nim = this.dataset.nim;
        const name = this.dataset.name;

        if (!confirm("Hapus data mahasiswa " + name + " (" + nim + ")?")) {
          return;
        }

        axios.post("student_delete.php", new URLSearchParams({ nim: nim }))
          .then(function (response) {
            document.getElementById("row-" + nim).remove();
            showMessage(response.data.message);
          })
          .catch(function (error) {
            const pesan = error.response && error.response.data.message
              ? error.response.data.message
              : "Terjadi kesalahan saat menghubungi server";
            showMessage(pesan);
          });
      });
    });

    // Tampilkan pesan hasil proses di atas tabel
    function showMessage(text) {
      let box = document.querySelector(".pesan");
      if (!box) {
        box = document.createElement("div");
        box.className = "pesan";
        document.querySelector("table").before(box);
      }
      box.innerHTML = text;
    }
  </script>
</body>
</html>