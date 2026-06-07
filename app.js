const GAS_URL = "https://script.google.com/macros/s/AKfycbyFK5ER57hFtc7Zk1sndvkktbv-RsOrd0fw8Qf1IcJMcOacxnkPYga6eBrdzzqMZ0eK/exec";
const LIFF_ID = "2010312230-lVV2FfLh";

let userHash = "";

window.onload = async () => {
  await liff.init({ liffId: LIFF_ID });

  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }

  const profile = await liff.getProfile();
  userHash = await sha256(profile.userId);

  setup();
};

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
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" }
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

  saveDraftBtn.onclick = async () => {
    await post({
      action: "saveDraft",
      userHash,
      data: collect(),
      consent: consent.checked
    });

    alert("保存");
  };

  shareBtn.onclick = () => {
    const text = JSON.stringify(collect());
    liff.shareTargetPicker([{ type: "text", text }]);
    hideModal();
  };

  nextBtn.onclick = () => page2.classList.remove("hidden");
  backBtn.onclick = () => page2.classList.add("hidden");
}

/* ★重要：ここが完全修正ポイント */
function showModal() {
  document.getElementById("shareModal").style.display = "flex";
}

function hideModal() {
  document.getElementById("shareModal").style.display = "none";
}
