const GAS_URL = "https://script.google.com/macros/s/AKfycbyFK5ER57hFtc7Zk1sndvkktbv-RsOrd0fw8Qf1IcJMcOacxnkPYga6eBrdzzqMZ0eK/exec";
const LIFF_ID = "2010312230-lVV2FfLh";

let userHash = "";

/********************************
 * 初期化
 ********************************/
window.addEventListener("DOMContentLoaded", async () => {

  await liff.init({ liffId: LIFF_ID });

  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }

  const profile = await liff.getProfile();
  userHash = await sha256(profile.userId);

  setupEvents();
});

/********************************
 * SHA256
 ********************************/
async function sha256(text) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );

  return [...new Uint8Array(buf)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/********************************
 * GAS通信
 ********************************/
async function post(payload) {
  return fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(r => r.json());
}

/********************************
 * データ取得（安全版）
 ********************************/
function collect() {
  return {
    wakeUp: document.getElementById("q1").value,
    sleep: document.getElementById("q2").value,
    afterWork: document.getElementById("q3").value,
    morningNews: document.getElementById("q4").value,
    childhoodTv: document.getElementById("q5").value,
    nickname: document.getElementById("q6").value,

    mbtiStatus: document.querySelector('input[name="q7"]:checked')?.value || "",
    mbtiType: document.getElementById("q7Detail").value,

    positive: document.getElementById("q8").value,
    empathy: document.getElementById("q9").value,

    club: document.getElementById("q10").value,
    partTimeJob: document.getElementById("q11").value,

    holidayWithFriends: document.getElementById("q12").value,
    holidayAlone: document.getElementById("q13").value,

    lineFrequency: document.getElementById("q14").value,
    datePlace: document.getElementById("q15").value
  };
}

/********************************
 * イベント設定
 ********************************/
function setupEvents() {

  const page1 = document.getElementById("page1");
  const page2 = document.getElementById("page2");

  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");

  const submitBtn = document.getElementById("submitBtn");
  const saveDraftBtn = document.getElementById("saveDraftBtn");

  const shareBtn = document.getElementById("shareBtn");

  /***************
   * 次へ（ここが今回の問題点）
   ***************/
  nextBtn.addEventListener("click", () => {
    page1.classList.add("hidden");
    page2.classList.remove("hidden");
  });

  backBtn.addEventListener("click", () => {
    page2.classList.add("hidden");
    page1.classList.remove("hidden");
  });

  /***************
   * 送信
   ***************/
  submitBtn.addEventListener("click", async () => {

    const res = await post({
      action: "submit",
      userHash,
      data: collect(),
      consent: document.getElementById("consent").checked
    });

    if (res.success) {
      showModal();
    }
  });

  /***************
   * 下書き
   ***************/
  saveDraftBtn.addEventListener("click", async () => {

    await post({
      action: "saveDraft",
      userHash,
      data: collect(),
      consent: document.getElementById("consent").checked
    });

    alert("保存しました");
  });

  /***************
   * 共有
   ***************/
  shareBtn.addEventListener("click", () => {

    const name = document.getElementById("shareName").value || "匿名";
    const text = buildShareText(name, collect());

    liff.shareTargetPicker([{ type: "text", text }]);

    hideModal();
  });
}

/********************************
 * モーダル制御
 ********************************/
function showModal() {
  document.getElementById("shareModal").style.display = "flex";
}

function hideModal() {
  document.getElementById("shareModal").style.display = "none";
}

/********************************
 * 共有テキスト
 ********************************/
function buildShareText(name, d) {
  return `
【婚活プロフィール】
共有者: ${name}

Q1 ${d.wakeUp}
Q2 ${d.sleep}
Q3 ${d.afterWork}
Q4 ${d.morningNews}
Q5 ${d.childhoodTv}
Q6 ${d.nickname}

Q7 ${d.mbtiStatus} ${d.mbtiType}
Q8 ${d.positive}
Q9 ${d.empathy}
Q10 ${d.club}
Q11 ${d.partTimeJob}
Q12 ${d.holidayWithFriends}
Q13 ${d.holidayAlone}
Q14 ${d.lineFrequency}
Q15 ${d.datePlace}
`.trim();
}
