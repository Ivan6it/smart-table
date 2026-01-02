import { cloneTemplate } from "../lib/utils.js";

export function initTable(settings, onAction) {
    const { tableTemplate, rowTemplate, before, after } = settings;
    const root = cloneTemplate(tableTemplate);

    root.elements = {};
    const elementNodes = root.container.querySelectorAll('[data-name]');
    elementNodes.forEach(node => {
        const name = node.dataset.name;
        root.elements[name] = node;
    });

    if (Array.isArray(before)) {
        before.slice().reverse().forEach(subName => {
            root[subName] = cloneTemplate(subName);
            root.container.prepend(root[subName].container);
        });
    }

    if (Array.isArray(after)) {
        after.forEach(subName => {
            root[subName] = cloneTemplate(subName);
            root.container.append(root[subName].container);
        });
    }

    root.container.addEventListener('change', () => {
        onAction();
    });

    root.container.addEventListener('reset', () => {
        setTimeout(() => onAction());
    });

    root.container.addEventListener('submit', (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });

    const render = (data) => {
        const nextRows = data.map(item => {
            const row = cloneTemplate(rowTemplate);
            Object.keys(item).forEach(key => {
                if (key in row.elements) {
                    row.elements[key].textContent = item[key];
                }
            });
            return row.container;
        });

        if (root.elements.rows) {
            root.elements.rows.replaceChildren(...nextRows);
        }
    };

    return { ...root, render };
}