//РАЗДЕЛ ОБЩИХ ФУНКЦИЙ
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//очистка секции
const sectionClear = (section) => {
    section.innerHTML = '';
}

//конструктор тегов
// 1) Tag name;
// 2) элемент, внутрь которого добавляем создаваемый элемент. Если не надо добавлять - ставим null
// 3) Объект аттрибутов. { <название тега>: <значение> }
// 4) Объект стилей. { <имя стилевого тега>: <значение> }
// 5) Добавление события и функции. { <тип события>: <callback функция передаваемая в событие> } 
const addTagElement = (stringTagName, objectParentElement = body, objectAttributes = {}, objectStyles = {}, objectEvents = {}) => {
    //создает элемент 
    let tag = document.createElement(stringTagName);
    //просматриваем переданный объект с аттрибутами
    for (let attribute in objectAttributes) {
        tag[attribute] = objectAttributes[attribute];
    }

    //добавляем перечисляемые стили
    let stringStyles = '';
    for (let style in objectStyles) {
        stringStyles += style + ": " + objectStyles[style] + '; ';
        tag.setAttribute('style', stringStyles);
    }

    //добавляем обработчики событий
    for (let event in objectEvents) {
        tag.addEventListener(event, objectEvents[event]);
    }

    //если есть необходимость - добавляем родиетльский элемент
    if (objectParentElement != null) {
        objectParentElement.appendChild(tag);
    }    

    //если понадобится этот тег в виде объекта в дальнейшем - функцция возвращет его.
    return tag;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const popUpWindowShow = (status, type = '') => {
    let popup = document.getElementById('b-popup');
    let popupContent = document.getElementById('b-popup-content');
    popupContent.innerHTML = ``;

    if (status) {
        popup.style.display = 'unset';
        switch (type){
            case 'service':
                addTagElement('label', popupContent, {'textContent': 'Введите название'});
                addTagElement('input', popupContent, {'type': 'text', 'id': 'popUpText'});
                addTagElement('button', popupContent, {'textContent': 'Продолжить', 'id': 'popUpButton'}, {}, {'click': () => sendNewService()});
                addTagElement('button', popupContent, {'textContent': 'Отмена'}, {}, {'click': () => popUpWindowShow(false)});
                break;
            case 'pass':
                addTagElement('label', popupContent, {'textContent': 'Введите логин'});
                addTagElement('input', popupContent, {'type': 'text', 'id': 'popUpLogin'});
                addTagElement('label', popupContent, {'textContent': 'Введите пароль'});
                addTagElement('input', popupContent, {'type': 'text', 'id': 'popUpPass'});
                addTagElement('button', popupContent, {'textContent': 'Продолжить', 'id': 'popUpButton'}, {}, {'click': () => sendNewPass()});
                addTagElement('button', popupContent, {'textContent': 'Отмена'}, {}, {'click': () => popUpWindowShow(false)});
                break;
        }
    }
    else {
        popup.style.display = 'none';
    }    
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//АСИНХРОННЫЕ ФУНКЦИИ
async function sendNewService(){
    let response = await fetch('/newService', 
    {method: 'POST', body: document.getElementById('popUpText').value});
    const responseText = response.text();
    console.log(responseText);
    popUpWindowShow(false);
    sectionUpdate("serviceSection");
}

async function sendNewPass() {
    console.log('Отправка нового запроса');
    const stringLogin = document.getElementById('popUpLogin').value;
    const stringPassword = document.getElementById('popUpPass').value;
    let response = await fetch('/newPass', {method: 'POST', body: lastChosenService + " " + stringLogin + " " + stringPassword});
    const responseText = response.text();
    console.log(responseText);
    popUpWindowShow(false);
    sectionUpdate('loginSection');
}

const sectionUpdate = (sectionName) => {
    let section = document.getElementById(sectionName);
    sectionClear(section);
    switch (sectionName) {
        case 'loginSection':
            getLogins(lastChosenService);
            console.log('Секция обновлена');
            break;
        case 'serviceSection':
            serviceSectionSummon('Название', serviceSection, serviceList, loginSectionSummon);
            console.log('Секция обновлена');
            break;
    }
}

//вызов секции
async function serviceSectionSummon(sectionName, elem, elemArray, buttonFunction){
    addTagElement('h3', elem, {'textContent': sectionName});
    if (elemArray.length === 0) {
        addTagElement('h4', elem, {'textContent': 'Пусто'}, {'textAlign': 'center'});
    }
    else {
        for (let i = 0; i < elemArray.length; i += 1) {
            addTagElement('button', elem, {'textContent': elemArray[i], 'id': elemArray[i]},{},{'click': (event) => {
                buttonFunction(event);
                lastChosenService = elemArray[i];
            }});
        }
    }
    addTagElement('button', elem, {'textContent': 'Добавить','id': 'buttonAdd'},{},{'click': () => popUpWindowShow(true, 'service')});
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function launch() {
    const url = fileURL + ".json";
    let response = await fetch(url);
    const serverData = await response.json();
    const database = serverData['Services'];

    for (let prop in database){
        serviceList.push(prop);
    }

    serviceSectionSummon('Название', serviceSection, serviceList, loginSectionSummon);
}

//функция вызова секции логинов
const loginSectionSummon = (event) => {
    sectionClear(loginSection);
    getLogins(event.target.id);
    lastChosenService = event.target.id;
}

async function getLogins(serviceName) {
    const url = fileURL + ".json";
    let response = await fetch(url, {method: 'POST'});
    const data = await response.json();
    const database = data['Services'];    
    const loginList = database[serviceName];

    //если приходит список логинов - выводим его. Если приходит пустой массив - выводим надпись "Пусто"
    if (loginList.length !== 0) {
        for (let prop of loginList){
            loginFormConstructor(prop['id'], prop['login'], prop['password']);
        }
    }
    else {
        addTagElement('h3', loginSection, {'textContent': "Пусто"});
    }

    let addButtonField = addTagElement('fieldset', addTagElement('form', loginSection));
    addTagElement('button', addButtonField, {'textContent': 'Добавить'}, {}, {'click': (event) => {
        //без этой строки браузер пытается отправить запрос на сервак. В итоге имеем ошибку
        event.preventDefault();
        popUpWindowShow(true, 'pass');
    }} );
}

//конструктор формы, где будут выведены логин и пароль
const loginFormConstructor = (id, login, password) => {
    let form = addTagElement('form', loginSection, {'id': `form${id}`}, {});
    let fieldset = addTagElement('fieldset', form);

    addTagElement('label', fieldset, {'textContent': `Логин: ${login}`});
    addTagElement('label', fieldset, {'textContent': `ID: ${id}`});
    addTagElement('label', fieldset, {'textContent': `Пароль: ${password}`, 'name': 'password'});
    addTagElement('input', fieldset, {'type': 'submit', 'value': 'Копировать'});

    form.addEventListener('submit', (e) => {
        e.preventDefault(); //благодаря этой штуке браузер даже не пытается перейти по ссылке в этой кнопке
        navigator.clipboard.writeText(password);
    });

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//начало исполнения кода
const fileURL = 'testDataBase';
let serviceList = [];
let lastChosenService;
const serviceSection = document.getElementById('serviceSection');
const loginSection = document.getElementById('loginSection');

popUpWindowShow(false);
launch(fileURL);