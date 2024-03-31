const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    GuildID: { type: String, required: false },
    MemberID: { type: String, required: false },
    TicketID: { type: String, required: false },
    ChannelID: { type: String, required: false },
    Transcription: { type: String, required: false },
    Closed: { type: Boolean, default: false },
    Locked: { type: Boolean, default: false },
    Pending: { type: Boolean, default: false },
    Deleted: { type: Boolean, default: false },
    Type: { type: String, required: true },
    Username: { type: String, required: false },
    Email: { type: String, required: false },
    Issue: { type: String, required: false },
    TicketClosed_MessageID: { type: String, required: false },
    TicketTranscript_MessageID: { type: String, required: false },
  });
  
  const TicketBlacklistedSchema = new mongoose.Schema({
    MemberID: { type: String, required: true },
    StaffMember: { type: String, required: true },
    Reason: { type: String, default: 'No reason provided' }, // Setting a default value for Reason
    Date: { type: Date, default: Date.now }
  });

  const apiCallSchema = new mongoose.Schema({
    ip: { type: String, required: true },
    apiCalled: { type: String, required: true },
    Date: { type: Date, default: Date.now }
  });

  const GuildSettingsSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    language: { type: String, default: 'en' }, // Default language to 'en' if not provided
    isThreadsEnabled: { type: Boolean, default: false }, // Default to false if not provided
    threadsCategoryID: { type: String, default: null }, // Default to null if not provided
    isSupportChannelEnabled: { type: Boolean, default: false }, // Default to false if not provided
    supportChannelID: { type: String, default: null }, // Default to null if not provided
    isSuggestionsEnabled: { type: Boolean, default: false }, // Default to false if not provided
    suggestionsCategoryID: { type: String, default: null } // Default to null if not provided
});

const userLanguage = new mongoose.Schema({
  MemberID: { type: String, required: true },
  language: { type: String, default: 'en' }, // Default language to 'en' if not provided
});

const uri = 'db link here';
const dbName = 'ticketsystem';

  mongoose.connect(uri, {
    dbName: dbName,
  });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB successfully!');
});

const Ticket = mongoose.model('Ticket', ticketSchema);
const TicketBlacklisted = mongoose.model('TicketBlacklisted', TicketBlacklistedSchema, 'blacklisted');
const apiCalls = mongoose.model('ApiCalls', apiCallSchema, 'apicalls');
const guildSettings = mongoose.model('guildSettings', GuildSettingsSchema, 'guildSettings');
const userLanguages = mongoose.model('userLanguages', userLanguage, 'userLanguages');

module.exports = {
  db,
  Ticket,
  TicketBlacklisted,
  apiCalls,
  guildSettings,
  userLanguages
};