//Importation des lib
const pronote = require('@dorian-eydoux/pronote-api');
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const c = require('ansi-colors');
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { REST, Routes } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

// Fonction de logs
function logger(txt) {
  var year = (new Date()).getFullYear();
  var month = (new Date()).getMonth();
  var day = (new Date()).getDate();
  var hours = (new Date()).getHours();
  var minutes = (new Date()).getMinutes();
  var seconds = (new Date()).getSeconds();
  if (typeof txt == "string") {
    logs = `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}] ` + txt;
  } else {
    logger("JSON dans la prochaine ligne : ")
    logs = `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}] ` + JSON.stringify(txt);
  }
  fs.appendFileSync("./logs/logs/logs.txt", logs + "\n")
  console.log(logs)
}

// Fonction de logs d'erreurs
function errlogger(txt) {
  var year = (new Date()).getFullYear();
  var month = (new Date()).getMonth();
  var day = (new Date()).getDate();
  var hours = (new Date()).getHours();
  var minutes = (new Date()).getMinutes();
  var seconds = (new Date()).getSeconds();
  if (typeof txt == "string") {
    logs = `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}] ` + txt;
  } else {
    logs = `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}] ` + JSON.stringify(txt);
  }
  fs.appendFileSync("./logs/errors/errors.txt", logs + "\n")
  console.error(logs)
}

// Check if logs file exists and rename it
if (fs.existsSync('./logs/logs/logs.txt')) {
  fs.stat('./logs/logs/logs.txt', (err, stats) => {
    if(err) {
        throw err;
    }
    tt = stats.ctimeMs
    fs.rename('./logs/logs/logs.txt', `./logs/logs/${new Date(tt).getFullYear()}-${new Date(tt).getMonth()}-${new Date(tt).getDate()} ${new Date(tt).getHours()}.${new Date(tt).getMinutes()}.${new Date(tt).getSeconds()}.txt`, function(err) {
      if ( err ) console.log('ERROR: ' + err);
    });
})}

// Check if errors file exists and rename it
if (fs.existsSync('./logs/logs/errors.txt')) {
  fs.stat('./logs/logs/errors.txt', (err, stats) => {
    if(err) {
        throw err;
    }
    tt = stats.ctimeMs
    fs.rename('./logs/logs/errors.txt', `./logs/logs/${new Date(tt).getFullYear()}-${new Date(tt).getMonth()}-${new Date(tt).getDate()} ${new Date(tt).getHours()}.${new Date(tt).getMinutes()}.${new Date(tt).getSeconds()}.txt`, function(err) {
      if ( err ) console.log('ERROR: ' + err);
    });
})}

// Importation config / Init
logger("Pronote Bot JS V0.1")
logger("Importation de la config")
let rawconfig = fs.readFileSync('config.json');
let config = JSON.parse(rawconfig);

// On ready Bot
client.on('ready', async () => {
  logger(`Bot connecté en tant que : ${client.user.tag}!`)
});

// Code a exec en fonction des commandes
client.on('interactionCreate', async interaction => {

  // Verifie si slash commande
  if (!interaction.isChatInputCommand()) return;

  // Commande "edt"
  if (interaction.commandName === 'edt') {
    dont = 0
    try {
      opt = interaction.options._hoistedOptions[0].value
    } catch {
      interaction.reply({ content: 'Veuillez choisir un groupe !', ephemeral: true })
      dont = 1
    }
    if ( dont == !1 ){
      await interaction.reply({ content: `Envoi de l\'emploi du temps du groupe ${interaction.options._hoistedOptions[0].value}` });
      ttjson = await gettimetables(interaction.options._hoistedOptions[0].value)
      ttjson.forEach(async element => {
        if (element.isCancelled == false || element.isDetention == false || element.isAway == false) {
          const emebededs = new EmbedBuilder()
	        .setColor(hexstrtohexint(element.color))
	        .setTitle(element.subject)
	        .setDescription(`Salle : ${element.room} \nAvec : ${element.teacher} \n A Distance : ${truetovrai(element.remoteLesson)} \nDe : <t:${new Date(element.from).getTime()/1000}> Jusqu'à : <t:${new Date(element.to).getTime()/1000}>`)

          await interaction.channel.send({ embeds: [emebededs] });
      }
      });
      dont == 0
    }
  }

});

// Définitions des commandes
const commands = [
  {
    name: 'edt',
    description: 'Envoye l\'emploi du temps',
    options: [{
      name: "groupe",
      description: "Dans quel groupe tu est ?",
      type: 3,
      choices: [
        {
          name: "1",
          value: "1",
        },
        {
          name: "2",
          value: "2",
        }
      ],
    }]
  }
];

// Refresh les commandes a discord
const rest = new REST({ version: '10' }).setToken(config.discord.discordtoken);
(async () => {
  try {
    logger('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands('952940413088583751'), { body: commands });

    logger('Successfully reloaded application (/) commands.');
  } catch (error) {
    errlogger(error);
  }
})();

// Fonction conversion hex string en hex int
function hexstrtohexint(hexStr) {
  return Number(`0x${hexStr.substr(1)}`);
}

function truetovrai(inp){
  if (inp == true) { return "Oui" } else if (inp == false) {return "Non"}
}

// Fonction login
async function login(grp) {
  const session = await pronote.login(config.pronoteurl, config.group[grp].username, config.group[grp].password);
  logger("Bot connecté en tant que : " + session.user.name)
  return session
}

// Fonction qui permet d'obtenir l'emplois du temps
async function gettimetables(grp) {
  session = await login(grp)
  logger("Obtention du l'emploi du temps en tant que : " + session.user.name)
  timetablesgot = JSON.parse(JSON.stringify(await session.timetable()))
  return timetablesgot
}

async function gethomeworks(grp) {
  session = await login(grp)
  logger("Obtention des devoirs en tant que : " + session.user.name)
  homeworksgot = JSON.parse(JSON.stringify(await session.homeworks()))
  return homeworksgot
}

async function getmenu(grp) {
  session = await login(grp)
  logger("Obtention du menu en tant que : " + session.user.name)
  menugot = JSON.parse(JSON.stringify(await session.menu()))
  return menugot
}

async function main() {
  client.login(config.discord.discordtoken);
}

function smain() {
  main().catch(err => {
    if (err.code == pronote.errors.WRONG_CREDENTIALS.code) {
      errlogger(c.red('Mauvais identifiants'));
      smain()
    } else if (err.code == 'ENOTFOUND' || err.code == 'ECONNRESET' || err.syscall == "getaddrinfo") {
      errlogger(c.red('Pas de connexion internet !'));
      smain()
    } else if (err.code == "UND_ERR_CONNECT_TIMEOUT") {
      errlogger(c.red('Time Out!'));
      smain()
    } else {
      errlogger(err);
      errlogger("Code d'erreur : " + err.code)
    }
  })
}
smain()