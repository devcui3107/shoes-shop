// Slider Hero
document.addEventListener("DOMContentLoaded", function() {
    const slides = document.querySelectorAll(".slide");
    const indicators = document.querySelectorAll(".indicator");
    let currentIndex = 0;
    let autoSlideInterval;

    function showSlide(index) {
        const slidesContainer = document.querySelector(".slides");
        slidesContainer.style.transform = `translateX(${-index * 100}%)`;
        indicators.forEach(indicator => indicator.classList.remove("active"));
        indicators[index].classList.add("active");
        currentIndex = index;
    }

    function nextSlide() {
        let nextIndex = (currentIndex + 1) % slides.length;
        showSlide(nextIndex);
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 10000);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    indicators.forEach(indicator => {
        indicator.addEventListener("click", () => {
            stopAutoSlide();
            showSlide(parseInt(indicator.dataset.slide));
            startAutoSlide();
        });
    });

    showSlide(currentIndex);
    startAutoSlide();
});

// Slide Product Popular




