export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (
    username === process.env.MY_APP_USERNAME &&
    password === process.env.MY_APP_PASSWORD
  ) {
    try {
      const googleResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
      });

      const data = await googleResponse.json();

      if (!googleResponse.ok) {
        // This will send Google's exact reason (like "invalid_grant" or "unauthorized_client") to your frontend toast
        return res.status(400).json({ error: data.error_description || data.error || 'Failed to fetch Google token' });
      }

      return res.status(200).json({ 
        success: true, 
        accessToken: data.access_token 
      });

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
}