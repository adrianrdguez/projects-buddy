const express = require('express');
const cors = require('cors');
const { exec, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

// Endpoint principal: enviar task a Claude Code
app.post('/send-to-claude-code', async (req, res) => {
  try {
    const { prompt, targetFile, projectName, projectPath } = req.body;
    
    console.log(`🤖 Iniciando Claude Code workflow...`);
    console.log(`📁 Proyecto: ${projectName || 'N/A'}`);
    console.log(`📂 Ruta: ${projectPath || process.cwd()}`);
    console.log(`📄 Archivo objetivo: ${targetFile || 'N/A'}`);
    console.log(`📝 Prompt: ${prompt.substring(0, 50)}...`);
    
    // 1. Verificar Claude Code
    const claudeAvailable = await checkClaudeCode();
    if (!claudeAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Claude Code no está disponible'
      });
    }
    
    // 2. Directorio de trabajo
    const workingDirectory = projectPath || process.cwd();
    
    // 3. Construir prompt
    const enhancedPrompt = buildPrompt(prompt, targetFile, projectName);
    
    // 4. Ejecutar Claude Code
    let result;
    if (targetFile) {
      result = await executeClaudeCode(enhancedPrompt, targetFile, workingDirectory);
    } else {
      result = await executeClaudeCodeGeneral(enhancedPrompt, workingDirectory);
    }
    
    console.log('✅ Claude Code completado!');
    
    res.json({ 
      success: true, 
      message: '🤖 Claude Code ejecutado exitosamente!',
      result: result,
      workingDirectory: workingDirectory
    });
    
  } catch (error) {
    console.error('❌ Error en Claude Code:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error ejecutando Claude Code',
      error: error.message 
    });
  }
});

// FUNCIÓN PRINCIPAL: Ejecutar Claude Code y escribir archivo
async function executeClaudeCode(prompt, targetFile, workingDir) {
  console.log(`📄 Ejecutando Claude Code para: ${targetFile}`);
  
  const fullPrompt = `Create a complete, production-ready ${targetFile} file.

Requirements:
${prompt}

Technical requirements:
- Use TypeScript with proper type definitions
- Include error handling and loading states
- Follow React/Next.js best practices
- Use Tailwind CSS classes for styling
- Export component as default
- Make it complete and functional

IMPORTANT: Provide ONLY the complete file content. No markdown blocks, no explanations.`;

  return new Promise(async (resolve, reject) => {
    const process = spawn('claude', ['-p'], {
      cwd: workingDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    // Enviar prompt
    process.stdin.write(fullPrompt);
    process.stdin.end();
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', async (code) => {
      console.log(`📊 Recibidos ${stdout.length} caracteres de Claude`);
      
      // Check for rate limiting or other specific errors
      if (code !== 0) {
        let errorMessage = `Claude Code failed with exit code ${code}`;
        
        if (stdout.includes('5-hour limit reached') || stdout.includes('limit reached')) {
          errorMessage = 'Claude Code rate limit reached. Please try again later.';
        } else if (stdout.includes('authentication') || stdout.includes('unauthorized')) {
          errorMessage = 'Claude Code authentication error. Please check your credentials.';
        } else if (stderr) {
          errorMessage += ` Stderr: ${stderr}`;
        } else if (stdout) {
          errorMessage += ` Output: ${stdout.substring(0, 200)}`;
        }
        
        console.log(`❌ ${errorMessage}`);
        reject(new Error(errorMessage));
        return;
      }
      
      if (!stdout.trim()) {
        reject(new Error('Claude Code returned empty response'));
        return;
      }
      
      try {
        // Limpiar contenido
        let cleanContent = cleanOutput(stdout);
        
        // Escribir archivo
        const filePath = path.join(workingDir, targetFile);
        const fileDir = path.dirname(filePath);
        
        await fs.mkdir(fileDir, { recursive: true });
        await fs.writeFile(filePath, cleanContent, 'utf8');
        
        console.log(`✅ Archivo creado: ${targetFile}`);
        console.log(`📂 Ruta: ${filePath}`);
        
        // ABRIR EN CURSOR
        console.log('🚀 === ABRIENDO EN CURSOR ===');
        const opened = await openInCursor(filePath);
        console.log(`🎯 Cursor abierto: ${opened ? 'SÍ' : 'NO'}`);
        
        resolve({
          success: true,
          file: targetFile,
          path: filePath,
          cursorOpened: opened,
          contentPreview: cleanContent.substring(0, 200) + '...'
        });
        
      } catch (error) {
        reject(new Error(`Error escribiendo archivo: ${error.message}`));
      }
    });
    
    process.on('error', (error) => {
      reject(new Error(`Failed to start Claude Code: ${error.message}`));
    });
  });
}

// Función general (sin archivo específico)
async function executeClaudeCodeGeneral(prompt, workingDir) {
  console.log(`🤖 Ejecutando Claude Code general`);
  
  return new Promise((resolve, reject) => {
    const process = spawn('claude', ['-p'], {
      cwd: workingDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    
    process.stdin.write(prompt);
    process.stdin.end();
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.on('close', (code) => {
      if (code !== 0) {
        let errorMessage = `Claude Code failed with exit code ${code}`;
        
        if (stdout.includes('5-hour limit reached') || stdout.includes('limit reached')) {
          errorMessage = 'Claude Code rate limit reached. Please try again later.';
        } else if (stdout.includes('authentication') || stdout.includes('unauthorized')) {
          errorMessage = 'Claude Code authentication error. Please check your credentials.';
        } else if (stdout) {
          errorMessage += ` Output: ${stdout.substring(0, 200)}`;
        }
        
        reject(new Error(errorMessage));
        return;
      }
      
      if (!stdout.trim()) {
        reject(new Error('Claude Code returned empty response'));
        return;
      }
      
      resolve({
        success: true,
        output: stdout
      });
    });
    
    process.on('error', (error) => {
      reject(new Error(`Failed to start Claude Code: ${error.message}`));
    });
  });
}

// FUNCIÓN PARA ABRIR EN CURSOR (SÚPER SIMPLE)
async function openInCursor(filePath) {
  console.log(`🔧 Abriendo: cursor "${filePath}"`);
  
  return new Promise((resolve) => {
    exec(`cursor "${filePath}"`, { timeout: 3000 }, (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ Error abriendo Cursor: ${error.message}`);
        
        // Intentar con VSCode como fallback
        exec(`code "${filePath}"`, (codeError) => {
          if (codeError) {
            console.log(`❌ Error abriendo VSCode: ${codeError.message}`);
            resolve(false);
          } else {
            console.log(`✅ Abierto en VSCode`);
            resolve(true);
          }
        });
      } else {
        console.log(`✅ Abierto en Cursor`);
        resolve(true);
      }
    });
  });
}

// Limpiar output de Claude Code
function cleanOutput(output) {
  console.log('🧹 Limpiando output de Claude...');
  
  // Remover mensajes de rate limiting y otros metadatos
  let cleaned = output.replace(/5-hour limit reached.*?\n/g, '');
  cleaned = cleaned.replace(/resets \d+pm.*?\n/g, '');
  cleaned = cleaned.replace(/Claude Code.*?\n/g, '');
  
  // Buscar bloques de código entre ```
  const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
  const matches = [...cleaned.matchAll(codeBlockRegex)];
  
  if (matches.length > 0) {
    console.log(`📦 Encontrados ${matches.length} bloques de código`);
    // Usar el bloque más grande (probablemente el componente principal)
    const largestBlock = matches.reduce((prev, current) => 
      current[1].length > prev[1].length ? current : prev
    );
    return largestBlock[1].trim();
  }
  
  // Si no hay bloques de código, devolver el contenido limpio
  return cleaned.trim();
}

// Extraer código de la respuesta conversacional de Claude
function extractCodeFromResponse(response) {
  console.log('🔍 Extrayendo código de la respuesta...');
  
  // Buscar bloques de código entre ```
  const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
  const matches = [...response.matchAll(codeBlockRegex)];
  
  if (matches.length > 0) {
    console.log(`📦 Encontrados ${matches.length} bloques de código`);
    // Usar el bloque más grande (probablemente el componente principal)
    const largestBlock = matches.reduce((prev, current) => 
      current[1].length > prev[1].length ? current : prev
    );
    return largestBlock[1].trim();
  }
  
  // Si no hay bloques de código, buscar líneas que parecen código
  const lines = response.split('\n');
  const codeLines = [];
  let inCodeSection = false;
  
  for (const line of lines) {
    // Detectar inicio de código (imports, function, const, etc.)
    if (line.match(/^(import|export|function|const|class|interface|type)/)) {
      inCodeSection = true;
    }
    
    if (inCodeSection) {
      codeLines.push(line);
    }
    
    // Si encontramos líneas de explicación después del código, paramos
    if (inCodeSection && line.match(/^(This|The|Here|Now|You can)/)) {
      break;
    }
  }
  
  if (codeLines.length > 0) {
    console.log(`📝 Extraídas ${codeLines.length} líneas de código`);
    return codeLines.join('\n').trim();
  }
  
  console.log('⚠️  No se pudo extraer código válido');
  return response.trim(); // Como último recurso, devolver todo
}

// Construir prompt
function buildPrompt(basePrompt, targetFile, projectName) {
  let enhanced = '';
  
  if (projectName) {
    enhanced += `Project: ${projectName}\n`;
  }
  
  if (targetFile) {
    enhanced += `File: ${targetFile}\n\n`;
  }
  
  enhanced += basePrompt;
  
  return enhanced;
}

// Verificar Claude Code
async function checkClaudeCode() {
  return new Promise((resolve) => {
    exec('claude --version', (error, stdout) => {
      if (error) {
        console.log('⚠️ Claude Code no encontrado');
        resolve(false);
      } else {
        console.log(`✅ Claude Code: ${stdout.trim()}`);
        resolve(true);
      }
    });
  });
}

// Test endpoint
app.post('/test-open-cursor', async (req, res) => {
  const testFile = req.body.filePath || '/Users/ucademy/Workspace/projects-buddy/test.txt';
  
  console.log('\n🧪 TESTING CURSOR OPENING');
  console.log(`📄 File: ${testFile}`);
  
  const result = await openInCursor(testFile);
  
  res.json({
    success: result,
    message: result ? 'Cursor abierto!' : 'No se pudo abrir Cursor',
    testFile: testFile
  });
});

// Check Claude Code status endpoint
app.get('/claude-status', async (req, res) => {
  try {
    const claudeAvailable = await checkClaudeCode();
    
    if (!claudeAvailable) {
      return res.json({
        available: false,
        message: 'Claude Code CLI not found'
      });
    }
    
    // Test with a simple prompt to check rate limits
    const testResult = await new Promise((resolve) => {
      const process = spawn('claude', ['-p'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      process.stdin.write('test');
      process.stdin.end();
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        resolve({
          code,
          stdout,
          stderr,
          rateLimited: stdout.includes('5-hour limit reached') || stdout.includes('limit reached')
        });
      });
      
      process.on('error', () => {
        resolve({ code: -1, error: true });
      });
    });
    
    res.json({
      available: true,
      rateLimited: testResult.rateLimited,
      message: testResult.rateLimited ? 'Rate limit reached' : 'Available',
      details: testResult
    });
    
  } catch (error) {
    res.status(500).json({
      available: false,
      message: 'Error checking Claude Code status',
      error: error.message
    });
  }
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Claude Code Server - CLEAN VERSION'
  });
});

app.listen(port, () => {
  console.log('\n🤖 Claude Code Server LIMPIO iniciado!');
  console.log(`📡 Puerto: ${port}`);
  console.log(`📂 Directorio: ${process.cwd()}`);
  console.log('\n🎯 Funcionalidad:');
  console.log('✅ Claude Code integration');
  console.log('✅ Escritura automática de archivos');
  console.log('✅ Apertura en Cursor');
  console.log('\nEndpoints:');
  console.log('  POST /send-to-claude-code');
  console.log('  POST /test-open-cursor');
  console.log('  GET  /claude-status');
  console.log('  GET  /health');
});