// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crea y conecta a la base de datos (se creará un archivo database.sqlite)
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con SQLite:', err.message);
    } else {
        console.log('✅ Conectado a la base de datos SQLite.');
        
        // Inicializar la tabla de usuarios
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            isPremium BOOLEAN DEFAULT 0
        )`, (err) => {
            if (err) {
                console.error('Error al crear la tabla users:', err.message);
            } else {
                console.log('✅ Tabla "users" lista.');
            }
        });
    }
});

module.exports = db;
