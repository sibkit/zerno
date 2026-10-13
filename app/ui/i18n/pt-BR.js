"use strict";
/* ЗЕРНО · словарь: Português (Brasil). Ключи — как в i18n/ru.js (эталон); проверка — checkLangs(). */
addLang("pt-BR",{
  name:"Português (Brasil)",
  strings:{
    "app.brand":"ZERNO",
    "app.title":"ZERNO — gerador de ruído sem emendas",
    "app.sub":"ruído sem emendas",
    "doc.namePh":"nome da predefinição",
    "bar.open":"Abrir",
    "bar.save":"Salvar",
    "bar.saveAs":"Como…",
    "stage.zoom":"zoom",
    "stage.surround":"fundo",
    "stage.grid":"Bordas",
    "stage.shift":"Desloc. ½",
    "stage.smooth":"Suaviz.",
    "stage.lib":"Biblioteca",
    "st.tile":"ladrilho",
    "st.channels":"canais",
    "st.render":"render",
    "st.engine":"motor",
    "st.seam":"encaixe:",
    "st.seamExact":"exato",
    "st.ready":"pronto",
    "st.busy":"render",
    "st.error":"erro",
    "st.engineVal":"RUST · {n} threads",
    "unit.ms":"{v} ms",
    "help.title":"Ajuda",
    "sec.tile":"Ladrilho",
    "sec.bg":"Fundo do ladrilho",
    "sec.chans":"Canais de ruído",
    "sec.out":"Saída",
    "tile.width":"Largura",
    "tile.height":"Altura",
    "bg.color":"fundo",
    "sub.noise":"Ruído",
    "sub.shape":"Forma",
    "sub.color":"Cor",
    "sub.layer":"Camada",
    "sub.dither":"Pontilhamento",
    "sub.webp":"WebP",
    "noise.perlin":"Perlin — nuvens",
    "noise.value":"Value — suave",
    "noise.worley":"Worley — manchas",
    "noise.grain":"Grão — filme",
    "noise.perlin.short":"Perlin",
    "noise.value.short":"Value",
    "noise.worley.short":"Worley",
    "noise.grain.short":"Grão",
    "noise.type":"Tipo",
    "noise.spotSize":"Mancha {axis}",
    "noise.grainSize":"Grão {axis}",
    "noise.cells":{"one":"{n} célula","many":"{n} células","other":"{n} células"},
    "noise.linkXY":"vincular X=Y",
    "noise.seed":"Semente",
    "noise.seedBad":"Semente — número inteiro de −2147483648 a 2147483647, recebido “{value}”.",
    "noise.octaves":"Oitavas",
    "noise.gain":"Atenuação",
    "noise.lacunarity":"Lacunar.",
    "noise.ridged":"Cristas (ridged)",
    "noise.worleyMode":"Modo",
    "noise.jitter":"Dispersão",
    "noise.grainHp":"Passa-alta",
    "noise.warp":"Distorção",
    "noise.warpSize":"Escala dist.",
    "worley.f1":"F1 — manchas",
    "worley.f2":"F2 — segundo ponto",
    "worley.f2f1":"F2−F1 — células/rachaduras",
    "shape.contrast":"Contraste",
    "shape.bias":"Viés",
    "shape.gamma":"Gama",
    "shape.invert":"Inverter",
    "shape.normalize":"Normalizar intervalo",
    "stops.low":"fraco",
    "stops.high":"forte",
    "stops.lowTitle":"ruído fraco · 0",
    "stops.highTitle":"ruído forte · 1",
    "layer.blend":"Mescla",
    "layer.opacity":"Opacid.",
    "blend.normal":"Normal",
    "blend.multiply":"Multiplicação",
    "blend.screen":"Tela",
    "blend.overlay":"Sobrepor",
    "blend.hard-light":"Luz direta",
    "blend.soft-light":"Luz suave",
    "blend.add":"Adição",
    "blend.subtract":"Subtração",
    "blend.darken":"Escurecer",
    "blend.lighten":"Clarear",
    "blend.difference":"Diferença",
    "out.stopMix":"Mescla",
    "out.ditherMode":"Modo",
    "out.ditherAmount":"Força, LSB",
    "out.webpQuality":"Qualidade",
    "stopMix.oklab":"OKLab (perceptual)",
    "stopMix.srgb-linear":"sRGB linear (físico)",
    "dither.tpdf":"TPDF (ruído)",
    "dither.ordered":"Bayer 8×8",
    "dither.off":"Desligado",
    "color.badMode":"Modo de cor salvo “{mode}” desconhecido — usando HSL.",
    "color.clipped":"C reduzida ao limite da gama sRGB: {c} (definido {want}).",
    "chan.copySuffix":" cópia",
    "meta.octaves":"{n} oit.",
    "warn.octaves":"Oitavas limitadas a {cap}: num ladrilho {w}×{h}, a célula da oitava seguinte seria menor que um pixel.",
    "render.prepFail":"Erro ao preparar a tarefa: {err}",
    "render.fail":"Erro de renderização: {err}",
    "render.metaFail":"Erro nas legendas dos canais: {err}",
    "file.unsaved":"não salvo em arquivo",
    "file.saved":"Salvo: {path}",
    "session.autosaveFail":"Falha no salvamento automático: {err}",
    "session.restoreFail":"A sessão anterior não foi restaurada: {err}\nFoi aberta a predefinição embutida.",
    "src.history":"histórico de edições",
    "src.session":"sessão anterior",
    "src.default":"predefinição embutida",
    "src.typeThumb":"miniatura do tipo {type}",
    "lib.title":"Biblioteca",
    "lib.dir":"Pasta…",
    "lib.noDir":"Nenhuma pasta de biblioteca escolhida. Clique em “Pasta…” — qualquer uma serve, por exemplo presets/ da pasta do programa.",
    "lib.presets":{"one":"{n} predefinição","many":"{n} predefinições","other":"{n} predefinições"},
    "lib.skipped":", não ZERNO: {n} ({list})",
    "lib.errors":"Erros ({n}):",
    "lib.thumbError":"erro",
    "lib.thumbFail":"Miniaturas da biblioteca: {err}",
    "lib.delAsk":"Excluir o arquivo “{name}” da pasta da biblioteca?\nEsta ação não pode ser desfeita.",
    "lib.delTitle":"ZERNO — excluir predefinição",
    "lib.delOk":"Excluir",
    "lib.delCancel":"Cancelar",
    "lib.deleted":"Arquivo excluído: {name}",
    "lib.fail":"Biblioteca: {err}",
    "doc.opened":"Aberto: {name}  ·  Ctrl+Z restaura o documento anterior",
    "doc.openFail":"Não foi possível abrir {name}: {err}",
    "doc.root":"documento",
    "dlg.libDir":"Pasta da biblioteca de predefinições",
    "dlg.open":"Abrir predefinição",
    "dlg.save":"Salvar predefinição",
    "dlg.filter":"Predefinição ZERNO",
    "dlg.exportPng":"Exportar PNG",
    "dlg.exportWebp":"Exportar WebP",
    "export.saved":"{fmt} salvo: {path}  ·  {kb} KB",
    "css.comment":"{name} — ladrilho {w}×{h}",
    "css.copied":"CSS copiado para a área de transferência ({kb} KB com o data-URI).",
    "drop.skipped":"Ignorados (esperado *.json): {list}",
    "drop.many":"Predefinições soltas: {n}. Aberta a primeira: {first}",
    "drop.unavailable":"Arrastar e soltar arquivos indisponível: {err}",
    "preset.default":"base · tela escura",
    "preset.default.clouds":"Nuvens",
    "preset.default.cells":"Manchas",
    "preset.default.grain":"Grão",
    "boot.runExe":"Execute o aplicativo zerno.exe.",
    "boot.badDefault":"A predefinição embutida não passou na validação:\n{err}",
    "engine.infoFail":"Informações do motor: {err}",
    "titlebar.fail":"Cor da barra de título: {err}",
    "titlebar.part.caption":"fundo",
    "titlebar.part.text":"texto",
    "titlebar.part.border":"borda",
    "thumbs.typeFail":"Miniaturas dos tipos de ruído não foram geradas: {err}",
    "lang.badSaved":"Idioma salvo “{code}” desconhecido — usando o idioma do sistema.",
    "lang.titleFail":"O título da janela não foi atualizado: {err}",
    "msg.inFile":"[arquivo: {file}]",
    "msg.internal":"Erro interno: {text}",
    "msg.doc.notObject":"{field}: esperado objeto, recebido {got}",
    "msg.doc.missing":"{field}: campo ausente (obrigatório)",
    "msg.doc.notNumber":"{field}: esperado número, recebido {got}",
    "msg.doc.range":"{field}: valor {value} fora do intervalo [{min}; {max}]",
    "msg.doc.notInt":"{field}: esperado número inteiro, recebido {value}",
    "msg.doc.notBool":"{field}: esperado true/false, recebido {got}",
    "msg.doc.notString":"{field}: esperado string, recebido {got}",
    "msg.doc.badEnum":"{field}: valor inválido \"{value}\". Permitidos: {allowed}",
    "msg.doc.unknownField":"{field}: campo desconhecido. Permitidos: {allowed}",
    "msg.doc.format":"{field}: esperado \"{want}\", recebido \"{got}\"",
    "msg.doc.version":"{field}: arquivo da versão {got}, só a versão {supported} é suportada",
    "msg.doc.notArray":"{field}: esperado array, recebido {got}",
    "msg.doc.json":"não é um JSON válido: {detail}",
    "msg.doc.notPreset":"“{name}” não é uma predefinição ZERNO (falta \"format\": \"{format}\").",
    "msg.color.badHex":"HEX inválido: \"{hex}\". Esperado #RGB ou #RRGGBB.",
    "msg.export.webpFail":"O WebView não codificou o WebP (recebido: {got}). Salve em PNG.",
    "msg.lib.badJson":"{name}: não é um JSON válido — {detail}",
    "msg.render.degenerate":"Canal “{channel}”, tipo “{type}”: a mancha de {w}×{h} px é menor que {min} px — numa grade assim o ruído degenera. Aumente o tamanho da mancha ou use o tipo “Grão”, feito para 1 px.",
    "msg.render.fieldOom":"Canal “{channel}”: memória insuficiente para o campo de ruído {w}×{h}",
    "msg.render.bufferOom":"Memória insuficiente para o buffer de resposta",
    "msg.render.tooLarge":"A área total das tarefas é grande demais",
    "msg.worker.crashed":"A thread de trabalho falhou: {detail}",
    "msg.settings.read":"Não foi possível ler {path}: {os}",
    "msg.settings.json":"{path}: não é um JSON válido — {detail}",
    "msg.settings.notObject":"{path}: esperado objeto",
    "msg.settings.unknownField":"{path}: campo desconhecido “{field}”. Permitidos: {allowed}",
    "msg.settings.missing":"{path}.{field}: campo ausente (obrigatório)",
    "msg.settings.badType":"{path}.{field}: esperado string ou null",
    "msg.settings.locked":"Configurações bloqueadas por uma thread que falhou",
    "msg.settings.mkdir":"Não foi possível criar {path}: {os}",
    "msg.io.write":"Não foi possível gravar {path}: {os}",
    "msg.io.replace":"Não foi possível substituir {path}: {os}",
    "msg.io.replace.cleanup":"; o arquivo temporário {tmp} não foi removido: {cleanup}",
    "msg.path.notUnicode":"O caminho não está em Unicode: {path}",
    "msg.lib.dirUnavailable":"Pasta {path} indisponível: {os}",
    "msg.lib.walk":"Leitura da pasta {path} interrompida: {os}",
    "msg.lib.nameNotUnicode":"O nome do arquivo não está em Unicode: {path}",
    "msg.lib.fileType":"{name}: não foi possível determinar o tipo — {os}",
    "msg.file.read":"{path}: não foi possível ler — {os}",
    "msg.file.tooLarge":"{path}: {bytes} bytes — mais que {max}, não é uma predefinição",
    "msg.lib.notChosen":"A pasta da biblioteca ainda não foi escolhida.",
    "msg.lib.badName":"“{name}” não é um nome de arquivo de predefinição na pasta da biblioteca",
    "msg.lib.delete":"Não foi possível excluir {path}: {os}",
    "msg.lib.reveal":"Não foi possível abrir {path}: {os}",
    "msg.file.noName":"Sem nome de arquivo: {path}",
    "msg.dialog.badPath":"Não foi possível interpretar o caminho escolhido: {detail}",
    "msg.titlebar.unsupported":"O Windows não aceitou a cor do título ({part}): HRESULT {hresult}. A coloração personalizada da barra de título só existe no Windows 11.",
    "msg.titlebar.notWindows":"A barra de título da janela só pode ser colorida no Windows 11."
  },
  help:`
        <article data-topic="start" data-title="Início">
          <h2>Como o ladrilho funciona</h2>
          <p>O ladrilho é uma imagem que se repete sem emendas. Ele é formado por um
            <b>fundo</b> e uma pilha de <b>canais de ruído</b>: cada canal é um padrão de ruído
            colorido com duas cores e aplicado sobre o que está abaixo dele.</p>
          <h3>Fluxo de trabalho</h3>
          <ol>
            <li>Tamanho do ladrilho — <a data-go="tile">Ladrilho</a>.</li>
            <li>Cor sob o padrão — <a data-go="bg">Fundo</a>.</li>
            <li>Canais — com os botões “+ …” abaixo da lista; ajustes no cartão do canal:
              <a data-go="noise">Ruído</a>, <a data-go="shape">Forma</a>,
              <a data-go="color">Cor</a>, <a data-go="layer">Camada</a>.</li>
            <li>Verificação do encaixe — <a data-go="stage">Palco</a>.</li>
            <li>Salvar e exportar — <a data-go="files">Arquivos e exportação</a>.</li>
          </ol>
          <h3>Controles deslizantes e números</h3>
          <p>O valor é definido pelo controle deslizante, pelo número no campo à direita (ponto e
            vírgula valem igualmente, Enter aplica) ou arrastando o mouse sobre o próprio campo:
            com Shift — mais preciso, com Ctrl — mais rápido. Um número fora do intervalo é ajustado ao limite mais próximo.</p>
          <p>Cada alteração aparece imediatamente no palco. Desfazer — Ctrl+Z; todos os atalhos estão na seção
            <a data-go="keys">Atalhos</a>.</p>
          <p>O ícone <span class="help-i demo">?</span> de um grupo abre a seção correspondente da ajuda.</p>
        </article>

        <article data-topic="tile" data-title="Ladrilho">
          <h2>Ladrilho</h2>
          <p>Tamanho em pixels, de 8 a 4096 em cada lado. Os botões 64²…1024² definem um
            quadrado; “Largura” e “Altura” definem cada lado separadamente.</p>
          <p><b>O encaixe é exato em qualquer tamanho</b>, inclusive ímpar. O padrão de ruído
            é construído sobre uma grade em que cada lado do ladrilho contém um número inteiro
            de células; por isso a borda esquerda continua a direita, e a superior continua a inferior.</p>
          <p>Os tamanhos das manchas nos canais são definidos em pixels. Ao mudar o tamanho do ladrilho, o número
            de células é recalculado, e as legendas “N células” nos cartões se atualizam sozinhas.</p>
          <p>Quanto maior o ladrilho, mais demorado o cálculo: o tempo do último quadro aparece na barra
            de status embaixo (“render … ms”).</p>
        </article>

        <article data-topic="bg" data-title="Fundo">
          <h2>Fundo do ladrilho</h2>
          <p>Uma cor sólida sob todos os canais. À direita, no cabeçalho da seção, aparece o seu HEX.
            O editor é o mesmo das cores do canal: modos HSL e LCH, campo HEX, alfa —
            o significado dos valores está na seção <a data-go="color">Cor</a>.</p>
          <p><b>A</b> (alfa) abaixo de 1 deixa o fundo semitransparente: o PNG e o WebP sairão com
            transparência — assim o ladrilho pode ser aplicado sobre outro fundo. No palco,
            através das áreas transparentes aparece a cor do entorno (<a data-go="stage">Palco</a>).</p>
        </article>

        <article data-topic="chans" data-title="Canais">
          <h2>Canais de ruído</h2>
          <p>Um canal é uma camada do padrão. <b>O primeiro canal da lista fica diretamente sobre o fundo</b>,
            cada um dos seguintes fica por cima dos anteriores; o último é o mais alto. Como exatamente
            o canal se aplica sobre os de baixo — <a data-go="layer">Camada</a>.</p>
          <h3>Cartão do canal</h3>
          <dl>
            <dt>miniatura</dt><dd>o canal sozinho, sem o fundo e sem os outros canais;</dd>
            <dt>nome</dt><dd>editável diretamente no cabeçalho;</dd>
            <dt>resumo</dt><dd>tipo · tamanho da mancha · número de oitavas · modo de mesclagem e opacidade;</dd>
            <dt>faixa</dt><dd>gradiente das cores do canal;</dd>
            <dt>● / ○</dt><dd>ativar / desativar o canal (um canal desativado não é desenhado, mas continua no documento);</dd>
            <dt>↑ ↓</dt><dd>mover para cima / para baixo na lista;</dd>
            <dt>⧉</dt><dd>cópia do canal com uma nova semente aleatória;</dd>
            <dt>✕</dt><dd>excluir o canal (Ctrl+Z desfaz);</dd>
            <dt>›</dt><dd>clicar no cartão expande e recolhe seus parâmetros.</dd>
          </dl>
          <p>Se aparecer no cartão o aviso “Oitavas limitadas”, parte das oitavas não
            cabe: a célula da seguinte seria menor que 2 pixels (<a data-go="noise">Ruído</a>).</p>
          <h3>Novo canal</h3>
          <p>Os botões “+ …” abaixo da lista adicionam um canal do tipo desejado ao final da lista, ou seja,
            por cima dos demais. Cada botão mostra uma miniatura do padrão daquele tipo.</p>
        </article>

        <article data-topic="noise" data-title="Ruído">
          <h2>Ruído — qual padrão</h2>
          <dl>
            <dt>Tipo</dt><dd>
              <b>Perlin</b> — nuvens, manchas suaves e sinuosas;
              <b>Value</b> — mais suave que o Perlin, menos “fibroso”;
              <b>Worley</b> — manchas e células em torno de pontos aleatórios;
              <b>Grão</b> — pontos independentes, como grão de filme.</dd>
            <dt>Mancha X, Y</dt><dd>Tamanho de uma célula do padrão em pixels, na horizontal e na
              vertical. Muda <b>em degraus</b>: cada lado do ladrilho precisa conter um número inteiro
              de células, senão haveria emenda; por isso o tamanho é sempre “lado / inteiro”. Num
              ladrilho de 256, depois de 128 (2 células) vem direto 85.3 (3 células). Abaixo da legenda
              aparece quantas células há agora. O menor tamanho é 2 px; o maior, o lado
              inteiro (uma célula).</dd>
            <dt>Grão X, Y</dt><dd>No tipo “Grão” — tamanho de um grão, a partir de 1 px; também em degraus.</dd>
            <dt>vincular X=Y</dt><dd>torna o tamanho em Y igual ao tamanho em X.</dd>
            <dt>Semente</dt><dd>Número da variante do padrão aleatório: a mesma semente gera o mesmo padrão;
              outra gera um padrão diferente com as mesmas propriedades. Número inteiro; ⟳ — nova semente aleatória.</dd>
            <dt>Oitavas</dt><dd>1–10. Quantas camadas de padrão cada vez mais fino são somadas:
              1 — manchas lisas; mais — detalhes finos mais ricos. Oitavas menores que 2 px
              são descartadas, e um aviso no cartão informa isso.</dd>
            <dt>Atenuação</dt><dd>0–1 (gain). Quantas vezes cada oitava é mais fraca que a
              anterior: 0.5 — metade; perto de 0, os detalhes finos quase não aparecem; perto de 1,
              os detalhes finos são tão fortes quanto as manchas grandes.</dd>
            <dt>Lacunar.</dt><dd>2–4, inteiro (lacunarity). Quantas vezes cada oitava é mais fina
              que a anterior. É inteiro para que as oitavas também se encaixem sem emenda.</dd>
            <dt>Cristas</dt><dd>Perlin e Value: em vez de nuvens, dobras e cristas.</dd>
            <dt>Modo</dt><dd>Worley. <b>F1</b> — distância até o ponto mais próximo: manchas redondas;
              <b>F2</b> — até o segundo mais próximo: maiores e mais angulosas;
              <b>F2−F1</b> — a diferença: bordas finas de células, rachaduras, rede.</dd>
            <dt>Dispersão</dt><dd>Worley, 0–1. Quanto os pontos se afastam do centro das células:
              0 — grade regular, 1 — desordem total.</dd>
            <dt>Passa-alta</dt><dd>Grão, 0–64 px. 0 — ruído branco. Acima de 0, uma cópia desfocada
              do grão com esse raio é subtraída dele: somem as manchas grandes que
              denunciam a repetição do ladrilho (grão “azul”).</dd>
            <dt>Distorção</dt><dd>0–400 px. O padrão é deslocado por um segundo ruído, grande — as linhas
              ficam fluidas, “marmorizadas”. O valor é a força do deslocamento, aproximadamente em
              pixels; 0 — sem distorção.</dd>
            <dt>Escala dist.</dt><dd>2–2048 px. Tamanho das ondas da distorção: pouco — ondulação fina;
              muito — curvas suaves. Tem efeito quando a distorção é maior que 0.</dd>
          </dl>
        </article>

        <article data-topic="shape" data-title="Forma">
          <h2>Forma — como o valor do ruído vira cor</h2>
          <p>Em cada ponto, o ruído é um número de 0 (fraco) a 1 (forte). A cor do ponto vem
            do gradiente do canal nessa posição (<a data-go="color">Cor</a>). A forma altera o
            número antes da coloração, nesta ordem: inverter → contraste → viés → gama.</p>
          <dl>
            <dt>Contraste</dt><dd>−1…1. 0 — sem alteração. Acima de 0, a variação em torno do meio
              se expande: manchas mais nítidas; em 1, quase duas cores puras sem transição.
              Abaixo de 0, a variação se comprime em direção ao meio: em −1 o ladrilho inteiro fica com uma só cor,
              a do meio, e por volta de −0.9 o padrão já quase não aparece.</dd>
            <dt>Viés</dt><dd>−0.5…0.5. É somado a tudo: acima de 0 — mais da cor do
              ruído forte; abaixo de 0 — mais da cor do fraco.</dd>
            <dt>Gama</dt><dd>0.1–8; 1 — sem alteração. Acima de 1 predomina a cor do ruído
              fraco, e as áreas fortes se reduzem a manchas esparsas; abaixo de 1 — o contrário.</dd>
            <dt>Inverter</dt><dd>áreas fracas e fortes trocam de lugar.</dd>
            <dt>Normalizar</dt><dd>Sem ela, o gradiente recebe o intervalo teórico do
              ruído, mas o real costuma ser mais estreito — principalmente com muitas oitavas —, e as cores das
              alças extremas não são alcançadas. Com ela, a variação real do ruído neste ladrilho
              é esticada por todo o gradiente.</dd>
          </dl>
        </article>

        <article data-topic="color" data-title="Cor">
          <h2>Cor do canal</h2>
          <p>Uma faixa de gradiente com duas alças: <b>fraco</b> — a cor onde o ruído é 0;
            <b>forte</b> — onde o ruído é 1; entre elas, uma transição suave. O alfa também
            transita de uma alça para a outra.</p>
          <ul>
            <li>clicar numa alça abre o editor dela; clicar de novo o oculta;</li>
            <li>⇄ — trocar as cores de lugar;</li>
            <li>em qual espaço as duas cores são misturadas — <a data-go="out">Saída</a>.</li>
          </ul>
          <h3>Editor de cor</h3>
          <p>O quadradinho é a cor atual; o campo é o HEX (#RRGGBB, você pode digitar o seu).
            O seletor <b>HSL / LCH</b> oferece duas formas de editar a mesma cor; a escolha vale
            para todos os editores e fica memorizada. A escala sob cada controle deslizante mostra
            como a cor ficaria se você mexesse apenas nesse controle — por isso as escalas
            são redesenhadas quando os outros controles mudam.</p>
          <h3>LCH (OKLCH)</h3>
          <dl>
            <dt>L</dt><dd>0–1, luminosidade percebida: 0 — preto, 1 — branco. O mesmo L significa
              cores igualmente claras à vista, de qualquer matiz. L = 0.5 é mais ou menos o cinza #636363,
              e não “metade do brilho da tela”.</dd>
            <dt>C</dt><dd>0–0.33, croma — quanto a cor difere do cinza com o mesmo L.
              É um valor absoluto: 0 — cinza, 0.03–0.05 — levemente tingido, em torno de 0.1 —
              perceptível, 0.15–0.25 — vivo, em torno de 0.32 — o limite de uma tela sRGB.</dd>
            <dt>H</dt><dd>0–360°, matiz. Referências: vermelho ≈ 29, amarelo ≈ 110, verde ≈ 142,
              ciano ≈ 195, azul ≈ 264, magenta ≈ 328.</dd>
          </dl>
          <p><b>A cauda escura na escala C</b> é o croma que a tela não consegue exibir com os L e H
            atuais. O limite varia: o amarelo só é saturado quando claro,
            o azul só quando escuro, e cores quase pretas ou quase brancas não têm saturação nenhuma.
            Se o C definido não couber, ele é reduzido até o limite, o controle deslizante recua,
            e um aviso aparece abaixo dos controles. Volte o L ou o H, e o C definido também volta.</p>
          <h3>HSL (OKHSL)</h3>
          <dl>
            <dt>H</dt><dd>0–360°, matiz, o mesmo ângulo do LCH.</dd>
            <dt>S</dt><dd>0–1, saturação <b>relativa à máxima possível</b> com esses L e H:
              1 — não dá para ficar mais saturado. Por isso nada é cortado, mas o mesmo S em
              matizes diferentes resulta em cores de vivacidade visualmente diferente.</dd>
            <dt>L</dt><dd>0–1, luminosidade: 0 — preto, 1 — branco.</dd>
          </dl>
          <p>O LCH é prático quando as cores precisam parecer igualmente saturadas; o HSL, quando
            você quer girar os controles sem limitações. No arquivo, a cor é sempre armazenada em OKHSL.</p>
          <h3>A</h3>
          <p>0–1, opacidade da cor: 0 — transparente, 1 — opaca.</p>
        </article>

        <article data-topic="layer" data-title="Camada">
          <h2>Camada — como o canal se aplica sobre os de baixo</h2>
          <dl>
            <dt>Mescla</dt><dd>Modo de mesclagem com tudo o que está sob o canal (o fundo e os canais acima
              dele na lista). Calculado em luz linear, pelas fórmulas do W3C.
              <ul>
                <li><b>Normal</b> — o canal cobre o que está embaixo, na medida da sua opacidade;</li>
                <li><b>Multiplicação</b> — escurece: o branco não altera o de baixo, o preto resulta em preto;</li>
                <li><b>Tela</b> — clareia: o preto não altera o de baixo;</li>
                <li><b>Sobrepor</b> — aumenta o contraste do de baixo: o escuro escurece, o claro clareia;</li>
                <li><b>Luz direta</b> — o mesmo, mas quem decide é o canal: suas áreas escuras escurecem, as claras clareiam;</li>
                <li><b>Luz suave</b> — versão suave da luz direta;</li>
                <li><b>Adição</b> — os brilhos são somados, clareia bastante;</li>
                <li><b>Subtração</b> — o canal é subtraído do de baixo, escurece;</li>
                <li><b>Escurecer / Clarear</b> — em cada componente fica o
                  menor / o maior dos dois;</li>
                <li><b>Diferença</b> — o módulo da diferença: valores iguais resultam em preto.</li>
              </ul></dd>
            <dt>Opacid.</dt><dd>0–1, opacidade do canal inteiro — aplicada por cima do alfa das suas cores.
              0 — o canal não aparece, 1 — com força total.</dd>
          </dl>
        </article>

        <article data-topic="out" data-title="Saída">
          <h2>Saída — configurações gerais do cálculo</h2>
          <dl>
            <dt>Mescla</dt><dd>Em qual espaço é calculada a transição entre as duas cores
              de cada canal. <b>OKLab</b> — uniforme ao olhar, sem meios sujos ou escuros.
              <b>sRGB linear</b> — como a luz se mistura fisicamente; o meio da transição
              parece mais claro do que no OKLab. Não afeta os modos de mesclagem
              das camadas: eles são sempre calculados em luz linear.</dd>
            <dt>Pontilhamento</dt><dd>Remove as faixas (banding) nas transições suaves que
              surgem na conversão para 8 bits por canal. <b>TPDF</b> — um ruído imperceptível;
              <b>Bayer 8×8</b> — um padrão regular; <b>Desligado</b> — sem pontilhamento. O preto
              puro e o alfa totalmente opaco permanecem puros.</dd>
            <dt>Força, LSB</dt><dd>0–4, intensidade do pontilhamento nos bits menos significativos: 1 — um degrau dos
              256 valores do canal.</dd>
            <dt>Qualidade</dt><dd>0–1, só para exportação em WEBP: 1.00 — sem perdas; menos —
              arquivo menor, porém com artefatos de compressão.</dd>
          </dl>
        </article>

        <article data-topic="stage" data-title="Palco">
          <h2>Palco — verificação visual do encaixe</h2>
          <p>O palco inteiro é preenchido com o ladrilho. Um ladrilho fica no centro, marcado
            por cantoneiras.</p>
          <dl>
            <dt>zoom</dt><dd>25–800 %. Controle deslizante, roda do mouse sobre o palco ou Ctrl+= / Ctrl+−;
              “1:1”, clique duplo no palco ou Ctrl+0 — 100 %.</dd>
            <dt>fundo</dt><dd>cor do entorno ao redor do preenchimento; ela também aparece através das áreas
              transparentes do ladrilho. Ajuda a avaliar como o ladrilho fica sobre fundos escuros e claros.</dd>
            <dt>Bordas</dt><dd>uma grade fina nas bordas dos ladrilhos.</dd>
            <dt>Desloc. ½</dt><dd>desloca a disposição em meio ladrilho: no centro do palco fica o canto
              onde quatro ladrilhos se encontram — se houvesse uma emenda, ela apareceria ali.</dd>
            <dt>Suaviz.</dt><dd>suavização dos pixels ao ampliar; sem ela, os pixels aparecem
              nítidos.</dd>
            <dt>Biblioteca</dt><dd>mostrar / ocultar a coluna da direita (<a data-go="lib">Biblioteca</a>).</dd>
          </dl>
          <p>Barra de status embaixo: estado, tamanho do ladrilho, quantos canais estão ativos,
            tempo do último quadro e quantas threads o motor usa no cálculo.</p>
        </article>

        <article data-topic="lib" data-title="Biblioteca">
          <h2>Biblioteca de predefinições</h2>
          <p>A biblioteca é qualquer pasta com arquivos <code>*.json</code>. A pasta
            <code>presets/</code> da pasta do programa também serve.</p>
          <dl>
            <dt>Pasta…</dt><dd>escolher a pasta; a escolha fica memorizada.</dd>
            <dt>↗</dt><dd>abrir a pasta no Explorador.</dd>
            <dt>↻</dt><dd>reler a pasta (se os arquivos foram alterados por fora).</dd>
            <dt>miniatura</dt><dd>um clique abre a predefinição e vincula o documento ao arquivo dela:
              “Salvar” grava diretamente nele.</dd>
            <dt>✕ na miniatura</dt><dd>excluir o arquivo da pasta, com confirmação.</dd>
          </dl>
          <p>Arquivos com erros não somem em silêncio: abaixo do cabeçalho há uma lista com os motivos,
            e arquivos <code>*.json</code> alheios são listados à parte.</p>
        </article>

        <article data-topic="files" data-title="Arquivos e exportação">
          <h2>Arquivos e exportação</h2>
          <p>No painel superior ficam o nome da predefinição (editável) e, ao lado, o nome do arquivo
            vinculado ao documento, além de um ponto se houver alterações não salvas.</p>
          <dl>
            <dt>Abrir</dt><dd>abrir uma predefinição <code>*.json</code>; também dá para simplesmente soltar
              o arquivo na janela. Ctrl+Z depois de abrir restaura o documento anterior.</dd>
            <dt>Salvar</dt><dd>gravar no arquivo vinculado; se ainda não houver arquivo, pergunta onde salvar.</dd>
            <dt>Como…</dt><dd>salvar num novo arquivo.</dd>
            <dt>CSS</dt><dd>copiar para a área de transferência um bloco CSS: o ladrilho como data-URI e
              <code>background-repeat</code>.</dd>
            <dt>WEBP</dt><dd>exportar em WebP; a qualidade fica na seção <a data-go="out">Saída</a>.</dd>
            <dt>PNG</dt><dd>exportar em PNG, sem perdas, com alfa.</dd>
          </dl>
          <p>A sessão é salva automaticamente: depois de reiniciar, o mesmo documento estará aberto.</p>
        </article>

        <article data-topic="keys" data-title="Atalhos">
          <h2>Teclado e mouse</h2>
          <table>
            <tr><td>Ctrl+Z</td><td>desfazer</td></tr>
            <tr><td>Ctrl+Y, Ctrl+Shift+Z</td><td>refazer</td></tr>
            <tr><td>Ctrl+S</td><td>salvar</td></tr>
            <tr><td>Ctrl+Shift+S</td><td>salvar como…</td></tr>
            <tr><td>Ctrl+O</td><td>abrir predefinição (ou solte um *.json na janela)</td></tr>
            <tr><td>Ctrl+E</td><td>exportar PNG</td></tr>
            <tr><td>Ctrl+= / Ctrl+−</td><td>zoom do palco</td></tr>
            <tr><td>Ctrl+0</td><td>zoom 1:1</td></tr>
            <tr><td>roda do mouse sobre o palco</td><td>zoom</td></tr>
            <tr><td>clique duplo no palco</td><td>zoom 1:1</td></tr>
            <tr><td>arrastar sobre um campo numérico</td><td>alterar o valor; Shift — mais preciso, Ctrl — mais rápido</td></tr>
            <tr><td>F1</td><td>ajuda</td></tr>
            <tr><td>Esc</td><td>fechar a ajuda</td></tr>
          </table>
        </article>
`
});
