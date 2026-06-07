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

  setupEvents();
});

/* =====================
   ハッシュ化
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
   GAS通信
===================== */
async function post(payload) {
  return fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(r => r.json());
}

/* =====================
   データ収集
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
   UI制御
===================== */
function setupEvents() {

  // ページ遷移
  nextBtn.onclick = () => {
    page1.classList.add("hidden");
    page2.classList.remove("hidden");
  };

  backBtn.onclick = () => {
    page2.classList.add("hidden");
    page1.classList.remove("hidden");
  };

  // MBTI表示制御
  document.querySelectorAll('input[name="q7"]').forEach(r => {
    r.addEventListener("change", () => {
      if (r.value === "yes") {
        q7Detail.style.display = "block";
      } else {
        q7Detail.style.display = "none";
        q7Detail.value = "";
      }
    });
  });

  // 送信
  submitBtn.onclick = async () => {

    if (!consent.checked) {
      alert("同意が必要です");
      return;
    }

    const res = await post({
      action: "submit",
      userHash,
      data: collect(),
      consent: true
    });

    if (res.success) {
      showModal();
    } else {
      alert("送信に失敗しました");
    }
  };

  // 共有
  shareBtn.onclick = () => {

    const name = shareName.value || "匿名";
    const text = buildText(name, collect());

    liff.shareTargetPicker([
      { type: "text", text }
    ]);

    hideModal();
  };
}

/* =====================
   共有文生成
===================== */
function buildText(name, d) {

  return `
【婚活プロフィール】

共有者：${name}

Q1 起床：${d.wakeUp}
Q2 就寝：${d.sleep}
Q3 ${d.afterWork}
Q4 ${d.morningNews}
Q5 ${d.childhoodTv}
Q6 ${d.nickname}

Q7 MBTI：${d.mbtiStatus} ${d.mbtiType}

Q8 ポジネガ：${d.positive}
Q9 察する力：${d.empathy}

Q10 部活：${d.club}
Q11 バイト：${d.partTimeJob}

Q12 休日（人と）：${d.holidayWithFriends}
Q13 休日（1人）：${d.holidayAlone}

Q14 LINE頻度：${d.lineFrequency}
Q15 デート希望：${d.datePlace}
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
