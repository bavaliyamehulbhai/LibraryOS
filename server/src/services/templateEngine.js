/**
 * Template Engine for Emails
 */
exports.renderTemplate = (htmlContent, data, emailLogId, backendUrl) => {
  let rendered = htmlContent;
  
  // Replace variables
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, value || "");
  }

  // Inject Tracking Pixel
  // We append an invisible 1x1 image at the end of the body
  if (emailLogId && backendUrl) {
    const trackingPixelUrl = `${backendUrl}/api/v1/emails/track/${emailLogId}.png`;
    const trackingPixelHtml = `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" />`;
    
    // Inject right before closing </body> tag if it exists, else append
    if (rendered.includes("</body>")) {
      rendered = rendered.replace("</body>", `${trackingPixelHtml}</body>`);
    } else {
      rendered += trackingPixelHtml;
    }
  }

  return rendered;
};
