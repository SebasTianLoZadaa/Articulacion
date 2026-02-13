/**
 * MODELO CARRIRTO
 * define la tabla categoria en la base de datos
 * Almacena los productos que cada usuario ha agregado a su carrito
 */


//Importar Datatypes de sequelize
const { DataTypes } = require('sequelize');


//importar instancia de sequelize
const { sequelize } = require('../config/database');
const { type } = require('os');
const { timeStamp } = require('console');


/**
 * Definir el modelo del carrito
 */
const Carrito = sequelize.define('carrito', {
    // campos de la tabla
    // id identificador unico (PRIMARY KEY)
    id: {
        type: DataTypes.INTEGER, // tipo entero
        primaryKey: true, // clave primaria
        autoIncrement: true, // se incrementa automaticamente
        allowNull: false // no puede ser nulo
    },

    // UsuarioId ID del usuario dueño del carrito
    usuarioId: {
        type: Datatypes.INTERGER,
        allowNull : false,
        references: {
            model: 'Usuarios',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // si se elimina el usuario se elimina su carrito 
        validate: {
            notNull: {
                msg: 'Debe especificar un usuario'
            }
        }
    }, 

    // ProductoId ID del producto en el carrito
    productoId: {
        type: Datatypes.INTERGER,
        allowNull : false,
        references: {
            model: 'Productos',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // si se elimina el producto del carrito 
        validate: {
            notNull: {
                msg: 'Debe especificar un producto'
            }
        }
    }, 

    // Cantidad de este producto en el carrito 
    cantidad: {
        type: DataTypes.INTERGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            isInt: {
                msg: 'La cantidad debe ser un numero entero'
            },
            min: {
                args: [1],
                msg: 'la cantidad debe ser al menos 1'
            }
        }


    },

    /**
     * Precio unitario del producto al momento de agregarlo al carrito 
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

},{
    //opciones del modelo 
    tableName: 'carritos'
    timestamps: true,
    // indice para mejorar las busquedas 
    indexes: [
        {
            //indice para buscar carrito por usuario
            fields: ['usuarioId']
        },
        {
            //indice compuesto: un usuario no puede tener el mismo producto duplicado 
            unique: true, 
            fields: ['usuarioId', 'productoId'].
            name: 'usuario_producto_unique'
        }

        
    ]



});

/**
         * Hooks Acciones automaticas
         */

        hooks:{
            /**
             *beforeCreate - se ejecuta antes de crear una subcategoria
             *verifica que la categoria padre este activa 
             */

             beforeCreate: async (subcategoria) => {
                const Categoria = require('./Categoria');

                //buscar categoria padre
                const categoria = await Categoria.findByPk(subcategoria.categoriaId);

                if (!categoria) {
                    throw new Error('La cateoria seleccionada no existe');

                }

                if (!categoria.activo) {
                    throw new Error('No se puede crear una subcategoria en una categoria inactiva');
                }

             },

              /**
             *afterUpdate. se ejecuta despues de actualizar una categoria
             *si se desactiva una categoria se desactivan todas sus subcategorias y productos
             */

            
            afterUpdate: async (categoria, options) => {
                //verificar si el campo activo se cambio
                if (categoria.changed('activo') && !categoria.activo) {
                    console.log(`Desactivando categoria: ${categoria.nombre}`);

                    //Importar modelos (aqui para evitar dependencias circulares)
                    const { Subcategoria } = require('./Subcategoria');
                    const producto = require('./producto');
                    
                    try {
                        //paso 1 desactivar las subcategorias de esta subcategoria
                        

                        //paso 2 desactivar los productos de esta categoria

                        const productos = await producto.findAll({
                            where: { categoriaId: categoria.id }

                        });

                        for (const producto of productos) {
                            await producto.update({ activo: false }, { transaction: options.transaction });
                            console.log(`Producto desactivado: ${producto.nombre}`);

                    }

                    console.log(`categoria y elementos relacionados desactivados correctamente`);
                }catch (error) {
                    console.error('Error al desactivar categoria y elementos relacionados:', error.message);
                    throw error;
                }
            }

        }
    }
});

// METODOS DE INSTANCIA 

/**
 * Metodo para contar subcategorias de esta categoria
 *
 * @returns {Promise<number>} - numero de subcategorias
 */
Subcategoria.prototype.contarproductos = async function() {
    const  Producto  = require('./producto');
    return await Producto.count({ where: { subcategoriaId: this.id } });
};