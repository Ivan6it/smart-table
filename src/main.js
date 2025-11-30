import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";
import { initPagination } from './components/pagination.js';
import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
// @todo: подключение


// Исходные данные используемые в render()
const {data, ...indexes} = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));

    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**

 * @param {HTMLButtonElement?} action
 */
function render(action) {
    let state = collectState();

    const normalizedState = {
        ...state,
        page: Number(state.page) || 1,          
        perPage: Number(state.rowsPerPage) || 10,  
        someFlag: state.someFlag === 'true',
    };

    let result = [...data];

    result = applyPagination(result, normalizedState, action);

    sampleTable.render(result);
}


const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// @todo: инициализация
const applyPagination = initPagination(
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

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

render();