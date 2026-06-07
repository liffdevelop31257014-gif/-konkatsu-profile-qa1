const GAS_URL = "https://script.google.com/macros/s/AKfycbyFK5ER57hFtc7Zk1sndvkktbv-RsOrd0fw8Qf1IcJMcOacxnkPYga6eBrdzzqMZ0eK/exec";
const LIFF_ID = "2010312230-lVV2FfLh";

let userHash = "";

/* 初期化 */
window.onload = async () => {

  await liff.init({ liffId: LIFF_ID });

  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }

  const profile = await liff.getProfile();
  userHash = await sha256(profile.userId);

  hideModal(); // ★絶対重要
};

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

/* モーダル制御（統一） */
function showModal() {
  document.getElementById("shareModal").style.display = "flex";
}

function hideModal() {
  document.getElementById("shareModal").style.display = "none";
}

/* 送信 */
async function submit() {

  const data = collect();

  const res = await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "submit",
      userHash,
      data,
      consent: true
    })
  }).then(r => r.json());

  if (res.success) {
    alert("送信完了");

    // ★ここで初めて表示
    showModal();
  }
}

/* データ収集 */
function collect() {
  return {
    q1: q1.value,
    q2: q2.value,
    q3: q3.value,
    q4: q4.value,
    q5: q5.value,
    q6: q6.value
  };
}

/* 共有 */
document.getElementById("shareBtn").onclick = () => {

  const name = document.getElementById("shareName").value || "匿名";

  liff.shareTargetPicker([{
    type: "text",
    text: `共有者:${name}`
  }]);

  hideModal();
};
