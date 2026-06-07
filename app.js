/********************************
 * 設定
 ********************************/
const GAS_URL = "https://script.google.com/macros/s/AKfycbyFK5ER57hFtc7Zk1sndvkktbv-RsOrd0fw8Qf1IcJMcOacxnkPYga6eBrdzzqMZ0eK/exec";
const LIFF_ID = "2010312230-lVV2FfLh";

let userHash = "";

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
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  }).then(res => res.json());
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

    if (el.type === "radio") {
      const radios = document.querySelectorAll(`input[name="${k}"]`);
      radios.forEach(r => {
        if (r.value === data[k]) r.checked = true;
      });
    } else {
      el.value = data[k] || "";
    }
  });

  if (data.mbtiStatus === "yes") {
    document.getElementById("q7Detail").style.display = "block";
  }
}

/********************************
 * localStorage
 ********************************/
function saveLocal() {
  const data = collectData();
  localStorage.setItem("formData", JSON.stringify(data));
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
 * イベント設定
 ********************************/
function setupEvents() {

  // Q7 条件分岐
  document.querySelectorAll('input[name="q7"]').forEach(radio => {
    radio.addEventListener("change", () => {
      const val = radio.value;

      const detail = document.getElementById("q7Detail");

      if (val === "yes") {
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

  // 下書き保存
  document.getElementById("saveDraftBtn").onclick = async () => {

    if (!document.getElementById("consent").checked) {
      alert("同意が必要です");
      return;
    }

    const payload = {
      action: "saveDraft",
      userHash,
      data: collectData(),
      consent: true
    };

    await postToGAS(payload);

    alert("下書き保存しました");
  };

  // 本送信
  document.getElementById("submitBtn").onclick = async () => {

    if (!document.getElementById("consent").checked) {
      alert("同意が必要です");
      return;
    }

    const payload = {
      action: "submit",
      userHash,
      data: collectData(),
      consent: true
    };

    await postToGAS(payload);

    alert("送信完了");

    showShareModal();
  };

  // フォームクリア
  document.getElementById("clearBtn").onclick = () => {

    document.querySelectorAll("input, textarea").forEach(el => {
      if (el.type === "radio") el.checked = false;
      else el.value = "";
    });

    localStorage.removeItem("formData");

    alert("フォームをクリアしました");
  };

  // 共有
  document.getElementById("shareBtn").onclick = () => {

    const name =
      document.getElementById("shareName").value || "匿名";

    const data = collectData();

    const text = buildShareText(name, data);

    liff.shareTargetPicker([
      {
        type: "text",
        text
      }
    ]);

    document.getElementById("shareModal").classList.add("hidden");
  };

  document.getElementById("closeModalBtn").onclick = () => {
    document.getElementById("shareModal").classList.add("hidden");
  };

  // 自動保存
  document.querySelectorAll("input, textarea, select").forEach(el => {
    el.addEventListener("input", saveLocal);
    el.addEventListener("change", saveLocal);
  });
}

/********************************
 * 共有テキスト生成
 ********************************/
function buildShareText(name, data) {

  return `
【婚活プロフィール】

共有者: ${name}

Q1 起床: ${data.wakeUp}
Q2 就寝: ${data.sleep}
Q3 ${data.afterWork}
Q4 ${data.morningNews}
Q5 ${data.childhoodTv}
Q6 ${data.nickname}

Q7 MBTI: ${data.mbtiStatus} ${data.mbtiType}

Q8 ポジネガ: ${data.positive}
Q9 共感性: ${data.empathy}

Q10 部活: ${data.club}
Q11 バイト: ${data.partTimeJob}

Q12 休日(人と): ${data.holidayWithFriends}
Q13 休日(1人): ${data.holidayAlone}

Q14 LINE頻度: ${data.lineFrequency}
Q15 デート希望: ${data.datePlace}
`.trim();
}

/********************************
 * 共有モーダル表示
 ********************************/
function showShareModal() {
  document.getElementById("shareModal").classList.remove("hidden");
}
