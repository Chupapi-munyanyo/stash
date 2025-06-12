# Stash Warehouse Management System

A comprehensive warehouse management system built with HTML, CSS, JavaScript, and PHP with MySQL database.

## Features

- **User Management**: Multi-role authentication (Admin, Worker, Organizer, User)
- **Product Management**: Add, edit, delete products with categories
- **Order Management**: Create and manage orders with real-time inventory updates
- **Reporting**: Generate reports for products, orders, and inventory
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Validation**: Form validation with immediate feedback

## Prerequisites

- XAMPP (or similar local server with Apache, MySQL, PHP)
- PHP 7.4 or higher
- MySQL 5.7 or higher

## Installation

1. **Clone or download the project** to your XAMPP htdocs folder:
   ```
   C:\xampp\htdocs\Stash\
   ```

2. **Create the database**:
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Create a new database named `stash_warehouse`
   - Import the `database.sql` file or run the SQL commands manually

3. **Configure database connection**:
   - The database configuration is in `api/config.php`
   - Default settings: localhost, root user, no password
   - Modify if needed for your setup

4. **Set up the database**:
   - Run `test_db.php` in your browser to verify the connection
   - Run `populate_db.php` to add sample data

5. **Access the application**:
   - Open `http://localhost/Stash/RandomNoliktava.html` in your browser

## Default Login Credentials

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| admin | admin123 | Administrator | Full system access |
| worker | worker123 | Worker | Product and order management |
| organizer | org123 | Organizer | Product organization |
| user | user123 | User | Order creation only |

## User Roles and Permissions

### Administrator
- Full access to all features
- User management (create, edit, delete users)
- Product management
- Order management
- Reports generation

### Worker
- Product management (add, edit, delete products)
- Order management (view, complete, cancel orders)
- Cannot manage users

### Organizer
- Product management (add, edit, delete products)
- Cannot manage users or orders

### User
- View and create orders only
- Cannot access other features

## API Endpoints

### Authentication
- `POST api/auth.php` - User login

### Users
- `GET api/users.php` - Get all users
- `GET api/users.php?id={id}` - Get specific user
- `POST api/users.php` - Create new user
- `PUT api/users.php` - Update user
- `DELETE api/users.php` - Delete user

### Products
- `GET api/products.php` - Get all products
- `GET api/products.php?id={id}` - Get specific product
- `POST api/products.php` - Create new product
- `PUT api/products.php` - Update product
- `DELETE api/products.php` - Delete product

### Orders
- `GET api/orders.php` - Get all orders
- `POST api/orders.php` - Create new order
- `PUT api/orders.php` - Update order status
- `DELETE api/orders.php` - Delete order

### Reports
- `POST api/reports.php` - Generate reports

## Database Schema

### Tables
- `users` - User accounts and roles
- `products` - Product inventory
- `categories` - Product categories
- `orders` - Order headers
- `order_items` - Order line items

### Key Features
- Foreign key relationships for data integrity
- Automatic timestamps for audit trails
- Inventory tracking with real-time updates

## File Structure

```
Stash/
├── api/
│   ├── config.php          # Database configuration
│   ├── auth.php            # Authentication API
│   ├── users.php           # User management API
│   ├── products.php        # Product management API
│   ├── orders.php          # Order management API
│   └── reports.php         # Reporting API
├── config/
│   └── database.php        # Legacy database config
├── RandomNoliktava.html    # Main application file
├── script.js               # Frontend JavaScript
├── styles.css              # Main stylesheet
├── admin.css               # Admin-specific styles
├── database.sql            # Database schema
├── test_db.php             # Database connection test
├── populate_db.php         # Sample data population
└── README.md               # This file
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify XAMPP is running (Apache and MySQL)
   - Check database name in `api/config.php`
   - Ensure MySQL credentials are correct

2. **API Endpoints Not Working**
   - Check file permissions
   - Verify PHP is enabled in Apache
   - Check browser console for JavaScript errors

3. **Login Issues**
   - Run `populate_db.php` to ensure sample users exist
   - Check browser console for network errors
   - Verify API endpoints are accessible

### Testing

1. **Database Connection**: Visit `http://localhost/Stash/test_db.php`
2. **Sample Data**: Visit `http://localhost/Stash/populate_db.php`
3. **Application**: Visit `http://localhost/Stash/RandomNoliktava.html`

## Security Features

- Password hashing using PHP's `password_hash()`
- SQL injection prevention with prepared statements
- Role-based access control
- Input validation and sanitization
- Session management

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (responsive design)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify all prerequisites are met
3. Test database connection
4. Check browser console for errors

## License

This project is for educational and demonstration purposes. 