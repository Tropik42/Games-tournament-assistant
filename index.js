const axios = require('axios');
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

    // получить steamId
    const steamIdIndex = data.indexOf('STEAM_');
    const rawSteamId = data.slice(steamIdIndex, steamIdIndex + 30);
    const steamId = rawSteamId.replace(/<.*/, '');

    // получить винрейт
    const winRateIndex = data.indexOf('<dt>Доля побед</dt>', 0);
    const rawWinRate = data.slice(winRateIndex - 15, winRateIndex);
    const winRate = data.includes('Этот профиль скрыт') ? 'Профиль скрыт' : rawWinRate.replace(/.{0,6}>/, '').replace(/%<.*/, '');

    // получить таблицу активности
    const activityInfoListIndexStart = data.indexOf('player-activity-wrapper');
    const activityInfoListIndexEnd = data.indexOf('portable-show-player-friends-achievements-phone');
    console.log('activityInfoListIndexStart', activityInfoListIndexStart)
    console.log('activityInfoListIndexEnd', activityInfoListIndexEnd)
    const rawActivityList = data
        .slice(activityInfoListIndexStart, activityInfoListIndexEnd)
        .replace('player-activity-wrapper">', '')
        .replace('<div class=\'year-chart\'><div class=\'col labels\'><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></div>', '')
    console.log('rawActivityList', rawActivityList)

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

async function process() {
    const filePathRaw = await ask('Введи абсолютный путь к файлу с участниками: ')
    let filePath = filePathRaw.replace(/"/g, '')
    console.log('filePath', filePath)

    // Разбить путь на составные части
    const splitFilePath = filePath.split('\\')
    console.log('splitFilePath', splitFilePath)

    // Последний элемент пути к файлу
    let lastPathElement = splitFilePath[splitFilePath.length - 1];

    if (lastPathElement === 'Desktop') {
        throw new Error('Не хватает названия файла, последний эелемент пути - "Desktop"')
    }

    console.log('lastPathElement', lastPathElement)

    if (!lastPathElement.includes('.txt')) {
        filePath = `${filePath}.txt`
        lastPathElement = `${lastPathElement}.txt`
    }

    console.log('filePath', filePath)

    // Получить путь к рабочему столу
    const desktopPath = filePath.replace(`\\${lastPathElement}`, '\\')
    console.log('desktopPath', desktopPath)

    // Получить данные из файла с участниками
    const file = fs.readFileSync(path.resolve(filePath), 'utf-8');

    // Создать массив с командами
    const teams = file.split('dota2').filter(el => el !== '')
    console.log('teams', teams);

    // Создать путь для файла с конечной информацией
    // const desktopFilePath = path.resolve(test2, `index.txt`)
    const desktopFilePath = path.resolve(desktopPath, `index.txt`)

    // Создать файл с конечной информацией
    fs.writeFileSync(desktopFilePath, `Результат такой: \r\n`)

    for (let i = 0; i < teams.length; i++) {
        // Взять команду
        const team = teams[i]
        console.log('team', team)

        // Отделить список участников от информации о команде
        const teamSplit = team.split('Состав');
        console.log('teamSplit', teamSplit)

        // Записать в файл информацию о команде
        fs.appendFileSync(
            path.resolve(desktopFilePath),
            `\r\n ${teamSplit[0]}`
        )

        // Получить массив с участниками (оставить те строки, где есть https и убрать \r\n)
        const teamComposition = teamSplit[1].split('@').filter(el => el.includes('https://')).map(el => el.replace(/\r\n/g, ''))
        console.log('teamComposition', teamComposition)

        // for (let i = 0; i < teamComposition.length; i++) {
        //     //Получить участника
        //     const player = teamComposition[i];
        //     console.log('player', player);
        //
        //     // Отделить ФИО и ник от ссылки на дотабаф
        //     const linkRaw = player.split('https');
        //     console.log('linkRaw', linkRaw);
        //
        //     // Получить ссылку на дотабаф участника и где надо заменить www на ru
        //     const link = `https${linkRaw[linkRaw.length - 1].replace('www', 'ru')}`;
        //     console.log('link', link);
        //
        //     // Ожидание между запросами
        //     await sleep(500);
        //
        //     const {steamId, winRate} = await getDotabuffPlayerInfo(link);
        //
        //     fs.appendFileSync(
        //         path.resolve(desktopFilePath),
        //         `${player}, winRate: ${winRate} \r\n`
        //     )
        //
        //     console.log(steamId, winRate)
        // }
    }
}

// process().catch();

getDotabuffPlayerInfo('https://www.dotabuff.com/players/70388657').catch()