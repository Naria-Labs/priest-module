# Priest Module
A versatile Discord bot module designed for a single user (@ThetaMTX), offering a variety of features ranging from games to utilities.

---

## Features

### 🏛️ General Commands
- **Help Command**: Provides a comprehensive explanation of all available commands.
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
- **Database Dependency**: Some features, such as `/pvlist`, require database integration for full functionality that will be implemented in this year copium.
