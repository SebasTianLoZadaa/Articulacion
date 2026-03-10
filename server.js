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
const dbconfig = require ('./backend/config/database');

//importar modelos y asociaciones
const { initAssociations } = require('./backend/models')

//importar seeders
const { runSeeders } = require ('./seeders/adminSeeder');

//Crear aplicaciones express

const app = express();

// Obtener el puerto desde la variable de entorno
const PORT = process.env.PORT || 5000;

//MIDDLEWARES GLOBALES

//cors permite peticiones desde el frontend
//configura que los dominios pueden hacer peticiones al backend 

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
}))