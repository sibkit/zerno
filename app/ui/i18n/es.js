"use strict";
/* ЗЕРНО · словарь: Español. Ключи — как в i18n/ru.js (эталон); проверка — checkLangs(). */
addLang("es",{
  name:"Español",
  strings:{
    "app.brand":"ZERNO",
    "app.title":"ZERNO — generador de ruido sin costuras",
    "app.sub":"ruido sin costuras",
    "doc.namePh":"nombre del preset",
    "bar.open":"Abrir",
    "bar.save":"Guardar",
    "bar.saveAs":"Como…",
    "stage.zoom":"zoom",
    "stage.surround":"entorno",
    "stage.grid":"Bordes",
    "stage.shift":"Desfase ½",
    "stage.smooth":"Suaviz.",
    "stage.lib":"Biblioteca",
    "st.tile":"tesela",
    "st.channels":"canales",
    "st.render":"render",
    "st.engine":"motor",
    "st.seam":"unión:",
    "st.seamExact":"exacta",
    "st.ready":"listo",
    "st.busy":"render",
    "st.error":"error",
    "st.engineVal":"RUST · {n} hilos",
    "unit.ms":"{v} ms",
    "help.title":"Ayuda",
    "sec.tile":"Tesela",
    "sec.bg":"Fondo de la tesela",
    "sec.chans":"Canales de ruido",
    "sec.out":"Salida",
    "tile.width":"Ancho",
    "tile.height":"Alto",
    "bg.color":"fondo",
    "sub.noise":"Ruido",
    "sub.shape":"Forma",
    "sub.color":"Color",
    "sub.layer":"Capa",
    "sub.dither":"Tramado",
    "sub.webp":"WebP",
    "noise.perlin":"Perlin — nubes",
    "noise.value":"Value — suave",
    "noise.worley":"Worley — manchas",
    "noise.grain":"Grano — película",
    "noise.perlin.short":"Perlin",
    "noise.value.short":"Value",
    "noise.worley.short":"Worley",
    "noise.grain.short":"Grano",
    "noise.type":"Tipo",
    "noise.spotSize":"Mancha {axis}",
    "noise.grainSize":"Grano {axis}",
    "noise.cells":{"one":"{n} celda","many":"{n} celdas","other":"{n} celdas"},
    "noise.linkXY":"vincular X=Y",
    "noise.seed":"Semilla",
    "noise.seedBad":"La semilla debe ser un entero de −2147483648 a 2147483647; se recibió «{value}».",
    "noise.octaves":"Octavas",
    "noise.gain":"Atenuación",
    "noise.lacunarity":"Lacunar.",
    "noise.ridged":"Crestas (ridged)",
    "noise.worleyMode":"Modo",
    "noise.jitter":"Dispersión",
    "noise.grainHp":"Paso alto",
    "noise.warp":"Distorsión",
    "noise.warpSize":"Escala dist.",
    "worley.f1":"F1 — manchas",
    "worley.f2":"F2 — segundo punto",
    "worley.f2f1":"F2−F1 — celdas/grietas",
    "shape.contrast":"Contraste",
    "shape.bias":"Sesgo",
    "shape.gamma":"Gamma",
    "shape.invert":"Inversión",
    "shape.normalize":"Normalizar rango",
    "stops.low":"débil",
    "stops.high":"fuerte",
    "stops.lowTitle":"ruido débil · 0",
    "stops.highTitle":"ruido fuerte · 1",
    "layer.blend":"Fusión",
    "layer.opacity":"Opacidad",
    "blend.normal":"Normal",
    "blend.multiply":"Multiplicar",
    "blend.screen":"Trama",
    "blend.overlay":"Superponer",
    "blend.hard-light":"Luz fuerte",
    "blend.soft-light":"Luz suave",
    "blend.add":"Sumar",
    "blend.subtract":"Restar",
    "blend.darken":"Oscurecer",
    "blend.lighten":"Aclarar",
    "blend.difference":"Diferencia",
    "out.stopMix":"Mezcla",
    "out.ditherMode":"Modo",
    "out.ditherAmount":"Fuerza, LSB",
    "out.webpQuality":"Calidad",
    "stopMix.oklab":"OKLab (perceptual)",
    "stopMix.srgb-linear":"sRGB lineal (físico)",
    "dither.tpdf":"TPDF (ruido)",
    "dither.ordered":"Bayer 8×8",
    "dither.off":"Desactivado",
    "color.badMode":"El modo de color guardado «{mode}» es desconocido; se usa HSL.",
    "color.clipped":"C reducida al límite de la gama sRGB: {c} (pedida: {want}).",
    "chan.copySuffix":" copia",
    "meta.octaves":"{n} oct",
    "warn.octaves":"Octavas limitadas a {cap}: en una tesela de {w}×{h}, la celda de la siguiente octava sería menor que un píxel.",
    "render.prepFail":"Error al preparar la tarea: {err}",
    "render.fail":"Error de render: {err}",
    "render.metaFail":"Error en las etiquetas de los canales: {err}",
    "file.unsaved":"sin guardar en archivo",
    "file.saved":"Guardado: {path}",
    "session.autosaveFail":"Falló el guardado automático: {err}",
    "session.restoreFail":"No se pudo restaurar la sesión anterior: {err}\nSe abrió el preset integrado.",
    "src.history":"historial de cambios",
    "src.session":"sesión anterior",
    "src.default":"preset integrado",
    "src.typeThumb":"miniatura del tipo {type}",
    "lib.title":"Biblioteca",
    "lib.dir":"Carpeta…",
    "lib.noDir":"No se ha elegido la carpeta de la biblioteca. Haz clic en «Carpeta…»: sirve cualquiera, por ejemplo presets/ de la carpeta del programa.",
    "lib.presets":{"one":"{n} preset","many":"{n} presets","other":"{n} presets"},
    "lib.skipped":", no son de ZERNO: {n} ({list})",
    "lib.errors":"Errores ({n}):",
    "lib.thumbError":"error",
    "lib.thumbFail":"Miniaturas de la biblioteca: {err}",
    "lib.delAsk":"¿Eliminar el archivo «{name}» de la carpeta de la biblioteca?\nEsta acción no se puede deshacer.",
    "lib.delTitle":"ZERNO — eliminar preset",
    "lib.delOk":"Eliminar",
    "lib.delCancel":"Cancelar",
    "lib.deleted":"Archivo eliminado: {name}",
    "lib.fail":"Biblioteca: {err}",
    "doc.opened":"Abierto: {name}  ·  Ctrl+Z recupera el documento anterior",
    "doc.openFail":"No se pudo abrir {name}: {err}",
    "doc.root":"documento",
    "dlg.libDir":"Carpeta de la biblioteca de presets",
    "dlg.open":"Abrir preset",
    "dlg.save":"Guardar preset",
    "dlg.filter":"Preset de ZERNO",
    "dlg.exportPng":"Exportar PNG",
    "dlg.exportWebp":"Exportar WebP",
    "export.saved":"{fmt} guardado: {path}  ·  {kb} KB",
    "css.comment":"{name} — tesela de {w}×{h}",
    "css.copied":"CSS copiado al portapapeles ({kb} KB con el data-URI).",
    "drop.skipped":"Omitidos (se esperaba *.json): {list}",
    "drop.many":"Presets soltados: {n}. Se abrió el primero: {first}",
    "drop.unavailable":"No se pueden arrastrar archivos: {err}",
    "preset.default":"base · lienzo oscuro",
    "preset.default.clouds":"Nubes",
    "preset.default.cells":"Manchas",
    "preset.default.grain":"Grano",
    "boot.runExe":"Ejecuta la aplicación zerno.exe.",
    "boot.badDefault":"El preset integrado no superó la validación:\n{err}",
    "engine.infoFail":"Información del motor: {err}",
    "titlebar.fail":"Color de la barra de título: {err}",
    "titlebar.part.caption":"fondo",
    "titlebar.part.text":"texto",
    "titlebar.part.border":"borde",
    "thumbs.typeFail":"No se generaron las miniaturas de los tipos de ruido: {err}",
    "lang.badSaved":"El idioma guardado «{code}» es desconocido; se usa el idioma del sistema.",
    "lang.titleFail":"No se actualizó el título de la ventana: {err}",
    "msg.inFile":"[archivo: {file}]",
    "msg.internal":"Error interno: {text}",
    "msg.doc.notObject":"{field}: se esperaba un objeto, se recibió {got}",
    "msg.doc.missing":"{field}: falta el campo (obligatorio)",
    "msg.doc.notNumber":"{field}: se esperaba un número, se recibió {got}",
    "msg.doc.range":"{field}: el valor {value} está fuera del rango [{min}; {max}]",
    "msg.doc.notInt":"{field}: se esperaba un número entero, se recibió {value}",
    "msg.doc.notBool":"{field}: se esperaba true/false, se recibió {got}",
    "msg.doc.notString":"{field}: se esperaba una cadena, se recibió {got}",
    "msg.doc.badEnum":"{field}: valor no válido \"{value}\". Valores admitidos: {allowed}",
    "msg.doc.unknownField":"{field}: campo desconocido. Campos admitidos: {allowed}",
    "msg.doc.format":"{field}: se esperaba \"{want}\", se recibió \"{got}\"",
    "msg.doc.version":"{field}: el archivo es de la versión {got}; solo se admite la {supported}",
    "msg.doc.notArray":"{field}: se esperaba un array, se recibió {got}",
    "msg.doc.json":"no se puede analizar como JSON: {detail}",
    "msg.doc.notPreset":"«{name}» no es un preset de ZERNO (falta \"format\": \"{format}\").",
    "msg.color.badHex":"HEX no válido: \"{hex}\". Se espera #RGB o #RRGGBB.",
    "msg.export.webpFail":"WebView no pudo codificar el WebP (se recibió: {got}). Guarda en PNG.",
    "msg.lib.badJson":"{name}: no se puede analizar como JSON — {detail}",
    "msg.render.degenerate":"Canal «{channel}», tipo «{type}»: el tamaño de mancha {w}×{h} px es menor que {min} px; con una cuadrícula así el ruido degenera. Aumenta el tamaño de mancha o usa el tipo «Grano», pensado para 1 px.",
    "msg.render.fieldOom":"Canal «{channel}»: memoria insuficiente para el campo de ruido de {w}×{h}",
    "msg.render.bufferOom":"Memoria insuficiente para el búfer de respuesta",
    "msg.render.tooLarge":"El área total de las tareas es demasiado grande",
    "msg.worker.crashed":"El hilo de trabajo se bloqueó: {detail}",
    "msg.settings.read":"No se puede leer {path}: {os}",
    "msg.settings.json":"{path}: no se puede analizar como JSON — {detail}",
    "msg.settings.notObject":"{path}: se esperaba un objeto",
    "msg.settings.unknownField":"{path}: campo desconocido «{field}». Admitidos: {allowed}",
    "msg.settings.missing":"{path}.{field}: falta el campo (obligatorio)",
    "msg.settings.badType":"{path}.{field}: se esperaba una cadena o null",
    "msg.settings.locked":"La configuración quedó bloqueada por un hilo que falló",
    "msg.settings.mkdir":"No se puede crear {path}: {os}",
    "msg.io.write":"No se puede escribir {path}: {os}",
    "msg.io.replace":"No se pudo reemplazar {path}: {os}",
    "msg.io.replace.cleanup":"; no se eliminó el archivo temporal {tmp}: {cleanup}",
    "msg.path.notUnicode":"La ruta no está en Unicode: {path}",
    "msg.lib.dirUnavailable":"La carpeta {path} no está disponible: {os}",
    "msg.lib.walk":"Se interrumpió el recorrido de la carpeta {path}: {os}",
    "msg.lib.nameNotUnicode":"El nombre de archivo no está en Unicode: {path}",
    "msg.lib.fileType":"{name}: no se puede determinar el tipo — {os}",
    "msg.file.read":"{path}: no se puede leer — {os}",
    "msg.file.tooLarge":"{path}: {bytes} bytes, más de {max}; no es un preset",
    "msg.lib.notChosen":"Aún no se ha elegido la carpeta de la biblioteca.",
    "msg.lib.badName":"«{name}» no es un nombre de archivo de preset de la carpeta de la biblioteca",
    "msg.lib.delete":"No se pudo eliminar {path}: {os}",
    "msg.lib.reveal":"No se pudo abrir {path}: {os}",
    "msg.file.noName":"Falta el nombre de archivo: {path}",
    "msg.dialog.badPath":"No se puede interpretar la ruta elegida: {detail}",
    "msg.titlebar.unsupported":"Windows no aceptó el color del título ({part}): HRESULT {hresult}. Solo Windows 11 permite colorear la barra de título.",
    "msg.titlebar.notWindows":"La barra de título de la ventana solo se puede colorear en Windows 11."
  },
  help:`
        <article data-topic="start" data-title="Inicio">
          <h2>Cómo se compone una tesela</h2>
          <p>Una tesela es una imagen que se repite sin costuras. Se compone de un
            <b>fondo</b> y una pila de <b>canales de ruido</b>: cada canal es un patrón de ruido
            coloreado con dos colores y superpuesto sobre lo que tiene debajo.</p>
          <h3>Flujo de trabajo</h3>
          <ol>
            <li>Tamaño de la tesela: <a data-go="tile">Tesela</a>.</li>
            <li>Color bajo el patrón: <a data-go="bg">Fondo</a>.</li>
            <li>Canales: con los botones «+ …» bajo la lista; se ajustan en la tarjeta del canal:
              <a data-go="noise">Ruido</a>, <a data-go="shape">Forma</a>,
              <a data-go="color">Color</a>, <a data-go="layer">Capa</a>.</li>
            <li>Comprobar la unión: <a data-go="stage">Escena</a>.</li>
            <li>Guardar y exportar: <a data-go="files">Archivos y exportación</a>.</li>
          </ol>
          <h3>Controles deslizantes y números</h3>
          <p>Un valor se ajusta con el control deslizante, con el número del campo de la derecha (punto y coma
            valen igual; Enter para aplicar) o arrastrando el ratón sobre el propio campo:
            con Shift, más preciso; con Ctrl, más rápido. Un número fuera de rango se ajusta a su límite.</p>
          <p>Cada cambio se ve al instante en la escena. Deshacer: Ctrl+Z; todos los atajos, en la sección
            <a data-go="keys">Teclas</a>.</p>
          <p>El icono <span class="help-i demo">?</span> de un grupo abre su sección de la ayuda.</p>
        </article>

        <article data-topic="tile" data-title="Tesela">
          <h2>Tesela</h2>
          <p>Tamaño en píxeles, de 8 a 4096 por lado. Los botones 64²…1024² fijan un
            cuadrado; «Ancho» y «Alto», cada lado por separado.</p>
          <p><b>La unión es exacta con cualquier tamaño</b>, incluso impar. El patrón de ruido
            se construye sobre una cuadrícula con un número entero de celdas por lado de la
            tesela, de modo que el borde izquierdo continúa el derecho y el superior, el inferior.</p>
          <p>Los tamaños de mancha de los canales se indican en píxeles. Al cambiar el tamaño de la
            tesela, el número de celdas se recalcula y las etiquetas «N celdas» de las tarjetas se actualizan solas.</p>
          <p>Cuanto mayor es la tesela, más tarda el cálculo: el tiempo del último fotograma aparece en la barra
            de estado inferior («render … ms»).</p>
        </article>

        <article data-topic="bg" data-title="Fondo">
          <h2>Fondo de la tesela</h2>
          <p>Color sólido bajo todos los canales. A la derecha del encabezado de la sección aparece su HEX.
            El editor es el mismo que el de los colores del canal: modos HSL y LCH, campo HEX y alfa;
            el significado de los valores se explica en la sección <a data-go="color">Color</a>.</p>
          <p><b>A</b> (alfa) por debajo de 1 hace el fondo semitransparente: el PNG y el WebP saldrán con
            transparencia, así la tesela puede superponerse a otro fondo. En la escena,
            a través de las zonas transparentes se ve el color del entorno (<a data-go="stage">Escena</a>).</p>
        </article>

        <article data-topic="chans" data-title="Canales">
          <h2>Canales de ruido</h2>
          <p>Un canal es una capa del patrón. <b>El primer canal de la lista se apoya directamente sobre el fondo</b>,
            cada uno de los siguientes va encima de los anteriores; el último es el superior. Cómo se combina
            el canal con los de abajo: <a data-go="layer">Capa</a>.</p>
          <h3>Tarjeta del canal</h3>
          <dl>
            <dt>miniatura</dt><dd>el canal por sí solo, sin el fondo ni los demás canales;</dd>
            <dt>nombre</dt><dd>se edita directamente en el encabezado;</dd>
            <dt>resumen</dt><dd>tipo · tamaño de mancha · número de octavas · modo de fusión y opacidad;</dd>
            <dt>franja</dt><dd>degradado de los colores del canal;</dd>
            <dt>● / ○</dt><dd>activar / desactivar el canal (desactivado no se dibuja, pero sigue en el documento);</dd>
            <dt>↑ ↓</dt><dd>subir / bajar en la lista;</dd>
            <dt>⧉</dt><dd>copia del canal con una nueva semilla aleatoria;</dd>
            <dt>✕</dt><dd>eliminar el canal (Ctrl+Z lo recupera);</dd>
            <dt>›</dt><dd>un clic en la tarjeta despliega y pliega sus parámetros.</dd>
          </dl>
          <p>Si en la tarjeta aparece el aviso «Octavas limitadas», parte de las octavas no
            cabe: la celda de la siguiente sería menor de 2 píxeles (<a data-go="noise">Ruido</a>).</p>
          <h3>Canal nuevo</h3>
          <p>Los botones «+ …» bajo la lista añaden un canal del tipo elegido al final de la lista, es decir,
            encima de los demás. Cada botón muestra una miniatura del patrón de ese tipo.</p>
        </article>

        <article data-topic="noise" data-title="Ruido">
          <h2>Ruido: qué patrón</h2>
          <dl>
            <dt>Tipo</dt><dd>
              <b>Perlin</b>: nubes, manchas suaves y sinuosas;
              <b>Value</b>: más suave que Perlin, menos «fibroso»;
              <b>Worley</b>: manchas y celdas alrededor de puntos aleatorios;
              <b>Grano</b>: puntos independientes, como el grano de película.</dd>
            <dt>Mancha X, Y</dt><dd>Tamaño de una celda del patrón en píxeles, en horizontal y
              vertical. Cambia <b>a saltos</b>: en cada lado de la tesela debe caber un número entero
              de celdas, si no habría una costura, así que el tamaño es siempre «lado / entero». En una
              tesela de 256, después de 128 (2 celdas) viene directamente 85.3 (3 celdas). Bajo la etiqueta
              se ve cuántas celdas hay ahora. El tamaño mínimo es 2 px y el máximo, todo el
              lado (una celda).</dd>
            <dt>Grano X, Y</dt><dd>En el tipo «Grano», tamaño de un grano, desde 1 px; también a saltos.</dd>
            <dt>vincular X=Y</dt><dd>iguala el tamaño en Y al tamaño en X.</dd>
            <dt>Semilla</dt><dd>Número de variante del patrón aleatorio: la misma semilla da el mismo patrón;
              otra da un patrón distinto con las mismas propiedades. Número entero; ⟳ genera una nueva al azar.</dd>
            <dt>Octavas</dt><dd>1–10. Cuántas capas de patrón cada vez más fino se suman:
              1 da manchas lisas; más, detalles finos más ricos. Las octavas menores de 2 px
              se descartan, y así lo indica un aviso en la tarjeta.</dd>
            <dt>Atenuación</dt><dd>0–1 (gain). Cuánto más débil es cada octava respecto a la
              anterior: 0.5, la mitad; cerca de 0, el detalle fino apenas se ve; cerca de 1,
              el detalle fino es tan intenso como las manchas grandes.</dd>
            <dt>Lacunar.</dt><dd>2–4, entero (lacunarity). Cuántas veces más fina es cada octava
              respecto a la anterior. Es entero para que también las octavas encajen sin costura.</dd>
            <dt>Crestas</dt><dd>Perlin y Value: en lugar de nubes, pliegues y crestas.</dd>
            <dt>Modo</dt><dd>Worley. <b>F1</b>: distancia al punto más cercano; manchas redondas.
              <b>F2</b>: al segundo más cercano; más grandes y angulosas.
              <b>F2−F1</b>: la diferencia; bordes finos de celdas, grietas, retícula.</dd>
            <dt>Dispersión</dt><dd>Worley, 0–1. Cuánto se desplazan los puntos respecto al centro de sus celdas:
              0, cuadrícula regular; 1, desorden total.</dd>
            <dt>Paso alto</dt><dd>Grano, 0–64 px. 0 es ruido blanco. Por encima de 0, al grano
              se le resta una copia desenfocada con ese radio: desaparecen las manchas grandes
              que delatan la repetición de la tesela (grano «azul»).</dd>
            <dt>Distorsión</dt><dd>0–400 px. El patrón se desplaza con un segundo ruido, más grande: las líneas
              se vuelven fluidas, «marmoleadas». El valor es la fuerza del desplazamiento, aproximadamente en
              píxeles; 0, sin distorsión.</dd>
            <dt>Escala dist.</dt><dd>2–2048 px. Tamaño de las ondas de la distorsión: poco, ondulación fina;
              mucho, curvas suaves. Se nota cuando la distorsión es mayor que 0.</dd>
          </dl>
        </article>

        <article data-topic="shape" data-title="Forma">
          <h2>Forma: cómo el valor del ruido se convierte en color</h2>
          <p>En cada punto, el ruido es un número de 0 (débil) a 1 (fuerte). El color del punto se toma
            del degradado del canal en esa posición (<a data-go="color">Color</a>). La forma modifica
            el número antes de colorearlo, en este orden: inversión → contraste → sesgo → gamma.</p>
          <dl>
            <dt>Contraste</dt><dd>−1…1. 0, sin cambios. Por encima de 0, la dispersión alrededor del centro
              se estira: manchas más nítidas; en 1, casi dos colores puros sin transición.
              Por debajo de 0, la dispersión se comprime hacia el centro: en −1 toda la tesela es de un solo color
              intermedio, y hacia −0.9 el patrón ya casi no se ve.</dd>
            <dt>Sesgo</dt><dd>−0.5…0.5. Se suma a todo: por encima de 0, más color del
              ruido fuerte; por debajo de 0, más del débil.</dd>
            <dt>Gamma</dt><dd>0.1–8; 1, sin cambios. Por encima de 1 predomina el color del ruido
              débil y las zonas fuertes se reducen a manchas escasas; por debajo de 1, al revés.</dd>
            <dt>Inversión</dt><dd>intercambia las zonas débiles y fuertes.</dd>
            <dt>Normalizar</dt><dd>Sin ella, al degradado se aplica el rango teórico del
              ruido, pero el real suele ser más estrecho, sobre todo con muchas octavas, y no se alcanzan
              los colores de los tiradores extremos. Con ella, la dispersión real del ruido en esta tesela
              se estira a todo el degradado.</dd>
          </dl>
        </article>

        <article data-topic="color" data-title="Color">
          <h2>Color del canal</h2>
          <p>Una barra de degradado con dos tiradores: <b>débil</b>, el color donde el ruido es 0;
            <b>fuerte</b>, donde el ruido es 1; entre ellos, una transición suave. El alfa también
            pasa de un tirador al otro.</p>
          <ul>
            <li>clic en un tirador: abre su editor; otro clic lo oculta;</li>
            <li>⇄: intercambia los colores;</li>
            <li>en qué espacio se mezclan los dos colores: <a data-go="out">Salida</a>.</li>
          </ul>
          <h3>Editor de color</h3>
          <p>El cuadrito es el color actual; el campo, su HEX (#RRGGBB, puedes escribir el tuyo).
            El selector <b>HSL / LCH</b> ofrece dos formas de editar el mismo color; la elección es común
            a todos los editores y se recuerda. La escala bajo cada control deslizante muestra
            cómo quedará el color si solo mueves ese control; por eso las escalas
            se redibujan cuando cambian los demás controles.</p>
          <h3>LCH (OKLCH)</h3>
          <dl>
            <dt>L</dt><dd>0–1, luminosidad percibida: 0, negro; 1, blanco. Con la misma L,
              colores de cualquier tono se ven igual de claros. L = 0.5 es aproximadamente el gris #636363,
              no «la mitad del brillo de la pantalla».</dd>
            <dt>C</dt><dd>0–0.33, croma: cuánto se aleja el color del gris con la misma L.
              Es un valor absoluto: 0, gris; 0.03–0.05, apenas teñido; alrededor de 0.1,
              perceptible; 0.15–0.25, vivo; alrededor de 0.32, el límite de una pantalla sRGB.</dd>
            <dt>H</dt><dd>0–360°, tono. Referencias: rojo ≈ 29, amarillo ≈ 110, verde ≈ 142,
              cian ≈ 195, azul ≈ 264, magenta ≈ 328.</dd>
          </dl>
          <p><b>La cola oscura de la escala C</b> es el croma que la pantalla no puede mostrar
            con los valores actuales de L y H. El límite varía: el amarillo solo puede ser saturado si es claro;
            el azul, solo si es oscuro; y los casi negros y casi blancos no tienen saturación alguna.
            Si la C pedida no cabe, se reduce hasta el límite, el control deslizante se desplaza
            y debajo de los controles se indica. Si vuelves a la L o H anteriores, vuelve también la C pedida.</p>
          <h3>HSL (OKHSL)</h3>
          <dl>
            <dt>H</dt><dd>0–360°, tono; el mismo ángulo que en LCH.</dd>
            <dt>S</dt><dd>0–1, saturación <b>relativa a la máxima posible</b> con esa L y H:
              1 es lo más saturado que se puede. Por eso nada se recorta, pero la misma S en
              tonos distintos da colores de intensidad visual diferente.</dd>
            <dt>L</dt><dd>0–1, luminosidad: 0, negro; 1, blanco.</dd>
          </dl>
          <p>LCH es práctico cuando los colores deben verse igual de saturados; HSL, cuando
            quieres girar los controles sin límites. En el archivo, el color se guarda siempre en OKHSL.</p>
          <h3>A</h3>
          <p>0–1, opacidad del color: 0, transparente; 1, opaco.</p>
        </article>

        <article data-topic="layer" data-title="Capa">
          <h2>Capa: cómo se combina el canal con los de abajo</h2>
          <dl>
            <dt>Fusión</dt><dd>Modo de fusión con todo lo que hay bajo el canal (el fondo y los canales anteriores
              de la lista). Se calcula en luz lineal con las fórmulas del W3C.
              <ul>
                <li><b>Normal</b>: el canal cubre lo de abajo según su opacidad;</li>
                <li><b>Multiplicar</b>: oscurece; el blanco no cambia lo de abajo, el negro da negro;</li>
                <li><b>Trama</b>: aclara; el negro no cambia lo de abajo;</li>
                <li><b>Superponer</b>: aumenta el contraste de lo de abajo: lo oscuro se oscurece, lo claro se aclara;</li>
                <li><b>Luz fuerte</b>: lo mismo, pero decide el canal: sus zonas oscuras oscurecen y las claras aclaran;</li>
                <li><b>Luz suave</b>: versión suave de Luz fuerte;</li>
                <li><b>Sumar</b>: los brillos se suman; aclara mucho;</li>
                <li><b>Restar</b>: el canal se resta de lo de abajo; oscurece;</li>
                <li><b>Oscurecer / Aclarar</b>: en cada componente queda el
                  menor / mayor de los dos;</li>
                <li><b>Diferencia</b>: valor absoluto de la diferencia; lo idéntico da negro.</li>
              </ul></dd>
            <dt>Opacidad</dt><dd>0–1, opacidad del canal entero, además del alfa de sus colores.
              0, el canal no se ve; 1, con toda su intensidad.</dd>
          </dl>
        </article>

        <article data-topic="out" data-title="Salida">
          <h2>Salida: ajustes generales del cálculo</h2>
          <dl>
            <dt>Mezcla</dt><dd>En qué espacio se calcula la transición entre los dos colores
              de cada canal. <b>OKLab</b>: uniforme a la vista, sin tonos intermedios sucios ni oscuros.
              <b>sRGB lineal</b>: como se mezcla físicamente la luz; el centro de la transición
              se ve más claro que en OKLab. No afecta a los modos de fusión
              de las capas: estos siempre se calculan en luz lineal.</dd>
            <dt>Tramado</dt><dd>Elimina las bandas (banding) en las transiciones suaves que
              aparecen al pasar a 8 bits por canal. <b>TPDF</b>: ruido imperceptible;
              <b>Bayer 8×8</b>: patrón regular; <b>Desactivado</b>: sin tramado. El negro puro
              y el alfa totalmente opaco se mantienen puros.</dd>
            <dt>Fuerza, LSB</dt><dd>0–4, intensidad del tramado en bits menos significativos: 1 es un escalón de los
              256 valores del canal.</dd>
            <dt>Calidad</dt><dd>0–1, solo para exportar a WEBP: 1.00, sin pérdidas; menos,
              archivo más pequeño, pero con artefactos de compresión.</dd>
          </dl>
        </article>

        <article data-topic="stage" data-title="Escena">
          <h2>Escena: comprobar la unión a simple vista</h2>
          <p>La escena está cubierta por completo con la tesela repetida. Una tesela, en el centro, está marcada
            con esquinas.</p>
          <dl>
            <dt>zoom</dt><dd>25–800 %. Control deslizante, rueda del ratón sobre la escena o Ctrl+= / Ctrl+−;
              «1:1», doble clic en la escena o Ctrl+0: 100 %.</dd>
            <dt>entorno</dt><dd>color del marco alrededor del mosaico; también se ve a través de las zonas
              transparentes de la tesela. Ayuda a valorar cómo luce la tesela sobre oscuro y sobre claro.</dd>
            <dt>Bordes</dt><dd>cuadrícula fina en los bordes de las teselas.</dd>
            <dt>Desfase ½</dt><dd>desplaza el mosaico media tesela: al centro de la escena llega la esquina
              donde se juntan cuatro teselas; si hubiera una costura, se vería ahí.</dd>
            <dt>Suaviz.</dt><dd>suavizado de píxeles al ampliar; sin él se ven píxeles
              nítidos.</dd>
            <dt>Biblioteca</dt><dd>mostrar / ocultar la columna derecha (<a data-go="lib">Biblioteca</a>).</dd>
          </dl>
          <p>Barra de estado inferior: disponibilidad, tamaño de la tesela, cuántos canales están activos,
            tiempo del último fotograma y cuántos hilos usa el motor.</p>
        </article>

        <article data-topic="lib" data-title="Biblioteca">
          <h2>Biblioteca de presets</h2>
          <p>La biblioteca es cualquier carpeta con archivos <code>*.json</code>. También sirve
            <code>presets/</code> de la carpeta del programa.</p>
          <dl>
            <dt>Carpeta…</dt><dd>elegir la carpeta; la elección se recuerda.</dd>
            <dt>↗</dt><dd>abrir la carpeta en el Explorador.</dd>
            <dt>↻</dt><dd>volver a leer la carpeta (si los archivos se cambiaron desde fuera).</dd>
            <dt>miniatura</dt><dd>un clic abre el preset y vincula el documento a su archivo:
              «Guardar» escribe directamente en él.</dd>
            <dt>✕ en la miniatura</dt><dd>eliminar el archivo de la carpeta, con confirmación.</dd>
          </dl>
          <p>Los archivos con errores no desaparecen en silencio: bajo el encabezado hay una lista con los motivos,
            y los <code>*.json</code> ajenos se enumeran aparte.</p>
        </article>

        <article data-topic="files" data-title="Archivos y exportación">
          <h2>Archivos y exportación</h2>
          <p>En la barra superior está el nombre del preset (se puede editar) y, a su lado, el nombre del archivo
            vinculado al documento, con un punto si hay cambios sin guardar.</p>
          <dl>
            <dt>Abrir</dt><dd>abrir un preset <code>*.json</code>; también puedes soltar el
              archivo en la ventana. Ctrl+Z después de abrir recupera el documento anterior.</dd>
            <dt>Guardar</dt><dd>escribir en el archivo vinculado; si aún no hay archivo, pregunta dónde.</dd>
            <dt>Como…</dt><dd>guardar en un archivo nuevo.</dd>
            <dt>CSS</dt><dd>copiar al portapapeles un bloque CSS: la tesela como data-URI y
              <code>background-repeat</code>.</dd>
            <dt>WEBP</dt><dd>exportar a WebP; la calidad, en la sección <a data-go="out">Salida</a>.</dd>
            <dt>PNG</dt><dd>exportar a PNG, sin pérdidas, con alfa.</dd>
          </dl>
          <p>La sesión se guarda sola: tras reiniciar se abre el mismo documento.</p>
        </article>

        <article data-topic="keys" data-title="Teclas">
          <h2>Teclado y ratón</h2>
          <table>
            <tr><td>Ctrl+Z</td><td>deshacer</td></tr>
            <tr><td>Ctrl+Y, Ctrl+Shift+Z</td><td>rehacer</td></tr>
            <tr><td>Ctrl+S</td><td>guardar</td></tr>
            <tr><td>Ctrl+Shift+S</td><td>guardar como…</td></tr>
            <tr><td>Ctrl+O</td><td>abrir preset (o suelta un *.json en la ventana)</td></tr>
            <tr><td>Ctrl+E</td><td>exportar PNG</td></tr>
            <tr><td>Ctrl+= / Ctrl+−</td><td>zoom de la escena</td></tr>
            <tr><td>Ctrl+0</td><td>zoom 1:1</td></tr>
            <tr><td>rueda sobre la escena</td><td>zoom</td></tr>
            <tr><td>doble clic en la escena</td><td>zoom 1:1</td></tr>
            <tr><td>arrastrar sobre un campo numérico</td><td>cambiar el valor; Shift, más preciso; Ctrl, más rápido</td></tr>
            <tr><td>F1</td><td>ayuda</td></tr>
            <tr><td>Esc</td><td>cerrar la ayuda</td></tr>
          </table>
        </article>
`
});
