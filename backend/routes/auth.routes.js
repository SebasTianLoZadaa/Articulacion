/**
 * Rutas de autenticacion
 * define los endpoints para registro login y gestion de perfil
 */

//importar Router de express

const express = require ('express');
const router = express.Router();

// importar controladores de autenticacion
const {
    register,
    login,
    getMe,
    updateMe,
    changePassword,
    registrar,
} = require ('../Controllers/auth.controller');

//importar middleware
const  {verificarAuth} = require ('../middleware/auth');

//Rutas publicas

router.post('/registrar', registrar);

router.post('/login', login);

//rutas protegidas

router.get('/me', verificarAuth, getMe);

router.get('/me', verificarAuth, updateMe);

router.get('/change.password', verificarAuth, changePassword);

//exportar router
module.exports = router;





