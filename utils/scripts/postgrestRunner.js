const { spawn } = require('child_process');
const path = require('path');

let postgrestProcess = null;

/**
 * Inicializa PostgREST como child_process
 * @function
 * @returns {postgrestProcess<child_process>}
 */
function startPostgrest() {
  if (postgrestProcess) return postgrestProcess; // evitar múltiples lanzamientos

  const exePath = path.resolve(__dirname, '../../.bin/postgrest.exe');
  const confPath = path.resolve(__dirname, '../../postgrest.conf');

  // Ejecuta ./postgrest.exe postgrest.conf como CMD
  postgrestProcess = spawn(exePath, [confPath]);

  postgrestProcess.stdout.on('data', (data) => {
    console.log(`[PostgREST ✅]: ${String(data).replace(/[\r\n]+/g, ' ')}`);
  });
  postgrestProcess.stderr.on('data', (data) => {
    console.log(`[PostgREST ✅]: ${String(data).replace(/[\r\n]+/g, ' ')}`);
  });

  postgrestProcess.on('close', (code) => {
    if (code === 0) {
      console.log(`[PostgREST ✅] Terminó correctamente. (Código ${code})`);
    }
    else {
      console.log(`[PostgREST ❌] Terminó con errores. (Código ${code})`);
    }
    postgrestProcess = null; // reset
  });

  return postgrestProcess;
}

module.exports = {
  startPostgrest,
};
