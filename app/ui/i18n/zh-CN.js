"use strict";
/* ЗЕРНО · словарь: 简体中文. Ключи — как в i18n/ru.js (эталон); проверка — checkLangs(). */
addLang("zh-CN",{
  name:"简体中文",
  strings:{
    "app.brand":"ZERNO",
    "app.title":"ZERNO — 无缝噪声生成器",
    "app.sub":"无缝噪声",
    "doc.namePh":"预设名称",
    "bar.open":"打开",
    "bar.save":"保存",
    "bar.saveAs":"另存为…",
    "stage.zoom":"缩放",
    "stage.surround":"衬底",
    "stage.grid":"边界",
    "stage.shift":"偏移 ½",
    "stage.smooth":"平滑",
    "stage.lib":"预设库",
    "st.tile":"图块",
    "st.channels":"通道",
    "st.render":"渲染",
    "st.engine":"引擎",
    "st.seam":"拼接：",
    "st.seamExact":"精确",
    "st.ready":"就绪",
    "st.busy":"渲染中",
    "st.error":"错误",
    "st.engineVal":"RUST · {n} 线程",
    "unit.ms":"{v} 毫秒",
    "help.title":"帮助",
    "sec.tile":"图块",
    "sec.bg":"图块背景",
    "sec.chans":"噪声通道",
    "sec.out":"输出",
    "tile.width":"宽度",
    "tile.height":"高度",
    "bg.color":"背景",
    "sub.noise":"噪声",
    "sub.shape":"形状",
    "sub.color":"颜色",
    "sub.layer":"图层",
    "sub.dither":"仿色",
    "sub.webp":"WebP",
    "noise.perlin":"Perlin — 云雾",
    "noise.value":"Value — 柔和",
    "noise.worley":"Worley — 斑块",
    "noise.grain":"颗粒 — 胶片",
    "noise.perlin.short":"Perlin",
    "noise.value.short":"Value",
    "noise.worley.short":"Worley",
    "noise.grain.short":"颗粒",
    "noise.type":"类型",
    "noise.spotSize":"斑块 {axis}",
    "noise.grainSize":"颗粒 {axis}",
    "noise.cells":{"other":"{n} 个单元"},
    "noise.linkXY":"锁定 X=Y",
    "noise.seed":"种子",
    "noise.seedBad":"种子须为 −2147483648 到 2147483647 之间的整数，收到的是“{value}”。",
    "noise.octaves":"倍频",
    "noise.gain":"衰减",
    "noise.lacunarity":"间隙度",
    "noise.ridged":"脊状 (ridged)",
    "noise.worleyMode":"模式",
    "noise.jitter":"散布",
    "noise.grainHp":"高通滤波",
    "noise.warp":"扭曲",
    "noise.warpSize":"扭曲尺度",
    "worley.f1":"F1 — 斑块",
    "worley.f2":"F2 — 次近点",
    "worley.f2f1":"F2−F1 — 单元/裂纹",
    "shape.contrast":"对比度",
    "shape.bias":"偏移",
    "shape.gamma":"伽马",
    "shape.invert":"反相",
    "shape.normalize":"范围归一化",
    "stops.low":"弱",
    "stops.high":"强",
    "stops.lowTitle":"弱噪声 · 0",
    "stops.highTitle":"强噪声 · 1",
    "layer.blend":"混合",
    "layer.opacity":"不透明度",
    "blend.normal":"正常",
    "blend.multiply":"正片叠底",
    "blend.screen":"滤色",
    "blend.overlay":"叠加",
    "blend.hard-light":"强光",
    "blend.soft-light":"柔光",
    "blend.add":"相加",
    "blend.subtract":"减去",
    "blend.darken":"变暗",
    "blend.lighten":"变亮",
    "blend.difference":"差值",
    "out.stopMix":"混合",
    "out.ditherMode":"模式",
    "out.ditherAmount":"强度, LSB",
    "out.webpQuality":"品质",
    "stopMix.oklab":"OKLab（感知均匀）",
    "stopMix.srgb-linear":"线性 sRGB（物理）",
    "dither.tpdf":"TPDF（噪声）",
    "dither.ordered":"拜耳 8×8",
    "dither.off":"关闭",
    "color.badMode":"已保存的颜色模式“{mode}”无法识别，已改用 HSL。",
    "color.clipped":"C 已降至 sRGB 色域边界：{c}（设定值 {want}）。",
    "chan.copySuffix":" 副本",
    "meta.octaves":"{n} 倍频",
    "warn.octaves":"倍频已限制为 {cap}：在 {w}×{h} 的图块上，下一级倍频的单元会小于一个像素。",
    "render.prepFail":"任务准备出错：{err}",
    "render.fail":"渲染出错：{err}",
    "render.metaFail":"通道说明出错：{err}",
    "file.unsaved":"未保存到文件",
    "file.saved":"已保存：{path}",
    "session.autosaveFail":"自动保存失败：{err}",
    "session.restoreFail":"未能恢复上次会话：{err}\n已打开内置预设。",
    "src.history":"编辑历史",
    "src.session":"上次会话",
    "src.default":"内置预设",
    "src.typeThumb":"{type} 类型缩略图",
    "lib.title":"预设库",
    "lib.dir":"文件夹…",
    "lib.noDir":"尚未选择预设库文件夹。点击“文件夹…”即可选择，任意文件夹都行，例如程序目录下的 presets/。",
    "lib.presets":{"other":"{n} 个预设"},
    "lib.skipped":"，非 ZERNO：{n}（{list}）",
    "lib.errors":"错误（{n}）：",
    "lib.thumbError":"错误",
    "lib.thumbFail":"预设库缩略图：{err}",
    "lib.delAsk":"要从预设库文件夹中删除文件“{name}”吗？\n此操作无法撤销。",
    "lib.delTitle":"ZERNO — 删除预设",
    "lib.delOk":"删除",
    "lib.delCancel":"取消",
    "lib.deleted":"文件已删除：{name}",
    "lib.fail":"预设库：{err}",
    "doc.opened":"已打开：{name}  ·  按 Ctrl+Z 可恢复之前的文档",
    "doc.openFail":"无法打开 {name}：{err}",
    "doc.root":"文档",
    "dlg.libDir":"预设库文件夹",
    "dlg.open":"打开预设",
    "dlg.save":"保存预设",
    "dlg.filter":"ZERNO 预设",
    "dlg.exportPng":"导出 PNG",
    "dlg.exportWebp":"导出 WebP",
    "export.saved":"{fmt} 已保存：{path}  ·  {kb} KB",
    "css.comment":"{name} — 图块 {w}×{h}",
    "css.copied":"CSS 已复制到剪贴板（含 data-URI，共 {kb} KB）。",
    "drop.skipped":"已跳过（仅接受 *.json）：{list}",
    "drop.many":"拖入了 {n} 个预设，已打开第一个：{first}",
    "drop.unavailable":"无法使用文件拖放：{err}",
    "preset.default":"基础 · 深色画布",
    "preset.default.clouds":"云雾",
    "preset.default.cells":"斑块",
    "preset.default.grain":"颗粒",
    "boot.runExe":"请运行应用程序 zerno.exe。",
    "boot.badDefault":"内置预设未通过校验：\n{err}",
    "engine.infoFail":"引擎信息：{err}",
    "titlebar.fail":"标题栏颜色：{err}",
    "titlebar.part.caption":"背景",
    "titlebar.part.text":"文字",
    "titlebar.part.border":"边框",
    "thumbs.typeFail":"未能生成噪声类型缩略图：{err}",
    "lang.badSaved":"已保存的语言“{code}”无法识别，已改用系统语言。",
    "lang.titleFail":"窗口标题未更新：{err}",
    "msg.inFile":"[文件：{file}]",
    "msg.internal":"内部错误：{text}",
    "msg.doc.notObject":"{field}：应为对象，实际为 {got}",
    "msg.doc.missing":"{field}：缺少字段（必填）",
    "msg.doc.notNumber":"{field}：应为数字，实际为 {got}",
    "msg.doc.range":"{field}：值 {value} 超出范围 [{min}; {max}]",
    "msg.doc.notInt":"{field}：应为整数，实际为 {value}",
    "msg.doc.notBool":"{field}：应为 true/false，实际为 {got}",
    "msg.doc.notString":"{field}：应为字符串，实际为 {got}",
    "msg.doc.badEnum":"{field}：无效值 \"{value}\"。允许的值：{allowed}",
    "msg.doc.unknownField":"{field}：未知字段。允许的字段：{allowed}",
    "msg.doc.format":"{field}：应为 \"{want}\"，实际为 \"{got}\"",
    "msg.doc.version":"{field}：文件版本为 {got}，仅支持 {supported}",
    "msg.doc.notArray":"{field}：应为数组，实际为 {got}",
    "msg.doc.json":"无法解析为 JSON：{detail}",
    "msg.doc.notPreset":"“{name}”不是 ZERNO 预设（缺少 \"format\": \"{format}\"）。",
    "msg.color.badHex":"无效的 HEX：\"{hex}\"。应为 #RGB 或 #RRGGBB。",
    "msg.export.webpFail":"WebView 未能编码 WebP（收到：{got}）。请改存 PNG。",
    "msg.lib.badJson":"{name}：无法解析为 JSON — {detail}",
    "msg.render.degenerate":"通道“{channel}”，类型“{type}”：斑块尺寸 {w}×{h} px 小于 {min} px，在这样的网格上噪声会退化。请增大斑块尺寸，或改用“颗粒”类型，它支持 1 px。",
    "msg.render.fieldOom":"通道“{channel}”：内存不足，无法分配 {w}×{h} 的噪声场",
    "msg.render.bufferOom":"内存不足，无法分配响应缓冲区",
    "msg.render.tooLarge":"任务总面积过大",
    "msg.worker.crashed":"工作线程崩溃：{detail}",
    "msg.settings.read":"无法读取 {path}：{os}",
    "msg.settings.json":"{path}：无法解析为 JSON — {detail}",
    "msg.settings.notObject":"{path}：应为对象",
    "msg.settings.unknownField":"{path}：未知字段“{field}”。允许的字段：{allowed}",
    "msg.settings.missing":"{path}.{field}：缺少字段（必填）",
    "msg.settings.badType":"{path}.{field}：应为字符串或 null",
    "msg.settings.locked":"设置已被崩溃的线程锁定",
    "msg.settings.mkdir":"无法创建 {path}：{os}",
    "msg.io.write":"无法写入 {path}：{os}",
    "msg.io.replace":"无法替换 {path}：{os}",
    "msg.io.replace.cleanup":"；临时文件 {tmp} 未删除：{cleanup}",
    "msg.path.notUnicode":"路径不是 Unicode 编码：{path}",
    "msg.lib.dirUnavailable":"文件夹 {path} 不可用：{os}",
    "msg.lib.walk":"遍历文件夹 {path} 时中断：{os}",
    "msg.lib.nameNotUnicode":"文件名不是 Unicode 编码：{path}",
    "msg.lib.fileType":"{name}：无法确定类型 — {os}",
    "msg.file.read":"{path}：无法读取 — {os}",
    "msg.file.tooLarge":"{path}：{bytes} 字节，超过 {max}，不是预设文件",
    "msg.lib.notChosen":"尚未选择预设库文件夹。",
    "msg.lib.badName":"“{name}”不是预设库文件夹中的预设文件名",
    "msg.lib.delete":"无法删除 {path}：{os}",
    "msg.lib.reveal":"无法打开 {path}：{os}",
    "msg.file.noName":"缺少文件名：{path}",
    "msg.dialog.badPath":"无法解析所选路径：{detail}",
    "msg.titlebar.unsupported":"Windows 未接受标题栏颜色（{part}）：HRESULT {hresult}。仅 Windows 11 支持自定义标题栏颜色。",
    "msg.titlebar.notWindows":"仅 Windows 11 支持为窗口标题栏着色。"
  },
  help:`
        <article data-topic="start" data-title="入门">
          <h2>图块的构成</h2>
          <p>图块是一张可以无缝重复的图片。它由<b>背景</b>和一叠<b>噪声通道</b>组成：
            每个通道都是一种噪声图案，用两种颜色上色后叠加在下方内容之上。</p>
          <h3>操作步骤</h3>
          <ol>
            <li>图块尺寸——<a data-go="tile">图块</a>。</li>
            <li>图案下方的颜色——<a data-go="bg">背景</a>。</li>
            <li>通道——用列表下方的“+ …”按钮添加，在通道卡片中调整：
              <a data-go="noise">噪声</a>、<a data-go="shape">形状</a>、
              <a data-go="color">颜色</a>、<a data-go="layer">图层</a>。</li>
            <li>检查拼接——<a data-go="stage">预览区</a>。</li>
            <li>保存与导出——<a data-go="files">文件与导出</a>。</li>
          </ol>
          <h3>滑块与数值</h3>
          <p>数值可以用滑块设置，也可以在右侧输入框中输入（小数点和逗号均可，按 Enter
            确认），或直接在输入框上按住鼠标拖动：按住 Shift 更精细，按住 Ctrl 更快。
            超出范围的数值会被限制到边界值。</p>
          <p>每次修改都会立即显示在预览区中。撤销用 Ctrl+Z，全部快捷键见
            <a data-go="keys">快捷键</a>一节。</p>
          <p>分组旁的 <span class="help-i demo">?</span> 图标会打开对应的帮助章节。</p>
        </article>

        <article data-topic="tile" data-title="图块">
          <h2>图块</h2>
          <p>尺寸以像素为单位，每边 8 到 4096。按钮 64²…1024² 设置正方形，
            “宽度”和“高度”分别设置两边。</p>
          <p><b>任何尺寸下拼接都是精确的</b>，奇数尺寸也不例外。噪声图案建立在网格上，
            图块每条边恰好容纳整数个单元，因此图块的左边缘与右边缘相接，上边缘与下边缘相接。</p>
          <p>通道中的斑块尺寸以像素为单位。更改图块尺寸时，单元数会重新计算，
            卡片中的“N 个单元”标注也会自动更新。</p>
          <p>图块越大，计算越久：最后一帧的耗时显示在底部状态栏中（“渲染 … 毫秒”）。</p>
        </article>

        <article data-topic="bg" data-title="背景">
          <h2>图块背景</h2>
          <p>位于所有通道之下的纯色。分区标题右侧显示它的 HEX 值。
            编辑器与通道颜色的相同：HSL 和 LCH 模式、HEX 输入框、Alpha——
            各数值的含义见<a data-go="color">颜色</a>一节。</p>
          <p><b>A</b>（Alpha）小于 1 时背景半透明：导出的 PNG 和 WebP 将带有透明度，
            这样图块就可以叠加在其他背景之上。在预览区中，透明处会透出衬底颜色
            （<a data-go="stage">预览区</a>）。</p>
        </article>

        <article data-topic="chans" data-title="通道">
          <h2>噪声通道</h2>
          <p>一个通道就是一层图案。<b>列表中的第一个通道直接位于背景之上</b>，
            之后的每个通道都叠在前面的通道之上，最后一个位于最顶层。通道如何与下层混合，
            见<a data-go="layer">图层</a>。</p>
          <h3>通道卡片</h3>
          <dl>
            <dt>缩略图</dt><dd>单独显示该通道，不含背景和其他通道；</dd>
            <dt>名称</dt><dd>可直接在标题中编辑；</dd>
            <dt>摘要</dt><dd>类型 · 斑块尺寸 · 倍频数 · 混合模式与不透明度；</dd>
            <dt>色条</dt><dd>通道的颜色渐变；</dd>
            <dt>● / ○</dt><dd>启用 / 停用通道（停用的通道不绘制，但仍保留在文档中）；</dd>
            <dt>↑ ↓</dt><dd>在列表中上移 / 下移；</dd>
            <dt>⧉</dt><dd>复制通道，并使用新的随机种子；</dd>
            <dt>✕</dt><dd>删除通道（Ctrl+Z 可恢复）；</dd>
            <dt>›</dt><dd>点击卡片可展开或折叠其参数。</dd>
          </dl>
          <p>如果卡片中出现“倍频已限制”的警告，说明部分倍频无法容纳：
            下一级倍频的单元会小于 2 像素（<a data-go="noise">噪声</a>）。</p>
          <h3>新建通道</h3>
          <p>列表下方的“+ …”按钮会在列表末尾添加相应类型的通道，即位于其他通道之上。
            按钮上显示该类型图案的缩略图。</p>
        </article>

        <article data-topic="noise" data-title="噪声">
          <h2>噪声——生成什么图案</h2>
          <dl>
            <dt>类型</dt><dd>
              <b>Perlin</b>——云雾，平滑蜿蜒的斑块；
              <b>Value</b>——比 Perlin 更柔和，“筋络感”更弱；
              <b>Worley</b>——围绕随机点形成的斑块和单元；
              <b>颗粒</b>——彼此独立的点，类似胶片颗粒。</dd>
            <dt>斑块 X、Y</dt><dd>图案中单个单元在水平和垂直方向上的像素尺寸。
              它按<b>级数</b>变化：图块每边必须容纳整数个单元，否则会出现接缝，因此尺寸总是
              “边长 / 整数”。在 256 的图块上，128（2 个单元）之后紧接着是 85.3（3 个单元）。
              标签下方显示当前的单元数。最小尺寸为 2 px，最大为整条边（1 个单元）。</dd>
            <dt>颗粒 X、Y</dt><dd>“颗粒”类型中单个颗粒的尺寸，最小 1 px，同样按级数变化。</dd>
            <dt>锁定 X=Y</dt><dd>使 Y 方向的尺寸等于 X 方向的尺寸。</dd>
            <dt>种子</dt><dd>随机图案的变体编号：种子相同则图案相同，
              种子不同则得到特性相同的另一种图案。须为整数；⟳ 生成新的随机种子。</dd>
            <dt>倍频</dt><dd>1–10。叠加多少层越来越细的图案：
              1 为平滑的斑块，越多细节越丰富。小于 2 px 的倍频会被舍弃，
              卡片中会出现相应警告。</dd>
            <dt>衰减</dt><dd>0–1（gain）。每一级倍频比上一级弱多少：0.5 即减半；
              越接近 0，细节越几乎不可见；越接近 1，细节与大斑块一样强。</dd>
            <dt>间隙度</dt><dd>2–4，整数（lacunarity）。每一级倍频比上一级细多少倍。
              取整数是为了让各级倍频也能无缝拼接。</dd>
            <dt>脊状</dt><dd>Perlin 和 Value：不再是云雾，而是褶皱和山脊。</dd>
            <dt>模式</dt><dd>Worley。<b>F1</b>——到最近点的距离：圆形斑块；
              <b>F2</b>——到第二近点的距离：更大、更有棱角；
              <b>F2−F1</b>——两者之差：细细的单元边界、裂纹、网格。</dd>
            <dt>散布</dt><dd>Worley，0–1。各点偏离单元中心的程度：
              0 为规整网格，1 为完全无序。</dd>
            <dt>高通滤波</dt><dd>颗粒，0–64 px。0 为白噪声。大于 0 时，
              会从颗粒中减去以此为半径模糊后的副本：大斑块随之消失，
              而正是这些斑块让图块的重复显而易见（“蓝噪声”颗粒）。</dd>
            <dt>扭曲</dt><dd>0–400 px。用第二个大尺度噪声推移图案，线条变得流动，
              呈“大理石”质感。数值为推移强度，大致以像素计；0 为不扭曲。</dd>
            <dt>扭曲尺度</dt><dd>2–2048 px。扭曲波纹的大小：值小为细碎涟漪，
              值大为平缓弯曲。扭曲大于 0 时才可见。</dd>
          </dl>
        </article>

        <article data-topic="shape" data-title="形状">
          <h2>形状——噪声值如何转换为颜色</h2>
          <p>每个点上的噪声都是一个 0（弱）到 1（强）之间的数。该点的颜色取自通道渐变上
            对应位置的颜色（<a data-go="color">颜色</a>）。形状在上色之前按以下顺序调整这个数：
            反相 → 对比度 → 偏移 → 伽马。</p>
          <dl>
            <dt>对比度</dt><dd>−1…1。0 为不变。大于 0 时，围绕中间值的分布被拉伸：
              斑块更锐利，为 1 时几乎只剩两种纯色、没有过渡。
              小于 0 时，分布向中间压缩：为 −1 时整个图块只有一种中间色，
              约 −0.9 时图案已几乎看不见。</dd>
            <dt>偏移</dt><dd>−0.5…0.5。加到所有值上：大于 0 时强噪声的颜色更多，
              小于 0 时弱噪声的颜色更多。</dd>
            <dt>伽马</dt><dd>0.1–8，1 为不变。大于 1 时弱噪声的颜色占主导，
              强的区域收缩为稀疏的斑块；小于 1 时则相反。</dd>
            <dt>反相</dt><dd>弱区域与强区域互换。</dd>
            <dt>归一化</dt><dd>未启用时，映射到渐变上的是噪声的理论范围，
              而实际范围通常更窄——倍频多时尤其如此，两端色标的颜色便无法达到。
              启用后，噪声在此图块上的实际分布会被拉伸到整个渐变。</dd>
          </dl>
        </article>

        <article data-topic="color" data-title="颜色">
          <h2>通道颜色</h2>
          <p>渐变条上有两个色标：<b>弱</b>——噪声为 0 处的颜色，
            <b>强</b>——噪声为 1 处的颜色；两者之间平滑过渡。Alpha
            也同样从一个色标过渡到另一个色标。</p>
          <ul>
            <li>点击色标打开其编辑器，再次点击则收起；</li>
            <li>⇄——交换两种颜色；</li>
            <li>两种颜色在哪种色彩空间中混合——见<a data-go="out">输出</a>。</li>
          </ul>
          <h3>颜色编辑器</h3>
          <p>小方块为当前颜色，输入框为 HEX（#RRGGBB，可输入自定义值）。
            <b>HSL / LCH</b> 开关是调整同一颜色的两种方式，所有编辑器共用此选择，并会被记住。
            每个滑块下方的色阶显示仅移动该滑块时颜色会变成什么样——因此
            其他滑块变化时，色阶会随之重绘。</p>
          <h3>LCH (OKLCH)</h3>
          <dl>
            <dt>L</dt><dd>0–1，感知亮度：0 为黑，1 为白。L 相同，
              任何色相的颜色看起来都一样亮。L = 0.5 约为灰色 #636363，
              而不是“屏幕亮度的一半”。</dd>
            <dt>C</dt><dd>0–0.33，彩度——颜色与相同 L 的灰色相差多少。
              这是绝对值：0 为灰色，0.03–0.05 为略带色调，约 0.1 为明显，
              0.15–0.25 为鲜艳，约 0.32 为 sRGB 屏幕的极限。</dd>
            <dt>H</dt><dd>0–360°，色相。参考值：红 ≈ 29，黄 ≈ 110，绿 ≈ 142，
              青 ≈ 195，蓝 ≈ 264，品红 ≈ 328。</dd>
          </dl>
          <p><b>C 色阶上的暗色尾段</b>表示在当前 L 和 H 下屏幕无法显示的彩度。
            这个边界是浮动的：黄色只有在亮时才能饱和，蓝色只有在暗时才能饱和，
            接近黑色和接近白色时则完全没有饱和度。如果设定的 C 超出范围，
            它会降至边界，滑块随之移动，滑块下方也会给出提示。把 L 或 H 调回去，
            设定的 C 也会恢复。</p>
          <h3>HSL (OKHSL)</h3>
          <dl>
            <dt>H</dt><dd>0–360°，色相，与 LCH 中的角度相同。</dd>
            <dt>S</dt><dd>0–1，饱和度，<b>相对于该 L 和 H 下可达到的最大值</b>：
              1 即饱和度最高。因此不会发生裁切，但相同的 S
              在不同色相上看起来鲜艳程度不同。</dd>
            <dt>L</dt><dd>0–1，亮度：0 为黑，1 为白。</dd>
          </dl>
          <p>需要颜色看起来同样饱和时用 LCH 更方便；想要不受限制地自由调整时用 HSL。
            无论哪种方式，文件中的颜色都以 OKHSL 存储。</p>
          <h3>A</h3>
          <p>0–1，颜色的不透明度：0 为透明，1 为不透明。</p>
        </article>

        <article data-topic="layer" data-title="图层">
          <h2>图层——通道如何叠加在下层之上</h2>
          <dl>
            <dt>混合</dt><dd>与通道下方所有内容（背景和列表中位于其上方的通道）的混合模式。
              按 W3C 公式在线性光下计算。
              <ul>
                <li><b>正常</b>——通道按其不透明度遮盖下层；</li>
                <li><b>正片叠底</b>——变暗：白色不改变下层，黑色得到黑色；</li>
                <li><b>滤色</b>——变亮：黑色不改变下层；</li>
                <li><b>叠加</b>——增强下层的对比度：暗处更暗，亮处更亮；</li>
                <li><b>强光</b>——效果相同，但由通道决定：通道的暗处使其变暗，亮处使其变亮；</li>
                <li><b>柔光</b>——强光的柔和版本；</li>
                <li><b>相加</b>——亮度相加，显著提亮；</li>
                <li><b>减去</b>——从下层中减去通道，使其变暗；</li>
                <li><b>变暗 / 变亮</b>——每个分量取两者中较小 / 较大的值；</li>
                <li><b>差值</b>——差的绝对值：相同的颜色得到黑色。</li>
              </ul></dd>
            <dt>不透明度</dt><dd>0–1，整个通道的不透明度，作用于其颜色的 Alpha 之上。
              0 为通道不可见，1 为完全显示。</dd>
          </dl>
        </article>

        <article data-topic="out" data-title="输出">
          <h2>输出——通用计算设置</h2>
          <dl>
            <dt>混合</dt><dd>每个通道两种颜色之间的过渡在哪种色彩空间中计算。
              <b>OKLab</b>——视觉上均匀，中间不会发脏、发暗。
              <b>线性 sRGB</b>——光在物理上的混合方式；过渡中段比 OKLab 中看起来更亮。
              不影响图层的混合模式：它们始终在线性光下计算。</dd>
            <dt>仿色</dt><dd>消除平滑过渡上在转换为每通道 8 位时出现的色带（banding）。
              <b>TPDF</b>——不易察觉的噪声，<b>拜耳 8×8</b>——规则图案，
              <b>关闭</b>——不使用仿色。纯黑和完全不透明的 Alpha 保持纯净。</dd>
            <dt>强度, LSB</dt><dd>0–4，以最低有效位计的仿色强度：1 即通道 256 级中的一级。</dd>
            <dt>品质</dt><dd>0–1，仅用于 WEBP 导出：1.00 为无损，值越小
              文件越小，但会出现压缩瑕疵。</dd>
          </dl>
        </article>

        <article data-topic="stage" data-title="预览区">
          <h2>预览区——用眼睛检查拼接</h2>
          <p>预览区整个由图块平铺而成。其中一块位于正中，以四角标记标出。</p>
          <dl>
            <dt>缩放</dt><dd>25–800 %。使用滑块、在预览区上滚动鼠标滚轮，或按 Ctrl+= / Ctrl+−；
              “1:1”、双击预览区或按 Ctrl+0 恢复 100 %。</dd>
            <dt>衬底</dt><dd>平铺区域四周的边框颜色；图块的透明处也会透出这个颜色。
              便于判断图块在深色和浅色上的效果。</dd>
            <dt>边界</dt><dd>沿图块边缘的细网格线。</dd>
            <dt>偏移 ½</dt><dd>将平铺偏移半个图块：四个图块交汇的角落移到预览区中心——
              如果存在接缝，就会在这里显现。</dd>
            <dt>平滑</dt><dd>放大时对像素进行平滑；关闭后显示清晰的像素。</dd>
            <dt>预设库</dt><dd>显示 / 隐藏右侧栏（<a data-go="lib">预设库</a>）。</dd>
          </dl>
          <p>底部状态栏显示：就绪状态、图块尺寸、已启用的通道数、
            最后一帧的耗时，以及引擎使用的线程数。</p>
        </article>

        <article data-topic="lib" data-title="预设库">
          <h2>预设库</h2>
          <p>预设库可以是任何包含 <code>*.json</code> 文件的文件夹。程序目录下的
            <code>presets/</code> 也可以。</p>
          <dl>
            <dt>文件夹…</dt><dd>选择文件夹；选择会被记住。</dd>
            <dt>↗</dt><dd>在资源管理器中打开文件夹。</dd>
            <dt>↻</dt><dd>重新读取文件夹（如果文件在外部被修改过）。</dd>
            <dt>缩略图</dt><dd>点击即打开预设，并将文档与其文件关联：
              “保存”会直接写入该文件。</dd>
            <dt>缩略图上的 ✕</dt><dd>从文件夹中删除文件，删除前会确认。</dd>
          </dl>
          <p>出错的文件不会被悄悄忽略：标题下方会列出它们及原因，
            无关的 <code>*.json</code> 文件会单独列出。</p>
        </article>

        <article data-topic="files" data-title="文件与导出">
          <h2>文件与导出</h2>
          <p>顶部栏显示预设名称（可编辑），旁边是文档所关联的文件名；
            如果有未保存的修改，还会显示一个圆点。</p>
          <dl>
            <dt>打开</dt><dd>打开 <code>*.json</code> 预设；也可以直接把文件拖到窗口上。
              打开后按 Ctrl+Z 可恢复之前的文档。</dd>
            <dt>保存</dt><dd>写入关联的文件；如果还没有文件，会询问保存位置。</dd>
            <dt>另存为…</dt><dd>保存到新文件。</dd>
            <dt>CSS</dt><dd>将 CSS 代码块复制到剪贴板：图块以 data-URI 形式嵌入，并带有
              <code>background-repeat</code>。</dd>
            <dt>WEBP</dt><dd>导出为 WebP，品质在<a data-go="out">输出</a>一节中设置。</dd>
            <dt>PNG</dt><dd>导出为 PNG，无损，带 Alpha。</dd>
          </dl>
          <p>会话会自动保存：重新启动后打开的仍是同一个文档。</p>
        </article>

        <article data-topic="keys" data-title="快捷键">
          <h2>键盘与鼠标</h2>
          <table>
            <tr><td>Ctrl+Z</td><td>撤销</td></tr>
            <tr><td>Ctrl+Y, Ctrl+Shift+Z</td><td>重做</td></tr>
            <tr><td>Ctrl+S</td><td>保存</td></tr>
            <tr><td>Ctrl+Shift+S</td><td>另存为…</td></tr>
            <tr><td>Ctrl+O</td><td>打开预设（或将 *.json 拖到窗口上）</td></tr>
            <tr><td>Ctrl+E</td><td>导出 PNG</td></tr>
            <tr><td>Ctrl+= / Ctrl+−</td><td>缩放预览区</td></tr>
            <tr><td>Ctrl+0</td><td>缩放至 1:1</td></tr>
            <tr><td>在预览区上滚动滚轮</td><td>缩放</td></tr>
            <tr><td>双击预览区</td><td>缩放至 1:1</td></tr>
            <tr><td>在数值框上拖动</td><td>调整数值；Shift 更精细，Ctrl 更快</td></tr>
            <tr><td>F1</td><td>帮助</td></tr>
            <tr><td>Esc</td><td>关闭帮助</td></tr>
          </table>
        </article>
`
});
