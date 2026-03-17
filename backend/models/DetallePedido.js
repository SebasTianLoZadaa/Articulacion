/**
 * Modelo detalle pedido
 * define la tabla detalle_pedido en la base datos
 * almacena los productos incluidos en cada pedido
 * relacion muchos a muchos entre pedido y productos
 */

//Importar DataTrypes de sequelize
const { DataTypes } = require('sequelize');

//Importar instancia de sequelize
const {sequelize} = require('../config/database');
const { parse } = require('node:path');




/**
 * Definir el modelo DetallePedido
 */
const DetallePedido = sequelize.define('DetallePedido', {
    //Campos de la tabla
    //Id Indentificador unico (PRIMARY KEY)
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false

    },


    // PedidoId ID del pedido al que pertenece este detalle
    pedidoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {

            model: 'Usuarios',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // si se elimina el usuario se elimina el carrito
        validate: {
            notNull: {
                msg: 'Debe especificar su usuario'

            }

        }
    },
    
     // Producto ID del producto en el carrito
    productoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {

            model: 'Productos',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // no se puede eliminar productos asociados con pedidos
        validate: {
            notNull: {
                msg: 'Debe especificar su producto'

            }

        }
    },

    // Cantidad de este producto en el carrito
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            isInt: {
                msg: 'La cantidad debe ser un numero entero'
            },
            min: {
                args: [1],
                msg: 'La cantidad debe ser al menos 1'
            }
        }
    },

    /**
     * Precio Unitario del producto al momento del pedido
     * se guarda para mantener el historial aunque el producto cambie de precio
     */
    precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: {
                msg: 'El precio debe ser un numero decimal valido'
            },
            min: {
                args: [0],
                msg: 'El precio no puede ser negativo'
            }
        }
    },

    /**
     * Subtotal de este item (precio * cantidad)
     * Se calcula automaticamente antes de guardar
     */
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: {
                msg: 'El subtotal debe ser un numero decimal valido'
            },
            min: {
                args: [0],
                msg: 'El subtotal no puede ser negativo'
            }
        }
    }
}, {
    //opciones del modelo
    tableName: 'detalle_pedidos',
    timestamp: false, // no necesita cratedAt ni updatedAt

    //indice para mejorar las busquesdas
    indexes: [
        {
            //indice para buscar detalles por pedido
            fields: ['pedidoId']
        },
        {
            //indice para buscar detalles por producto
            fields: ['productoId']
        }],
    /**
         * Hooks Acciones automaticas
         */

        hooks:{
            /**
             *beforeCreate - se ejecuta antes de crear un detalle de pedido
             *Calcula el subtotal automaticamente
             */

            beforeCreate: (detalle) => {
                // calcular subtotal precio * cantidad
                detalle.subtotal = parseFloat(detalle.precioUnitario) * detalle.cantidad;
            },

            /**
             *beforeUpdate. se ejecuta antes de actualizar detalle de pedido
             *recalcula el subtotal si se actualiza la cantidad o el precio
             */
            beforeUpdate:  (detalle) => {
                if (detalle.changed('precioUnitario') || detalle.changed('cantidad')) {
                    detalle.subtotal = parseFloat(detalle.precioUnitario) * detalle.cantidad;
                }
                    
        }
    }
});

// METODOS DE INSTANCIA

/**
 * Metodo para calcular el subtotal
 *
 * @returns {number} - Subtotal calculado
 */
DetallePedido.prototype.calcularSubtotal = async function() {
    return parseFloat(this.precioUnitario) * this.cantidad;
};

/**
 * Metodo para crear  detalles del pedido desde el carrito
 * convierte los items del carrito en detalles de pedido
 * @param {number} pedidoId - ID del pedido
 * @param {Array} itemsCarrito - Items del carrito a convertir
 * @returns {Promise<Array>} - Detalles del pedido creados
 */

    DetallePedido.prototype.crearDesdeCarrito = async function(pedidoId, itemsCarrito) {
        const detalles = [];
        for (const item of itemsCarrito) {
            const detalle = await this.create({
                pedidoId: pedidoId,
                productoId: item.productoId,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario
            });
            detalles.push(detalle);
        }
        return detalles;
};

/**
 * Metodo para calcular el total de un pedido desde sus detalles
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<number>} - Total del pedido
 */
DetallePedido.calcularTotalPedido = async function (pedidoId, itemsCarrito) {
    const detalles = await this.findAll({
        where: { pedidoId }
    });

    let total = 0;
    for (const detalle of detalles) {
        total += parseFloat(detalle.subtotal);
    }

    return total;
};

/**
 * Metodo para obtener resumen de productos mas vendidos
 * @param {number} limite - numero de productos a retornar
 * @return {Promise<Array>} -  productos mas vendidos
 */
DetallePedido.obtenerMasVendidos = async function (limite = 10 ) {
    const {sequelize} = require ('../config/database');

    return await this,findAll ({
        atributes: [
            'productoId' ,
            [sequelize.fn ('SUM', sequelize.col('cantidad')), 'totalVendido']
        ],
        group: ['productoId'],
        order: [[sequelize.fn('SUM', sequelize.col('cantidad')), 'DESC']],
        limit: limite
    });
};

// Exportar el modelo DetallePedido
module.exports = DetallePedido;