# Forms - Process Documentation Platform

Forms is a process-focused documentation platform for makers and creators. Document your creative projects through daily reflections and media capture, emphasizing experimentation and learning over polished results. For more details, see PRD.

## Features

- **Project Management**: Create and manage multiple creative projects
- **Daily Entries**: Write reflections and upload images (up to 5 per entry)
- **Timeline Navigation**: Browse past entries with an intuitive sidebar
- **Smart Image Storage**: Automatic image compression (up to 94% size reduction) for efficient storage
- **Data Persistence**: All data stored locally in your browser (up to 25MB capacity)

## Quick Start

1. **Create a Project**: Click "+ New Project" and enter a name
2. **Write Daily Entries**: Add reflections and upload images (JPEG, PNG, WebP, GIF)
3. **Navigate Timeline**: Use the sidebar to browse past entries
4. **Auto-save**: Press Cmd+Enter to save quickly

## Image Management

- **Automatic Compression**: Images are automatically resized to 800px max width and compressed to reduce storage usage
- **Format Support**: JPEG, PNG, WebP, GIF files up to 5MB each
- **Storage Efficiency**: Up to 94% size reduction while maintaining visual quality
- **Edit Mode**: When editing entries, existing images are preserved - add new ones or remove specific images individually

## Tech Stack
- **Frontend**: React + TypeScript
- **UI Components**: Radix UI + Tailwind CSS
- **Storage**: Browser localStorage with automatic image compression
- **Image Processing**: HTML5 Canvas API for client-side compression
- **Testing**: React Testing Library + Jest

## Browser Support
- Chrome, Safari, Firefox, Edge (latest versions)

## License
- TBD
