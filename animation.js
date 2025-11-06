document.addEventListener("DOMContentLoaded", () => {
    const frame = document.querySelector(".frame-one");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const update = () => {
                const rect = frame.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                let progress = 1 - rect.top / windowHeight;
                progress = Math.min(Math.max(progress, 0), 1);

                frame.style.setProperty('--p', progress);
                
                requestAnimationFrame(update);
            };

            update();
        });
    }, { threshold: 0 });

    observer.observe(frame);
});

document.addEventListener("DOMContentLoaded", () => {
    const frame = document.querySelector(".frame-two");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const update = () => {
                const rect = frame.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                let progress = 1 - rect.top / windowHeight;
                progress = Math.min(Math.max(progress, 0), 1);

                frame.style.setProperty('--p', progress);
                
                requestAnimationFrame(update);
            };

            update();
        });
    }, { threshold: 0 });

    observer.observe(frame);
});