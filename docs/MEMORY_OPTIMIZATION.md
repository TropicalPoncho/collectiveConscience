# Optimización de Memoria - Corrección de Fugas de Memoria

## Problema Identificado

La aplicación presentaba **lentitud progresiva** después de varias ejecuciones, requiriendo cerrar y reabrir la pestaña. Este comportamiento es característico de **fugas de memoria (memory leaks)**.

## Causas Principales

### 1. **Acumulación de Objetos Three.js**
- `ThreeObjectManager._objectInstances` almacenaba referencias a TODOS los objetos creados
- Cuando se llamaba `replaceNetwork()`, se creaban nuevos objetos pero los antiguos nunca se eliminaban
- Geometrías, materiales y texturas permanecían en memoria

### 2. **Falta de Disposición de Recursos**
- Three.js requiere llamar manualmente a `.dispose()` en:
  - Geometrías (`geometry.dispose()`)
  - Materiales (`material.dispose()`)
  - Texturas (`texture.dispose()`)
- Sin estos llamados, la GPU mantiene los recursos asignados

### 3. **Elementos DOM Duplicados**
- El overlay negro (`ensureBlackOverlay()`) se creaba en cada transición
- No se removían los overlays antiguos, acumulándose en el DOM

### 4. **Console.log de Debug**
- Línea 91 en `ThreeObjectManager.js` imprimía todo `_objectInstances` en cada creación de link
- Esto consumía memoria en la consola del navegador

## Soluciones Implementadas

### 1. **Sistema de Disposición de Objetos Three.js**

**Archivo**: `ThreeObjectManager.js`

```javascript
// Nuevo método para liberar objetos no utilizados
disposeUnusedObjects(nodeIdsToKeep = []) {
    const idsToKeep = new Set(nodeIdsToKeep);
    const idsToRemove = [];

    // Identificar objetos a eliminar
    Object.keys(this._objectInstances).forEach(id => {
        if (!idsToKeep.has(id)) {
            idsToRemove.push(id);
        }
    });

    // Disponer y eliminar objetos
    idsToRemove.forEach(id => {
        const objectInstance = this._objectInstances[id];
        if (objectInstance && objectInstance.mesh) {
            this._disposeMesh(objectInstance.mesh);
        }
        delete this._objectInstances[id];
    });
}
```

**Beneficios**:
- Libera objetos que ya no están en el grafo
- Dispone correctamente geometrías, materiales y texturas
- Reduce drásticamente el uso de memoria de GPU y RAM

### 2. **Limpieza Recursiva de Meshes**

```javascript
_disposeMesh(mesh) {
    // Disponer hijos recursivamente
    if (mesh.children?.length > 0) {
        mesh.children.forEach(child => this._disposeMesh(child));
    }

    // Disponer geometría
    if (mesh.geometry) {
        mesh.geometry.dispose();
    }

    // Disponer materiales
    if (mesh.material) {
        if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => this._disposeMaterial(m));
        } else {
            this._disposeMaterial(mesh.material);
        }
    }
}
```

### 3. **Integración en GraphManager**

**Archivo**: `graphManager.js`

```javascript
reloadGraph(nextIdToShow = false) {
    return new Promise(resolve => {
        // Limpiar objetos Three.js no utilizados ANTES de recargar
        const currentNodeIds = this.graphData.nodes.map(n => n.id);
        const currentLinkIds = this.graphData.links.map(l => l.id);
        const allIds = [...currentNodeIds, ...currentLinkIds];
        this.threeObjectManager.disposeUnusedObjects(allIds);
        
        // ... resto del código
    });
}
```

**Resultado**: Cada vez que se reemplaza la red, los objetos antiguos se liberan automáticamente.

### 4. **Limpieza de Overlays DOM**

**Archivo**: `animationManager.js`

```javascript
removeBlackOverlay() {
    if (!this.graph?.renderer()) return;
    let canvas = this.graph.renderer().domElement;
    if (!canvas) return;
    let parent = canvas.parentElement;
    if (!parent) return;
    let overlay = parent.querySelector('.threejs-black-fade');
    if (overlay) {
        overlay.remove(); // Remueve el elemento del DOM
    }
}
```

Llamado en `clearState()` para evitar acumulación de elementos DOM.

### 5. **Optimización de Animaciones**

**Archivo**: `ThreeObjectManager.js`

```javascript
animate() {
    if(this.animationType == ThreeObjectManager.animationTypes[0]){
        Object.values(this._objectInstances).forEach((objectInstance) => {
            // Solo animar si no es un link (los links se animan separadamente)
            if (objectInstance.type !== "SinLink") {
                objectInstance.animate();
            }
        });
    } else {
        // Verificar que el objeto existe antes de animar
        if(this.objectToAnimate && this._objectInstances[this.objectToAnimate]) {
            this._objectInstances[this.objectToAnimate].animate();
        }
    }
}
```

**Beneficio**: Evita errores al intentar animar objetos ya eliminados.

### 6. **Método dispose() Completo**

**Archivo**: `mundo.js`

```javascript
dispose() {
    if (this.cameraController) {
        this.cameraController.dispose();
    }
    if (this.dataLoader) {
        this.dataLoader.clearData();
    }
    if (this.graphManager) {
        this.graphManager.dispose(); // Ahora libera objetos Three.js
    }
    if (this.animationManager) {
        this.animationManager.clearState(); // Ahora remueve overlays
    }
    if (this.threeObjectManager) {
        this.threeObjectManager.disposeAll(); // Nuevo método
    }
    // ... resto del código
}
```

### 7. **Eliminación de Console.log de Debug**

Removido `console.log(this._objectInstances)` que se ejecutaba en cada creación de link.

## Resultados Esperados

### Antes de la Optimización
- ✗ Memoria en constante crecimiento
- ✗ Lentitud progresiva después de múltiples operaciones
- ✗ Necesidad de recargar la página frecuentemente
- ✗ Acumulación de objetos Three.js en memoria
- ✗ Elementos DOM duplicados

### Después de la Optimización
- ✓ Memoria estable a lo largo del tiempo
- ✓ Rendimiento consistente sin importar el número de operaciones
- ✓ Liberación automática de recursos no utilizados
- ✓ Gestión eficiente de objetos Three.js
- ✓ DOM limpio sin elementos duplicados

## Monitoreo de Memoria

Para verificar la efectividad:

1. **Chrome DevTools**:
   - F12 → Performance → Memory
   - Grabar sesión mientras navegas el grafo
   - La memoria debería mantenerse estable con picos que bajan después de `replaceNetwork()`

2. **Console Logs**:
   - Verás mensajes como: `"Liberados 150 objetos. Quedan 50"`
   - Indica cuántos objetos se eliminaron vs. cuántos permanecen

## Mejores Prácticas para el Futuro

1. **Siempre disponer recursos Three.js**:
   ```javascript
   geometry.dispose();
   material.dispose();
   texture.dispose();
   ```

2. **Remover event listeners al limpiar**:
   ```javascript
   element.removeEventListener('click', handler);
   ```

3. **Limpiar referencias a objetos grandes**:
   ```javascript
   this.largeObject = null;
   ```

4. **Usar WeakMap/WeakSet para referencias que no impidan garbage collection**

5. **Evitar console.log de objetos grandes en producción**

## Notas de Implementación

- Los cambios son **retrocompatibles**
- No se requieren cambios en código existente que usa la API
- La limpieza es **automática** al usar `replaceNetwork()`, `addNodes()`, etc.
- Los métodos `dispose()` deben llamarse al destruir componentes

## Testing

Para probar las mejoras:

1. Cargar una red grande
2. Hacer `replaceNetwork()` múltiples veces (10-20 veces)
3. Navegar entre diferentes dimensiones
4. Usar transiciones con fade in/out repetidamente
5. Monitorear memoria en DevTools

**Resultado esperado**: Memoria estable sin crecimiento continuo.
