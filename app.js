/* ============================================================
   婚活自己開示QA Part1 – app.js
   ============================================================ */

const LIFF_ID   = "2010312230-lVV2FfLh";
const DRAFT_KEY = "konkatsu_qa_draft";

/* ------------------------------------------------------------
   URLセーフ Base64 エンコード／デコード
   = を除去し + → - / → _ に変換することでURLが途中で切れるのを防ぐ
   ------------------------------------------------------------ */
function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str) {
  // パディングを復元
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad    = padded.length % 4;
  const fixed  = pad ? padded + "=".repeat(4 - pad) : padded;
  return decodeURIComponent(escape(atob(fixed)));
}

/* ------------------------------------------------------------
   スライダー値をビジュアル（SVG）に変換
   1〜5 の位置に応じて●を目盛り線上に配置する
   ------------------------------------------------------------ */
function sliderVisualHTML(value, leftLabel, rightLabel, max = 5) {
  const v = Math.min(Math.max(parseInt(value, 10) || 1, 1), max);

  const width   = 320;
  const padding = 12;
  const usable  = width - padding * 2;
  const step    = usable / (max - 1);
  const cx      = padding + step * (v - 1);
  const y       = 20;

  let ticks = "";
  for (let i = 0; i < max; i++) {
    const x = padding + step * i;
    ticks += `<line x1="${x}" y1="${y - 8}" x2="${x}" y2="${y + 8}" stroke="#f48ca0" stroke-width="2"/>`;
  }

  return `
    <div class="slider-visual">
      <div class="slider-visual-labels">
        <span>${leftLabel}</span>
        <span>${rightLabel}</span>
      </div>
      <svg viewBox="0 0 ${width} 40" xmlns="http://www.w3.org/2000/svg" class="slider-visual-svg">
        <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="#f48ca0" stroke-width="2"/>
        ${ticks}
        <circle cx="${cx}" cy="${y}" r="9" fill="#222"/>
      </svg>
    </div>
  `;
}

/* ------------------------------------------------------------
   フォーム値の収集
   ------------------------------------------------------------ */
function collectFormData() {
  const q4Radio  = document.querySelector('input[name="q4"]:checked');
  const q7Radio  = document.querySelector('input[name="q7"]:checked');
  const q14Radio = document.querySelector('input[name="q14"]:checked');

  return {
    q1:       document.getElementById("q1").value,
    q2:       document.getElementById("q2").value,
    q3:       document.getElementById("q3").value,
    q4:       q4Radio  ? q4Radio.value  : "",
    q4Detail: document.getElementById("q4Detail").value,
    q5:       document.getElementById("q5").value,
    q6:       document.getElementById("q6").value,
    q7:       q7Radio  ? q7Radio.value  : "",
    q7Detail: document.getElementById("q7Detail").value,
    q8:       document.getElementById("q8").value,
    q9:       document.getElementById("q9").value,
    q10:      document.getElementById("q10").value,
    q11:      document.getElementById("q11").value,
    q12:      document.getElementById("q12").value,
    q13:      document.getElementById("q13").value,
    q14:      q14Radio ? q14Radio.value : "",
    q15:      document.getElementById("q15").value,
  };
}

/* ------------------------------------------------------------
   フォームへの値の復元
   ------------------------------------------------------------ */
function restoreFormData(data) {
  if (!data) return;

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  ["q1","q2","q3","q5","q6","q8","q9","q10","q11","q12","q13","q15"]
    .forEach(id => setText(id, data[id]));

  if (data.q4) {
    const r = document.querySelector(`input[name="q4"][value="${data.q4}"]`);
    if (r) { r.checked = true; toggleDetail("q4Detail", data.q4 === "yes"); setText("q4Detail", data.q4Detail); }
  }
  if (data.q7) {
    const r = document.querySelector(`input[name="q7"][value="${data.q7}"]`);
    if (r) { r.checked = true; toggleDetail("q7Detail", data.q7 === "yes"); setText("q7Detail", data.q7Detail); }
  }
  if (data.q14) {
    const r = document.querySelector(`input[name="q14"][value="${data.q14}"]`);
    if (r) r.checked = true;
  }
}

/* ------------------------------------------------------------
   詳細テキストエリアの表示/非表示
   ------------------------------------------------------------ */
function toggleDetail(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = show ? "block" : "none";
  if (!show) el.value = "";
}

/* ------------------------------------------------------------
   バリデーション（本送信時のみ）
   ------------------------------------------------------------ */
function validate(data) {
  const errors = [];
  if (!data.q1)                                   errors.push("Q1: 朝起きる時間を入力してください。");
  if (!data.q2)                                   errors.push("Q2: 夜寝る時間を入力してください。");
  if (!data.q3.trim())                            errors.push("Q3: 仕事終わりの過ごし方を入力してください。");
  if (!data.q4)                                   errors.push("Q4: ニュース番組の有無を選択してください。");
  if (data.q4 === "yes" && !data.q4Detail.trim()) errors.push("Q4: 番組名を入力してください。");
  if (!data.q5.trim())                            errors.push("Q5: 子どもの頃好きだったテレビ番組を入力してください。");
  if (!data.q6.trim())                            errors.push("Q6: あだ名を入力してください。");
  if (!data.q7)                                   errors.push("Q7: MBTI診断の有無を選択してください。");
  if (data.q7 === "yes" && !data.q7Detail.trim()) errors.push("Q7: MBTIタイプを入力してください。");
  if (!data.q10.trim())                           errors.push("Q10: 部活動・サークル活動を入力してください。");
  if (!data.q11.trim())                           errors.push("Q11: バイト経験を入力してください。");
  if (!data.q12.trim())                           errors.push("Q12: 休日の友人・家族との過ごし方を入力してください。");
  if (!data.q13.trim())                           errors.push("Q13: 1人での休日の過ごし方を入力してください。");
  if (!data.q14)                                  errors.push("Q14: LINEの頻度を選択してください。");
  if (!data.q15.trim())                           errors.push("Q15: デートで行きたい場所を入力してください。");
  return errors;
}

/* ------------------------------------------------------------
   回答データ → 共有URL（URLセーフBase64）
   ------------------------------------------------------------ */
function encodeDataToURL(data) {
  const encoded = base64UrlEncode(JSON.stringify(data));
  const base    = location.href.split("?")[0].split("#")[0];
  return `${base}?share=${encoded}`;
}

/* ------------------------------------------------------------
   URL → 回答データ（ビューモード）
   ------------------------------------------------------------ */
function decodeDataFromURL() {
  const params = new URLSearchParams(location.search);
  const raw    = params.get("share");
  if (!raw) return null;
  try {
    return JSON.parse(base64UrlDecode(raw));
  } catch (e) {
    console.error("URL decode error", e);
    return null;
  }
}

/* ------------------------------------------------------------
   ビューモード：回答をカード表示
   ------------------------------------------------------------ */
function renderViewMode(data) {
  const q14Labels = {
    "a14-1": "返信まで6時間以内（朝LINEしたら昼までには返してほしい）",
    "a14-2": "返信まで12時間以内（朝LINEしたら夜までには返してほしい）",
    "a14-3": "返信まで24時間以内（朝LINEしたら翌朝までには返してほしい）",
    "a14-4": "返信まで3日以内",
    "a14-5": "相談事項には返信してほしいが雑談LINEには返信はあってもなくてもよい",
    "a14-6": "雑談LINEは自分は送らないが相手から送られる分には気にしない",
    "a14-7": "雑談LINEは送りたくないし送られるのも好きじゃない",
  };

  const rows = [
    { q: "Q1 朝起きる時間は何時ですか？",                          a: data.q1  || "未回答" },
    { q: "Q2 夜寝る時間は何時ですか？",                            a: data.q2  || "未回答" },
    { q: "Q3 仕事終わり、どんな過ごし方をしていますか？",              a: data.q3  || "未回答" },
    { q: "Q4 平日の朝いつもつけているニュース/ワイドショー番組はありますか？",
       a: data.q4 === "yes" ? `あり（${data.q4Detail}）` : data.q4 === "no" ? "なし" : "未回答" },
    { q: "Q5 子どもの頃好きだったテレビ番組は何ですか？",              a: data.q5  || "未回答" },
    { q: "Q6 これまでに呼ばれたことのあるあだ名は何ですか？",           a: data.q6  || "未回答" },
    { q: "Q7 MBTI診断したことはありますか？",
       a: data.q7 === "yes" ? `あり（${data.q7Detail}）` : data.q7 === "no" ? "なし" : "未回答" },
    { q: "Q8 ポジティブですか？ネガティブですか？",
       slider: sliderVisualHTML(data.q8 || 3, "ネガティブ", "ポジティブ") },
    { q: "Q9 周囲の感情などを察する方ですか？",
       slider: sliderVisualHTML(data.q9 || 3, "察さない", "察する") },
    { q: "Q10 部活動、サークル活動は何をしていましたか？",             a: data.q10 || "未回答" },
    { q: "Q11 どんなバイトをしたことがありますか？",                  a: data.q11 || "未回答" },
    { q: "Q12 休みの日に友人や家族と会うことはありますか？",            a: data.q12 || "未回答" },
    { q: "Q13 1人で過ごす時の休みの日の過ごし方を教えてください。",      a: data.q13 || "未回答" },
    { q: "Q14 LINEの頻度はどれくらいが理想ですか？",
       a: q14Labels[data.q14] || "未回答" },
    { q: "Q15 今後デートで行きたいところはありますか？",              a: data.q15 || "未回答" },
  ];

  // フォーム要素を非表示
  document.querySelectorAll(
    ".container > label, .container > input, .container > textarea, " +
    ".container > div.slider-labels, .container > div.button-group, " +
    ".container > div#shareModal"
  ).forEach(el => (el.style.display = "none"));

  const container = document.getElementById("viewMode");
  container.style.display = "block";
  container.innerHTML = `
    <div class="view-header">
      <p class="view-label">回答内容</p>
      ${data._shareName ? `<p class="view-name">${escapeHTML(data._shareName)} さんの回答</p>` : ""}
    </div>
    ${rows.map(({ q, a, slider }) => `
      <div class="view-item">
        <p class="view-question">${escapeHTML(q)}</p>
        ${slider ? slider : `<p class="view-answer">${escapeHTML(a).replace(/\n/g, "<br>")}</p>`}
      </div>
    `).join("")}
  `;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ------------------------------------------------------------
   メイン処理
   ------------------------------------------------------------ */
(async () => {

  /* ----- ビューモード判定（LIFFログイン不要） ----- */
  const sharedData = decodeDataFromURL();
  if (sharedData) {
    renderViewMode(sharedData);
    return;
  }

  /* ----- LIFF 初期化 ----- */
  try {
    await liff.init({ liffId: LIFF_ID });
  } catch (e) {
    console.error("LIFF init failed", e);
    alert("LIFFの初期化に失敗しました。");
    return;
  }

  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }

  /* ----- localStorage から下書き復元 ----- */
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) restoreFormData(JSON.parse(saved));
  } catch (_) {}

  /* ----- Q4 / Q7 ラジオ：詳細テキストエリアの表示制御 ----- */
  document.querySelectorAll('input[name="q4"]').forEach(r =>
    r.addEventListener("change", () => toggleDetail("q4Detail", r.value === "yes"))
  );
  document.querySelectorAll('input[name="q7"]').forEach(r =>
    r.addEventListener("change", () => toggleDetail("q7Detail", r.value === "yes"))
  );

  const q4c = document.querySelector('input[name="q4"]:checked');
  toggleDetail("q4Detail", q4c ? q4c.value === "yes" : false);
  const q7c = document.querySelector('input[name="q7"]:checked');
  toggleDetail("q7Detail", q7c ? q7c.value === "yes" : false);

  /* ----- 下書き保存 ----- */
  document.getElementById("draftBtn").addEventListener("click", () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(collectFormData()));
      alert("下書きを保存しました。");
    } catch (_) {
      alert("下書きの保存に失敗しました。");
    }
  });

  /* ----- フォームクリア ----- */
  document.getElementById("clearBtn").addEventListener("click", () => {
    if (!confirm("入力内容をすべてクリアしますか？")) return;
    ["q1","q2","q3","q4Detail","q5","q6","q7Detail","q10","q11","q12","q13","q15"]
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
    document.querySelectorAll('input[type="radio"]').forEach(r => (r.checked = false));
    document.getElementById("q8").value = 3;
    document.getElementById("q9").value = 3;
    toggleDetail("q4Detail", false);
    toggleDetail("q7Detail", false);
    try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
  });

  /* ----- 送信ボタン ----- */
  document.getElementById("submitBtn").addEventListener("click", () => {
    const data   = collectFormData();
    const errors = validate(data);
    if (errors.length > 0) {
      alert("以下の項目を入力してください。\n\n" + errors.join("\n"));
      return;
    }
    // 前回の回答として保存（次回編集時に復元できるようにする）
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (_) {}

    const modal = document.getElementById("shareModal");
    modal.classList.remove("hidden");
    modal.classList.add("show");
    document.getElementById("submitBtn").disabled = true;
  });

  /* ----- 共有ボタン ----- */
  document.getElementById("shareBtn").addEventListener("click", () => {
    const shareName = document.getElementById("shareName").value.trim();
    const data      = collectFormData();
    data._shareName = shareName;

    const shareURL   = encodeDataToURL(data);
    const previewMsg = shareName
      ? `${shareName}さんの婚活　自己開示QA part1の回答が届きました。\n回答をみる→${shareURL}`
      : `婚活　自己開示QA part1の回答が届きました。\n回答をみる→${shareURL}`;

    // モーダルを閉じる
    const modal = document.getElementById("shareModal");
    modal.classList.remove("show");
    modal.classList.add("hidden");

    // LINEの「送信先を選択」画面を開くURLスキーム
    const lineShareURL = `https://line.me/R/msg/text/?${encodeURIComponent(previewMsg)}`;

    if (liff.isInClient()) {
      // LINEアプリ内：直接遷移させることでSafariを経由させない
      window.location.href = lineShareURL;
    } else {
      // LINEアプリ外（PCブラウザ等）：新しいタブで開く
      window.open(lineShareURL, "_blank");
    }
  });

  /* ----- モーダル外クリックで閉じる ----- */
  document.getElementById("shareModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
      e.currentTarget.classList.remove("show");
      e.currentTarget.classList.add("hidden");
    }
  });

})();
