/**
 * controlador de Producto
 * maneja las operaciones crud y activar y desactivar subcategorias
 * solo accesible por admins
 */

/**
 * importar modelos
 */

const Subcategoria = require('../models/Subcategoria');
const Categoria = require('../models/Categoria');
const Producto = require('../models/producto');

//Importar path y fs para manejo de imagenes
const path = require('path');
const fs = require('fs');


/**
 * obtener todos los productos
 * query params:
 * categoriaId: Id de la categoria para filtrar por categoria
 * subcategoriaId: Id de la subcategoria para filtrar por subcategoria
 * activo true/false (filtrar por estado activo/inactivo)
 * 
 *
 * @param {Object} req request express
 * @param {Object} res response express
 */

const getProductos = async (req, res) => {
    try {
        const {categoriaId,
            subcategoriaId, 
            activo,
            conStock,
            buscar,
            pagina = 1,
            limite = 100
            } = req.query;

            //Construir filtros
        const where = {};
        if (categoriaId) where.categoriaId = categoriaId;
        if (subcategoriaId) where.subcategoriaId =
        subcategoriaId;
        if (activo !== undefined) where.activo = activo === 'true';
        if (conStock === 'true') where.stock = {[require('sequelize').Op.gt]: 0};

        //paginacion
        const offset = (parseInt(pagina) -1) * parseInt(limite);




        //opciones de consulta
        const opciones = {
            where,
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre']
                }
            ],
                include: [
                {
                    model: Subcategoria,
                    as: 'subcategoria',
                    attributes: ['id', 'nombre']
                }
            ],
            limit: parseInt(limite),
            offset,
            order: [['nombre', 'ASC']]
        
        };

        //obtener productos y total
        const {count, rows: productos } = await Producto.findAndCountAll(opciones);


        //respuesta exitosa
        res.json({
            success: true,
            data: {
                productos,
                paginacion: {
                    total: count,
                    pagina: parseInt(pagina),
                    limite: parseInt(limite),
                    totalPaginas: Math.ceil(count / parseInt(limite))
                }
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
 * GET /api/admin/productos/:id
 *
 * @param {Object} req request express
 * @param {Object} res response express
 */

const getProductosById = async (req, res) => {
    try {
        const {id} = req.params;

        //buscar productos con relacion
        const producto = await Producto.findByPk(id, {
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre', 'activo']
            }],

            include: [{
                model: Subcategoria,
                as: 'subcategoria',
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

    

        //Respuesta exitosa
        res.json({
            success: true,
            data: {
                producto
            }
        });

    } catch (error) {
        console.error('error en getProductoById:', error);
        res.status (500).json({
            success: false,
            message: 'error al obtener producto', error: error.message
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
                message: 'el nombre, precio, categoriaId y subcategoriaId son requeridos'
            });
        }
    
        /** validacion 2 si el producto existe
        const producto = await Producto.findByPk(ProductoId);
        if (!producto) {
            return res.status(404).json({
                success: false,
                message: `no existe el producto con id ${ProductoId}`
            });
        } */

      // validacion 2 verifica si la categoria esta activa

    const categoria = await Categoria.findByPk(categoriaId);

        if (!categoria) {
            return res.status(400).json({
        success: false,
        message: `No existe una categoria con Id ${categoriaId}`
    });
}

        if (!categoria.activo) {
            return res.status(400).json({
        success: false,
        message: `la categoria "${categoria.nombre}" esta inactiva`
    });
}

    




        //validacion 3 verificar que la subcategoria existe y pertenece a una categoria


        const subcategoria = await Subcategoria.findByPk(subcategoriaId);

    if (!subcategoria) {
            return res.status(404).json({
                success: false,
                message: `no existe una subcategoria con id ${subcategoriaId}`
            });
        }
        if (!subcategoria.activo) {
            return res.status(400).json({
                success: false,
                message: `la subcategoria "${subcategoria.nombre}" esta inactiva`
            });
        }
        if (subcategoria.categoriaId !== parseInt(categoriaId)) {
            return res.status(400).json({
                success: false,
                message: `la subcategoria "${subcategoria.nombre}" no pertenece a la categoria con id ${categoriaId}`
            });
        }


        //validacion 4 validar precio y stock

        if (parseFloat(precio) < 0){
            return res.status(400).json({
                success: false,
                message: 'el precio no puede ser negativo'
            });
        }

        if (parseInt(stock) < 0){
            return res.status(400).json({
                success: false,
                message: 'el stock no puede ser negativo'
            });
        }


        //obtener imagen}
        const imagen = req.file ? req.file.filename : null;

        //crear Producto
        const nuevoProducto = await Producto.create({
            nombre,
            descripcion: descripcion || null, //si no se proporciona la desccripcion se establece como null
            precio: parseFloat(precio),
            stock: parseInt(stock),
            categoriaId: parseInt(categoriaId),
            subcategoriaId: parseInt(subcategoriaId),
            imagen,
            activo: true,
        });


        //recargar con relaciones
        await nuevoProducto.reload({
            include: [
                {model: Categoria, as: 'categoria', attributes: ['id', 'nombre']},
                {model: Subcategoria, as: 'subcategoria', attributes: ['id', 'nombre']},
            ]
        })

        //respuesta exitosa
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: {
                producto: nuevoProducto
            }
        });

        } catch (error) {
            console.error('Error en crearProducto',error);
            
            //si hubo un error eliminar la imagen subida
            if (req.file){
                const rutaImagen = path.join(__dirname, '../uploads/', req.file.filename);
                try {
                    await fs.unlink(rutaImagen);
                }catch (err){
                    console.error('error al eliminar la imagen', err);
                }
            
            
            }
                if (error.name === 'SequelizeValidationError') {
                    return res.status(400).json({
                        success: false,
                        message: 'Error de validacion',
                        errors: error.errors.map(e => e.message)
                    });
                }
            }
        res.status(500).json({
            success: false,
            message: 'Error al crear producto',
            error: error.message
        });
    }

// HASTA AQUI  CORRECCION PROFE
/**
 * actualizar producto
 * PUT /api/admin/productos/:id
 * body: {nombre, descripcion, precio, stock, categoriaId, subcategoriaId}
 * @param {Object} req request express
 * @param {Object} res response express
 */

const actualizarProducto = async (req, res) => {
    try {
        const {id} = req.params;
        const {nombre, descripcion, stock, precio, categoriaId, subcategoriaId } = req.body;

        //Buscar producto
        const producto = await Producto.findByPk(id);

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

         // Validar si el producto esta activo para permitir cambios
        if (!producto.activo) {
            return res.status(400).json({
                success: false,
                message: `el producto "${producto.nombre}" está inactivo`
            });
        }

        //Validacion si se cambia la categoria y subcategoria

        if (categoriaId && categoriaId !== producto.categoriaId) {
            const categoria  = await Categoria.findByPk(categoriaId);

            if (!categoria || !categoria.activo) {
                return res.status(404).json({
                    success: false,
                    message: 'categoria invalida o inactiva '
                });
            }
        }

        if (subcategoriaId && subcategoriaId !== producto.subcategoriaId) {
            const subcategoria  = await Subcategoria.findByPk(subcategoriaId);

            if (!subcategoria || !subcategoria.activo) {
                return res.status(404).json({
                    success: false,
                    message: 'subcategoria invalida o inactiva '
                });
            }
        

        const catId  =  categoriaId || producto.categoriaId

            if (!subcategoria.categoriaId !== parseInt(catId)) {
                return res.status(404).json({
                    success: false,
                    message: 'la subcategoria no pertenece a la categoria seleccionada '
                });
            }

        // validar el precio y stock

        if (precio !== undefined && parseFloat(precio) < 0 ){
            return res.status(400).json({
                success: false,
                message: 'el precio debe ser mayor a 0'
            });
        }

        if (stock !== undefined && parseInt(stock) < 0 ){
            return res.status(400).json({
                success: false,
                message: 'el stock debe ser mayor a 0'
            });
        }

        // validar o manejar imagen

        if (req.file) {
            //eliminar imagen anterior si existe
            if (producto.imagen) {
                const rutaImagenAnterior = path.join
                (__dirname, '../uploads', producto.imagen);
                try {
                    await fs.unlink(rutaImagenAnterior);
                } catch (err) {
                    console.error('Error al eliminar imagen anterior:', err)
                }
            }
            
            producto.imagen = req.file.filename;

        };

    }
        
        
        //actualizar campos
        if (nombre !== undefined) producto.nombre = nombre;
        if (descripcion !== undefined) producto.descripcion = descripcion;
        if (stock !== undefined) producto.stock = parseInt (stock);
        if (precio !== undefined) producto.precio = parseFloat (precio);
        if (subcategoriaId !== undefined) producto.subcategoriaId = parseInt (subcategoriaId);
        if (categoriaId !== undefined) producto.categoriaId = parseInt (categoriaId);
        if (activo !== undefined) producto.activo = activo;

        //guardar cambios
        await producto.save();

        //respuesta exitosa
        res.json({
            success: true,
            message: 'producto actualizado exitosamente',
            data: {
                producto,
            }
        });

    

    } catch (error) {
        console.error('error en actualizarProducto: ', error);
        if (req.file) {
            const rutaImagen = path.join (__dirname, '../uploads', req.file.filename);
            try {
                await fs.unlink(rutaImagen);
            } catch (err) {
                console.error('Error al eliminar imagen:', err);
            }
        }



        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validacion',
                errors: error.errors.map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar producto',
            error: error.message
        });
    }
};



/**
 * activar/desactivar productos
 * PATCH /api/admin/productos/:id/estado
 *
 * al desactivar producta se elimina la informacion de este
 * @param {Object} req request express
 * @param {Object} res response express
 */

const toggleProducto = async (req, res) => {
    try {
        const {id} = req.params;

        //buscar producto
        const Producto = await Producto.findByPk (idProducto);

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'producto no encontrado'
            });
        }

        //alternar estado activo
        const nuevoEstado = !producto.activo;
        producto.activo = nuevoEstado;

        //guardar cambios
        await producto.save();

        //contar cuantos registros se afectaron
        const InformacionAfectada = await Producto.count({where: {productoId: id}
        });

        //respuesta exitosa
        res.json({
            success: true,
            message: `producto ${nuevoEstado ? 'activada' : 'desactivada'} exitosamente`,
            data: {
                productoId,
                InformacionAfectada
                }
        });

    } catch (error) {
        console.error('error en toggleProducto:', error);
        res.status(500).json({
            success: false,
            message: 'error al cambiar estado del producto',
            error: error.message
        });
    }
};

/**
 * eliminar producto
 * DELETE /api/admin/productos/:id
 * @param {Object} req request express
 * @param {Object} res request express
 */
const eliminarProducto = async (req, res) => {
    try {
        const {id} = req.params;

        //buscar producto
        const Producto = await Producto.findByPk(id);
            if (!Producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Prodcuto no encontrada'
                });
            }

            //eliminar producto
            await producto.destroy();

            //respuesta exitosa
            res.json({
                success: true,
                message: 'producto eliminado exitosamente'
            });

    } catch (error) {
        console.error('error al eilminar el producto', error);
        res.status(500).json({
            success: false,
            message: 'error al eliminar el producto',
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
