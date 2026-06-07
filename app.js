/********************************
 * 設定
 ********************************/
const GAS_URL = "https://script.google.com/macros/s/AKfycbyFK5ER57hFtc7Zk1sndvkktbv-RsOrd0fw8Qf1IcJMcOacxnkPYga6eBrdzzqMZ0eK/exec";
const LIFF_ID = "2010312230-lVV2FfLh";

let userHash = "";
let isSubmitting = false;

/********************************
 * 初期化
 ********************************/
window.onload = async () => {
  await liff.init({ liffId: LIFF_ID });

  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }

  const profile = await liff.getProfile();
  userHash = await sha256(profile.userId);

  await loadFromServer();
  restoreLocal();
  setupEvents();

  forceHideModal(); // ★重要：初期強制非表示
};

/********************************
 * SHA-256
 ********************************/
async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/********************************
 * GAS通信
 ********************************/
async function postToGAS(payload) {
  return fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(r => r.json());
}

/********************************
 * サーバー復元
 ********************************/
async function loadFromServer() {
  const url = `${GAS_URL}?action=getProfile&userHash=${userHash}`;
  const res = await fetch(url).then(r => r.json());

  if (!res.found) return;

  const data = res.data;

  Object.keys(data).forEach(k => {
    const el = document.getElementById(k);
    if (!el) return;

    el.value = data[k] || "";
  });

  if (data.mbtiStatus === "yes") {
    document.getElementById("q7Detail").style.display = "block";
  }
}

/********************************
 * localStorage
 ********************************/
function saveLocal() {
  localStorage.setItem("formData", JSON.stringify(collectData()));
}

function restoreLocal() {
  const raw = localStorage.getItem("formData");
  if (!raw) return;

  const data = JSON.parse(raw);

  Object.keys(data).forEach(k => {
    const el = document.getElementById(k);
    if (el) el.value = data[k];
  });
}

/********************************
 * データ収集
 ********************************/
function collectData() {
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
 * バリデーション（本送信のみ）
 ********************************/
function validateSubmit(data) {

  const required = [
    "wakeUp",
    "sleep",
    "afterWork",
    "morningNews",
    "q5",
    "q6",
    "mbtiStatus",
    "positive",
    "empathy",
    "club",
    "partTimeJob",
    "holidayWithFriends",
    "holidayAlone",
    "lineFrequency",
    "datePlace"
  ];

  for (const k of required) {
    if (!data[k] || String(data[k]).trim() === "") {
      throw new Error(`未入力: ${k}`);
    }
  }

  if (data.mbtiStatus === "yes" && !data.mbtiType) {
    throw new Error("MBTI未入力");
  }
}

/********************************
 * UI制御（モーダル強制安全化）
 ********************************/
function forceHideModal() {
  const modal = document.getElementById("shareModal");
  modal.classList.add("hidden");
  modal.style.display = "none";
}

function showShareModal() {
  const modal = document.getElementById("shareModal");
  modal.style.display = "flex";
  modal.classList.remove("hidden");
}

/********************************
 * イベント
 ********************************/
function setupEvents() {

  // Q7
  document.querySelectorAll('input[name="q7"]').forEach(r => {
    r.addEventListener("change", () => {
      const detail = document.getElementById("q7Detail");

      if (r.value === "yes") {
        detail.style.display = "block";
      } else {
        detail.style.display = "none";
        detail.value = "";
      }

      saveLocal();
    });
  });

  // Page遷移
  document.getElementById("nextBtn").onclick = () => {
    document.getElementById("page1").classList.add("hidden");
    document.getElementById("page2").classList.remove("hidden");
  };

  document.getElementById("backBtn").onclick = () => {
    document.getElementById("page2").classList.add("hidden");
    document.getElementById("page1").classList.remove("hidden");
  };

  // 下書き
  document.getElementById("saveDraftBtn").onclick = async () => {
    const payload = {
      action: "saveDraft",
      userHash,
      data: collectData(),
      consent: document.getElementById("consent").checked
    };

    await postToGAS(payload);
    alert("下書き保存しました");
  };

  // 本送信
  document.getElementById("submitBtn").onclick = async () => {

    if (isSubmitting) return;
    isSubmitting = true;

    try {
      if (!document.getElementById("consent").checked) {
        alert("同意が必要です");
        return;
      }

      const data = collectData();
      validateSubmit(data);

      showLoading(true);

      const payload = {
        action: "submit",
        userHash,
        data,
        consent: true
      };

      const res = await postToGAS(payload);

      showLoading(false);

      if (!res.success) {
        alert("送信失敗");
        return;
      }

      alert("送信完了");

      showShareModal();

    } catch (e) {
      alert(e.message);
    } finally {
      isSubmitting = false;
      showLoading(false);
    }
  };

  // クリア
  document.getElementById("clearBtn").onclick = () => {
    document.querySelectorAll("input, textarea").forEach(el => {
      if (el.type === "radio") el.checked = false;
      else el.value = "";
    });

    localStorage.removeItem("formData");
    forceHideModal();
    alert("クリアしました");
  };

  // 共有
  document.getElementById("shareBtn").onclick = () => {

    const name =
      document.getElementById("shareName").value || "匿名";

    const text = buildShareText(name, collectData());

    liff.shareTargetPicker([{ type: "text", text }]);

    forceHideModal();
  };

  document.getElementById("closeModalBtn").onclick = () => {
    forceHideModal();
  };

  // 自動保存
  document.querySelectorAll("input, textarea, select").forEach(el => {
    el.addEventListener("input", saveLocal);
    el.addEventListener("change", saveLocal);
  });
}

/********************************
 * ローディング
 ********************************/
function showLoading(flag) {
  const btn = document.getElementById("submitBtn");
  btn.disabled = flag;
  btn.textContent = flag ? "送信中..." : "回答送信";
}

/********************************
 * 共有文
 ********************************/
function buildShareText(name, data) {
  return `
【婚活プロフィール】
共有者: ${name}

Q1 ${data.wakeUp}
Q2 ${data.sleep}
Q3 ${data.afterWork}
Q4 ${data.morningNews}
Q5 ${data.childhoodTv}
Q6 ${data.nickname}

Q7 ${data.mbtiStatus} ${data.mbtiType}

Q8 ${data.positive}
Q9 ${data.empathy}

Q10 ${data.club}
Q11 ${data.partTimeJob}

Q12 ${data.holidayWithFriends}
Q13 ${data.holidayAlone}

Q14 ${data.lineFrequency}
Q15 ${data.datePlace}
`.trim();
}
