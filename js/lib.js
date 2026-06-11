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

    // ===== USER ACCOUNT MANAGEMENT =====
    initializeUserAccount();

    // Close auth modal when clicking on overlay
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.addEventListener('click', function(e) {
            if (e.target === authModal) {
                closeAuthModal();
            }
        });
    }
});

function initializeUserAccount() {
    const userIconToggle = document.getElementById("userIconToggle");
    const userMenu = document.getElementById("userMenu");
    const userName = document.getElementById("userName");
    const userMenuHeader = document.getElementById("userMenuHeader");
    const userMenuItems = document.getElementById("userMenuItems");
    const authButtons = document.getElementById("authButtons");

    // Load user info from localStorage
    let user = null;
    try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            user = JSON.parse(savedUser);
        }
    } catch (error) {
        console.error("Error loading user:", error);
    }

    // Toggle user menu
    if (userIconToggle) {
        userIconToggle.addEventListener("click", function(e) {
            e.stopPropagation();
            userMenu.classList.toggle("active");
        });
    }

    // Close menu when clicking outside
    document.addEventListener("click", function() {
        if (userMenu && userMenu.classList.contains("active")) {
            userMenu.classList.remove("active");
        }
    });

    // Update UI based on login status
    updateUserUI(user, userMenuHeader, userMenuItems, authButtons);
}

function updateUserUI(user, userMenuHeader, userMenuItems, authButtons) {
    if (user && user.isLoggedIn) {
        // User is logged in
        const displayName = user.fullName || user.name || user.email;
        
        if (userMenuHeader) {
            userMenuHeader.innerHTML = `
                <p>Tài khoản của tôi</p>
                <strong>${displayName}</strong>
            `;
        }

        if (userMenuItems) {
            userMenuItems.innerHTML = `
                <li><a href="#profile"><i class="fa-solid fa-user"></i> Hồ sơ cá nhân</a></li>
                <li><a href="#orders"><i class="fa-solid fa-receipt"></i> Đơn hàng của tôi</a></li>
                <li><a href="#wishlist"><i class="fa-solid fa-heart"></i> Danh sách yêu thích</a></li>
                <li><a href="#settings"><i class="fa-solid fa-gear"></i> Cài đặt</a></li>
                <li><a href="#" onclick="logoutUser(event)"><i class="fa-solid fa-sign-out"></i> Đăng xuất</a></li>
            `;
        }

        if (authButtons) {
            authButtons.innerHTML = '';
        }
    } else {
        // User is not logged in
        if (userMenuHeader) {
            userMenuHeader.innerHTML = `
                <p>Tài khoản của tôi</p>
                <strong>Khách</strong>
            `;
        }

        if (userMenuItems) {
            userMenuItems.innerHTML = `
                <li><a href="#" onclick="openAuthModal('login'); return false;"><i class="fa-solid fa-sign-in"></i> Đăng nhập</a></li>
                <li><a href="#" onclick="openAuthModal('register'); return false;"><i class="fa-solid fa-user-plus"></i> Đăng kí</a></li>
                <li><a href="#"><i class="fa-solid fa-question"></i> Hỗ trợ</a></li>
            `;
        }

        if (authButtons) {
            authButtons.innerHTML = `
                <button class="btn-auth btn-login" onclick="openAuthModal('login')">Đăng nhập</button>
                <button class="btn-auth btn-register" onclick="openAuthModal('register')">Đăng kí</button>
            `;
        }
    }
}

function logoutUser(event) {
    event.preventDefault();
    
    if (confirm("Bạn chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem("user");
        alert("Đã đăng xuất thành công!");
        window.location.reload();
    }
}

// ===== MODAL AUTH FUNCTIONS =====
function openAuthModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('active');
        switchTab(tab);
        document.body.style.overflow = 'hidden';
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function switchTab(tabName) {
    // Hide all tabs and deactivate buttons
    document.querySelectorAll('.modal-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.modal-tab').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Mark corresponding button as active
    document.querySelectorAll('.modal-tab').forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
}

function handleLoginModal(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Vui lòng nhập đầy đủ thông tin');
        return;
    }

    // Save user info to localStorage
    localStorage.setItem('user', JSON.stringify({
        email: email,
        name: email.split('@')[0] || email,
        isLoggedIn: true
    }));

    alert('Đăng nhập thành công!');
    closeAuthModal();
    
    // Reload to update UI
    setTimeout(() => window.location.reload(), 500);
}

function handleRegisterModal(event) {
    event.preventDefault();

    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
        alert('Vui lòng nhập đầy đủ thông tin');
        return;
    }

    if (password.length < 8) {
        alert('Mật khẩu phải có ít nhất 8 ký tự');
        return;
    }

    if (password !== confirmPassword) {
        alert('Mật khẩu không trùng khớp');
        return;
    }

    const fullName = firstName + ' ' + lastName;

    // Save user info to localStorage
    localStorage.setItem('user', JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        fullName: fullName,
        email: email,
        phone: phone,
        isLoggedIn: true
    }));

    alert('Đăng kí thành công!');
    closeAuthModal();
    
    // Reload to update UI
    setTimeout(() => window.location.reload(), 500);
}