/* =========================================================
   CONTIX PHONES
   Main Application
   Currency: Nigerian Naira (₦ / NGN)
   ========================================================= */


/* =========================
   SETTINGS
========================= */

const ADMIN_PASSWORD = "King2025";

const STORAGE = {
    products: "contix_products",
    cart: "contix_cart",
    orders: "contix_orders",
    settings: "contix_settings"
};


/* =========================
   DEFAULT SETTINGS
========================= */

const DEFAULT_SETTINGS = {

    bankName: "Your Bank",

    accountName: "Contix Phones",

    accountNumber: "0000000000",

    email: "contact@contixphones.com",

    phone: "+234 000 000 0000"

};


/* =========================
   DEFAULT PRODUCTS
========================= */

const DEFAULT_PRODUCTS = [

    {
        id: "phone-1",

        name: "iPhone 17 Pro Max",

        price: 2150000,

        stock: "Pre-order",

        description:
            "Premium iPhone with powerful performance and advanced camera system.",

        image: ""
    },


    {
        id: "phone-2",

        name: "Samsung Galaxy S26 Ultra",

        price: 1850000,

        stock: "Pre-order",

        description:
            "Flagship Samsung smartphone with premium display, camera and performance.",

        image: ""
    },


    {
        id: "phone-3",

        name: "Google Pixel Pro",

        price: 1350000,

        stock: "Pre-order",

        description:
            "Premium Android phone with an excellent camera and clean software experience.",

        image: ""
    }

];


/* =========================
   CURRENCY
========================= */

function formatNaira(amount) {

    const number = Number(amount) || 0;

    return "₦" + number.toLocaleString("en-NG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

}


/* =========================
   STORAGE HELPERS
========================= */

function getProducts() {

    const saved = localStorage.getItem(STORAGE.products);

    if (!saved) {

        localStorage.setItem(
            STORAGE.products,
            JSON.stringify(DEFAULT_PRODUCTS)
        );

        return DEFAULT_PRODUCTS;

    }

    try {

        return JSON.parse(saved);

    } catch {

        return DEFAULT_PRODUCTS;

    }

}


function saveProducts(products) {

    localStorage.setItem(
        STORAGE.products,
        JSON.stringify(products)
    );

}


function getCart() {

    try {

        return JSON.parse(
            localStorage.getItem(STORAGE.cart)
        ) || [];

    } catch {

        return [];

    }

}


function saveCart(cart) {

    localStorage.setItem(
        STORAGE.cart,
        JSON.stringify(cart)
    );

}


function getOrders() {

    try {

        return JSON.parse(
            localStorage.getItem(STORAGE.orders)
        ) || [];

    } catch {

        return [];

    }

}


function saveOrders(orders) {

    localStorage.setItem(
        STORAGE.orders,
        JSON.stringify(orders)
    );

}


function getSettings() {

    try {

        const saved = JSON.parse(
            localStorage.getItem(STORAGE.settings)
        );

        return {
            ...DEFAULT_SETTINGS,
            ...(saved || {})
        };

    } catch {

        return DEFAULT_SETTINGS;

    }

}


function saveSettings(settings) {

    localStorage.setItem(
        STORAGE.settings,
        JSON.stringify(settings)
    );

}


/* =========================
   CART TOTAL
========================= */

function getCartTotal() {

    const products = getProducts();

    const cart = getCart();

    let total = 0;

    cart.forEach(item => {

        const product = products.find(
            p => p.id === item.productId
        );

        if (product) {

            total += Number(product.price) *
                     Number(item.quantity || 1);

        }

    });

    return total;

}


/* =========================
   CART COUNT
========================= */

function updateCartCount() {

    const cart = getCart();

    const count = cart.reduce(
        (total, item) =>
            total + Number(item.quantity || 1),
        0
    );

    const element =
        document.getElementById("cartCount");

    if (element) {

        element.textContent = count;

    }

}


/* =========================
   ADD TO CART
========================= */

function addToCart(productId) {

    const products = getProducts();

    const product = products.find(
        p => p.id === productId
    );

    if (!product) {

        alert("Product not found.");

        return;

    }


    const cart = getCart();

    const existing = cart.find(
        item => item.productId === productId
    );


    if (existing) {

        existing.quantity =
            Number(existing.quantity || 1) + 1;

    } else {

        cart.push({

            productId: productId,

            quantity: 1

        });

    }


    saveCart(cart);

    updateCartCount();


    alert(
        product.name +
        " has been added to your cart."
    );

}


/* =========================
   REMOVE FROM CART
========================= */

function removeFromCart(productId) {

    let cart = getCart();

    cart = cart.filter(
        item => item.productId !== productId
    );

    saveCart(cart);

    renderCart();

    updateCartCount();

}


/* =========================
   PRODUCTS PAGE
========================= */

function renderProducts() {

    const grid =
        document.getElementById("productsGrid");

    if (!grid) return;


    const products = getProducts();

    const empty =
        document.getElementById("emptyProducts");


    grid.innerHTML = "";


    if (products.length === 0) {

        if (empty) {

            empty.style.display = "block";

        }

        return;

    }


    if (empty) {

        empty.style.display = "none";

    }


    products.forEach(product => {

        const card =
            document.createElement("div");

        card.className = "product-card";


        let imageHTML;

        if (product.image) {

            imageHTML = `
                <img
                    src="${product.image}"
                    alt="${escapeHTML(product.name)}">
            `;

        } else {

            imageHTML = `
                <div class="product-placeholder">
                    📱
                </div>
            `;

        }


        card.innerHTML = `

            <div class="product-image">
                ${imageHTML}
            </div>

            <div class="product-info">

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p class="product-description">
                    ${escapeHTML(product.description)}
                </p>

                <div class="product-bottom">

                    <div>

                        <div class="product-price">
                            ${formatNaira(product.price)}
                        </div>

                        <div class="product-stock">
                            ${escapeHTML(
                                product.stock || "Available"
                            )}
                        </div>

                    </div>

                    <button
                        class="add-cart"
                        onclick="addToCart('${product.id}')">
                        + Add
                    </button>

                </div>

            </div>

        `;


        grid.appendChild(card);

    });

}


/* =========================
   CART PAGE
========================= */

function renderCart() {

    const container =
        document.getElementById("cartItems");

    if (!container) return;


    const empty =
        document.getElementById("emptyCart");

    const summary =
        document.getElementById("cartSummary");


    const products = getProducts();

    const cart = getCart();


    container.innerHTML = "";


    if (cart.length === 0) {

        if (empty) {

            empty.style.display = "block";

        }

        if (summary) {

            summary.style.display = "none";

        }

        return;

    }


    if (empty) {

        empty.style.display = "none";

    }

    if (summary) {

        summary.style.display = "block";

    }


    cart.forEach(item => {

        const product =
            products.find(
                p => p.id === item.productId
            );

        if (!product) return;


        const quantity =
            Number(item.quantity || 1);


        const itemTotal =
            Number(product.price) * quantity;


        const div =
            document.createElement("div");

        div.className = "cart-item";


        let imageHTML;

        if (product.image) {

            imageHTML = `
                <img
                    src="${product.image}"
                    alt="${escapeHTML(product.name)}">
            `;

        } else {

            imageHTML = `<span>📱</span>`;

        }


        div.innerHTML = `

            <div class="cart-item-image">
                ${imageHTML}
            </div>

            <div>

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p>
                    Quantity: ${quantity}
                </p>

                <div class="cart-item-price">
                    ${formatNaira(itemTotal)}
                </div>

            </div>

            <div>
                <button
                    class="remove-item"
                    onclick="removeFromCart('${product.id}')">
                    Remove
                </button>
            </div>

        `;


        container.appendChild(div);

    });


    const subtotal =
        document.getElementById("cartSubtotal");

    const total =
        document.getElementById("cartTotal");


    if (subtotal) {

        subtotal.textContent =
            formatNaira(getCartTotal());

    }


    if (total) {

        total.textContent =
            formatNaira(getCartTotal());

    }

}


/* =========================
   CHECKOUT
========================= */

function openCheckout() {

    const cart = getCart();

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;

    }


    const modal =
        document.getElementById("checkoutModal");

    if (!modal) return;


    const settings = getSettings();


    const bank =
        document.getElementById(
            "checkoutBankName"
        );

    const accountName =
        document.getElementById(
            "checkoutAccountName"
        );

    const accountNumber =
        document.getElementById(
            "checkoutAccountNumber"
        );

    const amount =
        document.getElementById(
            "checkoutAmount"
        );


    if (bank) {

        bank.textContent =
            settings.bankName;

    }


    if (accountName) {

        accountName.textContent =
            settings.accountName;

    }


    if (accountNumber) {

        accountNumber.textContent =
            settings.accountNumber;

    }


    if (amount) {

        amount.textContent =
            formatNaira(getCartTotal());

    }


    modal.classList.add("active");

}


function closeCheckout() {

    const modal =
        document.getElementById("checkoutModal");

    if (modal) {

        modal.classList.remove("active");

    }

}


/* =========================
   SUBMIT ORDER
========================= */

function submitOrder(event) {

    event.preventDefault();


    const cart = getCart();

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;

    }


    const name =
        document.getElementById(
            "customerName"
        ).value.trim();


    const phone =
        document.getElementById(
            "customerPhone"
        ).value.trim();


    const email =
        document.getElementById(
            "customerEmail"
        ).value.trim();


    const address =
        document.getElementById(
            "customerAddress"
        ).value.trim();


    const products = getProducts();


    const orderItems = cart.map(item => {

        const product =
            products.find(
                p => p.id === item.productId
            );

        return {

            productId: item.productId,

            name: product
                ? product.name
                : "Unknown Product",

            price: product
                ? Number(product.price)
                : 0,

            quantity:
                Number(item.quantity || 1)

        };

    });


    const total =
        orderItems.reduce(
            (sum, item) =>
                sum +
                item.price *
                item.quantity,
            0
        );


    const orderId =
        "CTX-" +
        Date.now().toString().slice(-8);


    const order = {

        id: orderId,

        customer: {

            name,

            phone,

            email,

            address

        },

        items: orderItems,

        total,

        status: "Payment Pending",

        createdAt:
            new Date().toISOString()

    };


    const orders = getOrders();

    orders.unshift(order);

    saveOrders(orders);


    /* Clear cart */

    localStorage.removeItem(
        STORAGE.cart
    );


    /* Show success */

    const form =
        document.getElementById(
            "checkoutForm"
        );

    const success =
        document.getElementById(
            "orderSuccess"
        );

    const successId =
        document.getElementById(
            "successOrderId"
        );


    if (form) {

        form.style.display = "none";

    }


    if (successId) {

        successId.textContent =
            orderId;

    }


    if (success) {

        success.style.display =
            "block";

    }


    updateCartCount();

}


/* =========================
   ADMIN LOGIN
========================= */

function checkAdminSession() {

    const loggedIn =
        sessionStorage.getItem(
            "contix_admin_logged_in"
        );


    const login =
        document.getElementById(
            "adminLogin"
        );

    const dashboard =
        document.getElementById(
            "adminDashboard"
        );


    if (!login || !dashboard) return;


    if (loggedIn === "true") {

        login.style.display = "none";

        dashboard.style.display = "block";

        renderAdmin();

    } else {

        login.style.display = "grid";

        dashboard.style.display = "none";

    }

}


function adminLogin(event) {

    event.preventDefault();


    const password =
        document.getElementById(
            "adminPassword"
        ).value;


    const error =
        document.getElementById(
            "loginError"
        );


    if (password === ADMIN_PASSWORD) {

        sessionStorage.setItem(
            "contix_admin_logged_in",
            "true"
        );


        checkAdminSession();

    } else {

        if (error) {

            error.style.display =
                "block";

        }

    }

}


function adminLogout() {

    sessionStorage.removeItem(
        "contix_admin_logged_in"
    );

    window.location.reload();

}


/* =========================
   ADMIN DASHBOARD
========================= */

function renderAdmin() {

    renderAdminProducts();

    renderAdminOrders();

    loadSettings();

    updateAdminStats();

}


/* =========================
   ADMIN PRODUCTS
========================= */

function renderAdminProducts() {

    const container =
        document.getElementById(
            "adminProducts"
        );

    if (!container) return;


    const products = getProducts();


    container.innerHTML = "";


    if (products.length === 0) {

        container.innerHTML = `
            <p style="color:#929dad;">
                No products have been added yet.
            </p>
        `;

        return;

    }


    products.forEach(product => {

        const card =
            document.createElement("div");

        card.className =
            "admin-product";


        let imageHTML;

        if (product.image) {

            imageHTML = `
                <img
                    src="${product.image}"
                    alt="${escapeHTML(product.name)}">
            `;

        } else {

            imageHTML = `<span>📱</span>`;

        }


        card.innerHTML = `

            <div class="admin-product-image">
                ${imageHTML}
            </div>

            <div class="admin-product-info">

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p>
                    ${escapeHTML(
                        product.stock || "Available"
                    )}
                </p>

                <div class="admin-product-price">
                    ${formatNaira(product.price)}
                </div>

                <div class="admin-product-actions">

                    <button
                        class="edit-button"
                        onclick="editProduct('${product.id}')">
                        Edit
                    </button>

                    <button
                        class="delete-button"
                        onclick="deleteProduct('${product.id}')">
                        Delete
                    </button>

                </div>

            </div>

        `;


        container.appendChild(card);

    });

}


/* =========================
   PRODUCT MODAL
========================= */

function openProductModal(productId = null) {

    const modal =
        document.getElementById(
            "productModal"
        );

    const title =
        document.getElementById(
            "productModalTitle"
        );


    document.getElementById(
        "productForm"
    ).reset();


    document.getElementById(
        "productId"
    ).value = "";


    document.getElementById(
        "imagePreview"
    ).style.display = "none";


    if (productId) {

        const products = getProducts();

        const product =
            products.find(
                p => p.id === productId
            );


        if (!product) return;


        title.textContent =
            "Edit Product";


        document.getElementById(
            "productId"
        ).value = product.id;


        document.getElementById(
            "productName"
        ).value = product.name;


        document.getElementById(
            "productPrice"
        ).value = product.price;


        document.getElementById(
            "productStock"
        ).value =
            product.stock || "";


        document.getElementById(
            "productDescription"
        ).value =
            product.description || "";


        if (product.image) {

            showImagePreview(
                product.image
            );

        }

    } else {

        title.textContent =
            "Add Product";

    }


    modal.classList.add("active");

}


function closeProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );

    if (modal) {

        modal.classList.remove("active");

    }

}


/* =========================
   IMAGE UPLOAD
========================= */

let selectedProductImage = "";


function handleImageUpload(event) {

    const file =
        event.target.files[0];


    if (!file) return;


    if (!file.type.startsWith("image/")) {

        alert("Please select an image file.");

        return;

    }


    const reader =
        new FileReader();


    reader.onload = function(e) {

        selectedProductImage =
            e.target.result;


        showImagePreview(
            selectedProductImage
        );

    };


    reader.readAsDataURL(file);

}


function showImagePreview(src) {

    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (!preview) return;


    preview.innerHTML = `
        <img src="${src}" alt="Preview">
    `;


    preview.style.display =
        "block";

}


/* =========================
   SAVE PRODUCT
========================= */

function saveProduct(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "productId"
        ).value;


    const name =
        document.getElementById(
            "productName"
        ).value.trim();


    const price =
        Number(
            document.getElementById(
                "productPrice"
            ).value
        );


    const stock =
        document.getElementById(
            "productStock"
        ).value.trim();


    const description =
        document.getElementById(
            "productDescription"
        ).value.trim();


    const products =
        getProducts();


    if (id) {

        const product =
            products.find(
                p => p.id === id
            );


        if (!product) return;


        product.name =
            name;

        product.price =
            price;

        product.stock =
            stock;

        product.description =
            description;


        if (selectedProductImage) {

            product.image =
                selectedProductImage;

        }


    } else {

        const product = {

            id:
                "product-" +
                Date.now(),

            name,

            price,

            stock:
                stock || "Pre-order",

            description,

            image:
                selectedProductImage || ""

        };


        products.push(product);

    }


    saveProducts(products);


    selectedProductImage = "";


    closeProductModal();


    renderAdminProducts();

    updateAdminStats();

    renderProducts();

}


/* =========================
   EDIT PRODUCT
========================= */

function editProduct(productId) {

    selectedProductImage = "";

    openProductModal(productId);

}


/* =========================
   DELETE PRODUCT
========================= */

function deleteProduct(productId) {

    const products =
        getProducts();


    const product =
        products.find(
            p => p.id === productId
        );


    if (!product) return;


    const confirmed =
        confirm(
            "Delete " +
            product.name +
            "?"
        );


    if (!confirmed) return;


    const updated =
        products.filter(
            p => p.id !== productId
        );


    saveProducts(updated);


    renderAdminProducts();

    updateAdminStats();

    renderProducts();

}


/* =========================
   PAYMENT SETTINGS
========================= */

function loadSettings() {

    const settings =
        getSettings();


    const bank =
        document.getElementById(
            "bankName"
        );

    const accountName =
        document.getElementById(
            "accountName"
        );

    const accountNumber =
        document.getElementById(
            "accountNumber"
        );

    const email =
        document.getElementById(
            "storeEmail"
        );

    const phone =
        document.getElementById(
            "storePhone"
        );


    if (bank)
        bank.value =
            settings.bankName;


    if (accountName)
        accountName.value =
            settings.accountName;


    if (accountNumber)
        accountNumber.value =
            settings.accountNumber;


    if (email)
        email.value =
            settings.email;


    if (phone)
        phone.value =
            settings.phone;

}


function savePaymentSettings(event) {

    event.preventDefault();


    const settings = {

        bankName:
            document.getElementById(
                "bankName"
            ).value.trim(),

        accountName:
            document.getElementById(
                "accountName"
            ).value.trim(),

        accountNumber:
            document.getElementById(
                "accountNumber"
            ).value.trim(),

        email:
            document.getElementById(
                "storeEmail"
            ).value.trim(),

        phone:
            document.getElementById(
                "storePhone"
            ).value.trim()

    };


    saveSettings(settings);


    const message =
        document.getElementById(
            "settingsMessage"
        );


    if (message) {

        message.style.display =
            "block";


        setTimeout(() => {

            message.style.display =
                "none";

        }, 3000);

    }


    updateContactDetails();

}


/* =========================
   ORDERS
========================= */

function renderAdminOrders() {

    const container =
        document.getElementById(
            "adminOrders"
        );

    if (!container) return;


    const orders =
        getOrders();


    container.innerHTML = "";


    if (orders.length === 0) {

        container.innerHTML = `
            <p style="color:#929dad;">
                No orders yet.
            </p>
        `;

        return;

    }


    orders.forEach(order => {

        const div =
            document.createElement("div");

        div.className =
            "order-card";


        const date =
            new Date(
                order.createdAt
            ).toLocaleString(
                "en-NG"
            );


        const productsText =
            order.items
                .map(
                    item =>
                        `${item.name} × ${item.quantity}`
                )
                .join(", ");


        div.innerHTML = `

            <div class="order-header">

                <div class="order-id">
                    ${escapeHTML(order.id)}
                </div>

                <div class="order-date">
                    ${date}
                </div>

            </div>


            <div class="order-customer">

                <strong>
                    ${escapeHTML(
                        order.customer.name
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        order.customer.phone
                    )}
                </span>

                <span>
                    ${escapeHTML(
                        order.customer.email
                    )}
                </span>

                <span>
                    ${escapeHTML(
                        order.customer.address
                    )}
                </span>

            </div>


            <div class="order-products">

                ${escapeHTML(productsText)}

            </div>


            <div class="order-total">

                ${formatNaira(order.total)}

            </div>

        `;


        container.appendChild(div);

    });

}


/* =========================
   ADMIN STATISTICS
========================= */

function updateAdminStats() {

    const products =
        getProducts();

    const orders =
        getOrders();


    const productCount =
        document.getElementById(
            "productCount"
        );


    const orderCount =
        document.getElementById(
            "orderCount"
        );


    const orderValue =
        document.getElementById(
            "orderValue"
        );


    if (productCount) {

        productCount.textContent =
            products.length;

    }


    if (orderCount) {

        orderCount.textContent =
            orders.length;

    }


    const value =
        orders.reduce(
            (sum, order) =>
                sum +
                Number(order.total || 0),
            0
        );


    if (orderValue) {

        orderValue.textContent =
            formatNaira(value);

    }

}


/* =========================
   CONTACT DETAILS
========================= */

function updateContactDetails() {

    const settings =
        getSettings();


    const email =
        document.getElementById(
            "contactEmail"
        );


    const phone =
        document.getElementById(
            "contactPhone"
        );


    if (email) {

        email.textContent =
            "✉️ " + settings.email;

        email.href =
            "mailto:" + settings.email;

    }


    if (phone) {

        phone.textContent =
            "📞 " + settings.phone;

        phone.href =
            "tel:" + settings.phone;

    }

}


/* =========================
   SECURITY HELPER
========================= */

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================
   INITIALIZATION
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        /* Products */

        renderProducts();


        /* Cart */

        renderCart();

        updateCartCount();


        /* Contact */

        updateContactDetails();


        /* Admin */

        checkAdminSession();


        /* Login */

        const loginForm =
            document.getElementById(
                "loginForm"
            );


        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                adminLogin
            );

        }


        /* Checkout */

        const checkoutButton =
            document.getElementById(
                "checkoutButton"
            );


        if (checkoutButton) {

            checkoutButton.addEventListener(
                "click",
                openCheckout
            );

        }


        const checkoutForm =
            document.getElementById(
                "checkoutForm"
            );


        if (checkoutForm) {

            checkoutForm.addEventListener(
                "submit",
                submitOrder
            );

        }


        /* Product form */

        const productForm =
            document.getElementById(
                "productForm"
            );


        if (productForm) {

            productForm.addEventListener(
                "submit",
                saveProduct
            );

        }


        /* Image */

        const imageInput =
            document.getElementById(
                "productImage"
            );


        if (imageInput) {

            imageInput.addEventListener(
                "change",
                handleImageUpload
            );

        }


        /* Payment settings */

        const settingsForm =
            document.getElementById(
                "paymentSettingsForm"
            );


        if (settingsForm) {

            settingsForm.addEventListener(
                "submit",
                savePaymentSettings
            );

        }

    }
);
