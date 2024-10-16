// variables initializing:
let winHeight
let winWidth
let isMobile
let fontSize
function varUpdateOnResize() {
    winHeight = document.querySelector('.mobileHeightRef').clientHeight;
    winWidth = visualViewport.width;
    isMobile = (winWidth / winHeight) < 1;
    fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
}
varUpdateOnResize();
visualViewport.addEventListener('resize', varUpdateOnResize);

// переводит ремы в пиксели
function remToPx(rem) {
    return rem * fontSize;
}

let backgroundElem = document.querySelector('.fixed-background')
let htmlElem = document.querySelector('html')

// Объект для хранения предварительно загруженных изображений
const preloadedImages = {};

// пересчитывает анимации
function refreshAllAnimations() {
    // Обновляем все триггеры
    ScrollTrigger.getAll().forEach(trigger => {
        trigger.refresh();
    });
}



document.addEventListener("DOMContentLoaded", (event) => {


    // functions calling:
    gsap.registerPlugin(ScrollTrigger)
    gsap.registerPlugin(MotionPathPlugin)
    startAnimation()
    tabs()
    accordeonsInit()

    fixedTextAnimation()
    equipmentAnimation()
    iconBtnAnimation()


    if (isMobile) {
        const imagesToPreload = ["first-image.png", "second-image.png", "third-image.png"];
        preloadImages(imagesToPreload);

        setTriggerOnElement('.one-screen-transparent-1', "first-image.png")
        setTriggerOnElement('.one-screen-transparent-2', "second-image.png")
        setTriggerOnElement('.one-screen-transparent-3', "third-image.png")
    } else {
        fixedImageAnimation()
    }

});


// functions initializing:
function startAnimation() {
    if (isMobile) {
        gsap.timeline({
            scrollTrigger: {
                trigger: '.fixed-video',
                start: 'top top',
                end: '+=' + winHeight,
                pin: true,
                // markers: true
                scrub: 1,
            }
        }).to('.mob-image-foreground', { scale: 10, transformOrigin: 'center 50rem', duration: 1 }, 0)
            .to('.mob-image-foreground', { duration: 0.1, display: 'none' }, 1);

        gsap.timeline({
            scrollTrigger: {
                trigger: '.main-text-container',
                start: 'top top',
                end: '+=' + winHeight,
                pin: true,
            }
        })
    } else {
        gsap.timeline({
            scrollTrigger: {
                trigger: '.fixed-video',
                start: 'top top',
                end: '+=' + winHeight / 2,
                pin: true,
                // markers: true
                scrub: 1,
            }
        }).to('.image-foreground', { scale: 10, transformOrigin: 'center center', duration: 1 }, 0)
            .to('.image-foreground', { duration: 0.1, display: 'none' }, 1);


        gsap.timeline({
            scrollTrigger: {
                trigger: '.main-text-container',
                start: 'top top',
                end: '+=' + winHeight / 2,
                pin: true,
            }
        })
    }


}
function tabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        const tabsContainer = tab.parentElement;
        tab.onclick = () => {
            if (!tab.classList.contains('active')) {
                tab.classList.add('active')
                tabsContainer.querySelectorAll('.tab').forEach(otherTab => {
                    if (otherTab !== tab) {
                        otherTab.classList.remove('active');
                    }
                });
                if (tab.dataset.contentId == 1) {
                    gsap.timeline().to('.price-list-content-wrapper', { x: 0, ease: "back.out(1.5)", duration: 1 })
                } else {
                    gsap.timeline().to('.price-list-content-wrapper', { x: "-50%", ease: "back.in(1.5)", duration: 1 })
                }

            }
        }
    });
}

function fixedTextAnimation() {
    let secondCenteredTextShift = (isMobile) ? '0' : '-50%';
    gsap.timeline({
        scrollTrigger: {
            trigger: '.centered-text-container-1',
            start: 'top top',
            end: '+=' + window.innerHeight * 0.6,
            pin: true,
            scrub: 1,
        }
    }).to('.centered-text-1', { opacity: 0, duration: 0.1 }, 0.5)
        .fromTo('.centered-text-2', { y: "10%" }, { opacity: 1, duration: 0.1, y: secondCenteredTextShift }, 0.5)

    gsap.timeline({
        scrollTrigger: {
            trigger: '.centered-text-container-2',
            start: 'top top',
            end: '+=' + window.innerHeight * 1,
            pin: true,
        }
    })
}

function turnGreenBackground() {
    backgroundElem.setAttribute('src', '');
    htmlElem.style.background = "var(--green-100)";
}
function turnImageOnBackground(image) {
    htmlElem.style.background = "none";
    // Если изображение предзагружено, используем его
    if (preloadedImages[image]) {
        backgroundElem.src = preloadedImages[image].src;
    } else {
        // Если изображение не предзагружено, подгружаем его заново
        backgroundElem.setAttribute('src', '/assets/' + image);
    }
}

function setTriggerOnElement(selector, image) {
    gsap.timeline({
        scrollTrigger: {
            trigger: selector,
            start: 'top' + ' bottom',
            end: '+=' + (winHeight * 2),
            // markers:true,
            onEnter: () => turnImageOnBackground(image),
            onLeave: () => turnGreenBackground(),
            onEnterBack: () => turnImageOnBackground(image),
            onLeaveBack: () => turnGreenBackground(),
        }
    })
}

// Функция предварительной загрузки изображений
function preloadImages(imageArray) {
    imageArray.forEach(image => {
        const img = new Image();
        img.src = '/assets/' + image; // Загрузка изображения по указанному пути

        // Сохраняем загруженное изображение в объект для дальнейшего использования
        preloadedImages[image] = img;
    });

}

function fixedImageAnimation() {
    gsap.timeline({
        scrollTrigger: {
            trigger: '.fixed-wrapper-1',
            start: "top bottom",
            end: "+=" + (window.innerHeight * 2),
            scrub: true,
        }
    }).fromTo('.fixed-wrapper-1 .fixed-container', { y: '-100%' }, { y: "100%", ease: 'none', }, 0)



    function setElementFixed(selector, selfRelativeScrolls) {
        let elem = document.querySelector(selector)
        let container = elem.querySelector('.fixed-container')
        let containerHeight = container.clientHeight

        let centeredScrollOffset = 100-(((winHeight-containerHeight)/2)/winHeight*100)
        
        
        gsap.timeline({
            scrollTrigger: {
                trigger: elem,
                start: "top " + centeredScrollOffset + '%',
                end: "+=" + containerHeight*selfRelativeScrolls,
                scrub: true,
            }
        }).fromTo(container, { y: '-100%' }, { y: "200%", ease: 'none', }, 0)
    }
    setElementFixed('.fixed-wrapper-2', 3)
    setElementFixed('.fixed-wrapper-3', 3)
    setElementFixed('.fixed-wrapper-4', 3)
}

function accordeonsInit() {
    if (document.querySelectorAll('.price-list-item')) {
        document.querySelectorAll('.price-list-item').forEach(accordeon => {
            let icon = accordeon.querySelector('.price-list-item__icon')

            accordeon.onclick = () => {
                setTimeout(() => {
                    refreshAllAnimations()
                }, 201);
                accordeon.classList.toggle('active');
                if (accordeon.classList.contains('active')) {
                    if (isMobile) {
                        accordeon.style.height = accordeon.querySelector('.price-list-item__body').offsetHeight + remToPx(9.1) + "px"
                    } else {
                        accordeon.style.height = accordeon.querySelector('.price-list-item__body').offsetHeight + remToPx(11.1) + "px"
                    }

                    // анимируем иконку
                    gsap.timeline().to(icon, { rotate: 45, transformOrigin: "center" }, 0)
                } else {
                    accordeon.style.height = remToPx(6.1) + "px"

                    // анимируем иконку
                    gsap.timeline().to(icon, { rotate: 0, transformOrigin: "center" }, 0)
                }

            }
        })
    }
}

function equipmentAnimation() {
    if (isMobile) {
        // фиксируем текст
        gsap.timeline({
            scrollTrigger: {
                trigger: '.our-equipment__title',
                start: 'top bottom',
                end: '+=' + winHeight / 2,
                scrub: true,
            }
        }).fromTo('.our-equipment__title', { y: '300%' }, { y: '0' })
    } else {
        // фиксируем текст
        gsap.timeline({
            scrollTrigger: {
                trigger: '.equipment-info',
                start: 'top 2%',
                end: '+=' + remToPx(64),
                pin: true,
            }
        })
    }
}

function iconBtnAnimation() {
    document.querySelectorAll('.icon-btn').forEach(btn => {
        let icon = btn.querySelector('.icon-btn__icon');
        let background = btn.querySelector('.icon-btn__bg');
        let text = btn.querySelector('.icon-btn__text');

        let tl = gsap.timeline()
        btn.addEventListener('mouseenter', throttle(() => {
            tl.killTweensOf(background)
            tl = gsap.timeline().to(icon, {
                x: (btn.clientWidth - remToPx(5)), scale: 0.8, duration: 1, rotate: '540deg', ease: "slow(0.7,0.7,false)"
            }, 0)
                .to(icon, { opacity: 0, duration: 0.05 }, 1)
                .fromTo(background, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, transformOrigin: 'right', duration: 0.3 }, 1)
                .to(text, { color: 'var(--white)', duration: 0.1 }, 1)
                .to(background, { width: (btn.clientWidth + 'px'), duration: 0.1 }, 0)
        }, 1200))

        btn.addEventListener('mouseout', throttle(() => {
            tl.kill()
            tl = gsap.timeline().to(icon, { x: 0, rotate: 0, scale: 1, duration: 1, ease: "slow(0.7,0.7,false)" }, 0)
                .to(icon, { opacity: 1, duration: 0.01 }, 0)
                .to(background, { opacity: 0, scale: 0, transformOrigin: 'right', duration: 0.3 }, 0)
                .to(text, { color: 'var(--green-900)', duration: 0.1 }, 0)
        }, 1200))
    })
}

function throttle(func, delay) {
    let lastCall = 0;

    return function (...args) {
        const now = new Date().getTime();

        if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
        }
    };
}