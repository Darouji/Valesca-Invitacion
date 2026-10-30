ACTUALIZACIÓN · VALESCA CALLE

Incluye cambios para el marco final y el canal Billy y Mandy.

Archivos a reemplazar dentro del proyecto:
- index.html
- css/styles.css
- js/config.js
- js/main.js

Conserva js/audio.js y todas las imágenes que ya tienes.

NUEVOS PNG QUE DEBEN ESTAR EN ESTA RUTA:
- assets/images/personajes/Billy.png
- assets/images/personajes/Mandy.png

Los dos PNG se utilizan juntos en la cuarta sintonización (después de Ed, Edd y Eddie y antes de Finn) y también aparecen por separado en el marco final. Si sus nombres tienen otra capitalización, corrige esas dos rutas en js/config.js. En GitHub Pages las mayúsculas importan.

La secuencia pasa a 7 canales y 8 golpes en total: los golpes 1 a 7 muestran canal; en el 6 y 7 aparecen las grietas, y el octavo rompe el televisor.

Ajustes del marco: Las chicas y Ed/Edd/Eddie se muestran más hacia dentro; Ben tiene más área visible; Samurai Jack se desplaza a la esquina superior derecha; Finn ya no tapa el indicador. Cada personaje flota con un ritmo y una amplitud diferentes. El texto TOCA PARA VOLTEAR sube y tiene un pulso de neón.

Nota: al revisar Darouji/Valesca-Invitacion/main, la rama remota todavía no muestra los archivos Billy.png ni Mandy.png ni el PNG adicional que sustituirá el hueco de Pikachu. Este paquete asume que Billy.png y Mandy.png estarán en la carpeta indicada. Los archivos nuevos deberán estar confirmados y subidos a GitHub para que GitHub Pages pueda servirlos.

Prueba la primera visita con ?resetIntro=1. La finalización se guarda localmente en localStorage.
