// Generate a simple placeholder image as a data URL
export const generatePlaceholderImage = (width: number = 300, height: number = 200, text: string = 'Placeholder'): string => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    // Fallback to a simple colored data URL if canvas is not available
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#666" text-anchor="middle" dy=".3em">${text}</text>
      </svg>
    `);
  }

  // Fill background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);

  // Add border
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, width, height);

  // Add text
  ctx.fillStyle = '#666';
  ctx.font = '16px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  // Convert to data URL
  return canvas.toDataURL('image/png');
};

// Generate different placeholder images for different types of content
export const generateTestImage = (filename: string): string => {
  const baseName = filename.replace(/\.[^/.]+$/, ''); // Remove extension
  const words = baseName.split(/[-_]/);
  const displayText = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  return generatePlaceholderImage(300, 200, displayText);
};
