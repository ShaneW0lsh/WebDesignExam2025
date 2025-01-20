let bucketProductIdsList = new Set(JSON.parse(localStorage.getItem('productIds'))) || [];
const deliveryDate = document.getElementById("delivery-date");
const deliveryInterval = document.getElementById("delivery-interval");
const notification = document.querySelector(".notification");
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
                <div class="cart-item">
                    <img src="${product.image_url}" alt="Изображение товара">
                    <h3>${product.name}</h3>
                    <div class="rating">${product.rating} ${stars}</div>
                    <div class="price">
                        <span class="new-price">${product.discount_price} руб.</span>
                        <span class="old-price">${product.actual_price} руб.</span>
                    </div>
                    <button onclick="handleDeleteProductBtn(${product.id})">Удалить</button>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="cart-item">
                    <img src="${product.image_url}" alt="Изображение товара">
                    <h3>${product.name}</h3>
                    <div class="rating">${product.rating} ${stars}</div>
                    <div class="price">
                        <span class="new-price">${product.actual_price} руб.</span>
                    </div>
                    <button onclick="handleDeleteProductBtn(${product.id})">Удалить</button>
                </div>
            `;
        }
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
            if (product.discount_price === null) {
                product.discount_price = product.actual_price;
            }
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
            showNotification('success', 'type');
            setTimeout(() => {
                window.location.href = "index.html";
            }, 3000);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
    
    function showNotification(message, type) {
        notification.textContent = message;
        notification.style.display = "block";
        notification.className = `notification ${type}`;
        setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
        console.log(`notification ${message}`)
    }

    deliveryDate.addEventListener("change", calculateAndRenderCost);
    deliveryInterval.addEventListener("change", calculateAndRenderCost);
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

    console.log(deliveryDate.value);
    console.log(deliveryInterval.value);
    cost += calculateDeliveryCost(deliveryDate.value, deliveryInterval.value);
    const finalCost = document.querySelector('.checkout-summary');
    finalCost.innerText = `Итоговая стоимость: ${cost} руб.`;
}

function calculateDeliveryCost(date, time) {
    time = time.split('-')[0];
    let deliveryCost = 200;
    const deliveryDate = new Date(`${date}T${time}`);
    const day = deliveryDate.getDay();
    const hours = deliveryDate.getHours();

    if (day >= 1 && day <= 5 && hours >= 18) {
        deliveryCost += 200;
    } else if ((day === 0 || day === 6) && hours >= 18) {
        deliveryCost += 300;
    }

    return deliveryCost;
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