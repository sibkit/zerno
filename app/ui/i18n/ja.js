"use strict";
/* ЗЕРНО · словарь: 日本語. Ключи — как в i18n/ru.js (эталон); проверка — checkLangs(). */
addLang("ja",{
  name:"日本語",
  strings:{
    "app.brand":"ZERNO",
    "app.title":"ZERNO — シームレスノイズジェネレーター",
    "app.sub":"シームレスノイズ",
    "doc.namePh":"プリセット名",
    "bar.open":"開く",
    "bar.save":"保存",
    "bar.saveAs":"別名…",
    "stage.zoom":"ズーム",
    "stage.surround":"背景",
    "stage.grid":"境界線",
    "stage.shift":"½ずらし",
    "stage.smooth":"スムーズ",
    "stage.lib":"ライブラリ",
    "st.tile":"タイル",
    "st.channels":"チャンネル",
    "st.render":"レンダリング",
    "st.engine":"エンジン",
    "st.seam":"継ぎ目:",
    "st.seamExact":"正確",
    "st.ready":"準備完了",
    "st.busy":"レンダリング中",
    "st.error":"エラー",
    "st.engineVal":"RUST · {n} スレッド",
    "unit.ms":"{v} ms",
    "help.title":"ヘルプ",
    "sec.tile":"タイル",
    "sec.bg":"タイルの背景",
    "sec.chans":"ノイズチャンネル",
    "sec.out":"出力",
    "tile.width":"幅",
    "tile.height":"高さ",
    "bg.color":"背景",
    "sub.noise":"ノイズ",
    "sub.shape":"形状",
    "sub.color":"カラー",
    "sub.layer":"レイヤー",
    "sub.dither":"ディザリング",
    "sub.webp":"WebP",
    "noise.perlin":"Perlin — 雲",
    "noise.value":"Value — ソフト",
    "noise.worley":"Worley — 斑点",
    "noise.grain":"グレイン — フィルム",
    "noise.perlin.short":"Perlin",
    "noise.value.short":"Value",
    "noise.worley.short":"Worley",
    "noise.grain.short":"グレイン",
    "noise.type":"タイプ",
    "noise.spotSize":"スポット {axis}",
    "noise.grainSize":"グレイン {axis}",
    "noise.cells":{"other":"{n} セル"},
    "noise.linkXY":"X=Y をリンク",
    "noise.seed":"シード",
    "noise.seedBad":"シードは −2147483648〜2147483647 の整数で指定してください。入力値:「{value}」。",
    "noise.octaves":"オクターブ",
    "noise.gain":"減衰",
    "noise.lacunarity":"空隙度",
    "noise.ridged":"稜線 (ridged)",
    "noise.worleyMode":"モード",
    "noise.jitter":"ばらつき",
    "noise.grainHp":"ハイパス",
    "noise.warp":"歪み",
    "noise.warpSize":"歪みスケール",
    "worley.f1":"F1 — 斑点",
    "worley.f2":"F2 — 2番目の点",
    "worley.f2f1":"F2−F1 — セル/ひび割れ",
    "shape.contrast":"コントラスト",
    "shape.bias":"オフセット",
    "shape.gamma":"ガンマ",
    "shape.invert":"反転",
    "shape.normalize":"範囲を正規化",
    "stops.low":"弱",
    "stops.high":"強",
    "stops.lowTitle":"弱いノイズ · 0",
    "stops.highTitle":"強いノイズ · 1",
    "layer.blend":"描画モード",
    "layer.opacity":"不透明度",
    "blend.normal":"通常",
    "blend.multiply":"乗算",
    "blend.screen":"スクリーン",
    "blend.overlay":"オーバーレイ",
    "blend.hard-light":"ハードライト",
    "blend.soft-light":"ソフトライト",
    "blend.add":"加算",
    "blend.subtract":"減算",
    "blend.darken":"比較 (暗)",
    "blend.lighten":"比較 (明)",
    "blend.difference":"差の絶対値",
    "out.stopMix":"混色",
    "out.ditherMode":"モード",
    "out.ditherAmount":"強さ (LSB)",
    "out.webpQuality":"品質",
    "stopMix.oklab":"OKLab（知覚的）",
    "stopMix.srgb-linear":"リニア sRGB（物理的）",
    "dither.tpdf":"TPDF（ノイズ）",
    "dither.ordered":"ベイヤー 8×8",
    "dither.off":"オフ",
    "color.badMode":"保存されたカラーモード「{mode}」は不明です — HSL を選択しました。",
    "color.clipped":"C を sRGB 色域の境界まで下げました: {c}（指定値 {want}）。",
    "chan.copySuffix":" のコピー",
    "meta.octaves":"{n} oct",
    "warn.octaves":"オクターブを {cap} に制限しました: {w}×{h} のタイルでは、次のオクターブのセルが 1 ピクセルより小さくなります。",
    "render.prepFail":"ジョブの準備に失敗しました: {err}",
    "render.fail":"レンダリングエラー: {err}",
    "render.metaFail":"チャンネルの説明の生成エラー: {err}",
    "file.unsaved":"ファイル未保存",
    "file.saved":"保存しました: {path}",
    "session.autosaveFail":"自動保存に失敗しました: {err}",
    "session.restoreFail":"前回のセッションを復元できませんでした: {err}\n組み込みプリセットを開きました。",
    "src.history":"編集履歴",
    "src.session":"前回のセッション",
    "src.default":"組み込みプリセット",
    "src.typeThumb":"{type} タイプのサムネイル",
    "lib.title":"ライブラリ",
    "lib.dir":"フォルダー…",
    "lib.noDir":"ライブラリのフォルダーが選択されていません。「フォルダー…」をクリックしてください。どのフォルダーでも構いません（例: プログラムフォルダー内の presets/）。",
    "lib.presets":{"other":"プリセット {n} 件"},
    "lib.skipped":"、ZERNO 以外: {n}（{list}）",
    "lib.errors":"エラー（{n}）:",
    "lib.thumbError":"エラー",
    "lib.thumbFail":"ライブラリのサムネイル: {err}",
    "lib.delAsk":"ファイル「{name}」をライブラリのフォルダーから削除しますか？\nこの操作は元に戻せません。",
    "lib.delTitle":"ZERNO — プリセットの削除",
    "lib.delOk":"削除",
    "lib.delCancel":"キャンセル",
    "lib.deleted":"ファイルを削除しました: {name}",
    "lib.fail":"ライブラリ: {err}",
    "doc.opened":"開きました: {name}  ·  Ctrl+Z で前のドキュメントに戻せます",
    "doc.openFail":"{name} を開けませんでした: {err}",
    "doc.root":"ドキュメント",
    "dlg.libDir":"プリセットライブラリのフォルダー",
    "dlg.open":"プリセットを開く",
    "dlg.save":"プリセットを保存",
    "dlg.filter":"ZERNO プリセット",
    "dlg.exportPng":"PNG を書き出し",
    "dlg.exportWebp":"WebP を書き出し",
    "export.saved":"{fmt} を保存しました: {path}  ·  {kb} KB",
    "css.comment":"{name} — タイル {w}×{h}",
    "css.copied":"CSS をクリップボードにコピーしました（data-URI を含めて {kb} KB）。",
    "drop.skipped":"スキップしました（*.json のみ対応）: {list}",
    "drop.many":"ドロップされたプリセット: {n} 件。最初のファイルを開きました: {first}",
    "drop.unavailable":"ファイルのドラッグ＆ドロップは利用できません: {err}",
    "preset.default":"ベース · ダークキャンバス",
    "preset.default.clouds":"雲",
    "preset.default.cells":"斑点",
    "preset.default.grain":"グレイン",
    "boot.runExe":"アプリケーション zerno.exe を起動してください。",
    "boot.badDefault":"組み込みプリセットが検証に失敗しました:\n{err}",
    "engine.infoFail":"エンジン情報: {err}",
    "titlebar.fail":"タイトルバーの色: {err}",
    "titlebar.part.caption":"背景",
    "titlebar.part.text":"テキスト",
    "titlebar.part.border":"枠線",
    "thumbs.typeFail":"ノイズタイプのサムネイルを生成できませんでした: {err}",
    "lang.badSaved":"保存された言語「{code}」は不明です — システムの言語を選択しました。",
    "lang.titleFail":"ウィンドウのタイトルを更新できませんでした: {err}",
    "msg.inFile":"[ファイル: {file}]",
    "msg.internal":"内部エラー: {text}",
    "msg.doc.notObject":"{field}: オブジェクトが必要です（実際の値: {got}）",
    "msg.doc.missing":"{field}: フィールドがありません（必須）",
    "msg.doc.notNumber":"{field}: 数値が必要です（実際の値: {got}）",
    "msg.doc.range":"{field}: 値 {value} が範囲 [{min}; {max}] の外にあります",
    "msg.doc.notInt":"{field}: 整数が必要です（実際の値: {value}）",
    "msg.doc.notBool":"{field}: true/false が必要です（実際の値: {got}）",
    "msg.doc.notString":"{field}: 文字列が必要です（実際の値: {got}）",
    "msg.doc.badEnum":"{field}: 無効な値 \"{value}\"。有効な値: {allowed}",
    "msg.doc.unknownField":"{field}: 不明なフィールドです。有効なフィールド: {allowed}",
    "msg.doc.format":"{field}: \"{want}\" が必要です（実際の値: \"{got}\"）",
    "msg.doc.version":"{field}: ファイルのバージョンは {got} です。サポートされているのは {supported} のみです",
    "msg.doc.notArray":"{field}: 配列が必要です（実際の値: {got}）",
    "msg.doc.json":"JSON として解析できません: {detail}",
    "msg.doc.notPreset":"「{name}」は ZERNO のプリセットではありません（\"format\": \"{format}\" がありません）。",
    "msg.color.badHex":"無効な HEX: \"{hex}\"。#RGB または #RRGGBB の形式で指定してください。",
    "msg.export.webpFail":"WebView が WebP をエンコードできませんでした（結果: {got}）。PNG で保存してください。",
    "msg.lib.badJson":"{name}: JSON として解析できません — {detail}",
    "msg.render.degenerate":"チャンネル「{channel}」、タイプ「{type}」: スポットサイズ {w}×{h} px が {min} px 未満です。このグリッドではノイズが崩れてしまいます。スポットサイズを大きくするか、1 px 向けに設計された「グレイン」タイプを使用してください。",
    "msg.render.fieldOom":"チャンネル「{channel}」: {w}×{h} のノイズフィールド用のメモリが不足しています",
    "msg.render.bufferOom":"応答バッファー用のメモリが不足しています",
    "msg.render.tooLarge":"ジョブの合計面積が大きすぎます",
    "msg.worker.crashed":"ワーカースレッドがクラッシュしました: {detail}",
    "msg.settings.read":"{path} を読み込めません: {os}",
    "msg.settings.json":"{path}: JSON として解析できません — {detail}",
    "msg.settings.notObject":"{path}: オブジェクトが必要です",
    "msg.settings.unknownField":"{path}: 不明なフィールド「{field}」。有効なフィールド: {allowed}",
    "msg.settings.missing":"{path}.{field}: フィールドがありません（必須）",
    "msg.settings.badType":"{path}.{field}: 文字列または null が必要です",
    "msg.settings.locked":"クラッシュしたスレッドにより設定がロックされています",
    "msg.settings.mkdir":"{path} を作成できません: {os}",
    "msg.io.write":"{path} に書き込めません: {os}",
    "msg.io.replace":"{path} を置き換えられませんでした: {os}",
    "msg.io.replace.cleanup":"; 一時ファイル {tmp} を削除できませんでした: {cleanup}",
    "msg.path.notUnicode":"パスが Unicode ではありません: {path}",
    "msg.lib.dirUnavailable":"フォルダー {path} にアクセスできません: {os}",
    "msg.lib.walk":"フォルダー {path} の走査が中断されました: {os}",
    "msg.lib.nameNotUnicode":"ファイル名が Unicode ではありません: {path}",
    "msg.lib.fileType":"{name}: 種類を判別できません — {os}",
    "msg.file.read":"{path}: 読み込めません — {os}",
    "msg.file.tooLarge":"{path}: {bytes} バイト — {max} を超えているため、プリセットではありません",
    "msg.lib.notChosen":"ライブラリのフォルダーがまだ選択されていません。",
    "msg.lib.badName":"「{name}」はライブラリフォルダー内のプリセットのファイル名ではありません",
    "msg.lib.delete":"{path} を削除できませんでした: {os}",
    "msg.lib.reveal":"{path} を開けませんでした: {os}",
    "msg.file.noName":"ファイル名がありません: {path}",
    "msg.dialog.badPath":"選択されたパスを解析できません: {detail}",
    "msg.titlebar.unsupported":"Windows がタイトルバーの色（{part}）を受け付けませんでした: HRESULT {hresult}。タイトルバーの独自の色付けは Windows 11 でのみ利用できます。",
    "msg.titlebar.notWindows":"ウィンドウのタイトルバーの色付けは Windows 11 でのみ利用できます。"
  },
  help:`
        <article data-topic="start" data-title="はじめに">
          <h2>タイルのしくみ</h2>
          <p>タイルとは、継ぎ目なく繰り返し並べられる画像です。タイルは
            <b>背景</b>と、重ねられた<b>ノイズチャンネル</b>でできています。各チャンネルは
            2 色で着色されたノイズの模様で、その下にあるものの上に重なります。</p>
          <h3>作業の流れ</h3>
          <ol>
            <li>タイルのサイズ — <a data-go="tile">タイル</a>。</li>
            <li>模様の下の色 — <a data-go="bg">背景</a>。</li>
            <li>チャンネル — リストの下にある「+ …」ボタンで追加し、チャンネルカードで設定します:
              <a data-go="noise">ノイズ</a>、<a data-go="shape">形状</a>、
              <a data-go="color">カラー</a>、<a data-go="layer">レイヤー</a>。</li>
            <li>継ぎ目の確認 — <a data-go="stage">ステージ</a>。</li>
            <li>保存と書き出し — <a data-go="files">ファイルと書き出し</a>。</li>
          </ol>
          <h3>スライダーと数値</h3>
          <p>値は、スライダー、右側の入力欄への数値入力（小数点はピリオドでもカンマでも可、
            Enter で確定）、または入力欄そのものをマウスでドラッグして設定します。
            Shift を押しながらだと細かく、Ctrl を押しながらだと速く変わります。範囲外の数値は範囲の端に丸められます。</p>
          <p>編集内容はすぐにステージに反映されます。取り消しは Ctrl+Z です。すべてのショートカットは
            <a data-go="keys">キー操作</a>にまとめてあります。</p>
          <p>グループの <span class="help-i demo">?</span> アイコンをクリックすると、そのグループのヘルプが開きます。</p>
        </article>

        <article data-topic="tile" data-title="タイル">
          <h2>タイル</h2>
          <p>サイズはピクセル単位で、各辺 8〜4096 です。64²…1024² のボタンで正方形を、
            「幅」と「高さ」で各辺を個別に指定します。</p>
          <p><b>どんなサイズでも継ぎ目は正確につながります</b>。奇数サイズでも同様です。ノイズの模様は、
            タイルの 1 辺にセルが整数個ちょうど収まるグリッド上で生成されるため、
            タイルの左端は右端に、上端は下端に途切れなくつながります。</p>
          <p>チャンネルのスポットサイズはピクセルで指定します。タイルのサイズを変えると
            セル数が再計算され、カードの「N セル」の表示も自動で更新されます。</p>
          <p>タイルが大きいほど計算に時間がかかります。直近のフレームの所要時間は、
            画面下部のステータスバーに表示されます（「レンダリング … ms」）。</p>
        </article>

        <article data-topic="bg" data-title="背景">
          <h2>タイルの背景</h2>
          <p>すべてのチャンネルの下に敷かれる単色です。セクション見出しの右側にその HEX が表示されます。
            エディターはチャンネルのカラーと同じで、HSL / LCH モード、HEX 欄、アルファがあります。
            各値の意味は<a data-go="color">カラー</a>を参照してください。</p>
          <p><b>A</b>（アルファ）を 1 未満にすると背景が半透明になり、PNG と WebP は
            透明度付きで書き出されます。これにより、タイルを別の背景の上に重ねて使えます。ステージでは、
            透明な部分から周囲の色が透けて見えます（<a data-go="stage">ステージ</a>）。</p>
        </article>

        <article data-topic="chans" data-title="チャンネル">
          <h2>ノイズチャンネル</h2>
          <p>チャンネルは模様のレイヤー 1 枚分です。<b>リストの最初のチャンネルは背景のすぐ上に置かれ</b>、
            以降のチャンネルはそれより前のチャンネルの上に重なります。最後のチャンネルが最上位です。
            下のレイヤーへの重なり方は<a data-go="layer">レイヤー</a>で設定します。</p>
          <h3>チャンネルカード</h3>
          <dl>
            <dt>サムネイル</dt><dd>背景や他のチャンネルを除いた、そのチャンネル単体の表示。</dd>
            <dt>名前</dt><dd>見出しの上で直接編集できます。</dd>
            <dt>概要</dt><dd>タイプ · スポットサイズ · オクターブ数 · 描画モードと不透明度。</dd>
            <dt>カラーバー</dt><dd>チャンネルのカラーのグラデーション。</dd>
            <dt>● / ○</dt><dd>チャンネルのオン / オフ（オフのチャンネルは描画されませんが、ドキュメントには残ります）。</dd>
            <dt>↑ ↓</dt><dd>リスト内で上 / 下に移動。</dd>
            <dt>⧉</dt><dd>新しいランダムなシードでチャンネルを複製。</dd>
            <dt>✕</dt><dd>チャンネルを削除（Ctrl+Z で元に戻せます）。</dd>
            <dt>›</dt><dd>カードをクリックすると、パラメーターを展開 / 折りたたみます。</dd>
          </dl>
          <p>カードに「オクターブを制限しました」という警告が表示された場合は、一部のオクターブが
            収まりきっていません。次のオクターブのセルが 2 ピクセルより小さくなるためです（<a data-go="noise">ノイズ</a>）。</p>
          <h3>新しいチャンネル</h3>
          <p>リストの下にある「+ …」ボタンで、そのタイプのチャンネルをリストの末尾、
            つまり他のチャンネルの上に追加します。ボタンには、そのタイプの模様のサムネイルが表示されています。</p>
        </article>

        <article data-topic="noise" data-title="ノイズ">
          <h2>ノイズ — 模様の種類</h2>
          <dl>
            <dt>タイプ</dt><dd>
              <b>Perlin</b> — 雲のような、なめらかに曲がりくねった斑点。
              <b>Value</b> — Perlin よりやわらかく、筋っぽさが少ない。
              <b>Worley</b> — ランダムな点を中心とした斑点やセル。
              <b>グレイン</b> — フィルムグレインのような、互いに独立した点。</dd>
            <dt>スポット X, Y</dt><dd>模様のセル 1 つ分の大きさ（ピクセル）。水平方向と
              垂直方向で指定します。値は<b>段階的</b>に変わります。タイルの 1 辺にはセルが整数個
              収まる必要があり、そうでないと継ぎ目ができるため、サイズは常に「辺 ÷ 整数」になります。
              256 のタイルでは、128（2 セル）の次は 85.3（3 セル）です。ラベルの下に
              現在のセル数が表示されます。最小は 2 px、最大は辺全体（1 セル）です。</dd>
            <dt>グレイン X, Y</dt><dd>「グレイン」タイプでの粒 1 つの大きさ。1 px から、これも段階的に変わります。</dd>
            <dt>X=Y をリンク</dt><dd>Y 方向のサイズを X 方向のサイズに揃えます。</dd>
            <dt>シード</dt><dd>ランダムな模様のバリエーション番号です。同じシードなら同じ模様、
              違うシードなら同じ性質を持つ別の模様になります。整数で指定します。⟳ で新しいランダム値になります。</dd>
            <dt>オクターブ</dt><dd>1〜10。次第に細かくなる模様を何層重ねるかを指定します。
              1 ではなめらかな斑点に、増やすほど細部が豊かになります。2 px より細かいオクターブは
              破棄され、その旨がカードに警告として表示されます。</dd>
            <dt>減衰</dt><dd>0〜1（gain）。各オクターブが前のオクターブよりどれだけ弱くなるかを示します。
              0.5 で半分になります。0 に近いほど細部はほとんど見えなくなり、1 に近いほど
              細部が大きな斑点と同じくらい強く出ます。</dd>
            <dt>空隙度</dt><dd>2〜4 の整数（lacunarity）。各オクターブが前のオクターブより何倍細かくなるかを示します。
              整数なのは、オクターブ同士も継ぎ目なくつながるようにするためです。</dd>
            <dt>稜線</dt><dd>Perlin と Value のみ。雲の代わりに、ひだや尾根のような模様になります。</dd>
            <dt>モード</dt><dd>Worley のみ。<b>F1</b> — 最も近い点までの距離: 丸い斑点。
              <b>F2</b> — 2 番目に近い点までの距離: より大きく角ばった形。
              <b>F2−F1</b> — その差: 細いセルの境界、ひび割れ、網目。</dd>
            <dt>ばらつき</dt><dd>Worley のみ、0〜1。点がセルの中心からどれだけずれるかを示します。
              0 で整然とした格子、1 で完全にランダムな配置になります。</dd>
            <dt>ハイパス</dt><dd>グレインのみ、0〜64 px。0 はホワイトノイズです。0 より大きくすると、
              グレインからこの半径でぼかしたコピーが差し引かれます。これにより、タイルの繰り返しを
              目立たせる大きなムラが消えます（「ブルー」ノイズ化したグレイン）。</dd>
            <dt>歪み</dt><dd>0〜400 px。2 つめの大きなノイズで模様をずらし、線を流れるような
              「大理石」風にします。値はずれの強さで、おおよそピクセル単位です。0 で歪みなしです。</dd>
            <dt>歪みスケール</dt><dd>2〜2048 px。歪みの波の大きさです。小さいと細かなさざ波、
              大きいとなめらかなうねりになります。歪みが 0 より大きいときに表示されます。</dd>
          </dl>
        </article>

        <article data-topic="shape" data-title="形状">
          <h2>形状 — ノイズの値を色に変換する方法</h2>
          <p>各点のノイズは 0（弱）から 1（強）までの数値です。点の色は、その値の位置で
            チャンネルのグラデーションから取られます（<a data-go="color">カラー</a>）。形状は、着色の前に
            この数値を次の順で変換します: 反転 → コントラスト → オフセット → ガンマ。</p>
          <dl>
            <dt>コントラスト</dt><dd>−1…1。0 で変化なし。0 より大きいと中央からの散らばりが
              引き伸ばされ、斑点がくっきりします。1 ではほぼ中間のない 2 色になります。
              0 より小さいと散らばりが中央に向かって縮み、−1 ではタイル全体が中間の 1 色になります。
              −0.9 あたりで模様はほとんど見えなくなります。</dd>
            <dt>オフセット</dt><dd>−0.5…0.5。すべての値に加算されます。0 より大きいと強いノイズの色が、
              0 より小さいと弱いノイズの色が増えます。</dd>
            <dt>ガンマ</dt><dd>0.1〜8、1 で変化なし。1 より大きいと弱いノイズの色が優勢になり、
              強い部分はまばらな斑点に縮みます。1 より小さいとその逆になります。</dd>
            <dt>反転</dt><dd>弱い部分と強い部分を入れ替えます。</dd>
            <dt>正規化</dt><dd>オフの場合、グラデーションにはノイズの理論上の範囲が割り当てられますが、
              実際の範囲はそれより狭いのが普通です。特にオクターブが多いと狭くなり、両端の
              ハンドルの色まで届きません。オンにすると、このタイルでの実際のノイズの範囲が
              グラデーション全体に引き伸ばされます。</dd>
          </dl>
        </article>

        <article data-topic="color" data-title="カラー">
          <h2>チャンネルのカラー</h2>
          <p>2 つのハンドルを持つグラデーションバーです。<b>弱</b>はノイズが 0 の部分の色、
            <b>強</b>はノイズが 1 の部分の色で、その間はなめらかに変化します。アルファも
            一方のハンドルからもう一方へ変化します。</p>
          <ul>
            <li>ハンドルをクリックするとエディターが開き、もう一度クリックすると閉じます。</li>
            <li>⇄ で 2 つの色を入れ替えます。</li>
            <li>2 色をどの色空間で混ぜるかは<a data-go="out">出力</a>で設定します。</li>
          </ul>
          <h3>カラーエディター</h3>
          <p>四角は現在の色、入力欄は HEX（#RRGGBB、直接入力も可）です。
            <b>HSL / LCH</b> の切り替えは同じ色を編集する 2 つの方法で、選択はすべてのエディターで
            共通となり、記憶されます。各スライダーの下のスケールは、そのスライダーだけを動かしたときに
            色がどうなるかを示します。そのため、他のスライダーを動かすとスケールも描き直されます。</p>
          <h3>LCH (OKLCH)</h3>
          <dl>
            <dt>L</dt><dd>0〜1、知覚的な明度です。0 は黒、1 は白。L が同じなら、色相に関係なく
              同じ明るさに見えます。L = 0.5 はおよそグレーの #636363 で、
              「画面の明るさの半分」ではありません。</dd>
            <dt>C</dt><dd>0〜0.33、クロマ。同じ L のグレーからどれだけ離れているかを示します。
              絶対値です: 0 はグレー、0.03〜0.05 はかすかに色づいた程度、0.1 前後は
              はっきりした色、0.15〜0.25 は鮮やかな色、0.32 前後が sRGB 画面の限界です。</dd>
            <dt>H</dt><dd>0〜360°、色相。目安: 赤 ≈ 29、黄 ≈ 110、緑 ≈ 142、
              シアン ≈ 195、青 ≈ 264、マゼンタ ≈ 328。</dd>
          </dl>
          <p><b>C のスケールの暗い末端</b>は、現在の L と H では画面に表示できないクロマです。
            この境界は変動します。黄は明るいときだけ、青は暗いときだけ鮮やかにでき、
            黒や白に近い色はまったく彩度を持てません。指定した C が収まらない場合は境界まで下げられ、
            スライダーの位置がずれて、スライダーの下にその旨が表示されます。L や H を戻せば、
            指定した C も元に戻ります。</p>
          <h3>HSL (OKHSL)</h3>
          <dl>
            <dt>H</dt><dd>0〜360°、色相。LCH と同じ角度です。</dd>
            <dt>S</dt><dd>0〜1、その L と H で<b>取りうる最大値に対する</b>彩度です。
              1 がそれ以上鮮やかにできない状態です。そのため色が切り詰められることはありませんが、
              色相が違えば、同じ S でも見た目の鮮やかさは異なります。</dd>
            <dt>L</dt><dd>0〜1、明度。0 は黒、1 は白。</dd>
          </dl>
          <p>色の見た目の鮮やかさを揃えたいときは LCH、制限なく自由に調整したいときは HSL が便利です。
            どちらを使っても、ファイルには OKHSL で保存されます。</p>
          <h3>A</h3>
          <p>0〜1、色の不透明度です。0 は透明、1 は不透明。</p>
        </article>

        <article data-topic="layer" data-title="レイヤー">
          <h2>レイヤー — 下のレイヤーへの重なり方</h2>
          <dl>
            <dt>描画モード</dt><dd>チャンネルより下にあるすべて（背景と、リストでそれより上にあるチャンネル）への
              合成方法です。W3C の計算式に従い、リニアな光で計算されます。
              <ul>
                <li><b>通常</b> — 不透明度に応じて、チャンネルが下を覆います。</li>
                <li><b>乗算</b> — 暗くします。白は下を変えず、黒は黒になります。</li>
                <li><b>スクリーン</b> — 明るくします。黒は下を変えません。</li>
                <li><b>オーバーレイ</b> — 下のコントラストを強めます。暗い部分はより暗く、明るい部分はより明るくなります。</li>
                <li><b>ハードライト</b> — 同様ですが、チャンネル側が基準になります。暗い部分は暗く、明るい部分は明るくします。</li>
                <li><b>ソフトライト</b> — ハードライトのやわらかい版です。</li>
                <li><b>加算</b> — 明るさを足し合わせます。強く明るくなります。</li>
                <li><b>減算</b> — 下からチャンネルを引きます。暗くなります。</li>
                <li><b>比較 (暗) / 比較 (明)</b> — 各成分ごとに、2 つのうち
                  小さい方 / 大きい方が残ります。</li>
                <li><b>差の絶対値</b> — 差の絶対値です。同じ色同士は黒になります。</li>
              </ul></dd>
            <dt>不透明度</dt><dd>0〜1、チャンネル全体の不透明度です。カラーのアルファに加えて適用されます。
              0 でチャンネルは見えなくなり、1 で完全に反映されます。</dd>
          </dl>
        </article>

        <article data-topic="out" data-title="出力">
          <h2>出力 — 計算全体の設定</h2>
          <dl>
            <dt>混色</dt><dd>各チャンネルの 2 色の間の変化を、どの色空間で計算するかを指定します。
              <b>OKLab</b> — 見た目に均一で、中間が濁ったり暗くなったりしません。
              <b>リニア sRGB</b> — 物理的な光の混ざり方です。変化の中間は
              OKLab より明るく見えます。レイヤーの描画モードには
              影響しません。描画モードは常にリニアな光で計算されます。</dd>
            <dt>ディザリング</dt><dd>チャンネルあたり 8 ビットに変換する際、なめらかなグラデーションに
              生じる縞（バンディング）を取り除きます。<b>TPDF</b> は目立たないノイズ、
              <b>ベイヤー 8×8</b> は規則的なパターン、<b>オフ</b> はディザリングなしです。純粋な
              黒と完全に不透明なアルファはそのまま保たれます。</dd>
            <dt>強さ (LSB)</dt><dd>0〜4、下位ビット単位でのディザリングの強さです。1 はチャンネルの
              256 段階のうちの 1 段階に相当します。</dd>
            <dt>品質</dt><dd>0〜1、WEBP の書き出し専用です。1.00 はロスレス、値を下げると
              ファイルは小さくなりますが、圧縮によるアーティファクトが出ます。</dd>
          </dl>
        </article>

        <article data-topic="stage" data-title="ステージ">
          <h2>ステージ — 継ぎ目を目で確認する</h2>
          <p>ステージ全体がタイルで敷き詰められています。中央の 1 枚は
            四隅のマークで示されています。</p>
          <dl>
            <dt>ズーム</dt><dd>25〜800 %。スライダー、ステージ上でのマウスホイール、または Ctrl+= / Ctrl+− で変更します。
              「1:1」、ステージのダブルクリック、または Ctrl+0 で 100 % になります。</dd>
            <dt>背景</dt><dd>敷き詰められたタイルの周囲の色です。タイルの透明な部分からも
              この色が透けて見えます。暗い背景と明るい背景でタイルがどう見えるかを確かめるのに役立ちます。</dd>
            <dt>境界線</dt><dd>タイルの端に沿った細いグリッドです。</dd>
            <dt>½ずらし</dt><dd>配置をタイル半分ずらします。ステージの中央に 4 枚のタイルが
              接する角が来るので、もし継ぎ目があればここで見えるはずです。</dd>
            <dt>スムーズ</dt><dd>拡大時にピクセルをなめらかに補間します。オフにすると、くっきりした
              ピクセルが見えます。</dd>
            <dt>ライブラリ</dt><dd>右側の列の表示 / 非表示（<a data-go="lib">ライブラリ</a>）。</dd>
          </dl>
          <p>画面下部のステータスバーには、準備状態、タイルのサイズ、有効なチャンネル数、
            直近のフレームの所要時間、エンジンの計算スレッド数が表示されます。</p>
        </article>

        <article data-topic="lib" data-title="ライブラリ">
          <h2>プリセットライブラリ</h2>
          <p>ライブラリには、<code>*.json</code> ファイルを含む任意のフォルダーを使えます。
            プログラムフォルダー内の <code>presets/</code> でも構いません。</p>
          <dl>
            <dt>フォルダー…</dt><dd>フォルダーを選択します。選択は記憶されます。</dd>
            <dt>↗</dt><dd>フォルダーをエクスプローラーで開きます。</dd>
            <dt>↻</dt><dd>フォルダーを再読み込みします（外部でファイルを変更した場合）。</dd>
            <dt>サムネイル</dt><dd>クリックするとプリセットが開き、ドキュメントがそのファイルに関連付けられます。
              「保存」はそのファイルに直接書き込みます。</dd>
            <dt>サムネイル上の ✕</dt><dd>確認のうえ、ファイルをフォルダーから削除します。</dd>
          </dl>
          <p>エラーのあるファイルが黙って無視されることはありません。見出しの下に理由付きで一覧表示され、
            無関係な <code>*.json</code> は別に列挙されます。</p>
        </article>

        <article data-topic="files" data-title="ファイルと書き出し">
          <h2>ファイルと書き出し</h2>
          <p>上部のバーには、プリセット名（編集可能）と、その横にドキュメントが関連付けられている
            ファイル名が表示されます。未保存の変更がある場合はドットが付きます。</p>
          <dl>
            <dt>開く</dt><dd><code>*.json</code> プリセットを開きます。ファイルをウィンドウに
              ドロップするだけでも開けます。開いた後に Ctrl+Z を押すと、前のドキュメントに戻ります。</dd>
            <dt>保存</dt><dd>関連付けられたファイルに書き込みます。まだファイルがない場合は保存先を尋ねます。</dd>
            <dt>別名…</dt><dd>新しいファイルに保存します。</dd>
            <dt>CSS</dt><dd>CSS ブロックをクリップボードにコピーします。タイルは data-URI として埋め込まれ、
              <code>background-repeat</code> が指定されます。</dd>
            <dt>WEBP</dt><dd>WebP で書き出します。品質は<a data-go="out">出力</a>で設定します。</dd>
            <dt>PNG</dt><dd>PNG で書き出します。ロスレスで、アルファ付きです。</dd>
          </dl>
          <p>セッションは自動で保存され、再起動後も同じドキュメントが開きます。</p>
        </article>

        <article data-topic="keys" data-title="キー操作">
          <h2>キーボードとマウス</h2>
          <table>
            <tr><td>Ctrl+Z</td><td>取り消し</td></tr>
            <tr><td>Ctrl+Y, Ctrl+Shift+Z</td><td>やり直し</td></tr>
            <tr><td>Ctrl+S</td><td>保存</td></tr>
            <tr><td>Ctrl+Shift+S</td><td>別名で保存…</td></tr>
            <tr><td>Ctrl+O</td><td>プリセットを開く（または *.json をウィンドウにドロップ）</td></tr>
            <tr><td>Ctrl+E</td><td>PNG を書き出し</td></tr>
            <tr><td>Ctrl+= / Ctrl+−</td><td>ステージのズーム</td></tr>
            <tr><td>Ctrl+0</td><td>ズーム 1:1</td></tr>
            <tr><td>ステージ上でホイール</td><td>ズーム</td></tr>
            <tr><td>ステージをダブルクリック</td><td>ズーム 1:1</td></tr>
            <tr><td>数値欄をドラッグ</td><td>値を変更。Shift で細かく、Ctrl で速く</td></tr>
            <tr><td>F1</td><td>ヘルプ</td></tr>
            <tr><td>Esc</td><td>ヘルプを閉じる</td></tr>
          </table>
        </article>
`
});
