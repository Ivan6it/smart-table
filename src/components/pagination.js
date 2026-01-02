import { getPages } from "../lib/utils.js";

/**
 * Применяет параметры пагинации к query (для серверной пагинации)
 * @param {Object} query - текущий query
 * @param {Object} state - { page, rowsPerPage }
 * @param {Object} action - { name }
 * @param {number} total - общее количество записей
 * @returns {Object} новый query с limit и page
 */
export const applyPagination = (query, state, action, total) => {
    const limit = state.rowsPerPage;
    let page = state.page;

    if (action) {
        const pageCount = Math.ceil(total / limit) || 1;

        switch (action.name) {
            case 'first':
                page = 1;
                break;
            case 'prev':
                page = Math.max(1, page - 1);
                break;
            case 'next':
                page = Math.min(pageCount, page + 1);
                break;
            case 'last':
                page = Math.ceil(total / limit) || 1;
                break;
            case 'goto':
                page = action.page;
                break;
            default:
                break;
        }
    }

    return { ...query, limit, page };
};

/**
 * Инициализирует обновление UI пагинации
 * @param {Object} elements - { pages, fromRow, toRow, totalRows }
 * @param {Function} createPage - функция создания кнопки
 * @returns {Function} - функция: ({ page, rowsPerPage, total }) => void
 */
export const initPagination = ({ pages, fromRow, toRow, totalRows }, createPage) => {
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();

    return ({ page, rowsPerPage, total }) => {
        const pageCount = Math.ceil(total / rowsPerPage);
        const visiblePages = getPages(page, pageCount, 5);

        pages.replaceChildren(
            ...visiblePages.map(pageNumber => {
                const el = pageTemplate.cloneNode(true);
                return createPage(el, pageNumber, pageNumber === page);
            })
        );

        fromRow.textContent = (page - 1) * rowsPerPage + 1;
        toRow.textContent = Math.min(page * rowsPerPage, total);
        totalRows.textContent = total;
    };
};