const GAS_URL = "https://script.google.com/macros/s/AKfycbwgALarJs2lA9JMAK-fN4wjl-g4_6dOPfSIdK4SEzKqAiAIogT9kgR9PJ-sW1Ied2pR/exec";

let liffReady = false;
let submitSuccessData = null;

document.addEventListener("DOMContentLoaded", async () => {

  await liff.init({ liffId: "2010312230-lVV2FfLh" });
  liffReady = true;

  document.getElementById("startBtn").onclick = () => {
    document.getElementById("consent").classList.add("hidden");
    document.getElementById("form").classList.remove("hidden");
  };

  // Q7分岐
  document.getElementById("q7").addEventListener("change", (e) => {
    const detail = document.getElementById("q7Detail");
    if (e.target.value === "yes") {
      detail.classList.remove("hidden");
    } else {
      detail.classList.add("hidden");
      detail.value = "";
    }
  });

  document.getElementById("nextBtn").onclick = () => {
    document.getElementById("page1").classList.add("hidden");
    document.getElementById("page2").classList.remove("hidden");
  };

  document.getElementById("backBtn").onclick = () => {
    document.getElementById("page2").classList.add("hidden");
    document.getElementById("page1").classList.remove("hidden");
  };

  // 送信
  document.getElementById("submitBtn").onclick = async () => {

    const formData = getFormData();

    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify(formData)
    });

    const result = await res.json();

    if (result.success) {

      submitSuccessData = formData;

      // ★ここでは絶対にshareしない（重要）
      document.getElementById("shareModal").classList.remove("hidden");

    } else {
      alert("保存失敗");
    }
  };

  // 共有ボタン（ここで初めて実行）
  document.getElementById("shareBtn").onclick = async () => {

    if (!submitSuccessData) return;

    const shareText = buildShareText(submitSuccessData);

    // LINE Share Target Picker（ここだけで発火）
    await liff.shareTargetPicker([
      {
        type: "text",
        text: shareText
      }
    ]);

    document.getElementById("shareModal").classList.add("hidden");
  };

  // 閉じる（共有モーダルだけ閉じる）
  document.getElementById("closeShareBtn").onclick = () => {
    document.getElementById("shareModal").classList.add("hidden");
  };

  // クリア
  document.getElementById("clearBtn").onclick = () => {
    localStorage.clear();
    location.reload();
  };

});

function getFormData() {
  return {
    userHash: "tmp", // 実際はSHA-256実装推奨
    isDraft: false,

    q1: q("q1"),
    q2: q("q2"),
    q3: q("q3"),
    q4: q("q4"),
    q5: q("q5"),
    q6: q("q6"),
    q7: q("q7"),
    q7Detail: q("q7Detail"),
    q8: q("q8"),
    q9: q("q9"),
    q10: q("q10"),
    q11: q("q11"),
    q12: q("q12"),
    q13: q("q13"),
    q14: q("q14"),
    q15: q("q15")
  };
}

function q(id) {
  return document.getElementById(id).value;
}

function buildShareText(data) {
  return `
【婚活自己開示QA】

Q1 ${data.q1}
Q2 ${data.q2}
Q3 ${data.q3}
Q4 ${data.q4}
Q5 ${data.q5}
Q6 ${data.q6}
Q7 ${data.q7} ${data.q7Detail}
Q8 ${data.q8}
Q9 ${data.q9}
Q10 ${data.q10}
Q11 ${data.q11}
Q12 ${data.q12}
Q13 ${data.q13}
Q14 ${data.q14}
Q15 ${data.q15}
`.trim();
}
