



























/**
 * Vonfiguracion de almacenamiento de multer 
 * define donde y como se guardaran los archivos 
 */

const storage = multer.diskStorage({
    /**
     * Destination: define la carpeta destino donde se guardara el archivo 
     * 
     * @param {Object} req - Objeto de peticion HTTP
     * @param {Object} file - Archivo que esta subiendo 
     * @param {Function} cb - Callback que se llama con (errorm destination)
     */
    destination: function(req, file, cb) {
        // cb(null,ruta) -> sin error, ruta = carpeta destino
        cb(null, uploadPath); // Carpeta "uploads" en la raiz del proyecto
    },
    /**
     * filename: Define el nombre con el que se guardara el archivo 
     * formato: timestamp-nombreoriginal.ext
     * 
     * @param {Object} req - Objeto de peticion HTTP
     * @param {Object} file - Archivo que esta subiendo 
     * @param {Function} cb - Callback que se llama con (error, filename) 
     */
    filename: function(req, file, cb) {
        //Generar nombre unico usando timestamp + nombre original
        //Date.now() genera un timestamp unico 
        //path.extname() extrae la extencion del archivo (.jpg, .png, etc)
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniquename);
    }

});

/**
 * Filtro para validar el tipo de archivo 
 * Solo permite imagenes (jpg, jpeg, png, gif)
 * 
 * @param {Object} req - Objeto de peticion HTTP
 * @param {Object} file - Archivo que esta subiendo 
 * @param {Function} cb - Callback que se llama con (error, accept)
 */