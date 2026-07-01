/**
 * Mock upload service to simulate Cloudinary or S3 upload.
 * Returns a fake HTTPS URL.
 */
const uploadImage = async (fileBuffer, originalName) => {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return fake Cloudinary/S3 URL
  const uniqueId = Math.random().toString(36).substring(7);
  return `https://res.cloudinary.com/libraryos/image/upload/v1/${uniqueId}/${originalName}`;
};

module.exports = { uploadImage };
