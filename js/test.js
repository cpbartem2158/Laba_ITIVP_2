
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