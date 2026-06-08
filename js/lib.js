document.addEventListener("DOMContentLoaded", function () {
    // 1. CHỨC NĂNG TÌM KIẾM SẢN PHẨM
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const productCards = document.querySelectorAll(".product-card");

    function filterProducts() {
        const query = searchInput.value.toLowerCase().trim();
        productCards.forEach(card => {
            const productName = card.getAttribute("data-name") || "";
            if (productName.includes(query)) {
                card.style.display = "flex"; 
            } else {
                card.style.display = "none"; 
            }
        });
    }

    if (searchInput) searchInput.addEventListener("keyup", filterProducts);
    if (searchBtn) searchBtn.addEventListener("click", filterProducts);

    // 2. CHỨC NĂNG TĂNG SỐ LƯỢNG GIỎ HÀNG
    let currentCartCount = 0;
    const cartCountBadge = document.getElementById("cartCount");
    const addCartButtons = document.querySelectorAll(".btn-add-cart");

    addCartButtons.forEach(button => {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            currentCartCount++;
            cartCountBadge.textContent = currentCartCount;
            alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
        });
    });
});