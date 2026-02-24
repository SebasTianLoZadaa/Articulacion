/**
 * Modelo de Categoria
 * define la tabla categoria en la base datos
 * almacena las categorias principales de los productos
 */

//Importar DataTrypes de sequelize
const { DataTypes } = require('sequelize');

//Importar instancia de sequelize
const {sequelize} = require('../config/database');


/**
 * Definir el modelo Categoria
 */
const Categoria = sequelize.define('Subcategoria', {
    //Campos de la tabla
    //Id Indentificador unico (PRIMARY KEY)
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false

    },
    
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique : {
            msg: 'Ya existe una subcategoria con ese nombre'
        },
        validate : {
            notEmpty: {
                msg: 'El nombre de la subcategoria no puede estar vacio'
            },
            len: {
                args: [2, 100],

            }
        }
    },

    /**
     * descripcion de la categoria
     */

    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true //puede ser nulo
    }, 

    /**
     * Categoria - ID de la categoria a la ue pertenece (FOREIGN KEY)
     * Esta es la relacion con la tabla categoria
     */

    categoriaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categorias', //nombre de la tabla relacionada
            key: 'id' //campo de la tabla relacionada
        },
        onUpdate: 'CASCADE', //si se actualiza el id, actualizar aca tambien
        onDelete: 'CASCADE', //si se borra la categoria, borrar las subcategorias
        validate: {
            notNull: {
                msg: 'Debe seleccionar una categoria'
            }
    }
},

    /**
     * Activo estado de la categoria
     * si es false la categoria y todas sus subcategorias y productos se ocultan
     */
    activo : {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false

    },

    }, {
        //opciones del modelo

        tableName: 'subcategorias',
        timestamps: true, // agrega campos createdAt y updatedAt

        /**
         * Indices compuestos para optimizar busquedas 
         */
        indexes: [
            {
                //Indice para buscar subcategorias por categoria
                fields : ['categoriaId'] 
            },
            {
                //Indice compuesto: nombre unico por categoria
                //permite que dos categorias diferesdntes tengan subcategorias con el mismo nombre
                unique: true,
                fields: ['nombre', 'categoriaId'],
                name: 'nombre_categoria_unique' 
            }
        ],

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
                    const { Subcategoria } = require('./subcategoria');
                    const producto = require('./Producto');
                    
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
Subcategoria.prototype.contarProductos = async function() {
    const  Producto  = require('./Producto');
    return await Producto.count({ where: { subcategoriaId: this.id } });
};
/**
 * Metodo para obtener las categoria padre
 * @returns {Promise<Categoria>} - categoria padre
 */
Subcategoria.prototype.obtenerCategoria = async function() {
    const Categoria = require('./Categoria');
    return await Categoria.findByPk(this.categoriaId);
}



//Exportar modelo Subcategoria
module.exports = Subcategoria;