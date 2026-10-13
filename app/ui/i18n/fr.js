"use strict";
/* ЗЕРНО · словарь: Français. Ключи — как в i18n/ru.js (эталон); проверка — checkLangs(). */
addLang("fr",{
  name:"Français",
  strings:{
    "app.brand":"ZERNO",
    "app.title":"ZERNO — générateur de bruit sans raccord",
    "app.sub":"bruit sans raccord",
    "doc.namePh":"nom du préréglage",
    "bar.open":"Ouvrir",
    "bar.save":"Enregistrer",
    "bar.saveAs":"Sous…",
    "stage.zoom":"zoom",
    "stage.surround":"fond",
    "stage.grid":"Bords",
    "stage.shift":"Décalage ½",
    "stage.smooth":"Lissage",
    "stage.lib":"Bibliothèque",
    "st.tile":"tuile",
    "st.channels":"canaux",
    "st.render":"rendu",
    "st.engine":"moteur",
    "st.seam":"raccord :",
    "st.seamExact":"exact",
    "st.ready":"prêt",
    "st.busy":"rendu",
    "st.error":"erreur",
    "st.engineVal":"RUST · {n} threads",
    "unit.ms":"{v} ms",
    "help.title":"Aide",
    "sec.tile":"Tuile",
    "sec.bg":"Fond de tuile",
    "sec.chans":"Canaux de bruit",
    "sec.out":"Sortie",
    "tile.width":"Largeur",
    "tile.height":"Hauteur",
    "bg.color":"fond",
    "sub.noise":"Bruit",
    "sub.shape":"Forme",
    "sub.color":"Couleur",
    "sub.layer":"Calque",
    "sub.dither":"Tramage",
    "sub.webp":"WebP",
    "noise.perlin":"Perlin — nuages",
    "noise.value":"Value — doux",
    "noise.worley":"Worley — taches",
    "noise.grain":"Grain — pellicule",
    "noise.perlin.short":"Perlin",
    "noise.value.short":"Value",
    "noise.worley.short":"Worley",
    "noise.grain.short":"Grain",
    "noise.type":"Type",
    "noise.spotSize":"Tache {axis}",
    "noise.grainSize":"Grain {axis}",
    "noise.cells":{"one":"{n} cellule","many":"{n} cellules","other":"{n} cellules"},
    "noise.linkXY":"lier X=Y",
    "noise.seed":"Graine",
    "noise.seedBad":"Graine : entier de −2147483648 à 2147483647 attendu, reçu « {value} ».",
    "noise.octaves":"Octaves",
    "noise.gain":"Atténuation",
    "noise.lacunarity":"Lacunar.",
    "noise.ridged":"Crêtes (ridged)",
    "noise.worleyMode":"Mode",
    "noise.jitter":"Dispersion",
    "noise.grainHp":"Passe-haut",
    "noise.warp":"Distorsion",
    "noise.warpSize":"Échelle dist.",
    "worley.f1":"F1 — taches",
    "worley.f2":"F2 — 2ᵉ point",
    "worley.f2f1":"F2−F1 — cellules/fissures",
    "shape.contrast":"Contraste",
    "shape.bias":"Décalage",
    "shape.gamma":"Gamma",
    "shape.invert":"Inversion",
    "shape.normalize":"Normaliser la plage",
    "stops.low":"faible",
    "stops.high":"fort",
    "stops.lowTitle":"bruit faible · 0",
    "stops.highTitle":"bruit fort · 1",
    "layer.blend":"Fusion",
    "layer.opacity":"Opacité",
    "blend.normal":"Normal",
    "blend.multiply":"Produit",
    "blend.screen":"Superposition",
    "blend.overlay":"Incrustation",
    "blend.hard-light":"Lumière crue",
    "blend.soft-light":"Lumière tamisée",
    "blend.add":"Addition",
    "blend.subtract":"Soustraction",
    "blend.darken":"Obscurcir",
    "blend.lighten":"Éclaircir",
    "blend.difference":"Différence",
    "out.stopMix":"Mélange",
    "out.ditherMode":"Mode",
    "out.ditherAmount":"Force, LSB",
    "out.webpQuality":"Qualité",
    "stopMix.oklab":"OKLab (perceptuel)",
    "stopMix.srgb-linear":"sRGB linéaire (physique)",
    "dither.tpdf":"TPDF (bruit)",
    "dither.ordered":"Bayer 8×8",
    "dither.off":"Désactivé",
    "color.badMode":"Mode de couleur enregistré « {mode} » inconnu — HSL sélectionné.",
    "color.clipped":"C réduite à la limite du gamut sRGB : {c} (demandé : {want}).",
    "chan.copySuffix":" copie",
    "meta.octaves":"{n} oct",
    "warn.octaves":"Octaves limitées à {cap} : sur une tuile de {w}×{h}, la cellule de l’octave suivante serait plus petite qu’un pixel.",
    "render.prepFail":"Échec de préparation de la tâche : {err}",
    "render.fail":"Erreur de rendu : {err}",
    "render.metaFail":"Erreur des légendes de canaux : {err}",
    "file.unsaved":"non enregistré dans un fichier",
    "file.saved":"Enregistré : {path}",
    "session.autosaveFail":"Échec de l’enregistrement automatique : {err}",
    "session.restoreFail":"Session précédente non restaurée : {err}\nPréréglage intégré ouvert.",
    "src.history":"historique des modifications",
    "src.session":"session précédente",
    "src.default":"préréglage intégré",
    "src.typeThumb":"miniature du type {type}",
    "lib.title":"Bibliothèque",
    "lib.dir":"Dossier…",
    "lib.noDir":"Aucun dossier de bibliothèque choisi. Cliquez sur « Dossier… » — n’importe lequel convient, par exemple presets/ dans le dossier du programme.",
    "lib.presets":{"one":"{n} préréglage","many":"{n} préréglages","other":"{n} préréglages"},
    "lib.skipped":", hors ZERNO : {n} ({list})",
    "lib.errors":"Erreurs ({n}) :",
    "lib.thumbError":"erreur",
    "lib.thumbFail":"Miniatures de la bibliothèque : {err}",
    "lib.delAsk":"Supprimer le fichier « {name} » du dossier de la bibliothèque ?\nCette action est irréversible.",
    "lib.delTitle":"ZERNO — suppression du préréglage",
    "lib.delOk":"Supprimer",
    "lib.delCancel":"Annuler",
    "lib.deleted":"Fichier supprimé : {name}",
    "lib.fail":"Bibliothèque : {err}",
    "doc.opened":"Ouvert : {name}  ·  Ctrl+Z rétablit le document précédent",
    "doc.openFail":"Impossible d’ouvrir {name} : {err}",
    "doc.root":"document",
    "dlg.libDir":"Dossier de la bibliothèque de préréglages",
    "dlg.open":"Ouvrir un préréglage",
    "dlg.save":"Enregistrer le préréglage",
    "dlg.filter":"Préréglage ZERNO",
    "dlg.exportPng":"Exporter en PNG",
    "dlg.exportWebp":"Exporter en WebP",
    "export.saved":"{fmt} enregistré : {path}  ·  {kb} Ko",
    "css.comment":"{name} — tuile {w}×{h}",
    "css.copied":"CSS copié dans le presse-papiers ({kb} Ko avec le data-URI).",
    "drop.skipped":"Ignoré (*.json attendu) : {list}",
    "drop.many":"Préréglages déposés : {n}. Premier ouvert : {first}",
    "drop.unavailable":"Glisser-déposer de fichiers indisponible : {err}",
    "preset.default":"base · toile sombre",
    "preset.default.clouds":"Nuages",
    "preset.default.cells":"Taches",
    "preset.default.grain":"Grain",
    "boot.runExe":"Lancez l’application zerno.exe.",
    "boot.badDefault":"Le préréglage intégré n’a pas passé la validation :\n{err}",
    "engine.infoFail":"Infos sur le moteur : {err}",
    "titlebar.fail":"Couleur de la barre de titre : {err}",
    "titlebar.part.caption":"fond",
    "titlebar.part.text":"texte",
    "titlebar.part.border":"bordure",
    "thumbs.typeFail":"Miniatures des types de bruit non générées : {err}",
    "lang.badSaved":"Langue enregistrée « {code} » inconnue — langue du système sélectionnée.",
    "lang.titleFail":"Titre de la fenêtre non mis à jour : {err}",
    "msg.inFile":"[fichier : {file}]",
    "msg.internal":"Erreur interne : {text}",
    "msg.doc.notObject":"{field} : objet attendu, reçu {got}",
    "msg.doc.missing":"{field} : champ absent (obligatoire)",
    "msg.doc.notNumber":"{field} : nombre attendu, reçu {got}",
    "msg.doc.range":"{field} : valeur {value} hors de la plage [{min}; {max}]",
    "msg.doc.notInt":"{field} : entier attendu, reçu {value}",
    "msg.doc.notBool":"{field} : true/false attendu, reçu {got}",
    "msg.doc.notString":"{field} : chaîne attendue, reçu {got}",
    "msg.doc.badEnum":"{field} : valeur \"{value}\" non valide. Valeurs admises : {allowed}",
    "msg.doc.unknownField":"{field} : champ inconnu. Champs admis : {allowed}",
    "msg.doc.format":"{field} : \"{want}\" attendu, reçu \"{got}\"",
    "msg.doc.version":"{field} : fichier en version {got}, seule la version {supported} est prise en charge",
    "msg.doc.notArray":"{field} : tableau attendu, reçu {got}",
    "msg.doc.json":"analyse JSON impossible : {detail}",
    "msg.doc.notPreset":"« {name} » n’est pas un préréglage ZERNO (pas de \"format\": \"{format}\").",
    "msg.color.badHex":"HEX incorrect : \"{hex}\". Formats attendus : #RGB ou #RRGGBB.",
    "msg.export.webpFail":"WebView n’a pas encodé le WebP (reçu : {got}). Enregistrez en PNG.",
    "msg.lib.badJson":"{name} : analyse JSON impossible — {detail}",
    "msg.render.degenerate":"Canal « {channel} », type « {type} » : taille de tache {w}×{h} px inférieure à {min} px — sur une grille aussi fine, le bruit dégénère. Augmentez la taille de tache ou choisissez le type « Grain », conçu pour 1 px.",
    "msg.render.fieldOom":"Canal « {channel} » : mémoire insuffisante pour le champ de bruit {w}×{h}",
    "msg.render.bufferOom":"Mémoire insuffisante pour le tampon de réponse",
    "msg.render.tooLarge":"Surface totale des tâches trop grande",
    "msg.worker.crashed":"Le thread de calcul a planté : {detail}",
    "msg.settings.read":"Lecture impossible de {path} : {os}",
    "msg.settings.json":"{path} : analyse JSON impossible — {detail}",
    "msg.settings.notObject":"{path} : objet attendu",
    "msg.settings.unknownField":"{path} : champ inconnu « {field} ». Champs admis : {allowed}",
    "msg.settings.missing":"{path}.{field} : champ absent (obligatoire)",
    "msg.settings.badType":"{path}.{field} : chaîne ou null attendu",
    "msg.settings.locked":"Paramètres verrouillés par un thread qui a planté",
    "msg.settings.mkdir":"Création impossible de {path} : {os}",
    "msg.io.write":"Écriture impossible dans {path} : {os}",
    "msg.io.replace":"Impossible de remplacer {path} : {os}",
    "msg.io.replace.cleanup":" ; fichier temporaire {tmp} non supprimé : {cleanup}",
    "msg.path.notUnicode":"Chemin non Unicode : {path}",
    "msg.lib.dirUnavailable":"Dossier {path} inaccessible : {os}",
    "msg.lib.walk":"Parcours du dossier {path} interrompu : {os}",
    "msg.lib.nameNotUnicode":"Nom de fichier non Unicode : {path}",
    "msg.lib.fileType":"{name} : type indéterminable — {os}",
    "msg.file.read":"{path} : lecture impossible — {os}",
    "msg.file.tooLarge":"{path} : {bytes} octets — plus de {max}, ce n’est pas un préréglage",
    "msg.lib.notChosen":"Le dossier de la bibliothèque n’est pas encore choisi.",
    "msg.lib.badName":"« {name} » n’est pas un nom de fichier de préréglage du dossier de la bibliothèque",
    "msg.lib.delete":"Impossible de supprimer {path} : {os}",
    "msg.lib.reveal":"Impossible d’ouvrir {path} : {os}",
    "msg.file.noName":"Pas de nom de fichier : {path}",
    "msg.dialog.badPath":"Chemin sélectionné illisible : {detail}",
    "msg.titlebar.unsupported":"Windows a refusé la couleur de la barre de titre ({part}) : HRESULT {hresult}. La coloration personnalisée de la barre de titre n’existe que sous Windows 11.",
    "msg.titlebar.notWindows":"La barre de titre ne peut être colorée que sous Windows 11."
  },
  help:`
        <article data-topic="start" data-title="Prise en main">
          <h2>Comment est faite une tuile</h2>
          <p>Une tuile est une image qui se répète sans raccord visible. Elle se compose
            d’un <b>fond</b> et d’une pile de <b>canaux de bruit</b> : chaque canal est un motif
            de bruit, colorié avec deux couleurs et posé sur ce qui se trouve en dessous.</p>
          <h3>Étapes de travail</h3>
          <ol>
            <li>Taille de la tuile — <a data-go="tile">Tuile</a>.</li>
            <li>Couleur sous le motif — <a data-go="bg">Fond</a>.</li>
            <li>Canaux — boutons « + … » sous la liste ; réglages dans la carte du canal :
              <a data-go="noise">Bruit</a>, <a data-go="shape">Forme</a>,
              <a data-go="color">Couleur</a>, <a data-go="layer">Calque</a>.</li>
            <li>Vérification du raccord — <a data-go="stage">Scène</a>.</li>
            <li>Enregistrement et export — <a data-go="files">Fichiers et export</a>.</li>
          </ol>
          <h3>Curseurs et nombres</h3>
          <p>Une valeur se règle au curseur, en saisissant un nombre dans le champ à droite (point
            et virgule sont équivalents, Enter pour valider) ou en faisant glisser la souris sur
            le champ lui-même : avec Shift — plus finement, avec Ctrl — plus vite. Un nombre hors
            de la plage est ramené à sa limite.</p>
          <p>Chaque modification s’affiche aussitôt sur la scène. Annuler — Ctrl+Z ; tous les
            raccourcis sont dans la rubrique <a data-go="keys">Raccourcis</a>.</p>
          <p>L’icône <span class="help-i demo">?</span> d’un groupe ouvre la rubrique d’aide correspondante.</p>
        </article>

        <article data-topic="tile" data-title="Tuile">
          <h2>Tuile</h2>
          <p>Taille en pixels, de 8 à 4096 pour chaque côté. Les boutons 64²…1024² donnent
            un carré ; « Largeur » et « Hauteur » règlent chaque côté séparément.</p>
          <p><b>Le raccord est exact quelle que soit la taille</b>, même impaire. Le motif de
            bruit est construit sur une grille qui compte un nombre entier de cellules par
            côté de tuile : le bord gauche prolonge ainsi le bord droit, et le bord haut le bord bas.</p>
          <p>Les tailles de tache des canaux sont exprimées en pixels. Quand la taille de la
            tuile change, le nombre de cellules est recalculé et les mentions « N cellules »
            des cartes se mettent à jour d’elles-mêmes.</p>
          <p>Plus la tuile est grande, plus le calcul est long : la durée de la dernière image
            s’affiche dans la barre d’état en bas (« rendu … ms »).</p>
        </article>

        <article data-topic="bg" data-title="Fond">
          <h2>Fond de tuile</h2>
          <p>Couleur unie sous tous les canaux. Sa valeur HEX figure à droite dans l’en-tête de
            la section. L’éditeur est le même que pour les couleurs des canaux : modes HSL et
            LCH, champ HEX, alpha — la signification des valeurs est décrite dans la rubrique
            <a data-go="color">Couleur</a>.</p>
          <p>Un <b>A</b> (alpha) inférieur à 1 rend le fond semi-transparent : le PNG et le WebP
            seront alors transparents, ce qui permet de poser la tuile sur un autre fond. Sur la
            scène, la couleur d’entourage apparaît à travers les zones transparentes
            (<a data-go="stage">Scène</a>).</p>
        </article>

        <article data-topic="chans" data-title="Canaux">
          <h2>Canaux de bruit</h2>
          <p>Un canal est une couche de motif. <b>Le premier canal de la liste repose directement
            sur le fond</b>, chacun des suivants se pose par-dessus les précédents ; le dernier est
            tout en haut. La manière dont un canal se combine avec ceux du dessous —
            <a data-go="layer">Calque</a>.</p>
          <h3>Carte du canal</h3>
          <dl>
            <dt>miniature</dt><dd>le canal seul, sans le fond ni les autres canaux ;</dd>
            <dt>nom</dt><dd>se modifie directement dans l’en-tête ;</dd>
            <dt>résumé</dt><dd>type · taille de tache · nombre d’octaves · mode de fusion et opacité ;</dd>
            <dt>bande</dt><dd>dégradé des couleurs du canal ;</dd>
            <dt>● / ○</dt><dd>activer / désactiver le canal (désactivé, il n’est pas dessiné mais reste dans le document) ;</dd>
            <dt>↑ ↓</dt><dd>monter / descendre dans la liste ;</dd>
            <dt>⧉</dt><dd>copie du canal avec une nouvelle graine aléatoire ;</dd>
            <dt>✕</dt><dd>supprimer le canal (Ctrl+Z le rétablit) ;</dd>
            <dt>›</dt><dd>un clic sur la carte déplie ou replie ses paramètres.</dd>
          </dl>
          <p>Si l’avertissement « Octaves limitées » apparaît dans la carte, certaines octaves
            ne tiennent pas : la cellule de la suivante ferait moins de 2 pixels (<a data-go="noise">Bruit</a>).</p>
          <h3>Nouveau canal</h3>
          <p>Les boutons « + … » sous la liste ajoutent un canal du type voulu en fin de liste,
            c’est-à-dire par-dessus les autres. Chaque bouton montre une miniature du motif de ce type.</p>
        </article>

        <article data-topic="noise" data-title="Bruit">
          <h2>Bruit — quel motif</h2>
          <dl>
            <dt>Type</dt><dd>
              <b>Perlin</b> — nuages, taches douces et sinueuses ;
              <b>Value</b> — plus doux que Perlin, moins « filandreux » ;
              <b>Worley</b> — taches et cellules autour de points aléatoires ;
              <b>Grain</b> — points indépendants, comme le grain d’une pellicule.</dd>
            <dt>Tache X, Y</dt><dd>Taille d’une cellule du motif en pixels, à l’horizontale et
              à la verticale. Elle varie <b>par paliers</b> : chaque côté de la tuile doit contenir
              un nombre entier de cellules, sinon un raccord apparaîtrait ; la taille vaut donc
              toujours « côté / entier ». Sur une tuile de 256, après 128 (2 cellules) vient
              directement 85.3 (3 cellules). Le nombre actuel de cellules s’affiche sous le
              libellé. Taille minimale — 2 px, maximale — le côté entier (une seule cellule).</dd>
            <dt>Grain X, Y</dt><dd>Pour le type « Grain » — taille d’un grain, à partir de 1 px ; également par paliers.</dd>
            <dt>lier X=Y</dt><dd>aligne la taille en Y sur la taille en X.</dd>
            <dt>Graine</dt><dd>Numéro de variante du motif aléatoire : même graine — même motif ;
              autre graine — autre motif aux mêmes propriétés. Nombre entier ; ⟳ en tire une nouvelle au hasard.</dd>
            <dt>Octaves</dt><dd>1–10. Nombre de couches de motif de plus en plus fin additionnées :
              1 — taches lisses ; davantage — détails fins plus riches. Les octaves de moins de 2 px
              sont écartées, un avertissement le signale dans la carte.</dd>
            <dt>Atténuation</dt><dd>0–1 (gain). De combien chaque octave est plus faible que la
              précédente : 0.5 — deux fois ; près de 0, les détails fins sont à peine visibles ;
              près de 1, ils sont aussi marqués que les grandes taches.</dd>
            <dt>Lacunar.</dt><dd>2–4, entier (lacunarity). De combien chaque octave est plus fine
              que la précédente. Un entier, pour que les octaves se raccordent elles aussi sans couture.</dd>
            <dt>Crêtes</dt><dd>Perlin et Value : des plis et des arêtes au lieu de nuages.</dd>
            <dt>Mode</dt><dd>Worley. <b>F1</b> — distance au point le plus proche : taches rondes ;
              <b>F2</b> — au deuxième plus proche : plus grandes et plus anguleuses ;
              <b>F2−F1</b> — la différence : fines limites de cellules, fissures, réseau.</dd>
            <dt>Dispersion</dt><dd>Worley, 0–1. À quel point les points s’écartent du centre des
              cellules : 0 — grille régulière, 1 — désordre complet.</dd>
            <dt>Passe-haut</dt><dd>Grain, 0–64 px. 0 — bruit blanc. Au-dessus de 0, une copie floutée
              du grain avec ce rayon en est soustraite : les grandes taches qui trahissent la
              répétition de la tuile disparaissent (grain « bleu »).</dd>
            <dt>Distorsion</dt><dd>0–400 px. Le motif est déplacé par un second bruit, plus large :
              les lignes deviennent fluides, « marbrées ». La valeur est l’amplitude du déplacement,
              à peu près en pixels ; 0 — pas de distorsion.</dd>
            <dt>Échelle dist.</dt><dd>2–2048 px. Taille des ondes de distorsion : faible — fine
              ondulation, élevée — courbes amples. Visible lorsque la distorsion est supérieure à 0.</dd>
          </dl>
        </article>

        <article data-topic="shape" data-title="Forme">
          <h2>Forme — comment la valeur du bruit devient une couleur</h2>
          <p>En chaque point, le bruit est un nombre de 0 (faible) à 1 (fort). La couleur du point
            est prise à cet endroit du dégradé du canal (<a data-go="color">Couleur</a>). La forme
            modifie ce nombre avant la coloration, dans l’ordre : inversion → contraste → décalage → gamma.</p>
          <dl>
            <dt>Contraste</dt><dd>−1…1. 0 — aucun changement. Au-dessus de 0, l’écart autour du milieu
              s’étire : les taches sont plus nettes, et à 1 il reste presque deux couleurs pures sans
              transition. En dessous de 0, l’écart se resserre vers le milieu : à −1 toute la tuile
              prend une seule couleur intermédiaire, et vers −0.9 le motif est déjà presque invisible.</dd>
            <dt>Décalage</dt><dd>−0.5…0.5. S’ajoute à tout : au-dessus de 0, davantage de couleur du
              bruit fort ; en dessous de 0, davantage du faible.</dd>
            <dt>Gamma</dt><dd>0.1–8, 1 — aucun changement. Au-dessus de 1, la couleur du bruit faible
              domine et les zones fortes se réduisent à des taches éparses ; en dessous de 1, c’est l’inverse.</dd>
            <dt>Inversion</dt><dd>les zones faibles et fortes échangent leurs places.</dd>
            <dt>Normaliser</dt><dd>Sans cette option, c’est la plage théorique du bruit qui est
              appliquée au dégradé ; or la plage réelle est généralement plus étroite — surtout avec
              beaucoup d’octaves — et les couleurs des poignées extrêmes ne sont pas atteintes. Avec
              elle, l’écart réel du bruit sur cette tuile est étiré sur tout le dégradé.</dd>
          </dl>
        </article>

        <article data-topic="color" data-title="Couleur">
          <h2>Couleur du canal</h2>
          <p>Une bande de dégradé à deux poignées : <b>faible</b> — la couleur là où le bruit vaut 0,
            <b>fort</b> — là où il vaut 1 ; entre les deux, une transition douce. L’alpha passe lui
            aussi d’une poignée à l’autre.</p>
          <ul>
            <li>clic sur une poignée — ouvrir son éditeur, second clic — le masquer ;</li>
            <li>⇄ — intervertir les couleurs ;</li>
            <li>dans quel espace les deux couleurs se mélangent — <a data-go="out">Sortie</a>.</li>
          </ul>
          <h3>Éditeur de couleur</h3>
          <p>Le petit carré montre la couleur actuelle, le champ son HEX (#RRGGBB, modifiable).
            Le sélecteur <b>HSL / LCH</b> offre deux façons de régler la même couleur ; le choix est
            commun à tous les éditeurs et mémorisé. L’échelle sous chaque curseur montre la couleur
            obtenue si l’on ne bouge que ce curseur — c’est pourquoi les échelles se redessinent
            quand les autres curseurs changent.</p>
          <h3>LCH (OKLCH)</h3>
          <dl>
            <dt>L</dt><dd>0–1, luminosité perçue : 0 — noir, 1 — blanc. Même L — couleurs
              d’apparence aussi claire, quelle que soit la teinte. L = 0.5 correspond à peu près au
              gris #636363, et non à « la moitié de la luminosité de l’écran ».</dd>
            <dt>C</dt><dd>0–0.33, chroma — à quel point la couleur s’écarte du gris de même L.
              Valeur absolue : 0 — gris, 0.03–0.05 — à peine teinté, vers 0.1 — nettement coloré,
              0.15–0.25 — vif, vers 0.32 — limite de l’écran sRGB.</dd>
            <dt>H</dt><dd>0–360°, teinte. Repères : rouge ≈ 29, jaune ≈ 110, vert ≈ 142,
              cyan ≈ 195, bleu ≈ 264, magenta ≈ 328.</dd>
          </dl>
          <p><b>La queue sombre de l’échelle C</b> correspond à une chroma que l’écran ne peut pas
            afficher avec les L et H actuels. Cette limite varie : le jaune ne peut être saturé que
            clair, le bleu que sombre, et le presque noir comme le presque blanc n’ont aucune saturation.
            Si la C demandée ne tient pas, elle est réduite jusqu’à la limite, le curseur se déplace
            et un message l’indique sous les curseurs. Revenez au L ou au H d’origine, et la C demandée revient aussi.</p>
          <h3>HSL (OKHSL)</h3>
          <dl>
            <dt>H</dt><dd>0–360°, teinte, même angle qu’en LCH.</dd>
            <dt>S</dt><dd>0–1, saturation <b>relative au maximum possible</b> pour ces L et H :
              1 — impossible d’être plus saturé. Rien n’est donc rogné, mais un même S pour des
              teintes différentes donne des couleurs d’éclat apparent différent.</dd>
            <dt>L</dt><dd>0–1, luminosité : 0 — noir, 1 — blanc.</dd>
          </dl>
          <p>LCH est pratique quand les couleurs doivent paraître également saturées, HSL quand on
            veut tourner les curseurs sans contrainte. Dans le fichier, la couleur est de toute façon stockée en OKHSL.</p>
          <h3>A</h3>
          <p>0–1, opacité de la couleur : 0 — transparente, 1 — opaque.</p>
        </article>

        <article data-topic="layer" data-title="Calque">
          <h2>Calque — comment un canal se pose sur ceux du dessous</h2>
          <dl>
            <dt>Fusion</dt><dd>Mode de fusion avec tout ce qui se trouve sous le canal (le fond et
              les canaux placés plus haut dans la liste). Calculé en lumière linéaire selon les formules du W3C.
              <ul>
                <li><b>Normal</b> — le canal recouvre le dessous, à hauteur de son opacité ;</li>
                <li><b>Produit</b> — assombrit : le blanc ne change rien au dessous, le noir donne du noir ;</li>
                <li><b>Superposition</b> — éclaircit : le noir ne change rien au dessous ;</li>
                <li><b>Incrustation</b> — renforce le contraste du dessous : le sombre s’assombrit, le clair s’éclaircit ;</li>
                <li><b>Lumière crue</b> — même chose, mais c’est le canal qui décide : ses zones sombres assombrissent, ses zones claires éclaircissent ;</li>
                <li><b>Lumière tamisée</b> — variante douce de la lumière crue ;</li>
                <li><b>Addition</b> — les luminosités s’additionnent, éclaircit fortement ;</li>
                <li><b>Soustraction</b> — le canal est soustrait du dessous, assombrit ;</li>
                <li><b>Obscurcir / Éclaircir</b> — pour chaque composante, on garde la plus petite /
                  la plus grande des deux valeurs ;</li>
                <li><b>Différence</b> — valeur absolue de la différence : deux valeurs identiques donnent du noir.</li>
              </ul></dd>
            <dt>Opacité</dt><dd>0–1, opacité du canal tout entier — en plus de l’alpha de ses couleurs.
              0 — canal invisible, 1 — pleine intensité.</dd>
          </dl>
        </article>

        <article data-topic="out" data-title="Sortie">
          <h2>Sortie — réglages généraux du calcul</h2>
          <dl>
            <dt>Mélange</dt><dd>Espace dans lequel est calculée la transition entre les deux couleurs
              de chaque canal. <b>OKLab</b> — régulier à l’œil, sans milieux ternes ni sombres.
              <b>sRGB linéaire</b> — comme la lumière se mélange physiquement ; le milieu de la
              transition paraît plus clair qu’en OKLab. N’influe pas sur les modes de fusion
              des calques : ils sont toujours calculés en lumière linéaire.</dd>
            <dt>Tramage</dt><dd>Supprime les bandes (banding) dans les dégradés doux, qui apparaissent
              lors du passage à 8 bits par canal. <b>TPDF</b> — bruit imperceptible,
              <b>Bayer 8×8</b> — motif régulier, <b>Désactivé</b> — pas de tramage. Le noir pur
              et l’alpha totalement opaque restent purs.</dd>
            <dt>Force, LSB</dt><dd>0–4, intensité du tramage en bits de poids faible : 1 — un palier sur
              les 256 valeurs d’un canal.</dd>
            <dt>Qualité</dt><dd>0–1, uniquement pour l’export WEBP : 1.00 — sans perte ; en dessous,
              le fichier est plus léger mais présente des artefacts de compression.</dd>
          </dl>
        </article>

        <article data-topic="stage" data-title="Scène">
          <h2>Scène — vérifier le raccord à l’œil</h2>
          <p>La scène est entièrement pavée par la tuile. Une tuile, au centre, est repérée par
            des coins.</p>
          <dl>
            <dt>zoom</dt><dd>25–800 %. Curseur, molette de la souris sur la scène ou Ctrl+= / Ctrl+− ;
              « 1:1 », double-clic sur la scène ou Ctrl+0 — 100 %.</dd>
            <dt>fond</dt><dd>couleur d’entourage autour du pavage ; elle apparaît aussi à travers les
              zones transparentes de la tuile. Utile pour juger l’effet de la tuile sur fond sombre ou clair.</dd>
            <dt>Bords</dt><dd>fine grille le long des bords des tuiles.</dd>
            <dt>Décalage ½</dt><dd>décale le pavage d’une demi-tuile : au centre de la scène se trouve
              le coin où se rejoignent quatre tuiles — s’il y avait un raccord, c’est là qu’il se verrait.</dd>
            <dt>Lissage</dt><dd>lissage des pixels à l’agrandissement ; sans lui, les pixels restent
              nets.</dd>
            <dt>Bibliothèque</dt><dd>afficher / masquer la colonne de droite (<a data-go="lib">Bibliothèque</a>).</dd>
          </dl>
          <p>Barre d’état en bas : disponibilité, taille de la tuile, nombre de canaux actifs,
            durée de la dernière image et nombre de threads du moteur.</p>
        </article>

        <article data-topic="lib" data-title="Bibliothèque">
          <h2>Bibliothèque de préréglages</h2>
          <p>La bibliothèque est un dossier quelconque contenant des fichiers <code>*.json</code>. Le
            dossier <code>presets/</code> du programme convient aussi.</p>
          <dl>
            <dt>Dossier…</dt><dd>choisir le dossier ; le choix est mémorisé.</dd>
            <dt>↗</dt><dd>ouvrir le dossier dans l’Explorateur.</dd>
            <dt>↻</dt><dd>relire le dossier (si les fichiers ont été modifiés ailleurs).</dd>
            <dt>miniature</dt><dd>un clic ouvre le préréglage et lie le document à son fichier :
              « Enregistrer » écrit directement dedans.</dd>
            <dt>✕ sur la miniature</dt><dd>supprimer le fichier du dossier, après confirmation.</dd>
          </dl>
          <p>Les fichiers en erreur ne disparaissent pas en silence : la liste des causes figure sous
            l’en-tête, et les <code>*.json</code> étrangers sont énumérés à part.</p>
        </article>

        <article data-topic="files" data-title="Fichiers et export">
          <h2>Fichiers et export</h2>
          <p>Dans la barre du haut : le nom du préréglage (modifiable), à côté le nom du fichier
            auquel le document est lié, et un point s’il y a des modifications non enregistrées.</p>
          <dl>
            <dt>Ouvrir</dt><dd>ouvrir un préréglage <code>*.json</code> ; on peut aussi simplement
              déposer le fichier sur la fenêtre. Ctrl+Z après l’ouverture rétablit le document précédent.</dd>
            <dt>Enregistrer</dt><dd>écrire dans le fichier lié ; s’il n’y en a pas encore, l’emplacement est demandé.</dd>
            <dt>Sous…</dt><dd>enregistrer dans un nouveau fichier.</dd>
            <dt>CSS</dt><dd>copier dans le presse-papiers un bloc CSS : la tuile en data-URI et
              <code>background-repeat</code>.</dd>
            <dt>WEBP</dt><dd>export en WebP ; la qualité se règle dans la rubrique <a data-go="out">Sortie</a>.</dd>
            <dt>PNG</dt><dd>export en PNG, sans perte, avec alpha.</dd>
          </dl>
          <p>La session est enregistrée automatiquement : après un redémarrage, le même document est ouvert.</p>
        </article>

        <article data-topic="keys" data-title="Raccourcis">
          <h2>Clavier et souris</h2>
          <table>
            <tr><td>Ctrl+Z</td><td>annuler</td></tr>
            <tr><td>Ctrl+Y, Ctrl+Shift+Z</td><td>rétablir</td></tr>
            <tr><td>Ctrl+S</td><td>enregistrer</td></tr>
            <tr><td>Ctrl+Shift+S</td><td>enregistrer sous…</td></tr>
            <tr><td>Ctrl+O</td><td>ouvrir un préréglage (ou déposez un *.json sur la fenêtre)</td></tr>
            <tr><td>Ctrl+E</td><td>exporter en PNG</td></tr>
            <tr><td>Ctrl+= / Ctrl+−</td><td>zoom de la scène</td></tr>
            <tr><td>Ctrl+0</td><td>zoom 1:1</td></tr>
            <tr><td>molette sur la scène</td><td>zoom</td></tr>
            <tr><td>double-clic sur la scène</td><td>zoom 1:1</td></tr>
            <tr><td>glisser sur un champ numérique</td><td>modifier la valeur ; Shift — plus finement, Ctrl — plus vite</td></tr>
            <tr><td>F1</td><td>aide</td></tr>
            <tr><td>Esc</td><td>fermer l’aide</td></tr>
          </table>
        </article>
`
});
