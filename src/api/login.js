export default async function handler(req, res) {
  // 1. Only allow POST requests for security
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // 2. Verify against the credentials you saved in Vercel
  if (
    username === process.env.MY_APP_USERNAME &&
    password === process.env.MY_APP_PASSWORD
  ) {
    try {
      // 3. If credentials match, securely ask Google for a temporary Access Token
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
        return res.status(googleResponse.status).json({ 
          error: 'Failed to fetch Google token', 
          details: data 
        });
      }

      // 4. Send ONLY the temporary token back to your frontend
      return res.status(200).json({ 
        success: true, 
        accessToken: data.access_token 
      });

    } catch (error) {
      console.error("Token exchange error:", error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    // Stop anyone who types the wrong office password
    return res.status(401).json({ error: 'Invalid office credentials' });
  }
}