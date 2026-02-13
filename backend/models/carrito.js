/**
 * MODELO CATEGORIA
 * define la tabla categoria en la base de datos
 * Almacena las categorias principales de los productos
 */


//Importar Datatypes de sequelize
const { DataTypes } = require('sequelize');


//importar instancia de sequelize
const { sequelize } = require('../config/database');


/**
 * Definir el modelo de Categoria
 */
const Categoria = sequelize.define('Categoria', {
    // campos de la tabla
    // id identificador unico (PRIMARY KEY)
    id: {
        type: DataTypes.INTEGER, // tipo entero
        primaryKey: true, // clave primaria
        autoIncrement: true, // se incrementa automaticamente
        allowNull: false // no puede ser nulo
    },
    
    nombre: {
        type: DataTypes.STRING(100), // tipo cadena de texto
        allowNull: false, // no puede ser nulo
        unique:{
            msg: 'Ya existe una categoria con ese nombre'
        },
        validate: {
            notEmpty: {
                msg: 'El nombre de la categoria no puede estar vacio'
            },
            len: {
                args: [2, 100],
                msg: 'El nombre de la categoria debe tener entre 2 y 100 caracteres'
            }
        }
    },

    /**
     *descripcion de la categoria
     */

     descripcion: {
        type: DataTypes.TEXT,
        allowNull: true, // puede ser nulo
     },
