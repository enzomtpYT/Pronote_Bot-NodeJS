
# Pronote_Bot-NodeJS

  

Pronote_Bot-NodeJS is a discord bot that fetch Pronote infos (like homeworks and timetables)

  

## Installation


Using git :

  

```bash
git clone https://github.com/enzomtpYT/Pronote_Bot-NodeJS.git
```

  

## Usage



### Configure the bot


  In config.json

```json
{
    "pronoteurl": "YOUR_PRONOTE_URL",
    "discord": {
        "discordtoken": "YOUR_DISCORD_TOKEN",
        "appID": "YOUR_DISCORD_APP_ID",
        "sendmenu": true,
        "menuchannel": "CHANNEL_TO_SEND_MENU"
    },
    "group": {
        "1": {
            "username": "USERNAME_FOR_GROUP1",
            "password": "PASSWORD_FOR_GROUP1",
            "homeworks": "CHANNEL_TO_SEND_HOMEWORKS_FOR_GROUP1",
            "timetables": "CHANNEL_TO_SEND_TIMETABLES_FOR_GROUP1"
        },
        "2": {
            "username": "USERNAME_FOR_GROUP2",
            "password": "PASSWORD_FOR_GROUP2",
            "homeworks": "CHANNEL_TO_SEND_HOMEWORKS_FOR_GROUP2",
            "timetables": "CHANNEL_TO_SEND_TIMETABLES_FOR_GROUP2"
        }
    }
}
```

### Start the bot

  In the bot folder open a terminal and do :
```batch
node index.js
```

### Use the bot
Commands :

 - [x]  Timetables ( With cancelled classes )
 - [ ]  Homeworks
 
 Auto messages (DM or Channel) :
 
 - [ ]  Timetables ( With cancelled classes ) every morning
 - [ ]  Homeworks every afternoon

## License

[MIT](https://pastebin.com/raw/21JuM9kU)