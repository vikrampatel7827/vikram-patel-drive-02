export default async function handler(req, res) {
  const { fileId, token } = req.query;

  if (!fileId || !token) {
    return res.status(400).json({ error: 'Missing fileId or token' });
  }

  try {
    const googleResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!googleResponse.ok) {
      return res.status(googleResponse.status).json({ error: 'Failed to fetch media from Google Drive' });
    }

    // Forward crucial headers for video playback and scrubbing
    res.setHeader('Content-Type', googleResponse.headers.get('content-type') || 'video/mp4');
    if (googleResponse.headers.get('content-length')) {
      res.setHeader('Content-Length', googleResponse.headers.get('content-length'));
    }
    res.setHeader('Accept-Ranges', 'bytes');

    // Stream the data chunks from Google through Vercel to your browser
    const reader = googleResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (error) {
    console.error('Streaming proxy error:', error);
    res.status(500).json({ error: 'Internal server error during video streaming' });
  }
}