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
    };

    //добавляем перечисляемые стили
    let stringStyles = '';
    for (let style in objectStyles) {
        stringStyles += style + ": " + objectStyles[style] + '; ';
        tag.setAttribute('style', stringStyles);
    };

    //добавляем обработчики событий
    for (let event in objectEvents) {
        tag.addEventListener(event, objectEvents[event]);
    };

    //если есть необходимость - добавляем родиетльский элемент
    if (objectParentElement != null) {
        objectParentElement.appendChild(tag);
    };    

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
                let randomPassContainer = addTagElement('div', popupContent);
                    addTagElement('input', randomPassContainer, {'type': 'checkbox', 'id': 'randomPassword'}, {}, {'change': (event) => {
                        console.log(event.currentTarget.checked); // <-- далее это стереть
                        
                        if (event.currentTarget.checked) {
                            popupContent.children[3].style = 'display: none;'; //обращение к <label>Введите пароль</label>
                            popupContent.children[4].style = 'display: none;'; // обращение к <input>
                            //разблокировываем form с конфигурацией пароля
                            popupContent.children[5].style = '';
                        }
                        else {
                            popupContent.children[3].style = ''; //обращение к <label>Введите пароль</label>
                            popupContent.children[4].style = ''; // обращение к <input>
                            popupContent.children[5].style = 'display: none;';
                        }
                    }});
                    addTagElement('label', randomPassContainer, {'for': 'randomPassword', 'textContent': 'Случайный пароль'});

                addTagElement('label', popupContent, {'textContent': 'Введите пароль'});
                addTagElement('input', popupContent, {'type': 'text', 'id': 'popUpPass'});

                let passwordConfig = addTagElement('form', popupContent, {}, {'display': 'none'});
                    addTagElement('input', passwordConfig, {'type': 'checkbox', 'id': 'upperCase', 'value': 'upperCase'});
                    addTagElement('label', passwordConfig, {'for': 'upperCase', 'textContent': 'Верхний регистр'});
                    addTagElement('br', passwordConfig);
                    addTagElement('input', passwordConfig, {'type': 'checkbox', 'id': 'numbers', 'value': 'numbers'});
                    addTagElement('label', passwordConfig, {'for': 'numbers', 'textContent': 'Числа'});
                    addTagElement('br', passwordConfig);
                    addTagElement('input', passwordConfig, {'type': 'checkbox', 'id': 'specSymbols', 'value': 'specSymbols'});
                    addTagElement('label', passwordConfig, {'for': 'specSymbols', 'textContent': 'Специальные символы'});
                    addTagElement('br', passwordConfig);
                    addTagElement('input', passwordConfig, {'type': 'number', 'id': 'passwordLength', 'min': '3', 'max': '128', 'value': '12'});
                    addTagElement('label', passwordConfig, {'for': 'passwordLength', 'textContent': 'Длина пароля'});

                addTagElement('button', popupContent, {'textContent': 'Продолжить', 'id': 'popUpButton'}, {}, {'click': () => sendNewPass()});
                addTagElement('button', popupContent, {'textContent': 'Отмена'}, {}, {'click': () => popUpWindowShow(false)});
                break;
        }
    }
    else {
        popup.style.display = 'none';
    }    
}

const contextMenu = (elementID, type, coordX = '500px', coordY = '500px') => {
    if (document.getElementById("contextMenu") != null) {
        let globalContainer = document.getElementById("globalContainer");
        console.log('попытка удалить');
        globalContainer.removeChild(document.getElementById("contextMenu"));
    }
    let contextMenuContainer = addTagElement('div', document.getElementById('globalContainer'), {"id": "contextMenu"}, {'position': 'absolute','top': coordY+"px", 'left': coordX+"px", 'z-index': '99999'});
    addTagElement('button', contextMenuContainer, {'textContent': 'Удалить'}, {}, 
    {
        'click': () => {
            switch (type){
                case 'service':
                    console.log(`
                    Удаление сервиса
                    Название: ${elementID}
                    `);
                    deleteService(elementID);
                    break;
                case 'login':
                    console.log(`
                    Удаление логина и пароля
                    ID: ${elementID.slice(-1)}
                    `);
                    deletePass(elementID.slice(-1));
                    break;
            }
        }
    });
}

const getParentId = (elementID) => {
    return document.getElementById(elementID).parentNode.id 
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//АСИНХРОННЫЕ ФУНКЦИИ
async function sendNewService(){
    let response = await fetch('/newService', 
    {method: 'POST', body: document.getElementById('popUpText').value});
    const responseText = response.text();
    console.log(responseText);
    popUpWindowShow(false);
    sectionUpdate("serviceSection");
};

async function sendNewPass() {
    console.log('Отправка нового запроса');
    const stringLogin = document.getElementById('popUpLogin').value;
    let stringPassword = '';

    //генерация случайного пароля
    if (document.querySelector('#randomPassword').checked) {
        let stringSymbols = 'abcdefghijklmnopqrstuvwxyz';
        if (document.querySelector('#upperCase').checked) stringSymbols += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (document.querySelector('#numbers').checked) stringSymbols += '1234567890';
        if (document.querySelector('#specSymbols').checked) stringSymbols += ` !"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~`;
        let count = Number(document.querySelector('#passwordLength').value);
        console.log("Максимальное количество символов---", count);
        for (let i = 0; i < count; i += 1) {
            let random = Math.round(Math.random() * stringSymbols.length);
            console.log(random);
            stringPassword += stringSymbols[random];
        };
    }
    else {
        stringPassword = document.getElementById('popUpPass').value;
    };
    
    console.log("Сгенерированный пароль---", stringPassword);

    let response = await fetch('/newPass', 
    {
        method: 'POST', 
        body: lastChosenService + " " + stringLogin + " " + stringPassword
    });
    console.log(response.text());
    popUpWindowShow(false);
    sectionUpdate('loginSection');
};

async function deleteService(serviceName) {
    console.log("Отправляем запрос на удаление ветки");    
    let response = await fetch('/deleteService', 
    {method: 'POST', body: serviceName});
    console.log(response.text());
    sectionUpdate("serviceSection");
};

async function deletePass(loginID) {
    console.log("Отправляем запрос на удаление логина и пароля");
    let response = await fetch('/deleteValue', 
    {method: 'POST', body: loginID});
    console.log(await response.text());
    sectionUpdate('loginSection');
};

const sectionUpdate = (sectionName) => {
    let section = document.getElementById(sectionName);
    sectionClear(section);
    switch (sectionName) {
        case 'loginSection':
            getLogins(lastChosenService);
            console.log('Секция обновлена');
            break;
        case 'serviceSection':
            relaunch();
            console.log('Секция обновлена');
            break;
    };
};

//вызов секции
const serviceSectionSummon = (sectionName, elem, elemArray, buttonFunction) => {
    addTagElement('h3', elem, {'textContent': sectionName});
    if (elemArray.length === 0) {
        addTagElement('h4', elem, {'textContent': 'Пусто'}, {'textAlign': 'center'});
    }
    else {
        for (let i = 0; i < elemArray.length; i += 1) {
            addTagElement('button', elem, {'textContent': elemArray[i], 'id': elemArray[i]},{},
            {'click': (event) => {
                event.preventDefault();
                buttonFunction(event);
                lastChosenService = elemArray[i];
            },
            "contextmenu": (event) => {
                console.log('вызвано контекстное меню');
                console.log(event.target.id);
                event.preventDefault();
                event.stopPropagation();
                contextMenu(event.target.id, 'service', event.clientX, event.clientY);
            }
        }
        );
        };
    };
    addTagElement('button', elem, {'textContent': 'Добавить','id': 'buttonAdd'},{},{'click': (event) => {event.preventDefault(); popUpWindowShow(true, 'service');}});
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function relaunch() {
    let dbNamePromise = await fetch('/getDBName');
    fileURL = await dbNamePromise.text();
    serviceSectionSummon('Название', serviceSection, await getServices(fileURL), loginSectionSummon);
}

async function getServices(fileURL) {
    let response = await fetch(fileURL);
    const serverData = await response.json();
    const database = serverData['Services'];
    let serviceList = [];
    for (let prop in database){
        serviceList.push(prop);
    }
    return serviceList;
}

//функция вызова секции логинов
const loginSectionSummon = (event) => {
    sectionClear(loginSection);
    getLogins(event.target.id);
    lastChosenService = event.target.id;
}

async function getLogins(serviceName) {
    let response = await fetch(fileURL, {method: 'POST'});
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
    };

    addTagElement('button', loginSection, {'textContent': 'Добавить'}, {},
     {
        'click': (event) => {
            //без этой строки браузер пытается отправить запрос на сервак. В итоге имеем ошибку
            event.preventDefault();
            popUpWindowShow(true, 'pass');
            console.log(event.keyCode);
        }
} );
}

//конструктор формы, где будут выведены логин и пароль
const loginFormConstructor = (id, login, password) => {
    let form = addTagElement('form', loginSection, {'id': `form${id}`});

    addTagElement('label', form, {'textContent': `Логин: ${login}`});
    addTagElement('label', form, {'textContent': `ID: ${id}`});
    addTagElement('label', form, {'textContent': `Пароль: ${password}`, 'name': 'password'});
    addTagElement('button', form, {'textContent': 'Копировать'}, {}, 
        {"click": (e)=>{
            e.preventDefault(); //благодаря этой штуке браузер даже не пытается перейти по ссылке в этой кнопке
            navigator.clipboard.writeText(password);
    }});

    form.addEventListener("contextmenu", (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log(`
        Target: ${e.currentTarget.id}
        CoordX ${e.clientX}
        CoordY ${e.clientY}
        `);
        contextMenu(e.currentTarget.id, 'login', e.clientX, e.clientY);
    }, true);

};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//начало исполнения кода
let fileURL;
let lastChosenService;
const serviceSection = document.getElementById('serviceSection');
const loginSection = document.getElementById('loginSection');
document.addEventListener("contextmenu", 
event => 
{
    event.preventDefault(); 
    console.log(event.target);
    if (document.getElementById("contextMenu") != null) {
        let globalContainer = document.getElementById("globalContainer");
        console.log('попытка удалить');
        globalContainer.removeChild(document.getElementById("contextMenu"));
    }
});
document.addEventListener('click', event => {
    if (document.getElementById("contextMenu") != null) {
        let globalContainer = document.getElementById("globalContainer");
        console.log('попытка удалить');
        globalContainer.removeChild(document.getElementById("contextMenu"));
    }
});

popUpWindowShow(false);
relaunch(fileURL);