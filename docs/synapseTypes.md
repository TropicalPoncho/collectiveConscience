# Tipos de Sinapsis - Documentación

## Resumen

Se ha implementado un sistema de códigos numéricos para los tipos de sinapsis que mejora el rendimiento en MongoDB y facilita la migración futura a Neo4j.

## Tipos Disponibles

| Código | Nombre | Descripción |
|--------|--------|-------------|
| 1 | regular | Sinapsis regular |
| 2 | sub-red | Sinapsis de sub-red |

## Uso en el Código

### Crear una sinapsis

```javascript
// Usando nombre del tipo
const synapseData = {
    source: "neuronId1",
    target: "neuronId2", 
    dimensionId: 1,
    type: "regular",  // Se convierte automáticamente a código 1
    weight: 0.8,
    distance: 100
};

// Usando código directamente
const synapseData = {
    source: "neuronId1",
    target: "neuronId2",
    dimensionId: 1,
    type: 1,  // Código para regular
    weight: 0.8,
    distance: 100
};
```

### Filtrar por tipo

```javascript
// Por nombre
const regularSynapses = await synapsesService.getByType("regular");

// Por código
const subRedSynapses = await synapsesService.getByType(2);

// Por dimensión
const dimensionSynapses = await synapsesService.getByDimensionId(1);

// Por dimensión y tipo
const dimensionRegularSynapses = await synapsesService.getByDimensionIdAndType(1, "regular");
```

### Utilidades disponibles

```javascript
const { getTypeName, getTypeCode, getAllTypes } = require('./utils/synapseTypes');

// Obtener nombre por código (muy eficiente - acceso directo)
const typeName = getTypeName(1); // "regular"

// Obtener código por nombre
const typeCode = getTypeCode("sub-red"); // 2

// Obtener todos los tipos
const allTypes = getAllTypes();
// [
//   { name: "regular", code: 1, label: "Regular" },
//   { name: "sub-red", code: 2, label: "Sub-red" }
// ]
```

## API Endpoints

### Crear sinapsis
```
POST /synapses
{
    "source": "neuronId1",
    "target": "neuronId2",
    "dimensionId": 1,
    "type": "regular",  // o 1
    "weight": 0.8,
    "distance": 100
}
```

### Filtrar por tipo
```
GET /synapses/type/regular
GET /synapses/type/1
```

### Filtrar por dimensión
```
GET /synapses?dimensionId=1
GET /neurons?dimensionId=1
```

### Filtrar por dimensión y tipo
```
GET /synapses?dimensionId=1&type=regular
GET /synapses?dimensionId=1&type=1
```

## Ventajas del Sistema

1. **Mejor rendimiento**: Los índices en enteros son más eficientes en MongoDB
2. **Menor uso de memoria**: 1 byte vs varios bytes por string
3. **Validación robusta**: Mongoose valida automáticamente los valores permitidos
4. **Migración fácil a Neo4j**: Neo4j maneja muy bien las propiedades numéricas
5. **Flexibilidad**: Puedes usar nombres o códigos según prefieras
6. **Acceso directo**: `synapseType[1]` devuelve "excitatory" sin búsqueda

## Estructura del Enum

```javascript
const synapseType = {
    1: "regular",
    2: "sub-red"
}
```

Esta estructura permite acceso directo y eficiente: `synapseType[1]` → `"regular"`

## Migración a Neo4j

Cuando migres a Neo4j, los códigos numéricos se mapearán directamente a propiedades numéricas en los nodos de relación, manteniendo la eficiencia de consultas. 