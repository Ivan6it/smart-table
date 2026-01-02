export function cloneTemplate(id) {
    const template = document.getElementById(id);
    if (!template) throw new Error(`Template #${id} not found`);

    const content = template.content.cloneNode(true);
    const container = content.firstElementChild;

    const elements = {};
    const elementNodes = container.querySelectorAll('[data-name]');
    elementNodes.forEach(node => {
        const name = node.dataset.name;
        elements[name] = node;
    });

    return { container, elements };
}

export function processFormData(formData) {
    return Array.from(formData.entries()).reduce((result, [key, value]) => {
        result[key] = value;
        return result;
    }, {});
}

export const makeIndex = (arr, field, val) => arr.reduce((acc, cur) => ({
    ...acc,
    [cur[field]]: val(cur)
}), {});

export function getPages(currentPage, maxPage, limit) {
    currentPage = Math.max(1, Math.min(maxPage, currentPage));
    limit = Math.min(maxPage, limit);

    let start = Math.max(1, currentPage - Math.floor(limit / 2));
    let end = start + limit - 1;

    if (end > maxPage) {
        end = maxPage;
        start = Math.max(1, end - limit + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return pages;
}