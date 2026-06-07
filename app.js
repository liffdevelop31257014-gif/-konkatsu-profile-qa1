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

  setupEvents();
});

/* =====================
   SHA256
===================== */
async function sha256(text) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );

  return [...new Uint8Array(buf)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/* =====================
   データ取得
===================== */
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

/* =====================
   Q7制御（完成版）
===================== */
function setupQ7() {

  const radios = document.querySelectorAll('input[name="q7"]');
  const detail = document.getElementById("q7Detail");

  function update() {

    const selected = document.querySelector('input[name="q7"]:checked')?.value;

    if (selected === "yes") {
      detail.disabled = false;
      detail.style.opacity = "1";
    }

    if (selected === "no") {
      detail.value = "";
      detail.disabled = true;
      detail.style.opacity = "0.4";
    }
  }

  radios.forEach(r => {
    r.addEventListener("change", update);
  });

  update(); // 初期化
}

/* =====================
   UI
===================== */
function setupEvents() {

  setupQ7();

  nextBtn.onclick = () => {
    page1.classList.add("hidden");
    page2.classList.remove("hidden");
  };

  backBtn.onclick = () => {
    page2.classList.add("hidden");
    page1.classList.remove("hidden");
  };

  submitBtn.onclick = () => {
    showModal();
  };

  shareBtn.onclick = () => {

    const name = shareName.value || "匿名";
    const text = buildText(name, collect());

    liff.shareTargetPicker([{ type: "text", text }]);

    hideModal();
  };
}

/* =====================
   共有文
===================== */
function buildText(name, d) {

  return `
【婚活プロフィール】

共有者：${name}

Q1 ${d.wakeUp}
Q2 ${d.sleep}
Q3 ${d.afterWork}
Q4 ${d.morningNews}
Q5 ${d.childhoodTv}
Q6 ${d.nickname}

Q7 MBTI：${d.mbtiStatus} ${d.mbtiType}

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

/* =====================
   モーダル
===================== */
function showModal() {
  shareModal.style.display = "flex";
}

function hideModal() {
  shareModal.style.display = "none";
}
