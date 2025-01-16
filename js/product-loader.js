document.addEventListener("DOMContentLoaded", () => {
    const catalogGrid = document.querySelector(".catalog-grid");
    const sortSelect = document.getElementById('sort-select');

    async function fetchProducts() {
        try {
            const response = await fetch('https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=9bc154e2-591f-4354-9d4d-dd8a78c85e33');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    }

    function createProductCard(product) {
        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.productId = product.id;
        if (product.discount_price !== product.actual_price) {
            card.innerHTML = `
                <img src="${product.image_url}" alt="Изображение товара">
                <h3 title="${product.name}">${product.name}</h3>
                <div>${product.rating}</div>
                <div>
                    <span class="price">${product.discount_price} ₽</span>
                    <span class="old-price">${product.actual_price} ₽</span>
                </div>
                <button onclick="handleAddProductBtn(event)"">Добавить</button>
            `;
        } else {
            card.innerHTML = `
                <img src="${product.image_url}" alt="Изображение товара">
                <h3 title="${product.name}">${product.name}</h3>
                <div>${product.rating}</div>
                <div>
                    <span class="price">${product.actual_price} ₽</span>
                </div>
                <button onclick="handleAddProductBtn(event)"">Добавить</button>
            `;
        }
        return card;
    }

    async function loadProducts(sortOption) {
        const products = await fetchProducts();
        let sortedProducts = [...products];

        sortedProducts.forEach(product => {
            if (product.discount_price === null) {
                product.discount_price = product.actual_price;
            }
        })

        switch (sortOption) {
            case "rating-desc":
                sortedProducts.sort((a, b) => b.rating - a.rating);
                break;
            case "rating-asc":
                sortedProducts.sort((a, b) => a.rating - b.rating);
                break;
            case "price-desc":
                sortedProducts.sort((a, b) => b.discount_price - a.discount_price);
                break;
            case "price-asc":
                sortedProducts.sort((a, b) => a.discount_price - b.discount_price);
                break;
            default:
                break;
        }

        catalogGrid.innerHTML = "";
        sortedProducts.forEach(product => {
            const productCard = createProductCard(product);
            catalogGrid.appendChild(productCard);
        });
    }

    sortSelect.addEventListener("change", (event) => {
        const sortOption = event.target.value;
        loadProducts(sortOption);
    });

    loadProducts(sortSelect.value);
});