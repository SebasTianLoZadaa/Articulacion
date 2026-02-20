/**
 * MODELO USUARIO
 * define la tabla usuario en la base de datos
 * Almacena la informacion de los usuarios del sistema 
 */


//Importar Datatypes de sequelize
const { DataTypes } = require('sequelize');

//Importar bcrypt para encriptar contraseñas
const bcrypt = require('bcrypt');


//importar instancia de sequelize
const { sequelize } = require('../config/database');



/**
 * Definir el modelo de Usuario
 */
const Usuario = sequelize.define('Usuario', {
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
        validate: {
            notEmpty: {
                msg: 'El nombre no puede estar vacio'
            },
            len: {
                args: [2, 100],
                msg: 'El nombre debe tener entre 2 y 100 caracteres'
            }
        }
    },

    email: {
        type: DataTypes.STRING(100), // tipo cadena de texto
        allowNull: false, // no puede ser nulo
        unique: {
            msg: 'Ya existe un usuario con ese email'
        },
        validate: {
            isEmail: {
                msg: 'Debe ser un email valido'
            },
            notEmpty: {
                msg: 'El email no puede estar vacio'
            
            
            }
        }
    },

    password: {
        type: DataTypes.STRING(255), // cadena larga para el hash
        allowNull: false, // no puede ser nulo
        validate: {
            notEmpty: {
                msg: 'La contraseña no puede estar vacia'
            },
            len: {
                args: [6, 255],
                msg: 'La contraseña debe tener entre 6 y 255 caracteres'
            }
        }
    },

// Rol del usuario (cliente, auxiliar y administrador)

    rol: {
        type: DataTypes.ENUM('cliente', 'auxiliar', 'administrador'), // tipo cadena de texto
        allowNull: false, // no puede ser nulo
        defaultValue: 'cliente', // por defecto el rol es cliente
        validate: {
            isIn: {
                args: [['cliente', 'auxiliar', 'administrador']],
                msg: 'El rol debe ser cliente, auxiliar o administrador'
            }
        },
    },

//Telefono del usuario es opcional
    telefono: {
        type: DataTypes.STRING(20), // tipo cadena de texto 
        allowNull: true, // es opcional 
        validate: {
            is: {
                args: /^[0-9+\-\s()]*$/, // solo numeros, espacios, guiones y parentesis 
                msg: 'El telefono solo puede contener numeros y caracteres validos'
            }
        }
    },

    /**
     *direccion del usuario es opcional 
     */

    direccion: {
        type: DataTypes.TEXT,
        allowNull: true, // puede ser nulo
    },

    /**
      * activo estado del usuario
      */

    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true // por defecto el usuario esta activo
    }


    }, {


        //opciones del modelo

        tableName: 'usuarios', // nombre de la tabla en la base de datos
        timestamps: true, // agrega campos createdAt y updatedAt
    

        /**
         * Scopes consultas predefinidas
         */

        defaultScope:{
            /**
             *por defecto excluir el password de todas las consultas 
             */

            attributes: { exclude: ['password'] }
        },
        scopes: {
            // scope para incluir el password cuando sea necesario (ejemplo: login)
            withPassword: {
                attributes: {} // incluir todos los atributos 
            }
        }, 
        /**
         * hooks funciones que se ejecutan en momentos especificos 
         */
        hooks: {
            /**
             * beforeCreate se ejecuta antes de crear un usuario 
             * Encripta la contraseña antes de guardarla en la base de datos 
             */

            beforeCreate: async (usuario) => {
                if (usuario.password) {
                    //genera un salt (semilla aleatoria) con factor de costo de 10
                    const salt = await bcrypt.genSalt(10); 
                    //Encriptar la contraseña con salt 
                    usuario.password = await bcrypt.hash(usuario.password, salt);
                }
            },

/**
 * beforeUpdate se ejecuta antes de actualizar un usuario
 * Encripta la contraseña si fue modificada 
 */

            beforeUpdate: async (usuario) => {
                //verificar si la contraseña fue modificada 
                if (categoria.changed('password')) {
                    const salt = await bcrypt.genSalt(10); 
                    usuario.password = await bcrypt.hash(usuario.password, salt);
                    
                }
            }

        }
    
});

// METODOS DE INSTANCIA

/**
 * Metodo para comparar contraseñas
 * Compara una contraseña en texto plano con el hash guardado
 * @param {string} passwordIngresado contraseña en texto plano
 * @returns {Promise<boolean>} - true si las contraseñas coinciden, false si no 
 */
Usuario.prototype.compararPassword = async function(passwordIngresado) {
    return await bcrypt.compare(passwordIngresado, this.password);
};

/**
 * Metodo para obtener datos publicos del usuario (sin contraseña)
 * @return {object} - objetos con datos publicos del usuario
 *
 */
Usuario.prototype.toJSON = function() {
    const valores  = Object.assign({}, this.get());

    // Eliminar la contraseña del objeto
    delete valores.password;
    return valores;

};

//Exportar modelo Usuario
module.exports = Usuario;