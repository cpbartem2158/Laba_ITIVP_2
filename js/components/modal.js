window.EduPlatform = window.EduPlatform || {};
var Edu = window.EduPlatform;

Edu.initMobileNav = function () {
    var burgerBtn = document.getElementById('burger-btn');
    var mainNav = document.getElementById('main-nav');
    if (!burgerBtn || !mainNav) return;

    burgerBtn.addEventListener('click', function () {
        var isOpen = mainNav.classList.toggle('header__nav--open');
        burgerBtn.classList.toggle('header__burger--active', isOpen);
        burgerBtn.setAttribute('aria-expanded', isOpen);
        burgerBtn.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });

    mainNav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            mainNav.classList.remove('header__nav--open');
            burgerBtn.classList.remove('header__burger--active');
            burgerBtn.setAttribute('aria-expanded', 'false');
            burgerBtn.setAttribute('aria-label', 'Открыть меню');
        });
    });
};
