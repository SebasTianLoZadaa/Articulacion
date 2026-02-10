/**
 * CONFIGURACION DE JWT
 * Este archivo contiene funciones para generar y verificar tokens JWT
 * Los JWT se usan para autenticar a los usuarios sin necesidad de sesiones 
 */

// Importar jsonwebtoken para manejar los tokens
const jwt = require('jsonwebtoken');

// Importar dotenv para acceder a las variables de entorno
require('dotenv').config();

/**
 * Generar un token JWT para un usuario
 * @param {Object}  payload - Datos que se incluiran en el token (id,email,rol)
 * @return {String} token JWT generado
 */

const generateToken = (payload) => {

    try {
        //jwt.sign() crea y firma un token 
        //Parametros:
        //1. payload: datos que se incluiran en el token
        //2. secret: clave secreta para firmar el token (desde .env)
        //3. options: opciones adicionales como tiempo de expiracion 
        const token = jwt.sign(
            payload, //Datos del usuario
            process.env.JWT_SECRET, //Clave secreta desde .env
            { expiresIn: process.env.JWT_EXPIRES_IN } //Tiempo de expiracion
        );

        return token;
    }   catch (error) {
        console.error('Error al generar el token JWT:', error.message);
        throw new Error('Error al generar el token de autenticacion');
    }
};

/**
 * Verificar si un token es valido
 *
 * @param {String} token - Token JWT a verificar
 * @return {Object} - payload decodificado si el token es valido
 * @throws {Error}  -  el token no es valido o ha expirado
 */

const extractTokenData = (TokenHeader) => {
    // verifica que el header existe y empieza con "Bearer"
    if (authHeader && authHeader.startsWith('Bearer')) {
        // Extraer solo el token (remover "Bearer ")
        return
    }}