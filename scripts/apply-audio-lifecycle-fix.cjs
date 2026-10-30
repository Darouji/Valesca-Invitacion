#!/usr/bin/env node
/*
 * Aplica de forma segura la pausa/reanudación de audio al proyecto Valesca.
 * Ejecutar desde la raíz del repositorio: node scripts/apply-audio-lifecycle-fix.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function readProjectFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`No se encontró ${relativePath}. Ejecuta este script desde la raíz del proyecto.`);
  }
  return { absolutePath, content: fs.readFileSync(absolutePath, 'utf8') };
}

function replaceExactlyOnce(source, oldText, newText, label) {
  if (source.includes(newText)) {
    console.log(`Ya aplicado: ${label}`);
    return source;
  }
  const first = source.indexOf(oldText);
  if (first < 0 || source.indexOf(oldText, first + oldText.length) >= 0) {
    throw new Error(`No pude identificar de forma segura el bloque de ${label}. No se modificó el archivo correspondiente.`);
  }
  return source.slice(0, first) + newText + source.slice(first + oldText.length);
}

function writeIfChanged(file, content) {
  if (content !== file.content) {
    fs.writeFileSync(file.absolutePath, content, 'utf8');
    console.log(`Actualizado: ${path.relative(root, file.absolutePath)}`);
  }
}

const audioFile = readProjectFile('js/audio.js');
let audio = audioFile.content;

audio = replaceExactlyOnce(
  audio,
  '  let musicBus = null;\n',
  '  let musicBus = null;\n  // Recuerda si la música estaba sonando antes de que el móvil pasara a segundo plano.\n  let resumeMusicAfterBackground = false;\n',
  'estado de reanudación del audio',
);

audio = replaceExactlyOnce(
  audio,
  `  async function unlock() {\n    const ctx = getContext();\n    if (ctx && ctx.state === "suspended") {\n      try {\n        await ctx.resume();\n      } catch (_) {\n        /* El navegador puede bloquear el audio. */\n      }\n    }\n    return !!ctx;\n  }`,
  `  async function unlock() {\n    const ctx = getContext();\n    if (\n      ctx &&\n      !document.hidden &&\n      (ctx.state === "suspended" || ctx.state === "interrupted")\n    ) {\n      try {\n        await ctx.resume();\n      } catch (_) {\n        /* El navegador puede bloquear el audio. */\n      }\n    }\n    if (ctx?.state === "running") {\n      resumeMusicAfterBackground = false;\n    }\n    return !!ctx;\n  }`,
  'función unlock()',
);

audio = replaceExactlyOnce(
  audio,
  `  function setEnabled(value) {\n    enabled = !!value;\n    const ctx = getContext();`,
  `  function setEnabled(value) {\n    enabled = !!value;\n    if (!enabled) resumeMusicAfterBackground = false;\n    const ctx = getContext();`,
  'función setEnabled()',
);

audio = replaceExactlyOnce(
  audio,
  `  function stopMusic() {\n    if (!context || !musicSource) return;`,
  `  function stopMusic() {\n    resumeMusicAfterBackground = false;\n    if (!context || !musicSource) return;`,
  'función stopMusic()',
);

const lifecycleFunctions = `  // Suspende todo el AudioContext: música, efectos y cualquier sonido en curso.\n  function pauseForBackground() {\n    if (!context || context.state === "closed") return;\n\n    // El loop existe mientras estaba sonando; conservar esta marca también si iOS\n    // cambia el estado del contexto a "interrupted" antes de disparar el evento.\n    if (enabled && musicSource) {\n      resumeMusicAfterBackground = true;\n    }\n\n    if (context.state === "running" || context.state === "interrupted") {\n      context.suspend().catch(() => {\n        // El sistema operativo puede haber suspendido el contexto primero.\n      });\n    }\n  }\n\n  // Reanuda la misma fuente musical desde el punto en que quedó pausada.\n  async function resumeFromBackground() {\n    if (\n      !context ||\n      document.hidden ||\n      !enabled ||\n      !resumeMusicAfterBackground\n    ) {\n      return false;\n    }\n\n    if (context.state === "suspended" || context.state === "interrupted") {\n      try {\n        await context.resume();\n      } catch (_) {\n        // Algunos móviles necesitan una interacción al volver a la página.\n      }\n    }\n\n    if (context.state === "running") {\n      resumeMusicAfterBackground = false;\n      return true;\n    }\n\n    return false;\n  }\n\n`;

audio = replaceExactlyOnce(
  audio,
  '  function powerOn() {',
  lifecycleFunctions + '  function powerOn() {',
  'funciones de pausa/reanudación',
);

audio = replaceExactlyOnce(
  audio,
  '    stopMusic,\n    powerOn,',
  '    stopMusic,\n    pauseForBackground,\n    resumeFromBackground,\n    powerOn,',
  'exportación de las funciones de audio',
);

const mainFile = readProjectFile('js/main.js');
let main = mainFile.content;
main = replaceExactlyOnce(
  main,
  `  soundToggle.addEventListener("click", toggleSound);\n  soundToggleInvite?.addEventListener("click", toggleSound);\n`,
  `  soundToggle.addEventListener("click", toggleSound);\n  soundToggleInvite?.addEventListener("click", toggleSound);\n\n  // Pausar todo el audio cuando el móvil bloquea la pantalla o la página queda oculta.\n  document.addEventListener("visibilitychange", () => {\n    if (document.hidden) {\n      window.InviteAudio?.pauseForBackground();\n    } else {\n      void window.InviteAudio?.resumeFromBackground();\n    }\n  });\n\n  // Respaldo para navegadores que suspenden/restauran la página con pagehide/pageshow.\n  window.addEventListener("pagehide", () => {\n    window.InviteAudio?.pauseForBackground();\n  });\n\n  window.addEventListener("pageshow", () => {\n    if (!document.hidden) {\n      void window.InviteAudio?.resumeFromBackground();\n    }\n  });\n\n  // En algunos móviles se necesita un nuevo gesto para permitir reanudar el audio.\n  document.addEventListener(\n    "pointerdown",\n    () => {\n      if (!document.hidden) {\n        void window.InviteAudio?.resumeFromBackground();\n      }\n    },\n    { passive: true },\n  );\n`,
  'listeners de ciclo de vida en main.js',
);

// Escribe al final: si un bloque no coincide, el script se detiene antes de sobrescribirlo.
writeIfChanged(audioFile, audio);
writeIfChanged(mainFile, main);
console.log('\nListo. Ahora ejecuta:');
console.log('  node --check js/audio.js');
console.log('  node --check js/main.js');
