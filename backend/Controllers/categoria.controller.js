/**
 * Controlador de categorias
 * maneja las operaciones CRUD activar y desactivar categorias
 * solo accesible por administradores
 */

/**
 * Importar modelos
 */

const Categoria = require('../models/Categoria');
const Subcategoria = require('../models/Subcategoria');
const Producto = require('../models/Producto');
const { count } = require('node:console');

/**
 * Obtener todas la categorias
 * query params:
 * activo: true/false para filtrar por estado
 * incluirSubcategorias: true/false incluir subcategorias relacionadas
 * 
 * @param {Object} req - Response express
 * @param {Object} res - Response express
 */

const getCategorias = async (req, res) => {
    try {
        const { activo, incluirSubcategorias } = req.query;

        //opciones de consulta
        const options = {
            order: [['nombre', 'ASC']] //ordenar por nombre ascendente
        };


        //Filtrar por estado si se especfica
        if (activo === underfined) {
            opciones.where = { activo: activo === 'true' }; 
        }

        //Incluir subcategorias si se solicita
        if (IncluirSubcategorias === 'true') {
            opciones.include = [{
                model: Subcategoria,
                as: 'subcategorias', // Campo de alias para la relación
                attributes: ['id', 'nombre', 'descripcion', 'activo'] // Campos a incluir de la subcategoria
                
            }]
        }

        //Obtener categorias 
        const categorias = await Categoria.findAll(opciones);

        //Respuesta exitosa
        res.json({
            success: true,
            count: categorias.length,
            data: {
                categorias
            }
        });

    } catch (error) {
        console.error('Error en getCategorias:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorias',
            error: error.message
        })
    }
};

/**
 * Obtener todas la categorias por id
 * GET /api/categorias/:id
 * 
 * @param {Object} req - Response express
 * @param {Object} res - Response express
 */

const getCategoriasBy = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar categoria con subcategorias y contar productos
        const categoria = await Categoria.findByPk(id, {
            include: [
                {
                    model: Subcategoria,
                    as: 'subcategorias',
                    attributes: ['id', 'nombre', 'descripcion', 'activo']
                },
                {
                    model: Producto,
                    attributes: ['id'] // Solo necesitamos el id para contar
                }
            ]
        });
        
        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: 'Categoria no encontrada'
            });
        }

        // Agregar contador de productos 
        const categoriaJSON = categoria.toJSON();
        categoriaJSON.totalProductos = categoria.productos.length;
        delete categoriaJSON.productos; // No enviar la lista completa solo el contador

        // Respuesta exitosa
        res.json({
            success: true,
            data: {
                categoria: categoriaJSON
            }
        })
        
    } catch (error) {
        console.error('Error en getCategoriasById:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorias',
            error: error.message
        });


    }
};

/**
 * Crear una categoria
 * POST /api/categorias
 * body: { nombre, descripcion }
 * @param {Object} req - Response express
 * @param {Object} res - Response express
 */

const crearCategoria = async (req, res) => {
    try {
        const {nombre, descripcion} = req.body;

        // validacion 1 verificar campos requeridos
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la categoriaes requerido'
            });
        }

        // Validacion 2 verificar que el nombre no exista
        const categoriaExistente = await Categoria.findOne({ where: { nombre } });

        if (categoriaExistente) {
            return res.status(400).json({
                success: false,
                message: `Ya existe una categoria con el nombre "${nombre}"`
            });
        }

        // Crear categoria
        const nuevaCategoria = await Categoria.create({
            nombre,
            descripcion: descripcion || null, // Si no se proporciona descripcion, se establece como null
            activo: true // Por defecto, la categoria se crea activa
        });

        // Respuesta exitosa
        res.status(201).json({
            success: true,
            message: 'Categoria creada exitosamente',
            data: {
                categoria: nuevaCategoria
            }
        });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') { 
        console.error('Error en crearCategoria:', error);
        return res.status(400).json({
            success: false,
            message: 'Error al crear categoria',
            error: error.message.map(e => e.message) // Mapear errores de validación para una respuesta más clara
        });
    }

    res.status(500).json({
        success: false,
        message: 'Error al crear categoria',
        error: error.message
    })
}
};
