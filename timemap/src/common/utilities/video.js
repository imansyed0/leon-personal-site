/**
 * Converts a Google Drive sharing URL to a direct video URL
 * @param {string} driveUrl - The Google Drive sharing URL (can be either the sharing URL or the file ID)
 * @returns {string} Direct video URL for embedding
 */
export const getGoogleDriveVideoUrl = (driveUrl) => {
  // Extract file ID from Google Drive URL if full URL is provided
  const fileId = driveUrl.includes('drive.google.com') 
    ? driveUrl.match(/[-\w]{25,}/)[0]
    : driveUrl;
  
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

/**
 * Gets the video thumbnail from Google Drive
 * @param {string} driveUrl - The Google Drive sharing URL or file ID
 * @returns {string} Thumbnail URL
 */
export const getGoogleDriveVideoThumbnail = (driveUrl) => {
  const fileId = driveUrl.includes('drive.google.com') 
    ? driveUrl.match(/[-\w]{25,}/)[0]
    : driveUrl;
  
  return `https://drive.google.com/thumbnail?id=${fileId}`;
}; 