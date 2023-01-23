const axios = require('axios');
const HTMLParser = require('node-html-parser');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {stdin: input, stdout: output} = require('process');

const rl = readline.createInterface({input, output});

// Задать вопросик
function ask(question) {
    return new Promise((resolve, reject) => {
        rl.question(question, (answer) => {
            resolve(answer);
            rl.close();

            return answer;
        });
    });
}

// если профиль скрыт, нужно выводить информацию о том что скрыт
async function getDotabuffPlayerInfo(link) {
    const {data} = await axios.get(link);
    // console.log(data)

    // const test = HTMLParser.valid(data)
    const test = HTMLParser.parse(data)
    const section = test.querySelectorAll('tr')

    const testSection = HTMLParser
        .parse(section)
        .structuredText
        .split(',')
        .map(el => el.match(/\d{4}-\d{2}-\d{2}/g))
        .filter(el => el !== null)
        .map(el => el[0])
    // console.dir(testSection.childNodes, {depth: null})


    // получить steamId
    const steamIdIndex = data.indexOf('STEAM_');
    const rawSteamId = data.slice(steamIdIndex, steamIdIndex + 30);
    const steamId = rawSteamId.replace(/<.*/, '');

    // получить винрейт
    const winRateIndex = data.indexOf('<dt>Доля побед</dt>', 0);
    const rawWinRate = data.slice(winRateIndex - 15, winRateIndex);
    const winRate = data.includes('Этот профиль скрыт') ? 'Профиль скрыт' : rawWinRate.replace(/.{0,6}>/, '').replace(/%<.*/, '');

    return {steamId, winRate}
}

function steamIdToAccountId(steamId)
{
    const args = steamId.split(':');
    // console.log('args', args)
    const Y = +args[1];
    // console.log('Y', Y)
    const Z = +args[2];
    // console.log('Z', Z)

    return (Z * 2) + Y;
}

// async function getWinRate(accountId) {
//     const config = {
//         method: 'get',
//         url: 'https://api.opendota.com/api/players/115668866/wl',
//         headers: {
//             'Authorization': 'Bearer 28991bf3-a5d7-4a8d-8f19-794c5948feb7'
//         },
//     };
//     const {data: {win, lose}} = await axios(config)
//     const winRate = (win * 100) / (win + lose)
//     console.log('winRate', winRate.toFixed(2))
// }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// async function process() {
//     const filePathRaw = await ask('Введи абсолютный путь к файлу с участниками: ')
//     const filePath = filePathRaw.replace(/"/g, '')
//
//     // Разбить путь на составные части
//     const test = filePath.split('\\')
//     console.log('test', test)
//
//     // Получить путь к рабочему столу
//     const test2 = filePath.replace(`\\${test[test.length-1]}`, '\\')
//     console.log('test2', test2)
//
//     // Получить данные из файла с участниками
//     const file = fs.readFileSync(path.resolve(filePath), 'utf-8');
//
//     // Создать массив с командами
//     const teams = file.split('dota2').filter(el => el !== '')
//     console.log('teams', teams);
//
//     // Создать путь для файла с конечной информацией
//     const desktopFilePath = path.resolve(test2, `index.txt`)
//     // const desktopFilePath = path.resolve(filePath, `index.txt`)
//
//     // Создать файл с конечной информацией
//     fs.writeFileSync(desktopFilePath, `Результат такой: \r\n`)
//
//     for (let i = 0; i < teams.length; i++) {
//         // Взять команду
//         const team = teams[i]
//         console.log('team', team)
//
//         // Отделить список участников от информации о команде
//         const teamSplit = team.split('Состав');
//         console.log('teamSplit', teamSplit)
//
//         // Записать в файл информацию о команде
//         fs.appendFileSync(
//             path.resolve(desktopFilePath),
//             `\r\n ${teamSplit[0]}`
//         )
//
//         // Получить массив с участниками (оставить те строки, где есть https и убрать \r\n)
//         const teamComposition = teamSplit[1].split('@').filter(el => el.includes('https://')).map(el => el.replace(/\r\n/g, ''))
//         console.log('teamComposition', teamComposition)
//
//         for (let i = 0; i < teamComposition.length; i++) {
//             //Получить участника
//             const player = teamComposition[i];
//             console.log('player', player);
//
//             // Отделить ФИО и ник от ссылки на дотабаф
//             const linkRaw = player.split('https');
//             console.log('linkRaw', linkRaw);
//
//             // Получить ссылку на дотабаф участника и где надо заменить www на ru
//             const link = `https${linkRaw[linkRaw.length - 1].replace('www', 'ru')}`;
//             console.log('link', link);
//
//             // Ожидание между запросами
//             await sleep(500);
//
//             const {steamId, winRate} = await getDotabuffPlayerInfo(link);
//
//             fs.appendFileSync(
//                 path.resolve(desktopFilePath),
//                 `${player}, winRate: ${winRate} \r\n`
//             )
//
//             console.log(steamId, winRate)
//         }
//     }
// }

// process().catch();

getDotabuffPlayerInfo('https://www.dotabuff.com/players/72312627/matches').catch()