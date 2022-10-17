const http = require('http');
const fs = require('fs');
const PORT = 5000;
const databaseFile = 'DataBase.json';

//описываем взаимодействие с базой данных
//пока просто json. В перспективе можно и MySQL реализовать

const readJSON = (filePath = databaseFile, format = "utf-8") => {
    try {
        return JSON.parse(fs.readFileSync(filePath, format));
    }
    catch {
        console.log("Словили ошибку при запуске. Отсутствует файл-хранилище.");
        fs.writeFileSync('DataBase.json', JSON.stringify({"Services": {}}));
        console.log("Создан новый файл-хранилище");
        return JSON.parse(fs.readFileSync(filePath, format));
    }
}

const rewriteJSON = (database, fileName = databaseFile) => {
    fs.writeFileSync(fileName, JSON.stringify(database), (err) => {
        if (err) throw err;
        console.log('Data written to file ' + fileName);
    });
}

const loginList = (database) => {
    console.log('-------------------------------');
    console.log(database["Services"]);
    console.log('-------------------------------');
    return database["Services"];
}

//функция переиндексации БД
const reindex = (database) => {
    let count = 0;
    for (let property in database["Services"]){
        for (let i = 0; i < database["Services"][property].length; i += 1){
            database["Services"][property][i]["id"] = count++;
        }
    }
    rewriteJSON(database);
}

//добавить акк в БД
const addValue = (database, serviceName, login, password) => {
    //{"id": -1, "login": <string>, "password": <string>}
    database["Services"][serviceName].push({"id": -1, "login": login, "password": password});
    reindex(database);
}

//удалить акк из БД
const deleteValue = (database, id) => {
    for (let property in database["Services"]){
        for (let i = 0; i < database["Services"][property].length; i += 1){
            if (database["Services"][property][i]['id'] === id) {
                database["Services"][property].splice(i, 1);
            }
        }
    }
    reindex(database);
}

const addNewService = (database, serviceName) => {
    console.log(`
    ---------------------------------
    Добавление нового сервиса
    Service Name: ${serviceName}
    ---------------------------------
    `);
    database['Services'][serviceName] = [];
    rewriteJSON(database);
}

const deleteService = (database, serviceName) => {
    console.log(`
    -----------------------------
    Удаление сервиса
    Service Name: ${serviceName}
    -----------------------------
    `);
    delete database['Services'][serviceName];
    reindex(database);
}




//блок кода отвечающий за тестирование функций
(function(){
    const database = readJSON();
    //Пробный вывод БД
    loginList(database);
}())





//инициализация сервера, обработка запросов
http.createServer((request,response) => {

    console.log(`
    --------------------------------------
    Получен запрос: ${request.url}
    Поиск по пути: ${request.url.slice(1)}
    `);

    let incomeData = "";
    const database = readJSON(databaseFile);
    switch (request.url) {
        case '/':
            fs.readFile('index.html', (error, data) => {              
                if(error){
                          
                    response.statusCode = 404;
                    response.end("Resourse not found!");
                }   
                else{
                    response.end(data);
                }
            });
            break;
        
        case '/getDBName':
            console.log(`Запрос названия файла БД`);
            response.end(databaseFile);
            console.log(databaseFile);
            break;

        case '/newService':
            request.on('data', chunk => {
                incomeData += chunk;
            });
            request.on('end', () => {
                console.log(incomeData);
                response.end('Новый сервис добавлен');
                addNewService(database, incomeData);
            });
            break;

        case '/newPass':
            console.log('Добавление нового логина и пароля');
            request.on('data', chunk => {
                incomeData += chunk;
            });
            request.on('end', () => {
                console.log('Received data: ' + incomeData);
                response.end('Новый логин и пароль получен');
                const wordArray = incomeData.split(' ');
                addValue(database, wordArray[0], wordArray[1], wordArray[2]);
            });
            break;

        case '/deleteService':
            console.log("Удаление ветки сервиса...");
            request.on('data', chunk => incomeData += chunk);
            request.on('end', () => {
                console.log(incomeData);
                deleteService(database, incomeData);
                response.end("Ответ получен. Удаление сервиса");
            });
            break;

        case '/deleteValue':
            console.log("Удаление логина и пароля из БД");
            request.on('data', chunk => incomeData += chunk);
            request.on('end', () => {
                console.log(incomeData);
                deleteValue(database, Number(incomeData));
                response.end("Ответ получен. Удаление логина и пароля");
            });            
            break;

        default:
            fs.readFile(request.url.slice(1), (error, data) => {              
                if(error){
                          
                    response.statusCode = 404;
                    response.end("Resourse not found!");
                }   
                else{
                    console.log(data);
                    response.end(data);
                }
            });
    }
}).listen(PORT);