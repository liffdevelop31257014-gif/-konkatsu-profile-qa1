/* ============================================================
   婚活自己開示QA Part1 – app.js
   ============================================================ */

const LIFF_ID = "2010312230-lVV2FfLh"; // 
const DRAFT_KEY = "konkatsu_qa_draft";

/* ------------------------------------------------------------
   スライダー値を視覚表現に変換
   ------------------------------------------------------------ */
function sliderVisual(value, leftLabel, rightLabel, max = 5) {
  const v = parseInt(value, 10);
  const filled = "◉";
  const empty = "〇";
  const bar = filled.repeat(v) + empty.repeat(max - v);
  return `${leftLabel} ${bar} ${rightLabel}`;
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

  setText("q1",  data.q1);
  setText("q2",  data.q2);
  setText("q3",  data.q3);
  setText("q5",  data.q5);
  setText("q6",  data.q6);
  setText("q8",  data.q8);
  setText("q9",  data.q9);
  setText("q10", data.q10);
  setText("q11", data.q11);
  setText("q12", data.q12);
  setText("q13", data.q13);
  setText("q15", data.q15);

  // Q4 ラジオ
  if (data.q4) {
    const r = document.querySelector(`input[name="q4"][value="${data.q4}"]`);
    if (r) {
      r.checked = true;
      toggleDetail("q4Detail", data.q4 === "yes");
      setText("q4Detail", data.q4Detail);
    }
  }

  // Q7 ラジオ
  if (data.q7) {
    const r = document.querySelector(`input[name="q7"][value="${data.q7}"]`);
    if (r) {
      r.checked = true;
      toggleDetail("q7Detail", data.q7 === "yes");
      setText("q7Detail", data.q7Detail);
    }
  }

  // Q14 ラジオ
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

  if (!data.q1)                               errors.push("Q1: 朝起きる時間を入力してください。");
  if (!data.q2)                               errors.push("Q2: 夜寝る時間を入力してください。");
  if (!data.q3.trim())                        errors.push("Q3: 仕事終わりの過ごし方を入力してください。");
  if (!data.q4)                               errors.push("Q4: ニュース番組の有無を選択してください。");
  if (data.q4 === "yes" && !data.q4Detail.trim()) errors.push("Q4: 番組名を入力してください。");
  if (!data.q5.trim())                        errors.push("Q5: 子どもの頃好きだったテレビ番組を入力してください。");
  if (!data.q6.trim())                        errors.push("Q6: あだ名を入力してください。");
  if (!data.q7)                               errors.push("Q7: MBTI診断の有無を選択してください。");
  if (data.q7 === "yes" && !data.q7Detail.trim()) errors.push("Q7: MBTIタイプを入力してください。");
  if (!data.q10.trim())                       errors.push("Q10: 部活動・サークル活動を入力してください。");
  if (!data.q11.trim())                       errors.push("Q11: バイト経験を入力してください。");
  if (!data.q12.trim())                       errors.push("Q12: 休日の友人・家族との過ごし方を入力してください。");
  if (!data.q13.trim())                       errors.push("Q13: 1人での休日の過ごし方を入力してください。");
  if (!data.q14)                              errors.push("Q14: LINEの頻度を選択してください。");
  if (!data.q15.trim())                       errors.push("Q15: デートで行きたい場所を入力してください。");

  return errors;
}

/* ------------------------------------------------------------
   共有テキストの生成
   ------------------------------------------------------------ */
function buildShareText(data, shareName) {
  const name = shareName.trim() || "匿名";

  const q14Labels = {
    "a14-1": "返信まで6時間以内（朝LINEしたら昼までには返してほしい）",
    "a14-2": "返信まで12時間以内（朝LINEしたら夜までには返してほしい）",
    "a14-3": "返信まで24時間以内（朝LINEしたら翌朝までには返してほしい）",
    "a14-4": "返信まで3日以内",
    "a14-5": "相談事項には返信してほしいが雑談LINEには返信はあってもなくてもよい",
    "a14-6": "雑談LINEは自分は送らないが相手から送られる分には気にしない",
    "a14-7": "雑談LINEは送りたくないし送られるのも好きじゃない",
  };

  const lines = [
    `【婚活 自己開示QA Part1】`,
    `回答者：${name}`,
    ``,
    `Q1 朝起きる時間は何時ですか？`,
    `→ ${data.q1 || "未回答"}`,
    ``,
    `Q2 夜寝る時間は何時ですか？`,
    `→ ${data.q2 || "未回答"}`,
    ``,
    `Q3 仕事終わり、どんな過ごし方をしていますか？`,
    `→ ${data.q3 || "未回答"}`,
    ``,
    `Q4 平日の朝いつもつけているニュース/ワイドショー番組はありますか？`,
    `→ ${data.q4 === "yes" ? `あり（${data.q4Detail}）` : data.q4 === "no" ? "なし" : "未回答"}`,
    ``,
    `Q5 子どもの頃好きだったテレビ番組は何ですか？`,
    `→ ${data.q5 || "未回答"}`,
    ``,
    `Q6 これまでに呼ばれたことのあるあだ名は何ですか？`,
    `→ ${data.q6 || "未回答"}`,
    ``,
    `Q7 MBTI診断したことはありますか？`,
    `→ ${data.q7 === "yes" ? `あり（${data.q7Detail}）` : data.q7 === "no" ? "なし" : "未回答"}`,
    ``,
    `Q8 ポジティブですか？ネガティブですか？`,
    `→ ${sliderVisual(data.q8 || 3, "ネガティブ", "ポジティブ")}`,
    ``,
    `Q9 周囲の感情などを察する方ですか？`,
    `→ ${sliderVisual(data.q9 || 3, "察さない", "察する")}`,
    ``,
    `Q10 部活動、サークル活動は何をしていましたか？`,
    `→ ${data.q10 || "未回答"}`,
    ``,
    `Q11 どんなバイトをしたことがありますか？`,
    `→ ${data.q11 || "未回答"}`,
    ``,
    `Q12 休みの日に友人や家族と会うことはありますか？`,
    `→ ${data.q12 || "未回答"}`,
    ``,
    `Q13 1人で過ごす時の休みの日の過ごし方を教えてください。`,
    `→ ${data.q13 || "未回答"}`,
    ``,
    `Q14 LINEの頻度はどれくらいが理想ですか？`,
    `→ ${q14Labels[data.q14] || "未回答"}`,
    ``,
    `Q15 今後デートで行きたいところはありますか？`,
    `→ ${data.q15 || "未回答"}`,
  ];

  return lines.join("\n");
}

/* ------------------------------------------------------------
   メイン処理
   ------------------------------------------------------------ */
(async () => {
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

  /* ----- Q4 ラジオ：詳細テキストエリアの表示制御 ----- */
  document.querySelectorAll('input[name="q4"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      toggleDetail("q4Detail", radio.value === "yes");
    });
  });

  /* ----- Q7 ラジオ：詳細テキストエリアの表示制御 ----- */
  document.querySelectorAll('input[name="q7"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      toggleDetail("q7Detail", radio.value === "yes");
    });
  });

  /* 初期状態で詳細エリアを非表示 */
  const q4Checked = document.querySelector('input[name="q4"]:checked');
  toggleDetail("q4Detail", q4Checked ? q4Checked.value === "yes" : false);
  const q7Checked = document.querySelector('input[name="q7"]:checked');
  toggleDetail("q7Detail", q7Checked ? q7Checked.value === "yes" : false);

  /* ----- 下書き保存ボタン ----- */
  document.getElementById("draftBtn").addEventListener("click", () => {
    const data = collectFormData();
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      alert("下書きを保存しました。");
    } catch (_) {
      alert("下書きの保存に失敗しました。");
    }
  });

  /* ----- フォームクリアボタン ----- */
  document.getElementById("clearBtn").addEventListener("click", () => {
    if (!confirm("入力内容をすべてクリアしますか？")) return;

    ["q1","q2","q3","q4Detail","q5","q6","q7Detail","q10","q11","q12","q13","q15"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    document.querySelectorAll('input[type="radio"]').forEach((r) => (r.checked = false));

    document.getElementById("q8").value = 3;
    document.getElementById("q9").value = 3;

    toggleDetail("q4Detail", false);
    toggleDetail("q7Detail", false);

    try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
  });

  /* ----- 送信ボタン ----- */
  document.getElementById("submitBtn").addEventListener("click", () => {
    const data = collectFormData();
    const errors = validate(data);

    if (errors.length > 0) {
      alert("以下の項目を入力してください。\n\n" + errors.join("\n"));
      return;
    }

    // localStorage から下書き削除
    try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}

    // 共有モーダル表示
    const modal = document.getElementById("shareModal");
    modal.classList.remove("hidden");
    modal.classList.add("show");

    // 送信ボタンを無効化（二重送信防止）
    document.getElementById("submitBtn").disabled = true;
  });

  /* ----- 共有ボタン ----- */
  document.getElementById("shareBtn").addEventListener("click", async () => {
    const shareName = document.getElementById("shareName").value;
    const data = collectFormData();
    const text = buildShareText(data, shareName);

    // モーダルを閉じる
    const modal = document.getElementById("shareModal");
    modal.classList.remove("show");
    modal.classList.add("hidden");

    if (liff.isApiAvailable("shareTargetPicker")) {
      try {
        await liff.shareTargetPicker([{ type: "text", text }]);
      } catch (e) {
        console.error("shareTargetPicker失敗", e);
        try {
          await navigator.clipboard.writeText(text);
          alert("共有テキストをクリップボードにコピーしました。");
        } catch (_) {
          alert("共有に失敗しました。");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("回答テキストをクリップボードにコピーしました。\nLINEなどに貼り付けて共有してください。");
      } catch (_) {
        alert("お使いの環境では共有機能が利用できません。");
      }
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
