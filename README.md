# Valesca — caché de imagen y audio en segundo plano

Paquete de corrección puntual para la versión actual de `Valesca-Invitacion`.
No cambia HTML, CSS, diseño, posiciones de personajes, golpes, sonidos de efectos ni descarga de la invitación.

## Qué hace

1. **Imagen Billy y Mandy:** elimina el `objectPosition` especial; la imagen se muestra centrada con el encuadre normal. Añade `?v=2` para forzar que los navegadores soliciten la imagen nueva y no reutilicen la copia anterior de caché.
2. **Audio móvil:** suspende todo el `AudioContext` al ocultar la página o al dispararse `pagehide`. Al volver, intenta reanudar el mismo loop desde donde quedó. Si el navegador móvil exige un gesto, lo vuelve a intentar en el primer toque.

## Aplicar

1. Haz una copia de seguridad de `js/config.js`, `js/audio.js` y `js/main.js`.
2. Descomprime este ZIP en la raíz del proyecto, permitiendo reemplazar `js/config.js`.
3. Abre una terminal en la raíz del proyecto y ejecuta:

   ```bash
   node scripts/apply-audio-lifecycle-fix.cjs
   ```

   El script comprueba que los bloques originales coincidan y evita duplicar los cambios si ya están aplicados. Si encuentra una versión de código diferente, se detiene sin sobrescribir esos archivos.

4. Comprueba la sintaxis:

   ```bash
   node --check js/config.js
   node --check js/audio.js
   node --check js/main.js
   ```

5. Prueba en Live Server: comienza la música, bloquea el teléfono y vuelve a desbloquearlo. En algunos navegadores, especialmente iOS, puede ser necesario tocar una vez la página para reanudar el audio.

6. Publica:

   ```bash
   git status
   git add js/config.js js/audio.js js/main.js
   git commit -m "Pausa el audio en segundo plano y actualiza la caché de Billy y Mandy"
   git push origin main
   ```

## Caché en futuras imágenes

La ruta nueva es `assets/images/canales/Billy%20y%20Mandy.jpg?v=2`. Cuando reemplaces esa imagen otra vez, incrementa `v=2` a `v=3` para invalidar la caché anterior.

## Limitación de audio móvil

El código suspende el contexto de audio al quedar oculta la página. La reanudación automática depende del navegador y del sistema operativo; el paquete incluye un reintento al primer toque cuando el móvil exige interacción del usuario.
