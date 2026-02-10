/**
 * Script de inicializacion a la base de datos
 * Este script crea la base de datos si no existe
 * Debe ejecutarse una sola vez antes de inicar el servidor
 */

// Importar mysql para la conexion directa
const mysql = require('mysql2/promise');

//Importar dotenv para cargar las variables de entorno
require('dotenv').config();

// Funcion para crear la base de datos
const createDatabase = async () => {
    let connection;

    try {
    console.log('Iniciando creacion de la base de datos ...´\n');

       //Conectar a mysql sin especificar la base de datos
    console.log('Conectando a MySQL ...');
    connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || ""
    });

    console.log('Conexion a MySQL establecida \n;');

    // Crear la base de datos si no existe
    const dbname = process.env.DB_NAME || "ecommerce_db";
    console.log(`Creando la base de datos "${dbname} ...`);

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbname}\` creada/verificada exitosamente \n;`); //llama la constante y la crea//

    //Cerrar Conexion
    await connection.end();

    console.log('Proceso completado! Ahora puedes iniciar el servidor con "npm start\n');
    
}

catch (error) {
        console.error('Error al crear la base de datos:', error.message);
        console.error('\n Verifica que');
        console.error(' - El XAMPP este corriendo');
        console.error(' - MySql esta iniciado en XAMPP');
        console.error(' - Las credenciales en .env sean correctas');

        if (connection) {
            await connection.end();
        }

        process.exit(1);
    }


};

//Ejecutar la funcion
createDatabase();