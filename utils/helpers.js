/**
 * Convierte los parámetros de query en filtros para las consultas
 * @param {Object} query - Objeto query de Express
 * @returns {Object} - Objeto con filtros
 */
const queryToFilters = (query) => {
    const filters = {};
    
    // Campos que pueden ser filtros directos
    const directFilters = ['source', 'target', 'dimensionId', 'networkId', 'type'];
    
    directFilters.forEach(field => {
        if (query[field] !== undefined && query[field] !== '') {
            // Convertir a número si es posible
            const value = isNaN(query[field]) ? query[field] : parseInt(query[field]);
            filters[field] = value;
        }
    });
    
    return filters;
};

module.exports = {
    queryToFilters
}; 