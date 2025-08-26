// Generate different placeholder images for different types of content
export const generateTestImage = (filename: string): string => {
  const baseName = filename.replace(/\.[^/.]+$/, ''); // Remove extension
  const words = baseName.split(/[-_]/);
  const displayText = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    // Fallback to a simple colored data URL if canvas is not available
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#666" text-anchor="middle" dy=".3em">${displayText}</text>
      </svg>
    `);
  }

  // Fill background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 300, 200);

  // Add border
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, 300, 200);

  // Add text
  ctx.fillStyle = '#666';
  ctx.font = '16px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayText, 150, 100);

  // Convert to data URL
  return canvas.toDataURL('image/png');
};
