function handleAddProductBtn(event) {
    const button = event.target;
    const productCard = button.closest(".product-card");

    let productId = productCard.dataset.productId;
    console.log(productId);
    
    let productIds = new Set(JSON.parse(localStorage.getItem('productIds')) || []);
    productIds.add(productId);

    localStorage.setItem('productIds', JSON.stringify(Array.from(productIds)));
    console.log(`Current selectedProductIds: ${localStorage.getItem('productIds')}`);
}