/**
 * Modelo carrito
 * define la tabla carrito en la base datos
 * almacena los productos que cada usuario agrega a su carrito
 */

//Importar DataTrypes de sequelize
const { DataTypes } = require('sequelize');

//Importar instancia de sequelize
const {sequelize} = require('../config/database');


/**
 * Definir el modelo Carrito
 */
const Carrito = sequelize.define('Carrito', {
    //Campos de la tabla
    //Id Indentificador unico (PRIMARY KEY)
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false

    },

    // UsuarioId ID del usuario dueño del carrito
    usuarioId: {
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
        onDelete: 'CASCADE', // elimina el producto del carrito
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
     * Precio Unitario del producto al momento de agregarlo al carrito
     * se guarda para mantener el precio aunque el producto cambie de precio
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
    }
}, {
    //opciones del modelo
    tableName: 'carritos',
    timestamp: true,
    //indice para mejorar las busquesdas
    indexes: [
        {
            //indice para buscar carrito por usuario
            fields: ['usuarioId']
        },
        {
            //Indice compuesto: un usuario no puede tener el mismo producto duplicado
        unique: true,
        fields: ['usuarioId', 'productoId'],
        name: 'usuario_producto_unique'
        }
    ],
    /**
         * Hooks Acciones automaticas
         */

        hooks:{
            /**
             *beforeCreate - se ejecuta antes de un item en el carrito
             *verifica que este activo y tenga stock suficiente para agregarlo al carrito
             */

            beforeCreate: async (itemCarrito, options) => {
                const Producto = require('./producto');

                //buscar producto
                const producto = await Producto.findByPk(itemCarrito.productoId);

                if (!producto) {
                    throw new Error('El producto seleccionado no existe');

                }

                if (!producto.activo) {
                    throw new Error('No se puede crear agregar un producto inactivo al carrito');
                }

                if (!producto.hayStock(itemCarrito.cantidad)) {
                    throw new Error(`Stock insuficiente, solo hay ${producto.stock} unidades disponibles`);
                }

                //Guardar el precio actual del producto
                itemCarrito.precioUnitario = producto.precio;

            },

            /**
             *beforeUpdate. se ejecuta antes de actualizar un carrito
             *valida que haya stock suficiente si se aumenta la cantidad 
             */

            
            beforeUpdate: async (itemCarrito, options) => {
                //verificar si el campo activo se cambio
                if (itemCarrito.changed('cantidad')) {
                    const Producto = require('./producto');
                    const producto = await Producto.findByPk(itemCarrito.productoId);

                    if (!producto) {
                        throw new Error('El producto seleccionado no existe'); 
                    }

                    if (!producto.hayStock(itemCarrito.cantidad)) {
                        throw new Error(`Stock insuficiente, solo hay ${producto.stock} unidades disponibles`);
                    }
                }
                    
        }
    }
});

// METODOS DE INSTANCIA

/**
 * Metodo para calcular el subtotal de este item
 *
 * @returns {number} - Subtotal (precio * canridad)
 */
Carrito.prototype.calcularSubtotal = async function() {
    return parseFloat(this.precioUnitario) * this.cantidad;
   
};

/**
 * Metodo para actualizar la cantidad
 * @param {number} nuevaCantidad - nueva cantidad
 * @returns {Promise} Item actualizado *
 */

Carrito.prototype.actualizarCantidad = async function(nuevaCantidad) {
    const Producto = require('./producto');
    const producto = await Producto.findByPk(this.productoId);

    if (!producto.hayStock(nuevaCantidad)) {
        throw new Error(`Stock insuficiente, solo hay ${producto.stock} unidades disponibles`);
    }

    this.cantidad = nuevaCantidad;
    return await this.save();

};

/**
 * Metodo para obtener el carrito completo de un usuario
 * incluye informacion de los productos
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Array>} - Items del carrito con prodsuctos 
 */
Carrito.obtenerCarritoUsuario = async function (usuarioId) {
    const Produto = require('./producto');

    return await Carrito.findAll({
        where: { usuarioId },
        include: [
            {
                model: Producto,
                as: 'producto'
            }
        ],
        order: [['createdAt', 'DESC']]
    });
};

/**
 * Metodo para calcular el total del carrito de un usuario
 * @param {number} usuarioId - ID del usuario
 * @return {Promise<number>} - Total del carrito
 */
Carrito.calcularTotalCarrito = async function (usuarioId) {
    const items= await this.findAll({
        where:{ usuarioId }
    })

    let total = 0;
    for (const item of items) {
        total += item.calcularSubtotal();
    }
    return total;
};

/**
 * Metodo para vaciar el carrito de un usuario 
 * util despues de reliazar un pedido 
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<number>} - Cantidad de items eliminados
 */

Carrito.vaciarCarrito = async function(usuarioId) {
    return await this.destroy({
        where: { usuarioId }
    });
};

// Exportar el modelo
module.exports = Carrito;