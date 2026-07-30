export async function transcribeAudio(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'en');

    const response = await fetch('/.netlify/functions/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('Transcription failed:', response.statusText);
      return '';
    }

    const data = await response.json();
    return data.text || '';
  } catch (err) {
    console.error('Transcription error:', err);
    return '';
  }
}
