// ELEMENTS
const loginScreen = document.getElementById('login-screen');
const adminScreen = document.getElementById('admin-screen');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const categoryNameInput = document.getElementById('category-name');
const addCategoryBtn = document.getElementById('add-category-btn');
const categoryMessage = document.getElementById('category-message');
const categoryList = document.getElementById('category-list');

const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productCategorySelect = document.getElementById('product-category');
const productDescInput = document.getElementById('product-description');
const productStockInput = document.getElementById('product-stock');
const productImageInput = document.getElementById('product-image');
const imagePreview = document.getElementById('image-preview');
const addProductBtn = document.getElementById('add-product-btn');
const productMessage = document.getElementById('product-message');
const adminProductList = document.getElementById('admin-product-list');

// LOGIN
loginBtn.addEventListener('click', async function() {
    loginBtn.textContent = 'Wait...';
    loginError.textContent = '';
    
    try {
        const result = await adminLogin(emailInput.value, passwordInput.value);
        if (result.ok) {
            loginScreen.style.display = 'none';
            adminScreen.style.display = 'block';
            loadAdminData();
        } else {
            loginError.textContent = result.message;
        }
    } catch (err) {
        loginError.textContent = "Error: " + err.message;
    }
    loginBtn.textContent = 'Enter';
});

// LOGOUT
logoutBtn.addEventListener('click', async function() {
    await adminLogout();
    adminScreen.style.display = 'none';
    loginScreen.style.display = 'block';
});

// LOAD DATA
async function loadAdminData() {
    try {
        const categories = await getCategories();
        categoryList.innerHTML = categories.length ? '' : '<p>No categories yet.</p>';
        categories.forEach(c => {
            categoryList.innerHTML += `<div class="admin-list-item">${c.name}</div>`;
        });

        productCategorySelect.innerHTML = '<option value="">Select category</option>';
        categories.forEach(c => {
            productCategorySelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });

        const products = await getProducts();
        adminProductList.innerHTML = products.length ? '' : '<p>No products yet.</p>';
        products.forEach(p => {
            adminProductList.innerHTML += `
                <div class="admin-list-item">
                    <strong>${p.name}</strong> - ₦${Number(p.price).toLocaleString()}<br>
                    <small>Stock: ${p.stock}</small><br>
                    <button onclick="deleteProduct('${p.id}').then(loadAdminData)">Delete</button>
                </div>
            `;
        });
    } catch (err) {
        alert("Error loading data: " + err.message);
    }
}

// ADD CATEGORY
addCategoryBtn.addEventListener('click', async function() {
    const name = categoryNameInput.value.trim();
    if (!name) return;
    const res = await addCategory(name);
    categoryMessage.textContent = res.ok ? "Category added!" : res.message;
    categoryMessage.style.color = res.ok ? "green" : "red";
    if (res.ok) {
        categoryNameInput.value = '';
        loadAdminData();
    }
});

// ADD PRODUCT
addProductBtn.addEventListener('click', async function() {
    if (!productNameInput.value || !productPriceInput.value || !productCategorySelect.value) {
        productMessage.textContent = "Fill name, price, and category.";
        productMessage.style.color = "red";
        return;
    }
    
    addProductBtn.textContent = 'Uploading...';
    const res = await addProduct({
        name: productNameInput.value,
        price: productPriceInput.value,
        categoryId: productCategorySelect.value,
        imageFile: productImageInput.files[0],
        description: productDescInput.value,
        stock: productStockInput.value
    });
    addProductBtn.textContent = 'Add Product';
    productMessage.textContent = res.ok ? "Product added!" : res.message;
    productMessage.style.color = res.ok ? "green" : "red";
    if (res.ok) {
        loadAdminData();
    }
});

// PREVIEW IMAGE
productImageInput.addEventListener('change', function() {
    if (this.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(this.files[0]);
    }
});