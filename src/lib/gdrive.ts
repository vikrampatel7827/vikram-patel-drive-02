import axios from 'axios';

// Fetch files from Google Drive
export async function fetchDriveFiles(accessToken: string) {
  const res = await axios.get(
    "https://www.googleapis.com/drive/v3/files?q='root' in parents and trashed=false&fields=files(id,name,mimeType,size,thumbnailLink,webContentLink,webViewLink)&orderBy=folder,modifiedTime desc",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return res.data.files;
}

// Resumable Chunked Upload for massive 1GB+ files
export async function uploadToGoogleDrive(
  file: File, 
  accessToken: string, 
  onProgress: (percent: number) => void
) {
  // 1. Get Resumable Upload URL
  const metadata = { name: file.name, mimeType: file.type };
  const initRes = await axios.post(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
    metadata,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const uploadUrl = initRes.headers['location'] || initRes.headers['Location'];

  // 2. Stream the file directly to Google Drive (avoids crashing browser RAM)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) resolve(JSON.parse(xhr.responseText));
      else reject(new Error('Upload failed'));
    };
    
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(file);
  });
}