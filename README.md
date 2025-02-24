# Lieserl-Einstein-JS
 Lieserl Einstein provides Cleverbot functionality as well as Webscraping functions for topics related to Honkai Impact 3rd. Uses gTTS to generate TTS response and
 discord.js/voice for connecting to the VC the User is in to answer.

### Requirements
- latest version of node.js
- latest version of discord.js
- cleverbot-free API (npm-js)
- axios and cheerio
- dotenv
- Visual Studio Code (Optional)

### Installation
1. Installing Dependecies

   -`npm i` if you have a package.json file or `npm i discord.js cleverbot-free cheerio axios dotenv fs html-to-text`
3. Setting up Variables
 - Make your own `.env` file with the variables:
  - bot_token
  - prefix

### Note: an .env file must look like this;
```
prefix = prefix
bot_token = bot_token
```

This is incredibly helpful for making your projects secure, especially when using hosting, or ***uploading your random shenanigans on github*** *(Yes, I'm staring at myself.)*
