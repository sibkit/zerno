"use strict";
/* ЗЕРНО · словарь: 한국어. Ключи — как в i18n/ru.js (эталон); проверка — checkLangs(). */
addLang("ko",{
  name:"한국어",
  strings:{
    "app.brand":"ZERNO",
    "app.title":"ZERNO — 심리스 노이즈 생성기",
    "app.sub":"심리스 노이즈",
    "doc.namePh":"프리셋 이름",
    "bar.open":"열기",
    "bar.save":"저장",
    "bar.saveAs":"다른 이름…",
    "stage.zoom":"배율",
    "stage.surround":"주변색",
    "stage.grid":"경계",
    "stage.shift":"½ 이동",
    "stage.smooth":"스무딩",
    "stage.lib":"라이브러리",
    "st.tile":"타일",
    "st.channels":"채널",
    "st.render":"렌더",
    "st.engine":"엔진",
    "st.seam":"이음매:",
    "st.seamExact":"정확",
    "st.ready":"준비",
    "st.busy":"렌더 중",
    "st.error":"오류",
    "st.engineVal":"RUST · {n} 스레드",
    "unit.ms":"{v} ms",
    "help.title":"도움말",
    "sec.tile":"타일",
    "sec.bg":"타일 배경",
    "sec.chans":"노이즈 채널",
    "sec.out":"출력",
    "tile.width":"너비",
    "tile.height":"높이",
    "bg.color":"배경",
    "sub.noise":"노이즈",
    "sub.shape":"형태",
    "sub.color":"색상",
    "sub.layer":"레이어",
    "sub.dither":"디더링",
    "sub.webp":"WebP",
    "noise.perlin":"Perlin — 구름",
    "noise.value":"Value — 부드러움",
    "noise.worley":"Worley — 얼룩",
    "noise.grain":"그레인 — 필름",
    "noise.perlin.short":"Perlin",
    "noise.value.short":"Value",
    "noise.worley.short":"Worley",
    "noise.grain.short":"그레인",
    "noise.type":"유형",
    "noise.spotSize":"얼룩 {axis}",
    "noise.grainSize":"그레인 {axis}",
    "noise.cells":{"other":"셀 {n}개"},
    "noise.linkXY":"X=Y 연결",
    "noise.seed":"시드",
    "noise.seedBad":"시드는 −2147483648부터 2147483647까지의 정수여야 합니다. 입력값: “{value}”.",
    "noise.octaves":"옥타브",
    "noise.gain":"감쇠",
    "noise.lacunarity":"간극도",
    "noise.ridged":"능선 (ridged)",
    "noise.worleyMode":"모드",
    "noise.jitter":"무작위성",
    "noise.grainHp":"하이패스",
    "noise.warp":"왜곡",
    "noise.warpSize":"왜곡 크기",
    "worley.f1":"F1 — 얼룩",
    "worley.f2":"F2 — 두 번째 점",
    "worley.f2f1":"F2−F1 — 셀/균열",
    "shape.contrast":"대비",
    "shape.bias":"오프셋",
    "shape.gamma":"감마",
    "shape.invert":"반전",
    "shape.normalize":"범위 정규화",
    "stops.low":"약함",
    "stops.high":"강함",
    "stops.lowTitle":"약한 노이즈 · 0",
    "stops.highTitle":"강한 노이즈 · 1",
    "layer.blend":"혼합",
    "layer.opacity":"불투명도",
    "blend.normal":"표준",
    "blend.multiply":"곱하기",
    "blend.screen":"스크린",
    "blend.overlay":"오버레이",
    "blend.hard-light":"하드 라이트",
    "blend.soft-light":"소프트 라이트",
    "blend.add":"더하기",
    "blend.subtract":"빼기",
    "blend.darken":"어둡게 하기",
    "blend.lighten":"밝게 하기",
    "blend.difference":"차이",
    "out.stopMix":"혼합",
    "out.ditherMode":"모드",
    "out.ditherAmount":"강도, LSB",
    "out.webpQuality":"품질",
    "stopMix.oklab":"OKLab (지각적)",
    "stopMix.srgb-linear":"선형 sRGB (물리적)",
    "dither.tpdf":"TPDF (노이즈)",
    "dither.ordered":"Bayer 8×8",
    "dither.off":"끔",
    "color.badMode":"저장된 색상 모드 “{mode}”을(를) 알 수 없어 HSL을 선택했습니다.",
    "color.clipped":"C를 sRGB 색역 경계까지 낮췄습니다: {c} (설정값 {want}).",
    "chan.copySuffix":" 사본",
    "meta.octaves":"{n}옥타브",
    "warn.octaves":"옥타브를 {cap}개로 제한했습니다. {w}×{h} 타일에서는 다음 옥타브의 셀이 1픽셀보다 작아집니다.",
    "render.prepFail":"작업 준비 오류: {err}",
    "render.fail":"렌더 오류: {err}",
    "render.metaFail":"채널 설명 오류: {err}",
    "file.unsaved":"파일로 저장되지 않음",
    "file.saved":"저장됨: {path}",
    "session.autosaveFail":"자동 저장 실패: {err}",
    "session.restoreFail":"이전 세션을 복원하지 못했습니다: {err}\n기본 프리셋을 열었습니다.",
    "src.history":"편집 기록",
    "src.session":"이전 세션",
    "src.default":"기본 프리셋",
    "src.typeThumb":"{type} 유형 미리보기",
    "lib.title":"라이브러리",
    "lib.dir":"폴더…",
    "lib.noDir":"라이브러리 폴더가 선택되지 않았습니다. ‘폴더…’를 누르세요. 어떤 폴더든 괜찮습니다. 예: 프로그램 폴더의 presets/.",
    "lib.presets":{"other":"프리셋 {n}개"},
    "lib.skipped":", ZERNO 아님: {n} ({list})",
    "lib.errors":"오류 ({n}):",
    "lib.thumbError":"오류",
    "lib.thumbFail":"라이브러리 미리보기: {err}",
    "lib.delAsk":"라이브러리 폴더에서 “{name}” 파일을 삭제할까요?\n이 작업은 되돌릴 수 없습니다.",
    "lib.delTitle":"ZERNO — 프리셋 삭제",
    "lib.delOk":"삭제",
    "lib.delCancel":"취소",
    "lib.deleted":"파일 삭제됨: {name}",
    "lib.fail":"라이브러리: {err}",
    "doc.opened":"열림: {name}  ·  Ctrl+Z로 이전 문서로 돌아갈 수 있습니다",
    "doc.openFail":"{name}을(를) 열지 못했습니다: {err}",
    "doc.root":"문서",
    "dlg.libDir":"프리셋 라이브러리 폴더",
    "dlg.open":"프리셋 열기",
    "dlg.save":"프리셋 저장",
    "dlg.filter":"ZERNO 프리셋",
    "dlg.exportPng":"PNG 내보내기",
    "dlg.exportWebp":"WebP 내보내기",
    "export.saved":"{fmt} 저장됨: {path}  ·  {kb} KB",
    "css.comment":"{name} — {w}×{h} 타일",
    "css.copied":"CSS를 클립보드에 복사했습니다(data-URI 포함 {kb} KB).",
    "drop.skipped":"건너뜀(*.json 파일만 가능): {list}",
    "drop.many":"놓은 프리셋: {n}개. 첫 번째 파일을 열었습니다: {first}",
    "drop.unavailable":"파일 끌어서 놓기를 사용할 수 없습니다: {err}",
    "preset.default":"기본 · 어두운 바탕",
    "preset.default.clouds":"구름",
    "preset.default.cells":"얼룩",
    "preset.default.grain":"그레인",
    "boot.runExe":"zerno.exe 앱을 실행하세요.",
    "boot.badDefault":"기본 프리셋이 검사를 통과하지 못했습니다:\n{err}",
    "engine.infoFail":"엔진 정보: {err}",
    "titlebar.fail":"제목 표시줄 색상: {err}",
    "titlebar.part.caption":"배경",
    "titlebar.part.text":"텍스트",
    "titlebar.part.border":"테두리",
    "thumbs.typeFail":"노이즈 유형 미리보기를 만들지 못했습니다: {err}",
    "lang.badSaved":"저장된 언어 “{code}”을(를) 알 수 없어 시스템 언어를 선택했습니다.",
    "lang.titleFail":"창 제목을 업데이트하지 못했습니다: {err}",
    "msg.inFile":"[파일: {file}]",
    "msg.internal":"내부 오류: {text}",
    "msg.doc.notObject":"{field}: 객체가 필요합니다. 받은 값: {got}",
    "msg.doc.missing":"{field}: 필드가 없습니다(필수)",
    "msg.doc.notNumber":"{field}: 숫자가 필요합니다. 받은 값: {got}",
    "msg.doc.range":"{field}: 값 {value}이(가) 범위 [{min}; {max}]를 벗어났습니다",
    "msg.doc.notInt":"{field}: 정수가 필요합니다. 받은 값: {value}",
    "msg.doc.notBool":"{field}: true/false가 필요합니다. 받은 값: {got}",
    "msg.doc.notString":"{field}: 문자열이 필요합니다. 받은 값: {got}",
    "msg.doc.badEnum":"{field}: 허용되지 않는 값 \"{value}\". 허용되는 값: {allowed}",
    "msg.doc.unknownField":"{field}: 알 수 없는 필드입니다. 허용되는 필드: {allowed}",
    "msg.doc.format":"{field}: \"{want}\"이(가) 필요합니다. 받은 값: \"{got}\"",
    "msg.doc.version":"{field}: 파일 버전은 {got}이며, 지원되는 버전은 {supported}뿐입니다",
    "msg.doc.notArray":"{field}: 배열이 필요합니다. 받은 값: {got}",
    "msg.doc.json":"JSON으로 해석할 수 없습니다: {detail}",
    "msg.doc.notPreset":"“{name}”은(는) ZERNO 프리셋이 아닙니다(\"format\": \"{format}\" 없음).",
    "msg.color.badHex":"잘못된 HEX: \"{hex}\". #RGB 또는 #RRGGBB 형식이어야 합니다.",
    "msg.export.webpFail":"WebView가 WebP를 인코딩하지 못했습니다(받은 값: {got}). PNG로 저장하세요.",
    "msg.lib.badJson":"{name}: JSON으로 해석할 수 없습니다 — {detail}",
    "msg.render.degenerate":"채널 “{channel}”, 유형 “{type}”: 얼룩 크기 {w}×{h} px가 {min} px보다 작습니다. 이런 격자에서는 노이즈가 제대로 만들어지지 않습니다. 얼룩 크기를 늘리거나 1 px에 맞게 설계된 ‘그레인’ 유형을 사용하세요.",
    "msg.render.fieldOom":"채널 “{channel}”: {w}×{h} 노이즈 필드를 위한 메모리가 부족합니다",
    "msg.render.bufferOom":"응답 버퍼를 위한 메모리가 부족합니다",
    "msg.render.tooLarge":"작업의 총 면적이 너무 큽니다",
    "msg.worker.crashed":"작업 스레드가 비정상 종료되었습니다: {detail}",
    "msg.settings.read":"{path}을(를) 읽을 수 없습니다: {os}",
    "msg.settings.json":"{path}: JSON으로 해석할 수 없습니다 — {detail}",
    "msg.settings.notObject":"{path}: 객체가 필요합니다",
    "msg.settings.unknownField":"{path}: 알 수 없는 필드 “{field}”. 허용되는 필드: {allowed}",
    "msg.settings.missing":"{path}.{field}: 필드가 없습니다(필수)",
    "msg.settings.badType":"{path}.{field}: 문자열 또는 null이 필요합니다",
    "msg.settings.locked":"비정상 종료된 스레드 때문에 설정이 잠겼습니다",
    "msg.settings.mkdir":"{path}을(를) 만들 수 없습니다: {os}",
    "msg.io.write":"{path}에 쓸 수 없습니다: {os}",
    "msg.io.replace":"{path}을(를) 교체하지 못했습니다: {os}",
    "msg.io.replace.cleanup":"; 임시 파일 {tmp}을(를) 삭제하지 못했습니다: {cleanup}",
    "msg.path.notUnicode":"경로가 유니코드가 아닙니다: {path}",
    "msg.lib.dirUnavailable":"{path} 폴더에 접근할 수 없습니다: {os}",
    "msg.lib.walk":"{path} 폴더 탐색이 중단되었습니다: {os}",
    "msg.lib.nameNotUnicode":"파일 이름이 유니코드가 아닙니다: {path}",
    "msg.lib.fileType":"{name}: 유형을 확인할 수 없습니다 — {os}",
    "msg.file.read":"{path}: 읽을 수 없습니다 — {os}",
    "msg.file.tooLarge":"{path}: {bytes}바이트 — {max}보다 크므로 프리셋이 아닙니다",
    "msg.lib.notChosen":"라이브러리 폴더가 아직 선택되지 않았습니다.",
    "msg.lib.badName":"“{name}”은(는) 라이브러리 폴더의 프리셋 파일 이름이 아닙니다",
    "msg.lib.delete":"{path}을(를) 삭제하지 못했습니다: {os}",
    "msg.lib.reveal":"{path}을(를) 열지 못했습니다: {os}",
    "msg.file.noName":"파일 이름이 없습니다: {path}",
    "msg.dialog.badPath":"선택한 경로를 해석할 수 없습니다: {detail}",
    "msg.titlebar.unsupported":"Windows가 제목 표시줄 색상({part})을 적용하지 않았습니다: HRESULT {hresult}. 제목 표시줄 색상 변경은 Windows 11에서만 지원됩니다.",
    "msg.titlebar.notWindows":"창 제목 표시줄 색상 변경은 Windows 11에서만 지원됩니다."
  },
  help:`
        <article data-topic="start" data-title="시작하기">
          <h2>타일의 구성</h2>
          <p>타일은 이음매 없이 반복되는 이미지입니다. 타일은 <b>배경</b>과
            그 위에 쌓인 <b>노이즈 채널</b>로 이루어집니다. 각 채널은 두 가지 색으로
            칠한 노이즈 패턴이며, 아래에 있는 것 위에 겹쳐집니다.</p>
          <h3>작업 순서</h3>
          <ol>
            <li>타일 크기 — <a data-go="tile">타일</a>.</li>
            <li>패턴 아래의 색 — <a data-go="bg">배경</a>.</li>
            <li>채널은 목록 아래의 ‘+ …’ 버튼으로 추가하고, 채널 카드에서 설정합니다:
              <a data-go="noise">노이즈</a>, <a data-go="shape">형태</a>,
              <a data-go="color">색상</a>, <a data-go="layer">레이어</a>.</li>
            <li>이음매 확인 — <a data-go="stage">캔버스</a>.</li>
            <li>저장과 내보내기 — <a data-go="files">파일 및 내보내기</a>.</li>
          </ol>
          <h3>슬라이더와 숫자</h3>
          <p>값은 슬라이더로, 오른쪽 입력란에 숫자로(마침표와 쉼표 모두 사용 가능,
            Enter로 적용), 또는 입력란 위에서 마우스를 끌어서 지정합니다.
            Shift를 누르면 더 세밀하게, Ctrl을 누르면 더 빠르게 바뀝니다. 범위를 벗어난 숫자는 가장 가까운 경계값으로 맞춰집니다.</p>
          <p>모든 변경 사항은 캔버스에 즉시 반영됩니다. 실행 취소는 Ctrl+Z이며, 전체 단축키는
            <a data-go="keys">단축키</a> 항목에 있습니다.</p>
          <p>그룹 옆의 <span class="help-i demo">?</span> 아이콘을 누르면 해당 도움말 항목이 열립니다.</p>
        </article>

        <article data-topic="tile" data-title="타일">
          <h2>타일</h2>
          <p>크기는 픽셀 단위이며 각 변마다 8~4096입니다. 64²…1024² 버튼은
            정사각형 크기를, ‘너비’와 ‘높이’는 각 변을 따로 지정합니다.</p>
          <p><b>크기와 관계없이 이음매는 항상 정확합니다</b>. 홀수 크기도 마찬가지입니다. 노이즈 패턴은
            타일 한 변에 정수 개의 셀이 들어가는 격자 위에 만들어지므로,
            타일의 왼쪽 가장자리는 오른쪽으로, 위쪽 가장자리는 아래쪽으로 자연스럽게 이어집니다.</p>
          <p>채널의 얼룩 크기는 픽셀 단위로 지정됩니다. 타일 크기를 바꾸면 셀 개수가
            다시 계산되고, 카드의 ‘셀 N개’ 표시도 자동으로 갱신됩니다.</p>
          <p>타일이 클수록 계산 시간이 길어집니다. 마지막 프레임의 계산 시간은 아래쪽
            상태 표시줄(‘렌더 … ms’)에 표시됩니다.</p>
        </article>

        <article data-topic="bg" data-title="배경">
          <h2>타일 배경</h2>
          <p>모든 채널 아래에 깔리는 단색입니다. 항목 제목 오른쪽에 HEX 값이 표시됩니다.
            편집기는 채널 색상과 같습니다. HSL·LCH 모드, HEX 입력란, 알파가 있으며,
            각 값의 의미는 <a data-go="color">색상</a> 항목에서 설명합니다.</p>
          <p><b>A</b>(알파)가 1보다 작으면 배경이 반투명해지고, PNG와 WebP도
            투명도를 포함해 저장됩니다. 이렇게 하면 타일을 다른 배경 위에 겹쳐 쓸 수 있습니다. 캔버스에서는
            투명한 부분을 통해 주변색이 보입니다(<a data-go="stage">캔버스</a>).</p>
        </article>

        <article data-topic="chans" data-title="채널">
          <h2>노이즈 채널</h2>
          <p>채널은 패턴 레이어 하나입니다. <b>목록의 첫 번째 채널은 배경 바로 위에 놓이고</b>,
            그다음 채널은 앞선 채널들 위에 차례로 쌓입니다. 마지막 채널이 맨 위에 있습니다.
            채널이 아래 레이어와 어떻게 합쳐지는지는 <a data-go="layer">레이어</a>에서 정합니다.</p>
          <h3>채널 카드</h3>
          <dl>
            <dt>미리보기</dt><dd>배경과 다른 채널 없이 채널만 단독으로 표시합니다.</dd>
            <dt>이름</dt><dd>제목에서 바로 편집할 수 있습니다.</dd>
            <dt>요약</dt><dd>유형 · 얼룩 크기 · 옥타브 수 · 혼합 모드와 불투명도.</dd>
            <dt>색상 띠</dt><dd>채널 색상의 그레이디언트.</dd>
            <dt>● / ○</dt><dd>채널 켜기 / 끄기(꺼진 채널은 그려지지 않지만 문서에는 남아 있습니다).</dd>
            <dt>↑ ↓</dt><dd>목록에서 위 / 아래로 이동합니다.</dd>
            <dt>⧉</dt><dd>새 무작위 시드로 채널을 복제합니다.</dd>
            <dt>✕</dt><dd>채널을 삭제합니다(Ctrl+Z로 되돌릴 수 있습니다).</dd>
            <dt>›</dt><dd>카드를 클릭하면 매개변수를 펼치거나 접습니다.</dd>
          </dl>
          <p>카드에 ‘옥타브를 제한했습니다’ 경고가 나타나면 일부 옥타브가 들어갈 자리가 없다는 뜻입니다.
            다음 옥타브의 셀이 2픽셀보다 작아지기 때문입니다(<a data-go="noise">노이즈</a>).</p>
          <h3>새 채널</h3>
          <p>목록 아래의 ‘+ …’ 버튼은 해당 유형의 채널을 목록 끝, 즉
            다른 채널들 위에 추가합니다. 버튼에는 그 유형의 패턴 미리보기가 표시됩니다.</p>
        </article>

        <article data-topic="noise" data-title="노이즈">
          <h2>노이즈 — 어떤 패턴인가</h2>
          <dl>
            <dt>유형</dt><dd>
              <b>Perlin</b> — 구름, 부드럽게 굽이치는 얼룩.
              <b>Value</b> — Perlin보다 부드럽고 ‘결’이 덜 드러납니다.
              <b>Worley</b> — 무작위 점을 중심으로 한 얼룩과 셀.
              <b>그레인</b> — 필름 입자처럼 서로 독립적인 점.</dd>
            <dt>얼룩 X, Y</dt><dd>패턴 셀 하나의 가로·세로 크기(픽셀). 값은
              <b>단계적으로</b> 바뀝니다. 타일 한 변에 셀이 정수 개 들어가야 이음매가 생기지 않으므로,
              크기는 항상 ‘변 길이 / 정수’입니다. 예를 들어
              256 타일에서는 128(셀 2개) 다음이 곧바로 85.3(셀 3개)입니다. 레이블 아래에
              현재 셀 개수가 표시됩니다. 최소 크기는 2 px, 최대 크기는 변 전체
              (셀 1개)입니다.</dd>
            <dt>그레인 X, Y</dt><dd>‘그레인’ 유형에서는 입자 하나의 크기이며 1 px부터 시작합니다. 마찬가지로 단계적으로 바뀝니다.</dd>
            <dt>X=Y 연결</dt><dd>Y 크기를 X 크기와 같게 맞춥니다.</dd>
            <dt>시드</dt><dd>무작위 패턴의 변형 번호입니다. 시드가 같으면 패턴도 같고,
              다르면 성질은 같지만 모양이 다른 패턴이 됩니다. 정수이며, ⟳는 새 무작위 시드를 만듭니다.</dd>
            <dt>옥타브</dt><dd>1–10. 점점 더 잘게 쪼개지는 패턴을 몇 겹 합칠지 정합니다.
              1이면 매끄러운 얼룩, 많을수록 미세한 디테일이 풍부해집니다. 2 px보다 작은 옥타브는
              버려지며, 이 경우 카드에 경고가 표시됩니다.</dd>
            <dt>감쇠</dt><dd>0–1(gain). 각 옥타브가 이전 옥타브보다 몇 배 약해지는지 정합니다.
              0.5면 절반입니다. 0에 가까우면 미세한 디테일이 거의 보이지 않고, 1에 가까우면
              미세한 디테일이 큰 얼룩만큼 강해집니다.</dd>
            <dt>간극도</dt><dd>2–4, 정수(lacunarity). 각 옥타브가 이전 옥타브보다 몇 배
              작아지는지 정합니다. 옥타브끼리도 이음매 없이 이어지도록 정수만 사용합니다.</dd>
            <dt>능선</dt><dd>Perlin과 Value: 구름 대신 주름과 산등성이 모양이 됩니다.</dd>
            <dt>모드</dt><dd>Worley. <b>F1</b> — 가장 가까운 점까지의 거리: 둥근 얼룩.
              <b>F2</b> — 두 번째로 가까운 점까지의 거리: 더 크고 각진 모양.
              <b>F2−F1</b> — 두 거리의 차이: 가는 셀 경계, 균열, 그물 모양.</dd>
            <dt>무작위성</dt><dd>Worley, 0–1. 점이 셀 중심에서 얼마나 벗어나는지 정합니다.
              0은 반듯한 격자, 1은 완전히 불규칙한 배치입니다.</dd>
            <dt>하이패스</dt><dd>그레인, 0–64 px. 0이면 화이트 노이즈입니다. 0보다 크면
              이 반경으로 흐리게 만든 사본을 그레인에서 뺍니다. 그러면 타일 반복을 눈에 띄게 하는
              큰 얼룩이 사라집니다(‘블루’ 그레인).</dd>
            <dt>왜곡</dt><dd>0–400 px. 두 번째의 큰 노이즈로 패턴을 밀어내어 선이
              물결치듯 ‘대리석’ 느낌이 됩니다. 값은 대략 픽셀 단위의 밀림 정도이며,
              0이면 왜곡이 없습니다.</dd>
            <dt>왜곡 크기</dt><dd>2–2048 px. 왜곡 물결의 크기입니다. 작으면 잔물결,
              크면 완만한 굴곡이 됩니다. 왜곡이 0보다 클 때 표시됩니다.</dd>
          </dl>
        </article>

        <article data-topic="shape" data-title="형태">
          <h2>형태 — 노이즈 값이 색으로 바뀌는 방식</h2>
          <p>각 지점의 노이즈는 0(약함)부터 1(강함)까지의 숫자입니다. 지점의 색은
            채널 그레이디언트에서 그 위치의 색을 가져옵니다(<a data-go="color">색상</a>). 형태는
            색을 입히기 전에 이 숫자를 다음 순서로 바꿉니다: 반전 → 대비 → 오프셋 → 감마.</p>
          <dl>
            <dt>대비</dt><dd>−1…1. 0이면 변화가 없습니다. 0보다 크면 중간값 주변의 분포가
              늘어나 얼룩이 선명해지고, 1이면 전환 없이 거의 두 가지 색만 남습니다.
              0보다 작으면 분포가 중간값 쪽으로 좁아집니다. −1이면 타일 전체가 하나의 중간
              색이 되며, −0.9 근처에서 이미 패턴이 거의 보이지 않습니다.</dd>
            <dt>오프셋</dt><dd>−0.5…0.5. 모든 값에 더해집니다. 0보다 크면 강한
              노이즈의 색이, 0보다 작으면 약한 노이즈의 색이 늘어납니다.</dd>
            <dt>감마</dt><dd>0.1–8, 1이면 변화가 없습니다. 1보다 크면 약한 노이즈의 색이
              우세해지고 강한 부분은 드문 얼룩으로 줄어듭니다. 1보다 작으면 그 반대입니다.</dd>
            <dt>반전</dt><dd>약한 부분과 강한 부분을 서로 바꿉니다.</dd>
            <dt>정규화</dt><dd>이 옵션이 꺼져 있으면 노이즈의 이론적 범위가 그레이디언트에 대응되지만,
              실제 범위는 보통 그보다 좁습니다. 특히 옥타브가 많을 때 그렇고, 그래서 양 끝
              핸들의 색에 도달하지 못합니다. 켜면 이 타일에서 실제로 나타난 노이즈 분포가
              그레이디언트 전체로 늘어납니다.</dd>
          </dl>
        </article>

        <article data-topic="color" data-title="색상">
          <h2>채널 색상</h2>
          <p>핸들이 두 개인 그레이디언트 띠입니다. <b>약함</b>은 노이즈가 0인 곳의 색,
            <b>강함</b>은 노이즈가 1인 곳의 색이며, 그 사이는 부드럽게 전환됩니다. 알파도
            한 핸들에서 다른 핸들로 함께 전환됩니다.</p>
          <ul>
            <li>핸들을 클릭하면 편집기가 열리고, 다시 클릭하면 닫힙니다.</li>
            <li>⇄ — 두 색을 서로 바꿉니다.</li>
            <li>두 색을 어떤 색 공간에서 혼합할지는 <a data-go="out">출력</a>에서 정합니다.</li>
          </ul>
          <h3>색상 편집기</h3>
          <p>작은 사각형은 현재 색, 입력란은 HEX(#RRGGBB, 직접 입력 가능)입니다.
            <b>HSL / LCH</b> 전환 버튼은 같은 색을 편집하는 두 가지 방식이며, 선택은 모든
            편집기에 공통으로 적용되고 기억됩니다. 각 슬라이더 아래의 스케일은 그 슬라이더만
            움직였을 때 색이 어떻게 바뀌는지 보여 줍니다. 그래서 다른 슬라이더를 움직이면
            스케일도 다시 그려집니다.</p>
          <h3>LCH (OKLCH)</h3>
          <dl>
            <dt>L</dt><dd>0–1, 지각 밝기입니다. 0은 검정, 1은 흰색입니다. L이 같으면
              색조와 관계없이 눈에 보이는 밝기가 같습니다. L = 0.5는 대략 회색 #636363이며,
              ‘화면 밝기의 절반’이 아닙니다.</dd>
            <dt>C</dt><dd>0–0.33, 채도(크로마)입니다. 같은 L의 회색과 색이 얼마나 다른지를 나타냅니다.
              절댓값이며 0은 회색, 0.03–0.05는 살짝 색이 도는 정도, 0.1 근처는
              뚜렷한 색, 0.15–0.25는 선명한 색, 0.32 근처는 sRGB 화면의 한계입니다.</dd>
            <dt>H</dt><dd>0–360°, 색조입니다. 기준값: 빨강 ≈ 29, 노랑 ≈ 110, 초록 ≈ 142,
              하늘색 ≈ 195, 파랑 ≈ 264, 자주 ≈ 328.</dd>
          </dl>
          <p><b>C 스케일의 어두운 끝부분</b>은 현재 L과 H에서 화면이 표현할 수 없는 채도입니다.
            이 경계는 고정되어 있지 않습니다. 노랑은 밝을 때만, 파랑은 어두울 때만
            채도가 높을 수 있고, 검정이나 흰색에 가까우면 채도가 아예 없습니다.
            설정한 C가 범위를 넘으면 경계까지 낮아지고 슬라이더가 밀려나며,
            슬라이더 아래에 그 사실이 표시됩니다. L이나 H를 되돌리면 설정한 C도 돌아옵니다.</p>
          <h3>HSL (OKHSL)</h3>
          <dl>
            <dt>H</dt><dd>0–360°, 색조입니다. LCH와 같은 각도입니다.</dd>
            <dt>S</dt><dd>0–1, 현재 L과 H에서 <b>가능한 최대치에 대한</b> 채도입니다.
              1이면 더 이상 채도를 높일 수 없습니다. 그래서 잘리는 값은 없지만, 색조가 다르면
              같은 S라도 눈에 보이는 색의 강도가 다릅니다.</dd>
            <dt>L</dt><dd>0–1, 밝기입니다. 0은 검정, 1은 흰색입니다.</dd>
          </dl>
          <p>색들이 눈에 똑같이 선명해 보여야 할 때는 LCH가, 제약 없이 자유롭게
            조절하고 싶을 때는 HSL이 편합니다. 파일에는 어느 쪽이든 OKHSL로 저장됩니다.</p>
          <h3>A</h3>
          <p>0–1, 색의 불투명도입니다. 0은 투명, 1은 불투명입니다.</p>
        </article>

        <article data-topic="layer" data-title="레이어">
          <h2>레이어 — 채널이 아래와 합쳐지는 방식</h2>
          <dl>
            <dt>혼합</dt><dd>채널 아래에 있는 모든 것(배경과 목록에서 위쪽에 있는 채널)과의 혼합 모드입니다.
              W3C 공식에 따라 선형광으로 계산합니다.
              <ul>
                <li><b>표준</b> — 채널이 불투명한 만큼 아래를 가립니다.</li>
                <li><b>곱하기</b> — 어둡게 합니다. 흰색은 아래를 바꾸지 않고, 검정은 검정이 됩니다.</li>
                <li><b>스크린</b> — 밝게 합니다. 검정은 아래를 바꾸지 않습니다.</li>
                <li><b>오버레이</b> — 아래의 대비를 높입니다. 어두운 곳은 더 어둡게, 밝은 곳은 더 밝게.</li>
                <li><b>하드 라이트</b> — 같은 효과지만 채널이 결정합니다. 채널의 어두운 곳은 어둡게, 밝은 곳은 밝게 합니다.</li>
                <li><b>소프트 라이트</b> — 하드 라이트의 부드러운 버전입니다.</li>
                <li><b>더하기</b> — 밝기를 더하므로 크게 밝아집니다.</li>
                <li><b>빼기</b> — 아래에서 채널을 빼므로 어두워집니다.</li>
                <li><b>어둡게 하기 / 밝게 하기</b> — 각 성분마다 둘 중
                  더 작은 값 / 더 큰 값이 남습니다.</li>
                <li><b>차이</b> — 차이의 절댓값입니다. 같은 색끼리는 검정이 됩니다.</li>
              </ul></dd>
            <dt>불투명도</dt><dd>0–1, 채널 전체의 불투명도입니다. 채널 색상의 알파에 추가로 적용됩니다.
              0이면 채널이 보이지 않고, 1이면 완전히 적용됩니다.</dd>
          </dl>
        </article>

        <article data-topic="out" data-title="출력">
          <h2>출력 — 계산 공통 설정</h2>
          <dl>
            <dt>혼합</dt><dd>각 채널의 두 색 사이 전환을 어떤 색 공간에서 계산할지 정합니다.
              <b>OKLab</b> — 눈에 고르게 보이며, 중간이 탁하거나 어두워지지 않습니다.
              <b>선형 sRGB</b> — 빛이 물리적으로 섞이는 방식입니다. 전환의 중간이
              OKLab보다 밝아 보입니다. 레이어 혼합 모드에는
              영향을 주지 않습니다. 혼합 모드는 항상 선형광으로 계산됩니다.</dd>
            <dt>디더링</dt><dd>채널당 8비트로 변환할 때 부드러운 그레이디언트에 생기는
              줄무늬(밴딩)를 없앱니다. <b>TPDF</b>는 눈에 띄지 않는 노이즈,
              <b>Bayer 8×8</b>은 규칙적인 패턴, <b>끔</b>은 디더링을 사용하지 않습니다. 순수한
              검정과 완전히 불투명한 알파는 그대로 유지됩니다.</dd>
            <dt>강도, LSB</dt><dd>0–4, 최하위 비트 단위의 디더링 강도입니다. 1은 채널 값 256단계 중
              한 단계입니다.</dd>
            <dt>품질</dt><dd>0–1, WEBP 내보내기에만 적용됩니다. 1.00은 무손실이며, 낮을수록
              파일은 작아지지만 압축 아티팩트가 생깁니다.</dd>
          </dl>
        </article>

        <article data-topic="stage" data-title="캔버스">
          <h2>캔버스 — 이음매를 눈으로 확인하기</h2>
          <p>캔버스 전체가 타일로 채워져 있습니다. 가운데의 타일 하나는
            모서리 표시로 구분됩니다.</p>
          <dl>
            <dt>배율</dt><dd>25–800%. 슬라이더, 캔버스 위에서 마우스 휠, 또는 Ctrl+= / Ctrl+−로 조절합니다.
              ‘1:1’, 캔버스 더블클릭 또는 Ctrl+0을 누르면 100%가 됩니다.</dd>
            <dt>주변색</dt><dd>타일로 채운 영역 둘레의 색입니다. 타일의 투명한 부분을 통해서도
              보입니다. 타일이 어두운 배경과 밝은 배경에서 어떻게 보이는지 판단하는 데 도움이 됩니다.</dd>
            <dt>경계</dt><dd>타일 가장자리를 따라 표시되는 가는 격자입니다.</dd>
            <dt>½ 이동</dt><dd>배치를 타일 절반만큼 이동합니다. 캔버스 중앙에 타일 네 개가
              만나는 모서리가 오므로, 이음매가 있다면 바로 여기서 보입니다.</dd>
            <dt>스무딩</dt><dd>확대할 때 픽셀을 부드럽게 보간합니다. 끄면 픽셀이 또렷하게
              보입니다.</dd>
            <dt>라이브러리</dt><dd>오른쪽 열을 표시하거나 숨깁니다(<a data-go="lib">라이브러리</a>).</dd>
          </dl>
          <p>아래쪽 상태 표시줄: 준비 상태, 타일 크기, 켜진 채널 수,
            마지막 프레임 계산 시간, 엔진이 사용하는 스레드 수.</p>
        </article>

        <article data-topic="lib" data-title="라이브러리">
          <h2>프리셋 라이브러리</h2>
          <p>라이브러리는 <code>*.json</code> 파일이 들어 있는 아무 폴더나 될 수 있습니다. 프로그램 폴더의
            <code>presets/</code>도 사용할 수 있습니다.</p>
          <dl>
            <dt>폴더…</dt><dd>폴더를 선택합니다. 선택한 폴더는 기억됩니다.</dd>
            <dt>↗</dt><dd>탐색기에서 폴더를 엽니다.</dd>
            <dt>↻</dt><dd>폴더를 다시 읽습니다(외부에서 파일을 변경한 경우).</dd>
            <dt>미리보기</dt><dd>클릭하면 프리셋을 열고 문서를 해당 파일에 연결합니다.
              ‘저장’을 누르면 그 파일에 바로 기록됩니다.</dd>
            <dt>미리보기의 ✕</dt><dd>확인 후 폴더에서 파일을 삭제합니다.</dd>
          </dl>
          <p>오류가 있는 파일은 조용히 사라지지 않습니다. 제목 아래에 원인과 함께 목록으로 표시되며,
            관련 없는 <code>*.json</code> 파일은 따로 나열됩니다.</p>
        </article>

        <article data-topic="files" data-title="파일 및 내보내기">
          <h2>파일 및 내보내기</h2>
          <p>상단 표시줄에는 프리셋 이름(편집 가능)이 있고, 그 옆에 문서가 연결된
            파일 이름과, 저장하지 않은 변경 사항이 있으면 점이 표시됩니다.</p>
          <dl>
            <dt>열기</dt><dd><code>*.json</code> 프리셋을 엽니다. 파일을 창에 끌어다 놓아도
              됩니다. 연 직후 Ctrl+Z를 누르면 이전 문서로 돌아갑니다.</dd>
            <dt>저장</dt><dd>연결된 파일에 기록합니다. 아직 파일이 없으면 저장 위치를 묻습니다.</dd>
            <dt>다른 이름…</dt><dd>새 파일로 저장합니다.</dd>
            <dt>CSS</dt><dd>CSS 블록을 클립보드에 복사합니다. 타일은 data-URI로,
              <code>background-repeat</code>와 함께 들어갑니다.</dd>
            <dt>WEBP</dt><dd>WebP로 내보냅니다. 품질은 <a data-go="out">출력</a> 항목에서 설정합니다.</dd>
            <dt>PNG</dt><dd>PNG로 내보냅니다. 무손실이며 알파를 포함합니다.</dd>
          </dl>
          <p>세션은 자동으로 저장되므로 다시 시작해도 같은 문서가 열립니다.</p>
        </article>

        <article data-topic="keys" data-title="단축키">
          <h2>단축키와 마우스</h2>
          <table>
            <tr><td>Ctrl+Z</td><td>실행 취소</td></tr>
            <tr><td>Ctrl+Y, Ctrl+Shift+Z</td><td>다시 실행</td></tr>
            <tr><td>Ctrl+S</td><td>저장</td></tr>
            <tr><td>Ctrl+Shift+S</td><td>다른 이름으로 저장…</td></tr>
            <tr><td>Ctrl+O</td><td>프리셋 열기(또는 *.json을 창에 끌어다 놓기)</td></tr>
            <tr><td>Ctrl+E</td><td>PNG 내보내기</td></tr>
            <tr><td>Ctrl+= / Ctrl+−</td><td>캔버스 배율</td></tr>
            <tr><td>Ctrl+0</td><td>배율 1:1</td></tr>
            <tr><td>캔버스 위에서 휠</td><td>배율</td></tr>
            <tr><td>캔버스 더블클릭</td><td>배율 1:1</td></tr>
            <tr><td>숫자 입력란 위에서 끌기</td><td>값 변경. Shift — 더 세밀하게, Ctrl — 더 빠르게</td></tr>
            <tr><td>F1</td><td>도움말</td></tr>
            <tr><td>Esc</td><td>도움말 닫기</td></tr>
          </table>
        </article>
`
});
