const express = require('express');
const { Ticket, TicketBlacklisted, apiCalls, guildSettings, userLanguages, db } = require('./database'); // Update the path based on your file structure

const app = express();
const PORT = 3000;
app.use(express.urlencoded({ extended: true }));

// Middleware to allow only localhost access
app.use((req, res, next) => {
  const remoteAddress = req.socket.remoteAddress;
  if (remoteAddress === '::1' || remoteAddress === '::ffff:127.0.0.1') {
    // If the request is from localhost, allow access
    next();
  } else {
    res.status(403).send('Forbidden - Access Denied');
  }
});

async function giveCSTicketInfo(ticketID) {
  try {
    // Create a regular expression pattern for case-insensitive search
    const regexTicketID = new RegExp(ticketID, 'i');

    // Fetch ticket information from the database based on TicketID field (case-insensitive)
    const ticketInfo = await Ticket.findOne({ TicketID: regexTicketID });

    if (ticketInfo) {
      console.log(ticketInfo);
      return ticketInfo;
    } else {
      console.log('Ticket not found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching ticket information:', error);
    return null;
  }
}

// Middleware function to capture user's IP and perform an action
const captureUserIP = async (req, res, next) => {
  const userIP = req.ip;
  const requestedRoute = req.originalUrl; // Get the requested route

  try {
    // Perform an action with the user's IP
    const apiLog = new apiCalls({ ip: userIP, apiCalled: requestedRoute }, { versionKey: false });
    await apiLog.save();

    // Continue processing the request after the action is performed
    next();
  } catch (error) {
    console.error('Error capturing user IP or saving to database:', error);
    // Respond with an internal database error
    res.status(500).send('Internal Database Error');
  }
};
function generateTicketID() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const idLength = 8;
  let ticketID = '';

  for (let i = 0; i < idLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    ticketID += characters.charAt(randomIndex);
  }

  return ticketID;
}
// Function to check if a ticket ID exists in the database
async function checkIfTicketIDExists(ticketID) {
  const existingTicket = await Ticket.findOne({ TicketID: ticketID });
  return existingTicket ? true : false;
}

// Function to generate a unique ticket ID by checking its existence in the database
async function generateUniqueTicketID() {
  let ticketID;
  let existingID;

  do {
    ticketID = generateTicketID();
    existingID = await checkIfTicketIDExists(ticketID);
  } while (existingID);

  return ticketID;
}
// Apply the middleware to all routes in your Express application
app.use(captureUserIP);

app.post('/api/giveCSTicketInfo', async (req, res) => {
  const { ticketID } = req.body; // Assuming ticketID is sent in the request body
  console.log(ticketID)
  try {
    // Retrieve ticket information based on ticketID
    const ticketInfo = await giveCSTicketInfo(ticketID);

    if (ticketInfo) {
      // If ticket information is found, send it in the response
      res.status(200).json({ success: ticketInfo });
    } else {
      // If ticket is not found, send a relevant message in the response
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    console.error('Error handling CS Ticket Info:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/checkExistingTicket', async (req, res) => {
  const { memberID } = req.body; // Assuming memberID is sent in the request body
  try {
    // Retrieve ticket information based on memberID
    const existingTicket = await Ticket.findOne({
      MemberID: memberID,
      Pending: true,
    });

    if (existingTicket && existingTicket.ChannelID && existingTicket.GuildID) {
      const existingTicketLink = `https://discord.com/channels/${existingTicket.GuildID}/${existingTicket.ChannelID}`;
      return res.status(200).json({ exists: true, link: existingTicketLink });
    }

    // Respond indicating that the ticket does not exist
    res.status(200).json({ exists: false });
  } catch (error) {
    console.error('Error handling ticket info:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/checkBlacklist', async (req, res) => {
  const { memberID } = req.body;
  try {
    const blacklistedUser = await TicketBlacklisted.findOne({ MemberID: memberID });

    if (blacklistedUser) {
      const reason = blacklistedUser.Reason || 'No reason provided';
      return res.status(200).json({ error: `You're not allowed to access Ticket Support because of: ${reason}` });
    }

    // If the user is not blacklisted
    return res.status(200).json({ success: 'user is not blacklisted' });
  } catch (error) {
    console.error('Error checking blacklist:', error);
    return res.status(500).json({ error: 'An error occurred while checking the blacklist.' });
  }
});

app.post('/api/checkUserLanguage', async (req, res) => {
  const { memberID } = req.body;
  try {
    const user = await userLanguages.findOne({ MemberID: memberID });

    if (user) {
      const language = user.language || 'en'; // Default to 'en' if language not found
      return res.status(200).json({ success: true, language });
    }

    return res.status(200).json({ success: true, language: 'en' }); // Default language 'en' if user not found
  } catch (error) {
    console.error('Error checking user language:', error);
    return res.status(500).json({ error: 'An error occurred while checking the user language.' });
  }
});


// API endpoint to update guild settings and save to MongoDB
app.post('/api/setupGuild/:guildId', async (req, res) => {
  const guildId = req.params.guildId;
  const { language, isThreadsEnabled, threadsCategoryID, isSupportChannelEnabled, supportChannelID, isSuggestionsEnabled, suggestionsCategoryID } = req.body;

  try {
    const guildSettings2 = new guildSettings({
      guildId: guildId,
      language: language,
      isThreadsEnabled: isThreadsEnabled,
      threadsCategoryID: threadsCategoryID,
      isSupportChannelEnabled: isSupportChannelEnabled,
      supportChannelID: supportChannelID,
      isSuggestionsEnabled: isSuggestionsEnabled,
      suggestionsCategoryID: suggestionsCategoryID,
    });

    // Save the new GuildSettings entry to the database
    guildSettings2.save()
      .then(savedEntry => {
        console.log('New GuildSettings entry saved:', savedEntry);
        res.status(200).json({ success: 'Guild settings updated and saved to MongoDB' });
      })
      .catch(error => {
        console.error('Error saving GuildSettings entry:', error);
        res.status(500).json({ error: 'Failed to update guild settings and save to MongoDB' });
      });
  } catch (error) {
    console.error('Error creating GuildSettings object:', error);
    res.status(500).json({ error: 'Failed to create GuildSettings object' });
  }
});


app.post('/api/handleCreateTicket', async (req, res) => {
  const { guildID, memberID, channelID } = req.body; // Assuming ticket details are sent in the request body
  try {

    // Generate a unique ticket ID or fetch it from the request
    const newTicketID = await generateUniqueTicketID(); // Implement your unique ticket ID generation logic
    // Create a new ticket object
    const newTicket = new Ticket({
      GuildID: guildID,
      MemberID: memberID,
      TicketID: newTicketID,
      ChannelID: channelID,
      Pending: true,
      Closed: false,
      Locked: false,
      Deleted: false,
      Type: 'Remake Network - Pending Ticket',
      Username: 'null',
      Email: 'null',
      Issue: 'null',
      TicketClosed_MessageID: 'null',
      TicketTranscript_MessageID: 'null',
    });

    // Save the new ticket to the database
    await newTicket.save();

    try {
      await userLanguages.findOneAndUpdate(
        { MemberID: memberID }, // Search criteria
        { $setOnInsert: { MemberID: memberID } }, // Fields to update if a new document is inserted
        { upsert: true } // Option to create if not exist
      );
    
    } catch (error) {
      console.error('Error creating or updating document:', error);
      // Handle errors if necessary
    }

    // Respond with the created ticket information
    res.status(200).json({ success: newTicket });
  } catch (error) {
    console.error('Error handling CS Ticket Creation:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
