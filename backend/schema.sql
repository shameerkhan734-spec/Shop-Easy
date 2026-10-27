CREATE DATABASE IF NOT EXISTS shopeasy;
USE shopeasy;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_product
        FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO products (name, description, price)
VALUES
    ('Wireless Mouse', 'Wireless mouse for everyday use', 599.00),
    ('Mechanical Keyboard', 'Mechanical keyboard for developers', 2499.00),
    ('USB-C Hub', 'Multiport USB-C connectivity hub', 1299.00);