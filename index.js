async function mmain(){

  //Importation des lib
  const pronote = require('@dorian-eydoux/pronote-api');
  const { SlashCommandBuilder } = require('discord.js');
  const fs = require('fs');
  const c = require('ansi-colors');
  const { Client, GatewayIntentBits } = require('discord.js');
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  const { REST, Routes } = require('discord.js');
  const { EmbedBuilder } = require('discord.js');
  const CronJob = require('cron').CronJob;

  // Fonction de logs
  function logger(txt) {
    var year = (new Date()).getFullYear();
    var month = (new Date()).getMonth();
    var day = (new Date()).getDate();
    var hours = (new Date()).getHours();
    var minutes = (new Date()).getMinutes();
    var seconds = (new Date()).getSeconds();
    if (typeof txt == "string") {
      logs = `[${year}-${month}-${day} ${hours}h${minutes}m${seconds}s] > ` + txt;
    } else {
      logger("JSON dans la prochaine ligne : ")
      logs = `[${year}-${month}-${day} ${hours}h${minutes}m${seconds}s] > ` + JSON.stringify(txt);
    }
    fs.appendFileSync("./logs/logs/latest.txt", logs + "\n")
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
      logs = `[${year}-${month}-${day} ${hours}h${minutes}m${seconds}s] > ` + txt;
    } else {
      logs = `[${year}-${month}-${day} ${hours}h${minutes}m${seconds}s] > ` + JSON.stringify(txt);
    }
    fs.appendFileSync("./logs/errors/latest.txt", logs + "\n")
    console.error(logs)
  }

  // Function to send messages
  async function dscsend(channel, msg){
    if (msg.content) {
      logger(`Sending ${msg.content} to ${channel}`)
    } else {
      logger(`Sending ${JSON.stringify(msg)} to ${channel}`)
    }
    client.channels.cache.get(channel).send(msg)
  }

  // Check if logs file exists and rename it
  if (fs.existsSync('./logs/logs/latest.txt')) {
    fs.stat('./logs/logs/latest.txt', (err, stats) => {
      if(err) {
          throw err;
      }
      tt = stats.ctimeMs
      fs.rename('./logs/logs/latest.txt', `./logs/logs/${new Date(tt).getFullYear()}-${new Date(tt).getMonth()}-${new Date(tt).getDate()} ${new Date(tt).getHours()}h${new Date(tt).getMinutes()}m${new Date(tt).getSeconds()}s.txt`, function(err) {
        if ( err ) console.log('ERROR: ' + err);
      });
  })}

  // Check if errors file exists and rename it
  if (fs.existsSync('./logs/logs/latest.txt')) {
    fs.stat('./logs/logs/latest.txt', (err, stats) => {
      if(err) {
          throw err;
      }
      tt = stats.ctimeMs
      fs.rename('./logs/logs/latest.txt', `./logs/logs/${new Date(tt).getFullYear()}-${new Date(tt).getMonth()}-${new Date(tt).getDate()} ${new Date(tt).getHours()}h${new Date(tt).getMinutes()}m${new Date(tt).getSeconds()}s.txt`, function(err) {
        if ( err ) console.log('ERROR: ' + err);
      });
  })}

  // Importation config / Init
  logger("Pronote Bot JS V0.5.1")
  logger("Importation de la config")
  let rawconfig = fs.readFileSync('config.json');
  let config = JSON.parse(rawconfig);
  session1 = ""
  session2 = ""

  // Check if data file exists
  if (!(fs.existsSync('data.json'))) {
    fs.writeFileSync('data.json', '{ "ids" : [] }')
  }
  let rawdata = fs.readFileSync('data.json');
  let data = JSON.parse(rawdata);

  // Fonction login
  async function login(grp) {
    const session = await pronote.login(config.pronoteurl, config.group[grp].username, config.group[grp].password);
    logger("Pronote connecté en tant que : " + session.user.name)
    return session
  }

  // Fonction qui permet d'obtenir l'emplois du temps
  async function gettimetables(grp) {
    if (grp == "1") {
      session = session1
    } else if (grp == "2") {
      session = session2
    }
    logger("Obtention du l'emploi du temps en tant que : " + session.user.name)
    timetablesgot = JSON.parse(JSON.stringify(await session.timetable()))
    logger(`JSON obtenu de l'emplois du temps : \n ${JSON.stringify(timetablesgot)}`)
    return timetablesgot
  }

  // Fonction qui permet d'obtenir les devoirs
  async function gethomeworks(grp) {
    if (grp == "1") {
      session = session1
    } else if (grp == "2") {
      session = session2
    }
    logger("Obtention des devoirs en tant que : " + session.user.name)
    homeworksgot = JSON.parse(JSON.stringify(await session.homeworks()))
    logger(`JSON obtenu des devoirs : \n ${JSON.stringify(homeworksgot)}`)
    return homeworksgot
  }

  // Fonction qui permet d'obtenir le menu
  async function getmenu() {
    session = session2
    logger("Obtention du menu en tant que : " + session.user.name)
    fromd = new Date();
    fromd.setDate(fromd.getDate() - 1);
    menugot = JSON.parse(JSON.stringify(await session.menu(from = fromd)))
    logger(`JSON obtenu du menu : \n ${JSON.stringify(menugot)}`)
    return menugot
  }

  // Register les sessions
  session1 = await login("1")
  session2 = await login("2")
  session1.setKeepAlive(true);
  session2.setKeepAlive(true);

  // On ready Bot
  client.on('ready', async () => {
    logger(`Bot connecté en tant que : ${client.user.tag}!`)

    // Schedule task for the menu
    if (config.discord.sendmenu = true) {
      new CronJob(
        '0 45 7 * * 1-5',
        async function() {
          client.user.setStatus("online");
          menujson = await getmenu()
          const menuembed = new EmbedBuilder()
  	      .setColor(0x0099FF)
  	      .setTitle('Menu Du Jour')
          try {
            index = 0
            menujson[0].meals[0].forEach(element => {
              str = ''
              element.forEach(element =>{
                str += element.name + '\n'
              })
              if (index == 0){
                now = "Entrée"
              } else if (index == 1){
                now = "Viandes"
              } else if (index == 2){
                now = "Féculents"
              } else if (index == 3){
                now = "Laitages"
              } else if (index == 4){
                now = "Desserts"
              }
              menuembed.addFields({ name: now, value: str, inline: true })
              index += 1
            })
          } catch {
            td1 = new Date();
            td1.setDate(td1.getDate() - 1);
            await dscsend(config.discord.menuchannel, {content: `Aucun json pour le menu reçu <t:${Math.floor(td1.getTime()/1000)}>`})
          }
          await dscsend(config.discord.menuchannel, { embeds: [menuembed] })
          client.user.setPresence({ activities: [{ name: 'enzomtpyt.github.io' }], status: 'idle' });
        },
        null,
        true,
        'Europe/Paris'
      );
    }

    // Schedule task for "edt"
    new CronJob(
      '0 45 7 * * 1-5',
      async function() {
        for (let groupe = 1; groupe < 3; groupe++) {
          lasttimes = 0
          ttjson = await gettimetables(groupe)
          ttjson.forEach(async element => {
            if (element.isCancelled == false && element.isDetention == false && element.isAway == false) {
              if (new Date(element.from).getTime()/1000 - lasttimes >= 53400) {
                await dscsend(config.group[groupe].timetables, { content: `Cours pour le <t:${new Date(element.from).getTime()/1000}:D> : ` })
              }
                const emebededs = new EmbedBuilder()
                .setColor(hexstrtohexint(element.color))
                .setTitle(element.subject)
                .setDescription(`Salle : ${element.room} \nAvec : ${element.teacher} \nA Distance : ${truetovrai(element.remoteLesson)} \nDe : <t:${new Date(element.from).getTime()/1000}> Jusqu'à : <t:${new Date(element.to).getTime()/1000}>`)

                await dscsend(config.group[groupe].timetables, { embeds: [emebededs] })
                lasttimes = new Date(element.to).getTime()/1000
            }
          });
        }
      },
      null,
      true,
      'Europe/Paris'
    );

    // Schedule task for "Devoirs"
    new CronJob(
      '0 45 15 * * 0-5',
      async function() {
        for (let groupe = 1; groupe < 3; groupe++) {
          await dscsend(config.group[groupe].homeworks, { content: `Envoi des devoirs pour le groupe ${groupe}` })
          hwjson = await gethomeworks(groupe)
          hwjson.forEach(async element => {
            if (element.files[0]){
              urls = ""
              element.files.forEach(element => {
                urls += `[${element.name}](${element.url})\n`
              })
            }
            const emebededs = new EmbedBuilder()
            .setColor(hexstrtohexint(element.color))
            .setTitle(element.subject)
            .setDescription(`Description : ${element.description} \nA rendre pour le : <t:${new Date(element.for).getTime()/1000}:D> \nDonné le : <t:${new Date(element.givenAt).getTime()/1000}:D>`)
            if (element.files[0]){
              emebededs.addFields({ name: "Fichiers : ", value: urls, inline: false })
            }

            await dscsend(config.group[groupe].homeworks, { embeds: [emebededs] })
          });
        }
      },
      null,
      true,
      'Europe/Paris'
    );
  });

  // Code a exec en fonction des commandes
  client.on('interactionCreate', async interaction => {
    client.user.setStatus("online");

    // Verifie si slash commande
    if (!interaction.isChatInputCommand()) return;

    // Commande "edt"
    if (interaction.commandName === 'edt') {
      lasttimes = 0
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
        ttjson.forEach(element => {
          if (element.isCancelled == false && element.isDetention == false && element.isAway == false) {
            if (new Date(element.from).getTime()/1000 - lasttimes >= 53400) {
              interaction.channel.send({ content: `Cours pour le <t:${new Date(element.from).getTime()/1000}:D> : ` })
            }
              const emebededs = new EmbedBuilder()
  	          .setColor(hexstrtohexint(element.color))
  	          .setTitle(element.subject)
  	          .setDescription(`Salle : ${element.room} \nAvec : ${element.teacher} \nA Distance : ${truetovrai(element.remoteLesson)} \nDe : <t:${new Date(element.from).getTime()/1000}> Jusqu'à : <t:${new Date(element.to).getTime()/1000}>`)

              interaction.channel.send({ embeds: [emebededs] });
              lasttimes = new Date(element.to).getTime()/1000
          }
        });
        dont == 0
      }
    }

      // Commande "devoirs"
      if (interaction.commandName === 'devoirs') {
        lasttimes = 0
        dont = 0
        try {
          opt = interaction.options._hoistedOptions[0].value
        } catch {
          interaction.reply({ content: 'Veuillez choisir un groupe !', ephemeral: true })
          dont = 1
        }
        if ( dont == !1 ){
          await interaction.reply({ content: `Envoi des devoirs pour le groupe ${interaction.options._hoistedOptions[0].value}` });
          hwjson = await gethomeworks(interaction.options._hoistedOptions[0].value)
          hwjson.forEach(element => {
            if (element.files[0]){
              urls = ""
              element.files.forEach(element => {
                urls += `[${element.name}](${element.url})\n`
              })
            }
            const emebededs = new EmbedBuilder()
            .setColor(hexstrtohexint(element.color))
            .setTitle(element.subject)
            .setDescription(`Description : ${element.description} \nA rendre pour le : <t:${new Date(element.for).getTime()/1000}:D> \nDonné le : <t:${new Date(element.givenAt).getTime()/1000}:D>`)
            if (element.files[0]){
              emebededs.addFields({ name: "Fichiers : ", value: urls, inline: false })
            }

            interaction.channel.send({ embeds: [emebededs] });
          });
          dont == 0
        }
      }

      if (interaction.commandName === 'menu') {
        await interaction.reply({ content: `Envoi du Menu` });
        menujson = await getmenu()
        const menuembed = new EmbedBuilder()
  	    .setColor(0x0099FF)
  	    .setTitle('Menu Du Jour')
        try {
          index = 0
          menujson[0].meals[0].forEach(element => {
            str = ''
            element.forEach(element =>{
              str += element.name + '\n'
            })
            if (index == 0){
              now = "Entrée"
            } else if (index == 1){
              now = "Viandes"
            } else if (index == 2){
              now = "Féculents"
            } else if (index == 3){
              now = "Laitages"
            } else if (index == 4){
              now = "Desserts"
            }
            menuembed.addFields({ name: now, value: str, inline: true })
            index += 1
          })
        } catch {
          td1 = new Date();
          td1.setDate(td1.getDate() - 1);
          interaction.channel.send({content: `Aucun json reçu <t:${Math.floor(td1.getTime()/1000)}>`})
        }
        interaction.channel.send({ embeds: [menuembed] });
      }
      client.user.setPresence({ activities: [{ name: 'enzomtpyt.github.io' }], status: 'idle' });
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
    },
    {
      name: 'devoirs',
      description: 'Envoye les devoirs',
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
    },
    {
      name: 'menu',
      description: 'Envoye le menu',
    }
  ];

  // Refresh les commandes a discord
  const rest = new REST({ version: '10' }).setToken(config.discord.discordtoken);
  (async () => {
    try {
      logger('Started refreshing application (/) commands.');

      await rest.put(Routes.applicationCommands(config.discord.appID), { body: commands });

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

}
mmain()