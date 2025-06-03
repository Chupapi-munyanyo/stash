<?php
session_start();

$products = [
    ['id' => 1, 'name' => 'Milti', 'category' => 'Pulveris', 'price' => 12, 'company' => 'Raicha', 'quantity' => 12],
    ['id' => 2, 'name' => 'Ūdens', 'category' => 'Šķidrums', 'price' => 12, 'company' => 'Raicha', 'quantity' => 1111],
    ['id' => 3, 'name' => 'Tabletes', 'category' => 'Tabletes', 'price' => 12, 'company' => 'Raicha', 'quantity' => 12]
];

$users = [
    ['id' => 1, 'name' => 'Jānis Bērziņš', 'role' => 'Noliktavas darbinieks', 'email' => 'janis@example.com'],
    ['id' => 2, 'name' => 'Anna Liepa', 'role' => 'Plauktu Kārtotājs', 'email' => 'anna@example.com'],
    ['id' => 3, 'name' => 'Pēteris Ozols', 'role' => 'Administrātors', 'email' => 'peteris@example.com']
];

if ($_POST) {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'delete_product':
                break;
            case 'edit_product':
                break;
            case 'add_product':
                break;
            case 'delete_user':
                break;
            case 'edit_user':
                break;
            case 'add_user':
                break;
        }
    }
}
?>

<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>STASH - Administrātora panelis</title>
    <link rel="stylesheet" href="admin.css">
</head>
<body>
    <div class="container">
        <nav class="sidebar">
            <div class="logo">
                <span class="logo-icon">📦</span>
                <span class="logo-text">STASH</span>
            </div>
            <ul class="nav-menu">
                <li class="nav-item active">
                    <a href="#" onclick="showSection('dashboard')">
                        <span class="nav-icon">🏠</span>
                        Sākums
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" onclick="showSection('products')">
                        <span class="nav-icon">➕</span>
                        Produktu pārvaldība
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" onclick="showSection('users')">
                        <span class="nav-icon">➕</span>
                        Lietotāju pārvaldība
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" onclick="showSection('reports')">
                        <span class="nav-icon">👥</span>
                        Atskaites un pārskati
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" onclick="logout()">
                        <span class="nav-icon">🚪</span>
                        Iziet
                    </a>
                </li>
            </ul>
        </nav>

        <main class="main-content">
            <section id="dashboard" class="content-section active">
                <header class="content-header">
                    <h1>Administrātora panelis</h1>
                </header>
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <h3>Kopā produkti</h3>
                        <p class="stat-number"><?php echo count($products); ?></p>
                    </div>
                    <div class="stat-card">
                        <h3>Kopā lietotāji</h3>
                        <p class="stat-number"><?php echo count($users); ?></p>
                    </div>
                    <div class="stat-card">
                        <h3>Aktīvie pasūtījumi</h3>
                        <p class="stat-number">8</p>
                    </div>
                </div>
            </section>

            <section id="products" class="content-section">
                <header class="content-header">
                    <h1>Produktu pārvaldība</h1>
                    <button class="btn btn-primary" onclick="showAddProductForm()">Pievienot produktu</button>
                </header>
                
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Produkts</th>
                                <th>Kategorija</th>
                                <th>Cena</th>
                                <th>Firmas ID</th>
                                <th>Daudzums</th>
                                <th>Darbības</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($products as $product): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($product['name']); ?></td>
                                <td><?php echo htmlspecialchars($product['category']); ?></td>
                                <td><?php echo htmlspecialchars($product['price']); ?></td>
                                <td><?php echo htmlspecialchars($product['company']); ?></td>
                                <td><?php echo htmlspecialchars($product['quantity']); ?></td>
                                <td>
                                    <button class="btn-action btn-edit" onclick="editProduct(<?php echo $product['id']; ?>)">Rediģēt</button>
                                    <button class="btn-action btn-delete" onclick="deleteProduct(<?php echo $product['id']; ?>)">Dzēst</button>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </section>

            <section id="users" class="content-section">
                <header class="content-header">
                    <h1>Lietotāju pārvaldība</h1>
                    <button class="btn btn-primary" onclick="showAddUserForm()">Pievienot lietotāju</button>
                </header>
                
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Vārds</th>
                                <th>Loma</th>
                                <th>E-pasts</th>
                                <th>Darbības</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($users as $user): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($user['name']); ?></td>
                                <td><?php echo htmlspecialchars($user['role']); ?></td>
                                <td><?php echo htmlspecialchars($user['email']); ?></td>
                                <td>
                                    <button class="btn-action btn-edit" onclick="editUser(<?php echo $user['id']; ?>)">Rediģēt</button>
                                    <button class="btn-action btn-delete" onclick="deleteUser(<?php echo $user['id']; ?>)">Dzēst</button>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </section>

            <section id="reports" class="content-section">
                <header class="content-header">
                    <h1>Atskaites un pārskati</h1>
                </header>
                
                <div class="reports-grid">
                    <div class="report-card">
                        <h3>Produktu atskaite</h3>
                        <p>Detalizēta informācija par visiem produktiem</p>
                        <button class="btn btn-secondary" onclick="generateProductReport()">Ģenerēt atskaiti</button>
                    </div>
                    <div class="report-card">
                        <h3>Lietotāju aktivitātes</h3>
                        <p>Lietotāju darbību pārskats</p>
                        <button class="btn btn-secondary" onclick="generateUserReport()">Ģenerēt atskaiti</button>
                    </div>
                    <div class="report-card">
                        <h3>Noliktavas pārskats</h3>
                        <p>Kopējais noliktavas stāvoklis</p>
                        <button class="btn btn-secondary" onclick="generateWarehouseReport()">Ģenerēt atskaiti</button>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <div id="modal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <div id="modal-body"></div>
        </div>
    </div>

    <script>
        function showSection(sectionId) {
            const sections = document.querySelectorAll('.content-section');
            sections.forEach(section => section.classList.remove('active'));
            
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            
            document.getElementById(sectionId).classList.add('active');
            
            event.target.closest('.nav-item').classList.add('active');
        }

        function showAddProductForm() {
            const form = `
                <h2>Pievienot jaunu produktu</h2>
                <form method="POST">
                    <input type="hidden" name="action" value="add_product">
                    <div class="form-group">
                        <label for="product_name">Produkta nosaukums:</label>
                        <input type="text" id="product_name" name="product_name" required>
                    </div>
                    <div class="form-group">
                        <label for="category">Kategorija:</label>
                        <input type="text" id="category" name="category" required>
                    </div>
                    <div class="form-group">
                        <label for="price">Cena:</label>
                        <input type="number" id="price" name="price" required>
                    </div>
                    <div class="form-group">
                        <label for="company">Firma:</label>
                        <input type="text" id="company" name="company" required>
                    </div>
                    <div class="form-group">
                        <label for="quantity">Daudzums:</label>
                        <input type="number" id="quantity" name="quantity" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Pievienot</button>
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Atcelt</button>
                    </div>
                </form>
            `;
            document.getElementById('modal-body').innerHTML = form;
            document.getElementById('modal').style.display = 'block';
        }

        function showAddUserForm() {
            const form = `
                <h2>Pievienot jaunu lietotāju</h2>
                <form method="POST">
                    <input type="hidden" name="action" value="add_user">
                    <div class="form-group">
                        <label for="user_name">Vārds:</label>
                        <input type="text" id="user_name" name="user_name" required>
                    </div>
                    <div class="form-group">
                        <label for="role">Loma:</label>
                        <select id="role" name="role" required>
                            <option value="">Izvēlēties lomu</option>
                            <option value="Administrātors">Administrātors</option>
                            <option value="Noliktavas darbinieks">Noliktavas darbinieks</option>
                            <option value="Plauktu Kārtotājs">Plauktu Kārtotājs</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="email">E-pasts:</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Pievienot</button>
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Atcelt</button>
                    </div>
                </form>
            `;
            document.getElementById('modal-body').innerHTML = form;
            document.getElementById('modal').style.display = 'block';
        }

        function editProduct(id) {
            alert('Rediģēt produktu ar ID: ' + id);
        }

        function deleteProduct(id) {
            if (confirm('Vai tiešām vēlaties dzēst šo produktu?')) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.innerHTML = `
                    <input type="hidden" name="action" value="delete_product">
                    <input type="hidden" name="product_id" value="${id}">
                `;
                document.body.appendChild(form);
                form.submit();
            }
        }

        function editUser(id) {
            alert('Rediģēt lietotāju ar ID: ' + id);
        }

        function deleteUser(id) {
            if (confirm('Vai tiešām vēlaties dzēst šo lietotāju?')) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.innerHTML = `
                    <input type="hidden" name="action" value="delete_user">
                    <input type="hidden" name="user_id" value="${id}">
                `;
                document.body.appendChild(form);
                form.submit();
            }
        }

        function generateProductReport() {
            alert('Ģenerē produktu atskaiti...');
        }

        function generateUserReport() {
            alert('Ģenerē lietotāju atskaiti...');
        }

        function generateWarehouseReport() {
            alert('Ģenerē noliktavas atskaiti...');
        }

        function closeModal() {
            document.getElementById('modal').style.display = 'none';
        }

        function logout() {
            if (confirm('Vai tiešām vēlaties iziet?')) {
                window.location.href = 'login.php';
            }
        }

        window.onclick = function(event) {
            const modal = document.getElementById('modal');
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
    </script>
</body>
</html>