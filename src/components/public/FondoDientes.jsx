import { useEffect, useMemo, useRef, useState } from 'react';

// Fondo animado de las secciones claras de Home y del sidebar del panel admin:
// carriles diagonales de dientes dibujados a trazo (mismo lenguaje que los
// íconos de lucide) que se deslizan hacia abajo a la derecha a distintas
// velocidades.
//
// Cómo funciona: un contenedor girado RODEA la sección y apila "carriles"
// horizontales; al girarlo, el desplazamiento horizontal de cada carril se ve
// en diagonal. Cada carril es una tira que se repite cada ANCHO_TILE px y se
// traslada exactamente esa distancia, así el loop no tiene saltos.
// Es decorativo: aria-hidden, sin eventos de puntero, y se pausa fuera de
// pantalla para no gastar batería animando algo que nadie ve.

const ANCHO_TILE = 200;
const ALTO_CARRIL = 104;
const GIRO = 32; // grados; positivo = los carriles bajan hacia la derecha

// Muela en un viewBox de 24x24, con un brillo interior.
const RUTA_DIENTE =
  'M12 5.6C10.6 4.6 9.1 4 7.6 4 5 4 3.5 6 3.5 8.6c0 2 .7 3.5 1.3 5 .6 1.6.9 3.4 1.2 5.2.2 1.3.8 2.4 1.8 2.4 1.2 0 1.5-1.4 1.8-2.9.3-1.6.8-3 2.4-3s2.1 1.4 2.4 3c.3 1.5.6 2.9 1.8 2.9 1 0 1.6-1.1 1.8-2.4.3-1.8.6-3.6 1.2-5.2.6-1.5 1.3-3 1.3-5C20.5 6 19 4 16.4 4c-1.5 0-3 .6-4.4 1.6z';
const RUTA_BRILLO = 'M7 7.2c.4-.9 1.2-1.4 2.2-1.4';
const RUTA_DESTELLO = 'M0-5C.5-1.3 1.3-.5 5 0 1.3.5.5 1.3 0 5-.5 1.3-1.3.5-5 0-1.3-.5-.5-1.3 0-5z';

// Fondo blanco con dientes en un gris suave: el movimiento aporta la vida y el
// color queda reservado para el contenido (botones, cifras, íconos).
const COLOR_TRAZO = '#94a3b8'; // slate-400
const COLOR_DESTELLO = '#cbd5e1'; // slate-300

// Tres ritmos para dar profundidad: los carriles no avanzan al unísono.
const DURACIONES = [16, 23, 19];

function construirTira(color, destello, desfase) {
  // Un diente grande, uno pequeño y un destello por tile; "desfase" corre el
  // dibujo para que carriles vecinos no queden alineados en columna.
  const x = (base) => (base + desfase) % ANCHO_TILE;
  const diente = (dx, dy, escala, giro) =>
    `<g transform="translate(${dx} ${dy}) rotate(${giro} ${12 * escala} ${12 * escala}) scale(${escala})" fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="${RUTA_DIENTE}" fill="${color}" fill-opacity="0.08" stroke-width="${1.6 / escala}"/>` +
    `<path d="${RUTA_BRILLO}" stroke-width="${1.6 / escala}" stroke-opacity="0.7"/>` +
    '</g>';

  // Una figura que cae cerca del borde derecho se corta al repetirse el tile;
  // dibujarla también un tile a la izquierda completa la parte que falta.
  const repetir = (dibujar, dx) => dibujar(dx) + dibujar(dx - ANCHO_TILE);

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO_TILE}" height="${ALTO_CARRIL}" viewBox="0 0 ${ANCHO_TILE} ${ALTO_CARRIL}">` +
    `<g stroke-opacity="0.55">${repetir((dx) => diente(dx, 22, 2.5, 12), x(14))}${repetir((dx) => diente(dx, 40, 1.6, -14), x(118))}</g>` +
    repetir((dx) => `<path d="${RUTA_DESTELLO}" fill="${destello}" fill-opacity="0.55" transform="translate(${dx} 24)"/>`, x(94)) +
    '</svg>';
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// Tamaño del contenedor girado que cubre por completo una caja de w x h.
function medidasCubrientes(w, h) {
  const rad = (Math.abs(GIRO) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { ancho: w * cos + h * sin, alto: w * sin + h * cos };
}

function FondoDientes() {
  const ref = useRef(null);
  const [caja, setCaja] = useState({ ancho: 0, alto: 0 });
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return undefined;

    const medir = new ResizeObserver(([entrada]) => {
      const { width, height } = entrada.contentRect;
      setCaja(medidasCubrientes(width, height));
    });
    const visible = new IntersectionObserver(([entrada]) => setActivo(entrada.isIntersecting));

    medir.observe(nodo);
    visible.observe(nodo);
    return () => {
      medir.disconnect();
      visible.disconnect();
    };
  }, []);

  const carriles = Math.ceil(caja.alto / ALTO_CARRIL) + 1;
  const tiras = useMemo(
    () =>
      Array.from({ length: carriles }, (_, i) =>
        construirTira(COLOR_TRAZO, COLOR_DESTELLO, (i * 67) % ANCHO_TILE)
      ),
    [carriles]
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-activo={activo}
      className="fondo-dientes pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-white"
    >
      {/* La máscara vive en una capa sin girar para seguir el layout de la
          sección: los dientes se atenúan bajo la columna central de texto. */}
      <div className="fondo-dientes__mascara absolute inset-0">
        <div
          className="fondo-dientes__giro absolute left-1/2 top-1/2"
          style={{
            width: caja.ancho + ANCHO_TILE * 2,
            transform: `translate(-50%, -50%) rotate(${GIRO}deg)`,
          }}
        >
          {caja.ancho > 0 &&
            tiras.map((tira, i) => (
              <div
                key={i}
                className="fondo-dientes__carril"
                style={{
                  height: ALTO_CARRIL,
                  backgroundImage: tira,
                  '--tile': `${ANCHO_TILE}px`,
                  animationDuration: `${DURACIONES[i % DURACIONES.length]}s`,
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default FondoDientes;
