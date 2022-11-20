const axios = require('axios');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');

const rl = readline.createInterface({ input, output });

rl.question('What do you think of Node.js? ', (answer) => {
    // TODO: Log the answer in a database
    console.log(
        `Thank you for your valuable feedback: ${answer}`
    );

    rl.close();
});

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
    // const data = await axios.get(
    //     'https://api.opendota.com/api/players/115668866/wl',
    //     {
    //         headers: {'X-Requested-With': 'XMLHttpRequest'}
    //     }
    // );
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
    // const answer = await rl.question('What is your favorite food? ');
    // console.log(`Oh, so your favorite food is ${answer}`);

    const {steamId, winRate} = await getDotabuffPlayerInfo();
    if (steamId === 'hidden') {
        console.log('Профиль скрыт')
    }
    const accountId = steamIdToAccountId(steamId);
    console.log('accountId', accountId);
    console.log('winRate', winRate)
}

process().catch();
