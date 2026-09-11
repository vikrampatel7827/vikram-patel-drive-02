export default async function handler(req, res) {
  const authHeader = req.headers.authorization || `Bearer ${req.query.token}`;

  if (!authHeader || authHeader === 'Bearer undefined') {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  try {
    const googleResponse = await fetch(
      "https://www.googleapis.com/drive/v3/files?q='root' in parents and trashed=false&fields=files(id,name,mimeType,size,thumbnailLink,webContentLink,webViewLink)&orderBy=folder,modifiedTime desc",
      {
        headers: {
          Authorization: authHeader,
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