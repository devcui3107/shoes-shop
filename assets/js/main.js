const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/**
 * Hàm tải template
 *
 * Cách dùng:
 * <div id="parent"></div>
 * <script>
 *  load("#parent", "./path-to-template.html");
 * </script>
 */
function load(selector, path) {
    const cached = localStorage.getItem(path);
    if (cached) {
        $(selector).innerHTML = cached;
    }

    fetch(path)
        .then((res) => res.text())
        .then((html) => {
            if (html !== cached) {
                $(selector).innerHTML = html;
                localStorage.setItem(path, html);
            }
        })
        .finally(() => {
            window.dispatchEvent(new Event("template-loaded"));
        });
}

/**
 * Hàm kiểm tra một phần tử
 * có bị ẩn bởi display: none không
 */
function isHidden(element) {
    if (!element) return true;

    if (window.getComputedStyle(element).display === "none") {
        return true;
    }

    let parent = element.parentElement;
    while (parent) {
        if (window.getComputedStyle(parent).display === "none") {
            return true;
        }
        parent = parent.parentElement;
    }

    return false;
}

/**
 * Hàm buộc một hành động phải đợi
 * sau một khoảng thời gian mới được thực thi
 */
function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

/**
 * Hàm tính toán vị trí arrow cho dropdown
 *
 * Cách dùng:
 * 1. Thêm class "js-dropdown-list" vào thẻ ul cấp 1
 * 2. CSS "left" cho arrow qua biến "--arrow-left-pos"
 */
const calArrowPos = debounce(() => {
    if (isHidden($(".js-dropdown-list"))) return;

    const items = $$(".js-dropdown-list > li");

    items.forEach((item) => {
        const arrowPos = item.offsetLeft + item.offsetWidth / 2;
        item.style.setProperty("--arrow-left-pos", `${arrowPos}px`);
    });
});

// Tính toán lại vị trí arrow khi resize trình duyệt
window.addEventListener("resize", calArrowPos);

// Tính toán lại vị trí arrow sau khi tải template
window.addEventListener("template-loaded", calArrowPos);

/**
 * Giữ active menu khi hover
 *
 * Cách dùng:
 * 1. Thêm class "js-menu-list" vào thẻ ul menu chính
 * 2. Thêm class "js-dropdown" vào class "dropdown" hiện tại
 *  nếu muốn reset lại item active khi ẩn menu
 */
window.addEventListener("template-loaded", handleActiveMenu);

function handleActiveMenu() {
    const dropdowns = $$(".js-dropdown");
    const menus = $$(".js-menu-list");
    const activeClass = "menu-column__item--active";

    const removeActive = (menu) => {
        menu.querySelector(`.${activeClass}`)?.classList.remove(activeClass);
    };

    const init = () => {
        menus.forEach((menu) => {
            const items = menu.children;
            if (!items.length) return;

            removeActive(menu);
            if (window.innerWidth > 991) items[0].classList.add(activeClass);

            Array.from(items).forEach((item) => {
                item.onmouseenter = () => {
                    if (window.innerWidth <= 991) return;
                    removeActive(menu);
                    item.classList.add(activeClass);
                };
                item.onclick = () => {
                    if (window.innerWidth > 991) return;
                    removeActive(menu);
                    item.classList.add(activeClass);
                    item.scrollIntoView();
                };
            });
        });
    };

    init();

    dropdowns.forEach((dropdown) => {
        dropdown.onmouseleave = () => init();
    });
}

/**
 * JS toggle
 *
 * Cách dùng:
 * <button class="js-toggle" toggle-target="#box">Click</button>
 * <div id="box">Content show/hide</div>
 */
window.addEventListener("template-loaded", initJsToggle);

function initJsToggle() {
    $$(".js-toggle").forEach((button) => {
        const target = button.getAttribute("toggle-target");
        if (!target) {
            document.body.innerText = `Cần thêm toggle-target cho: ${button.outerHTML}`;
        }
        button.onclick = (e) => {
            e.preventDefault();
            if (!$(target)) {
                return (document.body.innerText = `Không tìm thấy phần tử "${target}"`);
            }
            const isHidden = $(target).classList.contains("hide");

            requestAnimationFrame(() => {
                $(target).classList.toggle("hide", !isHidden);
                $(target).classList.toggle("show", isHidden);
            });
        };
        document.onclick = function (e) {
            if (!e.target.closest(target)) {
                const isHidden = $(target).classList.contains("hide");
                if (!isHidden) {
                    button.click();
                }
            }
        };
    });
}

window.addEventListener("template-loaded", () => {
    const links = $$(".js-dropdown-list > li > a");

    links.forEach((link) => {
        link.onclick = () => {
            if (window.innerWidth > 991) return;
            const item = link.closest("li");
            item.classList.toggle("navbar__item--active");
        };
    });
});

window.addEventListener("template-loaded", () => {
    const tabsSelector = "prod-tab__item";
    const contentsSelector = "prod-tab__content";

    const tabActive = `${tabsSelector}--current`;
    const contentActive = `${contentsSelector}--current`;

    const tabContainers = $$(".js-tabs");
    tabContainers.forEach((tabContainer) => {
        const tabs = tabContainer.querySelectorAll(`.${tabsSelector}`);
        const contents = tabContainer.querySelectorAll(`.${contentsSelector}`);
        tabs.forEach((tab, index) => {
            tab.onclick = () => {
                tabContainer.querySelector(`.${tabActive}`)?.classList.remove(tabActive);
                tabContainer.querySelector(`.${contentActive}`)?.classList.remove(contentActive);
                tab.classList.add(tabActive);
                contents[index].classList.add(contentActive);
            };
        });
    });
});

// Chuyển hình sản phẩm
function changeImage(imageSrc, thumb) {
    document.getElementById('prod-preview__img').src = imageSrc;
    var thumbnails = document.querySelectorAll('.prod-preview__thumb img');
    thumbnails.forEach(function (img) {
        img.classList.remove('prod-preview__thumb-img--current');
    });
    thumb.classList.add('prod-preview__thumb-img--current');
}

window.addEventListener("template-loaded", () => {
    const switchBtn = document.querySelector("#switch-theme-btn");
    if (switchBtn) {
        switchBtn.onclick = function () {
            const isDark = localStorage.dark === "true";
            document.querySelector("html").classList.toggle("dark", !isDark);
            localStorage.setItem("dark", !isDark);
            switchBtn.querySelector("span").textContent = isDark ? "Dark Mode" : "Light Mode";
        };
        const isDark = localStorage.dark === "true";
        switchBtn.querySelector("span").textContent = isDark ? "Light Mode" : "Dark Mode";
    }
});

//Mobile
window.addEventListener("template-loaded", () => {
    const switchBtn = document.querySelector("#switch-theme-btn-mb");
    if (switchBtn) {
        switchBtn.onclick = function () {
            const isDark = localStorage.dark === "true";
            document.querySelector("html").classList.toggle("dark", !isDark);
            localStorage.setItem("dark", !isDark);
            switchBtn.querySelector("span").textContent = isDark ? "Dark Mode" : "Light Mode";
        };
        const isDark = localStorage.dark === "true";
        switchBtn.querySelector("span").textContent = isDark ? "Light Mode" : "Dark Mode";
    }
});

const isDark = localStorage.dark === "true";
document.querySelector("html").classList.toggle("dark", isDark);



// Xử lý trái tim đen đỏ
document.addEventListener("DOMContentLoaded", function () {
    // Lấy danh sách sản phẩm yêu thích từ localStorage
    const favoriteItems = JSON.parse(localStorage.getItem("favoriteItems")) || [];

    // Cập nhật trạng thái ban đầu của các sản phẩm yêu thích
    favoriteItems.forEach(function (itemId) {
        const item = document.querySelector(`.prod[data-id="${itemId}"] .prod__like-btn img`);
        if (item) {
            item.src = "./assets/images/icons/heart-liked.svg";
        }
    });

    // Thêm sự kiện click cho các nút yêu thích
    document.querySelectorAll(".prod__like-btn").forEach(button => {
        button.addEventListener("click", function () {
            toggleFavorite(this);
        });
    });

    // Hàm xử lý khi người dùng click vào nút yêu thích
    function toggleFavorite(button) {
        const item = button.closest(".prod");
        const itemId = item.getAttribute("data-id");
        let favoriteItems = JSON.parse(localStorage.getItem("favoriteItems")) || [];
        const img = button.querySelector("img");
        const boxRow = item.querySelector(".prod__box-row");

        if (img.src.includes("heart-liked.svg")) {
            // Loại bỏ khỏi danh sách yêu thích
            favoriteItems = favoriteItems.filter(id => id !== itemId);
            img.src = "./assets/images/icons/heart-like.svg";
            boxRow.style.bottom = "-50px";
        } else {
            // Thêm vào danh sách yêu thích
            favoriteItems.push(itemId);
            img.src = "./assets/images/icons/heart-liked.svg";
            boxRow.style.bottom = "0px";
        }

        // Lưu danh sách yêu thích vào localStorage
        localStorage.setItem("favoriteItems", JSON.stringify(favoriteItems));
    }

    // Thêm sự kiện click ra ngoài khu vực sản phẩm để thay đổi thuộc tính bottom
    document.addEventListener("click", function (event) {
        document.querySelectorAll(".prod").forEach(item => {
            const boxRow = item.querySelector(".prod__box-row");
            if (!item.contains(event.target)) {
                boxRow.style.bottom = "-50px";
            }
        });
    });

    // Thêm sự kiện scroll để thay đổi thuộc tính bottom
    let scrollTimeout;
    window.addEventListener("scroll", function () {
        // Clear any previously set timeout to avoid multiple executions
        clearTimeout(scrollTimeout);

        // Set a new timeout
        scrollTimeout = setTimeout(function () {
            document.querySelectorAll(".prod").forEach(item => {
                const boxRow = item.querySelector(".prod__box-row");
                boxRow.style.bottom = "-50px";
            });
        }, 30);
    });

    // Ngăn chặn sự kiện click lan ra ngoài khi click vào khu vực sản phẩm
    document.querySelectorAll(".prod").forEach(item => {
        item.addEventListener("click", function (event) {
            event.stopPropagation();
        });
    });
});


