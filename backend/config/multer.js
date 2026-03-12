/**
 * configuracion de subida de archivos
 *
 * multer es un midelware para manejar la subida de archivos
 *
 * Este archivo configura como y donde se guardan las imagenes
 */

// Importar multer para manejar archivos
const multer = require('multer');

// Importar path para trabajar con rutas de archivos
const path = require('path');

// Importar fs para verificar / crear directorios
const fs = require('fs');

// Importar detenv para variables de entorno
require('dotenv').config();

// Obtener la ruta de donde se guardan los archivos
const uploadPath = process.env.UPLOAD_PATH || './uploads';

// Verificar si la carpeta uploads existe, si no crearla
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log(`Carpeta ${uploadPath} creada`);
}

/**
 * Configuracion de almacenamiento de multer
 * Define donde y como se guardan los archivos
 */

const storage = multer.diskStorage({
    /**
     * Destinacion: define la carpeta destino donde se guarda el archivo
     *
     * @param {object} req - Objeto de peticion HTTP
     * @param {object} file - Archivos que esta subiendo
     * @param {function} cb - Callback que se llama con (error, destination)
     */
    destination: function (req, file, cb) {
        //cb(null, ruta) -> sin error, ruta = carpeta destino
        cb(null, uploadPath);
    },

    /**
     * filename: Define el nombre con el que se guarda el archivo
     * formato: timestamp-nombreoriginal.ext
     *
     * @param {object} req - Objeto de peticion HTTP
     * @param {object} file - Archivo que se esta subiendo
     * @param {function} cb - Callback que se llama con (error, filename)
     */
    filename: function (req, file, cb) {
        //Gnerar nombre unico usando timestamp + nombre original
        //Date.now() genera un timestamp unico
        //path.extname()  extrae la extension del archivo (.jpg, .png, tec)
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

/**
 * Filtro para validar el tipo de archivo
 * solo permite imagenes (jpg, jpeg, png, gif)
 *
 * @param {object} req - Objeto de peticion HTTP
 * @param {object} file - Archivo que se esta subiendo
 * @param {function} cb - Callback que se llama con (error, acceptFile)
 */
const fileFilter = (req, file, cb) => {
    //Tipos mime permitidos para imagenes
    const allowedMimeTypes = ['image/jpg', 'image/png', 'image/gif'];

    //Verificar si el tipo de archivo es esta an la lista permitida

    if (allowedMimeTypes.includes(file.mimetype)) {
        //cb(null, true) -> aceptar el archivo
        cb(null, true);
    } else {
        //cb(error) -> rechazar archivo
        cb(new Error('Solo se permite imagenes (jpg, jpeg, png, gif)'), false);

}
};

/**
 * Configurar multer con las opciones definidas
 */

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        //LImite de tamaño del archivo en bytes
        //por defecto 5MB (5 * 1024) 5242880 bytes
        fileSize: parseInt/(process.env.MAX_FILE_SIZE) || 52428800

    }


});

/**
 * Funcion para eliminar el archivo del servidor
 * Util cuando se actualiza o elimina el producto
 * @param {string} filename - true si se elimino, false si hubo error
 * @returns {boolean} - true si se elimino, false si hubo error
 */

const deletefile = (filename) => {
    try {
        //Contruir la ruta completa del archivo
        const filepath = path.join(uploadPath, filename);
        //Verificar si el archivo existe
        if (fs.existsSync(filepath)) {
            //Eliminar el archivo
            fs.unlinkSync(filepath);
            console.log(`Archivo eliminado: ${filename}`);
            return true;
        } else {
            console.log(`Archivo no encontrado ${filename}`);
            return false;
        }
    } catch (error) {
        console.error('Error al eliminar el archivo:', error.message);
        return false;

    }
};  

//Exportar configuracion de multer y la funcion de eliminacion
module.exports = {
    upload,
    deletefile
};
