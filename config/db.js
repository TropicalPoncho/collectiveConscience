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

// DEBUG: Imprimir la URL enmascarada para verificar en los logs de Vercel si tomó la variable
console.log('Conectando a MongoDB:', url.replace(/:([^:@]+)@/, ':****@'));

const options = {
    // Mongoose 6+ ya tiene estas opciones por defecto, se pueden omitir para evitar warnings
    // useNewUrlParser: true,
    // useUnifiedTopology: true
    serverSelectionTimeoutMS: 20000, // Aumentado a 20s para tolerar latencia en cold starts
    family: 4, // Forzar IPv4: Soluciona problemas de conexión en Vercel/AWS cuando intenta usar IPv6
    dbName: MONGO_DB // Forzar el nombre de la base de datos desde la variable de entorno
};

try{
    await mongoose.connect(url, options);
    console.log('MongoDB conectado exitosamente');
} catch(err){
    console.error('Error conectando a MongoDB:', err);
};


module.exports = mongoose;