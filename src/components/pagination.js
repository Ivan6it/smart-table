import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // @todo: #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
    const pageTemplate = pages.firstElementChild.cloneNode(true);  // клонируем первый элемент как шаблон
    pages.firstElementChild.remove();                             // удаляем его из контейнера, чтобы очистить пространство

    return (data, state, action) => {
       // @todo: #2.1 — посчитать количество страниц, объявить переменные и константы
    const rowsPerPage = state.rowsPerPage;                      // будем часто обращаться
    const pageCount = Math.ceil(data.length / rowsPerPage);     // число страниц, округляем вверх
    let page = state.page;                                       // переменная, так как может измениться

        // @todo: #2.6 — обработать действия
    if (action) switch(action.name) {
        case 'prev': 
            page = Math.max(1, page - 1);   // переход на предыдущую страницу, минимум 1
            break;
        case 'next': 
            page = Math.min(pageCount, page + 1);  // переход на следующую страницу, максимум pageCount
            break;
        case 'first': 
            page = 1;   // переход на первую страницу
            break;
        case 'last': 
            page = pageCount;  // переход на последнюю страницу
            break;
    }

        // @todo: #2.4 — получить список видимых страниц и вывести их
    const visiblePages = getPages(page, pageCount, 5);           // получаем массив видимых страниц (максимум 5)
    pages.replaceChildren(...visiblePages.map(pageNumber => {    // заменяем содержимое контейнера на новые кнопки
    const el = pageTemplate.cloneNode(true);                 // клонируем шаблон для каждой кнопки
    return createPage(el, pageNumber, pageNumber === page);   // вызываем колбэк для заполнения кнопки (активная страница выделена)
    }));

        // @todo: #2.5 — обновить статус пагинации
    fromRow.textContent = (page - 1) * rowsPerPage + 1;                  // С какой строки выводим
    toRow.textContent = Math.min(page * rowsPerPage, data.length);      // До какой строки выводим (учитываем последнюю страницу)
    totalRows.textContent = data.length;                                // Общее количество строк после фильтрации

        // @todo: #2.2 — посчитать сколько строк нужно пропустить и получить срез данных
    const skip = (page - 1) * rowsPerPage;           // сколько строк нужно пропустить
    return data.slice(skip, skip + rowsPerPage);    // возвращаем нужный срез данных
    }
}