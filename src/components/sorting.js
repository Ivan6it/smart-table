/**
 * Инициализирует обработчик сортировки
 *
 * @param {string[]} columns - Названия столбцов, по которым возможна сортировка
 * @returns {(query: Object, state: Object, action: Object) => Object} - Функция, обновляющая query
 */
export function initSorting(columns) {
    return (query, state) => {
        const button = columns.find(col => col.dataset.value !== 'none');
        const field = button ? button.dataset.field : null;
        const order = button ? button.dataset.value : 'none';
        const sort = field && order !== 'none' ? `${field}:${order}` : null;
        return sort ? { ...query, sort } : query;
    };
}