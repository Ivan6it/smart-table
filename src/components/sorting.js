import {sortCollection, sortMap} from "../lib/sort.js";

export function initSorting(columns) {
    return (data, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            // Переключаем состояние текущей кнопки сортировки по карте sortMap
            action.dataset.value = sortMap[action.dataset.value];

            // Сохраняем поле и направление из данных кнопки
            field = action.dataset.field;
            order = action.dataset.value;

            // Сбрасываем сортировку для остальных кнопок
            columns.forEach(column => {
                if (column.dataset.field !== action.dataset.field) {
                    column.dataset.value = 'none';
                }
            });
        } else {
            // При отсутствии действия сортировки ищем активную колонку
            const activeColumn = columns.find(col => col.dataset.value !== 'none');
            if (activeColumn) {
                field = activeColumn.dataset.field;
                order = activeColumn.dataset.value;
            }
        }

        // @todo: #3.3 — применение выбранного режима сортировки при перерисовках
        columns.forEach(column => {
            if (column.dataset.value !== 'none') {
                field = column.dataset.field;
                order = column.dataset.value;
            }
        });

        // Выполняем сортировку с выбранным полем и направлением
        return sortCollection(data, field, order);
    }
}