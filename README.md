# Valesca Calle · Nivel 30 desbloqueado

Invitación interactiva vertical con estética retro de televisión/cartoon de los años 2000. Está construida con HTML, CSS y JavaScript vanilla: no necesita instalación, dependencias, servidor ni framework. Es apta para GitHub Pages.

## Verla en tu computador

1. Descarga y descomprime `valesca-30.zip`.
2. Abre la carpeta `valesca-30` en Visual Studio Code.
3. Abre `index.html` en el navegador. Para una prueba local cómoda, puedes instalar la extensión **Live Server** en VS Code, hacer clic derecho en `index.html` y elegir **Open with Live Server**. No es obligatorio.
4. Prueba la experiencia también desde un teléfono. El sonido empieza tras la primera interacción, por las restricciones habituales de los navegadores móviles.

## Añadir las seis imágenes de los canales

1. Copia tus seis imágenes a `assets/images/canales/`.
2. Puedes usar estos nombres para no cambiar el código:
   - `canal-01.jpg`
   - `canal-02.jpg`
   - `canal-03.jpg`
   - `canal-04.jpg`
   - `canal-05.jpg`
   - `canal-06.jpg`
3. Si tus imágenes son PNG o WebP, no hay problema: cambia la extensión/ruta correspondiente en `js/config.js`.
4. Las imágenes se recortan para llenar la pantalla del televisor. Conviene que el elemento importante quede cerca del centro. Si una imagen no está todavía, aparece una tarjeta de prueba en su lugar.

## Añadir los personajes del marco final

1. Copia los personajes preferiblemente como PNG o WebP con fondo transparente a `assets/images/personajes/`.
2. Para usar la configuración inicial, nómbralos `personaje-01.png`, `personaje-02.png`, y así sucesivamente hasta `personaje-08.png`.
3. Si usas otros nombres o formatos, actualiza el arreglo `characters` en `js/config.js`.
4. Para poner más o menos personajes, agrega o quita rutas de ese mismo arreglo. La distribución del marco se adapta automáticamente.
5. Los personajes se muestran en el perímetro, por detrás de la tarjeta central. Esto deja libre la zona donde se lee la invitación.

## Personalizar el texto o los golpes

- Los textos de la invitación están en `index.html`.
- El nombre y las rutas de imágenes se ajustan en `js/config.js`.
- El número de golpes está definido por `TOTAL_HITS = 7` en `js/main.js`. La lógica actual usa los golpes 1–6 para mostrar las seis imágenes, comienza a poner grietas en el golpe 5, aumenta las grietas en el 6 y rompe el televisor en el 7.
- Los efectos de sonido son síntesis original usando la Web Audio API en `js/audio.js`: encendido, estática, golpe cartoon, grietas, rotura y un chillido caricaturesco. No hacen falta archivos MP3 para probar el proyecto.
- El chillido de gato es una aproximación sintetizada, no una grabación real. Si más adelante quieres un maullido clásico más reconocible, se puede sustituir solo ese efecto por un archivo de audio que tengas derecho a usar.
- El botón **IR A LA INVITACIÓN** permite saltar la introducción en cualquier momento.
- La descarga crea un PNG vertical de alta resolución (1080 × 1920) de la cara que esté visible. Puedes descargar por separado la cara de invitación y la cara con los datos.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub, por ejemplo `valesca-30`.
2. Sube **el contenido de esta carpeta** al directorio raíz del repositorio. `index.html` debe quedar en la raíz.
3. En el repositorio, abre **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Selecciona la rama `main` y la carpeta `/(root)`, y guarda.
6. Espera a que GitHub indique que el sitio se publicó y abre la URL que aparece en esa sección.

La invitación publicada será accesible para cualquier persona que tenga el enlace. No agregues datos privados que no quieras hacer públicos.

## Nota de diseño

Se usa una composición que llena la pantalla móvil, con controles grandes para el tacto. La imagen descargada sí es exactamente vertical 9:16. En monitores grandes, la experiencia se limita a una columna estrecha para conservar el aspecto móvil.
