/**
 * Controlador de pedidos
 * Gestion de pedidos
 * requiere autenticacion
 */

//Importar modelos

const Pedido = require('../models/Pedido');
const DetallePedido = require('../models/DetallePedido');
const Producto = require('../models/producto');
const Usuario = require('../models/Usuario');
const Carrito = require('../models/carrito');
const Categoria = require('../models/Categoria');
const Subategoria = require('../models/subcategoria');

/**
 * Crear pedido desde el carrito (checkout)
 * POST /api/cliente/pedidos
 */

const crearPedido = async (req, res) => {
    const {sequelize} = require('../config/database')
    const t = await sequelize.transaccion();

    try {
        const { direccionEnvio, telefono, metodoPago = 'efectivo', notasAdicionales } = req.body;

        //Validacion 1 Direccion requerida

        if (!direccionEnvio || direccionEnvio.trim() === '')
            
            {
            await t.rolback();
            return res.status(400).json({
                success: false,
                message: 'Direccion de envio es requerida'
            });
        }


        //Validacion 2 Telefono
        if (!telefono || telefono.trim() === '')  {
            await t.rollback()
            return res.status(400).json({
                success: false,
                message: 'El telefono no es valido'
            });
        }

        //Validacion 3 Metodo de pago
        
        const metodosValidos = ['efectivo', 'tarjeta', 'transferencia'];

        if (!metodosValidos.includes(metodoPago))  {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message:  `metodo de pago invalido, opciones: ${metodosValidos,join(',')}`
            });
        }

        // obtener items del carrito

        const carritoItems = await Carrito.findAll({
            where: {
                usuarioId: req.user.usuarioId
            },
            include: [{
                model: Producto,
                as: 'producto',
                atributes: ['id', 'nombre', 'precio', 'stock', 'activo']
            }],
            transaction: t
        });

        if (itemsCarrito.length === 0) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'El carrito esta vacio'
            })
        }




    }
}
