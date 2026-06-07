const GAS_URL = "https://script.google.com/macros/s/AKfycbyFK5ER57hFtc7Zk1sndvkktbv-RsOrd0fw8Qf1IcJMcOacxnkPYga6eBrdzzqMZ0eK/exec";
const LIFF_ID = "2010312230-lVV2FfLh";

let userHash = "";

window.addEventListener("DOMContentLoaded", async () => {

  await liff.init({ liffId: LIFF_ID });

  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }

  const profile = await liff.getProfile();
  userHash = await sha256(profile.userId);

  setup();
});

async function sha256(text) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );

  return [...new Uint8Array(buf)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function post(payload) {
  return fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(r => r.json());
}

function collect() {
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

function setup() {

  nextBtn.onclick = () => page2.classList.remove("hidden");
  backBtn.onclick = () => page2.classList.add("hidden");

  submitBtn.onclick = async () => {

    const res = await post({
      action: "submit",
      userHash,
      data: collect(),
      consent: consent.checked
    });

    if (res.success) {
      showModal();
    }
  };

  saveDraftBtn.onclick = () => saveDraft();
  saveDraftBtn1.onclick = () => saveDraft();

  shareBtn.onclick = () => {
    const text = JSON.stringify(collect());
    liff.shareTargetPicker([{ type: "text", text }]);
    hideModal();
  };
}

async function saveDraft() {

  if (!consent.checked) {
    alert("同意が必要です");
    return;
  }

  const btns = [saveDraftBtn, saveDraftBtn1];

  btns.forEach(b => {
    if (b) {
      b.disabled = true;
      b.textContent = "保存中...";
    }
  });

  const res = await post({
    action: "saveDraft",
    userHash,
    data: collect(),
    consent: true
  });

  if (res.success) {
    showStatus("下書き保存しました");
  } else {
    showStatus("保存失敗");
  }

  btns.forEach(b => {
    if (b) {
      b.disabled = false;
      b.textContent = "下書き保存";
    }
  });
}

function showStatus(msg) {
  const el = document.getElementById("saveStatus");
  el.textContent = msg;

  setTimeout(() => {
    el.textContent = "";
  }, 2000);
}

function showModal() {
  document.getElementById("shareModal").style.display = "flex";
}

function hideModal() {
  document.getElementById("shareModal").style.display = "none";
}
