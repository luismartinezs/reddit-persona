const snoowrap = require('snoowrap');
require('dotenv').config();

// Replace the following placeholders with your own credentials.
const r = new snoowrap({
  userAgent: 'reddit-user-history',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.REFRESH_TOKEN
});

const targetUser = 'saito200'; // Replace with the target user's Reddit username.
const maxWordCount = 2000;

(async () => {
  try {
    const user = await r.getUser(targetUser);
    const comments = await user.getComments({limit: 100});
    const posts = await user.getSubmissions({limit: 100});

    let combinedHistory = comments.concat(posts);
    combinedHistory.sort((a, b) => b.created_utc - a.created_utc);

    let wordCount = 0;
    const recentHistory = [];

    for (const item of combinedHistory) {
      const content = item.selftext || item.body;

      if (content && content.length > 150) {
        const words = content.split(/\s+/);

        if (wordCount + words.length <= maxWordCount) {
          wordCount += words.length;
          recentHistory.push({
            id: item.id,
            type: item.selftext ? 'post' : 'comment',
            content: content,
            created_utc: item.created_utc
          });
        } else {
          break;
        }
      }
    }

    console.log(recentHistory.map(el => el.content));
  } catch (error) {
    console.error(error);
  }
})();
