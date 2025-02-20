require("dotenv").config();
const axios = require("axios");
const cleverbot = require("cleverbot-free");
const cheerio = require("cheerio");
const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
let server;

const token = process.env.token;
const apiKey = process.env.apiKey;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

const characterName = "Lieserl Albert Einstein";

client.on("ready", () => {
  console.log("Lieserl is Ready");
  
});
let conversation = [];

client.on("messageCreate", async (message) => {
  if (message.author.bot) return false;

  if (message.mentions.users.has(client.user.id)) {
    if (!message.content.includes('"')) {
      let text = message.content
        .substring(message.content.indexOf(">") + 1)
        .trim();
      console.log(message.content);
      cleverbot(text, conversation).then((res) => {
        conversation.push(text);
        conversation.push(res);
        message.channel.send(res);
      });
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
          const characterResponse = customizeResponse(
            fandomContent,
            characterName,
          );
          message.channel.send(characterResponse);
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
  response = response.replace(/cleverbot/i, characterName);
  response += "\n- Einstein's Wisdom!";
  response = response.replace(/Boss/i, "Welt");
  response = response.replace(/hello/i, "Greetings, Captain!");
  response = response.replace(/sorry/i, "My apologies, Captain.");
  response = response.replace(/thanks/i, "Thank you, Captain!");
  response = response.replace(
    /I don't know/i,
    "I'm uncertain, Captain. The mysteries of the universe elude me.",
  );

  const maxLength = 2000;
  if (response.length > maxLength) {
    // Find the last period within the limit
    const lastPeriodIndex = response.lastIndexOf(".", maxLength);

    // If a period is found, truncate at that point; otherwise, just truncate
    response =
      lastPeriodIndex !== -1
        ? response.slice(0, lastPeriodIndex + 1)
        : response.slice(0, maxLength);
    response = response.replace(/\./g, ".\n"); // Add line breaks after periods
  }

  return response;
}
module.exports = client;
client.login(token);