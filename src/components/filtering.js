import { createComparison, defaultRules } from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes).forEach((elementName) => {
        elements[elementName].append(
            ...Object.values(indexes[elementName]).map(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                return option;
            })
        );
    });

    return (data, state, action) => {
        // @todo: #4.2 — обработать очистку поля
        if (action?.type === 'click' && action.el?.name === 'clear') {
            const field = action.el.dataset.field;
            const container = action.el.closest('div');
            if (container) {
                const input = container.querySelector('input, select');
                if (input) {
                    input.value = '';
                    state[field] = '';
                }
            }
        }

        // @todo: #4.5 — отфильтровать данные используя компаратор
        // Возвращаем только те строки, которые удовлетворяют текущему состоянию фильтра
        return data.filter(row => compare(row, state) === 0);
    };
}

import { createComparison, rules, skipEmptyTargetValues } from "../lib/compare.js";

export function initSearching(searchField) {
  const compare = createComparison(
    [skipEmptyTargetValues],
    [rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false)]
  );

  return (data, state, action) => {
    // Обратите внимание, что поиск применяется перед фильтрацией
    if (!state[searchField]) return data;

    return data.filter(item => compare(item, state) === 0);
  };
}