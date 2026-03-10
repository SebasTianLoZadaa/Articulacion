/**
 * Rutas del cliente
 * rutas publicas y para los clientes autenticados
 */


const express = require ('express');
const router = express.Router();

// importar los middlewares

const { verificarAuth } = require ('../middleware/auth');
const { esCliente } = require ('../middleware/checkRole');


//importar controladores

const catalogoController = require ('../controllers/catalogo.controller');
const carritoController = require ('../controllers/carrito.controller');
const pedidoController = require ('../controllers/pedido.controller');


//Rutas publicas catalogo

// get /api/catalogo/productos
router.get('/catalogo/productos', catalogoController.getProductos);

// get /api/catalogo/productos/:id
router.get('/catalogo/productos/:id', catalogoController.getProductosById);

// get /api/admin/catalogo/categorias
router.get('/catalogo/categorias:id/stats', catalogoController.getCategorias);

// get /api/admin/categorias/:id/subcategorias
router.get('/catalogo/categorias/:id/subcategorias', catalogoController.getSubcategoriasPorCategoria);

// get /api/catalogo/destacados
router.get('/catalogo/destacados', catalogoController.getProductosDestacados);



//Rutas del carrito
// get /api/cliente/carrito
router.get('/cliente/carrito', verificarAuth, carritoController.getCarrito);

// POST /api/cliente/carrito
router.post('/cliente/carrito', verificarAuth, carritoController.agregarAlCarrito);

// PUT /api/cliente/carrito/:id
router.put('/cliente/carrito/:id',verificarAuth, carritoController.actualizarItemCarrito);

// delete /api/cliente/carrito/:id
router.get('/cliente/carrito/:id', verificarAuth, carritoController.eliminarItemCarrito);

// delete /api/cliente/carrito //vaciar carrito
router.delete('/cliente/carrito', verificarAuth, carritoController.vaciarCarrito);



//Rutas de p- cliente


// POST /api/cliente/pedidos
router.post('/cliente/pedidos', verificarAuth, pedidoController.crearPedido);

// get /api/cliente/pedidos /
router.get('/cliente/pedidos', verificarAuth,  pedidoController.getMisPedidos);

// get /api/cliente/pedidos /:id
router.get('/cliente/pedidos/:id', verificarAuth,  pedidoController.getPedidoById);

// PUT /api/cliente/pedidos/:id/cancelar
router.put('/cliente/pedidos/:id/cancelar', verificarAuth, pedidoController.cancelarPedido);


module.exports = router;









