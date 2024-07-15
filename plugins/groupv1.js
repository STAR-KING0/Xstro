const { updateProfilePicture, /**parsedJid,*/ bot, send, Config, tlang, sleep, /**getAdmin, */ prefix, grouppattern } = require('../lib');
bot(
  {
    pattern: 'join',
    info: 'Join a group via an invitation link',
    type: 'whatsapp',
    fromMe: true,
  },
  async (message, replyText) => {
    try {
      if (message.reply_message && message.reply_message.groupInvite) {
        const groupInviteResponse = await message.bot.groupAcceptInviteV4(message.chat, message.reply_message.msg);
        if (groupInviteResponse && groupInviteResponse.includes('joined to:')) {
          return await send(message, '*Joined Group*', {}, '', message);
        }
      }

      const inviteText = replyText ? replyText : message.reply_text;
      const groupLinkMatch = inviteText.match(grouppattern);

      if (!groupLinkMatch) {
        return await message.reply('*Please provide a valid group link*');
      }

      const inviteCode = groupLinkMatch[0].split('https://chat.whatsapp.com/')[1].trim();

      await message.bot
        .groupAcceptInvite(inviteCode)
        .then(() => send(message, '*Joined Group*', {}, '', message))
        .catch(() => message.send('*Unable to join, group ID not found*'));
    } catch (error) {
      await message.error(error + '\n\nCommand: join', error, '*Unable to join, group ID not found, sorry*');
    }
  }
);

bot(
  {
    pattern: 'newgc',
    info: 'Create New Group',
    type: 'whatsapp',
  },
  async (message, groupName, { bot: commandPrefix, cmdName }) => {
    try {
      if (!message.isCreator) {
        return message.reply(tlang().owner);
      }

      if (!groupName) {
        return await message.reply(`*Provide a name to create a new group!*\nExample: ${commandPrefix + cmdName} My Group @user1,user2,...`);
      }

      let groupNameInput = groupName;

      if (groupNameInput.toLowerCase() === 'info') {
        return await message.send('*_Write Group Name and Tag A Contact._*');
      }

      let participants = [message.sender];

      if (message.quoted) {
        participants.push(message.quoted.sender);
      }

      if (message.mentionedJid && message.mentionedJid[0]) {
        participants.push(...message.mentionedJid);
        try {
          message.mentionedJid.forEach(mentionedUser => {
            const username = mentionedUser.split('@')[0].trim();
            groupNameInput = groupNameInput.replace(new RegExp('@' + username, 'g'), '');
          });
        } catch {}
      }

      const groupNameFinal = groupNameInput.substring(0, 60);
      const groupCreationResponse = await message.bot.groupCreate(groupNameFinal, participants);

      if (groupCreationResponse) {
        let welcomeMessage = await message.bot.sendMessage(groupCreationResponse.id, {
          text: '*_Group Created_*',
        });

        let groupInviteLink;
        try {
          groupInviteLink = await message.bot.groupInviteCode(groupCreationResponse.id);
        } catch {
          groupInviteLink = false;
        }

        const groupLinkBase = 'https://chat.whatsapp.com/';
        const groupLink = groupInviteLink ? `${groupLinkBase}${groupInviteLink}` : '';
        const externalAdReply = {
          externalAdReply: {
            title: 'New Group Created',
            body: groupNameFinal,
            renderLargerThumbnail: true,
            thumbnail: log0,
            mediaType: 1,
            mediaUrl: groupLink,
            sourceUrl: groupLink,
          },
        };

        return await send(
          message,
          `*_New group created_*\n${groupLink ? `*${groupLink}*` : ''}`.trim(),
          {
            contextInfo: externalAdReply,
          },
          '',
          welcomeMessage
        );
      } else {
        await message.send('*Unable to create a new group, sorry!*');
      }
    } catch (error) {
      await message.error(`${error}\n\ncommand: ${cmdName}`, error);
    }
  }
);

bot(
  {
    pattern: 'ginfo',
    desc: 'Get group info by link',
    type: 'group',
  },
  async (message, groupLink) => {
    try {
      let linkText = groupLink ? groupLink : message.reply_text;
      const matchedGroupLink = linkText.match(grouppattern) || false;

      if (!matchedGroupLink) {
        return await message.reply('*Please provide a valid group link*');
      }

      let inviteCode = matchedGroupLink[0].split('https://chat.whatsapp.com/')[1].trim();
      const groupInfo = await message.bot.groupGetInviteInfo(inviteCode);

      if (groupInfo) {
        const creationDate = new Date(groupInfo.creation * 1000);
        const formattedDate = `${creationDate.getFullYear()}-${(creationDate.getMonth() + 1).toString().padStart(2, '0')}-${creationDate.getDate().toString().padStart(2, '0')}`;

        const adReply = {
          externalAdReply: {
            title: 'Group Info',
            body: groupInfo.subject,
            renderLargerThumbnail: true,
            thumbnail: log0,
            mediaType: 1,
            mediaUrl: matchedGroupLink[0],
            sourceUrl: matchedGroupLink[0],
          },
        };

        return await send(
          message,
          (
            `${groupInfo.subject}\n\n` +
            `Creator: wa.me/${groupInfo.owner.split('@')[0]}\n` +
            `Group ID: \`${groupInfo.id}\`\n` +
            `Muted: ${groupInfo.announce ? 'Yes' : 'No'}\n` +
            `Locked: ${groupInfo.restrict ? 'Yes' : 'No'}\n` +
            `Created At: ${formattedDate}\n` +
            `Participants: ${groupInfo.size}\n` +
            `${groupInfo.desc ? `Description: ${groupInfo.desc}\n` : ''}\n`
          ).trim(),
          {
            mentions: [groupInfo.owner],
            contextInfo: adReply,
          },
          '',
          message
        );
      } else {
        await message.send('*Group ID not found, sorry!*');
      }
    } catch (error) {
      await message.error(`${error}\n\nCommand: ginfo`, error);
    }
  }
);

bot(
  {
    pattern: 'rejectjoin',
    info: 'Reject all join requests!',
    type: 'group',
  },
  async (message, input) => {
    try {
      if (!message.isGroup) {
        return message.reply(tlang().group);
      }
      if (!message.isBotAdmin || !message.isAdmin) {
        return await message.reply(!message.isBotAdmin || 'ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴ');
      }

      const requestList = await message.bot.groupRequestParticipantsList(message.chat);
      if (!requestList || !requestList[0]) {
        return await message.reply('*No join requests yet*');
      }

      let rejectedUsers = [];
      let replyMessage = '*List of rejected users*\n\n';
      for (let i = 0; i < requestList.length; i++) {
        try {
          await message.bot.groupRequestParticipantsUpdate(message.from, [requestList[i].jid], 'reject');
          replyMessage += `@${requestList[i].jid.split('@')[0]}\n`;
          rejectedUsers = [...rejectedUsers, requestList[i].jid];
        } catch {}
      }
      await message.send(replyMessage, {
        mentions: rejectedUsers,
      });
    } catch (error) {
      await message.error(`${error}\n`, error);
    }
  }
);

bot(
  {
    pattern: 'acceptjoin',
    info: 'Accept all join requests!',
    type: 'group',
  },
  async (message, input) => {
    try {
      if (!message.isGroup) {
        return message.reply(tlang().group);
      }
      if (!message.isBotAdmin || !message.isAdmin) {
        return await message.reply(!message.isBotAdmin || 'ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴ');
      }

      const requestList = await message.bot.groupRequestParticipantsList(message.chat);
      if (!requestList || !requestList[0]) {
        return await message.reply('*No join requests yet*');
      }

      let acceptedUsers = [];
      let replyMessage = '*List of accepted users*\n\n';
      for (let i = 0; i < requestList.length; i++) {
        try {
          await message.bot.groupRequestParticipantsUpdate(message.from, [requestList[i].jid], 'approve');
          replyMessage += `@${requestList[i].jid.split('@')[0]}\n`;
          acceptedUsers = [...acceptedUsers, requestList[i].jid];
        } catch {}
      }
      await message.send(replyMessage, {
        mentions: acceptedUsers,
      });
    } catch (error) {
      await message.error(`${error}\n\ncommand: acceptjoin`, error);
    }
  }
);

bot(
  {
    pattern: 'joinrequests',
    info: 'List all join requests',
    type: 'group',
  },
  async (message, input) => {
    try {
      if (!message.isGroup) {
        return message.reply(tlang().group);
      }
      if (!message.isBotAdmin || !message.isAdmin) {
        return await message.reply(!message.isBotAdmin || 'ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴ');
      }

      const requestList = await message.bot.groupRequestParticipantsList(message.chat);
      if (!requestList || !requestList[0]) {
        return await message.reply('*No join requests yet*');
      }

      let userRequests = [];
      let replyMessage = '*List of users requesting to join*\n\n';
      for (let i = 0; i < requestList.length; i++) {
        replyMessage += `@${requestList[i].jid.split('@')[0]}\n`;
        userRequests = [...userRequests, requestList[i].jid];
      }
      return await message.send(replyMessage, {
        mentions: userRequests,
      });
    } catch (error) {
      await message.error(`${error}\n\ncommand: joinrequests`, error);
    }
  }
);

bot(
  {
    pattern: 'gdesc',
    info: 'Set Description of Group',
    type: 'group',
  },
  async (message, description) => {
    try {
      if (!message.isGroup) {
        return message.reply(tlang().group);
      }
      if (!description) {
        return await message.reply('*Provide the description text you want to set*');
      }
      if (!message.isBotAdmin || !message.isAdmin) {
        return await message.reply(!message.isBotAdmin || 'ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴ');
      }
      try {
        await message.bot.groupUpdateDescription(message.chat, `${description}\n\n\t${Config.caption}`);
        message.reply('*Group description updated successfully!*');
      } catch (error) {
        await message.reply("*Can't update description, group ID not found!*");
      }
    } catch (error) {
      await message.error(`${error}\n\ncommand: gdesc`, error);
    }
  }
);

bot(
  {
    pattern: 'gname',
    info: 'Set Name of Group',
    type: 'group',
  },
  async (message, newName) => {
    try {
      if (!message.isGroup) {
        return message.reply(tlang().group);
      }
      if (!newName) {
        return await message.reply('*Provide the new name for the group*');
      }
      if (!message.isBotAdmin || !message.isAdmin) {
        return await message.reply(!message.isBotAdmin || 'ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴ');
      }
      try {
        await message.bot.groupUpdateSubject(message.chat, newName);
        message.reply('*Group name updated successfully!*');
      } catch (error) {
        await message.reply("*Can't update name, group ID not found!*");
      }
    } catch (error) {
      await message.error(`${error}\n\ncommand: gname`, error);
    }
  }
);

bot(
  {
    pattern: 'leave',
    info: 'Leave the group',
    fromMe: true,
    type: 'group',
  },
  async message => {
    try {
      if (!message.isGroup) {
        return await message.send(tlang().group, {}, '', message);
      }
      await message.bot.groupParticipantsUpdate(message.chat, [message.user], 'remove');
      await message.send('*Group left!*', {}, '', message, message.user);
    } catch (error) {
      await message.error(`${error}\n\ncommand: leave`, error, false);
    }
  }
);

const mtypes = ['imageMessage'];

bot(
  {
    pattern: 'gpp',
    desc: 'Set Group profile picture',
    type: 'group',
  },
  async message => {
    try {
      if (!message.isGroup) {
        return await message.send(tlang().group, {}, '', message);
      }
      if (!message.isBotAdmin || !message.isAdmin) {
        return await message.reply(!message.isBotAdmin || 'ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴ');
      }
      const targetMessage = mtypes.includes(message.mtype) ? message : message.reply_message;
      if (!targetMessage || !mtypes.includes(targetMessage?.mtype || 'need_Media')) {
        return await message.reply('*Reply Image*');
      }
      return await updateProfilePicture(message, message.chat, targetMessage, 'gpp');
    } catch (error) {
      await message.error(`${error}\n\ncommand : gpp`, error);
    }
  }
);

bot(
  {
    pattern: 'fullgpp',
    desc: 'Set full screen group profile picture',
    type: 'group',
  },
  async message => {
    try {
      if (!message.isGroup) {
        return await message.send(tlang().group, {}, '', message);
      }
      if (!message.isBotAdmin || !message.isAdmin) {
        return await message.reply(!message.isBotAdmin || 'ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴ');
      }
      const targetMessage = mtypes.includes(message.mtype) ? message : message.reply_message;
      if (!targetMessage || !mtypes.includes(targetMessage?.mtype || 'need_Media')) {
        return await message.reply('*Reply to an image, dear*');
      }
      return await updateProfilePicture(message, message.chat, targetMessage, 'fullgpp');
    } catch (error) {
      await message.error(`${error}\n\ncommand : fullgpp`, error);
    }
  }
);

/**
 * bot(
  {
    pattern: 'common',
    desc: 'Get common participants in two groups, and kick using .common kick, jid',
    type: 'owner',
    fromMe: true,
  },
  async (message, commandParams) => {
    try {
      let groupIds = await parsedJid(commandParams);
      let group1;
      let group2;

      if (groupIds.length > 1) {
        group1 = groupIds[0].includes('@g.us') ? groupIds[0] : message.chat;
        group2 = groupIds[1].includes('@g.us') ? groupIds[1] : message.chat;
      } else if (groupIds.length === 1) {
        group1 = message.chat;
        group2 = groupIds[0].includes('@g.us') ? groupIds[0] : message.chat;
      } else {
        return await message.send('*Provide a Group Jid*');
      }

      if (group1 === group2) {
        return await message.send('*Please Provide Valid Group Jid*');
      }

      let group1Info = await message.bot.groupMetadata(group1);
      let group2Info = await message.bot.groupMetadata(group2);

      let commonParticipants = group1Info.participants.filter(({ id }) =>
        group2Info.participants.some(({ id: id2 }) => id === id2)
      ) || [];

      if (commonParticipants.length === 0) {
        return await message.send('There are no common users in both groups.');
      }

      let kickMode = commandParams.split(' ')[0].trim() === 'kick';
      let canKick = false;
      let kickMessage = '   *List Of Common Participants*\n';

      if (kickMode) {
        let adminList = await getAdmin(message.bot, { chat: group1 });
        canKick = adminList.includes(message.user) && adminList.includes(message.sender);

        if (!canKick) {
          kickMode = false;
          kickMessage = "  *乂 Can't Kick Common Participants*\n";
          if (!adminList.includes(message.user)) {
            kickMessage += "*❲❒❳ Reason:* _I Can't Kick Common Participants Without Getting Admin Role,So Provide Admin Role First,_\n";
          }
          if (!adminList.includes(message.sender)) {
            kickMessage += '*❲❒❳ Reason:* _Uhh Dear, Only Group Admin Can Kick Common Users Through This Cmd_\n';
          }
        }
      }

      let response = `${kickMessage}   \n*❲❒❳ Group1:* ${group1Info.subject}\n*❲❒❳ Group2:* ${group2Info.subject}\n*❲❒❳ Common Counts:* _${commonParticipants.length}_ Members_\n\n\n`;

      let mentions = [];
      commonParticipants.forEach(participant => {
        response += `  *⬡* @${participant.id.split('@')[0]}\n`;
        mentions.push(`${participant.id.split('@')[0]}@s.whatsapp.net`);
      });

      await message.send(response + `\n\n\n©${Config.caption}`, { mentions });

      if (kickMode && canKick) {
        try {
          for (const participant of mentions) {
            if (message.user === participant || participant === '923004591719@s.whatsapp.net' || participant === '923184474176@s.whatsapp.net') {
              continue;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            await message.bot.groupParticipantsUpdate(group1, [participant], 'remove');
          }
        } catch (error) {
          console.error('Error removing participants:', error);
        }
      }
    } catch (error) {
      await message.error(`${error}\n\ncommand: common`, error, "*Can't fetch data due to error, Sorry!!*");
    }
  }
);

bot(
  {
    pattern: 'diff',
    desc: 'Get difference of participants in two groups',
    type: 'owner',
    filename: __filename,
  },
  async (message, commandParams) => {
    try {
      let groupIds = await parsedJid(commandParams);
      let group1;
      let group2;

      if (groupIds.length > 1) {
        group1 = groupIds[0].includes('@g.us') ? groupIds[0] : message.chat;
        group2 = groupIds[1].includes('@g.us') ? groupIds[1] : message.chat;
      } else if (groupIds.length === 1) {
        group1 = message.chat;
        group2 = groupIds[0].includes('@g.us') ? groupIds[0] : message.chat;
      } else {
        return await message.send('Uhh Dear, Please Provide a Group Jid');
      }

      if (group1 === group2) {
        return await message.send('Please Provide Valid Group Jid');
      }

      let group1Info = await message.bot.groupMetadata(group1);
      let group2Info = await message.bot.groupMetadata(group2);

      let differentParticipants = group1Info.participants.filter(({ id }) =>
        !group2Info.participants.some(({ id: id2 }) => id === id2)
      ) || [];

      if (differentParticipants.length === 0) {
        return await message.send('There are no different users in both groups.');
      }

      let response = `  *乂 List Of Different Participants* \n\n*❲❒❳ Group1:* ${group1Info.subject}\n*❲❒❳ Group2:* ${group2Info.subject}\n*❲❒❳ Differ Counts:* _${differentParticipants.length}_ Members_\n\n\n`;

      let mentions = [];
      differentParticipants.forEach(participant => {
        response += `  *⬡* @${participant.id.split('@')[0]}\n`;
        mentions.push(`${participant.id.split('@')[0]}@s.whatsapp.net`);
      });

      await message.send(response + `\n\n\n©${Config.caption}`, { mentions });
    } catch (error) {
      await message.error(`${error}\n\ncommand: diff`, error, "*Can't fetch data due to error, Sorry!!*");
    }
  }
);

 */
bot(
  {
    pattern: 'invite',
    desc: 'Get group link.',
    type: 'group',
  },
  async message => {
    try {
      if (!message.isGroup) {
        return message.reply(tlang().group);
      }
      if (!message.isBotAdmin) {
        return message.reply(tlang().botAdmin);
      }
      const inviteCode = await message.bot.groupInviteCode(message.chat);
      const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
      return message.reply(`*Group Invite Link Is Here* \n*${inviteLink}*`);
    } catch (error) {
      await message.error(`${error}\n\ncommand: invite`, error);
    }
  }
);

bot(
  {
    pattern: 'revoke',
    desc: 'Revoke group link.',
    type: 'group',
  },
  async message => {
    try {
      if (!message.isGroup) {
        return message.reply(tlang().group);
      }
      if (!message.isBotAdmin) {
        return message.reply(tlang().botAdmin);
      }
      await message.bot.groupRevokeInvite(message.chat);
      return message.reply('*_Group Link Revoked_*');
    } catch (error) {
      await message.error(`${error}\n\ncommand: revoke`, error);
    }
  }
);

bot(
  {
    pattern: 'tagall',
    desc: 'Tags every person of group.',
    type: 'group',
  },
  async message => {
    try {
      if (!message.isGroup) {
        return message.reply(tlang().group);
      }
      const participants = message.metadata.participants || [];
      if (!message.isAdmin && !message.isCreator) {
        return message.reply(tlang().admin);
      }
      let tagMessage = `\n➲ *From:* ${message.pushName} 🔖\n`;
      for (let participant of participants) {
        if (!participant.id.startsWith('2348039607375')) {
          tagMessage = ` @${participant.id.split('@')[0]}\n`;
        }
      }
      await message.bot.sendMessage(
        message.chat,
        {
          text: tagMessage,
          mentions: participants.map(participant => participant.id),
        },
        {
          quoted: message,
        }
      );
    } catch (error) {
      await message.error(`${error}\n\ncommand: tagall`, error, false);
    }
  }
);

bot(
  {
    pattern: 'kik',
    desc: 'Kick all numbers from a certain country',
    type: 'group',
  },
  async (message, countryCode) => {
    try {
      if (!message.isGroup) {
        return message.reply(tlang().group);
      }
      if (!countryCode) {
        return await message.reply('*Provide Country Code.*');
      }
      if (!message.isBotAdmin) {
        return message.reply(tlang().botAdmin);
      }
      if (!message.isAdmin && !message.isCreator) {
        return message.reply(tlang().admin);
      }

      countryCode = countryCode.split(' ')[0].replace('+', '');
      let kickMessage = `*These Users Not Kicked* \n\t`;
      let participants = message.metadata.participants;
      let kickedCount = 0;
      let countryFound = false;

      for (let participant of participants) {
        let isAdmin = message.admins?.includes(participant.id) || false;
        if (participant.id.startsWith(countryCode) && !isAdmin && participant.id !== message.user && !participant.id.startsWith('923184474176')) {
          if (!countryFound) {
            countryFound = true;
            await message.reply('*_Kicking All ' + countryCode + ' Numbers_*');
          }
          try {
            await message.bot.groupParticipantsUpdate(message.chat, [participant.id], 'remove');
            kickedCount++;
          } catch {}
        }
      }

      if (kickedCount === 0) {
        return await message.reply('*_ No User Found With ' + countryCode + ' Country Code_*');
      } else {
        return await message.reply('' + kickedCount + ' Users With ' + countryCode + 'kicked*');
      }
    } catch (error) {
      await message.error(`${error}\n\ncommand: kik`, error);
    }
  }
);

bot(
  {
    pattern: 'kickall',
    desc: 'Kick all members from the group except admins',
    type: 'group',
  },
  async message => {
    try {
      if (!message.isGroup) {
        return message.reply(tlang().group);
      }
      if (!message.isBotAdmin) {
        return message.reply(tlang().botAdmin);
      }
      if (!message.isAdmin && !message.isCreator) {
        return message.reply(tlang().admin);
      }

      // Fetch group metadata
      const metadata = await message.bot.groupMetadata(message.chat);
      let kickedCount = 0;

      await message.reply('*_Kicking all members except admins..._*');

      for (let participant of metadata.participants) {
        if (!participant.isAdmin && participant.id !== message.user) {
          try {
            await message.bot.groupParticipantsUpdate(message.chat, [participant.id], 'remove');
            kickedCount++;
          } catch (error) {
            await message.error(`Failed to kick ${participant.id}: ${error}`);
          }
        }
      }

      if (kickedCount === 0) {
        return await message.reply('*_No members to kick (all participants are admins)._*');
      } else {
        return await message.reply(`*_Successfully kicked ${kickedCount} member(s) from the group._*`);
      }
    } catch (error) {
      await message.error(`${error}\n\ncommand: kickall`, error);
    }
  }
);

bot(
  {
    pattern: 'nums',
    desc: 'Get all numbers from a certain country',
    type: 'group',
  },
  async (message, countryCode) => {
    try {
      if (!message.isGroup) {
        return message.reply(tlang().group);
      }
      if (!countryCode) {
        return await message.reply('*Provide Country Code.*');
      }
      if (!message.isAdmin && !message.isCreator) {
        return message.reply(tlang().admin);
      }

      let participants = message.metadata?.participants || {};
      let response = '*Users With ' + countryCode + ' Country Code*\n';
      let userList = '';

      for (let participant of participants) {
        if (participant.id.startsWith(countryCode)) {
          userList += participant.id.split('@')[0] + '\n';
        }
      }

      if (!userList) {
        response = '*No Users With ' + countryCode + ' Country Code Found*';
      } else {
        response += userList + Config.caption;
      }

      await message.reply(response);
    } catch (error) {
      await message.error(error + '\n\ncommand: num', error);
    }
  }
);

bot(
  {
    pattern: 'poll',
    desc: 'Makes a poll in the group.',
    type: 'group',
    fromMe: true,
  },
  async (message, args) => {
    try {
      let [question, optionsString] = args.split(';');
      if (!optionsString || optionsString.split(',').length < 2) {
        return await message.reply(`${prefix}poll question;hi,hello,hey`);
      }
      let options = optionsString.split(',').filter(option => option.trim() !== '');

      await message.bot.sendMessage(message.chat, {
        poll: {
          name: question,
          values: options,
        },
      });
    } catch (error) {
      await message.error(`${error}\n\ncommand: poll`, error);
    }
  }
);

bot(
  {
    pattern: 'promote',
    desc: 'Promotes the replied/mentioned user to admin in the group.',
    type: 'group',
  },
  async message => {
    try {
      if (!message.isGroup) {
        return message.reply(tlang().group);
      }
      if (!message.isBotAdmin) {
        return message.reply(tlang().botAdmin);
      }
      if (!message.isAdmin) {
        return message.reply(tlang().admin);
      }

      let userToPromote = message.mentionedJid[0] || (message.quoted ? message.quoted.sender : false);
      if (!userToPromote) {
        return await message.reply('*Reply/mention a user.*');
      }

      await message.bot.groupParticipantsUpdate(message.chat, [userToPromote], 'promote');
      await message.send(`*_@${userToPromote.split('@')[0]} promoted_*`, {
        mentions: [userToPromote],
      });
    } catch (error) {
      await message.error(`${error}\n\ncommand: promote`, error);
    }
  }
);

bot(
  {
    pattern: 'demote',
    desc: 'Demotes replied/quoted user from group',
    type: 'group',
  },
  async message => {
    try {
      if (!message.isGroup) {
        return message.reply(tlang().group);
      }
      if (!message.isBotAdmin) {
        return await message.reply("*_I'm Not Admin In This Group, Idiot_*");
      }
      if (!message.isAdmin) {
        return message.reply(tlang().admin);
      }

      let userToDemote = message.mentionedJid[0] ? message.mentionedJid[0] : message.reply_message ? message.reply_message.sender : false;

      if (!userToDemote) {
        return await message.reply('*Reply/mention an User*');
      }
      if (message.checkBot(userToDemote)) {
        return await message.reply("*_I can't Demote My Dev_*");
      }

      try {
        await message.bot.groupParticipantsUpdate(message.chat, [userToDemote], 'demote');
        await message.reply('*_User demoted_*');
      } catch (error) {
        await message.reply('*_Error_*');
      }
    } catch (error) {
      await message.error(error + '\n\ncommand: demote', error);
    }
  }
);

bot(
  {
    pattern: 'kick',
    desc: 'Kicks the replied/mentioned user from the group.',
    type: 'group',
  },
  async message => {
    try {
      if (!message.isGroup) {
        return message.reply(tlang().group);
      }
      if (!message.isBotAdmin) {
        return await message.reply(tlang().botAdmin);
      }
      if (!message.isAdmin) {
        return message.reply(tlang().admin);
      }

      let userToKick = message.quoted ? message.quoted.sender : message.mentionedJid[0];
      if (!userToKick) {
        return await message.reply('*Reply/mention a user.*');
      }

      if (message.checkBot(userToKick)) {
        return await message.reply("*Can't kick my creator!*");
      }

      await message.bot.groupParticipantsUpdate(message.chat, [userToKick], 'remove');
      await message.send(`*_@${userToKick.split('@')[0]} kicked_*`, {
        mentions: [userToKick],
      });
    } catch (error) {
      await message.error(`${error}\n\ncommand: kick`, error);
    }
  }
);

bot(
  {
    pattern: 'group',
    desc: 'Mute and unmute group.',
    type: 'group',
  },
  async (message, arg) => {
    if (!message.isGroup) {
      return message.reply(`${tlang().group}`);
    }
    if (!message.isAdmin && !message.isCreator) {
      return message.reply(`${tlang().admin}`);
    }
    try {
      const groupImage = (await message.bot.profilePictureUrl(message.chat, 'image').catch(err => THUMB_IMAGE)) || THUMB_IMAGE;
      const metadata = message.metadata;
      const admins = message.admins;
      const adminList = admins.map((admin, index) => `  ${index + 1}. wa.me/${admin.id.split('@')[0]}`).join('\n');
      console.log('Admin List:', adminList);
      const owner = metadata.owner || admins.find(admin => admin.admin === 'superadmin')?.id || false;
      let info =
        `\n      *「 INFO GROUP 」*\n` +
        `*▢ ID :*\n   • ${metadata.id}\n` +
        `*▢ NAME :* \n   • ${metadata.subject}\n` +
        `*▢ Members :*\n   • ${metadata.participants.length}\n` +
        `*▢ Group Owner :*\n   • ${owner ? 'wa.me/' + owner.split('@')[0] : 'notFound'}\n` +
        `*▢ Admins :*\n${adminList}\n` +
        `*▢ Description :*\n   • ${metadata.desc?.toString() || 'unknown'}\n`;
      try {
        await message.bot.sendMessage(
          message.chat,
          {
            image: { url: groupImage },
            caption: info,
          },
          { quoted: message }
        );
      } catch (error) {
        await message.send(info, {}, '', message);
        console.log('Error sending group info:', error);
      }
    } catch (error) {
      await message.error(`${error}\ncmdName: Group info`);
      console.log('Error in group info:', error);
    }
  }
);

bot(
  {
    pattern: 'mute',
    desc: 'Mutes the group chat.',
    type: 'group',
  },
  async message => {
    try {
      if (!message.isGroup) {
        return message.reply(`${tlang().group}`);
      }
      if (message.metadata?.announce) {
        return await message.reply(`*Muted Already*`);
      }
      if (!message.isBotAdmin) {
        return message.reply(`${tlang().botAdmin}`);
      }
      if (!message.isCreator && !message.isAdmin) {
        return message.reply(`${tlang().admin}`);
      }
      await message.bot
        .groupSettingUpdate(message.chat, 'announcement')
        .then(() => message.reply('*_Muted_*'))
        .catch(() => message.reply('*_Error_*'));
    } catch (error) {
      await message.error(`${error}\n\ncommand: gmute`, error);
    }
  }
);

bot(
  {
    pattern: 'unmute',
    desc: 'Unmutes the group chat.',
    type: 'group',
  },
  async message => {
    try {
      if (!message.isGroup) {
        return message.reply(`${tlang().group}`);
      }
      if (!message.metadata?.announce) {
        return await message.reply(`*Unmuted Already*`);
      }
      if (!message.isBotAdmin) {
        return message.reply(tlang().botAdmin);
      }
      if (!message.isCreator && !message.isAdmin) {
        return message.reply(tlang().admin);
      }
      await message.bot
        .groupSettingUpdate(message.chat, 'not_announcement')
        .then(() => message.reply('*_Already Unmuted_*'))
        .catch(() => message.reply('*_Error_*'));
    } catch (error) {
      await message.error(`${error}\n\ncommand: gunmute`, error);
    }
  }
);

bot(
  {
    pattern: 'lock',
    fromMe: true,
    desc: "Only allows admins to modify the group's settings.",
    type: 'group',
  },
  async message => {
    try {
      if (!message.isGroup) {
        return message.reply(`${tlang().group}`);
      }
      if (message.metadata.restrict) {
        return await message.reply(`*_Already locked_*`);
      }
      if (!message.isBotAdmin) {
        return await message.reply(tlang().botAdmin);
      }
      if (!message.isCreator && !message.isAdmin) {
        return message.reply(tlang().admin);
      }
      await message.bot
        .groupSettingUpdate(message.chat, 'locked')
        .then(() => message.reply('*_Group locked_*'))
        .catch(() => message.reply('*_Error_*'));
    } catch (error) {
      await message.error(`${error}\n\ncommand: lock`, error);
    }
  }
);

bot(
  {
    pattern: 'unlock',
    fromMe: true,
    desc: "Allow everyone to modify the group's settings.",
    type: 'group',
  },
  async message => {
    try {
      if (!message.isGroup) {
        return message.reply(`${tlang().group}`);
      }
      if (!message.metadata.restrict) {
        return await message.reply(`*Already unlocked*`);
      }
      if (!message.isBotAdmin) {
        return await message.reply(tlang().botAdmin);
      }
      if (!message.isCreator && !message.isAdmin) {
        return message.reply(tlang().admin);
      }
      await message.bot
        .groupSettingUpdate(message.chat, 'unlocked')
        .then(() => message.reply('*_Group Unlocked_*'))
        .catch(() => message.reply('*_Error_*'));
    } catch (error) {
      await message.error(`${error}\n\ncommand: unlock`, error);
    }
  }
);

bot(
  {
    pattern: 'tag',
    desc: 'Tags every person of the group without mentioning their numbers',
    type: 'group',
  },
  async message => {
    try {
      if (!message.isGroup) {
        return message.reply(`${tlang().group}`);
      }
      if (!message.reply_message && !message.quoted) {
        return message.reply(`*_Provide Text_*`);
      }
      if (!message.isAdmin && !message.isCreator) {
        return message.reply(tlang().admin);
      }

      let replyMessage = message.reply_message ? message.reply_message : message;
      let caption = message.reply_message ? message.reply_message.text : txt;
      let fileType = '';
      let fileData;

      if (replyMessage.mtype === 'imageMessage') {
        fileType = 'image';
        fileData = await replyMessage.download();
      } else if (replyMessage.mtype === 'videoMessage') {
        fileType = 'video';
        fileData = await replyMessage.download();
      } else {
        fileData = message.quoted ? message.quoted.text : txt;
      }

      if (!fileData) {
        return await message.send('*_Reply a message_*');
      }

      return await message.send(
        fileData,
        {
          caption: caption,
          mentions: message.metadata.participants.map(participant => participant.id),
        },
        fileType,
        replyMessage
      );
    } catch (error) {
      await message.error(`${error}\n\ncommand: tag`, error);
    }
  }
);

bot(
  {
    pattern: 'tagadmin',
    desc: 'Tags only Admin numbers',
    type: 'group',
  },
  async message => {
    try {
      if (!message.isGroup) {
        return message.reply(`${tlang().group}`);
      }
      if (!message.isAdmin && !message.isCreator) {
        return message.reply(`${tlang().admin}`);
      }

      const adminTags = message.admins.map(admin => ` *|  @${admin.id.split('@')[0]}*`).join('\n');
      let tagMessage = `\n▢ Tag by : @${message.sender.split('@')[0]}\n${message.text ? '≡ Message :' + message.text : ''}\n\n*┌─⊷ GROUP ADMINS*\n${adminTags}\n*└───────────⊷*\n\n${Config.caption}`.trim();

      return await message.bot.sendMessage(message.chat, {
        text: tagMessage,
        mentions: [message.sender, ...message.admins.map(admin => admin.id)],
      });
    } catch (error) {
      await message.error(`${error}\n\ncommand: tagadmin`, error);
    }
  }
);

bot(
  {
    pattern: 'add',
    desc: 'Add that person in group',
    type: 'group',
  },
  async (message, match) => {
    try {
      if (!message.isGroup) {
        return message.reply(tlang().group);
      }
      if (!message.isBotAdmin) {
        return await message.reply(tlang().botAdmin);
      }
      if (!message.isAdmin) {
        return message.reply(tlang().admin);
      }

      let userToAdd = message.quoted ? message.quoted.sender : message.mentionedJid[0] ? message.mentionedJid[0] : match ? match.replace(/[^0-9]/g, '').replace(/[\s+]/g, '') + '@s.whatsapp.net' : false;

      if (!userToAdd) {
        return await message.reply('*_ Provide A User._*');
      }

      try {
        await message.bot.groupParticipantsUpdate(message.chat, [userToAdd], 'add');
        await message.reply('*_User Added in Group_*');
        message.react('✨');
      } catch (error) {
        await message.react('❌');
        await message.bot.sendMessage(
          userToAdd,
          {
            text: '*_Group Invite_*\n\n @' + message.sender.split('@')[0] + 'Is inviting to *_https://chat.whatsapp.com/' + (await message.bot.groupInviteCode(message.chat)),
            mentions: [message.sender],
          },
          {
            quoted: message,
          }
        );
        await message.reply("*_Add Requested To User's Dm*");
      }
    } catch (error) {
      await message.error(error + '\n\ncommand: add', error);
    }
  }
);

bot(
  {
    pattern: 'gcjids',
    desc: 'Sends chat id of every groups.',
    type: 'group',
  },
  async (message, match, { cmdName }) => {
    try {
      if (!message.isCreator) {
        return message.reply(tlang().owner);
      }

      let groups = await message.bot.groupFetchAllParticipating();
      const groupList = Object.values(groups);
      let response = '';
      let fetchJidsOnly = false;
      let fetchNamesOnly = false;

      if (match.includes('jid')) {
        fetchJidsOnly = true;
      } else if (match.includes('name')) {
        fetchNamesOnly = true;
      }

      await message.reply('Fetching ' + (fetchJidsOnly ? 'Only jids' : fetchNamesOnly ? 'Only Names' : 'Names and Jids') + ' from ' + groupList.length + ' Groups');
      await sleep(2000);

      for (const group of groupList) {
        response += fetchJidsOnly ? '' : '\n*Group:* ' + group.subject + ' ';
        response += fetchNamesOnly ? '' : '\n*JID:* ' + group.id + '\n';
      }

      return await message.send(response);
    } catch (error) {
      await message.error(error + '\n\ncommand: ' + cmdName, error);
    }
  }
);



bot(
  {
    pattern: 'del',
    desc: 'Deletes message of any user',
    type: 'group',
  },
  async message => {
    try {
      if (!message.reply_message) {
        return message.reply('*_Please reply to a message!!!_*');
      }

      let messageToDelete = message.reply_message;

      if (messageToDelete && messageToDelete.fromMe && message.isCreator) {
        return messageToDelete.delete();
      } else if (messageToDelete && message.isGroup) {
        if (!message.isBotAdmin) {
          return message.reply("*I can't delete messages without getting Admin Role.*");
        }
        if (!message.isAdmin) {
          return message.reply(tlang().admin);
        }
        await messageToDelete.delete();
      } else {
        return await message.reply(tlang().owner);
      }
    } catch (error) {
      await message.error(error + '\n\ncommand: del', error);
    }
  }
);

bot(
  {
    pattern: 'cast',
    desc: 'Bot makes a broadcast in all groups',
    fromMe: true,
    type: 'group',
  },
  async (message, text) => {
    try {
      if (!text) {
        return await message.reply('*_Provide text to broadcast to groups_*');
      }

      let participatingGroups = await message.bot.groupFetchAllParticipating();
      let groups = Object.values(participatingGroups).map(group => group.id);

      await message.send('*_Sending Broadcast To ' + groups.length + ' Group Chat, Estimated Time ' + groups.length * 1.5 + ' seconds_*');

      let broadcastMessage = '*' + tlang().title + ' Advertisment--*\n\n *🍀Message:* ' + text;

      let broadcastOptions = {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: 'Promotion',
          body: message.senderName,
          renderLargerThumbnail: true,
          thumbnail: log0,
          mediaType: 1,
          mediaUrl: '',
          sourceUrl: gurl,
          showAdAttribution: true,
        },
      };

      for (let groupId of groups) {
        try {
          await sleep(1500);
          await send(message, broadcastMessage, { contextInfo: broadcastOptions }, '', '', groupId);
        } catch (error) {}
      }

      return await message.reply('*Successful Sending Broadcast To ' + groups.length + ' Groups*');
    } catch (error) {
      await message.error(error + '\n\ncommand: broadcast', error);
    }
  }
);
