// Importar la configuración de base de datos existente
require('../config/db');
const { Synapse } = require('../models/synapses');
const Neuron = require('../models/neurons');

class DataMigrator {
    constructor() {
        // Verificar que las variables de entorno estén definidas
        const requiredVars = ['MONGO_USERNAME', 'MONGO_PASSWORD', 'MONGO_HOSTNAME', 'MONGO_PORT', 'MONGO_DB'];
        const missingVars = requiredVars.filter(varName => !process.env[varName]);
            
        if (missingVars.length > 0) {
            throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
        }
    }

    async waitForConnection() {
        // Esperar a que la conexión esté lista
        if (mongoose.connection.readyState === 0) {
            console.log('🔗 Esperando conexión a MongoDB...');
            await new Promise(resolve => {
                mongoose.connection.once('connected', resolve);
            });
        }
        console.log('✅ Conectado a MongoDB');
    }

    async migrateSynapsesType() {
        console.log('\n🔄 Migrando campo type en sinapsis...');
        
        const totalBefore = await Synapse.countDocuments();
        const withoutType = await Synapse.countDocuments({ type: { $exists: false } });
        
        console.log(`   Total de sinapsis: ${totalBefore}`);
        console.log(`   Sinapsis sin campo 'type': ${withoutType}`);

        if (withoutType > 0) {
            const result = await Synapse.updateMany(
                { type: { $exists: false } },
                { $set: { type: 1 } }
            );

            console.log(`   ✅ Documentos modificados: ${result.modifiedCount}`);
        } else {
            console.log('   ✅ Todas las sinapsis ya tienen el campo type');
        }
    }

    async migrateSynapsesDimensionId() {
        console.log('\n🔄 Migrando campo dimensionId en sinapsis...');
        
        const withoutDimensionId = await Synapse.countDocuments({ dimensionId: { $exists: false } });
        
        console.log(`   Sinapsis sin campo 'dimensionId': ${withoutDimensionId}`);

        if (withoutDimensionId > 0) {
            // Asignar dimensionId basado en networkId si existe
            const result = await Synapse.updateMany(
                { dimensionId: { $exists: false }, networkId: { $exists: true } },
                [{ $set: { dimensionId: "$networkId" } }]
            );

            console.log(`   ✅ Documentos modificados: ${result.modifiedCount}`);
        } else {
            console.log('   ✅ Todas las sinapsis ya tienen el campo dimensionId');
        }
    }

    async showStats() {
        console.log('\n📊 Estadísticas de la base de datos:');
        
        const neuronCount = await Neuron.countDocuments();
        const synapseCount = await Synapse.countDocuments();
        
        console.log(`   Neuronas: ${neuronCount}`);
        console.log(`   Sinapsis: ${synapseCount}`);
        
        // Mostrar dimensiones únicas
        const uniqueDimensions = await Synapse.distinct('dimensionId');
        console.log(`   Dimensiones únicas en sinapsis: ${uniqueDimensions.length} (${uniqueDimensions.join(', ')})`);
        
        // Mostrar tipos únicos
        const uniqueTypes = await Synapse.distinct('type');
        console.log(`   Tipos únicos en sinapsis: ${uniqueTypes.length} (${uniqueTypes.join(', ')})`);
    }

    async runAllMigrations() {
        try {
            await this.waitForConnection();
            
            await this.migrateSynapsesType();
            await this.migrateSynapsesDimensionId();
            await this.showStats();
            
            console.log('\n✅ Todas las migraciones completadas');
            
        } catch (error) {
            console.error('❌ Error durante las migraciones:', error);
        } finally {
            // No necesitamos desconectar porque la conexión se maneja globalmente
            console.log('🏁 Migración finalizada');
        }
    }
}

// Ejecutar migraciones
const migrator = new DataMigrator();
migrator.runAllMigrations(); 