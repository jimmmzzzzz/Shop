const products = [
  {
    id: 1,
    name: "Studio Headphones",
    category: "tech",
    price: 128000,
    badge: "Bestseller",
    image: "https://images.unsplash.com/photo-1520170350707-b2da59970118?auto=format&fit=crop&w=1200&q=86",
    description: "Comfortable over-ear headphones with a clean silhouette, soft cushioning and rich everyday sound."
  },
  {
    id: 2,
    name: "Rangefinder Camera",
    category: "tech",
    price: 485000,
    badge: "New",
    image: "https://images.unsplash.com/photo-1694077086368-0f5ba46c059e?auto=format&fit=crop&w=1200&q=86",
    description: "A compact camera-inspired piece for creators who want a tactile, considered shooting experience."
  },
  {
    id: 3,
    name: "Everyday Watch",
    category: "style",
    price: 89000,
    badge: "",
    image: "https://images.unsplash.com/photo-1777569938639-c00bfdef07fd?auto=format&fit=crop&w=1200&q=86",
    description: "A low-profile everyday watch with a practical face, durable strap and understated finish."
  },
  {
    id: 4,
    name: "Tortoise Frames",
    category: "style",
    price: 54000,
    badge: "Limited",
    image: "https://images.unsplash.com/photo-1760446032400-506ec8963e6a?auto=format&fit=crop&w=1200&q=86",
    description: "Classic tortoise sunglasses shaped for an easy fit, with a warm finish that works year-round."
  },
  {
    id: 5,
    name: "Transit Pack",
    category: "everyday",
    price: 76000,
    badge: "",
    image: "https://images.unsplash.com/photo-1528921581519-52b9d779df2b?auto=format&fit=crop&w=1200&q=86",
    description: "A practical daily carry built around the things you actually take with you: laptop, cables, notebook and more."
  },
  {
    id: 6,
    name: "Court Sneakers",
    category: "style",
    price: 112000,
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1522897355400-c4fdec73d979?auto=format&fit=crop&w=1200&q=86",
    description: "Clean everyday sneakers with an easy profile designed to move between casual and smarter outfits."
  },
  {
    id: 7,
    name: "Creator Carry Kit",
    category: "everyday",
    price: 98000,
    badge: "New",
    image: "https://images.unsplash.com/photo-1528921581519-52b9d779df2b?auto=format&fit=crop&w=1200&q=86&sat=-20",
    description: "An organized carry setup for work on the move, with space for tech, accessories and small essentials."
  },
  {
    id: 8,
    name: "Mono Timepiece",
    category: "style",
    price: 104000,
    badge: "",
    image: "https://images.unsplash.com/photo-1777569938639-c00bfdef07fd?auto=format&fit=crop&w=1200&q=86&sat=-35",
    description: "A monochrome watch with a restrained, versatile look built to disappear into your daily rotation."
  }
];

const state = {
  filter: "all",
  search: "",
  cart: JSON.parse(localStorage.getItem("nova-cart") || "[]"),
  activeProduct: null
};

const grid = document.getElementById("product-grid");
const emptyState = document.getElementById("empty-state");
const resultCount = document.getElementById("result-count");
const cartDrawer = document.querySelector(".cart-drawer");
const cartItems = document.getElementById("cart-items");
const cartEmpty = document.getElementById("cart-empty");
const cartFooter = document.getElementById("cart-footer");
const cartSubtotal = document.getElementById("cart-subtotal");
const backdrop = document.querySelector(".modal-backdrop");
const productModal = document.getElementById("product-modal");
const toast = document.querySelector(".toast");

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0
});

function productCard(product) {
  return '<article class="product-card" data-id="' + product.id + '">' +
    '<div class="product-image" role="button" tabindex="0" aria-label="View ' + product.name + '">' +
      '<img src="' + product.image + '" alt="' + product.name + '" loading="lazy" />' +
      (product.badge ? '<span class="product-badge">' + product.badge + '</span>' : '') +
      '<button class="quick-add" data-add="' + product.id + '">Quick add</button>' +
    '</div>' +
    '<div class="product-meta">' +
      '<h3 class="product-name">' + product.name + '</h3>' +
      '<p class="product-category">' + product.category + '</p>' +
      '<p class="product-price">' + money.format(product.price) + '</p>' +
    '</div>' +
  '</article>';
}

function renderProducts() {
  const term = state.search.trim().toLowerCase();
  const visible = products.filter(function(product) {
    const matchesFilter = state.filter === "all" || product.category === state.filter;
    const matchesSearch = !term || (product.name + " " + product.category + " " + product.description).toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  grid.innerHTML = visible.map(productCard).join("");
  resultCount.textContent = visible.length;
  emptyState.hidden = visible.length !== 0;
}

function saveCart() {
  localStorage.setItem("nova-cart", JSON.stringify(state.cart));
}

function getCartQuantity() {
  return state.cart.reduce(function(total, item) { return total + item.qty; }, 0);
}

function updateCartCount() {
  const qty = getCartQuantity();
  document.querySelectorAll(".cart-count").forEach(function(el) { el.textContent = qty; });
  document.querySelector(".cart-count-label").textContent = "(" + qty + ")";
}

function cartItemMarkup(item) {
  const product = products.find(function(p) { return p.id === item.id; });
  if (!product) return "";
  return '<article class="cart-item">' +
    '<img src="' + product.image + '" alt="' + product.name + '" />' +
    '<div>' +
      '<h3>' + product.name + '</h3>' +
      '<p class="item-cat">' + product.category + '</p>' +
      '<div class="qty-control" aria-label="Quantity controls">' +
        '<button data-qty="' + product.id + '" data-change="-1" aria-label="Reduce quantity">−</button>' +
        '<span>' + item.qty + '</span>' +
        '<button data-qty="' + product.id + '" data-change="1" aria-label="Increase quantity">+</button>' +
      '</div>' +
    '</div>' +
    '<p class="cart-item-price">' + money.format(product.price * item.qty) + '</p>' +
    '<button class="remove-item" data-remove="' + product.id + '">Remove</button>' +
  '</article>';
}

function renderCart() {
  state.cart = state.cart.filter(function(item) {
    return products.some(function(product) { return product.id === item.id; });
  });

  cartItems.innerHTML = state.cart.map(cartItemMarkup).join("");
  const hasItems = state.cart.length > 0;
  cartEmpty.hidden = hasItems;
  cartFooter.hidden = !hasItems;

  const total = state.cart.reduce(function(sum, item) {
    const product = products.find(function(p) { return p.id === item.id; });
    return sum + (product ? product.price * item.qty : 0);
  }, 0);

  cartSubtotal.textContent = money.format(total);
  updateCartCount();
  saveCart();
}

function addToCart(id) {
  const existing = state.cart.find(function(item) { return item.id === id; });
  if (existing) existing.qty += 1;
  else state.cart.push({ id: id, qty: 1 });
  renderCart();
  const product = products.find(function(p) { return p.id === id; });
  showToast(product.name + " added to cart");
}

function changeQuantity(id, change) {
  const item = state.cart.find(function(entry) { return entry.id === id; });
  if (!item) return;
  item.qty += change;
  if (item.qty <= 0) {
    state.cart = state.cart.filter(function(entry) { return entry.id !== id; });
  }
  renderCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(function(item) { return item.id !== id; });
  renderCart();
}

function showBackdrop() {
  backdrop.hidden = false;
  document.body.classList.add("locked");
}

function hideBackdropIfClear() {
  const modalOpen = productModal.open;
  const cartOpen = cartDrawer.classList.contains("open");
  if (!modalOpen && !cartOpen) {
    backdrop.hidden = true;
    document.body.classList.remove("locked");
  }
}

function openCart() {
  closeSearch();
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  showBackdrop();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  hideBackdropIfClear();
}

function openProduct(id) {
  const product = products.find(function(p) { return p.id === id; });
  if (!product) return;
  state.activeProduct = id;
  document.getElementById("modal-image").src = product.image;
  document.getElementById("modal-image").alt = product.name;
  document.getElementById("modal-category").textContent = product.category;
  document.getElementById("modal-name").textContent = product.name;
  document.getElementById("modal-price").textContent = money.format(product.price);
  document.getElementById("modal-description").textContent = product.description;
  productModal.showModal();
  showBackdrop();
}

function closeProduct() {
  if (productModal.open) productModal.close();
  hideBackdropIfClear();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(function() { toast.classList.remove("show"); }, 2300);
}

function openSearch() {
  const panel = document.querySelector(".search-panel");
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  setTimeout(function() { document.getElementById("site-search").focus(); }, 250);
}

function closeSearch() {
  const panel = document.querySelector(".search-panel");
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
}

document.querySelectorAll(".chip").forEach(function(chip) {
  chip.addEventListener("click", function() {
    document.querySelectorAll(".chip").forEach(function(button) { button.classList.remove("active"); });
    chip.classList.add("active");
    state.filter = chip.dataset.filter;
    renderProducts();
  });
});

grid.addEventListener("click", function(event) {
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    event.stopPropagation();
    addToCart(Number(addButton.dataset.add));
    return;
  }
  const image = event.target.closest(".product-image");
  if (image) openProduct(Number(image.closest(".product-card").dataset.id));
});

grid.addEventListener("keydown", function(event) {
  if ((event.key === "Enter" || event.key === " ") && event.target.classList.contains("product-image")) {
    event.preventDefault();
    openProduct(Number(event.target.closest(".product-card").dataset.id));
  }
});

cartItems.addEventListener("click", function(event) {
  const qty = event.target.closest("[data-qty]");
  if (qty) changeQuantity(Number(qty.dataset.qty), Number(qty.dataset.change));
  const remove = event.target.closest("[data-remove]");
  if (remove) removeFromCart(Number(remove.dataset.remove));
});

document.querySelector(".cart-button").addEventListener("click", openCart);
document.querySelector(".cart-close").addEventListener("click", closeCart);
document.querySelector(".continue-shopping").addEventListener("click", closeCart);

document.querySelector(".modal-close").addEventListener("click", closeProduct);
document.querySelector(".modal-add").addEventListener("click", function() {
  if (state.activeProduct) {
    addToCart(state.activeProduct);
    closeProduct();
    openCart();
  }
});

backdrop.addEventListener("click", function() {
  closeCart();
  closeProduct();
});

document.querySelector(".search-toggle").addEventListener("click", openSearch);
document.querySelector(".search-close").addEventListener("click", closeSearch);
document.getElementById("site-search").addEventListener("input", function(event) {
  state.search = event.target.value;
  renderProducts();
  document.getElementById("shop").scrollIntoView({ behavior: "smooth", block: "start" });
});

const mobileMenu = document.querySelector(".mobile-menu");
document.querySelector(".menu-toggle").addEventListener("click", function() {
  mobileMenu.classList.add("open");
  mobileMenu.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
});
document.querySelector(".mobile-menu-close").addEventListener("click", function() {
  mobileMenu.classList.remove("open");
  mobileMenu.setAttribute("aria-hidden", "true");
  document.body.classList.remove("locked");
});
mobileMenu.querySelectorAll("a").forEach(function(link) {
  link.addEventListener("click", function() {
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
  });
});

document.querySelector(".announcement-close").addEventListener("click", function() {
  document.querySelector(".announcement").remove();
});

document.getElementById("newsletter-form").addEventListener("submit", function(event) {
  event.preventDefault();
  showToast("You’re on the list. Welcome to NOVA.");
  event.currentTarget.reset();
});

document.querySelector(".checkout-button").addEventListener("click", function() {
  showToast("Demo checkout — connect Paystack or Stripe next.");
});

document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
    closeSearch();
    closeCart();
    closeProduct();
  }
});

renderProducts();
renderCart();
