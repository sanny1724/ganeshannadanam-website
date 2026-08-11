import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const startupFolder = path.join(
  process.env.APPDATA || '',
  'Microsoft',
  'Windows',
  'Start Menu',
  'Programs',
  'Startup'
);

const projectDir = process.cwd();
const vbsRunner = path.join(projectDir, 'start-agent-silent.vbs');
const shortcutPath = path.join(startupFolder, 'AIDesktopAssistant.lnk');

if (!fs.existsSync(startupFolder)) {
  console.error('❌ Could not locate Windows Startup folder:', startupFolder);
  process.exit(1);
}

try {
  // Use PowerShell to create a native Windows Shortcut (.lnk)
  const psCommand = `$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('${shortcutPath}'); $s.TargetPath = 'wscript.exe'; $s.Arguments = '\"${vbsRunner}\"'; $s.WorkingDirectory = '\"${projectDir}\"'; $s.Description = 'AI Desktop Assistant Auto-Starter'; $s.Save()`;

  execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });

  console.log('================================================================');
  console.log('✅ [SUCCESS] AI Desktop Assistant registered for Windows Startup!');
  console.log(`📁 Startup Shortcut: ${shortcutPath}`);
  console.log('🚀 Whenever you open or restart your laptop, the agent will:');
  console.log('   1. Wake up automatically in the background (zero terminal window).');
  console.log('   2. Monitor your offline knowledge vault and queued jobs.');
  console.log('   3. Auto-connect & check emails/jobs the moment internet is available.');
  console.log('   4. Send a desktop toast welcoming you.');
  console.log('================================================================');
} catch (err) {
  console.error('❌ Failed to create Windows startup shortcut:', err);
  process.exit(1);
}
