const http = require('http');
const fs = require('fs');
const PORT = 3000;

//описываем взаимодействие с базой данных
//пока просто json. В перспективе можно и MySQL реализовать

const readJSON = (filePath, format = "utf-8") => {
    return JSON.parse(fs.readFileSync(filePath, format));
}

const rewriteJSON = (database, fileName = 'testDatabase.json') => {
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
}

const addNewService = (database, serviceName) => {
    console.log(`
    ---------------------------------
    Добавление нового сервиса
    Service Name: ${serviceName}
    ---------------------------------
    `);
    database['Services'][serviceName] = [];
}

//добавить акк в БД
const addValue = (database, serviceName, accInfo) => {
    database["Services"][serviceName].push(accInfo);
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




//блок кода отвечающий за тестирование функций
(function(){
}())





//инициализация сервера, обработка запросов
http.createServer((request,response) => {
    console.log(`
    --------------------------------------
    Получен запрос: ${request.url}
    Поиск по пути: ${request.url.slice(1)}
    `);
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

        case '/newService':
            let serviceName = '';
            request.on('data', chunk => {
                serviceName += chunk;
            });
            request.on('end', () => {
                console.log(serviceName);
                response.end('Новый сервис добавлен');
                const database = readJSON('testDatabase.json');
                addNewService(database, serviceName);
                //rewriteJSON(database);
            });
            break;

        case '/newPass':
            console.log('Добавление нового логина и пароля');
            const buffers = [];
            for await(const chunk of request) {
                buffers.push(chunk);
            }
            const data = JSON.parse(Buffer.concat(buffers).toString());
            console.log(`Логин: ${data.login} Пароль: ${data.pass}`);
            response.end("Данные успешно получены");
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