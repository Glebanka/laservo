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

// Включаем lenis если мы на пк
const lenis = isDesktop ? new Lenis() : undefined;

// переводит ремы в пиксели
function remToPx(rem) {
    return rem * fontSize;
}

let htmlElem = document.querySelector('html')

// Объект для хранения предварительно загруженных изображений
const preloadedImages = {};

// пересчитывает анимации
function refreshAllAnimations({
    withoutSelector = '',
} = {}) {
    // Обновляем все триггеры
    ScrollTrigger.getAll().forEach(trigger => {
        if (withoutSelector != '' && trigger.vars.trigger == withoutSelector && trigger.vars.trigger.classList.contains(withoutSelector)) return
        trigger.refresh();
    });
}

// класс для возможности переиспользования элемента слайдера до/после
class CompareSlider {
    constructor(selector, options = {}) {
        this.slider = document.querySelector(selector)
        this.options = Object.assign({
            slideSelector: '',
            imagesArray: [],
            slideInterval: 3500,
        }, options)
        this.imagePairs = [];
        this.currentSlideIndex = 0;
        this.slideIntervalId = null;
        this.transitionAnimationTimeline = gsap.timeline();
        this.navBtns = null;

        try {
            this.init()
        } catch (error) {
            console.error("Ошибка при инициализации слайдера:", error.message)
        }
    }
    init() {
        this.validateOptions();
        this.loadAndGroupImages();
        this.navButtonsInit();
        this.initVisibilityObserver();
    }
    initVisibilityObserver() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startSlideShow(); // Запускаем, если элемент в области видимости
                } else {
                    clearInterval(this.slideIntervalId); // Останавливаем, если элемент выходит из видимости
                    this.transitionAnimationTimeline.kill();
                }
            });
        });
        observer.observe(this.slider);
    }
    validateOptions() {
        if (this.slider == null) throw new Error("Такого элемента не существует");
        if (this.options.slideSelector === '') throw new Error("Не задан параметр slideSelector");
        if (this.options.imagesArray.length < 1) throw new Error("Не задан массив со слайдами imagesArray");
        if (this.options.imagesArray.length % 2 !== 0) throw new Error("Количество изображений нечётное.")
    }
    loadAndGroupImages() {
        const basePath = window.location.pathname.includes('laservo') ? '/laservo/' : '/';
        const tempArray = [];

        this.options.imagesArray.forEach((imageName) => {
            const img = new Image();
            img.src = `${basePath}assets/${imageName}`; // Загрузка изображения по пути
            tempArray.push(img);

            // Создаем пары изображений
            if (tempArray.length === 2) {
                this.imagePairs.push([...tempArray]);
                tempArray.length = 0;
            }
        });
    }
    startSlideShow() {
        this.updateNextSlideImages();
        this.updateNavButtonsClasses();
        // Запускаем новый интервал с сохранением его ID
        this.slideIntervalId = setInterval(() => {
            this.goToNextSlide();
        }, this.options.slideInterval);
    }
    startNewSlideShow() {
        // Очищаем существующий интервал
        if (this.slideIntervalId) {
            clearInterval(this.slideIntervalId)
            this.transitionAnimationTimeline.kill()
        };

        this.transitionAnimation();
        // Запускаем новый интервал с сохранением его ID
        this.slideIntervalId = setInterval(() => {
            this.goToNextSlide();
        }, this.options.slideInterval);
    }
    transitionAnimation() {
        let currentSlide = this.slider.querySelector(this.options.slideSelector + '.current')
        let nextSlide = this.slider.querySelector(this.options.slideSelector + '.next')

        nextSlide.style.cssText = `
            z-index: 1;
            position: relative;
            order: 2;
        `
        this.transitionAnimationTimeline = gsap.timeline().fromTo(nextSlide, { y: 0 }, {
            y: "-100%", duration: 0.5, onComplete: () => {
                this.updateSlideClasses(currentSlide, nextSlide);
            }
        })

    }
    updateSlideClasses(currentSlide, nextSlide) {
        currentSlide.classList.replace('current', 'next');
        currentSlide.style.cssText = `
        position: relative;
        order: 2;
        z-index: 1;
        `;

        nextSlide.classList.replace('next', 'current');
        nextSlide.style.cssText = `
            position: relative;
            order: 1;
            z-index: 0;
        `;
    }
    goToNextSlide() {
        // Переходим к следующему индексу, возвращаемся к началу, если массив кончился
        this.currentSlideIndex = (this.currentSlideIndex + 1) % this.imagePairs.length;
        this.updateNextSlideImages();
        this.updateNavButtonsClasses();
        this.transitionAnimation();
    }

    // Обновление изображений следующего слайда
    updateNextSlideImages() {
        const nextImages = this.imagePairs[this.currentSlideIndex];

        const nextSlide = this.slider.querySelector(this.options.slideSelector + '.next');

        const imgBlocks = nextSlide.querySelectorAll('.compare-slide__img')

        imgBlocks.forEach((imgBlock, index) => {
            imgBlock.src = nextImages[index].src
        })
    }

    goToSlide(index) {
        if (index < 0 || index >= this.imagePairs.length) return;

        this.currentSlideIndex = index;
        this.updateNavButtonsClasses();
        this.updateNextSlideImages();
        this.startNewSlideShow();
    }

    navButtonsInit() {
        const navContainer = this.slider.parentElement.querySelector('.compare-slider__nav-container')

        navContainer.innerHTML = this.imagePairs.map(() => `
        <div class='compare-slider__nav'>
            <div class="compare-slider__nav-fill"></div>
        </div>`
        ).join('');

        this.navBtns = navContainer.querySelectorAll('.compare-slider__nav')

        this.navBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.goToSlide(index)
            })
        })

        this.defineActiveNavBtnWidth(navContainer)
    }

    defineActiveNavBtnWidth(navContainer) {
        const navBtnWidth = isDesktop ? remToPx(4) : remToPx(1)
        const activeNavBtnWidth = navContainer.getBoundingClientRect().width -
            ((navBtnWidth * (this.imagePairs.length - 1)) + (remToPx(1) * (this.imagePairs.length - 1)))

        const style = document.createElement('style');
        style.innerHTML = `
          .compare-slider__nav-fill {
            --active-nav-btn-width: ${activeNavBtnWidth}px;
          }
        `;
        document.head.appendChild(style);
    }

    updateNavButtonsClasses() {
        // console.log(this.currentSlideIndex);
        this.navBtns.forEach((btn, index) => {
            if (index == this.currentSlideIndex) {
                this.navBtns.forEach((btn) => {
                    btn.classList.remove('active')
                })
                btn.classList.remove('passed')
                btn.classList.add('active')
                this.animateNavProgressBar(btn)
                // console.log('попал в активный '+index);
            } else if (index < this.currentSlideIndex) {
                // console.log('попал в passed '+index);
                btn.classList.add('passed')
            } else if (index >= this.currentSlideIndex) {
                // console.log('попал в unpassed '+index);
                btn.classList.remove('passed')
            }
        })
    }
    animateNavProgressBar(navBtn) {
        const fillElem = navBtn.querySelector('.compare-slider__nav-fill')

        this.slider.parentElement.querySelectorAll('.compare-slider__nav-fill').forEach(fillElem => {
            gsap.set(fillElem, { x: '-100%', overwrite: 'auto', force3D: false });
        });


        if (fillElem.currentAnimation) {
            fillElem.currentAnimation.kill();
        }

        fillElem.currentAnimation = gsap.fromTo(
            fillElem,
            { x: '-100%' }, {
            x: '0',
            duration: this.options.slideInterval / 1000,
            ease: "none",
            onComplete: () => {
                gsap.set(fillElem, { x: '-100%' });
                fillElem.currentAnimation = null;
            }
        }
        );
    }
}

// класс для возможности переиспользования элемента аккордиона (вызываешь класс и задаешь селекторы)
class Accordion {
    constructor(selector, options = {}) {
        this.accordions = document.querySelectorAll(selector);
        this.options = Object.assign({
            itemSelector: selector,
            hoverBgSelector: '.accordion__bg',
            bodySelector: '.accordion__body',
            titleSelector: '.accordion__title',
            iconSelector: '.accordion__icon',
            activeClass: 'active',
            animationDuration: 200,
            heightOffset: 7.2, // высота в rem для закрытого состояния
            resetBufferTime: 201, // Время буфера для обновления анимаций
            wrapperSelector: '.price-list-content-wrapper',
            onClick: null
        }, options);

        this.init();
    }

    init() {
        if (this.accordions.length === 0) return;

        this.accordions.forEach(accordion => {
            // let heightOffset = parseFloat(getComputedStyle(accordion).paddingTop) + parseFloat(getComputedStyle(accordion).paddingTop) + parseFloat(getComputedStyle(document.querySelector(this.options.titleSelector)).fontSize)
            // console.log(heightOffset);
            accordion.style.height = remToPx(this.options.heightOffset) + 'px'
            accordion.querySelector(this.options.hoverBgSelector).style.height = remToPx(this.options.heightOffset) + 'px'

            let accordionBody = accordion.querySelector(this.options.bodySelector);
            accordionBody.onclick = (e) => e.stopPropagation();

            accordion.onclick = () => {
                if (accordion.classList.contains(this.options.activeClass)) {
                    this.closeAccordion(accordion);
                    this.updateWrapperHeight('delHeight', accordion);
                } else {
                    let activeAccordion = this.findActiveAccordion();
                    if (activeAccordion) {
                        this.openAccordion(accordion);
                        this.closeAccordion(activeAccordion, 50); // Закрытие с задержкой
                    } else {
                        this.openAccordion(accordion);
                        this.updateWrapperHeight('addHeight', accordion);
                    }
                }

                // Обновление всех анимаций через заданное время
                setTimeout(this.refreshAnimations.bind(this), this.options.resetBufferTime);

                // дополнительный колбэк, если нужно повесить функцию при клике
                if (typeof this.options.onClick === 'function') {
                    this.options.onClick(accordion);
                }
            };
        });
        this.initHoverAnimations()
    }

    findActiveAccordion() {
        return Array.from(this.accordions).find(acc => acc.classList.contains(this.options.activeClass));
    }

    closeAccordion(accordion, delay = 0) {
        setTimeout(() => {
            accordion.classList.remove(this.options.activeClass);
            accordion.style.height = `${remToPx(this.options.heightOffset)}px`;
            if (typeof this.options.iconAni === 'function') {
                this.options.onClick(accordion);
            }
            gsap.timeline().to(accordion.querySelector(this.options.iconSelector), {
                rotate: 0, transformOrigin: "center"
            });
        }, delay);
    }

    openAccordion(accordion) {
        accordion.classList.add(this.options.activeClass);
        this.setAccordionActualSize(accordion);
        gsap.timeline().to(accordion.querySelector(this.options.iconSelector), {
            rotate: 45, transformOrigin: "center"
        });
    }

    setAccordionActualSize(accordion) {
        let accordionBody = accordion.querySelector(this.options.bodySelector);
        accordion.style.height = `${this.getHeight(accordionBody) + remToPx(5.6) + remToPx(this.options.heightOffset)}px`;
    }

    updateWrapperHeight(action, accordion) {
        let wrapper = document.querySelector(this.options.wrapperSelector);
        if (!wrapper) return;

        let bodyHeight = this.getHeight(accordion.querySelector(this.options.bodySelector));
        let offset = remToPx(5.6); // Используем 5.6 rem как в исходном коде
        let newHeight = (action === 'addHeight')
            ? this.getHeight(wrapper) + bodyHeight + offset
            : this.getHeight(wrapper) - bodyHeight - offset;

        wrapper.style.height = `${newHeight}px`;

        // Подстраиваем высоту обёртки к активному контенту через буферное время
        setTimeout(() => {
            wrapper.style.height = `${this.getHeight(document.querySelector('.price-list-content.active'))}px`;
        }, this.options.resetBufferTime);
    }

    getHeight(element) {
        return element.getBoundingClientRect().height;
    }

    refreshAnimations() {
        // Функция для обновления всех анимаций
        if (typeof refreshAllAnimations === 'function') {
            refreshAllAnimations();
        }
    }

    initHoverAnimations() {
        if (isDesktop) {
            document.querySelectorAll(this.options.itemSelector).forEach(item => {
                let itemHeight = item.getBoundingClientRect().height;
                let itemBG = item.querySelector(this.options.hoverBgSelector);
                let center = itemHeight / 2;

                if (itemBG) {
                    item.addEventListener('pointerenter', (e) => {
                        gsap.killTweensOf(itemBG);
                        if (!item.classList.contains(this.options.activeClass)) {
                            if (e.target !== e.currentTarget) return;

                            let itemYPos = item.getBoundingClientRect().y;
                            itemBG.style.opacity = '1';

                            let timeline = gsap.timeline();
                            if (e.clientY > itemYPos + center) {
                                timeline.fromTo(itemBG, { y: '101%' }, { y: 0, duration: 0.3 })
                                    .to(itemBG, { opacity: 1, duration: 0.01 }, 0);
                            } else {
                                timeline.fromTo(itemBG, { y: '-101%' }, { y: 0, duration: 0.3 })
                                    .to(itemBG, { opacity: 1, duration: 0.01 }, 0);
                            }
                        } else {
                            itemBG.style.opacity = '0';
                        }
                    });

                    item.addEventListener('pointerleave', (e) => {
                        gsap.killTweensOf(itemBG);
                        if (!item.classList.contains(this.options.activeClass)) {
                            let itemYPos = item.getBoundingClientRect().y;

                            let timeline = gsap.timeline();
                            if (e.clientY > itemYPos + center) {
                                timeline.fromTo(itemBG, { y: 0 }, { y: '101%', duration: 0.3 })
                                    .to(itemBG, { opacity: 0, duration: 0.01 }, 0.3);
                            } else {
                                timeline.fromTo(itemBG, { y: 0 }, { y: '-101%', duration: 0.3 })
                                    .to(itemBG, { opacity: 0, duration: 0.01 }, 0.3);
                            }
                        } else {
                            itemBG.style.opacity = '0';
                        }
                    });
                }
            });
        }
    }
}

// функцию можно переиспользовать, задавая все селекторы
function tabsInit({
    tabSelector = '.tab',
    contentSelector = '.tab-content',
    parentElementSelector = '',
    onClick = null,
} = {}) {
    // если задан parentElementSelector, то выбираем его как родителя, если нет то document
    const parentElement = parentElementSelector !== '' ? document.querySelector(parentElementSelector) : document
    const tabs = parentElement.querySelectorAll(tabSelector);
    const contents = parentElement.querySelectorAll(contentSelector);

    tabs.forEach(tab => {
        const tabsContainer = tab.parentElement;
        tab.onclick = () => {
            if (!tab.classList.contains('active')) {
                // Деактивация других табов и контента
                tabsContainer.querySelectorAll('.tab').forEach(otherTab => { otherTab.classList.remove('active'); });
                contents.forEach(elem => { elem.classList.remove('active') })

                // Активация текущего таба и его контента
                tab.classList.add('active')
                // строка в формате .tab-content-1, где 1 = data-content-id 
                const content = parentElement.querySelector(`${contentSelector}-${tab.dataset.contentId}`)
                content.classList.add('active')

                // Вызываем onClick, передавая tab и content
                if (typeof onClick === 'function') {
                    onClick(tab, content);
                }

            }
        }
    });
}

// функцию можно переиспользовать, соблюдая структуру вложенности классов и задавая parentElementSelector
function detailsInit({
    parentElementSelector = ''
} = {}) {
    // если задан parentElementSelector, то выбираем его как родителя, если нет то document
    const parentElement = parentElementSelector !== '' ? document.querySelector(parentElementSelector) : document
    const detailsElem = parentElement.querySelector('.details')
    const detailsContent = parentElement.querySelector('.details__content-container')
    const detailsIcon = detailsElem.querySelector('.details__plus-icon')

    detailsContent.style.height = detailsElem.querySelector('.details__first-content').getBoundingClientRect().height + 'px'

    detailsIcon.addEventListener('click', () => {
        detailsContent.style.height = detailsContent.querySelector('.details__content-wrapper').getBoundingClientRect().height + 'px'
        detailsIcon.style.opacity = 0

        setTimeout(() => refreshAllAnimations(), 301)
    })
}

// функцию можно переиспользовать, соблюдая структуру вложенности классов и задавая slider
function sliderIndicatorInit(slider) {
    let slidesQuantity = slider.slides.length
    let indicatorFullWidth = remToPx(34);
    let sliderBlock = slider.el
    let sliderIndicator = sliderBlock.parentElement.querySelector('.slider-indicator')
    let sliderIndicatorBar = sliderIndicator.querySelector('.slider-indicator__bar')
    let sliderIndicatorWidth = indicatorFullWidth / slidesQuantity
    sliderIndicatorBar.style.width = sliderIndicatorWidth + 'px'

    slider.on('slideChange', (e) => {
        gsap.timeline().to(sliderIndicatorBar, { x: sliderIndicatorWidth * e.activeIndex })
    });
}

document.addEventListener("DOMContentLoaded", (event) => {


    // functions calling:
    scrollPluginsInit()
    startAnimation()
    burgerAnimation()
    githubPagesLinks()
    imageGalleryAnimation()
    priceListSectionInit()
    priceListPageInit()
    faqInit()
    reviewsTabsInit()
    promoSectionInit()
    compareSectionInit()
    equipmentAnimation()
    // advicesSectionInit()

    fixedTextAnimation()
    iconBtnAnimation()
    serviceSectionInit()
    expertsSectionInit()
    ourAdvantagesAnimation()
    yandexMapsInit()
    currentYearInit()
    footerAnimation()
    fixedImageAnimation()
    // udsAnimation()
    fadeInScrollAnimation()
});


// functions initializing:

function fadeInScrollAnimation() {
    const elements = document.querySelectorAll('.fade-in-scroll');

    if (elements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.9 });

        elements.forEach((el) => observer.observe(el));
    }
}

function scrollPluginsInit() {
    gsap.registerPlugin(ScrollTrigger);
    if (isDesktop) {
        ScrollTrigger.refresh();
        // smooth scroll init


        lenis.on('scroll', ScrollTrigger.update)

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000)
        })

        gsap.ticker.lagSmoothing(0)

        ScrollTrigger.refresh();
    }
}

function burgerAnimation() {
    document.querySelector('.header__burger').addEventListener('click', clickHadler)
    document.querySelector('.mob-burger-btn').addEventListener('click', clickHadler)
    let menuEl = document.querySelector('.menu')
    
    function clickHadler(e) {
        let burgerEl        
        if (e.target.tagName === 'svg' && e.target.classList.contains('burger-icon')) {
            burgerEl = e.target;            
        } else if (e.target.tagName === 'svg') {
            burgerEl = e.target.closest('.mob-burger-btn').querySelector('svg.burger-icon');
        } else if (e.target.tagName === 'path'){
            burgerEl = e.target.closest('svg').parentElement.querySelector('svg.burger-icon');
        } else if (e.target.tagName === 'rect'){
            burgerEl = e.target.closest('.burger-icon')
        }
        
        if (menuEl.classList.contains('active')) {
            menuEl.classList.remove('active')
            toggleBurgerState(burgerEl, 'close');
            if (lenis) lenis.start()
        } else {
            menuEl.classList.add('active')
            toggleBurgerState(burgerEl, 'open');
            if (lenis) lenis.stop()
        }
    }
    function toggleBurgerState(burgerEl, state) {
        const timeline = gsap.timeline();
        const burgerRectSelector = `.${[...burgerEl.classList].join('.')}`;
        const rectSelectors = {
            first: `${burgerRectSelector} .burger-icon__rect_first`,
            second: `${burgerRectSelector} .burger-icon__rect_second`,
            third: `${burgerRectSelector} .burger-icon__rect_third`,
        };

        if (state === 'open') {
            timeline
                .to(rectSelectors.first, { y: isMobile ? '1200%' : '400%', duration: 0.25 }, 0)
                .to(rectSelectors.second, { opacity: 0, duration: 0.25 }, 0)
                .to(rectSelectors.third, { y: isMobile ? '-1200%' : '-400%', duration: 0.25 }, 0)
                .to(rectSelectors.first, { rotate: 45, transformOrigin: 'center', duration: 0.25 }, 0.25)
                .to(rectSelectors.third, { rotate: -45, transformOrigin: 'center', duration: 0.25 }, 0.25);
        } else {
            timeline
                .to(rectSelectors.first, { rotate: 0, transformOrigin: 'center', duration: 0.25 }, 0)
                .to(rectSelectors.third, { rotate: 0, transformOrigin: 'center', duration: 0.25 }, 0)
                .to(rectSelectors.first, { y: '-15%', duration: 0.25 }, 0.25)
                .to(rectSelectors.second, { opacity: 1, duration: 0.25 }, 0.25)
                .to(rectSelectors.third, { y: '15%', duration: 0.25 }, 0.25);
        }
    }
}

function githubPagesLinks() {
    document.querySelectorAll('a').forEach(link => {
        let currentHref = link.href
        
        let basePath = window.location.pathname.includes('laservo') ? '/laservo/' : '/';
        if (currentHref.includes('html')) {
            const url = new URL(currentHref);
            const path = url.pathname;
            
            url.pathname = basePath + path.replace(/^\//, '');
            link.href = url.toString();            
        }
    })
}

function startAnimation() {
    if (document.querySelector('.main-banner')) {
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
}
function imageGalleryAnimation() {
    if (document.querySelector('.image-gallery')) {
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
}

function reviewsTabsInit() {
    if (document.querySelector('.review-page')) {
        tabsInit({
            tabSelector: '.platform-tab',
            contentSelector: '.reviews-wrapper',
            parentElementSelector: '.review-place_tarskaya',
            onClick: (tab, content) => {
                const wrapper = content.closest('.reviews-content-wrapper');

                let position;
                let ease;
                switch (tab.dataset.contentId) {
                    case '1':
                        position = '0%';
                        ease = "back.out(1.5)";
                        break;
                    case '2':
                        position = '-50%';
                        ease = "back.in(1.5)";
                        break;
                    case '3':
                        position = '-100%';
                        ease = "back.in(1.5)";
                        break;
                    case '4':
                        position = '-150%';
                        ease = "back.in(1.5)";
                        break;
                }
                // Применение анимации к wrapper
                gsap.timeline().to(wrapper, { x: position, ease: ease, duration: 1 });
            }
        })
        tabsInit({
            tabSelector: '.platform-tab',
            contentSelector: '.reviews-wrapper',
            parentElementSelector: '.review-place_leviy',
            onClick: (tab, content) => {
                const wrapper = content.closest('.reviews-content-wrapper');

                let position;
                let ease;
                switch (tab.dataset.contentId) {
                    case '1':
                        position = '0%';
                        ease = "back.out(1.5)";
                        break;
                    case '2':
                        position = '-50%';
                        ease = "back.in(1.5)";
                        break;
                    case '3':
                        position = '-100%';
                        ease = "back.in(1.5)";
                        break;
                    case '4':
                        position = '-150%';
                        ease = "back.in(1.5)";
                        break;
                }
                // Применение анимации к wrapper
                gsap.timeline().to(wrapper, { x: position, ease: ease, duration: 1 });
            }
        })
    }
}

function promoSectionInit() {
    if (document.querySelector('.promo')) {
        detailsInit({ parentElementSelector: '.promo' })
    }
}

function compareSectionInit() {
    if (document.querySelector('.compare_laser')) {
        const imagesArray = ['compare-slider-laser-1.1.png', 'compare-slider-laser-1.2.png',
            'compare-slider-massage-1.1.png', 'compare-slider-massage-1.2.png',
            'first-image.png', 'second-image.png',
            'service (1).png', 'service (2).png',
            'service (3).png', 'service (4).png',
            'service (5).png', 'service (6).png']

        const slider = new CompareSlider('.compare-slider', {
            slideSelector: '.compare-slide',
            imagesArray: imagesArray
        })
    }
    if (document.querySelector('.compare_massage')) {
        const imagesArray = [
            'compare-slider-massage-1.1.png', 'compare-slider-massage-1.2.png',
            'service (1).png', 'service (2).png',
            'service (3).png', 'service (4).png',
            'first-image.png', 'second-image.png',
            'compare-slider-laser-1.1.png', 'compare-slider-laser-1.2.png',
            'service (5).png', 'service (6).png']

        const slider = new CompareSlider('.compare-slider', {
            slideSelector: '.compare-slide',
            imagesArray: imagesArray
        })
    }
}

function advicesSectionInit() {
    let elem = document.querySelector('.advices')
    if (elem) {
        if (isDesktop) {
            let previousElem = elem.previousElementSibling;
            previousElem.style.paddingBottom = '25rem'
            elem.style.paddingTop = '5rem'
            gsap.timeline({
                scrollTrigger: {
                    trigger: previousElem,
                    start: '105% bottom',
                    end: "+=" + winHeight,
                    markers: true,
                    scrub: true,
                    onLeaveBack: () => {
                        previousElem.style.transform = 'unset'
                    }
                }
            }).fromTo(previousElem, { y: 0 }, { y: winHeight, ease: 'none' })
            previousElem.style.transform = 'unset'
        }
    }
}
function priceListPageInit() {
    if (document.querySelectorAll('.price-list-content').length > 0) {
        let accordeonClass = new Accordion('.price-list-item', {
            bodySelector: '.price-list-item__body',
            iconSelector: '.price-list-item__icon',
            titleSelector: '.price-list-item__title',
            hoverBgSelector: '.price-list-item__bg',
            wrapperSelector: '.price-list-content-wrapper',
            resetBufferTime: 201
        });
    }
}
function priceListSectionInit() {
    if (document.querySelector('.price-list')) {
        let accordeonClass = new Accordion('.price-list-item', {
            bodySelector: '.price-list-item__body',
            iconSelector: '.price-list-item__icon',
            titleSelector: '.price-list-item__title',
            hoverBgSelector: '.price-list-item__bg',
            wrapperSelector: '.price-list-content-wrapper',
            resetBufferTime: 201
        });
        tabsInit({
            tabSelector: '.tab',
            contentSelector: '.price-list-content',
            wrapperSelector: '.tab-container',
            parentElementSelector: '.price-list',
            onClick: (tab, content) => {
                setPriceListHeight()
                let activeAccordeon = accordeonClass.findActiveAccordion()
                if (activeAccordeon) {
                    accordeonClass.closeAccordion(activeAccordeon)
                }

                const wrapper = content.closest('.price-list-content-wrapper');
                let position;
                let ease;
                switch (tab.dataset.contentId) {
                    case '1':
                        position = '0%';
                        ease = "back.out(1.5)";
                        break;
                    case '2':
                        position = '-50%';
                        ease = "back.in(1.5)";
                        break;
                    case '3':
                        position = '-100%';
                        ease = "back.in(1.5)";
                        break;
                }
                // Применение анимации к wrapper
                gsap.timeline().to(wrapper, { x: position, ease: ease, duration: 1 });
            }
        });
    }
    function setPriceListHeight() {
        let priceListContentWrapper = document.querySelector(".price-list-content-wrapper")
        // врапперу ставим такую же высоту как у активного элемента
        priceListContentWrapper.style.height = document.querySelector('.price-list-content.active').getBoundingClientRect().height + 'px'
        setTimeout(() => {
            refreshAllAnimations()
        }, 1001);
    }
}
function udsAnimation() {
    let headerHeight = remToPx(10.6)
    let centerOffset = ((((winHeight - headerHeight) - remToPx(62)) / 2) + headerHeight)

    if (document.querySelector('.UDS-mockup')) {
        if (isDesktop) {
            gsap.timeline({
                scrollTrigger: {
                    trigger: '.UDS-mockup',
                    start: 'top ' + (centerOffset / winHeight * 100) + '%',
                    end: '+=' + remToPx(40),
                    pin: true,
                }
            })
        }
    }
}
function equipmentAnimation() {
    let equipmentSections = document.querySelectorAll('.equipment.equipment-animation')
    if (equipmentSections.length > 0) {
        if (isDesktop) {
            let headerHeight = remToPx(10.6)
            let centerOffset = ((((winHeight - headerHeight) - remToPx(80)) / 2) + headerHeight)
            equipmentSections.forEach(section => {
                let image = section.querySelector('.equipment-image')
                let containerHeight = section.querySelector('.equipment-info').getBoundingClientRect().height - remToPx(45)
                gsap.timeline({
                    scrollTrigger: {
                        trigger: image,
                        start: 'top ' + (centerOffset / winHeight * 100) + '%',
                        end: '+=' + containerHeight,
                        pin: true,
                        // markers: true,
                    }
                })
            })
        }
    }
}
function fixedTextAnimation() {
    let containers = ['.centered-text-container-1', '.centered-text-container-2']
    // если хотя бы один из контейнеров существует, то переменной задается значениe true
    let containersExist = containers.every(container => document.querySelector(container) !== null);
    if (!containersExist) return

    let elementGroups = [['.centered-text-1', '.centered-text-2']]
    setFixedText(containers, elementGroups)
}
function ourAdvantagesAnimation() {
    let containers = ['.centered-text-container-3', '.centered-text-container-4', '.centered-text-container-5']
    let containersExist = containers.every(container => document.querySelector(container) !== null);
    if (!containersExist) return

    let elementGroups = [['.centered-text-3', '.centered-text-4'], ['.centered-text-4', '.centered-text-5']]
    setFixedText(containers, elementGroups)
}
function setFixedText(containers, elementGroups) {
    let screensCount = containers.length;
    let parentElement = document.querySelector(containers[1]).parentElement
    parentElement.style.height = ((screensCount + 1) * 100) + 'vh'

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
            // markers: true,
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

function expertsSectionInit() {
    function expertsSliderInit() {
        const slider = new Swiper('.experts-slider', {
            slidesPerView: 'auto',
            speed: 700,
        })
        sliderIndicatorInit(slider)

        slider.on('slideChange', (e) => {
            console.log(e);

            if (e.activeIndex == slider.slides.length - 1) {
                slider.el.classList.add('last-slide')
            } else {
                slider.el.classList.remove('last-slide')
            }
        });
    }
    if (document.querySelector('.experts-slider')) {
        if (isMobile) {
            expertsSliderInit()
        }
    }
}

function fixedImageAnimation() {
    if (isMobile) {
        const imagesToPreload = ["first-image.png", "second-image.png", "third-image.png"];
        preloadImages(imagesToPreload);

        let backgroundElem = document.querySelector('.fixed-background')
        if (backgroundElem) {
            setTriggerOnElement('.one-screen-transparent-1', "first-image.png", backgroundElem)
        }

        let mastersBackgroundElem = document.querySelector('.master-fixed-background')
        if (mastersBackgroundElem) {
            setTriggerOnElement('.one-screen-transparent-2', "second-image.png", mastersBackgroundElem)
            setTriggerOnElement('.one-screen-transparent-3', "third-image.png", mastersBackgroundElem)
            setTriggerOnElement('.one-screen-transparent-4', "second-image.png", mastersBackgroundElem)
        }

    } else {
        let fixedWrappersPairs = [['.fixed-wrapper-2', 3], ['.fixed-wrapper-3', 3], ['.fixed-wrapper-4', 1.75]]
        fixedWrappersPairs.forEach(fixedWrapperPair => {
            if (!document.querySelector(fixedWrapperPair[0])) return
            setElementFixed(fixedWrapperPair[0], fixedWrapperPair[1])
        })
    }

}

function setElementFixed(selector, selfRelativeScrolls) {
    let elem = document.querySelector(selector)
    let container = elem.querySelector('.fixed-container')
    let containerHeight = container.getBoundingClientRect().height


    let endYPosition
    if (selfRelativeScrolls > 1) {
        endYPosition = (selfRelativeScrolls - 1) * 100 + "%"
    } else {
        endYPosition = '0'
    }

    // высчитывает процент от верха экрана для старт позиции чтобы элемент всегда был в центре экрана при скролле, вне зависимости от того какая у него высота
    let heightWithoutHeader = winHeight - remToPx(10.6);
    let centerOffset = (heightWithoutHeader - containerHeight) / 2;
    let percentageOffset = 100 - (centerOffset / winHeight * 100)

    gsap.timeline({
        scrollTrigger: {
            trigger: elem,
            start: "top " + percentageOffset + '%',
            end: "+=" + containerHeight * selfRelativeScrolls,
            scrub: true,
        }
    }).fromTo(container, { y: '-100%' }, { y: endYPosition, ease: 'none', }, 0)
}
function serviceSectionInit() {
    function servicesSliderInit() {
        const slider = new Swiper('.services-slider', {
            slidesPerView: 'auto',
            speed: 700,
        })
        sliderIndicatorInit(slider)
    }
    function servicesAnimationInit() {
        let tl2 = gsap.timeline({
            scrollTrigger: {
                trigger: '.services-slider',
                start: 'top 90%',
                end: 'bottom bottom',
                scrub: true,
                // markers: true,
            }
        })
        const elements = document.querySelector('.services-slider').querySelectorAll('.service');
        elements.forEach((elem, index) => {
            const reverseIndex = elements.length - 1 - index;
            if (reverseIndex > 1) {
                tl2.fromTo(elem, { y: 30 * reverseIndex }, { y: 0 }, 0.0125 * reverseIndex)
            }
        })
    }
    if (document.querySelector('.services-slider')) {
        if (isMobile) {
            servicesSliderInit()
        }
        if (isDesktop) {
            // servicesAnimationInit()
        }
    }
}

function faqInit() {
    if (document.querySelector('.faq')) {
        let heightOffset = isDesktop ? 7.2 : 8.8
        let accordeonClass = new Accordion('.accordion', {
            wrapperSelector: null,
            heightOffset: heightOffset,
        });
    }
}

function iconBtnAnimation() {
    document.querySelectorAll('.icon-btn').forEach(btn => {
        gsap.timeline({
            scrollTrigger: {
                trigger: btn,
                onEnter: () => {
                    let icon = btn.querySelector('.icon-btn__icon');
                    let background = btn.querySelector('.icon-btn__bg');
                    let text = btn.querySelector('.icon-btn__text');
                    tl = gsap.timeline().to(icon, {
                        x: (btn.clientWidth - remToPx(4)), scale: 0.8, duration: 1, rotate: '540deg', ease: "slow(0.7,0.7,false)"
                    }, 0)
                        .to(icon, { opacity: 0, duration: 0.05 }, 1)
                        .fromTo(background, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, transformOrigin: 'right', duration: 0.3 }, 1)
                        .to(text, { color: 'var(--white)', duration: 0.1 }, 1)
                        .to(background, { width: (btn.clientWidth + 'px'), duration: 0.1 }, 0)

                },
                once: true,
            }
        })
    })
    // if (isDesktop) {
    //     document.querySelectorAll('.icon-btn').forEach(btn => {
    //         let icon = btn.querySelector('.icon-btn__icon');
    //         let background = btn.querySelector('.icon-btn__bg');
    //         let text = btn.querySelector('.icon-btn__text');

    //         let tl = gsap.timeline()
    //         btn.addEventListener('mouseenter', throttle(() => {
    //             tl.killTweensOf(background)

    //             tl = gsap.timeline().to(icon, {
    //                 x: (btn.clientWidth - remToPx(4)), scale: 0.8, duration: 1, rotate: '540deg', ease: "slow(0.7,0.7,false)"
    //             }, 0)
    //                 .to(icon, { opacity: 0, duration: 0.05 }, 1)
    //                 .fromTo(background, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, transformOrigin: 'right', duration: 0.3 }, 1)
    //                 .to(text, { color: 'var(--white)', duration: 0.1 }, 1)
    //                 .to(background, { width: (btn.clientWidth + 'px'), duration: 0.1 }, 0)
    //         }, 1200))

    //         btn.addEventListener('mouseout', throttle(() => {
    //             tl.kill()
    //             tl = gsap.timeline().to(icon, { x: 0, rotate: 0, scale: 1, duration: 1, ease: "slow(0.7,0.7,false)" }, 0)
    //                 .to(icon, { opacity: 1, duration: 0.01 }, 0)
    //                 .to(background, { opacity: 0, scale: 0, transformOrigin: 'right', duration: 0.3 }, 0)
    //                 .to(text, { color: 'var(--green-900)', duration: 0.1 }, 0)
    //         }, 1200))
    //     })
    // }
}

function yandexMapsInit() {
    let zoomInitValue = isMobile ? 12 : 14
    ymaps.ready(init);
    function init() {
        let myMap = new ymaps.Map('map', {
            center: [54.989431, 73.337176],
            zoom: zoomInitValue,
            controls: ['geolocationControl', 'fullscreenControl', 'zoomControl'],
        }, {
            suppressMapOpenBlock: true
        });
        myMap.behaviors.disable('scrollZoom');


        let myPlacemark = new ymaps.Placemark([54.985581, 73.311039], {
            balloonContentBody: [
                `<div class="maps-title">Laser Vo</div>
                <div class="maps-address">г. Омск, ул. 70 лет Октября, 7</div>
                <a target='_blank' href="https://yandex.ru/maps/org/laser_vo/39594167357/?indoorLevel=1&ll=73.310846%2C54.985344&z=17" class="maps-link maps-link_small-gap">
                    <svg class='map-icon_small' width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.0002 1C5.13994 1 1.2002 4.93978 1.2002 9.79998C1.2002 12.2293 2.18448 14.4288 3.77643 16.0211C5.36878 17.6144 9.1202 19.92 9.34016 22.34C9.37319 22.7028 9.63589 23 10.0002 23C10.3645 23 10.6272 22.7028 10.6602 22.34C10.8802 19.92 14.6316 17.6144 16.224 16.0211C17.8159 14.4288 18.8002 12.2293 18.8002 9.79998C18.8002 4.93978 14.8604 1 10.0002 1Z" fill="url(#paint0_linear_1902_222)"/>
                        <path d="M10.0004 12.8807C11.7014 12.8807 13.0804 11.5017 13.0804 9.8007C13.0804 8.09964 11.7014 6.7207 10.0004 6.7207C8.29935 6.7207 6.92041 8.09964 6.92041 9.8007C6.92041 11.5017 8.29935 12.8807 10.0004 12.8807Z" fill="white"/>
                        <defs>
                            <linearGradient id="paint0_linear_1902_222" x1="10.0002" y1="1" x2="10.0002" y2="23" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#FF6122"/>
                                <stop offset="1" stop-color="#F22411"/>
                            </linearGradient>
                        </defs>
                    </svg>
                    <div class="maps-link__text maps-link__text_long">Посмотреть на яндекс картах</div>
                </a>
                `,
            ].join('')
        }, {
            iconLayout: 'default#image',
            iconImageHref: 'assets/mapPlacemark.svg',
        });
        let myPlacemark2 = new ymaps.Placemark([54.994796, 73.368934], {
            balloonContentBody: [
                `<div class="maps-title">Laser Vo</div>
                <div class="maps-address">г. Омск, ул. Тарская, 34</div>
                <a target='_blank' href="https://yandex.ru/maps/org/laser_vo/105190041944/?ll=73.368934%2C54.994799&z=14" class="maps-link maps-link_small-gap">
                    <svg class='map-icon_small' width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.0002 1C5.13994 1 1.2002 4.93978 1.2002 9.79998C1.2002 12.2293 2.18448 14.4288 3.77643 16.0211C5.36878 17.6144 9.1202 19.92 9.34016 22.34C9.37319 22.7028 9.63589 23 10.0002 23C10.3645 23 10.6272 22.7028 10.6602 22.34C10.8802 19.92 14.6316 17.6144 16.224 16.0211C17.8159 14.4288 18.8002 12.2293 18.8002 9.79998C18.8002 4.93978 14.8604 1 10.0002 1Z" fill="url(#paint0_linear_1902_222)"/>
                        <path d="M10.0004 12.8807C11.7014 12.8807 13.0804 11.5017 13.0804 9.8007C13.0804 8.09964 11.7014 6.7207 10.0004 6.7207C8.29935 6.7207 6.92041 8.09964 6.92041 9.8007C6.92041 11.5017 8.29935 12.8807 10.0004 12.8807Z" fill="white"/>
                        <defs>
                            <linearGradient id="paint0_linear_1902_222" x1="10.0002" y1="1" x2="10.0002" y2="23" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#FF6122"/>
                                <stop offset="1" stop-color="#F22411"/>
                            </linearGradient>
                        </defs>
                    </svg>
                    <div class="maps-link__text maps-link__text_long">Посмотреть на яндекс картах</div>
                </a>
                `,
            ].join('')
        }, {
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
    if (isDesktop) {
        let footer = document.querySelector('.footer');
        let container = document.querySelector('.footer-container');
        footer.style.height = container.getBoundingClientRect().height + remToPx(5) + 'px'
        let startPosition = 'top ' + (100 - (((footer.getBoundingClientRect().height) / winHeight) * 100)) + '%'
        let containerStartYPosition = '-100%'
        gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: startPosition,
                end: '+=' + container.getBoundingClientRect().height,
                scrub: true,
            }
        }).fromTo(container, { y: containerStartYPosition }, { y: '0', ease: 'none' }, 0)
    }
}

// функция которая не позволяет выполнять повтроно вызываемую функцию раньше чем пройдет delay
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