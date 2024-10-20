CREATE USER docker;
CREATE DATABASE mydb;
GRANT ALL PRIVILEGES ON DATABASE mydb TO docker;

-- Connect to the database
\c mydb

-- Create an ENUM type for the type column
CREATE TYPE todo_type AS ENUM ('today', 'week', 'month');

-- Create the todo table using the ENUM type
CREATE TABLE todo (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type todo_type NOT NULL
);

-- Insert data into the table
INSERT INTO todo (id, title, updated_at, type) VALUES
(20, 'Learn Node', '2024-10-20 22:50:51.035516', 'today'),
(21, 'Master React', '2024-10-20 22:51:01.102584', 'week'),
(22, 'Become Fullstack :)', '2024-10-20 22:51:11.449813', 'month'),
(23, 'Learn Express', '2024-10-20 22:51:20.962605', 'today');
