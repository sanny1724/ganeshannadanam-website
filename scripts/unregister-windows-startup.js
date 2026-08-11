import fs from 'fs';
import path from 'path';

const startupFolder = path.join(
  process.env.APPDATA || '',
  'Microsoft',
  'Windows',
  'Start Menu',
  'Programs',
  'Startup'
);

const shortcutPath = path.join(startupFolder, 'AIDesktopAssistant.lnk');

try {
  if (fs.existsSync(shortcutPath)) {
    fs.unlinkSync(shortcutPath);
    console.log('✅ Removed AI Desktop Assistant from Windows Startup.');
  } else {
    console.log('ℹ️ Startup shortcut was not present.');
  }
} catch (err) {
  console.error('❌ Failed to remove startup shortcut:', err);
}
