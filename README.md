# Priest Module
A versatile Discord bot module designed for a single user (@ThetaMTX), offering a variety of features ranging from games to utilities.

---

## Features

### 🏛️ General Commands
- **Help Command**: Provides a comprehensive explanation of all available commands in embed that can be "scroled" via buttons under the embed.
```
/help
```

### 🔢 Fun and Randomization
- **Based Level Calculator**: Takes the last two digits of the user's ID and uses "magic" to generate a number from 0 to 100.
```
/basedlvl
```


- **Random Emote Generator**: Creates a message containing a random set of emotes.
```
/mgenrandom
```

### ⏳ Time Management
- **Dynamic Time Converter**: A fast and customizable way to generate time strings in various formats, making it better than third-party tools.
```
/dyntime time[description of your time query] timechoice[1-7 display format options]
```

### 🛠️ Utilities
- **User Embed Info**: Debugging tool that generates detailed information about a user in an embed, saving time.
```
/embed user[user ID]
```

- **Voice Chat Mute**: Temporarily mutes a user in voice chat for a specified number of minutes. Automatically unmutes them afterward.
```
/mute user[user ID] minutes[duration in minutes]
```

- **Private List**: A placeholder feature for managing private lists. Database integration required to function fully.
```
/pvlist
```

- **Message delete**: A usefull command to delete set ammount of messages.
```
/mdelete [ammount of messages]
```

- **Sent messages via bot**: Sent a message to a recipient (recipient need to be on the same server, and have few roles enabled).
```
/smessage [recipient] [message here]
```

- **Bot status**: Change the bot status and message.
```
/bstat [Set a bot to the 4 possible statuses (online, idle, dnd, invisible)] [set the message here]
```


- **Data base**: See the database from the VPS (needs the correct discord id to use it :3).
```
/db [fetch me/fetchall]
```

- **Scan file**: Scan the file and send it to the virustotal website (max 25 MB)
```
/scabfile {attachment of the file}
```

### 🎮 Mini-Games
- **Snake Game**: A simple game where the user navigates an emote through a maze. The size of the maze is defined by the user.
```
/startgame input[3-8]
```

- **Leaderboard**: Displays a high score list for the Snake Game.
```
/leaderboard
```

### 🎨 Media Features
- **Random Anime Image**: Retrieves a random anime image (SFW or NSFW) based on specified tags.
```
/rimage tags[nsfw/sfw] tags[additional options]
```

- **4chan Image Scraper**: Fetches random pictures from the `/b` board of 4chan.
```
/4chan
```

- **Text-to-Emotes Converter**: Transforms regular text into emotes that resemble letters, perfect for creative messages.
```
/mmessage
```


---

## Notes
- **Database Dependency**: Some features, such as `/pvlist`, was resolved, although it is now reserved for a people with specific roles for the time being. the database is created only for priest module for master master repo it is needed to copy the db. as to how and when to do I imma say I dont know.
