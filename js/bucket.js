let bucketProductIdsList = new Set(JSON.parse(localStorage.getItem('productIds'))) || [];
let bucketProductList = [];

document.addEventListener("DOMContentLoaded", async () => {
    const cartGrid = document.querySelector(".cart-grid");

    async function fetchProduct(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching products:", error);
            return null;
        }
    }

    function createProductCard(product) {
        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.productId = product.id;
        card.innerHTML = `
            <div class="cart-item">
                <img src="${product.image_url}" alt="Изображение товара">
                <h3>${product.name}</h3>
                <div class="rating">${product.rating} ★★★★☆</div>
                <div class="price">
                    <span class="old-price">${product.actual_price}</span>
                    <span class="new-price">${product.discount_price}</span>
                </div>
                <button onclick="handleDeleteProductBtn(${product.id})">Удалить</button>
            </div>
        `;
        return card;
    }

    async function loadProducts() {
        for (const id of bucketProductIdsList) {
            const product = await fetchProduct('https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods/' + id + '?api_key=9bc154e2-591f-4354-9d4d-dd8a78c85e33');
            if (product) {
                bucketProductList.push(product);
            }
        }

        bucketProductList.forEach(product => {
            const productCard = createProductCard(product);
            cartGrid.appendChild(productCard);
        });
    }

    await loadProducts();

    calculateAndRenderCost();

    document.getElementById('upload-form').addEventListener('submit', function(event) {
        event.preventDefault();

        console.log('submit');
        const form = event.target;
        const formData = new FormData(form);
        formData.append('good_ids', localStorage.getItem('productIds'));
        formData.set('delivery_date', formatDateTime(formData.get('delivery_date')));

        for (let pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }
    
        fetch('https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders?api_key=9bc154e2-591f-4354-9d4d-dd8a78c85e33', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            localStorage.removeItem("productIds")
            console.log(localStorage.getItem("productIds"));
            console.log('Success:', data);
            window.location.href = "index.html";
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
    
    function showNotification(message, type) {
        // notification.textContent = message;
        // notification.style.display = "block";
        // notification.className = `notification ${type}`;
        // setTimeout(() => {
        //     notification.style.display = "none";
        // }, 3000);
        console.log(`notification ${message}`)
    }
});

function formatDateTime(date) {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString("ru-RU");
}

function calculateAndRenderCost() {
    let cost = 0;
    bucketProductList.forEach(prod => {
        if (prod.discount_price) {
            cost += prod.discount_price;
        } else {
            cost += prod.actual_price;
        }
    });

    console.log(cost);
    const finalCost = document.querySelector('.checkout-summary');
    finalCost.innerText = `Итоговая стоимость: ${cost} руб.`;
}


function handleDeleteProductBtn(id) {
    let productIds = new Set(JSON.parse(localStorage.getItem('productIds')) || []);
    productIds.delete(`${id}`);

    localStorage.setItem('productIds', JSON.stringify(Array.from(productIds)));
    console.log(`Current selectedProductIds: ${localStorage.getItem('productIds')}`);

    const productCard = document.querySelector(`.product-card[data-product-id="${id}"]`);
    if (productCard) {
        productCard.remove();
    }

    bucketProductIdsList.delete(`${id}`);
    bucketProductList = bucketProductList.filter(product => product.id !== id);

    console.log(bucketProductIdsList);
    console.log(bucketProductList);

    calculateAndRenderCost();
}