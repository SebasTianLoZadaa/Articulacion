/**
 * controlador de productos
 * maneja las operaciones crud y activar y desactivar productos
 * solo accesible por admins
 */

/**
 * importar modelos
 */


const producto = require('../models/producto');
const Categoria = require('../models/Categoria');
const subcategoria = require('../models/subcategoria');

//Importar path y fs para manejo de imagenes
const path = require('path');
const fs = require('fs');


/**
 * obtener todos los productos
 * query params:
 * categoriaId: Id de la categoria para filtrar por categoria
 * subcategoriaId: Id de la categoria para filtrar por subcategoria
 * activo true/false (filtrar por estado activo o inactivo)
 *
 * @param {Object} req request express
 * @param {Object} res response express
 */

const getProductos = async (req, res) => {
    try {
        const {
            categoriaId,
            subcategoriaId,
            activo,
            conStock,
            buscar,
            pagina = 1,
            limite = 100
        } = req.query;


         //construir filtros
        const where = {};
        if (categoriaId) where.categoriaId = categoriaId;
        if (subcategoriaId) where.subcategoriaId = subcategoriaId;
        if (activo !== undefined) where.activo = activo === 'true';
        if (conStock === 'true') where.stock = {[require('sequelize').Op.gt]: 0};

        //paginacion
        const offset = (parseInt(pagina) - 1) * parseInt (limite);


        //opciones de consulta
        const opciones = {
            where,
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre']

                
        },
        {
                model: Subcategoria,
                as: 'subcategoria',
                attributes: ['id', 'nombre']
        }],

        limit: parseInt(limite),
        offset,
        order: [['nombre', 'ASC']] //Orden alfabetico
        };

        // obtener productos y total
        const { count, rows: productos }  = await
        Producto.findAllCountAll(opciones);


        //respuesta exitosa
        res.json({
            success: true,
            data: {
                productos,
                paginacion,
                    total: count,
                    pagina: parseInt(pagina),
                    limite: parseInt(limite),
                    totalpaginas: Math.ceil(count / parseInt(limite))
                }

            });
        

    } catch (error) {
        console.error('error en getProductos:', error);
        res.status (500).json({
            success: false,
            message: 'error al obtener productos', error: error.message
        })
    }
};

/**
 * obtener los productos por id
 * GET /api/productos/:id
 *
 * @param {Object} req request express
 * @param {Object} res response express
 */

const getProductosById = async (req, res) => {
    try {
        const {id} = req.params;

        // Buscar productos con relacion 

        const producto = await producto.findByPk(id, {
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre', 'activo']
                },

                {
                model: Subcategoria,
                as: 'subcategoria',
                attributes: ['id', 'nombre', 'activo']
                }
                
            ]
        });

        //filtrar por estado activo si es especifico
        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }


        //respuesta exitosa
        res.json({
            success: true,
            data: {
                producto
        }

        });

    } catch (error) {
        console.error('error en getProductosById:', error);
        res.status (500).json({
            success: false,
            message: 'error al obtener el producto', error: error.message
        })
    }
};

/**
 * crear un producto
 * POST /api/admin/productos
 * body: {nombre, descripcion}
 * @param {Object} req request express
 * @param {Object} res response express
 */

const crearProducto =async (req, res) => {
    try {
        const {nombre, descripcion, precio, stock, categoriaId, subcategoriaId} = req.body;

        //validcion 1 verificar campos requeridos
        if (!nombre || !precio || !categoriaId|| !subcategoriaId){
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos nombre, precio, categoriaId, subcategoriaId'
            });
        }
/**

        //validacion 2 si la subcategoria existe
        const subcategoria = await subcategoria.findByPk(subcategoriaId);
        if (!subcategoria) {
            return res.status(404).json({
                success: false,
                message: `no existe la subcategoria con id ${subcategoriaId}`
            });
        }
*/
        // validacion 2 verifica si la categoria esta activa
        const categoria = await Categoria.findByPk (categoriaId)

        if (!categoria) {
            return res.status(400).json({
                succes: false,
                message: `No existe una categoria con id "${categoriaId}"`
            });

        }

        if (!categoria.activo) {
            return res.status(400),json({
                success: false,
                message: `la categoria "${categoria.nombre}" esta inactiva`
            })
        }


        //validacion 3 verificar la subcategoria existe y pertenece a una categoria
        const subcategoria = await Subcategoria.findByPk (subcategoriaId);

        if (!subcategoria) {
            return res.status(400).json({
                success: false,
                message: `ya existe una subcategoria con este id "${subcategoriaId}" `
            });
        }
        if (!subcategoria.activo) {
            return res.status(400).json({
                success: false,
                message: `La subcategoria con este id "${subcategoriaId}" esta inactiva `
            });
        }
        if (!subcategoria.categoriaId !== parseInt (categoriaId)) {
            return res.status(400).json({
                success: false,
                message: `La subcategoria "${subcategoriaId}" no pertenece a la categoria ${categoriaId}`
            });
        }
        
        
        //Validacion 4 verificar precio y stock

        if (parseFloat(precio) < 0) {
            return res.status(400).json({
                success: false,
                message: 'El precio debe ser mayor que 0'
            })
        }

        if (parseInt(stock) < 0) {
            return res.status(400).json({
                success: false,
                message: 'El stock no puede ser negativo'
            })
        }
        
        // obtener imagen
        const imagen = req.file ? req.filr.filename:
        null;

        //Crear producto
        const nuevoProducto = await producto.create({
            nombre,
            descripcion: descripcion    || null,
            precio: parseFloat(precio),
            stock: parseInt(stock),
            categoriaId: parseInt(categoriaId),
            imagen,
            activo: true

        });
        


        //Recargar con relaciones
        await nuevoProducto.reload({
            include: [
                {model: Categoria, as: 'categoria'}
            ]
        })

        //respuesta exitosa
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: {
                producto: productoConSubcategoria
            }
        });

        } catch (error) {
            console.error('Error en crearProducto',error)
            if (error.name === 'SequelizeValidationError'){
            return res.status (400).json({
                success: false,
                message: 'error de validacion', errors:
                    error.errors.map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear subcategoria',
            error: error.message
        })
    }   // CORREGIR EL APARTADO DEL FINAAAAAAAL
};

/**
 * actualizar producto
 * PUT /api/admin/producto/:id
 * body: {nombre, decripcion, stock, precio, categoriaId, subcategoriaId}
 * @param {Object} req request express
 * @param {Object} res response express
 */

const actualizarProducto = async (req, res) => {
    try {
        const {id} = req.params;
        const {nombre, descripcion, categoriaId } = req.body;

        //Buscar subcategoria
        const Subcategoria = await subcategoria.findByPk(id);

        if (!Subcategoria) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoria no encontrada'
            });
        }

        //Validacion 1 si se cambia el nombre verificar que no exista
        if (categoriaId && categoriaId !== Subcategoria.categoriaId) {
            const nuevaCategoria = await Categoria.findByPk(categoriaId);
            if (!nuevaCategoria) {
                return res.status(404).json({
                    success: false,
                    message: `No existe la categoria con id ${categoriaId}`
                });
            }
        }

        if (!nuevaCategoria.activo) {
            return res.status(400).json({
                success: false,
                message: `la categoria "${nuevaCategoria.nombre}" esta inactiva`
            });
        }

        //validacion si se cambia el nombre verificar que no exista la categoria
        if (nombre && nombre !== Subcategoria.nombre) {
            const categoriaFinal = categoriaId || Subcategoria.categoriaId; //si no se cambia la categoria usar la categoria actual
            const subcategoriaConMismoNombre = await subcategoria.findOne({
                where: {
                    nombre,
                    categoriaId: categoriaFinal
                }
            });

            if (subcategoriaConMismoNombre) {
                return res.status(400).json({
                    success: false,
                    message: `ya existe una subcategoria con el nombre "${nombre}" en esta categoria`
                });
            }
        }

        //actualizar campos
        if (nombre !== undefined) Subcategoria.nombre = nombre;
        if (descripcion !== undefined) Subcategoria.descripcion = descripcion;
        if (categoriaId !== undefined) Subcategoria.categoriaId = categoriaId;
        if (activo !== undefined) Subcategoria.activo = activo;

        //guardar cambios
        await subcategoria.save();

        //respuesta exitosa
        res.json({
            success: true,
            message: 'subcategoria actualizada exitosamente',
            data: {
                Subcategoria,
            }
        });

    } catch (error) {
        console.error('error en actualizarSubcategoria: ', error);
        if (error.name === 'sequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validacion',
                errors: error.errors.map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar subcategoria',
            error: error.message
        });
    }
};
/**
 * activar/desactivar subcategoria
 * PATCH /api/admin/subcategorias/:id/estado
 *
 * al desactivar una subcategoria se desactivan todos los productos relacionados
 * @param {Object} req request express
 * @param {Object} res response express
 */

const toggleSubcategoria = async (req, res) => {
    try {
        const {id} = req.params;

        //buscar subcategoria
        const subcategoria = await Subcategoria.findByPk (id);

        if (!subcategoria) {
            return res.status(404).json({
                success: false,
                message: 'subcategoria no encontrada'
            });
        }

        //alternar estado activo
        const nuevoEstado = !subcategoria.activo;
        subcategoria.activo = nuevoEstado;

        //guardar cambios
        await subcategoria.save();

        //contar cuantos registros se afectaron
        const productosAfectados = await Producto.count({where: {subcategoriaId: id}
        });

        //respuesta exitosa
        res.json({
            success: true,
            message: `subcategoria ${nuevoEstado ? 'activada' : 'desactivada'} exitosamente`,
            data: {
                subcategoria,
                productosAfectados
                }
        });

    } catch (error) {
        console.error('error en toggleSubcategoria:', error);
        res.status(500).json({
            success: false,
            message: 'error al cambiar estado de la subcategoria',
            error: error.message
        });
    }
};

/**
 * eliminar subcategoria
 * DELETE /api/admin/subcategorias/:id
 * Solo permite eliminar si no tiene productos relacionados
 * @param {Object} req request express
 * @param {Object} res request express
 */
const eliminarSubategoria = async (req, res) => {
    try {
        const {id} = req.params;

        //buscar subcategoria
        const subcategoria = await subcategoria.findByPk(id);
            if (!subcategoria) {
                return res.status(404).json({
                    success: false,
                    message: 'Subcategoria no encontrada'
                });
            }

            //validacion verificar que no tenga productos
            const productos = await producto.count({
                where: {subcategoriaId: id}
            });

            if (productos > 0) {
                return res.status(400).json({
                    success: false,
                    message: `no se puede eliminar la subcategoria porque tiene ${productos} productos asociados usa PATCH/api/admin/subcategorias/:id
                    togle para desactivarla en lugar de eliminar
`
                });
            }

            //eliminar subcategoria
            await subcategoria.destroy();

            //respuesta exitosa
            res.json({
                success: true,
                message: 'subcategoria eliminada exitosamente'
            });

    } catch (error) {
        console.error('error al eilminar la subcategoria', error);
        res.status(500).json({
            success: false,
            message: 'error al eliminar la subcategoria',
            error: error.message
        });
    }
};

/**
 * obtener estadisticas de una subcategoria
 * GET /api/admin/subcategorias/:id/estadisticas
 * retorna
 * total de productos activos / inactivos
 * valor total del inventario
 * stock total
 * @param {Object} req request express
 * @param {Object} res request express
 */
const getEstadisticasSubcategoria = async (req, res) => {
    try {
        const {id} = req.params;

        //verificar que la subcategoria exista
        const subcategoria = await subcategoria.findByPk(id [{
            include:[{
                model: Categoria,
                as: 'categoria',
                attributes: ['id','nombre']
            }]
        }]);

        if (!subcategoria) {
            return res.status(404).json({
                success: false,
                message: 'subcategoria no encontrada'
            });
        }

        //contar productos
        const totalProductos = await producto.count({
            where: {subcategoriaId: id}
        });
        const productosActivos = await producto.count({
            where: {subcategoriaId:  id, activo: true}
        });

        //obtener productos para calcular estadisticas
        const productos = await producto.findAll({
            where: {subcategoriaId: id},
            attributes: ['precio', 'stock']
        });

        //calcular estadisticas de inventario
        let valorTotalInventario = 0;
        let stockTotal = 0;

        productos.forEach(producto => {
            valorTotalInventario += parseFloat(producto.precio) * producto.stock;
        
        });

        //respuesta exitosa
        res.json({
            success: true,
            data: {
                subcategoria: {
                id: subcategoria.id,
                nombre: subcategoria.nombre,
                activo: subcategoria.activo,
                categoria: subcategoria.categoria
                },
                estadisticas: {
                    productos: {
                        total: totalProductos,
                        activas: productosActivos,
                        inactivas: totalProductos - productosActivos
                    },
                    inventario: {
                        stockTotal,
                        valorTotal: valorTotalInventario.toFixed(2)
                        
                    //quitar decimales
                    }
                }
            },
        });

    } catch (error) {
        console.error('error en getEstadisticasSubcategoria', error);
        res.status(500).json({
            success: false,
            message: 'error al obtener estadisticas',
            error: error.message
        });
    }
};

//exportar todos los controladores
module.exports = {
    getSubcategorias,
    getSubcategoriasById,
    crearSubcategoria,
    actualizarSubcategoria,
    toggleSubcategoria,
    eliminarSubategoria,
    getEstadisticasSubcategoria
};
