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
    tabs()
    accordeonsInit()

    fixedTextAnimation()
    if (isDesktop) {
        iconBtnAnimation()
    }
    servicesSliderInit()
    ourAdvantagesAnimation()
    yandexMapsInit()
    // currentYearInit()
    // footerAnimation()
    fixedImageAnimation()
    ourMastersAnimation()
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
function priceListContentWrapperSetActualSize(source, target, action) {
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
function tabs() {
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

                priceListContentWrapperSetActualSize('tab')
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
            start: '-30% top',
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
                .fromTo(secondElem, { y: "50%", opacity: 0 }, { opacity: 1, duration: 0.3, y: 0 }, 0)
        }
        function changeOpacityBack() {
            gsap.timeline().fromTo(firstElem, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0)
                .fromTo(secondElem, { y: 0, opacity: 1 }, { opacity: 0, duration: 0.3, y: '50%' }, 0)
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
}
function turnImageOnBackground(image, backgroundElem) {
    htmlElem.style.background = "none";
    // Если изображение предзагружено, используем его
    if (preloadedImages[image]) {
        backgroundElem.src = preloadedImages[image].src;
    } else {
        // Если изображение не предзагружено, подгружаем его заново
        backgroundElem.setAttribute('src', '/assets/' + image);
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
        img.src = '/assets/' + image; // Загрузка изображения по указанному пути

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
    } else {
        setElementFixed('.fixed-wrapper-1', 2)
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

function accordeonsInit() {
    if (document.querySelectorAll('.price-list-item')) {
        document.querySelectorAll('.price-list-item').forEach(accordeon => {
            let icon = accordeon.querySelector('.price-list-item__icon')
            accordeon.querySelector('.price-list-item__body').onclick = (e) => {
                e.stopPropagation();
            };
            accordeon.onclick = () => {
                setTimeout(() => {
                    refreshAllAnimations()
                }, 201);
                accordeon.classList.toggle('active');
                if (accordeon.classList.contains('active')) {
                    if (isMobile) {
                        accordeon.style.height = accordeon.querySelector('.price-list-item__body').offsetHeight + remToPx(9.1) + "px"
                        priceListContentWrapperSetActualSize('accordeon', accordeon, 'addHeight')
                    } else {
                        accordeon.style.height = accordeon.querySelector('.price-list-item__body').offsetHeight + remToPx(11.1) + "px"
                        priceListContentWrapperSetActualSize('accordeon', accordeon, 'addHeight')
                    }

                    // анимируем иконку
                    gsap.timeline().to(icon, { rotate: 45, transformOrigin: "center" }, 0)
                } else {
                    accordeon.style.height = remToPx(6.1) + "px"
                    priceListContentWrapperSetActualSize('accordeon', accordeon, 'delHeight')
                    // анимируем иконку
                    gsap.timeline().to(icon, { rotate: 0, transformOrigin: "center" }, 0)
                }

            }
        })
    }
}

function ourMastersAnimation() {
    let backgroundElem = document.querySelector('.master-fixed-background')
    setTriggerOnElement('.one-screen-transparent-2', "second-image.png", backgroundElem)
    setTriggerOnElement('.one-screen-transparent-3', "third-image.png", backgroundElem)
    setTriggerOnElement('.one-screen-transparent-4', "second-image.png", backgroundElem)
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
    if(isMobile){
        mapSelector = 'mobileMap'
        zoomInitValue = 12
    } else{
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
            iconImageHref: '/assets/mapPlacemark.svg',
        });
        let myPlacemark2 = new ymaps.Placemark([54.994796, 73.368934], {}, {
            iconLayout: 'default#image',
            iconImageHref: '/assets/mapPlacemark.svg',
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
    footer.style.height = container.getBoundingClientRect().height+ remToPx(10)+'px'
    container.style.top = '-'+container.getBoundingClientRect().height + remToPx(5)+'px'
    gsap.timeline({
        scrollTrigger: {
            trigger: container,
            start: 'top '+(100-((footer.getBoundingClientRect().height/winHeight)*100))+'%',
            end: '+='+container.getBoundingClientRect().height + remToPx(5),
            scrub: true,
        }
    }).fromTo(container, {y: '-100%'}, {y: '0'})
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