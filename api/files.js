export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Missing token' });
  }

  try {
    const googleResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=50&fields=files(id,name,mimeType,size,thumbnailLink,webViewLink,webContentLink)',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      return res.status(googleResponse.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Files proxy error:', error);
    return res.status(500).json({ error: 'Internal server error fetching files' });
  }
}