// Demo users for authentication (since API is not available)
const demoUsers = [
    {
        id: 1,
        username: 'admin',
        password: 'admin123',
        full_name: 'Administrators',
        role: 'admin',
        status: 'active'
    },
    {
        id: 2,
        username: 'worker',
        password: 'worker123',
        full_name: 'Noliktavas darbinieks',
        role: 'worker',
        status: 'active'
    },
    {
        id: 3,
        username: 'organizer',
        password: 'org123',
        full_name: 'Plauktu kārtotājs',
        role: 'organizer',
        status: 'active'
    },
    {
        id: 4,
        username: 'user',
        password: 'user123',
        full_name: 'Parastais lietotājs',
        role: 'user',
        status: 'active'
    }
];

// Demo data for products and orders
let demoProducts = [
    {
        id: 1,
        name: 'Milti',
        category_name: 'Pulveris',
        price: 12.00,
        company_id: 'Raicha',
        quantity: 12
    },
    {
        id: 2,
        name: 'Ūdens',
        category_name: 'Šķidrums',
        price: 1.50,
        company_id: 'Raicha',
        quantity: 1111
    },
    {
        id: 3,
        name: 'Tabletes',
        category_name: 'Tabletes',
        price: 25.99,
        company_id: 'Raicha',
        quantity: 12
    }
];

let demoOrders = [
    {
        id: 1,
        order_number: 'ORD001',
        status: 'Gaida',
        created_by_username: 'Jānis Bērziņš',
        items: [
            { product_name: 'Milti', quantity: 2 },
            { product_name: 'Ūdens', quantity: 5 }
        ],
        created_at: '2023-10-26'
    },
    {
        id: 2,
        order_number: 'ORD002',
        status: 'Pabeigts',
        created_by_username: 'Anna Liepa',
        items: [
            { product_name: 'Milti', quantity: 1 },
            { product_name: 'Tabletes', quantity: 3 }
        ],
        created_at: '2023-10-25'
    }
];

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
        if (!validateForm('login-form')) return;
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

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
                showNotification('Pieslēgšanās veiksmīga!', 'success');
            } else {
                showNotification(data.message || 'Nepareizs lietotājvārds vai parole!', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Kļūda pieslēdzoties!', 'error');
        }
    });

    // Registration form submission
    document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!validateForm('register-form')) return;
        await register();
    });
    
    // Navigation links
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showPage(this.getAttribute('data-page'));
        });
    });
    
    // Form submissions with validation
    document.getElementById('add-product-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!validateForm('add-product-form')) {
            showNotification('Lūdzu aizpildiet visus obligātos laukus pareizi!', 'error');
            return;
        }
        addProduct(e);
    });
    
    document.getElementById('add-order-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!validateForm('add-order-form')) {
            showNotification('Lūdzu aizpildiet visus obligātos laukus pareizi!', 'error');
            return;
        }
        addOrder(e);
    });
    
    document.getElementById('add-user-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!validateForm('addUserForm')) {
            showNotification('Lūdzu aizpildiet visus obligātos laukus pareizi!', 'error');
            return;
        }
        addUser(e);
    });
    
    document.getElementById('edit-user-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!validateForm('editUserForm')) {
            showNotification('Lūdzu aizpildiet visus obligātos laukus pareizi!', 'error');
            return;
        }
        await updateUser(e);
    });

    document.getElementById('edit-product-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!validateForm('edit-product-form')) {
            showNotification('Lūdzu aizpildiet visus obligātos laukus pareizi!', 'error');
            return;
        }
        await updateProduct(e);
    });

    // Initialize mobile menu
    handleMobileMenu();
    window.addEventListener('resize', handleMobileMenu);

    // Add real-time validation for all input fields
    setupRealTimeValidation();

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

// Setup real-time validation for all input fields
function setupRealTimeValidation() {
    // Get all input fields with data-validation attribute
    const inputs = document.querySelectorAll('input[data-validation], select[data-validation]');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateField(this);
        });
        
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        // For select elements, also listen for change event
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', function() {
                validateField(this);
            });
        }
    });
}

// Comprehensive validation functions
function validateField(field) {
    const validationType = field.getAttribute('data-validation');
    const value = field.value.trim();
    const errorElement = document.getElementById(field.id + '-error');
    
    if (!errorElement) return true;
    
    let isValid = true;
    let errorMessage = '';
    
    switch (validationType) {
        case 'username':
            isValid = validateUsername(value);
            if (!isValid) errorMessage = 'Lietotājvārdam jābūt vismaz 3 rakstzīmes garam un nedrīkst saturēt atstarpes!';
            break;
        case 'password':
            isValid = validatePassword(value);
            if (!isValid) errorMessage = 'Parolei jābūt vismaz 3 rakstzīmes garai un nedrīkst saturēt atstarpes!';
            break;
        case 'fullname':
            isValid = validateFullName(value);
            if (!isValid) errorMessage = 'Vārdam jābūt vismaz 3 rakstzīmes garam un var saturēt tikai burtus un atstarpes!';
            break;
        case 'product-name':
            isValid = validateProductName(value);
            if (!isValid) errorMessage = 'Produkta nosaukumam jābūt vismaz 2 rakstzīmes garam un nedrīkst būt tukšs vai saturēt tikai punktus!';
            break;
        case 'category':
            isValid = validateCategory(value);
            if (!isValid) errorMessage = 'Kategorijai jābūt vismaz 2 rakstzīmes garai un nedrīkst būt tukša vai saturēt tikai punktus!';
            break;
        case 'price':
            isValid = validatePrice(value);
            if (!isValid) errorMessage = 'Cenai jābūt pozitīvam skaitlim!';
            break;
        case 'quantity':
            isValid = validateQuantity(value);
            if (!isValid) errorMessage = 'Daudzumam jābūt pozitīvam veselam skaitlim!';
            break;
        case 'company':
            isValid = validateCompany(value);
            if (!isValid) errorMessage = 'Firmas ID jābūt vismaz 2 rakstzīmes garam un nedrīkst būt tukšs vai saturēt tikai punktus!';
            break;
        case 'role':
            isValid = validateRole(value);
            if (!isValid) errorMessage = 'Lūdzu izvēlieties lomu!';
            break;
        case 'status':
            isValid = validateStatus(value);
            if (!isValid) errorMessage = 'Lūdzu izvēlieties statusu!';
            break;
        case 'order-product':
            isValid = validateOrderProduct(value);
            if (!isValid) errorMessage = 'Lūdzu izvēlieties produktu!';
            break;
        case 'order-quantity':
            isValid = validateOrderQuantity(value);
            if (!isValid) errorMessage = 'Daudzumam jābūt pozitīvam veselam skaitlim!';
            break;
    }
    
    // Update error display
    if (isValid) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        field.classList.remove('error');
    } else {
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
        field.classList.add('error');
    }
    
    return isValid;
}

// Validate entire form
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;
    
    const fields = form.querySelectorAll('input[data-validation], select[data-validation]');
    let isValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Individual validation functions
function validateUsername(username) {
    if (!username || username.length < 3) return false;
    if (username.trim() !== username) return false; // No leading/trailing spaces
    if (username.includes(' ')) return false; // No spaces
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return false; // Only letters, numbers, underscore
    return true;
}

function validatePassword(password) {
    if (!password || password.length < 3) return false;
    if (password.trim() !== password) return false; // No leading/trailing spaces
    if (password.includes(' ')) return false; // No spaces
    if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(password)) return false;
    return true;
}

function validateFullName(fullName) {
    if (!fullName || fullName.length < 3) return false;
    if (fullName.trim() !== fullName) return false; // No leading/trailing spaces
    if (/[0-9]/.test(fullName)) return false; // No numbers
    if (!/^[a-zA-ZāĀčČēĒģĢīĪķĶļĻņŅšŠūŪžŽ\s]+$/.test(fullName)) return false;
    return true;
}

function validateProductName(name) {
    if (!name || name.length < 2) return false;
    if (name.trim() !== name) return false; // No leading/trailing spaces
    if (name.trim().length === 0) return false; // Not just spaces
    if (name.trim() === '.') return false; // Not just a dot
    if (name.trim() === '...') return false; // Not just dots
    if (/^\.+$/.test(name.trim())) return false; // Not just multiple dots
    return true;
}

function validateCategory(category) {
    if (!category || category.length < 2) return false;
    if (category.trim() !== category) return false; // No leading/trailing spaces
    if (category.trim().length === 0) return false; // Not just spaces
    if (category.trim() === '.') return false; // Not just a dot
    if (category.trim() === '...') return false; // Not just dots
    if (/^\.+$/.test(category.trim())) return false; // Not just multiple dots
    return true;
}

function validatePrice(price) {
    if (!price || isNaN(price)) return false;
    const numPrice = parseFloat(price);
    if (numPrice <= 0) return false;
    return true;
}

function validateQuantity(quantity) {
    if (!quantity || isNaN(quantity)) return false;
    const numQuantity = parseInt(quantity);
    if (numQuantity <= 0 || !Number.isInteger(numQuantity)) return false;
    return true;
}

function validateCompany(company) {
    if (!company || company.length < 2) return false;
    if (company.trim() !== company) return false; // No leading/trailing spaces
    if (company.trim().length === 0) return false; // Not just spaces
    if (company.trim() === '.') return false; // Not just a dot
    if (company.trim() === '...') return false; // Not just dots
    if (/^\.+$/.test(company.trim())) return false; // Not just multiple dots
    return true;
}

function validateRole(role) {
    if (!role || role === '') return false;
    const validRoles = ['user', 'admin', 'worker', 'organizer'];
    return validRoles.includes(role);
}

function validateStatus(status) {
    if (!status || status === '') return false;
    const validStatuses = ['active', 'inactive'];
    return validStatuses.includes(status);
}

function validateOrderProduct(product) {
    if (!product || product === '') return false;
    return true;
}

function validateOrderQuantity(quantity) {
    if (!quantity || isNaN(quantity)) return false;
    const numQuantity = parseInt(quantity);
    if (numQuantity <= 0 || !Number.isInteger(numQuantity)) return false;
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
        
        // Remove user role class from body
        document.body.classList.remove('user-role-user');
        return;
    }

    // Debug: Log user role
    console.log('User role:', user.role);
    console.log('User data:', user);

    // Add or remove user role class from body
    if (user.role === 'user') {
        document.body.classList.add('user-role-user');
    } else {
        document.body.classList.remove('user-role-user');
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
            
            // Special handling for "user" role - only show orders and logout
            if (user.role === 'user') {
                if (dataPage === 'orders' || !dataPage) { // Show orders and logout (logout has no data-page)
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            } else {
                // For other roles, use the existing logic
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
        }
    });

    // Show main content and hide login
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    if (loginContainer) loginContainer.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';

    // Auto-redirect "user" role to orders page (not home)
    if (user.role === 'user') {
        // Hide all pages first
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
        });
        
        // Show orders page for users
        const ordersPage = document.getElementById('orders-page');
        if (ordersPage) {
            ordersPage.style.display = 'block';
            ordersPage.classList.add('active');
        }
        
        // Update navigation active state
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        const ordersLink = document.querySelector('.nav-link[data-page="orders"]');
        if (ordersLink) {
            ordersLink.classList.add('active');
        }
        
        // Show welcome notification for users
        showNotification(`Laipni lūdzam, ${user.full_name}! Jūs varat veikt pasūtījumus.`, 'success');
    }
}

async function loadInitialData() {
    if (currentUser) {
        // Load orders for all users
        await loadOrders();
        
        // Load additional data based on role
        if (currentUser.role !== 'user') {
            await loadProducts();
            if (currentUser.role === 'admin') {
                await loadUsers();
            }
        }
    }
}

// User Management Functions
async function loadUsers() {
    try {
        const response = await fetch('api/users.php');
        const data = await response.json();
        
        if (data.success) {
            renderUsersTable(data.users);
        } else {
            showNotification('Error loading users: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Error loading users', 'error');
    }
}

async function register() {
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const fullName = document.getElementById('reg-fullname').value.trim();

    try {
        const response = await fetch('api/users.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                full_name: fullName,
                role: 'user',
                status: 'active'
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Reģistrācija veiksmīga! Jūs varat pieslēgties ar saviem datiem.', 'success');
            showLoginForm();
            document.getElementById('register-form').reset();
        } else {
            showNotification(data.message || 'Kļūda reģistrējoties!', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Kļūda reģistrējoties!', 'error');
    }
}

async function addUser(e) {
    const username = document.getElementById('add-user-username').value.trim();
    const password = document.getElementById('add-user-password').value.trim();
    const fullName = document.getElementById('add-user-fullName').value.trim();
    const role = document.getElementById('add-user-role').value;
    const status = document.getElementById('add-user-status').value;

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
            closeModal('addUserModal');
            document.getElementById('addUserForm').reset();
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
    // Prevent users with "user" role from editing other users
    if (currentUser && currentUser.role === 'user') {
        showNotification('Jums nav atļauts rediģēt lietotājus!', 'error');
        return;
    }

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

async function updateUser(e) {
    e.preventDefault();
    
    const form = e.target;
    const userId = form.querySelector('input[name="userId"]').value;
    const username = form.querySelector('#edit-user-username-input').value.trim();
    const fullName = form.querySelector('#edit-user-fullName').value.trim();
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
    // Prevent users with "user" role from deleting other users
    if (currentUser && currentUser.role === 'user') {
        showNotification('Jums nav atļauts dzēst lietotājus!', 'error');
        return;
    }

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
        if (data.success) {
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
            showNotification('Error loading products: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products', 'error');
    }
}

async function addProduct(e) {
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value.trim();
    const price = document.getElementById('product-price').value;
    const quantity = document.getElementById('product-quantity').value;
    const companyId = document.getElementById('product-company').value.trim();

    // Double-check validation before sending to server
    if (!validateProductName(name)) {
        showNotification('Produkta nosaukumam jābūt vismaz 2 rakstzīmes garam un nedrīkst būt tukšs vai saturēt tikai punktus!', 'error');
        return;
    }
    
    if (!validateCategory(category)) {
        showNotification('Kategorijai jābūt vismaz 2 rakstzīmes garai un nedrīkst būt tukša vai saturēt tikai punktus!', 'error');
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
            showNotification('Produkts veiksmīgi pievienots!', 'success');
            closeModal('add-product-modal');
            document.getElementById('add-product-form').reset();
            loadProducts();
        } else {
            showNotification(data.message || 'Kļūda pievienojot produktu', 'error');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showNotification('Kļūda pievienojot produktu', 'error');
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

async function updateProduct(e) {
    e.preventDefault();
    const id = document.getElementById('edit-product-id').value;
    const name = document.getElementById('edit-product-name').value.trim();
    const category = document.getElementById('edit-product-category').value.trim();
    const price = document.getElementById('edit-product-price').value;
    const quantity = document.getElementById('edit-product-quantity').value;
    const companyId = document.getElementById('edit-product-company').value.trim();

    // Double-check validation before sending to server
    if (!validateProductName(name)) {
        showNotification('Produkta nosaukumam jābūt vismaz 2 rakstzīmes garam un nedrīkst būt tukšs vai saturēt tikai punktus!', 'error');
        return;
    }
    
    if (!validateCategory(category)) {
        showNotification('Kategorijai jābūt vismaz 2 rakstzīmes garai un nedrīkst būt tukša vai saturēt tikai punktus!', 'error');
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
            showNotification('Produkts veiksmīgi atjaunināts!', 'success');
            closeModal('edit-product-modal');
            loadProducts();
        } else {
            showNotification(data.message || 'Kļūda atjauninot produktu', 'error');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showNotification('Kļūda atjauninot produktu', 'error');
    }
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
        console.log('Loading orders from API...');
        const response = await fetch('api/orders.php');
        const data = await response.json();
        
        if (data.status === 'success') {
            renderOrdersTable(data.data);
            updateHomeStats();
        } else {
            showNotification('Error loading orders: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Error loading orders', 'error');
    }
}

async function addOrder(e) {
    const created_by = currentUser.id; // Get ID from current user
    const items = [];
    
    // Get all order items from the form
    const orderItems = document.querySelectorAll('.order-item');
    orderItems.forEach(item => {
        const productSelect = item.querySelector('.order-product');
        const quantityInput = item.querySelector('.order-quantity');
        
        if (productSelect && quantityInput && productSelect.value && quantityInput.value) {
            items.push({
                product_id: parseInt(productSelect.value),
                quantity: parseInt(quantityInput.value)
            });
        }
    });

    if (items.length === 0) {
        showNotification('Lūdzu pievienojiet vismaz vienu preci!', 'error');
        return;
    }

    try {
        const response = await fetch('api/orders.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                created_by: created_by,
                items: items
            })
        });

        const data = await response.json();
        
        if (data.status === 'success') {
            showNotification('Pasūtījums veiksmīgi izveidots!', 'success');
            closeModal('add-order-modal');
            
            // Clear the order form
            const orderItemsContainer = document.getElementById('order-items-container');
            if (orderItemsContainer) {
                orderItemsContainer.innerHTML = '';
            }
            
            // Reload orders
            loadOrders();
        } else {
            showNotification(data.message || 'Kļūda izveidojot pasūtījumu!', 'error');
        }
    } catch (error) {
        console.error('Error creating order:', error);
        showNotification('Kļūda izveidojot pasūtījumu!', 'error');
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
            // Reload orders to update the table
            loadOrders();
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
            // Reload orders to update the table
            loadOrders();
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
        
        // Hide action buttons for users with "user" role
        const showActions = currentUser && currentUser.role !== 'user';
        const actionButtons = showActions ? `
            <div class="action-buttons">
                <button class="btn btn-primary btn-sm" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i> Rediģēt
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i> Dzēst
                </button>
            </div>
        ` : '<span class="text-muted">Nav atļauts</span>';
        
        // Convert role to Latvian
        let roleText = user.role || 'N/A';
        if (roleText === 'admin') roleText = 'Administrators';
        else if (roleText === 'worker') roleText = 'Darbinieks';
        else if (roleText === 'organizer') roleText = 'Kārtotājs';
        else if (roleText === 'user') roleText = 'Lietotājs';
        
        // Convert status to Latvian
        let statusText = user.status || 'inactive';
        if (statusText === 'active') statusText = 'Aktīvs';
        else if (statusText === 'inactive') statusText = 'Neaktīvs';
        else if (statusText === 'pending') statusText = 'Gaida';
        
        tr.innerHTML = `
            <td>${user.username || 'N/A'}</td>
            <td>${user.full_name || 'N/A'}</td>
            <td>${roleText}</td>
            <td>${user.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}</td>
            <td>
                <span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}">
                    ${statusText}
                </span>
            </td>
            <td>${actionButtons}</td>
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

        // Convert status to Latvian
        let statusText = order.status || 'N/A';
        if (statusText === 'pending') statusText = 'Gaida';
        else if (statusText === 'completed') statusText = 'Pabeigts';
        else if (statusText === 'cancelled') statusText = 'Atcelts';

        tr.innerHTML = `
            <td>${order.order_number || 'N/A'}</td>
            <td>${statusText}</td>
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
        // Get stats from API
        const [usersResponse, productsResponse, ordersResponse] = await Promise.all([
            fetch('api/users.php'),
            fetch('api/products.php'),
            fetch('api/orders.php')
        ]);
        
        const usersData = await usersResponse.json();
        const productsData = await productsResponse.json();
        const ordersData = await ordersResponse.json();
        
        const totalProductsElement = document.getElementById('total-products');
        if (totalProductsElement && productsData.success) {
            totalProductsElement.textContent = productsData.products.length;
        }

        const totalOrdersElement = document.getElementById('total-orders');
        if (totalOrdersElement && ordersData.status === 'success') {
            totalOrdersElement.textContent = ordersData.data.length;
        }

        const totalUsersElement = document.getElementById('total-users');
        if (totalUsersElement && usersData.success) {
            totalUsersElement.textContent = usersData.users.length;
        }
    } catch (error) {
        console.error('Error updating home stats:', error);
        showNotification('Error updating dashboard stats', 'error');
    }
}

// Show specific page
function showPage(pageId) {
    // Prevent "user" role from accessing any page other than orders
    if (currentUser && currentUser.role === 'user' && pageId !== 'orders') {
        showNotification('Jums nav atļauts piekļūt šai lapai!', 'error');
        return;
    }

    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });

    // Show the selected page
    const selectedPage = document.getElementById(pageId + '-page');
    if (selectedPage) {
        selectedPage.style.display = 'block';
        selectedPage.classList.add('active');
    }

    // Update navigation active state
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Load page-specific data
    switch (pageId) {
        case 'products':
            if (currentUser && currentUser.role !== 'user') {
                loadProducts();
            }
            break;
        case 'orders':
            loadOrders();
            break;
        case 'users':
            if (currentUser && currentUser.role === 'admin') {
                loadUsers();
            }
            break;
        case 'home':
            if (currentUser && currentUser.role !== 'user') {
                updateHomeStats();
            }
            break;
    }
}

// Modals
function openModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
        modalElement.classList.add('active'); // Add active class to show
        
        // Clear any existing validation errors when opening modal
        const errorElements = modalElement.querySelectorAll('.validation-error');
        errorElements.forEach(error => {
            error.textContent = '';
            error.style.display = 'none';
        });
        
        // Remove error classes from inputs
        const inputs = modalElement.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.classList.remove('error');
        });
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
            // Clear all validation errors in the modal
            const errorElements = modalElement.querySelectorAll('.validation-error');
            errorElements.forEach(error => {
                error.textContent = '';
                error.style.display = 'none';
            });
            
            // Remove error classes from inputs
            const inputs = modalElement.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.classList.remove('error');
            });
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
            <select name="orderProduct" class="order-product" data-validation="order-product">
                ${productSelectOptions}
            </select>
            <div class="validation-error" id="order-product-${orderItemCounter}-error"></div>
        </div>
        <div class="form-group">
            <label>Daudzums:</label>
            <input type="number" name="orderQuantity" class="order-quantity" min="1" value="1" data-validation="order-quantity">
            <div class="validation-error" id="order-quantity-${orderItemCounter}-error"></div>
        </div>
        <button type="button" class="btn btn-danger btn-sm" onclick="removeOrderItem(this)">✕</button>
    `;
    if (orderItemsContainer) { // Added null check
        orderItemsContainer.appendChild(itemGroup);
        
        // Add validation event listeners to the new fields
        const newProductSelect = itemGroup.querySelector('.order-product');
        const newQuantityInput = itemGroup.querySelector('.order-quantity');
        
        if (newProductSelect) {
            newProductSelect.addEventListener('change', function() {
                validateField(this);
            });
        }
        
        if (newQuantityInput) {
            newQuantityInput.addEventListener('input', function() {
                validateField(this);
            });
            newQuantityInput.addEventListener('blur', function() {
                validateField(this);
            });
        }
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
            showNotification('Error fetching products for order item: ' + data.message, 'error');
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
    
    // Clear any existing timeout
    if (notification.timeoutId) {
        clearTimeout(notification.timeoutId);
    }
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Trigger reflow to ensure the transition works
    notification.offsetHeight;
    
    // Show the notification
    notification.classList.add('show');
    
    // Auto-hide after 4 seconds
    notification.timeoutId = setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
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

// Add saveEditedUser function
async function saveEditedUser() {
    const form = document.getElementById('editUserForm');
    const event = { preventDefault: () => {}, target: form };
    await updateUser(event);
}
