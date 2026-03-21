
console.log('JavaScript успешно подключен!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM полностью загружен');
    
    const heading = document.querySelector('h1');
    if (heading) {
        heading.style.transition = 'color 0.3s ease';
        heading.addEventListener('mouseenter', function() {
            this.style.color = '#3498db';
        });
        heading.addEventListener('mouseleave', function() {
            this.style.color = '#2c3e50';
        });
    }
});

const burgerBtn = document.getElementById('burger-btn');
const mainNav = document.getElementById('main-nav');

burgerBtn.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('header__nav--open');
    burgerBtn.classList.toggle('header__burger--active', isOpen);
    burgerBtn.setAttribute('aria-expanded', isOpen);
    burgerBtn.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
});

mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mainNav.classList.remove('header__nav--open');
        burgerBtn.classList.remove('header__burger--active');
        burgerBtn.setAttribute('aria-expanded', 'false');
        burgerBtn.setAttribute('aria-label', 'Открыть меню');
    });
});
