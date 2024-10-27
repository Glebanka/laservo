// variables initializing:
let winHeight
let winWidth
let isMobile
let isDesktop
let fontSize
function varUpdateOnResize() {
    winHeight = document.querySelector('.mobileHeightRef').clientHeight;
    winWidth = visualViewport.width;
    isMobile = (winWidth / winHeight) < 1;
    isDesktop = (winWidth / winHeight) > 1;
    fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
}
varUpdateOnResize();
visualViewport.addEventListener('resize', varUpdateOnResize);

// переводит ремы в пиксели
function remToPx(rem) {
    return rem * fontSize;
}

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
    imageGalleryAnimation()
    priceListInit()

    fixedTextAnimation()
    if (isDesktop) {
        iconBtnAnimation()
    }
    servicesSliderInit()
    ourAdvantagesAnimation()
    // yandexMapsInit()
    currentYearInit()
    footerAnimation()
    fixedImageAnimation()
    ourMastersAnimation()
    // secretAnimation()
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
function imageGalleryAnimation() {

    if (isDesktop) {
        let image = document.querySelector('.image-gallery__fixed-image')
        let container = document.querySelector('.image-gallery')
        image.style.display = 'none'
        gsap.timeline({
            scrollTrigger: {
                trigger: '.image-grid__padding-top',
                start: 'bottom bottom',
                end: '+=' + container.getBoundingClientRect().height * 2,
                // markers: true,
                onLeave: () => { image.style.display = 'none' },
                onEnter: () => { image.style.display = 'block' },
                onLeaveBack: () => { image.style.display = 'none' },
                onEnterBack: () => { image.style.display = 'block' },
            }
        })
    }
}

function priceListInit(){
    function tabsInit() {
        document.querySelectorAll('.tab').forEach(tab => {
            const tabsContainer = tab.parentElement;
            tab.onclick = () => {
                setTimeout(() => {
                    refreshAllAnimations()
                }, 1001);
                if (!tab.classList.contains('active')) {
                    tab.classList.add('active')
                    tabsContainer.querySelectorAll('.tab').forEach(otherTab => {
                        if (otherTab !== tab) {
                            otherTab.classList.remove('active');
                        }
                    });
                    document.querySelectorAll('.price-list-content').forEach(elem => {
                        elem.classList.remove('active')
                    })
                    let content = document.querySelector('.price-list-content-' + tab.dataset.contentId)
                    content.classList.add('active')
    
                    let activeAccordeon = findActiveAccordeon()
                    if (activeAccordeon) {
                        closeAccordeon(activeAccordeon)
                    }
                    setPriceListHeight('tab')
                    if (tab.dataset.contentId == 1) {
                        gsap.timeline().to('.price-list-content-wrapper', { x: 0, ease: "back.out(1.5)", duration: 1 })
                    } else if (tab.dataset.contentId == 2) {
                        gsap.timeline().to('.price-list-content-wrapper', { x: "-50%", ease: "back.in(1.5)", duration: 1 })
                    } else {
                        gsap.timeline().to('.price-list-content-wrapper', { x: "-100%", ease: "back.in(1.5)", duration: 1 })
                    }
    
                }
            }
        });
    }
    function accordeonsInit() {
        const accordeons = document.querySelectorAll('.price-list-item');
        if (accordeons) {
            accordeons.forEach(accordeon => {
                let accordeonBody = accordeon.querySelector('.price-list-item__body')
    
                // убираем возможность кликать внутри
                accordeonBody.onclick = (e) => e.stopPropagation();
    
                accordeon.onclick = () => {
                    if (accordeon.classList.contains('active')) {
                        closeAccordeon(accordeon)
                        setPriceListHeight('accordeon', accordeon, 'delHeight')
                    } else {
                        // проходимся второй раз по элементам и ищем уже активный
                        let activeAccordeon = findActiveAccordeon()
    
                        if (activeAccordeon) {
                            closeAccordeon(activeAccordeon)
                            openAccordeon(accordeon)
                        } else {
                            openAccordeon(accordeon)
                            setPriceListHeight('accordeon', accordeon, 'addHeight')
                        }
                    }
                    setTimeout(refreshAllAnimations, 201);
                }
            })
        }
    }
    function accordeonSetActualSize(accordeon) {
        let accordeonBody = accordeon.querySelector('.price-list-item__body')
        accordeon.style.height = accordeonBody.getBoundingClientRect().height + parseFloat(getComputedStyle(accordeonBody).marginTop) + remToPx(6.1) + 'px'
    }
    function findActiveAccordeon() {
        let activeAccordeon
        document.querySelectorAll('.price-list-item').forEach(accordeon => {
            if (accordeon.classList.contains('active')) {
                activeAccordeon = accordeon
            }
        })
        return activeAccordeon
    }
    function closeAccordeon(accordeon) {
        accordeon.classList.remove('active');
        accordeon.style.height = remToPx(6.1) + "px"
        // анимируем иконку
        gsap.timeline().to(accordeon.querySelector('.price-list-item__icon'), { rotate: 0, transformOrigin: "center" }, 0)
    }
    function openAccordeon(accordeon) {
        accordeon.classList.add('active');
        accordeonSetActualSize(accordeon)
        // анимируем иконку
        gsap.timeline().to(accordeon.querySelector('.price-list-item__icon'), { rotate: 45, transformOrigin: "center" }, 0)
    }
    function setPriceListHeight(source, target, action) {
        let priceListContentWrapper = document.querySelector(".price-list-content-wrapper")
        // Если вызов был сделан из таба, то мы врапперу ставим такую же высоту как у активного элемента
        if (source == 'tab') {
            priceListContentWrapper.style.height = document.querySelector('.price-list-content.active').getBoundingClientRect().height + 'px'
        } else if (source == 'accordeon') {
            // Если мобилка, то ставим первое значение, иначе второе
            let priceListItemBodyMargin = (isMobile) ? remToPx(3) : remToPx(5)
            let priceListItemBodyHeight = getHeight(target.querySelector('.price-list-item__body')) + priceListItemBodyMargin
    
            if (action == 'addHeight') {
                priceListContentWrapper.style.height = (getHeight(priceListContentWrapper) + priceListItemBodyHeight) + "px"
            } else if (action == 'delHeight') {
                priceListContentWrapper.style.height = (getHeight(priceListContentWrapper) - priceListItemBodyHeight) + "px"
            }
    
            setTimeout(
                () => { priceListContentWrapper.style.height = getHeight(document.querySelector('.price-list-content.active')) + 'px' }
                , 201)
        }
    
        setTimeout(() => {
            refreshAllAnimations()
        }, 1001);
    
        function getHeight(element) {
            return element.getBoundingClientRect().height;
        }
    }
    
    accordeonsInit()
    tabsInit()
}

function fixedTextAnimation() {
    let containers = ['.centered-text-container-1', '.centered-text-container-2']
    let elementGroups = [['.centered-text-1', '.centered-text-2']]
    setFixedText(containers, elementGroups)
}
function ourAdvantagesAnimation() {
    let containers = ['.centered-text-container-3', '.centered-text-container-4', '.centered-text-container-5']
    let elementGroups = [['.centered-text-3', '.centered-text-4'], ['.centered-text-4', '.centered-text-5']]
    setFixedText(containers, elementGroups)
}
function setFixedText(containers, elementGroups) {
    let screensCount = containers.length;
    let parentElement = document.querySelector(containers[1]).parentElement
    parentElement.style.height = ((screensCount + 1) * 100) + 'vh'

    let secondCenteredTextShift = (isMobile) ? '-50%' : '0';

    let firstElem

    elementGroups.forEach((group, index) => {
        if (index == 0) {
            firstElem = group[0]
        }
        changeText(group[0], group[1], index + 1)
    })

    gsap.timeline({
        scrollTrigger: {
            trigger: containers[1],
            start: 'top top',
            onEnter: () => { gsap.timeline().to(firstElem, { opacity: 1, duration: 0.3 }, 0) },
        }
    })

    function changeText(firstElem, secondElem, topElemShift) {
        gsap.timeline({
            scrollTrigger: {
                trigger: containers[1],
                start: 'top+=' + window.innerHeight * topElemShift + 'top',
                onEnter: () => { changeOpacity() },
                onLeaveBack: () => { changeOpacityBack() },
            }
        })

        function changeOpacity() {
            gsap.timeline().fromTo(firstElem, { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0)
                .fromTo(secondElem, { y: "100%", opacity: 0 }, { opacity: 1, duration: 0.3, y: 0 }, 0)
        }
        function changeOpacityBack() {
            gsap.timeline().fromTo(firstElem, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0)
                .fromTo(secondElem, { y: 0, opacity: 1 }, { opacity: 0, duration: 0.3, y: '100%' }, 0)
        }
    }
    containers.forEach(container => {
        pinElem(container)
    })
    function pinElem(selector) {
        gsap.timeline({
            scrollTrigger: {
                trigger: selector,
                start: 'top top',
                end: '+=' + window.innerHeight * screensCount,
                pin: true,
            }
        })
    }

}

function turnGreenBackground(backgroundElem) {
    backgroundElem.setAttribute('src', '');
    htmlElem.style.background = "var(--green-100)";
    backgroundElem.style.display = 'none';
}
function turnImageOnBackground(image, backgroundElem) {
    htmlElem.style.background = "none";
    backgroundElem.style.display = 'block';

    let basePath = window.location.pathname.includes('laservo') ? '/laservo/' : '/';
    let path = basePath + 'assets/' + image;
    // Если изображение предзагружено, используем его
    if (preloadedImages[image]) {
        backgroundElem.src = preloadedImages[image].src;
    } else {
        // Если изображение не предзагружено, подгружаем его заново
        backgroundElem.setAttribute('src', path);
    }
}

function setTriggerOnElement(selector, image, backgroundElem) {
    gsap.timeline({
        scrollTrigger: {
            trigger: selector,
            start: 'top' + ' bottom',
            end: '+=' + (winHeight * 2),
            // markers:true,
            onEnter: () => turnImageOnBackground(image, backgroundElem),
            onLeave: () => turnGreenBackground(backgroundElem),
            onEnterBack: () => turnImageOnBackground(image, backgroundElem),
            onLeaveBack: () => turnGreenBackground(backgroundElem),
        }
    })
}

// Функция предварительной загрузки изображений
function preloadImages(imageArray) {
    imageArray.forEach(image => {
        const img = new Image();
        let basePath = window.location.pathname.includes('laservo') ? '/laservo/' : '/';
        let path = basePath + 'assets/' + image;
        img.src = path; // Загрузка изображения по указанному пути

        // Сохраняем загруженное изображение в объект для дальнейшего использования
        preloadedImages[image] = img;
    });

}

function fixedImageAnimation() {
    if (isMobile) {
        const imagesToPreload = ["first-image.png", "second-image.png", "third-image.png"];
        preloadImages(imagesToPreload);
        
        let backgroundElem = document.querySelector('.fixed-background')
        setTriggerOnElement('.one-screen-transparent-1', "first-image.png", backgroundElem)

        let mastersBackgroundElem = document.querySelector('.master-fixed-background')
        setTriggerOnElement('.one-screen-transparent-2', "second-image.png", mastersBackgroundElem)
        setTriggerOnElement('.one-screen-transparent-3', "third-image.png", mastersBackgroundElem)
        setTriggerOnElement('.one-screen-transparent-4', "second-image.png", mastersBackgroundElem)

    } else {
        // setElementFixed('.fixed-wrapper-1', 2)
        setElementFixed('.fixed-wrapper-2', 3)
        setElementFixed('.fixed-wrapper-3', 3)
        setElementFixed('.fixed-wrapper-4', 3)
    }

}

function setElementFixed(selector, selfRelativeScrolls) {
    let elem = document.querySelector(selector)
    let container = elem.querySelector('.fixed-container')
    let containerHeight = container.clientHeight


    let endYPosition
    if (selfRelativeScrolls > 1) {
        endYPosition = (selfRelativeScrolls - 1) + '00%'
    } else {
        endYPosition = '0'
    }


    // высчитывает процент от верха экрана для старт позиции чтобы элемент всегда был в центре экрана при скролле, вне зависимости от того какая у него высота
    let centeredScrollOffset = 100 - (((winHeight - containerHeight) / 2) / winHeight * 100)

    gsap.timeline({
        scrollTrigger: {
            trigger: elem,
            start: "top " + centeredScrollOffset + '%',
            end: "+=" + containerHeight * selfRelativeScrolls,
            scrub: true,
        }
    }).fromTo(container, { y: '-100%' }, { y: endYPosition, ease: 'none', }, 0)
}
function servicesSliderInit() {
    const swiper = new Swiper('.services-slider', {
        slidesPerView: 'auto',
        speed: 700,
    })
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

function yandexMapsInit() {
    let mapSelector
    let zoomInitValue
    if (isMobile) {
        mapSelector = 'mobileMap'
        zoomInitValue = 12
    } else {
        setElementFixed('.fixed-wrapper-5', 1)
        mapSelector = 'map'
        zoomInitValue = 13
    }
    ymaps.ready(init);
    function init() {
        let myMap = new ymaps.Map(mapSelector, {
            center: [54.991280, 73.352493],
            zoom: zoomInitValue
        });


        let myPlacemark = new ymaps.Placemark([54.985581, 73.311039], {}, {
            iconLayout: 'default#image',
            iconImageHref: 'assets/mapPlacemark.svg',
        });
        let myPlacemark2 = new ymaps.Placemark([54.994796, 73.368934], {}, {
            iconLayout: 'default#image',
            iconImageHref: 'assets/mapPlacemark.svg',
        });
        myMap.geoObjects.add(myPlacemark);
        myMap.geoObjects.add(myPlacemark2);
    }
}

function currentYearInit() {
    let currentDate = new Date;
    document.querySelector('.currentYear').innerHTML = currentDate.getFullYear();
}

function footerAnimation() {
    let footer = document.querySelector('.footer');
    let container = document.querySelector('.footer-container');
    footer.style.height = container.getBoundingClientRect().height + remToPx(5) + 'px'
    let startPosition = isMobile ? 'top top' : 'top ' + (100 - (((footer.getBoundingClientRect().height) / winHeight) * 100)) + '%'
    let containerStartYPosition = isMobile ? 0 : '-100%'
    gsap.timeline({
        scrollTrigger: {
            trigger: container,
            start: startPosition,
            end: '+=' + container.getBoundingClientRect().height,
            scrub: true,
        }
    }).fromTo(container, { y: containerStartYPosition }, { y: '0', ease: 'none' }, 0)
    // .fromTo('.header', {opacity: 1}, {opacity: 0, ease: 'none'}, 0)
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

function secretAnimation() {
    let image = document.querySelector('.secret-image')
    image.style.display = 'none'
    gsap.timeline({
        scrollTrigger: {
            trigger: '.secret-container.secret-1',
            start: 'bottom 85%',
            end: '+=' + remToPx(135),
            // markers: true,
            onLeave: () => { image.style.display = 'none' },
            onEnter: () => { image.style.display = 'block' },
            onLeaveBack: () => { image.style.display = 'none' },
            onEnterBack: () => { image.style.display = 'block' },
        }
    })
}