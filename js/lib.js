document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const productCards = document.querySelectorAll(".product-card");
    const cartIcon = document.querySelector(".cart-item");
    const cartDrawer = document.getElementById("cartDrawer");
    const cartOverlay = document.getElementById("cartOverlay");
    const cartList = document.getElementById("cartList");
    const cartTotal = document.getElementById("cartTotal");
    const cartCountBadge = document.getElementById("cartCount");
    const cartEmpty = document.getElementById("cartEmpty");
    const checkoutButton = document.getElementById("checkoutButton");
    const closeCartBtn = document.getElementById("closeCartBtn");
    const addCartButtons = document.querySelectorAll(".btn-add-cart");

    let cart = loadCart();

    function formatPrice(value) {
        return value.toLocaleString("vi-VN") + " đ";
    }

    function parsePrice(text) {
        return Number(text.replace(/[^0-9]/g, "")) || 0;
    }

    function saveCart() {
        localStorage.setItem("khiemCart", JSON.stringify(cart));
    }

    function loadCart() {
        const saved = localStorage.getItem("khiemCart");
        if (!saved) {
            return { items: {}, totalCount: 0, totalPrice: 0 };
        }
        try {
            return JSON.parse(saved);
        } catch (error) {
            return { items: {}, totalCount: 0, totalPrice: 0 };
        }
    }

    function recalculateCart() {
        cart.totalCount = 0;
        cart.totalPrice = 0;
        Object.values(cart.items).forEach(item => {
            cart.totalCount += item.quantity;
            cart.totalPrice += item.quantity * item.price;
        });
    }

    function renderCart() {
        cartList.innerHTML = "";

        if (cart.totalCount === 0) {
            cartEmpty.style.display = "block";
            cartTotal.textContent = formatPrice(0);
            checkoutButton.disabled = true;
            cartList.style.display = "none";
            return;
        }

        cartEmpty.style.display = "none";
        cartList.style.display = "block";
        checkoutButton.disabled = false;

        Object.values(cart.items).forEach(item => {
            const row = document.createElement("li");
            row.className = "cart-item-row";
            row.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-content">
                    <h4>${item.name}</h4>
                    <p>${formatPrice(item.price)} x ${item.quantity}</p>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button type="button" data-action="decrease" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button type="button" data-action="increase" data-id="${item.id}">+</button>
                        </div>
                        <button type="button" class="cart-remove" data-id="${item.id}">Xóa</button>
                    </div>
                </div>
            `;
            cartList.appendChild(row);
        });

        cartTotal.textContent = formatPrice(cart.totalPrice);
    }

    function updateCartCount() {
        cartCountBadge.textContent = cart.totalCount;
    }

    function addToCart(product) {
        const existing = cart.items[product.id];
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.items[product.id] = {
                ...product,
                quantity: 1,
            };
        }
        recalculateCart();
        updateCartCount();
        saveCart();
        renderCart();
    }

    function changeQuantity(itemId, delta) {
        const item = cart.items[itemId];
        if (!item) return;
        item.quantity = Math.max(1, item.quantity + delta);
        if (item.quantity <= 0) {
            delete cart.items[itemId];
        }
        recalculateCart();
        updateCartCount();
        saveCart();
        renderCart();
    }

    function removeFromCart(itemId) {
        delete cart.items[itemId];
        recalculateCart();
        updateCartCount();
        saveCart();
        renderCart();
    }

    function openCart() {
        cartDrawer.classList.add("open");
        cartOverlay.classList.add("active");
        cartDrawer.setAttribute("aria-hidden", "false");
    }

    function closeCart() {
        cartDrawer.classList.remove("open");
        cartOverlay.classList.remove("active");
        cartDrawer.setAttribute("aria-hidden", "true");
    }

    function createProductId(name) {
        return name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g, "");
    }

    if (searchInput) {
        function filterProducts() {
            const query = searchInput.value.toLowerCase().trim();
            productCards.forEach(card => {
                const productName = card.getAttribute("data-name") || "";
                card.style.display = productName.includes(query) ? "flex" : "none";
            });
        }

        searchInput.addEventListener("keyup", filterProducts);
        searchBtn.addEventListener("click", filterProducts);
    }

    addCartButtons.forEach(button => {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            const card = event.currentTarget.closest(".product-card");
            if (!card) return;

            const name = card.querySelector("h3")?.textContent.trim() || "Sản phẩm";
            const priceText = card.querySelector(".product-price")?.textContent || "0";
            const image = card.querySelector("img")?.getAttribute("src") || "";
            const price = parsePrice(priceText);
            const id = createProductId(name);

            addToCart({ id, name, price, image });
            openCart();
        });
    });

    cartIcon?.addEventListener("click", openCart);
    cartOverlay?.addEventListener("click", closeCart);
    closeCartBtn?.addEventListener("click", closeCart);

    cartList.addEventListener("click", function (event) {
        const button = event.target.closest("button");
        if (!button) return;
        const action = button.getAttribute("data-action");
        const itemId = button.getAttribute("data-id");

        if (action === "increase") {
            changeQuantity(itemId, 1);
        }
        if (action === "decrease") {
            changeQuantity(itemId, -1);
        }
        if (button.classList.contains("cart-remove")) {
            removeFromCart(itemId);
        }
    });

    checkoutButton.addEventListener("click", function () {
        if (cart.totalCount === 0) return;
        window.location.href = "order.html";
    });

    updateCartCount();
    renderCart();
});