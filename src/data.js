const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData() {
    let sellers;
    let customers;
    let lastResult;
    let lastQuery;

    const mapRecords = (data) => {
        return data.map(item => {
            const sellerName = sellers[item.seller_id];
            const customerName = customers[item.customer_id];

            return {
                id: item.receipt_id,
                date: item.date,
                seller: sellerName,
                customer: customerName,
                total: item.total_amount
            };
        });
    };

    const getIndexes = async () => {
        if (!sellers || !customers) {
            try {
                const [sellersRes, customersRes] = await Promise.all([
                    fetch(`${BASE_URL}/sellers`),
                    fetch(`${BASE_URL}/customers`)
                ]);

                if (!sellersRes.ok) throw new Error(`Sellers: ${sellersRes.status}`);
                if (!customersRes.ok) throw new Error(`Customers: ${customersRes.status}`);

                sellers = await sellersRes.json();
                customers = await customersRes.json();
            } catch (err) {
                sellers = {};
                customers = {};
            }
        }

        return { sellers, customers };
    };

    const getRecords = async (query = {}, isUpdated = false) => {
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        try {
            const url = `${BASE_URL}/records?${nextQuery}`;
            const response = await fetch(url);

            if (!response.ok) {
                return { total: 0, items: [] };
            }

            const data = await response.json();

            if (!data || typeof data.total === 'undefined') {
                return { total: 0, items: [] };
            }

            lastQuery = nextQuery;
            lastResult = {
                total: data.total,
                items: Array.isArray(data.items) ? mapRecords(data.items) : []
            };

            return lastResult;
        } catch (err) {
            return { total: 0, items: [] };
        }
    };

    return {
        getIndexes,
        getRecords
    };
}