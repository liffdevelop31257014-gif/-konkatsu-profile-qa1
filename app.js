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
 * SHA256
 ********************************/
async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/********************************
 * GAS
 ********************************/
async function postToGAS(payload) {
  return fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(r => r.json());
}

/********************************
 * 取得
 ********************************/
async function loadFromServer() {
  const url = `${GAS_URL}?action=getProfile&userHash=${userHash}`;
  const res = await fetch(url).then(r => r.json());

  if (!res.found) return;

  const d = res.data;

  Object.keys(d).forEach(k => {
    const el = document.getElementById(k);
    if (el) el.value = d[k] || "";
  });
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

  const d = JSON.parse(raw);
  Object.keys(d).forEach(k => {
    const el = document.getElementById(k);
    if (el) el.value = d[k];
  });
}

/********************************
 * データ収集
 ********************************/
function collectData() {
  return {
    wakeUp: q1.value,
    sleep: q2.value,
    afterWork: q3.value,
    morningNews: q4.value,
    childhoodTv: q5.value,
    nickname: q6.value,
    mbtiStatus: document.querySelector('input[name="q7"]:checked')?.value || "",
    mbtiType: q7Detail.value,
    positive: q8.value,
    empathy: q9.value,
    club: q10.value,
    partTimeJob: q11.value,
    holidayWithFriends: q12.value,
    holidayAlone: q13.value,
    lineFrequency: q14.value,
    datePlace: q15.value
  };
}

/********************************
 * イベント
 ********************************/
function setupEvents() {

  document.querySelectorAll("input, textarea, select").forEach(el => {
    el.addEventListener("input", saveLocal);
    el.addEventListener("change", saveLocal);
  });

  submitBtn.onclick = async () => {

    const payload = {
      action: "submit",
      userHash,
      data: collectData(),
      consent: consent.checked
    };

    const res = await postToGAS(payload);

    if (res.success) {
      showShareModal();
    }
  };

  saveDraftBtn.onclick = async () => {
    await postToGAS({
      action: "saveDraft",
      userHash,
      data: collectData(),
      consent: consent.checked
    });

    alert("保存しました");
  };

  shareBtn.onclick = () => {

    const name = shareName.value || "匿名";
    const text = buildShareText(name, collectData());

    liff.shareTargetPicker([{ type: "text", text }]);

    hideShareModal();
  };
}

/********************************
 * モーダル制御（重要修正）
 ********************************/
function showShareModal() {
  const modal = document.getElementById("shareModal");
  modal.classList.remove("hidden");
  modal.classList.add("show");
}

function hideShareModal() {
  const modal = document.getElementById("shareModal");
  modal.classList.add("hidden");
  modal.classList.remove("show");
}

/********************************
 * 共有文
 ********************************/
function buildShareText(name, d) {
  return `【婚活プロフィール】
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
Q15 ${d.datePlace}`;
}
