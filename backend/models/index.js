/**
 * modelos de sequelize
 * este archivo define todas las relaciones entre los modelos sequelize
 * deje ejecutarse despues de importar los modelos
 */

// Importar todos los modelos

const Usuario = require ('./Usuario');
const Categoria = require ('./Categoria');
const Subcategoria = require ('./subcategoria');
const Producto = require ('./producto');
const Carrito = require ('./Carrito');
const Pedido = require ('./Pedido');
const DetallePedido = require ('./DetallePedido');


/**
 * Definir asociaciones
 * Tipos de relaciones sequelize:
 * hasone 1 a 1
 * belongsTo 1 a 1
 * hasMany 1 a muchos
 * belongsToMany muchos a muchos
 */


/**
 * Categoria - Subcategoria
 * Una categoria tiene muchas subcategorias
 * una subcategoria pertenece a una categoria
 */

Categoria.hasMany(Subcategoria, {
    foreignKey: 'categoriaId', // Campo que conecta las tablas
    as: 'subcategorias' , // Alias para la relacion
    onDelete: 'CASCADE', // Si se elimina categoria eliminar subcategorias
    onUpdate: 'CASCADE' // Si se actualiza la categoria actualizar las subcategorias

}) ;

Subcategoria.belongsTo(Categoria, {
    foreignKey: 'categoriaId', // Campo que conecta las tablas
    as: 'categoria' , // Alias para la relacion
    onDelete: 'CASCADE', // Si se elimina categoria eliminar subcategorias
    onUpdate: 'CASCADE' // Si se actualiza la categoria actualizar las subcategorias

}) ;

/**
 * Categoria -  Producto
 * Una categoria tiene muchos productos
 * un producto pertenece sa una categoria
 */

Categoria.hasMany(Producto, {
    foreignKey: 'categoriaId', // Campo que conecta las tablas
    as: 'productos' , // Alias para la relacion
    onDelete: 'CASCADE', // Si se elimina categoria eliminar el producto
    onUpdate: 'CASCADE' // Si se actualiza la categoria actualizar el producto

}) ;

Producto.belongsTo(Categoria, {
    foreignKey: 'categoriaId', // Campo que conecta las tablas
    as: 'categoria' , // Alias para la relacion
    onDelete: 'CASCADE', // Si se elimina categoria eliminar el producto
    onUpdate: 'CASCADE' // Si se actualiza la categoria actualizar el producto

}) ;

/**
 * Subcategoria y Producto
 * Una subcategoria tiene muchos productos
 * un producto pertenece a una subcategoria
 */

Subcategoria.hasMany(Producto, {
    foreignKey: 'subcategoriaId', // Campo que conecta las tablas
    as: 'productos' , // Alias para la relacion
    onDelete: 'CASCADE', // Si se elimina subcategoria eliminar el producto
    onUpdate: 'CASCADE' // Si se actualiza la subcategoria actualizar el productos

}) ;

Producto.belongsTo(Subcategoria, {
    foreignKey: 'subcategoriaId', // Campo que conecta las tablas
    as: 'subcategoria' , // Alias para la relacion
    onDelete: 'CASCADE', // Si se elimina subcategoria eliminar el producto
    onUpdate: 'CASCADE' // Si se actualiza la subcategoria actualizar el producto

}) ;

/**
 * Usuario - carrito
 * Un usuario tiene muchos carritos
 * un carrito pertenece a un usuario
 */

Usuario.hasMany(Carrito, {
    foreignKey: 'usuarioId', // Campo que conecta las tablas
    as: 'carritos' , // Alias para la relacion
    onDelete: 'CASCADE', // Si se elimina usuario eliminar carritos
    onUpdate: 'CASCADE' // Si se actualiza el usuario actualizar los carritos

}) ;

Carrito.belongsTo(Usuario, {
    foreignKey: 'usuarioId', // Campo que conecta las tablas
    as: 'usuario' , // Alias para la relacion
    onDelete: 'CASCADE', // Si se elimina el usuario eliminar el carrito
    onUpdate: 'CASCADE' // Si se actualiza el usuario actualizar el carrito

}) ;


/**
 * Producto - Carrito
 * Un producto puede estar en muchos carritos
 * Un carrito puede tener muchos productos
 */

Producto.hasMany(Carrito, {
    foreignKey: 'productoId', // Campo que conecta las tablas
    as: 'carrito' , // Alias para la relacion
    onDelete: 'CASCADE', // Si se elimina producto eliminar carrito
    onUpdate: 'CASCADE' // Si se actualiza el producto actualizar el carrito

}) ;

Carrito.belongsTo(Producto, {
    foreignKey: 'productoId', // Campo que conecta las tablas
    as: 'producto' , // Alias para la relacion
    onDelete: 'CASCADE', // Si se elimina producto eliminar carrito
    onUpdate: 'CASCADE' // Si se actualiza el producto actualizar el carrito

}) ;

/**
 * Usuario - Pedido
 * Un usuario tiene muchos pedidos
 * Un pedido pertenece a un usuario
 */

Usuario.hasMany(Pedido, {
    foreignKey: 'usuarioId', // Campo que conecta las tablas
    as: 'pedidos' , // Alias para la relacion
    onDelete: 'RESTRICT', // Si se elimina usuario no eliminar pedidos
    onUpdate: 'CASCADE' // Si se actualiza el usuario actualizar los pedidos

}) ;

Pedido.belongsTo(Usuario, {
    foreignKey: 'usuarioId', // Campo que conecta las tablas
    as: 'usuario' , // Alias para la relacion
    onDelete: 'RESTRICT', // Si se elimina usuario no eliminar pedidos
    onUpdate: 'CASCADE' // Si se actualiza el usuario actualizar el pedido

}) ;

/**
 * Pedido - Detalle Pedido
 * Un pedido tiene muchos detalles de productos
 * Un detalle de pedido pertenece a un pedido
 */

Pedido.hasMany(DetallePedido, {
    foreignKey: 'pedidoId', // Campo que conecta las tablas
    as: 'detalles' , // Alias para la relacion
    onDelete: 'CASCADE', // Si se elimina pedido eliminar detalles
    onUpdate: 'CASCADE' // Si se actualiza el pedido actualizar los detalles

}) ;

DetallePedido.belongsTo(Pedido, {
    foreignKey: 'pedidoId', // Campo que conecta las tablas
    as: 'pedido' , // Alias para la relacion
    onDelete: 'CASCADE', // Si se elimina pedido eliminar detalles
    onUpdate: 'CASCADE' // Si se actualiza el pedido actualizar los detalles

}) ;

/**
 * Producto - DetallePedido
 * Un producto tiene muchos detalles de pedido
 * un detalle de pedido pertenece a un producto
 */

Producto.hasMany(DetallePedido, {
    foreignKey: 'productoId', // Campo que conecta las tablas
    as: 'detallesPedido' , // Alias para la relacion
    onDelete: 'RESTRICT', // No se puede eliminar un producto si esta en un detalle de pedido
    onUpdate: 'CASCADE' // Si se actualiza el producto actualizar los detalles de pedido

}) ;

DetallePedido.belongsTo(Producto, {
    foreignKey: 'productoId', // Campo que conecta las tablas
    as: 'producto' , // Alias para la relacion
    onDelete: 'RESTRICT', // No se puede eliminar un producto si esta en un detalle de pedido
    onUpdate: 'CASCADE' // Si se actualiza el producto actualizar los detalles de pedido

}) ;

/**
 * relacion muchos a muchos
 * pedido y producto tiene una relacion muchos a muchos a traves de detale de pedido
 */

Pedido.belongsToMany(Producto, {
    through: DetallePedido, // Tabla intermedia
    foreignKey: 'pedidoId', // Campo que conecta las tablas
    otherKey: 'productoId', // Campo que conecta las tablas
    as: 'productos' , // Alias para la relacion

}) ;

Producto.belongsToMany(Pedido, {
    through: DetallePedido, // Campo que conecta las tablas
    foreignKey: 'productoId', // Campo que conecta las tablas
    otherKey: 'pedidoId', // Campo que conecta las tablas
    as: 'pedidos' , // Alias para la relacion
    
}) ;

/**
 * Exportar funcion de inicializacion
 * funcion para inicializar todas las asociaciones
 * se llama desde server.js despues de cargar los modelos
 */

const initAssociations =  ( ) => {
    console.log('Asociaciones entre los modelos establecidas correctamente');
};


// Exportar los modelos 
module.exports = {
    Usuario,
    Categoria,
    Subcategoria,
    Producto,
    Carrito,
    Pedido,
    DetallePedido,
    initAssociations
}

