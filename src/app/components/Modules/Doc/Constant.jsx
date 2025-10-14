// docEditorConstants.js

export const BASE_URL = 'http://localhost:5000/api/v1/doc';
export const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';
export const CLOUDINARY_PRESET = 'ml_default';

export const DOCUMENT_CATEGORIES = [
  { value: 'documentation', label: 'Documentation' },
  { value: 'guide', label: 'Guide' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'reference', label: 'Reference' },
  { value: 'note', label: 'Note' },
  { value: 'specification', label: 'Specification' }
];

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
];

export const PERMISSION_LEVELS = [
  { value: 'view', label: 'View Only' },
  { value: 'comment', label: 'Can Comment' },
  { value: 'edit', label: 'Can Edit' },
  { value: 'admin', label: 'Admin' }
];

export const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

export const FONT_FAMILIES = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' }
];

export const EXPORT_FORMATS = [
  { value: 'txt', label: '.txt', icon: 'FileText' },
  { value: 'html', label: '.html', icon: 'FileCode' },
  { value: 'md', label: '.md', icon: 'BookOpen' }
];

export const DEFAULT_FORMAT = {
  textColor: '#000000',
  backgroundColor: 'transparent',
  fontSize: 16,
  fontFamily: 'Arial',
  lineHeight: 1.5,
  textAlign: 'left',
};

export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
export const CURSOR_UPDATE_INTERVAL = 1000; // 1 second

export const TAB_OPTIONS = [
  { id: 'edit', label: 'Editor', icon: 'Edit3' },
  { id: 'preview', label: 'Preview', icon: 'Eye' },
  { id: 'comments', label: 'Comments', icon: 'MessageSquare' },
  { id: 'suggestions', label: 'Suggestions', icon: 'Sparkles' },
  { id: 'versions', label: 'Version History', icon: 'History' },
  { id: 'collaborators', label: 'Collaborators', icon: 'Users' },
  { id: 'media', label: 'Media & Files', icon: 'Image' },
  { id: 'analytics', label: 'Analytics', icon: 'Activity' },
  { id: 'settings', label: 'Settings', icon: 'Settings' }
];

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif'];
export const MAX_IMAGE_SIZE = 5242880; // 5MB
export const MAX_FILE_SIZE = 10485760; // 10MB