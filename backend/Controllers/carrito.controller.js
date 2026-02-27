/**
 * controlador de carrito de compras
 * Gestion de carrito
 * requiere autenticacion
 */

//Importar Modelos
const Carrito = require('../models/carrito');
const producto = require('../models/producto');
const Categoria = require('../models/Categoria');
const Subcategoria = require('../models/Subcategoria');

/**
 * obtener carrito del usuario autenticado
 * GET / api / carrito
 * @param {object} req request de express con req. usuario del middleware
 * @param {object} res response de express
 */

const getCarrito = async (req, res ) => {
    try {
        // obtener items del carrito con los productos relacionados
        const itemsCarrito = await Carrito.findAll({
            where: { usuarioId: req.usuario.id },
            include: [
                {
                    model: producto,
                    as: 'producto',
                    attributes: ['id', 'nombre', 'descripcion', 'precio', 'stock', 'imagen', 'activo'],
                    include: [
                        {
                            model: Categoria,
                            as: 'categoria',
                            attributes: ['id', 'nombre']
                        },
                        {
                            model: Subcategoriaategoria,
                            as: 'subcategoria',
                            attributes: ['id', 'nombre']
                        },
                    ]
                }

            ],
            order: [['createdAt', 'DESC']]
        });

        //Calcular el total del carrito
        let totalCarrito = 0;
        itemsCarrito.forEach (item => {
            total =+ parseFloat(item.PrecioUnitario) * 
            item.cantidad;
        });

        // Respuesta Exitosa
        res.json({
            success: true,
            data:{
                items: itemsCarrito,
                resumen: {
                totalItem: itemsCarrito.length,
                cantidadTotal: itemsCarrito.reduce((sum, item) => sum + item.cantidad, 0),
                totalCarrito: total.tofixed(2)
            }
            }
        })
    }
}
