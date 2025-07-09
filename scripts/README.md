# Scripts de Migración de Datos

Esta carpeta contiene scripts para migrar y mantener la base de datos.

## Scripts Disponibles

### 1. `migrate-synapses.js`
Script específico para agregar el campo `type` a todas las sinapsis que no lo tengan.

**Uso:**
```bash
node scripts/migrate-synapses.js
```

### 2. `migrate-data.js`
Script genérico que ejecuta múltiples migraciones:
- Agrega campo `type` a sinapsis
- Migra `networkId` a `dimensionId` si es necesario
- Muestra estadísticas de la base de datos

**Uso:**
```bash
node scripts/migrate-data.js
```

## Arquitectura

Los scripts utilizan la configuración de conexión existente en `config/db.js` y los modelos definidos en `models/`. Esto asegura:

- **Consistencia**: Usa la misma configuración que la aplicación principal
- **Mantenibilidad**: Cambios en la configuración se reflejan automáticamente
- **Reutilización**: No duplica código de conexión ni modelos

### Conexión a Base de Datos
```javascript
// Los scripts importan la configuración existente
require('../config/db');

// Y esperan a que la conexión esté lista
if (mongoose.connection.readyState === 0) {
    await new Promise(resolve => {
        mongoose.connection.once('connected', resolve);
    });
}
```

## Migraciones Incluidas

### Migración de Campo Type
```javascript
// Agrega type: 1 a todas las sinapsis que no tengan este campo
await Synapse.updateMany(
    { type: { $exists: false } },
    { $set: { type: 1 } }
);
```

### Migración de DimensionId
```javascript
// Copia networkId a dimensionId si dimensionId no existe
await Synapse.updateMany(
    { dimensionId: { $exists: false }, networkId: { $exists: true } },
    [{ $set: { dimensionId: "$networkId" } }]
);
```

## Agregar Nuevas Migraciones

Para agregar una nueva migración al script genérico:

1. Agrega un nuevo método en la clase `DataMigrator`:
```javascript
async migrateNuevoCampo() {
    console.log('\n🔄 Migrando nuevo campo...');
    
    const result = await Model.updateMany(
        { campo: { $exists: false } },
        { $set: { campo: valorPorDefecto } }
    );
    
    console.log(`   ✅ Documentos modificados: ${result.modifiedCount}`);
}
```

2. Llama el método en `runAllMigrations()`:
```javascript
await this.migrateNuevoCampo();
```

## Verificación

Los scripts muestran estadísticas antes y después de las migraciones para verificar que todo funcione correctamente.

## Requisitos

### Archivo `.env`
El archivo `.env` debe contener las siguientes variables (las mismas que usa la aplicación principal):

```env
MONGO_USERNAME=tu_usuario
MONGO_PASSWORD=tu_password
MONGO_HOSTNAME=localhost
MONGO_PORT=27017
MONGO_DB=collectiveConscience
```

### Dependencias
Los scripts usan las mismas dependencias que el proyecto principal:
```bash
npm install mongoose dotenv
```

### Verificación
Los scripts verifican automáticamente que todas las variables de entorno estén definidas antes de intentar conectarse a MongoDB.

## Ventajas de esta Arquitectura

1. **DRY (Don't Repeat Yourself)**: No duplica configuración de conexión
2. **Consistencia**: Usa los mismos modelos y configuración que la app
3. **Mantenibilidad**: Cambios en `config/db.js` se reflejan automáticamente
4. **Simplicidad**: Los scripts son más simples y enfocados en la lógica de migración 