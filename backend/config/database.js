/**
 * CONFIGURACIÓN DE LA BASE DE DATOS
 */
// Importar Sequelize
const { Sequelize } = require('sequelize');

//Importar dotenv para cargar las variables de entorno
require('dotenv').config();

//Crear una instancia de sequalize

const sequelize = new Sequelize (
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        
        // Configuracion de pool de conexiones
        // Mantiene las conexiones abiertas para mejorar el rendimiento
        pool: {
            max: 5, // Numero maximo de conexiones en el pool
            min: 0, // Numero minimo de conexiones en el pool
            acquire: 30000, // Tiempo maximo (en ms) que se espera para obtener una conexion del pool
            idle: 10000 // Tiempo maximo (en ms) que una conexion puede estar inactiva antes de ser liberada
        },

        // configuracion de logging
        // Permite ber las consultas de mysql por consola
        logging: process.env.NODE_ENV === 'development' ? console.log : false,

        //Zona horaria
        timezone: '-05:00' , //Zona horaria de Colombia

        //Opciones adicionales 
        define: { 
            // Agrega los campos createdAt y updatedAt
            timestamps: true,

            // underscored: true, // Usa snake_case para los nombres de columnas
            underscored: false,

            //freezeTableName: true  usa el nombre del modelo tal cual para la tabla
            freezeTableName: true 
        }
        
    }
);

// funcion para probar la conexion de la base de datos esta funcion se llara al inicar el servidor //
const testConnection = async () => {
    try {
       // Intenta autenticar con la base de datos //
    await sequelize.authenticate();
    console.log('Conexion a ,MySQL establecida correctamente');
    return true;
    } catch (error) {
        console.error(' X Error al conectar con MySQL:', error.message);

        console.error(' Verifica que el XAMPP este corriendo y las credenciales en .env sean correctas');
        return false
    }

}

//"Funcion para sincronizar los modelos con la base de datos "
//esta funcion creara las tablas automaticamente basandose en los modelos
// Exportar la instancia de sequelize y la funcion de prueba de conexion param {bolean} alter si es true, modifica las tablas existentes para que coincidan con los modleos*/

const syncDatabase = async (force = false, alter = false ) => {
    try {
        //sincronizar todos los modelos con la base de datos
        await sequelize.sync({ force, alter });

        if (force) {
            console.log('Base de datos sincronizada con (todas las tablas recreadas).');
        } else if (alter) {
            console.log('Base de datos sincronizada (tablas alteradas segun los modelos).');
        }  else {
            console.log('Base de datos sincronizada correctamente.');
        }


        return true ;
    } catch (error) {
        console.error(' X Error al sincronizar la base de datos:', error.message);
        return false;
    }

};

 //Exportar la instancia de sequelize y las funciones
    module.exports = {
        sequelize,
        testConnection,
        syncDatabase
    };