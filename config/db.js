const mongoose = require('mongoose');

// Vercel asigna 'production' automáticamente. En local suele ser undefined.
console.log('Current Environment:', process.env.NODE_ENV);

// En Vercel (producción), las variables se inyectan automáticamente en process.env.
// Solo cargamos dotenv si NO estamos en producción (para desarrollo local).
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB,
    MONGODB_URI
} = process.env;

// Valores por defecto para desarrollo local (app en host, Mongo en Docker expuesto en 27017)
const DEFAULT_MONGO_HOST = MONGO_HOSTNAME || '127.0.0.1';
const DEFAULT_MONGO_PORT = MONGO_PORT || '27017';
const DEFAULT_MONGO_DB = MONGO_DB || 'collectiveconscience';

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

    const host = MONGO_HOSTNAME || DEFAULT_MONGO_HOST;
    const dbName = MONGO_DB || DEFAULT_MONGO_DB;
    const portPart = `:${MONGO_PORT || DEFAULT_MONGO_PORT}`;

    // Si vienen credenciales, úsalas (asegúrate de definir MONGO_PASSWORD)
    if (MONGO_USERNAME) {
        if (!MONGO_PASSWORD) {
            throw new Error('MONGO_USERNAME está definida pero falta MONGO_PASSWORD. Define ambas o usa MONGODB_URI.');
        }
        return `mongodb://${encodeURIComponent(MONGO_USERNAME)}:${encodeURIComponent(MONGO_PASSWORD)}@${host}${portPart}/${dbName}?authSource=admin`;
    }

    // URL sin autenticación
    return `mongodb://${host}${portPart}/${dbName}`;
}

const url = buildConnectionString();

// DEBUG: Imprimir la URL enmascarada para verificar en los logs de Vercel si tomó la variable
console.log('Conectando a MongoDB:', url.replace(/:([^:@]+)@/, ':****@'));

const options = {
    // Mongoose 6+ ya tiene estas opciones por defecto, se pueden omitir para evitar warnings
    // useNewUrlParser: true,
    // useUnifiedTopology: true
    serverSelectionTimeoutMS: 20000, // Aumentado a 20s para tolerar latencia en cold starts
    family: 4, // Forzar IPv4: Soluciona problemas de conexión en Vercel/AWS cuando intenta usar IPv6
    dbName: MONGO_DB || DEFAULT_MONGO_DB // Forzar nombre de la base de datos con fallback local
};

mongoose.connect(url, options)
    .then(() => {
        console.log('MongoDB conectado exitosamente');
    })
    .catch(err => {
        console.error('Error conectando a MongoDB:', err);
        // No hacemos process.exit(1) en serverless para no matar el contenedor frío inmediatamente,
        // pero si es crítico, el error se registrará.
    });

module.exports = mongoose;