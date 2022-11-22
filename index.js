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
async function getDotabuffPlayerInfo() {
    const {data} = await axios.get('https://ru.dotabuff.com/players/115668866');
    if (data.includes('Этот профиль скрыт')) {
        return 'hidden';
    }

    // console.log(data)

    // получить steamId
    const steamIdIndex = data.indexOf('STEAM_');
    const rawSteamId = data.slice(steamIdIndex, steamIdIndex + 30);
    const steamId = rawSteamId.replace(/<.*/, '');

    // получить винрейт
    const winRateIndex = data.indexOf('<dt>Доля побед</dt>', 0);
    const rawWinRate = data.slice(winRateIndex - 15, winRateIndex);
    const winRate = rawWinRate.replace(/.{0,6}>/, '').replace(/%<.*/, '');

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

async function getWinRate(accountId) {
    const config = {
        method: 'get',
        url: 'https://api.opendota.com/api/players/115668866/wl',
        headers: {
            'Authorization': 'Bearer 28991bf3-a5d7-4a8d-8f19-794c5948feb7'
        },
    };
    const {data: {win, lose}} = await axios(config)
    const winRate = (win * 100) / (win + lose)
    console.log('winRate', winRate.toFixed(2))
}

async function process() {
    // console.log('Привет, Лера!')
    const filePath = await ask('Введи абсолютный путь к файлу с участниками: ')
    const file = fs.readFileSync(path.resolve(filePath.replace(/"/g, '')), 'utf-8');

    const commands = file.split('dota2')
    // console.log('commands', commands);
    const desktopFilePath = path.resolve('C:\\Users\\Tropik\\Desktop', `index.txt`)
    fs.writeFileSync(desktopFilePath,
        `Предложенное решение: \r\n`
    )
    for (let i = 0; i < commands.length; i++) {
        console.log(commands[i])
        fs.appendFileSync( // вставить описание метода
            path.resolve(desktopFilePath),
            commands[i]
        )
    }

    // const {steamId, winRate} = await getDotabuffPlayerInfo();
    // if (steamId === 'hidden') {
    //     console.log('Профиль скрыт')
    // }
    // const accountId = steamIdToAccountId(steamId);
    // console.log('accountId', accountId);
    // console.log('winRate', winRate)
}

process().catch();
