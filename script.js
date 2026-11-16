let cart = JSON.parse(localStorage.getItem('tradlinkz-cart')) || [];

const categoryView = document.getElementById('category-view');
const categoryGrid = document.getElementById('category-grid');
const productView = document.getElementById('product-view');
const productList = document.getElementById('product-list');
const currentCategoryTitle = document.getElementById('current-category-title');
const backToCategoriesBtn = document.getElementById('back-to-categories');
const cartSection = document.getElementById('cart-section');
const cartCount = document.getElementById('cart-count');
const cartItemsDiv = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

// 1. LOAD CATEGORIES FROM SUPABASE
async function renderCategories() {
    const categories = await getCategories();
    categoryGrid.innerHTML = '';
    
    if (categories.length === 0) {
        categoryGrid.innerHTML = '<p>No categories available yet.</p>';
        return;
    }

    categories.forEach(function(cat) {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `<h3>${cat.name}</h3>`;
        card.addEventListener('click', function() {
            openCategory(cat.id, cat.name);
        });
        categoryGrid.appendChild(card);
    });
}

// 2. OPEN A CATEGORY
async function openCategory(categoryId, categoryName) {
    categoryView.style.display = 'none';
    productView.style.display = 'block';
    currentCategoryTitle.textContent = categoryName;
    
    await renderProducts(categoryId);
    window.scrollTo(0, 0);
}

// 3. LOAD PRODUCTS FROM SUPABASE
async function renderProducts(categoryId) {
    productList.innerHTML = '<p>Loading products...</p>';
    const products = await getProductsByCategory(categoryId);
    productList.innerHTML = '';
    
    if (products.length === 0) {
        productList.innerHTML = '<p>No products in this category yet.</p>';
        return;
    }

    products.forEach(function(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // This fixes the missing image issue
        const imgSrc = product.image ? product.image : 'https://via.placeholder.com/150?text=No+Image';
        
        card.innerHTML = `
            <img src="${imgSrc}" alt="${product.name}" class="product-img">
            <h3>${product.name}</h3>
            <p class="price">₦${Number(product.price).toLocaleString()}</p>
            <p class="stock">Stock: ${product.stock}</p>
            <button onclick="addToCart('${product.id}')">Add to Cart</button>
        `;
        productList.appendChild(card);
    });
}

backToCategoriesBtn.addEventListener('click', function() {
    productView.style.display = 'none';
    categoryView.style.display = 'block';
});

// 4. ADD TO CART
async function addToCart(productId) {
    const allProducts = await getProducts(); // Fetch from cloud
    const product = allProducts.find(function(p) { return p.id === productId; });
    
    if (!product) return;

    const existing = cart.find(function(item) { return item.id === productId; });
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
}

// 5. UPDATE CART UI
function updateCartUI() {
    localStorage.setItem('tradlinkz-cart', JSON.stringify(cart));
    
    const totalItems = cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
    cartCount.textContent = 'Cart: ' + totalItems;
    
    if (cart.length === 0) {
        cartSection.style.display = 'none';
        return;
    }
    
    cartSection.style.display = 'block';
    cartItemsDiv.innerHTML = '';
    
    let total = 0;
    
    cart.forEach(function(item) {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        const imgSrc = (item.image && item.image !== "") ? item.image : 'https://via.placeholder.com/50?text=No+Img';
        
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${imgSrc}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;">
                <span>${item.name} (x${item.quantity})</span>
            </div>
            <span style="font-weight: bold;">₦${itemTotal.toLocaleString()}</span>
        `;
        cartItemsDiv.appendChild(div);
    });
    
    cartTotal.textContent = 'Total: ₦' + total.toLocaleString();
}

function saveCart() {
    localStorage.setItem('tradlinkz-cart', JSON.stringify(cart));
}

checkoutBtn.addEventListener('click', function() {
    if (cart.length === 0) return;
    const total = cart.reduce(function(sum, item) { return sum + (item.price * item.quantity); }, 0);
    alert('Order placed! Total: ₦' + total.toLocaleString());
    cart = [];
    updateCartUI();
});

// 6. START THE SHOP
renderCategories();
updateCartUI();