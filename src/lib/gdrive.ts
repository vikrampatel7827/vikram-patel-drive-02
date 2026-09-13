import axios from 'axios';

export async function fetchDriveFiles(accessToken: string) {
  const res = await axios.get(`/api/files`, {
    params: { token: accessToken }
  });
  return res.data.files;
}

export async function uploadToGoogleDrive(
  file: File, 
  accessToken: string, 
  onProgress: (percent: number) => void
) {
  // 1. Initialize Upload through the Vercel Tunnel
  const metadata = { name: file.name, mimeType: file.type };
  const initRes = await axios.post(
    '/api/proxy',
    metadata,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-target-url': 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable'
      },
    }
  );
  
  const uploadUrl = initRes.headers['location'] || initRes.headers['Location'];

  // 2. Slice the file into 3MB chunks to bypass Vercel's 4MB limit
  const chunkSize = 3 * 1024 * 1024; // 3MB (Must be a multiple of 256KB for Google)
  let start = 0;

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', '/api/proxy', true);
      
      // Route the chunk through the tunnel
      xhr.setRequestHeader('x-target-url', uploadUrl);
      // Tell Google exactly which piece of the file this is
      xhr.setRequestHeader('Content-Range', `bytes ${start}-${end - 1}/${file.size}`);
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const currentOverallLoaded = start + e.loaded;
          onProgress(Math.round((currentOverallLoaded / file.size) * 100));
        }
      };
      
      xhr.onload = () => {
        // Status 308 means "Chunk received, send the next one". 200/201 means "File complete!"
        if (xhr.status === 308 || xhr.status === 200 || xhr.status === 201) resolve(true);
        else reject(new Error('Tunnel chunk upload failed'));
      };
      
      xhr.onerror = () => reject(new Error('Network error during tunnel upload'));
      xhr.send(chunk);
    });

    start = end;
  }
}