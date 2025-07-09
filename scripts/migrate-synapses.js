const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Synapse } = require('../models/synapses');

// Importar la configuración de base de datos existente
require('../config/db');

dotenv.config();

async function migrateSynapses() {
    try {
        // Verificar que las variables de entorno estén definidas
        const requiredVars = ['MONGO_USERNAME', 'MONGO_PASSWORD', 'MONGO_HOSTNAME', 'MONGO_PORT', 'MONGO_DB'];
        const missingVars = requiredVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
        }

        // Esperar a que la conexión esté lista
        if (mongoose.connection.readyState === 0) {
            console.log('🔗 Esperando conexión a MongoDB...');
            await new Promise(resolve => {
                mongoose.connection.once('connected', resolve);
            });
        }
        console.log('✅ Conectado a MongoDB');

        // Contar documentos antes de la migración
        const totalBefore = await Synapse.countDocuments();
        const withoutType = await Synapse.countDocuments({ type: { $exists: false } });
        
        console.log(`Total de sinapsis: ${totalBefore}`);
        console.log(`Sinapsis sin campo 'type': ${withoutType}`);

        if (withoutType > 0) {
            // Actualizar todos los documentos que no tengan el campo type
            const result = await Synapse.updateMany(
                { type: { $exists: false } },
                { $set: { type: 1 } }
            );

            console.log(`✅ Migración completada:`);
            console.log(`   - Documentos modificados: ${result.modifiedCount}`);
            console.log(`   - Documentos coincidentes: ${result.matchedCount}`);
        } else {
            console.log('✅ Todas las sinapsis ya tienen el campo type');
        }

        // Verificar después de la migración
        const withoutTypeAfter = await Synapse.countDocuments({ type: { $exists: false } });
        console.log(`Sinapsis sin campo 'type' después de migración: ${withoutTypeAfter}`);

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
    } finally {
        // No necesitamos desconectar porque la conexión se maneja globalmente
        console.log('🏁 Migración finalizada');
    }
}

// Ejecutar migración
migrateSynapses(); 