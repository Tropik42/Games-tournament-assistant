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
    // console.log('Привет, Лера!')
    const filePathRaw = await ask('Введи абсолютный путь к файлу с участниками: ')
    const filePath = filePathRaw.replace(/"/g, '')

    const test = filePath.split('\\')
    console.log('test', test)

    const test2 = filePath.replace(`\\${test[test.length-1]}`, '\\')
    console.log('test2', test2)

    const file = fs.readFileSync(path.resolve(filePath), 'utf-8');

    const teams = file.split('dota2').filter(el => el !== '')
    console.log('teams', teams);


    const desktopFilePath = path.resolve(test2, `index.txt`)
    // const desktopFilePath = path.resolve(filePath, `index.txt`)

    fs.writeFileSync(desktopFilePath, `Результат такой: \r\n`)

    for (let i = 0; i < teams.length; i++) {
        const team = teams[i]
        console.log('team', team)

        const teamSplit = team.split('Состав');
        console.log('teamSplit', teamSplit)

        fs.appendFileSync(
            path.resolve(desktopFilePath),
            `\r\n ${teamSplit[0]}`
        )

        const teamComposition = teamSplit[1].split('@').filter(el => el.includes('https://')).map(el => el.replace(/\r\n/g, ''))
        console.log('teamComposition', teamComposition)

        for (let i = 0; i < teamComposition.length; i++) {
            const player = teamComposition[i];
            console.log('player', player);

            const linkRaw = player.split('https');
            console.log('linkRaw', linkRaw);
            const link = `https${linkRaw[linkRaw.length - 1].replace('www', 'ru')}`;
            console.log('link', link);

            await sleep(500);

            const {steamId, winRate} = await getDotabuffPlayerInfo(link);

            fs.appendFileSync(
                path.resolve(desktopFilePath),
                `${player}, winRate: ${winRate} \r\n`
            )

            console.log(steamId, winRate)
        }
    }
}

process().catch();
