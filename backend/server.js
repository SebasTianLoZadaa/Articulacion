/**
 * SERVIDOR PRINCIPAL DEL BACKEND
 * este el archivo principal del servidor del backend
 * configura express, middlewares, rutas y conexion de bases de datos
 */

// importaciones

// importar express para crear el servidor
const express = require ('express');

//importar cors para permitir solicitudes desde el fronend
const cors = require ('cors');

// importar path para manejar rutas de archivos
const path = require('path');

// importar dotenv para maejar variables de entorno
require('dotenv').config();

//importar configuracion de la base de datos
const dbconfig = require ('./config/database');

//importar modelos y asociaciones
const { initAssociations } = require('./models')

//importar seeders
const { runSeeders } = require ('./seeders/adminSeeder');
const { timeStamp } = require('console');
const { syncDataBase, testConnection } = require('./config/database');

//Crear aplicaciones express

const app = express();

// Obtener el puerto desde la variable de entorno
const PORT = process.env.PORT || 5000;

//MIDDLEWARES GLOBALES

//cors permite peticiones desde el frontend
//configura que los dominios pueden hacer peticiones al backend

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', //url del frontend
    credentials: true, // permitir enviar cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // metodos permitidos
    allowedHeaders: ['Content-type', 'Authorization'], // encabezados permitidos
}))
/**
 * express.json() - parse el body de las peticiones del formato JSON
 */

app.use(express.json());

/**
 * express.urlencoded( ) -parse el body de los formularios
 * las imagenes estaran disponibles
 */

app.use(express.urlencoded({ extended: true}));

/**
 * servir archivos estaticos imagenes desde la carpeta raiz
 */

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//middleware para login de peticiones
// Muestra en consola cada peticion que llega el servidor

if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`ok ${req.method} ${req.path}`);
        next();

    });
}

//rutas

//rutas raiz

app.get('/,' , (req, res) => {
    res.json({
        success: true,
        message: 'El servidor E.commerce Backend corriendo correctamente ',
        version: '1.0.0',
        timeStamp: new Date ().toISOString()
    });

});

// rutas de salud verifica como esta el servidor

app.get('/api/health' , (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        database: 'connected',
        timeStamp: new Date ().toISOString()
    });

});

//rutas api
// incluye registro login, perfil

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Rutas del administrador
// requieren autenticacion y rol de administrador
const adminRoutes = require('./routes/admin.routes');
app.use('/api/admin/', adminRoutes);

// rutas del cliente
const clienteRoutes = require('./routes/cliente.routes');
app.use('/api', clienteRoutes);


// Manejo de rutas no encontradas (404)

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.path,
    });
});

// Manejo de errores globales

app.use((err,req, res, next) => {
    console.error('Error:', err.message);
    // Error en el multer en la subida de archivos
    if (err.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            message: 'Error al subir el archivo',
            error: error.message,
        });
    }

    // otros errores
    res.status(500).json({
        success: false,
        message: err.message || 'error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack : err.stack })
    });

});

// inicializar servidor y base de datos

/**
 * funcion principal para iniciar el servidor
 * prueba la conexion a MySQL
 * sincroniza los modelos (crea las tablas)
 * inicia el servidor express
 */

const startServer = async () => {
    try {
        // paso 1 probar conexion a MySQL
        console.log(' Conectando a MySQL...');
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error (' No se pudo conectar a Mysql verificar XAMPP y el archivo .env');
            process.exit(1); //salir si no hay conexion
        }

        //paso 2 sincronizar modelos (crear tablas)
        console.log('Sincronizando modelos con la base de datos...');

        // Inicializar asociaciones entre los modelos
        initAssociations();

        // en desarrollo alter puede ser true para actualizar la estructura
        //en produccion debe ser false para no perder los datos

    // en desarrollo alter puede ser true para actualizar la estructura
    // en produccion debe ser false para no perder los datos
    const alterTables = process.env.NODE_ENV === 'development';
    // Llamar a la función exportada correctamente (syncDatabase)
    const dbSynced = await dbconfig.syncDatabase(false, alterTables);

        if (!dbSynced) {
            console.error(' X error al sincronizar la base de datos');
            process.exit(1);
        }

        // Paso 3 ejecutar seeders datos iniciales
        await runSeeders();

        //paso 4 iniciar un servidor express
        app.listen(PORT, () => {
            console.log(' \n ____________________');
            console.log(`Servidor corriendo en el puerto ${PORT}`);
            console.log(`URL: https://localhost:${PORT}`);
            console.log(`base de datos ${process.env.DB_NAME}`);
            console.log(`Modo: ${process.env.NODE_ENV}`);
            console.log('Servidor listo para realizar peticiones');
        });

    } catch (error) {
        console.error('X error fatal al iniciar el servidor:', error.message);
        process.exit(1);
    }

};

// manejo de cierre
// captura el ctrl+c para cerrar el servidor correctamente

process.on('SIGINT', () => {
    console.log('\n\n cerrando servidor...');
    process.exit(0);
});

// capturar errores no manejados

process.on('unhandledRejection', (err) => {
    console.error('X error no manejado', err);
    process.exit(1);
});

// Iniciar servidor
if (require.main === module) {
    startServer();
}

// exportar app para testing
module.exports = app;


