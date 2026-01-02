import './fonts/ys-display/fonts.css'
import './style.css'
import { initSorting } from './components/sorting.js';
import { initSearching } from './components/searching.js';
import { initPagination } from './components/pagination.js';
import { initData } from "./data.js";
import { initTable } from "./components/table.js";
import { initFiltering } from './components/filtering.js';

const API = initData();

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// Инициализируем UI пагинации (только для обновления кнопок)
const updatePaginationUI = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const { applyFiltering, updateIndexes } = initFiltering(sampleTable.filter.elements);
const applySearching = initSearching('search');
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

let currentTotal = 0;

function collectState() {
    const formData = new FormData(sampleTable.container);
    const state = {};

    // Маппинг
    const nameToDataName = {
        date: 'searchByDate',
        customer: 'searchByCustomer',
        seller: 'searchBySeller',
        totalFrom: 'totalFrom',
        totalTo: 'totalTo',
        rowsPerPage: 'rowsPerPage',
        someFlag: 'someFlag'
    };

    for (let [name, value] of formData.entries()) {
        const dataName = nameToDataName[name] || name;
        state[dataName] = value;
    }

    return {
        ...state,
        rowsPerPage: Number(state.rowsPerPage) || 10,
        page: Number(state.page) || 1,
        someFlag: state.someFlag === 'true',
    };
}

// Обработчик событий
sampleTable.container.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    const name = button.getAttribute('name');
    if (!['first', 'prev', 'next', 'last'].includes(name)) return;

    e.preventDefault();
    render({ name });
});

// Обработчик для кнопок пагинации
sampleTable.container.addEventListener('change', (e) => {
    const input = e.target.closest('input[name="page"]');
    if (input) {
        const page = Number(input.value);
        render({ name: 'goto', page });
    }
});

// Обработчик сортировки
sampleTable.container.addEventListener('click', (e) => {
    const sortButton = e.target.closest('button[name="sort"]');
    if (!sortButton) return;

    e.preventDefault();

    const currentValue = sortButton.dataset.value;
    const newValue = { 'none': 'up', 'up': 'down', 'down': 'none' }[currentValue];

    sortButton.dataset.value = newValue;

    sampleTable.container
        .querySelectorAll('button[name="sort"]')
        .forEach(btn => {
            if (btn !== sortButton) {
                btn.dataset.value = 'none';
            }
        });

    render();
});

// Основная функция рендеринга
async function render(action) {
    const state = collectState();
    const rowsPerPage = state.rowsPerPage;
    let targetPage = state.page;

    if (action) {
        switch (action.name) {
            case 'first':
                targetPage = 1;
                break;
            case 'prev':
                targetPage = Math.max(1, targetPage - 1);
                break;
            case 'next':
                targetPage = Math.min(Math.ceil(currentTotal / rowsPerPage), targetPage + 1);
                break;
            case 'last': {
                const tempQuery = applyFiltering({}, state, action);
                const { total } = await API.getRecords({ ...tempQuery, limit: 1, page: 1 });
                targetPage = Math.ceil(total / rowsPerPage) || 1;
                break;
            }
            case 'goto':
                targetPage = action.page;
                break;
            default:
                break;
        }
    }

    const query = {
    ...applySearching({}, state, action),
    ...applyFiltering({}, state, action),
    ...applySorting({}, state, action),
    limit: rowsPerPage,
    page: targetPage
};

    try {
    const { total, items } = await API.getRecords(query);
    currentTotal = total;
    const pageCount = Math.ceil(total / rowsPerPage);
    const finalPage = Math.min(targetPage, pageCount || 1);

    // Фикс, когда страница недоступна
    if (targetPage > pageCount && pageCount > 0) {
        return render({ name: 'goto', page: pageCount });
    }

    updatePaginationUI({ page: finalPage, rowsPerPage, total });

    setTimeout(() => {
        const pageInputs = sampleTable.container.querySelectorAll('input[name="page"]');
        pageInputs.forEach(input => {
            input.checked = Number(input.value) === finalPage;
        });
    }, 0);

    sampleTable.render(items);

// Не теряем фокуса с пагинации
if (action && ['first', 'prev', 'next', 'last', 'goto'].includes(action.name)) {
    setTimeout(() => {
        const paginationContainer = sampleTable.pagination.elements.pages.closest('.pagination-container');
        if (paginationContainer) {
            paginationContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, 100);
}

} catch (err) {
    console.error('Ошибка при загрузке данных:', err);
}
}

// Инициализация
async function init() {
    const indexes = await API.getIndexes();
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
    await render();
}

init();