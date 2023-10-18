const Discord = require('discord.js');
const bot = new Discord.Client();
const messageReactionsMap = new Map();
const reactionThreshold = 5;

require('dotenv').config();

bot.on('ready', () => {
  console.log(`Bot has logged in as ${bot.user.tag}`);
});

const channelId = process.env.CHANNEL_ID // Replace with the desired channel ID

bot.on('message', msg => {
  if (msg.author.bot) return; // Ignore messages from the bot itself
  if (msg.channel.id === channelId) {
    const msgId = msg.id;
    messageReactionsMap.set(msgId, {
      messageId: msgId,
      proposal: msg.content.match(/proposal\s(\d+)/i)[0],
      checkMarkCount: 4,
      crossCount: 4,
      halted: false
    });
    console.log(`New message monitored: ${msgId}`);
    //Add a green check mark and red x reaction to the message.
    msg.react('✅');
    msg.react('❌');
  }
});

bot.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return; // Ignore messages from the bot itself
  if(reaction.emoji.name === '✅' || reaction.emoji.name === '❌') {
    const reactions = messageReactionsMap.get(reaction.message.id);
    const proposal = reactions.proposal;
    if(!reactions.halted){
      let reactionName = '';
      let count = 0;
      let message = '';
      if (reaction.emoji.name === '✅') {
        reactions.checkMarkCount++;
        reactionName = 'green check mark';
        count = reactions.checkMarkCount;
        message = `With the following owners voting in favor: **${proposal} passes:** `;
      } else {
        reactions.crossCount++;
        reactionName = 'cross mark';
        count = reactions.crossCount;
        message = `With the following owners voting against: **${proposal} fails:**`;
      }
      
      console.log(`A ${reactionName} reaction has been added to message: ${reaction.message.id}`);

      if(count >= reactionThreshold) {
        console.log(`Message: ${reaction.message.id} has crossed the reaction threshold with ${count} ${reactionName} reactions`);
        const channel = reaction.message.channel;
        const users = reaction.users.cache.filter(u => !u.bot).map(u => u.username);
        await channel.send(message + users.join(', '));
        reactions.halted = true;
      }
    }
  }
});

bot.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
});

bot.login(process.env.BOT_TOKEN);

