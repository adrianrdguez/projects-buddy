const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Función para dormir/esperar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para ejecutar AppleScript (Mac) o PowerShell (Windows)
function executeAutomation(script, platform) {
  return new Promise((resolve, reject) => {
    let command;
    
    if (platform === 'darwin') {
      // Mac: usar AppleScript
      command = `osascript -e '${script}'`;
    } else if (platform === 'win32') {
      // Windows: usar PowerShell
      command = `powershell -Command "${script}"`;
    } else {
      // Linux: intentar con xdotool
      command = script;
    }
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`⚠️  Automation warning: ${error.message}`);
        resolve(false); // No fallar, solo avisar
      } else {
        console.log('✅ Automation executed');
        resolve(true);
      }
    });
  });
}

// Endpoint principal: enviar task a Cursor CON AUTOMACIÓN COMPLETA
app.post('/send-to-cursor', async (req, res) => {
  try {
    const { prompt, targetFile, projectName } = req.body;
    
    console.log(`🚀 Iniciando workflow automático...`);
    console.log(`📁 Archivo objetivo: ${targetFile || 'N/A'}`);
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
    
    // 1. Construir prompt mejorado
    const enhancedPrompt = buildEnhancedPrompt(prompt, targetFile, projectName);
    
    // 2. Detectar plataforma
    const platform = process.platform;
    console.log(`🖥️  Plataforma detectada: ${platform}`);
    
    // 3. Copiar al clipboard según la plataforma
    await copyToClipboard(enhancedPrompt, platform);
    
    // 4. Abrir/Enfocar Cursor
    await openCursor(platform);
    
    // 5. Esperar un momento para que Cursor se enfoque
    console.log('⏳ Esperando que Cursor se enfoque...');
    await sleep(2000);
    
    // 6. Abrir chat de Cursor (Cmd+L / Ctrl+L)
    await openCursorChat(platform);
    
    // 7. Esperar un momento y pegar
    console.log('⏳ Esperando que el chat se abra...');
    await sleep(1000);
    
    // 8. Pegar el prompt (Cmd+V / Ctrl+V)
    await pastePrompt(platform);
    
    // 9. Opcional: Enviar automáticamente (Enter)
    await sleep(500);
    await sendMessage(platform);
    
    console.log('🎉 ¡Workflow completo! Cursor debería estar procesando tu prompt.');
    
    res.json({ 
      success: true, 
      message: '🎉 ¡Completamente automatizado! Cursor está procesando tu prompt.',
      workflow: [
        '✅ Prompt optimizado creado',
        '✅ Copiado al clipboard', 
        '✅ Cursor abierto y enfocado',
        '✅ Chat abierto (Cmd/Ctrl + L)',
        '✅ Prompt pegado (Cmd/Ctrl + V)',
        '✅ Mensaje enviado (Enter)'
      ],
      enhancedPrompt 
    });
    
  } catch (error) {
    console.error('❌ Error en automation:', error);
    
    // Fallback: mostrar prompt en consola
    const enhancedPrompt = buildEnhancedPrompt(req.body.prompt, req.body.targetFile, req.body.projectName);
    console.log('\n📋 FALLBACK - COPIA ESTE PROMPT MANUALMENTE:');
    console.log('=====================================');
    console.log(enhancedPrompt);
    console.log('=====================================\n');
    
    res.json({ 
      success: false, 
      message: '⚠️ Automation falló, pero Cursor se abrió. Copia el prompt de la consola manualmente.',
      enhancedPrompt,
      error: error.message 
    });
  }
});

// Funciones de automatización por plataforma
async function copyToClipboard(text, platform) {
  console.log('📋 Copiando al clipboard...');
  
  if (platform === 'darwin') {
    // Mac: usar pbcopy
    return new Promise((resolve) => {
      const proc = exec('pbcopy');
      proc.stdin.write(text);
      proc.stdin.end();
      proc.on('close', () => {
        console.log('✅ Copiado al clipboard (Mac)');
        resolve();
      });
    });
  } else if (platform === 'win32') {
    // Windows: usar clip
    return new Promise((resolve) => {
      const proc = exec('clip');
      proc.stdin.write(text);
      proc.stdin.end();
      proc.on('close', () => {
        console.log('✅ Copiado al clipboard (Windows)');
        resolve();
      });
    });
  } else {
    // Linux: usar xclip si está disponible
    return new Promise((resolve) => {
      exec('which xclip', (error) => {
        if (error) {
          console.log('⚠️  xclip no disponible en Linux');
          resolve();
        } else {
          const proc = exec('xclip -selection clipboard');
          proc.stdin.write(text);
          proc.stdin.end();
          proc.on('close', () => {
            console.log('✅ Copiado al clipboard (Linux)');
            resolve();
          });
        }
      });
    });
  }
}

async function openCursor(platform) {
  console.log('🚀 Abriendo/enfocando Cursor...');
  
  if (platform === 'darwin') {
    // Mac: usar open -a para enfocar
    await executeAutomation('tell application "Cursor" to activate', platform);
  } else if (platform === 'win32') {
    // Windows: intentar enfocar ventana
    await executeAutomation('Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.Interaction]::AppActivate("Cursor")', platform);
  } else {
    // Linux: usar wmctrl si está disponible
    exec('wmctrl -a Cursor', (error) => {
      if (error) console.log('⚠️  wmctrl no disponible, intentando cursor &');
      else console.log('✅ Cursor enfocado (Linux)');
    });
  }
}

async function openCursorChat(platform) {
  console.log('💬 Abriendo chat de Cursor (Cmd/Ctrl + L)...');
  
  if (platform === 'darwin') {
    // Mac: Cmd + L
    const script = 'tell application "System Events" to keystroke "l" using command down';
    await executeAutomation(script, platform);
  } else if (platform === 'win32') {
    // Windows: Ctrl + L  
    const script = 'Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("^l")';
    await executeAutomation(script, platform);
  } else {
    // Linux: Ctrl + L con xdotool
    await executeAutomation('xdotool key ctrl+l', platform);
  }
}

async function pastePrompt(platform) {
  console.log('📝 Pegando prompt (Cmd/Ctrl + V)...');
  
  if (platform === 'darwin') {
    // Mac: Cmd + V
    const script = 'tell application "System Events" to keystroke "v" using command down';
    await executeAutomation(script, platform);
  } else if (platform === 'win32') {
    // Windows: Ctrl + V
    const script = 'Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("^v")';
    await executeAutomation(script, platform);
  } else {
    // Linux: Ctrl + V con xdotool
    await executeAutomation('xdotool key ctrl+v', platform);
  }
}

async function sendMessage(platform) {
  console.log('🚀 Enviando mensaje (Enter)...');
  
  if (platform === 'darwin') {
    // Mac: Enter
    const script = 'tell application "System Events" to keystroke return';
    await executeAutomation(script, platform);
  } else if (platform === 'win32') {
    // Windows: Enter
    const script = 'Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")';
    await executeAutomation(script, platform);
  } else {
    // Linux: Enter con xdotool
    await executeAutomation('xdotool key Return', platform);
  }
}

function buildEnhancedPrompt(basePrompt, targetFile, projectName) {
  let enhancedPrompt = `# 🎯 Task from AI Planner\n\n`;
  
  if (projectName) {
    enhancedPrompt += `**Project:** ${projectName}\n`;
  }
  
  if (targetFile) {
    enhancedPrompt += `**Target file:** \`${targetFile}\`\n\n`;
  }
  
  enhancedPrompt += `**Instructions:**\n${basePrompt}\n\n`;
  enhancedPrompt += `**Additional requirements:**\n`;
  enhancedPrompt += `- Use TypeScript with proper type definitions\n`;
  enhancedPrompt += `- Include error handling and loading states\n`;
  enhancedPrompt += `- Follow React/Next.js best practices\n`;
  enhancedPrompt += `- Add basic comments for complex logic\n`;
  enhancedPrompt += `- Ensure code is production-ready\n\n`;
  enhancedPrompt += `*Generated by AI Planner - ${new Date().toLocaleTimeString()}*`;
  
  return enhancedPrompt;
}

// Endpoint de prueba para verificar automación paso a paso
app.post('/test-automation', async (req, res) => {
  const platform = process.platform;
  console.log(`🧪 Probando automation en ${platform}...`);
  
  try {
    console.log('1. Copiando texto de prueba...');
    await copyToClipboard('Hello from AI Planner automation test!', platform);
    
    console.log('2. Abriendo Cursor...');
    await openCursor(platform);
    await sleep(2000);
    
    console.log('3. Abriendo chat...');
    await openCursorChat(platform);
    await sleep(1000);
    
    console.log('4. Pegando...');
    await pastePrompt(platform);
    
    res.json({ success: true, message: 'Test completo! Revisa Cursor.' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', platform: process.platform });
});

app.listen(port, () => {
  console.log('🤖 Cursor Automation Server iniciado!');
  console.log(`📡 Servidor corriendo en http://localhost:${port}`);
  console.log(`🖥️  Plataforma: ${process.platform}`);
  console.log('\n🎯 Workflow completamente automatizado:');
  console.log('1. HTML → Servidor');
  console.log('2. Copia al clipboard');
  console.log('3. Abre/enfoca Cursor'); 
  console.log('4. Abre chat (Cmd/Ctrl + L)');
  console.log('5. Pega prompt (Cmd/Ctrl + V)');
  console.log('6. Envía mensaje (Enter)');
  console.log('\n🧪 Endpoints:');
  console.log('   POST /send-to-cursor     - Workflow completo');
  console.log('   POST /test-automation    - Prueba paso a paso');
});