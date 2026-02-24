/**
 * controlador de productos
 * maneja las operaciones crud y activar y desactivar productos
 * solo accesible por admins
 */

/**
 * importar modelos
 */

const subcategoria = require('../models/subcategoria');
const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto');


/**
 * obtener todas los productos
 * query params:
 * subcategoriaId: Id de la categoria para filtrar por categoria
 * activo true/false (filtrar por estado)
 * incluir catrgoria true/false (incluir categoria relacionada)
 *
 * @param {Object} req request express
 * @param {Object} res response express
 */

const getProductos = async (req, res) => {
    try {
        const {subcategoriaId, activo, incluirSubcategoria} = req.query;

        //opciones de consulta
        const opciones = {
            order: [['nombre', 'ASC']] // ordenar de manera alfabetica
        };

        //filtros
        const where = {};
        if (subcategoriaId) where.subcategoriaId = subcategoriaId;
        if (activo !== undefined) where.activo = activo === 'true';

        if (Object.keys(where).length > 0) {
            opciones.where = where;
        }

        //incluir subcategoria si se solicita
        if (incluirSubcategoria === 'true') {
            opciones.include = [{
                model: SubCategoria,
                as: 'subcategoria', // campo del alias para la relacion
                attributes: ['id', 'nombre', 'activo'] //campos a incluir de la subcategoria
            }]
        }

        //obtener producto
        const productos = await producto.findAll (opciones);

        //respuesta exitosa
        res.json({
            success: true,
            count: productos.length,
            data: {
                productos
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

        //buscar productos por subcategoria y conteo de producto
        const producto = await producto.findByPk(id, {
            include: [{
                model: subcategoria,
                as: 'subcategorias',
                attributes: ['id', 'nombre', 'activo']
            }]
        });

        //filtrar por estado activo si es especifico
        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'producto no encontrado'
            });
        }

        //agregar contador de productos
        const subcategoriaJSON = subcategoria.toJSON();
        subcategoriaJSON.totalProductos = subcategoriaJSON.productos.length;
        delete subcategoriaJSON.productos; //no enviar lista completa solo el contador

        //respuesta exitosa
        res.json({
            success: true,
            data: {
                subcategoria: subcategoriaJSON
            }
        });

    } catch (error) {
        console.error('error en getSubcategoriasById:', error);
        res.status (500).json({
            success: false,
            message: 'error al obtener subcategoria', error: error.message
        })
    }
};

/**
 * crear una subcategoria
 * POST /api/admin/subcategorias
 * body: {nombre, descripcion}
 * @param {Object} req request express
 * @param {Object} res response express
 */

const crearSubcategoria =async (req, res) => {
    try {
        const {nombre, descripcion, categoriaId} = req.body;

        //validcion 1 verificar campos requeridos
        if (!nombre || !categoriaId){
            return res.status(400).json({
                success: false,
                message: 'el nombre y categoria Id es requerido'
            });
        }

        //validacion 2 si la categoria existe
        const categoria = await categoria.findByPk(categoriaId);
        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: `no existe la categoria con id ${categoriaId}`
            });
        }

        // validacion 3 verifica si la categoria esta activa

        if (!categoria.activo) {
            return res.status(400).json({
                succes: false,
                message: `La categoria ${categoriaId} esta inactiva `
            })
        }


        //validacion 4 verificar que no exista una subcategoria con el mismo nombre 

        if (subcategoriaExistente) {
            return res.status(400).json({
                success: false,
                message: `ya existe una subcategoria con el nombre "${nombre}" en esta categoria`
            });
        }

        //crear subcategoria
        const nuevaSubcategoria = await Subcategoria.create({
            nombre,
            descripcion: descripcion || null, //si no se proporciona la desccripcion se establece como null
            activo: true
        });

        //respuesta exitosa
        res.status(201).json({
            success: true,
            message: 'Subcategoria creada exitosamente',
            data: {
                subcategoria: subcategoriaConCategoria
            }
        });

        } catch (error) {
            console.error('Error en crearSubcategoria',error)
            if (error.name === 'SequelizeValidationError'){
            return res.status (400).json({
                success: false,
                message: 'error de validacion', errors:
                    error.errors.map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear categoria',
            error: error.message
        })
    }
};

/**
 * actualizar subcategoria
 * PUT /api/categorias/:id
 * body: {nombre, decripcion}
 * @param {Object} req request express
 * @param {Object} res response express
 */

const actualizarSubcategoria = async (req, res) => {   //request-response req = request → lo que envía el cliente res = response → lo que tú le devuelves al cliente
    try {
        const {id} = req.params;
        const {nombre, descripcion} = req.body;

        //buscar Subcategoria
        const Subcategoria = await SubCategoria.findByPk(id);

        if (!Subcategoria) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoria no encontrada'
            });
        }

        //validacion 1 si se cambia el nombre verificar que no exista
        if ( nombre && nombre !== subcategoria.nombre) {
            const nuevaCategoria = await Categoria.findByPk(categporiaId);

            if (!subcategoriaConMismoNombre) {
                return res.status(400).json({
                    success: false,
                    message: `ya existe una subcategoria con el nombre "${nombre}" en esta categoria`
                });
            }
        }

        //actualizar campos
        if (nombre !== undefined) subcategoria.nombre = nombre;
        if (descripcion !== undefined) subcategoria.descripcion = descripcion;
        if (activo !== undefined) subcategoria.activo = activo;

        //guardar cambios
        await subcategoria.save();

        //respuesta exitosa
        res.json({
            success: true,
            message: 'subcategoria actualizada exitosamente',
            data: {
                categoria
            }
        });

    } catch (error) {
        console.error('error en actualizar la subcategoria: ', error);

        if (error.name === 'sequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'error de validacion',
                errors: error.errors.map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'error al actualizar subcategoria',
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
