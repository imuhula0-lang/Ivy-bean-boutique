// This is Bean Boutique's JavaScript which powers all the pages. Each part of this script checks if its elements are existing so that the same script can be seen everywhere.
// This part of the script is for a mobile phone menu.
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav')

if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
        const open = mainNav.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', open);
    });
}

// This part of the script is for the hero slideshow at the home page.
const slides = document.querySelectorAll('.slide');
let current = 0;

function showSlide(index) {
    slides[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
}

const prevBtn = document.getElementById('prevSlide');
const nextBtn = document.getElementById('nextSlide');

if (slides.length && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => showSlide(current-1));
    nextBtn.addEventListener('click',() => showSlide(current+1));
    setInterval(() => showSlide(current+1), 5000);
}

// This part of the script is for the first-visit modal popup on the homepage
const modal = document.getElementById('welcomeModal');

if (modal) {
    let seen = false;
    try {
        seen = sessionStorage.getItem('bbSeenModal') === 'yes';
    } catch (e) {}

    function closeModal() {
        modal.classList.remove('open');
        try {sessionStorage.setItem('bbSeenModal', 'yes'); } catch (e) {}
    }

    if (!seen) {
        setTimeout(() => modal.classList.add('open'), 1500);
    
    }

    document.getElementById('closeModal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal();});
    document.addEventListener('keydown', (e) => {if (e.key === 'Escape') closeModal();});
    modal.querySelector('form').addEventListener('submit', closeModal);
}

// This script is for the search box where visitors can search for whatever type of coffee they are craving or an equipment they like
const searchInput = document.getElementById('pageSearch');
const searchItems = document.querySelectorAll('.searchable');

if (searchInput) {
    searchInput.addEventListener('input', () => {
        const term = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        searchItems.forEach((item) => {
            const img = item.querySelector('img');
            const altText = img ? img.alt.toLowerCase(): '';
            const isMatch = item.textContent.toLowerCase().includes(term) || altText.includes(term);

            if (isMatch) visibleCount += 1;
            item.classList.remove('match');
            item.classList.toggle('hidden', !isMatch);

            if (isMatch && term) {
                void item.offsetWidth; // this style restarts the fade animation
                item.classList.add('match');
            }
        });

        const noResults = document.getElementById('noResults');
        if (noResults) noResults.hidden = visibleCount >0;
    });
}

// This JavaScript is for the shopping cart page
function getCart() {
    try {return JSON.parse(localStorage.getItem('bbCart')) || [];}
    catch (e) {return [];}
}

function saveCart(cart) {
    try {localStorage.setItem('bbCart', JSON.stringify(cart));} catch (e) {}
}

function updateCartCount() {
    const countBox = document.getElementById('cartCount');
    if (!countBox) return;
    countBox.textContent = getCart().reduce((total, item) => total + item.qty, 0);
}

function makeButton(text, action, name, label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'small-btn'
    button.textContent = text;
    button.dataset.action = action;
    button.dataset.name = name;
    button.setAttribute('aria-label', label);
    return button;
}


function addToCart(name, price) {
    const cart = getCart();
    const existing = cart.find((item) => item.name === name);

    if (existing) {
        existing.qty += 1;
    }
    else {
        cart.push({name: name, price: price, qty: 1});
    }

    saveCart(cart);
    updateCartCount();
    renderCart();
}

document.querySelectorAll('.add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
        addToCart(button.dataset.name, parseFloat(button.dataset.price));
    });
});
    
updateCartCount();

function renderCart() {
    const body = document.getElementById('cartItems');
    if (!body) return;

    const cart = getCart();
    const table = document.getElementById('cartTable');
    const empty = document.getElementById('cartEmpty');
    const summary = document.getElementById('cartSummary');

    body.textContent = '';

    empty.hidden = cart.length > 0;
    table.hidden = cart.length === 0;
    summary.hidden = cart.length === 0;

    let total = 0;

    cart.forEach((item) => { 
       const lineTotal = item.price * item.qty;
       total += lineTotal;
       
       const row = document.createElement('tr');

       const nameCell = document.createElement('td');
       nameCell.textContent = item.name;

       const priceCell = document.createElement('td');
       priceCell.textContent = 'Ksh ' + item.price.toFixed(2);

       const qtyCell = document.createElement('td');
       qtyCell.className = 'qty-cell';
       qtyCell.appendChild(makeButton('-', 'decrease', item.name, 'Decrease' + item.name));
       const qtyText = document.createElement('span');
       qtyText.textContent = item.qty;
       qtyCell.appendChild(qtyText);
       qtyCell.appendChild(makeButton('+', 'increase', item.name, 'Increase' + item.name));

       const totalCell = document.createElement('td');
       totalCell.textContent = 'Ksh ' + lineTotal.toFixed(2);

       const removeCell = document.createElement('td');
       removeCell.appendChild(makeButton('Remove', 'remove', item.name, 'Remove' + item.name));
    
       row.append(nameCell, priceCell, qtyCell, totalCell, removeCell);
       body.appendChild(row);
    });

    document.getElementById('cartTotal').textContent = 'Ksh ' + total.toFixed(2);
}



updateCartCount();

const cartBody = document.getElementById('cartItems');
if (cartBody) {
    cartBody.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        let cart = getCart();
        const item = cart.find((i) => i.name === button.dataset.name);
        if (!item) return;

        if (button.dataset.action === 'increase') item.qty+=1;
        if (button.dataset.action === 'decrease') item.qty-=1;
        if (button.dataset.action === 'remove') item.qty = 0;

        cart = cart.filter ((i) => i.qty >0);
        saveCart(cart);
        updateCartCount();
        renderCart();
    });

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            document.getElementById('checkoutMessage').textContent =
                'Your online checkout is processing. Your cart items are saved.';
        });
    }

    const clearBtn = document.getElementById('clearCart');
    if (clearBtn) {
        clearBtn.addEventListener('click',() => {
            saveCart([]);
            updateCartCount()
            renderCart();
        });
    }
    
    renderCart();
}

// This section is for workshops and events
document.querySelectorAll('.register-btn').forEach((button) => {
    button.addEventListener('click', () => {
        const choice = document.getElementById('eventChoice');
        if (choice) choice.value = button.dataset.event;
    });  
});
