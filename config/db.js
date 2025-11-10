const mongoose = require('mongoose');
require('dotenv').config();

const {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB,
    MONGODB_URI
} = process.env;

/**
 * Construye la connection string:
 * - Usa MONGODB_URI si está definida.
 * - Si no, intenta construirla desde las variables individuales.
 * - Si faltan datos mínimos, lanza un error con instrucción clara.
 */
function buildConnectionString() {
    if (MONGODB_URI && MONGODB_URI.trim() !== '') {
        return MONGODB_URI;
    }

    // Necesitamos al menos host y db para construir la URL sin auth
    if (!MONGO_HOSTNAME || !MONGO_DB) {
        throw new Error('Falta la configuración de MongoDB. Define MONGODB_URI o MONGO_HOSTNAME y MONGO_DB (y opcionalmente MONGO_USERNAME, MONGO_PASSWORD, MONGO_PORT).');
    }

    const portPart = MONGO_PORT ? `:${MONGO_PORT}` : '';

    // Si vienen credenciales, úsalas (asegúrate de definir MONGO_PASSWORD)
    if (MONGO_USERNAME) {
        if (!MONGO_PASSWORD) {
            throw new Error('MONGO_USERNAME está definida pero falta MONGO_PASSWORD. Define ambas o usa MONGODB_URI.');
        }
        return `mongodb://${encodeURIComponent(MONGO_USERNAME)}:${encodeURIComponent(MONGO_PASSWORD)}@${MONGO_HOSTNAME}${portPart}/${MONGO_DB}?authSource=admin`;
    }

    // URL sin autenticación
    return `mongodb://${MONGO_HOSTNAME}${portPart}/${MONGO_DB}`;
}

const url = buildConnectionString();

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose.connect(url, options)
    .then(() => {
        console.log('MongoDB conectado:', url.split('?')[0]);
    })
    .catch(err => {
        console.error('Error conectando a MongoDB:', err);
        process.exit(1);
    });

module.exports = mongoose;