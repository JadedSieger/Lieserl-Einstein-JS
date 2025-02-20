require("dotenv").config();
const axios = require("axios");
const cleverbot = require("cleverbot-free");
const cheerio = require("cheerio");
const { Client, GatewayIntentBits, ActivityType, Events, SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const config = require("./config.json");
const gtts = require('gtts');
const fs = require('fs');
const path = require('path');


//commands fs
const commands = new Map();

const commandFiles = fs.readdirSync(path.join(__dirname,'commands')).filter(file => file.endsWith('.js'));
commandFiles.forEach(file =>{
  const command = require(`./commands/${file}`);
  commands.set(command.name, command);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const characterName = "Lieserl Albert Einstein";


client.on("ready", () => {
  console.log("Ready, lieserl-v.098");
  client.user.setActivity('AE Database',{type: ActivityType.Watching});

});

let conversation = [];

client.on("messageCreate", async (message) => {
  if (message.author.bot) return false;

  /*if(commands.has(commandName)){
    const command = commands.get(commandName);

    try{
      await command.execute(message);
    } catch (error){
      console.error("Error executing.", error);
      message.channel.send("There was an error somewhere in the process.")
    }
  } else{
    message.channel.send("I don't think that exists, please try again.");
  }*/

  if (message.mentions.users.has(client.user.id)) {
    if (!message.content.includes('"')) {
      let text = message.content
        .substring(message.content.indexOf(">") + 1)
        .trim();
      console.log(message.content);

      try {
        const botResponse = await cleverbot(text, conversation);
        conversation.push(text);
        conversation.push(botResponse);

        
        // Generate TTS for cleverbot's response
        const audioFilePath = `audio_store/response_${message.id}.mp3`;
        const tts = new gtts(botResponse, 'en');

        tts.save(audioFilePath, async (err) => {
          if (err) {
            console.error("Error generating TTS:", err);
            message.channel.send(botResponse);
            return;
          }

          console.log(`Audio saved at ${audioFilePath}`);

          const voiceChannel = message.member?.voice.channel;
          if (voiceChannel) {
            // Join the VC and play the audio
            const connection = joinVoiceChannel({
              channelId: voiceChannel.id,
              guildId: message.guild.id,
              adapterCreator: message.guild.voiceAdapterCreator,
            });

            connection.on('debug', console.log);  // Log debug messages
            connection.on('error', (error) => {
              console.error("Connection error:", error);
              message.channel.send("Failed to join the voice channel.");
            });

            // Log when the connection is established
            connection.on('stateChange', (oldState, newState) => {
              console.log(`Connection state changed from ${oldState.status} to ${newState.status}`);
            });

            message.channel.send(botResponse);
            const player = createAudioPlayer();
            const resource = createAudioResource(audioFilePath);

            player.play(resource);
            connection.subscribe(player);

            player.on("idle", () => {
              connection.destroy();
            });
            player.on('error', (error) => {
              console.error('Player error:', error);
            });

            player.on('playing', () => {
              console.log("Audio is playing.");
            });
          } else {
            // User not in VC, send text response
            message.channel.send(botResponse);
          }
        });
      } catch (error) {
        console.error("Error handling message:", error.message);
        message.channel.send("An error occurred while processing your request.");
      }
    } else {
      let text = message.content
        .substring(message.content.indexOf(">") + 1)
        .trim();
      console.log(text);

      try {
        const phrases = extractPhrases(text);
        const query = constructQuery(phrases);
        const result = await searchFandom(query);

        if (result && result.link) {
          const fandomContent = await fetchFandomContent(result.link);
          const characterResponse = customizeResponse(fandomContent, characterName);


          message.channel.send(characterResponse);

          // Generate TTS for the Fandom query response
          const audioFilePath = `audio_store/fandom_response_${message.id}.mp3`;
          const tts = new gtts(characterResponse, 'en');

          tts.save(audioFilePath, async (err) => {
            if (err) {
              console.error("Error generating TTS:", err);
              message.channel.send(characterResponse);
              return;
            }

            console.log(`Audio saved at ${audioFilePath}`);

            const voiceChannel = message.member?.voice.channel;
            if (voiceChannel) {
              // Join the VC and play the Fandom response audio
              const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
              });

              const player = createAudioPlayer();
              const resource = createAudioResource(audioFilePath);

              player.play(resource);
              connection.subscribe(player);

              player.on("idle", () => {
                connection.destroy();
              });

              player.on('error', (error) => {
                console.error('Player error:', error);
              });

              player.on('playing', () => {
                console.log("Fandom audio is playing.");
                
              });
            } else {
              // User not in VC, send text response
              message.channel.send(characterResponse);
            }
          });
        } else {
          message.channel.send("I couldn't find information on that.");
        }
      } catch (error) {
        console.error("Error:", error.message);
        message.channel.send(
          "Is the AE database down again? Tesla, I need your help.",
        );
      }
    }
  }
});

/*client.on(Events.InteractionCreate, interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log(interaction);
});*/

function extractPhrases(text) {
  return text.match(/"([^"]*)"/g) || [];
}

function constructQuery(phrases) {
  const cleanedPhrases = phrases.map((phrase) => phrase.slice(1, -1).trim());
  console.log(cleanedPhrases);
  return cleanedPhrases.join(" ");
}

async function searchFandom(searchTerm) {
  try {
    const url = `https://honkai-impact-3rd-archives.fandom.com/wiki/Special:Search?query=${encodeURIComponent(
      searchTerm,
    )}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const searchResults = [];
    $(".unified-search__result__header a").each((index, element) => {
      const title = $(element).text().trim();
      const link = $(element).attr("href");
      searchResults.push({ title, link });
    });

    return searchResults.length > 0 ? searchResults[0] : null;
  } catch (error) {
    console.error("Fandom search error:", error.message);
    console.error("HTML content:", error.response?.data || "N/A");
    throw error;
  }
}

async function fetchFandomContent(link) {
  try {
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);
    const content = $(".mw-parser-output p").text().trim();
    return content;
  } catch (error) {
    console.error("Fandom content fetch error:", error.message);
    throw error;
  }
}

function customizeResponse(response, characterName) {
  // First, truncate the response to the max length if needed
  const maxLength = 2000;
  if (response.length > maxLength) {
    // Find the last period within the limit
    const lastPeriodIndex = response.lastIndexOf(".", maxLength);
    response =
      lastPeriodIndex !== -1
        ? response.slice(0, lastPeriodIndex + 1)
        : response.slice(0, maxLength);
  }

  // Apply word/phrase replacements
  response = response.replace(/cleverbot/i, characterName);
  response += "\n- Einstein's Wisdom!"; // Add the quote after the response.
  response = response.replace(/Boss/i, "Welt");
  response = response.replace(/hello/i, "Greetings, Captain!");
  response = response.replace(/sorry/i, "My apologies, Captain.");
  response = response.replace(/thanks/i, "Thank you, Captain!");
  response = response.replace(
    /I don't know/i,
    "I'm uncertain, Captain. The mysteries of the universe elude me."
  );

  // Add line breaks after periods, but check if it goes beyond maxLength
  response = response.replace(/\./g, ".\n");
  
  // Ensure response doesn't exceed the max length after adding line breaks
  if (response.length > maxLength) {
    response = response.slice(0, maxLength);
  }

  return response;
}


client.login(config.token);
