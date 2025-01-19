document.addEventListener("DOMContentLoaded", () => {
    const catalogGrid = document.querySelector(".catalog-grid");
    const sortSelect = document.getElementById('sort-select');
    const searchInput = document.getElementById('search-input');
    const autocompleteList = document.getElementById('autocomplete-list');
    const searchButton = document.getElementById('search-button');

    async function fetchProducts(query) {
        try {
            const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?query=${query}&api_key=9bc154e2-591f-4354-9d4d-dd8a78c85e33`);
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

        const starsNum = Math.floor(product.rating);
        let stars = '';
        for (let i = 0; i < starsNum; ++i) {
            stars += '★';
        }
        for (let i = 0; i < 5 - starsNum; ++i) {
            stars += '☆';
        }
        if (product.discount_price !== product.actual_price) {
            card.innerHTML = `
                <img src="${product.image_url}" alt="Изображение товара">
                <h3 title="${product.name}">${product.name}</h3>
                <div>${product.rating} ${stars}</div>
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
                <div>${product.rating} ${stars}</div>
                <div>
                    <span class="price">${product.actual_price} ₽</span>
                </div>
                <button onclick="handleAddProductBtn(event)"">Добавить</button>
            `;
        }
        return card;
    }

    async function loadProducts(query, sortOption) {
        const products = await fetchProducts(query);
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

        if (sortedProducts.length === 0) {
            catalogGrid.innerHTML = '<p style="color: white;"> Нет товаров, соответствующих вашему запросу </p>'
        }
    }

    async function fetchAutocompleteSuggestions(query) {
        try {
            const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/autocomplete?query=${query}&api_key=9bc154e2-591f-4354-9d4d-dd8a78c85e33`);
            const data = await response.json();
            console.log(data);
            return data;
        } catch (error) {
            console.error("Error fetching autocomplete suggestions:", error);
            return [];
        }
    }

    searchInput.addEventListener("input", async () => {
        const query = searchInput.value;
        console.log(query);
        if (query.length > 0) {
            const suggestions = await fetchAutocompleteSuggestions(query);
            displayAutocompleteSuggestions(suggestions);
        } else {
            autocompleteList.innerHTML = "";
        }
    });

    searchButton.addEventListener("click", () => {
        const query = searchInput.value;
        const sortOption = sortSelect.value;
        loadProducts(query, sortOption);
    });

    function selectSuggestion(suggestion) {
        const query = searchInput.value;
        const lastWord = query.split(' ').pop();
        if (lastWord && suggestion.startsWith(lastWord)) {
            const newQuery = query.replace(lastWord, suggestion);
            searchInput.value = newQuery;
        } else {
            searchInput.value += " " + suggestion;
        }
        autocompleteList.innerHTML = "";
    }

    function displayAutocompleteSuggestions(suggestions) {
        autocompleteList.innerHTML = "";
        suggestions.forEach(suggestion => {
            const item = document.createElement("div");
            item.className = "autocomplete-item";
            item.textContent = suggestion;
            item.addEventListener("click", () => {
                selectSuggestion(suggestion);
            });
            autocompleteList.appendChild(item);
        });
    }

    sortSelect.addEventListener("change", (event) => {
        const sortOption = event.target.value;
        loadProducts(searchInput.value, sortOption);
    });

    loadProducts('', sortSelect.value);
});