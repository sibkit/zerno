"use strict";
/* ЗЕРНО · словарь: Deutsch. Ключи — как в i18n/ru.js (эталон); проверка — checkLangs(). */
addLang("de",{
  name:"Deutsch",
  strings:{
    "app.brand":"ZERNO",
    "app.title":"ZERNO — Generator für nahtloses Rauschen",
    "app.sub":"nahtloses Rauschen",
    "doc.namePh":"Preset-Name",
    "bar.open":"Öffnen",
    "bar.save":"Speichern",
    "bar.saveAs":"Als…",
    "stage.zoom":"Zoom",
    "stage.surround":"Umfeld",
    "stage.grid":"Ränder",
    "stage.shift":"Versatz ½",
    "stage.smooth":"Glätten",
    "stage.lib":"Bibliothek",
    "st.tile":"Kachel",
    "st.channels":"Kanäle",
    "st.render":"Render",
    "st.engine":"Engine",
    "st.seam":"Naht:",
    "st.seamExact":"exakt",
    "st.ready":"bereit",
    "st.busy":"rendert",
    "st.error":"Fehler",
    "st.engineVal":"RUST · {n} Thr.",
    "unit.ms":"{v} ms",
    "help.title":"Hilfe",
    "sec.tile":"Kachel",
    "sec.bg":"Hintergrund",
    "sec.chans":"Rauschkanäle",
    "sec.out":"Ausgabe",
    "tile.width":"Breite",
    "tile.height":"Höhe",
    "bg.color":"Hintergrund",
    "sub.noise":"Rauschen",
    "sub.shape":"Form",
    "sub.color":"Farbe",
    "sub.layer":"Ebene",
    "sub.dither":"Dithering",
    "sub.webp":"WebP",
    "noise.perlin":"Perlin — Wolken",
    "noise.value":"Value — weich",
    "noise.worley":"Worley — Flecken",
    "noise.grain":"Korn — Filmkorn",
    "noise.perlin.short":"Perlin",
    "noise.value.short":"Value",
    "noise.worley.short":"Worley",
    "noise.grain.short":"Korn",
    "noise.type":"Typ",
    "noise.spotSize":"Fleck {axis}",
    "noise.grainSize":"Korn {axis}",
    "noise.cells":{"one":"{n} Zelle","other":"{n} Zellen"},
    "noise.linkXY":"X=Y koppeln",
    "noise.seed":"Seed",
    "noise.seedBad":"Seed muss eine ganze Zahl von −2147483648 bis 2147483647 sein, erhalten: „{value}“.",
    "noise.octaves":"Oktaven",
    "noise.gain":"Dämpfung",
    "noise.lacunarity":"Lakunar.",
    "noise.ridged":"Grate (ridged)",
    "noise.worleyMode":"Modus",
    "noise.jitter":"Streuung",
    "noise.grainHp":"Hochpass",
    "noise.warp":"Verzerrung",
    "noise.warpSize":"Verz.-Skala",
    "worley.f1":"F1 — Flecken",
    "worley.f2":"F2 — zweiter Punkt",
    "worley.f2f1":"F2−F1 — Zellen/Risse",
    "shape.contrast":"Kontrast",
    "shape.bias":"Offset",
    "shape.gamma":"Gamma",
    "shape.invert":"Invertieren",
    "shape.normalize":"Bereich normalisieren",
    "stops.low":"schwach",
    "stops.high":"stark",
    "stops.lowTitle":"schwaches Rauschen · 0",
    "stops.highTitle":"starkes Rauschen · 1",
    "layer.blend":"Mischen",
    "layer.opacity":"Deckkr.",
    "blend.normal":"Normal",
    "blend.multiply":"Multiplizieren",
    "blend.screen":"Negativ multipl.",
    "blend.overlay":"Überlagern",
    "blend.hard-light":"Hartes Licht",
    "blend.soft-light":"Weiches Licht",
    "blend.add":"Addieren",
    "blend.subtract":"Subtrahieren",
    "blend.darken":"Abdunkeln",
    "blend.lighten":"Aufhellen",
    "blend.difference":"Differenz",
    "out.stopMix":"Mischen",
    "out.ditherMode":"Modus",
    "out.ditherAmount":"Stärke, LSB",
    "out.webpQuality":"Qualität",
    "stopMix.oklab":"OKLab (perzeptiv)",
    "stopMix.srgb-linear":"Lineares sRGB (physikalisch)",
    "dither.tpdf":"TPDF (Rauschen)",
    "dither.ordered":"Bayer 8×8",
    "dither.off":"Aus",
    "color.badMode":"Gespeicherter Farbmodus „{mode}“ ist unbekannt — HSL gewählt.",
    "color.clipped":"C auf die Gamutgrenze von sRGB reduziert: {c} (eingestellt {want}).",
    "chan.copySuffix":" Kopie",
    "meta.octaves":"{n} Okt.",
    "warn.octaves":"Oktaven auf {cap} begrenzt: Bei einer Kachel von {w}×{h} wäre die Zelle der nächsten Oktave kleiner als ein Pixel.",
    "render.prepFail":"Fehler beim Vorbereiten des Auftrags: {err}",
    "render.fail":"Renderfehler: {err}",
    "render.metaFail":"Fehler bei den Kanalbeschriftungen: {err}",
    "file.unsaved":"nicht in Datei gespeichert",
    "file.saved":"Gespeichert: {path}",
    "session.autosaveFail":"Automatisches Speichern fehlgeschlagen: {err}",
    "session.restoreFail":"Letzte Sitzung nicht wiederhergestellt: {err}\nDas integrierte Preset wurde geöffnet.",
    "src.history":"Bearbeitungsverlauf",
    "src.session":"letzte Sitzung",
    "src.default":"integriertes Preset",
    "src.typeThumb":"Miniatur des Typs {type}",
    "lib.title":"Bibliothek",
    "lib.dir":"Ordner…",
    "lib.noDir":"Kein Bibliotheksordner gewählt. Klicken Sie auf „Ordner…“ — jeder Ordner ist geeignet, z. B. presets/ im Programmordner.",
    "lib.presets":{"one":"{n} Preset","other":"{n} Presets"},
    "lib.skipped":", kein ZERNO: {n} ({list})",
    "lib.errors":"Fehler ({n}):",
    "lib.thumbError":"Fehler",
    "lib.thumbFail":"Miniaturen der Bibliothek: {err}",
    "lib.delAsk":"Datei „{name}“ aus dem Bibliotheksordner löschen?\nDies kann nicht rückgängig gemacht werden.",
    "lib.delTitle":"ZERNO — Preset löschen",
    "lib.delOk":"Löschen",
    "lib.delCancel":"Abbrechen",
    "lib.deleted":"Datei gelöscht: {name}",
    "lib.fail":"Bibliothek: {err}",
    "doc.opened":"Geöffnet: {name}  ·  Strg+Z stellt das vorherige Dokument wieder her",
    "doc.openFail":"{name} konnte nicht geöffnet werden: {err}",
    "doc.root":"dokument",
    "dlg.libDir":"Ordner der Preset-Bibliothek",
    "dlg.open":"Preset öffnen",
    "dlg.save":"Preset speichern",
    "dlg.filter":"ZERNO-Preset",
    "dlg.exportPng":"PNG exportieren",
    "dlg.exportWebp":"WebP exportieren",
    "export.saved":"{fmt} gespeichert: {path}  ·  {kb} KB",
    "css.comment":"{name} — Kachel {w}×{h}",
    "css.copied":"CSS in die Zwischenablage kopiert ({kb} KB inkl. data-URI).",
    "drop.skipped":"Übersprungen (erwartet wird *.json): {list}",
    "drop.many":"Abgelegte Presets: {n}. Das erste wurde geöffnet: {first}",
    "drop.unavailable":"Drag & Drop von Dateien nicht verfügbar: {err}",
    "preset.default":"Basis · dunkle Leinwand",
    "preset.default.clouds":"Wolken",
    "preset.default.cells":"Flecken",
    "preset.default.grain":"Korn",
    "boot.runExe":"Starten Sie die Anwendung zerno.exe.",
    "boot.badDefault":"Das integrierte Preset hat die Prüfung nicht bestanden:\n{err}",
    "engine.infoFail":"Engine-Informationen: {err}",
    "titlebar.fail":"Farbe der Titelleiste: {err}",
    "titlebar.part.caption":"Hintergrund",
    "titlebar.part.text":"Text",
    "titlebar.part.border":"Rahmen",
    "thumbs.typeFail":"Miniaturen der Rauschtypen nicht erstellt: {err}",
    "lang.badSaved":"Gespeicherte Sprache „{code}“ ist unbekannt — Systemsprache gewählt.",
    "lang.titleFail":"Fenstertitel nicht aktualisiert: {err}",
    "msg.inFile":"[Datei: {file}]",
    "msg.internal":"Interner Fehler: {text}",
    "msg.doc.notObject":"{field}: Objekt erwartet, erhalten: {got}",
    "msg.doc.missing":"{field}: Feld fehlt (Pflichtfeld)",
    "msg.doc.notNumber":"{field}: Zahl erwartet, erhalten: {got}",
    "msg.doc.range":"{field}: Wert {value} außerhalb des Bereichs [{min}; {max}]",
    "msg.doc.notInt":"{field}: ganze Zahl erwartet, erhalten: {value}",
    "msg.doc.notBool":"{field}: true/false erwartet, erhalten: {got}",
    "msg.doc.notString":"{field}: Zeichenkette erwartet, erhalten: {got}",
    "msg.doc.badEnum":"{field}: unzulässiger Wert \"{value}\". Zulässig: {allowed}",
    "msg.doc.unknownField":"{field}: unbekanntes Feld. Zulässig: {allowed}",
    "msg.doc.format":"{field}: \"{want}\" erwartet, erhalten: \"{got}\"",
    "msg.doc.version":"{field}: Datei hat Version {got}, unterstützt wird nur {supported}",
    "msg.doc.notArray":"{field}: Array erwartet, erhalten: {got}",
    "msg.doc.json":"nicht als JSON lesbar: {detail}",
    "msg.doc.notPreset":"„{name}“ ist kein ZERNO-Preset (kein \"format\": \"{format}\").",
    "msg.color.badHex":"Ungültiger HEX-Wert: \"{hex}\". Erwartet: #RGB oder #RRGGBB.",
    "msg.export.webpFail":"WebView hat WebP nicht kodiert (erhalten: {got}). Speichern Sie als PNG.",
    "msg.lib.badJson":"{name}: nicht als JSON lesbar — {detail}",
    "msg.render.degenerate":"Kanal „{channel}“, Typ „{type}“: Fleckgröße {w}×{h} px ist kleiner als {min} px — auf einem so feinen Raster entartet das Rauschen. Vergrößern Sie den Fleck oder wählen Sie den Typ „Korn“, er ist für 1 px ausgelegt.",
    "msg.render.fieldOom":"Kanal „{channel}“: nicht genug Speicher für das Rauschfeld {w}×{h}",
    "msg.render.bufferOom":"Nicht genug Speicher für den Antwortpuffer",
    "msg.render.tooLarge":"Gesamtfläche der Aufträge ist zu groß",
    "msg.worker.crashed":"Worker-Thread abgestürzt: {detail}",
    "msg.settings.read":"{path} nicht lesbar: {os}",
    "msg.settings.json":"{path}: nicht als JSON lesbar — {detail}",
    "msg.settings.notObject":"{path}: Objekt erwartet",
    "msg.settings.unknownField":"{path}: unbekanntes Feld „{field}“. Zulässig: {allowed}",
    "msg.settings.missing":"{path}.{field}: Feld fehlt (Pflichtfeld)",
    "msg.settings.badType":"{path}.{field}: Zeichenkette oder null erwartet",
    "msg.settings.locked":"Einstellungen durch abgestürzten Thread gesperrt",
    "msg.settings.mkdir":"{path} kann nicht erstellt werden: {os}",
    "msg.io.write":"{path} kann nicht geschrieben werden: {os}",
    "msg.io.replace":"{path} konnte nicht ersetzt werden: {os}",
    "msg.io.replace.cleanup":"; temporäre Datei {tmp} nicht gelöscht: {cleanup}",
    "msg.path.notUnicode":"Pfad ist kein Unicode: {path}",
    "msg.lib.dirUnavailable":"Ordner {path} nicht verfügbar: {os}",
    "msg.lib.walk":"Durchsuchen des Ordners {path} abgebrochen: {os}",
    "msg.lib.nameNotUnicode":"Dateiname ist kein Unicode: {path}",
    "msg.lib.fileType":"{name}: Typ nicht bestimmbar — {os}",
    "msg.file.read":"{path}: nicht lesbar — {os}",
    "msg.file.tooLarge":"{path}: {bytes} Byte — mehr als {max}, das ist kein Preset",
    "msg.lib.notChosen":"Der Bibliotheksordner ist noch nicht gewählt.",
    "msg.lib.badName":"„{name}“ ist kein Preset-Dateiname im Bibliotheksordner",
    "msg.lib.delete":"{path} konnte nicht gelöscht werden: {os}",
    "msg.lib.reveal":"{path} konnte nicht geöffnet werden: {os}",
    "msg.file.noName":"Kein Dateiname: {path}",
    "msg.dialog.badPath":"Gewählter Pfad nicht lesbar: {detail}",
    "msg.titlebar.unsupported":"Windows hat die Titelfarbe ({part}) nicht übernommen: HRESULT {hresult}. Eine eigene Färbung der Titelleiste gibt es nur unter Windows 11.",
    "msg.titlebar.notWindows":"Die Titelleiste lässt sich nur unter Windows 11 einfärben."
  },
  help:`
        <article data-topic="start" data-title="Start">
          <h2>So ist eine Kachel aufgebaut</h2>
          <p>Eine Kachel ist ein Bild, das sich ohne Nähte wiederholt. Sie besteht aus dem
            <b>Hintergrund</b> und einem Stapel <b>Rauschkanäle</b>: Jeder Kanal ist ein Rauschmuster,
            mit zwei Farben eingefärbt und über das gelegt, was darunter liegt.</p>
          <h3>Arbeitsablauf</h3>
          <ol>
            <li>Größe der Kachel — <a data-go="tile">Kachel</a>.</li>
            <li>Farbe unter dem Muster — <a data-go="bg">Hintergrund</a>.</li>
            <li>Kanäle — mit den Schaltflächen „+ …“ unter der Liste, Einstellungen in der Kanalkarte:
              <a data-go="noise">Rauschen</a>, <a data-go="shape">Form</a>,
              <a data-go="color">Farbe</a>, <a data-go="layer">Ebene</a>.</li>
            <li>Nahtprüfung — <a data-go="stage">Vorschau</a>.</li>
            <li>Speichern und Exportieren — <a data-go="files">Dateien und Export</a>.</li>
          </ol>
          <h3>Regler und Zahlen</h3>
          <p>Ein Wert wird per Regler gesetzt, als Zahl im Feld rechts (Punkt und Komma
            sind gleichwertig, Enter übernimmt) oder durch Ziehen mit der Maus über das Feld selbst:
            mit Shift feiner, mit Strg schneller. Eine Zahl außerhalb des Bereichs wird auf dessen Grenze gesetzt.</p>
          <p>Jede Änderung ist sofort in der Vorschau zu sehen. Rückgängig — Strg+Z, alle Tasten stehen im Abschnitt
            <a data-go="keys">Tastenkürzel</a>.</p>
          <p>Das Symbol <span class="help-i demo">?</span> an einer Gruppe öffnet ihren Hilfeabschnitt.</p>
        </article>

        <article data-topic="tile" data-title="Kachel">
          <h2>Kachel</h2>
          <p>Größe in Pixeln, von 8 bis 4096 je Seite. Die Schaltflächen 64²…1024² setzen
            ein Quadrat, „Breite“ und „Höhe“ die Seiten einzeln.</p>
          <p><b>Die Naht ist bei jeder Größe exakt</b>, auch bei ungeraden Maßen. Das Rauschmuster
            entsteht auf einem Raster, bei dem auf jede Kachelseite eine ganze Zahl von
            Zellen entfällt; deshalb setzt der linke Rand den rechten fort und der obere den unteren.</p>
          <p>Fleckgrößen der Kanäle sind in Pixeln angegeben. Ändert sich die Kachelgröße, wird die Zahl
            der Zellen neu berechnet, die Angaben „N Zellen“ in den Karten aktualisieren sich von selbst.</p>
          <p>Je größer die Kachel, desto länger die Berechnung: Die Zeit des letzten Bildes steht in der
            Statusleiste unten („Render … ms“).</p>
        </article>

        <article data-topic="bg" data-title="Hintergrund">
          <h2>Hintergrund der Kachel</h2>
          <p>Eine Vollfarbe unter allen Kanälen. Rechts in der Abschnittsüberschrift steht ihr HEX-Wert.
            Der Editor ist derselbe wie bei den Kanalfarben: Modi HSL und LCH, HEX-Feld, Alpha —
            die Bedeutung der Werte erklärt der Abschnitt <a data-go="color">Farbe</a>.</p>
          <p><b>A</b> (Alpha) unter 1 macht den Hintergrund halbtransparent: PNG und WebP erhalten
            Transparenz — so lässt sich die Kachel über einen anderen Hintergrund legen. In der Vorschau
            scheint durch transparente Stellen die Umfeldfarbe (<a data-go="stage">Vorschau</a>).</p>
        </article>

        <article data-topic="chans" data-title="Kanäle">
          <h2>Rauschkanäle</h2>
          <p>Ein Kanal ist eine Musterebene. <b>Der erste Kanal der Liste liegt direkt auf dem Hintergrund</b>,
            jeder weitere über den vorherigen; der letzte liegt ganz oben. Wie genau
            ein Kanal mit den darunterliegenden verrechnet wird — <a data-go="layer">Ebene</a>.</p>
          <h3>Kanalkarte</h3>
          <dl>
            <dt>Miniatur</dt><dd>der Kanal für sich, ohne Hintergrund und andere Kanäle;</dd>
            <dt>Name</dt><dd>direkt in der Kopfzeile bearbeitbar;</dd>
            <dt>Übersicht</dt><dd>Typ · Fleckgröße · Zahl der Oktaven · Mischmodus und Deckkraft;</dd>
            <dt>Streifen</dt><dd>Farbverlauf des Kanals;</dd>
            <dt>● / ○</dt><dd>Kanal ein- / ausschalten (ein ausgeschalteter wird nicht gezeichnet, bleibt aber im Dokument);</dd>
            <dt>↑ ↓</dt><dd>in der Liste nach oben / unten verschieben;</dd>
            <dt>⧉</dt><dd>Kopie des Kanals mit neuem zufälligem Seed;</dd>
            <dt>✕</dt><dd>Kanal löschen (Strg+Z holt ihn zurück);</dd>
            <dt>›</dt><dd>ein Klick auf die Karte klappt ihre Parameter auf und zu.</dd>
          </dl>
          <p>Erscheint in der Karte die Warnung „Oktaven begrenzt“, passen nicht alle Oktaven:
            Die Zelle der nächsten wäre kleiner als 2 Pixel (<a data-go="noise">Rauschen</a>).</p>
          <h3>Neuer Kanal</h3>
          <p>Die Schaltflächen „+ …“ unter der Liste fügen einen Kanal des jeweiligen Typs am Ende der Liste ein, also
            über allen anderen. Auf der Schaltfläche ist eine Miniatur des Musters dieses Typs zu sehen.</p>
        </article>

        <article data-topic="noise" data-title="Rauschen">
          <h2>Rauschen — welches Muster</h2>
          <dl>
            <dt>Typ</dt><dd>
              <b>Perlin</b> — Wolken, weiche, gewundene Flecken;
              <b>Value</b> — weicher als Perlin, weniger „aderig“;
              <b>Worley</b> — Flecken und Zellen um zufällige Punkte;
              <b>Korn</b> — unabhängige Punkte, wie Filmkorn.</dd>
            <dt>Fleck X, Y</dt><dd>Größe einer Musterzelle in Pixeln, horizontal und
              vertikal. Ändert sich <b>in Stufen</b>: Auf eine Kachelseite muss eine ganze Zahl von
              Zellen passen, sonst entstünde eine Naht; die Größe ist daher immer „Seite / ganze Zahl“. Bei
              einer Kachel von 256 folgt auf 128 (2 Zellen) direkt 85.3 (3 Zellen). Unter der Beschriftung
              steht, wie viele Zellen es gerade sind. Die kleinste Größe ist 2 px, die größte die ganze
              Seite (eine Zelle).</dd>
            <dt>Korn X, Y</dt><dd>Beim Typ „Korn“ die Größe eines Korns, ab 1 px; ebenfalls in Stufen.</dd>
            <dt>X=Y koppeln</dt><dd>setzt die Größe in Y gleich der Größe in X.</dd>
            <dt>Seed</dt><dd>Nummer der Variante des Zufallsmusters: gleicher Seed — gleiches Muster,
              anderer Seed — anderes Muster mit denselben Eigenschaften. Ganze Zahl; ⟳ — neuer zufälliger.</dd>
            <dt>Oktaven</dt><dd>1–10. Wie viele immer feinere Musterebenen addiert werden:
              1 — glatte Flecken, mehr — reichere feine Details. Oktaven unter 2 px
              werden verworfen, darauf weist eine Warnung in der Karte hin.</dd>
            <dt>Dämpfung</dt><dd>0–1 (gain). Um welchen Faktor jede weitere Oktave schwächer ist als
              die vorherige: 0.5 — halb so stark; näher an 0 — feine Details kaum sichtbar, näher an 1 —
              feine Details so kräftig wie die großen Flecken.</dd>
            <dt>Lakunar.</dt><dd>2–4, ganzzahlig (lacunarity). Um welchen Faktor jede weitere
              Oktave feiner ist als die vorherige. Ganzzahlig, damit auch die Oktaven nahtlos anschließen.</dd>
            <dt>Grate</dt><dd>Perlin und Value: statt Wolken Falten und Grate.</dd>
            <dt>Modus</dt><dd>Worley. <b>F1</b> — Abstand zum nächsten Punkt: runde Flecken;
              <b>F2</b> — zum zweitnächsten: größer und kantiger;
              <b>F2−F1</b> — die Differenz: feine Zellgrenzen, Risse, Netz.</dd>
            <dt>Streuung</dt><dd>Worley, 0–1. Wie weit die Punkte von den Zellmitten abweichen:
              0 — regelmäßiges Gitter, 1 — völlige Unordnung.</dd>
            <dt>Hochpass</dt><dd>Korn, 0–64 px. 0 — weißes Rauschen. Über 0 wird vom Korn
              seine weichgezeichnete Kopie mit diesem Radius abgezogen: Große Flecken verschwinden, durch
              die sich die Wiederholung der Kachel verrät („blaues“ Korn).</dd>
            <dt>Verzerrung</dt><dd>0–400 px. Das Muster wird durch ein zweites, grobes Rauschen verschoben — Linien
              werden fließend, „marmoriert“. Der Wert ist die Stärke der Verschiebung, ungefähr in
              Pixeln; 0 — keine Verzerrung.</dd>
            <dt>Verz.-Skala</dt><dd>2–2048 px. Größe der Verzerrungswellen: klein — feines Kräuseln,
              groß — sanfte Biegungen. Wirkt, wenn die Verzerrung größer als 0 ist.</dd>
          </dl>
        </article>

        <article data-topic="shape" data-title="Form">
          <h2>Form — wie aus dem Rauschwert eine Farbe wird</h2>
          <p>Das Rauschen ist an jedem Punkt eine Zahl von 0 (schwach) bis 1 (stark). Die Farbe des Punkts
            kommt von dieser Stelle des Kanalverlaufs (<a data-go="color">Farbe</a>). Die Form verändert
            die Zahl vor dem Einfärben, in dieser Reihenfolge: Invertieren → Kontrast → Offset → Gamma.</p>
          <dl>
            <dt>Kontrast</dt><dd>−1…1. 0 — unverändert. Über 0 wird die Streuung um die Mitte
              gestreckt: Flecken werden schärfer, bei 1 fast nur zwei reine Farben ohne Übergang.
              Unter 0 wird die Streuung zur Mitte gestaucht: Bei −1 hat die ganze Kachel eine einzige, mittlere
              Farbe, und um −0.9 ist das Muster schon kaum noch zu sehen.</dd>
            <dt>Offset</dt><dd>−0.5…0.5. Wird zu allem addiert: über 0 — mehr von der Farbe des
              starken Rauschens, unter 0 — mehr vom schwachen.</dd>
            <dt>Gamma</dt><dd>0.1–8, 1 — unverändert. Über 1 überwiegt die Farbe des schwachen
              Rauschens, starke Stellen schrumpfen zu vereinzelten Flecken; unter 1 umgekehrt.</dd>
            <dt>Invertieren</dt><dd>schwache und starke Stellen tauschen die Plätze.</dd>
            <dt>Normalisieren</dt><dd>Ohne diese Option wird der theoretische Wertebereich des Rauschens auf den
              Verlauf gelegt, der tatsächliche ist meist schmaler — besonders bei vielen Oktaven —, und die Farben
              der äußeren Regler werden nicht erreicht. Mit ihr wird die tatsächliche Streuung des Rauschens auf dieser Kachel
              auf den ganzen Verlauf gestreckt.</dd>
          </dl>
        </article>

        <article data-topic="color" data-title="Farbe">
          <h2>Kanalfarbe</h2>
          <p>Ein Verlaufsbalken mit zwei Reglern: <b>schwach</b> — die Farbe dort, wo das Rauschen 0 ist,
            <b>stark</b> — wo es 1 ist; dazwischen ein weicher Übergang. Auch Alpha
            geht von einem Regler zum anderen über.</p>
          <ul>
            <li>Klick auf einen Regler öffnet seinen Editor, ein zweiter Klick blendet ihn aus;</li>
            <li>⇄ — Farben tauschen;</li>
            <li>in welchem Farbraum die beiden Farben gemischt werden — <a data-go="out">Ausgabe</a>.</li>
          </ul>
          <h3>Farbeditor</h3>
          <p>Das Quadrat zeigt die aktuelle Farbe, das Feld ihren HEX-Wert (#RRGGBB, eigene Eingabe möglich).
            Der Umschalter <b>HSL / LCH</b> bietet zwei Wege, dieselbe Farbe zu bearbeiten; die Wahl gilt
            für alle Editoren und wird gespeichert. Die Skala unter jedem Regler zeigt,
            wie die Farbe aussähe, wenn man nur diesen Regler bewegt — deshalb werden die Skalen
            neu gezeichnet, sobald sich die anderen Regler ändern.</p>
          <h3>LCH (OKLCH)</h3>
          <dl>
            <dt>L</dt><dd>0–1, wahrgenommene Helligkeit: 0 — Schwarz, 1 — Weiß. Gleiches L bedeutet
              gleich hell wirkende Farben bei jedem Farbton. L = 0.5 entspricht etwa dem Grau #636363,
              nicht „halber Bildschirmhelligkeit“.</dd>
            <dt>C</dt><dd>0–0.33, Chroma — wie stark sich die Farbe vom Grau gleichen L-Werts unterscheidet.
              Ein absoluter Wert: 0 — Grau, 0.03–0.05 — kaum getönt, etwa 0.1 —
              deutlich, 0.15–0.25 — kräftig, etwa 0.32 — die Grenze eines sRGB-Bildschirms.</dd>
            <dt>H</dt><dd>0–360°, Farbton. Richtwerte: Rot ≈ 29, Gelb ≈ 110, Grün ≈ 142,
              Cyan ≈ 195, Blau ≈ 264, Magenta ≈ 328.</dd>
          </dl>
          <p><b>Das dunkle Ende der C-Skala</b> ist Chroma, die der Bildschirm bei den aktuellen L und H
            nicht darstellen kann. Die Grenze wandert: Gelb kann nur hell gesättigt sein,
            Blau nur dunkel, und fast Schwarz oder fast Weiß hat gar keine Sättigung.
            Passt das eingestellte C nicht hinein, wird es auf die Grenze reduziert, der Regler rückt nach,
            und unter den Reglern erscheint ein Hinweis. Stellen Sie L oder H zurück, kehrt auch das eingestellte C zurück.</p>
          <h3>HSL (OKHSL)</h3>
          <dl>
            <dt>H</dt><dd>0–360°, Farbton, derselbe Winkel wie bei LCH.</dd>
            <dt>S</dt><dd>0–1, Sättigung <b>relativ zur möglichen</b> bei diesen L und H:
              1 — gesättigter geht es nicht. Deshalb wird nichts abgeschnitten, doch gleiches S ergibt bei
              verschiedenen Farbtönen unterschiedlich kräftig wirkende Farben.</dd>
            <dt>L</dt><dd>0–1, Helligkeit: 0 — Schwarz, 1 — Weiß.</dd>
          </dl>
          <p>LCH ist praktisch, wenn Farben gleich gesättigt wirken sollen, HSL, wenn man
            frei ohne Einschränkungen drehen möchte. In der Datei wird die Farbe in jedem Fall als OKHSL gespeichert.</p>
          <h3>A</h3>
          <p>0–1, Deckkraft der Farbe: 0 — transparent, 1 — deckend.</p>
        </article>

        <article data-topic="layer" data-title="Ebene">
          <h2>Ebene — wie ein Kanal auf den darunterliegenden liegt</h2>
          <dl>
            <dt>Mischen</dt><dd>Mischmodus gegenüber allem, was unter dem Kanal liegt (Hintergrund und Kanäle weiter oben
              in der Liste). Berechnet in linearem Licht nach den Formeln des W3C.
              <ul>
                <li><b>Normal</b> — der Kanal verdeckt das Darunterliegende, so weit er deckend ist;</li>
                <li><b>Multiplizieren</b> — dunkelt ab: Weiß ändert das Darunterliegende nicht, Schwarz ergibt Schwarz;</li>
                <li><b>Negativ multipl.</b> — hellt auf: Schwarz ändert das Darunterliegende nicht;</li>
                <li><b>Überlagern</b> — verstärkt den Kontrast des Darunterliegenden: Dunkles wird dunkler, Helles heller;</li>
                <li><b>Hartes Licht</b> — dasselbe, doch der Kanal entscheidet: Seine dunklen Stellen dunkeln ab, helle hellen auf;</li>
                <li><b>Weiches Licht</b> — sanfte Variante von „Hartes Licht“;</li>
                <li><b>Addieren</b> — Helligkeiten werden addiert, hellt stark auf;</li>
                <li><b>Subtrahieren</b> — der Kanal wird vom Darunterliegenden abgezogen, dunkelt ab;</li>
                <li><b>Abdunkeln / Aufhellen</b> — je Farbkomponente bleibt der
                  kleinere / größere der beiden Werte;</li>
                <li><b>Differenz</b> — Betrag der Differenz: Gleiches ergibt Schwarz.</li>
              </ul></dd>
            <dt>Deckkr.</dt><dd>0–1, Deckkraft des ganzen Kanals — zusätzlich zum Alpha seiner Farben.
              0 — Kanal unsichtbar, 1 — volle Wirkung.</dd>
          </dl>
        </article>

        <article data-topic="out" data-title="Ausgabe">
          <h2>Ausgabe — allgemeine Berechnungseinstellungen</h2>
          <dl>
            <dt>Mischen</dt><dd>In welchem Farbraum der Übergang zwischen den beiden Farben
              jedes Kanals berechnet wird. <b>OKLab</b> — für das Auge gleichmäßig, ohne schmutzige oder dunkle Mitten.
              <b>Lineares sRGB</b> — so, wie sich Licht physikalisch mischt; die Mitte des Übergangs
              wirkt heller als bei OKLab. Auf die Mischmodi
              der Ebenen hat das keinen Einfluss: Sie rechnen immer in linearem Licht.</dd>
            <dt>Dithering</dt><dd>Beseitigt Streifen (Banding) in weichen Übergängen, die
              bei der Umwandlung in 8 Bit pro Kanal entstehen. <b>TPDF</b> — unauffälliges Rauschen,
              <b>Bayer 8×8</b> — regelmäßiges Muster, <b>Aus</b> — kein Dithering. Reines
              Schwarz und vollständig deckendes Alpha bleiben rein.</dd>
            <dt>Stärke, LSB</dt><dd>0–4, Stärke des Ditherings in niederwertigsten Bits: 1 — eine Stufe von
              256 Werten eines Kanals.</dd>
            <dt>Qualität</dt><dd>0–1, nur für den WEBP-Export: 1.00 — verlustfrei, weniger —
              kleinere Datei, aber mit Kompressionsartefakten.</dd>
          </dl>
        </article>

        <article data-topic="stage" data-title="Vorschau">
          <h2>Vorschau — die Naht mit eigenen Augen prüfen</h2>
          <p>Die Vorschau ist vollständig mit der Kachel ausgelegt. Eine Kachel in der Mitte ist durch
            Eckmarken hervorgehoben.</p>
          <dl>
            <dt>Zoom</dt><dd>25–800 %. Regler, Mausrad über der Vorschau oder Strg+= / Strg+−;
              „1:1“, Doppelklick auf die Vorschau oder Strg+0 — 100 %.</dd>
            <dt>Umfeld</dt><dd>Farbe der Fläche rund um die gekachelte Fläche; sie scheint auch durch transparente
              Stellen der Kachel. Hilft einzuschätzen, wie die Kachel auf Dunkel und auf Hell wirkt.</dd>
            <dt>Ränder</dt><dd>feines Gitter entlang der Kachelränder.</dd>
            <dt>Versatz ½</dt><dd>verschiebt die Anordnung um eine halbe Kachel: In die Mitte der Vorschau rückt die Ecke,
              an der vier Kacheln zusammenstoßen — gäbe es eine Naht, wäre sie hier zu sehen.</dd>
            <dt>Glätten</dt><dd>Glättung der Pixel beim Vergrößern; ohne sie sind scharfe
              Pixel zu sehen.</dd>
            <dt>Bibliothek</dt><dd>rechte Spalte ein- / ausblenden (<a data-go="lib">Bibliothek</a>).</dd>
          </dl>
          <p>Statusleiste unten: Bereitschaft, Kachelgröße, Zahl der eingeschalteten Kanäle,
            Zeit des letzten Bildes und Zahl der Threads, mit denen die Engine rechnet.</p>
        </article>

        <article data-topic="lib" data-title="Bibliothek">
          <h2>Preset-Bibliothek</h2>
          <p>Die Bibliothek ist ein beliebiger Ordner mit <code>*.json</code>-Dateien. Auch
            <code>presets/</code> aus dem Programmordner eignet sich.</p>
          <dl>
            <dt>Ordner…</dt><dd>Ordner wählen; die Wahl wird gespeichert.</dd>
            <dt>↗</dt><dd>Ordner im Explorer öffnen.</dd>
            <dt>↻</dt><dd>Ordner neu einlesen (falls Dateien von außen geändert wurden).</dd>
            <dt>Miniatur</dt><dd>ein Klick öffnet das Preset und verknüpft das Dokument mit seiner Datei:
              „Speichern“ schreibt direkt in sie.</dd>
            <dt>✕ auf der Miniatur</dt><dd>Datei aus dem Ordner löschen, mit Bestätigung.</dd>
          </dl>
          <p>Fehlerhafte Dateien verschwinden nicht stillschweigend: Unter der Überschrift steht eine Liste mit den Gründen,
            fremde <code>*.json</code>-Dateien sind gesondert aufgeführt.</p>
        </article>

        <article data-topic="files" data-title="Dateien und Export">
          <h2>Dateien und Export</h2>
          <p>In der oberen Leiste steht der Preset-Name (er ist bearbeitbar), daneben der Name der Datei,
            mit der das Dokument verknüpft ist, und ein Punkt, wenn es ungespeicherte Änderungen gibt.</p>
          <dl>
            <dt>Öffnen</dt><dd>ein Preset <code>*.json</code> öffnen; die Datei lässt sich auch einfach
              auf das Fenster ziehen. Strg+Z nach dem Öffnen stellt das vorherige Dokument wieder her.</dd>
            <dt>Speichern</dt><dd>in die verknüpfte Datei schreiben; gibt es noch keine, wird nach dem Ort gefragt.</dd>
            <dt>Als…</dt><dd>in eine neue Datei speichern.</dd>
            <dt>CSS</dt><dd>einen CSS-Block in die Zwischenablage kopieren: die Kachel als data-URI und
              <code>background-repeat</code>.</dd>
            <dt>WEBP</dt><dd>Export als WebP, die Qualität steht im Abschnitt <a data-go="out">Ausgabe</a>.</dd>
            <dt>PNG</dt><dd>Export als PNG, verlustfrei, mit Alpha.</dd>
          </dl>
          <p>Die Sitzung wird automatisch gespeichert: Nach einem Neustart ist dasselbe Dokument geöffnet.</p>
        </article>

        <article data-topic="keys" data-title="Tastenkürzel">
          <h2>Tastatur und Maus</h2>
          <table>
            <tr><td>Strg+Z</td><td>rückgängig</td></tr>
            <tr><td>Strg+Y, Strg+Shift+Z</td><td>wiederholen</td></tr>
            <tr><td>Strg+S</td><td>speichern</td></tr>
            <tr><td>Strg+Shift+S</td><td>speichern als…</td></tr>
            <tr><td>Strg+O</td><td>Preset öffnen (oder *.json auf das Fenster ziehen)</td></tr>
            <tr><td>Strg+E</td><td>PNG exportieren</td></tr>
            <tr><td>Strg+= / Strg+−</td><td>Zoom der Vorschau</td></tr>
            <tr><td>Strg+0</td><td>Zoom 1:1</td></tr>
            <tr><td>Mausrad über der Vorschau</td><td>Zoom</td></tr>
            <tr><td>Doppelklick auf die Vorschau</td><td>Zoom 1:1</td></tr>
            <tr><td>Ziehen über ein Zahlenfeld</td><td>Wert ändern; Shift — feiner, Strg — schneller</td></tr>
            <tr><td>F1</td><td>Hilfe</td></tr>
            <tr><td>Esc</td><td>Hilfe schließen</td></tr>
          </table>
        </article>
`
});
