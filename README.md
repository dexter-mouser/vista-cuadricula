# Vista en cuadrícula

Página para copiar a mano la foto de la vista desde una ventana en un cuaderno cuadriculado. Muestra una hoja con la misma cuadrícula del cuaderno (52 × 34 cuadros, con el cuaderno de lado) y la foto detrás, para copiarla cuadro por cuadro.

**Página publicada:** https://dexter-mouser.github.io/vista-cuadricula/

## Cómo ejecutarlo

Abre `index.html` en el navegador o sírvelo en local:

```bash
npx -y http-server@14.1.1 -p 5181 -c-1
```

y entra a `http://localhost:5181`.

El deslizador «Foto visible» ajusta cuánto se ve la foto detrás de la cuadrícula; «Restablecer 50 %» lo devuelve a la mitad. «Cambiar foto» abre tus archivos para usar otra foto, que queda guardada en el navegador. El botón de arriba a la derecha cambia entre tema claro y oscuro.

## Estructura

```
index.html      Cabecera, hoja cuadriculada con la foto detrás, deslizador y botones «Restablecer 50 %» y «Cambiar foto»
style.css       Colores y tema, hoja de papel reciclado, reglas y diseño responsive
app.js          Reglas numeradas, transparencia, foto guardada y su posición, tema claro/oscuro
img/vista.jpg   Foto por defecto (proporción 4:3)
```

## Cómo funciona

- **Cuadrícula:** el tamaño de la hoja sale de `--columnas` y `--filas` en `style.css` y de `TOTAL_COLUMNAS` y `TOTAL_FILAS` en `app.js`. Son las medidas contadas en el cuaderno (34 × 52 en vertical, usado de lado). Si cambias de cuaderno, cambia los dos sitios.
- **Números:** fuera de la hoja, arriba va el número de cada columna y a la izquierda el de cada fila.
- **Foto:** va debajo de la cuadrícula, completa y sin recortar. `app.js` calcula su tamaño en cuadros según su proporción, la centra y redondea la esquina a una línea del cuaderno (variables `--foto-izquierda`, `--foto-arriba`, `--foto-ancho` y `--foto-alto`). La foto por defecto ocupa las 34 filas y empieza en la columna 4.
- **Foto propia:** al elegirla se reduce en un `<canvas>` a JPEG de 1600 px como máximo y se guarda como data URL en `localStorage` (clave `vista-cuadricula:foto`). Si no cabe, se intenta con 1000 px; si tampoco, se muestra solo en esa visita. Al cargar, una foto guardada reemplaza a `img/vista.jpg`. Para volver a la original hay que borrar los datos del sitio en el navegador.
- **Transparencia:** empieza en 50 % (`TRANSPARENCIA_INICIAL` en `app.js`) y no se guarda; el botón «Restablecer 50 %» vuelve a ese valor.
- **Tamaño del cuadro (`--cuadro`):** 20 px en escritorio, 13 px en tableta y 8 px en móvil. Si la hoja no cabe, se desplaza dentro de su marco, sin mover la página.
- **Tema:** los colores son variables CSS en `:root`; el tema oscuro las redefine con `data-theme="dark"` en `<html>`. Sin elección guardada se sigue el tema del sistema; la elección se guarda en `localStorage`.
- **Libreta:** la hoja usa color de papel reciclado (`--hoja`) y es igual en los dos temas.
- **Cambiar la foto por defecto:** reemplaza `img/vista.jpg`; se acomoda sola.
