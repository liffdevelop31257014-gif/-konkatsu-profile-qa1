const LIFF_ID = "2010312230-lVV2FfLh";

let userHash = "";

/* 初期化 */
window.addEventListener("DOMContentLoaded", async () => {

  await liff.init({ liffId: LIFF_ID });

  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }

  const profile = await liff.getProfile();
  userHash = await sha256(profile.userId);

  setupUI();
});

/* SHA256 */
async function sha256(text) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );

  return [...new Uint8Array(buf)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/* DOM取得ヘルパー */
const $ = (id) => document.getElementById(id);

/* データ収集 */
function collectData() {

  return {
    q1: $("q1").value,
    q2: $("q2").value,
    q3: $("q3").value,

    q4: document.querySelector('input[name="q4"]:checked')?.value || "",
    q4Detail: $("q4Detail").value,

    q5: $("q5").value,
    q6: $("q6").value,

    q7: document.querySelector('input[name="q7"]:checked')?.value || "",
    q7Detail: $("q7Detail").value,

    q8: $("q8").value,
    q9: $("q9").value,

    q10: $("q10").value,
    q11: $("q11").value,
    q12: $("q12").value,
    q13: $("q13").value,

    q14: document.querySelector('input[name="q14"]:checked')?.value || "",
    q15: $("q15").value
  };
}

/* UI設定 */
function setupUI() {

  /* Q4制御 */
  setupRadioDetail("q4", "q4Detail");

  /* Q7制御 */
  setupRadioDetail("q7", "q7Detail");

  /* 送信 */
  $("submitBtn").onclick = () => {

    if (!liff.isInClient()) {
      alert("LINEアプリ内で開いてください");
      return;
    }

    const text = buildText(collectData());

    liff.shareTargetPicker([
      { type: "text", text }
    ]);
  };

  /* モーダル */
  $("shareBtn").onclick = () => {

    const name = $("shareName").value || "匿名";
    const text = buildText(collectData(), name);

    liff.shareTargetPicker([
      { type: "text", text }
    ]);

    hideModal();
  };
}

/* ラジオ＋詳細入力制御 */
function setupRadioDetail(name, detailId) {

  const radios = document.querySelectorAll(`input[name="${name}"]`);
  const detail = $(detailId);

  function update() {
    const val = document.querySelector(`input[name="${name}"]:checked`)?.value;

    if (val === "yes") {
      detail.style.display = "block";
      detail.disabled = false;
    } else {
      detail.style.display = "none";
      detail.value = "";
      detail.disabled = true;
    }
  }

  radios.forEach(r => r.addEventListener("change", update));
  update();
}

/* 共有文生成 */
function buildText(d, name = "匿名") {

  return `
【婚活プロフィール】

共有者：${name}

Q1 ${d.q1}
Q2 ${d.q2}
Q3 ${d.q3}

Q4 ${d.q4} ${d.q4Detail}

Q5 ${d.q5}
Q6 ${d.q6}

Q7 ${d.q7} ${d.q7Detail}

Q8 ${d.q8}
Q9 ${d.q9}

Q10 ${d.q10}
Q11 ${d.q11}

Q12 ${d.q12}
Q13 ${d.q13}

Q14 ${d.q14}
Q15 ${d.q15}
`.trim();
}

/* モーダル制御（未使用でも壊れないように残置） */
function showModal() {
  const el = $("shareModal");
  if (el) el.style.display = "flex";
}

function hideModal() {
  const el = $("shareModal");
  if (el) el.style.display = "none";
}
