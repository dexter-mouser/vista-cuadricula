// Tamaño de la hoja en cuadros (cuaderno de lado)
const TOTAL_COLUMNAS = 52;
const TOTAL_FILAS = 34;
const TRANSPARENCIA_INICIAL = 50;

const lienzo = document.getElementById('lienzo');
const controlFoto = document.getElementById('transparenciaFoto');
const valorFoto = document.getElementById('valorTransparencia');

// Reglas numeradas fuera de la hoja: un número por cuadro
function crearRegla(contenedor, cantidad) {
  for (let numero = 1; numero <= cantidad; numero++) {
    const marca = document.createElement('span');
    marca.textContent = String(numero);
    contenedor.append(marca);
  }
}

// Cuánto se ve la foto detrás de la cuadrícula
function aplicarTransparencia(porcentaje) {
  const valor = Number.isFinite(porcentaje) ? Math.min(Math.max(porcentaje, 0), 100) : TRANSPARENCIA_INICIAL;
  lienzo.style.setProperty('--opacidad-foto', String(valor / 100));
  valorFoto.textContent = `${valor} %`;
}

controlFoto.addEventListener('input', () => aplicarTransparencia(Number(controlFoto.value)));

// Transparencia predeterminada: la elegida con «Fijar» se guarda en localStorage
const CLAVE_TRANSPARENCIA = 'vista-cuadricula:transparencia';

function leerTransparenciaGuardada() {
  try {
    const guardada = localStorage.getItem(CLAVE_TRANSPARENCIA);
    if (guardada === null) return TRANSPARENCIA_INICIAL;
    const valor = Number(guardada);
    return Number.isInteger(valor) && valor >= 0 && valor <= 100 ? valor : TRANSPARENCIA_INICIAL;
  } catch {
    return TRANSPARENCIA_INICIAL;
  }
}

function fijarTransparencia() {
  const valor = Number(controlFoto.value);
  try {
    localStorage.setItem(CLAVE_TRANSPARENCIA, String(valor));
    document.getElementById('avisoFoto').textContent = `Transparencia predeterminada: ${valor} %.`;
  } catch {
    document.getElementById('avisoFoto').textContent = 'No se pudo guardar la transparencia en este navegador.';
  }
}

document.getElementById('botonFijarTransparencia').addEventListener('click', fijarTransparencia);

// Ubica la foto completa, sin recortar, empezando sobre una línea del cuaderno
function acomodarFoto() {
  const proporcion = fotoFondo.naturalWidth / fotoFondo.naturalHeight;
  if (!Number.isFinite(proporcion) || proporcion <= 0) return;

  let ancho = TOTAL_COLUMNAS;
  let alto = TOTAL_FILAS;
  if (proporcion > TOTAL_COLUMNAS / TOTAL_FILAS) {
    alto = TOTAL_COLUMNAS / proporcion;
  } else {
    ancho = TOTAL_FILAS * proporcion;
  }

  lienzo.style.setProperty('--foto-izquierda', String(Math.floor((TOTAL_COLUMNAS - ancho) / 2)));
  lienzo.style.setProperty('--foto-arriba', String(Math.floor((TOTAL_FILAS - alto) / 2)));
  lienzo.style.setProperty('--foto-ancho', String(ancho));
  lienzo.style.setProperty('--foto-alto', String(alto));
}

// Foto elegida por el usuario: se reduce y se guarda en localStorage
const CLAVE_FOTO = 'vista-cuadricula:foto';
const TAMANOS_GUARDADO = [{ lado: 1600, calidad: 0.85 }, { lado: 1000, calidad: 0.7 }];
const fotoFondo = document.getElementById('fotoFondo');
const archivoFoto = document.getElementById('archivoFoto');
const avisoFoto = document.getElementById('avisoFoto');

function leerFotoGuardada() {
  try {
    const foto = localStorage.getItem(CLAVE_FOTO);
    return foto?.startsWith('data:image/') ? foto : null;
  } catch {
    return null;
  }
}

function guardarFoto(datos) {
  try {
    localStorage.setItem(CLAVE_FOTO, datos);
    return true;
  } catch {
    return false;
  }
}

async function reducirFoto(archivo, { lado, calidad }) {
  const imagen = await createImageBitmap(archivo);
  const escala = Math.min(1, lado / Math.max(imagen.width, imagen.height));
  const lienzoTemporal = document.createElement('canvas');
  lienzoTemporal.width = Math.round(imagen.width * escala);
  lienzoTemporal.height = Math.round(imagen.height * escala);
  lienzoTemporal.getContext('2d').drawImage(imagen, 0, 0, lienzoTemporal.width, lienzoTemporal.height);
  imagen.close();
  return lienzoTemporal.toDataURL('image/jpeg', calidad);
}

function mostrarFoto(datos, esPropia) {
  fotoFondo.src = datos;
  fotoFondo.alt = esPropia ? 'Foto elegida para copiar en la cuadrícula' : fotoFondo.alt;
}

async function cambiarFoto(archivo) {
  if (!archivo?.type.startsWith('image/')) {
    avisoFoto.textContent = 'Elige un archivo de imagen.';
    return;
  }

  try {
    let datos = null;
    let seGuardo = false;
    for (const tamano of TAMANOS_GUARDADO) {
      datos = await reducirFoto(archivo, tamano);
      seGuardo = guardarFoto(datos);
      if (seGuardo) break;
    }
    mostrarFoto(datos, true);
    avisoFoto.textContent = seGuardo ? 'Foto guardada.' : 'La foto es muy pesada para guardarla: solo se verá en esta visita.';
  } catch (error) {
    console.error(error);
    avisoFoto.textContent = 'No se pudo abrir esa imagen.';
  }
}

document.getElementById('botonCambiarFoto').addEventListener('click', () => archivoFoto.click());
archivoFoto.addEventListener('change', () => {
  cambiarFoto(archivoFoto.files[0]);
  archivoFoto.value = '';
});
fotoFondo.addEventListener('load', acomodarFoto);

const fotoGuardada = leerFotoGuardada();
if (fotoGuardada) mostrarFoto(fotoGuardada, true);
if (fotoFondo.complete) acomodarFoto();

// Tema claro/oscuro: guarda la elección; si no hay, sigue al sistema
const CLAVE_TEMA = 'vista-cuadricula:tema';
const botonTema = document.getElementById('botonTema');
const textoBotonTema = botonTema.querySelector('.boton-tema__texto');

function leerTemaGuardado() {
  try {
    const tema = localStorage.getItem(CLAVE_TEMA);
    return tema === 'claro' || tema === 'oscuro' ? tema : null;
  } catch {
    return null;
  }
}

function guardarTema(tema) {
  try {
    localStorage.setItem(CLAVE_TEMA, tema);
  } catch {
    // Sin almacenamiento: el tema solo dura esta visita
  }
}

function aplicarTema(tema) {
  const esOscuro = tema === 'oscuro';
  document.documentElement.dataset.theme = esOscuro ? 'dark' : 'light';
  textoBotonTema.textContent = esOscuro ? 'Tema claro' : 'Tema oscuro';
}

const sistemaEsOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
aplicarTema(leerTemaGuardado() ?? (sistemaEsOscuro ? 'oscuro' : 'claro'));

botonTema.addEventListener('click', () => {
  const temaNuevo = document.documentElement.dataset.theme === 'dark' ? 'claro' : 'oscuro';
  aplicarTema(temaNuevo);
  guardarTema(temaNuevo);
});

crearRegla(document.getElementById('reglaSuperior'), TOTAL_COLUMNAS);
crearRegla(document.getElementById('reglaLateral'), TOTAL_FILAS);
controlFoto.value = String(leerTransparenciaGuardada());
aplicarTransparencia(Number(controlFoto.value));
