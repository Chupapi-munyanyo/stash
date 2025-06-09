// Current user data
let currentUser = null;
let currentRole = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            updateUIForUser(currentUser);
            loadInitialData();
        } catch (error) {
            console.error('Error parsing stored user:', error);
            sessionStorage.removeItem('currentUser');
            showLogin();
        }
    } else {
        showLogin();
    }

    // Login form submission
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('api/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (data.success) {
                currentUser = data.user;
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                document.getElementById('login-container').style.display = 'none';
                document.getElementById('app-container').style.display = 'block';
                updateUIForUser(currentUser);
                loadInitialData();
                showNotification('Login successful!', 'success');
            } else {
                showNotification(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Error during login:', error);
            showNotification('An error occurred during login. Please try again.', 'error');
        }
    });

    // Registration form submission
    document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        await register();
    });
    
    // Navigation links
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showPage(this.getAttribute('data-page'));
        });
    });
    
    // Form submissions
    document.getElementById('add-product-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        addProduct();
    });
    
    document.getElementById('add-order-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        addOrder();
    });
    
    document.getElementById('add-user-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        addUser();
    });
    
    document.getElementById('edit-user-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveEditedUser();
    });

    document.getElementById('edit-product-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        await updateProduct();
    });

    // Initialize mobile menu
    handleMobileMenu();
    window.addEventListener('resize', handleMobileMenu);

    // Add input event listeners for real-time validation
    document.getElementById('username').addEventListener('input', function() {
        this.value = this.value.trim();
        validateUsername(this.value);
    });
    document.getElementById('password').addEventListener('input', function() {
        this.value = this.value.trim();
        validatePassword(this.value);
    });

    // Registration form validation (assuming #reg-username etc. exist)
    document.getElementById('reg-username')?.addEventListener('input', function() {
        this.value = this.value.trim();
        validateUsername(this.value);
    });
    document.getElementById('reg-password')?.addEventListener('input', function() {
        this.value = this.value.trim();
        validatePassword(this.value);
    });
    document.getElementById('reg-fullname')?.addEventListener('input', function() {
        validateFullName(this.value);
    });

    // User form validation (for add/edit user modals)
    document.getElementById('user-username')?.addEventListener('input', function() {
        this.value = this.value.trim();
        validateUsername(this.value);
    });
    document.getElementById('user-password')?.addEventListener('input', function() {
        this.value = this.value.trim();
        validatePassword(this.value);
    });
    document.getElementById('user-fullname')?.addEventListener('input', function() {
        validateFullName(this.value);
    });
    document.getElementById('edit-fullname')?.addEventListener('input', function() {
        validateFullName(this.value);
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            const sidebar = document.querySelector('.sidebar');
            const menuToggle = document.querySelector('.mobile-menu-toggle');
            
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('active')) {
                toggleSidebar();
            }
        }
    });
});

// Validation functions
function validateUsername(username) {
    if (!username || username.length < 3) {
        showNotification('Lietotājvārdam jābūt vismaz 3 rakstzīmes garam!', 'error');
        return false;
    }
    if (username.includes(' ')) {
        showNotification('Lietotājvārds nedrīkst saturēt atstarpes!', 'error');
        return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showNotification('Lietotājvārds var saturēt tikai burtus, ciparus un apakšsvītru!', 'error');
        return false;
    }
    return true;
}

function validatePassword(password) {
    if (!password || password.length < 3) {
        showNotification('Parolei jābūt vismaz 3 rakstzīmes garai!', 'error');
        return false;
    }
    if (password.includes(' ')) {
        showNotification('Parole nedrīkst saturēt atstarpes!', 'error');
        return false;
    }
    if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(password)) {
        showNotification('Parole var saturēt tikai burtus, ciparus un speciālos simbolus!', 'error');
        return false;
    }
    return true;
}

function validateFullName(fullName) {
    if (!fullName || fullName.length < 3) {
        showNotification('Vārdam jābūt vismaz 3 rakstzīmes garam!', 'error');
        return false;
    }
    if (/[0-9]/.test(fullName)) {
        showNotification('Vārds nedrīkst saturēt ciparus!', 'error');
        return false;
    }
    if (!/^[a-zA-ZāĀčČēĒģĢīĪķĶļĻņŅšŠūŪžŽ\s]+$/.test(fullName)) {
        showNotification('Vārds var saturēt tikai burtus un atstarpes!', 'error');
        return false;
    }
    return true;
}

function validateRole(role) {
    if (!role) {
        showNotification('Loma ir obligāta!', 'error');
        return false;
    }
    return true;
}

// Show / hide pages
function showLogin() {
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const appContainer = document.getElementById('app-container');

    if (loginContainer) loginContainer.style.display = 'flex';
    if (registerContainer) registerContainer.style.display = 'none';
    if (appContainer) appContainer.style.display = 'none';
}

function showRegisterForm() {
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const appContainer = document.getElementById('app-container');

    if (loginContainer) loginContainer.style.display = 'none';
    if (registerContainer) registerContainer.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
}

function showLoginForm() {
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const appContainer = document.getElementById('app-container');

    if (registerContainer) registerContainer.style.display = 'none';
    if (loginContainer) loginContainer.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
}

function updateUIForUser(user) {
    if (!user) {
        // If no user, show login screen and hide app content
        const loginContainer = document.getElementById('login-container');
        const appContainer = document.getElementById('app-container');
        if (loginContainer) loginContainer.style.display = 'flex';
        if (appContainer) appContainer.style.display = 'none';
        return;
    }

    // Update user info in sidebar
    const currentUserElement = document.getElementById('current-user');
    const currentRoleElement = document.getElementById('current-role');
    if (currentUserElement) currentUserElement.textContent = user.full_name;
    if (currentRoleElement) currentRoleElement.textContent = user.role;

    // Show/hide menu items based on role
    const navLinks = document.querySelectorAll('.nav-menu .nav-item');
    navLinks.forEach(item => {
        const link = item.querySelector('.nav-link');
        if (link) {
            const dataPage = link.getAttribute('data-page'); // Get data-page attribute
            const dataRoles = link.getAttribute('data-roles');
            
            // Check if it's a "page" link (has data-page attribute)
            if (dataPage) {
                if (dataRoles) {
                    const allowedRoles = dataRoles.split(',');
                    if (allowedRoles.includes(user.role)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                } else {
                    // Always show links without data-roles (e.g., Home, Logout)
                    item.style.display = 'block';
                }
            } else {
                // For logout or other non-page links, ensure they are visible
                item.style.display = 'block';
            }
        }
    });

    // Show main content and hide login
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    if (loginContainer) loginContainer.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';
}

async function loadInitialData() {
    if (currentUser) {
        await loadProducts();
        await loadOrders();
        if (currentUser.role === 'admin') {
            await loadUsers();
        }
    }
}

// User Management Functions
async function loadUsers() {
    try {
        const response = await fetch('api/users.php');
        const data = await response.json();
        
        if (data.success) {
            console.log('Users fetched successfully:', data.users);
            renderUsersTable(data.users || []);
        } else {
            showNotification(data.message || 'Error loading users', 'error');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Error loading users', 'error');
    }
}

async function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const fullName = document.getElementById('reg-fullname').value;

    if (!validateUsername(username) || !validatePassword(password) || !validateFullName(fullName)) {
        return;
    }

    try {
        const response = await fetch('api/users.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                username, 
                password, 
                full_name: fullName, 
                role: 'pending', 
                status: 'pending' 
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Registration successful! Please wait for admin approval.', 'success');
            showLoginForm();
            document.getElementById('register-form').reset();
        } else {
            showNotification(data.message || 'Error during registration', 'error');
        }
    } catch (error) {
        console.error('Error during registration:', error);
        showNotification('An error occurred during registration. Please try again.', 'error');
    }
}

async function addUser() {
    const username = document.getElementById('user-username').value;
    const password = document.getElementById('user-password').value;
    const fullName = document.getElementById('user-fullname').value;
    const role = document.getElementById('user-role').value;
    const status = 'pending'; // Default status for new users, as there's no status field in add-user-modal

    if (!validateUsername(username) || !validatePassword(password) || !validateFullName(fullName) || !validateRole(role)) {
        return;
    }

    try {
        const response = await fetch('api/users.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, full_name: fullName, role, status })
        });

        const data = await response.json();
        if (data.success) {
            showNotification('User added successfully', 'success');
            closeModal('add-user-modal'); // Corrected modal ID
            loadUsers(); // Reload users after adding
        } else {
            showNotification(data.message || 'Error adding user', 'error');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        showNotification('Error adding user', 'error');
    }
}

async function editUser(userId) {
    try {
        const response = await fetch(`api/users.php?id=${userId}`);
        const data = await response.json();
        
        if (data.success && data.user) {
            const user = data.user;
            document.querySelector('#editUserForm input[name="userId"]').value = user.id;
            document.querySelector('#edit-user-username-input').value = user.username;
            document.querySelector('#edit-user-username-input').disabled = false; // Enable username editing
            document.querySelector('#edit-user-fullName').value = user.full_name;
            document.querySelector('#edit-user-role').value = user.role;
            document.querySelector('#edit-user-status').value = user.status;
            
            openModal('editUserModal');
        } else {
            showNotification('Kļūda ielādējot lietotāja datus', 'error');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Kļūda ielādējot lietotāja datus', 'error');
    }
}

async function updateUser(event) {
    event.preventDefault();
    
    const form = event.target;
    const userId = form.querySelector('input[name="userId"]').value;
    const username = form.querySelector('#edit-user-username-input').value;
    const fullName = form.querySelector('#edit-user-fullName').value;
    const role = form.querySelector('#edit-user-role').value;
    const status = form.querySelector('#edit-user-status').value;

    const userData = {
        id: parseInt(userId),
        username: username,
        full_name: fullName,
        role: role,
        status: status
    };

    try {
        const response = await fetch('api/users.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Lietotājs veiksmīgi atjaunināts', 'success');
            closeModal('editUserModal');
            loadUsers(); // Reload the users table
        } else {
            showNotification(data.message || 'Kļūda atjauninot lietotāju', 'error');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showNotification('Kļūda atjauninot lietotāju', 'error');
    }
}

async function deleteUser(id) {
    if (!confirm('Vai tiešām vēlaties dzēst šo lietotāju?')) {
        return;
    }

    try {
        const response = await fetch('api/users.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: parseInt(id) })
        });

        const data = await response.json();
        if (data.status === 'success') {
            showNotification('Lietotājs veiksmīgi dzēsts', 'success');
            // Remove the user row from the table
            const userRow = document.querySelector(`#users-table tr[data-user-id="${id}"]`);
            if (userRow) {
                userRow.remove();
            }
            // Update stats
            updateHomeStats();
        } else {
            showNotification(data.message || 'Kļūda dzēšot lietotāju', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Kļūda dzēšot lietotāju', 'error');
    }
}

// Product Management Functions
async function loadProducts() {
    try {
        const response = await fetch('api/products.php');
        const data = await response.json();
        if (data.success) {
            renderProductsTable(data.products);
        } else {
            showNotification('Error loading products', 'error');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products', 'error');
    }
}

async function addProduct() {
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = document.getElementById('product-price').value;
    const quantity = document.getElementById('product-quantity').value;
    const companyId = document.getElementById('product-company').value;

    if (!validateProductData(name, price, quantity)) {
        return;
    }

    try {
        const response = await fetch('api/products.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
        name,
        category,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                company_id: companyId || null
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Product added successfully', 'success');
            closeModal('add-product-modal');
            document.getElementById('add-product-form').reset();
            loadProducts();
        } else {
            showNotification(data.message || 'Error adding product', 'error');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showNotification('Error adding product', 'error');
    }
}

async function editProduct(productId) {
    try {
        const response = await fetch(`api/products.php?id=${productId}`);
        const data = await response.json();
        
        if (data.success) {
            const product = data.product;
            
            // Populate the edit form
            document.getElementById('edit-product-id').value = product.id;
            document.getElementById('edit-product-name').value = product.name || '';
            document.getElementById('edit-product-category').value = product.category_name || '';
            document.getElementById('edit-product-price').value = product.price || '';
            document.getElementById('edit-product-quantity').value = product.quantity || '';
            document.getElementById('edit-product-company').value = product.company_id || '';
            
            // Show the modal
            openModal('edit-product-modal');
        } else {
            showNotification(data.message || 'Error fetching product data', 'error');
        }
    } catch (error) {
        console.error('Error fetching product data:', error);
        showNotification('Error fetching product data', 'error');
    }
}

async function updateProduct() {
    const id = document.getElementById('edit-product-id').value;
    const name = document.getElementById('edit-product-name').value;
    const category = document.getElementById('edit-product-category').value;
    const price = document.getElementById('edit-product-price').value;
    const quantity = document.getElementById('edit-product-quantity').value;
    const companyId = document.getElementById('edit-product-company').value;

    if (!validateProductData(name, price, quantity)) {
        return;
    }

    try {
        const response = await fetch('api/products.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id,
                name,
                category,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                company_id: companyId || null
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Product updated successfully', 'success');
            closeModal('edit-product-modal');
            loadProducts();
        } else {
            showNotification(data.message || 'Error updating product', 'error');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showNotification('Error updating product', 'error');
    }
}

function validateProductData(name, price, quantity) {
    if (!name) {
        showNotification('Product name is required', 'error');
        return false;
    }
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
        showNotification('Valid price is required', 'error');
        return false;
    }
    if (!quantity || isNaN(quantity) || parseInt(quantity) < 0) {
        showNotification('Valid quantity is required', 'error');
        return false;
    }
    return true;
}

function renderProductsTable(products) {
    const productsTableBody = document.querySelector('#products-table tbody');
    if (!productsTableBody) {
        console.error('Products table body not found!');
        showNotification('Error: Products table not found.', 'error');
        return;
    }
    productsTableBody.innerHTML = '';
    products.forEach(product => {
        const row = productsTableBody.insertRow();
        row.innerHTML = `
            <td>${product.name || 'N/A'}</td>
            <td>${product.category_name || 'N/A'}</td>
            <td>${parseFloat(product.price || 0).toFixed(2)}</td>
            <td>${product.company_id || 'N/A'}</td>
            <td>${product.quantity || 0}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Dzēst</button>
                    <button class="btn btn-secondary btn-sm" onclick="editProduct(${product.id})">Rediģēt</button>
                </div>
            </td>
        `;
    });
}

async function deleteProduct(id) {
    if (!confirm('Vai tiešām vēlaties dzēst šo produktu?')) {
        return;
    }

    try {
        const response = await fetch('api/products.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id })
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Produkts veiksmīgi dzēsts', 'success');
            loadProducts(); // Reload the products table
        } else {
            showNotification(data.message || 'Kļūda dzēšot produktu', 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Kļūda dzēšot produktu', 'error');
    }
}

// Order Management Functions
async function loadOrders() {
    try {
        console.log('Starting to load orders...');
        const response = await fetch('api/orders.php');
        console.log('Orders API Response:', response);
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('Parsed orders data:', data);
        
        if (data.status === 'success') {
            console.log('Success status confirmed, data:', data.data);
            const tbody = document.querySelector('#orders-table tbody');
            console.log('Found table body:', tbody);
            if (tbody) {
                renderOrdersTable(data.data);
                updateHomeStats();
            } else {
                console.error('Orders table body not found in DOM');
                showNotification('Error: Orders table not found', 'error');
            }
        } else {
            console.error('API returned non-success status:', data);
            showNotification('Error loading orders: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error in loadOrders:', error);
        showNotification('Error loading orders: ' + error.message, 'error');
    }
}

async function addOrder() {
    const created_by = currentUser.id; // Get ID from current user
    const items = [];

    document.querySelectorAll('.order-item').forEach(itemGroup => { // Corrected to .order-item
        const productId = itemGroup.querySelector('.order-product').value; // Corrected to .order-product
        const quantity = parseInt(itemGroup.querySelector('.order-quantity').value); // Corrected to .order-quantity
        if (productId && quantity > 0) {
            items.push({ product_id: productId, quantity: quantity });
        }
    });

    if (items.length === 0) {
        showNotification('Please add at least one product to the order.', 'error');
        return;
    }

    try {
        const response = await fetch('api/orders.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ created_by, items })
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Order created successfully', 'success');
            document.getElementById('add-order-form').reset();
            document.getElementById('order-items-container').innerHTML = ''; // Clear items
            // Re-add one empty item after clearing, for a fresh start
            addOrderItem();
            closeModal('add-order-modal'); // Corrected modal ID
            loadOrders();
            loadProducts(); // Products quantity might have changed
        } else {
            showNotification(data.message || 'Error creating order', 'error');
        }
    } catch (error) {
        console.error('Error creating order:', error);
        showNotification('Error creating order', 'error');
    }
}

async function completeOrder(id) {
    if (!confirm('Vai tiešām vēlaties pabeigt šo pasūtījumu?')) return;

    try {
        const response = await fetch('api/orders.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, status: 'completed' })
        });

        const data = await response.json();
        if (data.status === 'success') {
            showNotification('Pasūtījums veiksmīgi pabeigts', 'success');
            // Remove the order from the table
            const orderRow = document.querySelector(`#orders-table tr[data-order-id="${id}"]`);
            if (orderRow) {
                orderRow.remove();
            }
            // Update stats
            updateHomeStats();
        } else {
            showNotification(data.message || 'Kļūda pabeidzot pasūtījumu', 'error');
        }
    } catch (error) {
        console.error('Error completing order:', error);
        showNotification('Kļūda pabeidzot pasūtījumu', 'error');
    }
}

async function cancelOrder(id) {
    if (!confirm('Vai tiešām vēlaties atcelt šo pasūtījumu?')) return;

    try {
        const response = await fetch('api/orders.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, status: 'cancelled' })
        });

        const data = await response.json();
        if (data.status === 'success') {
            showNotification('Pasūtījums veiksmīgi atcelts', 'success');
            // Remove the order from the table
            const orderRow = document.querySelector(`#orders-table tr[data-order-id="${id}"]`);
            if (orderRow) {
                orderRow.remove();
            }
            // Update stats
            updateHomeStats();
        } else {
            showNotification(data.message || 'Kļūda atceļot pasūtījumu', 'error');
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        showNotification('Kļūda atceļot pasūtījumu', 'error');
    }
}

// Render Tables
function renderUsersTable(users) {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) {
        console.error('Error: #users-table tbody not found. Users cannot be rendered.');
        showNotification('Error: User table not found on page.', 'error');
        return;
    }
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-user-id', user.id);
        tr.innerHTML = `
            <td>${user.username || 'N/A'}</td>
            <td>${user.full_name || 'N/A'}</td>
            <td>${user.role || 'N/A'}</td>
            <td>${user.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}</td>
            <td>
                <span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}">
                    ${user.status || 'inactive'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i> Rediģēt
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i> Dzēst
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderOrdersTable(orders) {
    console.log('Starting to render orders table with data:', orders);
    const tbody = document.querySelector('#orders-table tbody');
    if (!tbody) {
        console.error('Orders table body not found!');
        showNotification('Error: Orders table not found.', 'error');
        return;
    }
    
    console.log('Clearing existing table content');
    tbody.innerHTML = '';
    
    console.log('Processing orders:', orders);
    orders.forEach((order, index) => {
        console.log(`Processing order ${index + 1}:`, order);
        const tr = document.createElement('tr');
        tr.setAttribute('data-order-id', order.id); // Add data attribute for order ID
        
        let productList = '';
        if (order.items && Array.isArray(order.items)) {
            productList = order.items.map(item => `${item.product_name || 'N/A'} (${item.quantity || 'N/A'})`).join(', ');
        } else {
            productList = 'N/A';
        }
        console.log(`Product list for order ${index + 1}:`, productList);

        tr.innerHTML = `
            <td>${order.order_number || 'N/A'}</td>
            <td>${order.status || 'N/A'}</td>
            <td>${order.created_by_username || 'N/A'}</td>
            <td>${productList}</td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-success btn-sm" onclick="completeOrder(${order.id})">Pabeigt</button>
                    <button class="btn btn-danger btn-sm" onclick="cancelOrder(${order.id})">Atcelt</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    console.log('Finished rendering orders table');
}

// Dashboard Stats
async function updateHomeStats() {
    try {
        const productsResponse = await fetch('api/products.php');
        const productsData = await productsResponse.json();
        if (productsData.status === 'success') {
            const totalProductsElement = document.getElementById('total-products');
            if (totalProductsElement) { // Added null check
                totalProductsElement.textContent = productsData.data.length;
            }
        }

        const ordersResponse = await fetch('api/orders.php');
        const ordersData = await ordersResponse.json();
        if (ordersData.status === 'success') {
            const totalOrdersElement = document.getElementById('total-orders');
            if (totalOrdersElement) { // Added null check
                totalOrdersElement.textContent = ordersData.data.length;
            }
        }

        const usersResponse = await fetch('api/users.php');
        const usersData = await usersResponse.json();
        if (usersData.status === 'success') {
            const totalUsersElement = document.getElementById('total-users');
            if (totalUsersElement) { // Added null check
                totalUsersElement.textContent = usersData.data.length;
            }
        }
    } catch (error) {
        console.error('Error updating home stats:', error);
        showNotification('Error updating dashboard stats', 'error');
    }
}

// Show specific page
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    // Show selected page
    const targetPageElement = document.getElementById(`${pageId}-page`);
    if (targetPageElement) {
        targetPageElement.style.display = 'block';
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Load page data after a small delay to ensure DOM is ready
        setTimeout(() => {
            if (pageId === 'home') {
                updateHomeStats();
            } else if (pageId === 'products') {
                loadProducts();
            } else if (pageId === 'orders') {
                console.log('Loading orders page...');
                loadOrders();
            } else if (pageId === 'users') {
                loadUsers();
            }
        }, 100);
    } else {
        console.error(`Page element with ID ${pageId}-page not found!`);
        showNotification(`Error: Page not found.`, 'error');
    }
}

// Modals
function openModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
        modalElement.classList.add('active'); // Add active class to show
    } else {
        console.error(`Modal element with ID ${modalId} not found!`);
        showNotification(`Error: Modal not found.`, 'error');
    }
}

function closeModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
        modalElement.classList.remove('active'); // Remove active class to hide
        // Reset forms when closing modal
        const form = modalElement.querySelector('form');
        if (form) {
            form.reset();
        }
    } else {
        console.error(`Modal element with ID ${modalId} not found!`);
    }
}

// Order Item Management for Add Order Modal
let orderItemCounter = 0;
async function addOrderItem() {
    orderItemCounter++;
    const orderItemsContainer = document.getElementById('order-items-container');
    const productSelectOptions = await getProductSelectOptions(); // Fetch products dynamically

    const itemGroup = document.createElement('div');
    itemGroup.classList.add('order-item'); // Changed from order-item-group to order-item
    itemGroup.innerHTML = `
        <div class="form-group" style="flex: 2;">
            <label>Produkts:</label>
            <select name="orderProduct" class="order-product" required>
                ${productSelectOptions}
            </select>
        </div>
        <div class="form-group">
            <label>Daudzums:</label>
            <input type="number" name="orderQuantity" class="order-quantity" min="1" value="1" required>
        </div>
        <button type="button" class="btn btn-danger btn-sm" onclick="removeOrderItem(this)">✕</button>
    `;
    if (orderItemsContainer) { // Added null check
        orderItemsContainer.appendChild(itemGroup);
    }
}

async function getProductSelectOptions() {
    try {
        const response = await fetch('api/products.php');
        const data = await response.json();
        if (data.success) {
            let options = '<option value="">Izvēlieties produktu</option>';
            data.products.forEach(product => {
                options += `<option value="${product.id}">${product.name} (${product.quantity})</option>`;
            });
            return options;
        } else {
            showNotification('Error fetching products for order item', 'error');
            return '';
        }
    } catch (error) {
        console.error('Error fetching products for order item:', error);
        showNotification('Error fetching products for order item', 'error');
        return '';
    }
}

function removeOrderItem(button) {
    button.closest('.order-item').remove(); // Changed from .order-item-group to .order-item
}

// General UI functions
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) {
        console.error('Notification container not found!');
        return;
    }
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => {
        notification.className = 'notification';
    }, 3000);
}

// Sidebar functions
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) { // Added null check
    sidebar.classList.toggle('active');
    }
}

function handleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    if (window.innerWidth <= 768) {
        if (menuToggle) menuToggle.style.display = 'block';
        if (sidebar) sidebar.classList.remove('active'); // Ensure it's closed on small screens initially
        if (menuToggle) {
            menuToggle.onclick = toggleSidebar;
        }
    } else {
        if (menuToggle) menuToggle.style.display = 'none';
        if (sidebar) sidebar.classList.add('active'); // Ensure it's open on larger screens
    }
}

// Logout function
function logout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    showLogin();
}

async function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const dateFrom = document.getElementById('report-date-from').value;
    const dateTo = document.getElementById('report-date-to').value;

    try {
        const response = await fetch('api/reports.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: reportType,
                date_from: dateFrom,
                date_to: dateTo
            })
        });

        const data = await response.json();
        if (data.success) {
            const reportResults = document.getElementById('report-results');
            const reportContent = document.getElementById('report-content');
            
            reportResults.style.display = 'block';
            reportContent.innerHTML = '';

            // Create table based on report type
            const table = document.createElement('table');
            table.className = 'table';
            
            // Add headers based on report type
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            switch(reportType) {
                case 'products':
                    headerRow.innerHTML = `
                        <th>Produkts</th>
                        <th>Kategorija</th>
                        <th>Kopā pārdots</th>
                        <th>Kopējā vērtība (€)</th>
                    `;
                    break;
                case 'orders':
                    headerRow.innerHTML = `
                        <th>Pasūtījuma ID</th>
                        <th>Datums</th>
                        <th>Statuss</th>
                        <th>Kopējā vērtība (€)</th>
                    `;
                    break;
                case 'inventory':
                    headerRow.innerHTML = `
                        <th>Produkts</th>
                        <th>Pašreizējais daudzums</th>
                        <th>Minimālais daudzums</th>
                        <th>Statuss</th>
                    `;
                    break;
            }
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Add data rows
            const tbody = document.createElement('tbody');
            data.data.forEach(item => {
                const row = document.createElement('tr');
                switch(reportType) {
                    case 'products':
                        row.innerHTML = `
                            <td>${item.product_name || 'N/A'}</td>
                            <td>${item.category_name || 'N/A'}</td>
                            <td>${item.total_sold || 0}</td>
                            <td>${parseFloat(item.total_value || 0).toFixed(2)}</td>
                        `;
                        break;
                    case 'orders':
                        row.innerHTML = `
                            <td>${item.order_number || 'N/A'}</td>
                            <td>${new Date(item.created_at).toLocaleDateString()}</td>
                            <td><span class="badge badge-${item.status}">${item.status}</span></td>
                            <td>${parseFloat(item.total_value || 0).toFixed(2)}</td>
                        `;
                        break;
                    case 'inventory':
                        row.innerHTML = `
                            <td>${item.product_name || 'N/A'}</td>
                            <td>${item.current_quantity || 0}</td>
                            <td>${item.min_quantity || 0}</td>
                            <td><span class="badge badge-${item.current_quantity <= item.min_quantity ? 'danger' : 'success'}">${item.current_quantity <= item.min_quantity ? 'Zems krājums' : 'OK'}</span></td>
                        `;
                        break;
                }
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            reportContent.appendChild(table);
        } else {
            showNotification(data.message || 'Error generating report', 'error');
        }
    } catch (error) {
        console.error('Error generating report:', error);
        showNotification('Error generating report', 'error');
    }
}
