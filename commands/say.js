const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Repeats what you say')
		.addStringOption(option => 
			option.setName('message')
				.setDescription('The message to repeat')
				.setRequired(false)), // The input is optional

	async execute(interaction) {
		// Get the optional input from the sla sh command
		const inputMessage = interaction.options.getString('message');

		if (!inputMessage) {
			// If no input is provided, reply with a default message
			await interaction.reply('You didn’t provide a message to repeat!');
		} else {
			// Repeat the provided message
			await interaction.reply(inputMessage);
		}
	},

	// Compatibility for message-based commands
	executeMessageCommand(message, args) {
		if (args.length === 0) {
			return message.channel.send("You need to provide a message.");
		}

		// Join the arguments into a single message and send it
		const inputMessage = args.join(' ');
		message.channel.send(inputMessage);
	},
};
