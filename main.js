class TabChanger {
    selectors = {
        linkSelector: 'li',
        sectionSelector: 'section',
        hideSelector: 'visually-hidden'
    }

    constructor() {
        this.linksElements = document.querySelectorAll(this.selectors.linkSelector)
        this.sectionsElements = document.querySelectorAll(this.selectors.sectionSelector)

        this.init()
    }

    init() {
        this.linksElements.forEach((link, index) => {
            link.addEventListener('click', (event) => {
                this.showSection(index)
            })
        })
    }

    showSection(index) {
        this.sectionsElements.forEach(sec => {
            sec.classList.add(this.selectors.hideSelector)
        })

        this.sectionsElements[index].classList.remove(this.selectors.hideSelector)
    }
}

class CardCreator {
    selectors = {
        card: 'gallery__card',
        title: 'card__title',
        description: 'card__description',
        cardLocation: 'card__location',
        locationTitle: 'card__location>p',
        locationImg: 'card__location>img',
        phone: 'card__phone'
    }

    constructor({ id, title, description, locationTitle, locationImg, phone }) {
        this.id = id
        this.title = title
        this.description = description
        this.locationTitle = locationTitle
        this.locationImg = locationImg
        this.phone = phone
    }

    create() {
        const card = document.createElement('article')
        card.classList.add(this.selectors.card)
        card.id = this.id

        const button = document.createElement('button')
        button.type = 'button'
        button.classList.add('card__button')

        const title = document.createElement('h2')
        title.classList.add(this.selectors.title)
        title.textContent = this.title

        const description = document.createElement('h3')
        description.classList.add(this.selectors.description)
        description.textContent = this.description

        const cardLocation = document.createElement('div')
        cardLocation.classList.add(this.selectors.cardLocation)

        const locationImg = document.createElement('img')
        locationImg.src = this.locationImg
        locationImg.alt = this.title

        const locationTitle = document.createElement('p')
        locationTitle.textContent = this.locationTitle

        cardLocation.append(locationImg, locationTitle)

        const phone = document.createElement('a')
        phone.href = `tel:${this.phone}`
        phone.textContent = `+${this.phone}`
        phone.classList.add(this.selectors.phone)

        card.append(button, title, description, cardLocation, phone)

        return card
    }
}

class StorageManager {
    static getCards() {
        const cards = localStorage.getItem('cards')

        if (!cards) {
            return [];
        }

        return JSON.parse(cards)
    }

    static saveCards(cards) {
        localStorage.setItem('cards', JSON.stringify(cards))
    }

    static addCard(data) {
        const cards = StorageManager.getCards()
        cards.push(data)
        StorageManager.saveCards(cards)
    }

    static renderCards() {
        const galleryContainer = document.querySelector('.gallery__container')
        const galleryTitle = document.querySelector('.gallery__title')
        galleryContainer.innerHTML = ''

        const cards = StorageManager.getCards()
        cards.forEach(cardData => {
            const card = new CardCreator(cardData)

            galleryContainer.append(card.create())
        })

        if (cards.length == 0) {
            galleryTitle.innerHTML = 'Активные потеряшки не найдены'
        }

        else {
            galleryTitle.innerHTML = 'Все потеряшки'
        }
    }

    static deleteCard(id) {
        const cards = StorageManager.getCards()

        const updated = cards.filter(card => card.id !== id)
        StorageManager.saveCards(updated)
        StorageManager.renderCards()
    }
}

class FormChecker {
    selectors = {
        title: '#input__name',
        description: '#input__description',
        location: '#input__location',
        image: '#input__image',
        phone: '#input__phone'
    }

    constructor(formElement) {
        this.form = formElement;

        this.titleInput = this.form.querySelector(this.selectors.title);
        this.descriptionInput = this.form.querySelector(this.selectors.description);
        this.locationInput = this.form.querySelector(this.selectors.location);
        this.phoneInput = this.form.querySelector(this.selectors.phone);
        this.imageInput = this.form.querySelector(this.selectors.image);

        this.data = null;
    }

    async validation() {
        let title = this.titleInput.value.trim();
        let description = this.descriptionInput.value.trim();
        let locationTitle = this.locationInput.value.trim();

        let phone = this.phoneInput.value.trim();
        phone = phone.replace(/\D/g, "");
        this.phoneInput.value = phone;

        let locationImg = null;
        if (this.imageInput.files.length > 0) {
            locationImg = await this.readImage(this.imageInput.files[0]);
        }

        this.data = {
            id: Date.now(),
            title,
            description,
            locationTitle,
            locationImg,
            phone,
        };

        return true;
    }

    readImage(file) {
        return new Promise((resolve) => {

            const reader = new FileReader();

            reader.onload = () => {
                resolve(reader.result);
            };

            reader.readAsDataURL(file);

        });
    }

    getData() {
        return this.data;
    }

    reset() {
        this.form.reset();
    }

}
// Рендер карточек при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    StorageManager.renderCards()
})
// Функция показа уведомления
function showAlert(alert) {
    alert.classList.remove('visually-hidden')

    setTimeout(() => {
        alert.classList.add('show')
    }, 10)

    setTimeout(() => {
        alert.classList.remove('show')

        setTimeout(() => {
            alert.classList.add('visually-hidden')
        }, 400)
    }, 2000)
    
}
// Логика удаления карточки
const galleryContainer = document.querySelector('.gallery__container')
galleryContainer.addEventListener('click', (event) => {
    if (!event.target.classList.contains('card__button')) {
        return;
    }

    const card = event.target.closest('.gallery__card')
    const id = Number(card.id)

    if(confirm('Удалить объявление?')) {
        StorageManager.deleteCard(id)
    }
})
// Создание карточки через форму
const createForm = document.querySelector('.create__form')
const createAlert = document.querySelector('.create__alert')
createForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    const checker = new FormChecker(createForm)

    if (!(await checker.validation())) {
        return;
    }

    const cardData = checker.getData()

    StorageManager.addCard(cardData)
    StorageManager.renderCards()

    showAlert(createAlert)

    checker.reset()
})
// Отправка обращения
const contactForm = document.querySelector('.contact__form')
const contactAlert = document.querySelector('.contact__alert')
contactForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const checker = new FormChecker(contactForm)
    checker.reset()

    showAlert(contactAlert)
})

new TabChanger()