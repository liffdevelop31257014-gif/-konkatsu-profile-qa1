/********************************
 * 設定
 ********************************/
const GAS_URL =
"https://script.google.com/macros/s/AKfycbwgALarJs2lA9JMAK-fN4wjl-g4_6dOPfSIdK4SEzKqAiAIogT9kgR9PJ-sW1Ied2pR/exec";

const LIFF_ID =
"2010312230-lVV2FfLh";

let userHash = "";

/********************************
 * 初期化
 ********************************/
window.onload = async () => {

  try {

    document
      .getElementById("shareModal")
      .classList
      .add("hidden");

    await liff.init({
      liffId: LIFF_ID
    });

    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    const profile =
      await liff.getProfile();

    userHash =
      await sha256(
        profile.userId
      );

    setupEvents();

  } catch (error) {

    console.error(error);

    alert(
      "初期化に失敗しました"
    );
  }
};

/********************************
 * SHA256
 ********************************/
async function sha256(text) {

  const encoder =
    new TextEncoder();

  const data =
    encoder.encode(text);

  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );

  return Array
    .from(
      new Uint8Array(hashBuffer)
    )
    .map(
      b => b
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
}

/********************************
 * イベント
 ********************************/
function setupEvents() {

  // Q4

  const q4Detail =
    document.getElementById(
      "q4Detail"
    );

  q4Detail.style.display =
    "none";

  document
    .querySelectorAll(
      'input[name="q4"]'
    )
    .forEach(radio => {

      radio.addEventListener(
        "change",
        () => {

          if (
            radio.checked &&
            radio.value === "yes"
          ) {

            q4Detail.style.display =
              "block";

          } else if (
            radio.checked &&
            radio.value === "no"
          ) {

            q4Detail.style.display =
              "none";

            q4Detail.value = "";
          }
        }
      );
    });

  // Q7

  const q7Detail =
    document.getElementById(
      "q7Detail"
    );

  q7Detail.style.display =
    "none";

  document
    .querySelectorAll(
      'input[name="q7"]'
    )
    .forEach(radio => {

      radio.addEventListener(
        "change",
        () => {

          if (
            radio.checked &&
            radio.value === "yes"
          ) {

            q7Detail.style.display =
              "block";

          } else if (
            radio.checked &&
            radio.value === "no"
          ) {

            q7Detail.style.display =
              "none";

            q7Detail.value = "";
          }
        }
      );
    });

  // 送信

  document
    .getElementById(
      "submitBtn"
    )
    .addEventListener(
      "click",
      submitForm
    );

  // 共有

  document
    .getElementById(
      "shareBtn"
    )
    .addEventListener(
      "click",
      shareResult
    );
}

/********************************
 * データ取得
 ********************************/
function collectData() {

  return {

    wakeUp:
      document.getElementById("q1").value,

    sleep:
      document.getElementById("q2").value,

    afterWork:
      document.getElementById("q3").value,

    morningNews:
      document.querySelector(
        'input[name="q4"]:checked'
      )?.value || "",

    morningNewsDetail:
      document.getElementById("q4Detail").value,

    childhoodTv:
      document.getElementById("q5").value,

    nickname:
      document.getElementById("q6").value,

    mbtiStatus:
      document.querySelector(
        'input[name="q7"]:checked'
      )?.value || "",

    mbtiType:
      document.getElementById("q7Detail").value,

    positive:
      document.getElementById("q8").value,

    empathy:
      document.getElementById("q9").value,

    club:
      document.getElementById("q10").value,

    partTimeJob:
      document.getElementById("q11").value,

    holidayWithFriends:
      document.getElementById("q12").value,

    holidayAlone:
      document.getElementById("q13").value,

    lineFrequency:
      document.querySelector(
        'input[name="q14"]:checked'
      )?.value || "",

    datePlace:
      document.getElementById("q15").value
  };
}

/********************************
 * GAS送信
 ********************************/
async function submitForm() {

  try {

    const payload = {

      action: "submit",

      userHash: userHash,

      consent: true,

      data: collectData()
    };

    const response =
      await fetch(
        GAS_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
            "application/json"
          },
          body: JSON.stringify(
            payload
          )
        }
      );

    const result =
      await response.json();

    if (
      !result.success
    ) {

      alert(
        result.message ||
        "送信失敗"
      );

      return;
    }

    alert(
      "回答を保存しました"
    );

    document
      .getElementById(
        "shareModal"
      )
      .classList
      .remove("hidden");

  } catch (error) {

    console.error(error);

    alert(
      "送信エラー"
    );
  }
}

/********************************
 * 共有
 ********************************/
async function shareResult() {

  const shareName =
    document
      .getElementById(
        "shareName"
      )
      .value
      .trim()
      || "匿名";

  const data =
    collectData();

  const text =
    buildShareText(
      shareName,
      data
    );

  try {

    await liff.shareTargetPicker([
      {
        type: "text",
        text: text
      }
    ]);

  } catch (error) {

    console.error(error);
  }
}

/********************************
 * 共有文生成
 ********************************/
function buildShareText(
  shareName,
  data
) {

  const positiveBar =
    "◉".repeat(
      Number(data.positive)
    ) +
    "〇".repeat(
      5 - Number(data.positive)
    );

  const empathyBar =
    "◉".repeat(
      Number(data.empathy)
    ) +
    "〇".repeat(
      5 - Number(data.empathy)
    );

  return `
【婚活 自己開示QA Part1】

共有名：${shareName}

Q1 朝起きる時間
${data.wakeUp}

Q2 夜寝る時間
${data.sleep}

Q3 仕事終わりの過ごし方
${data.afterWork}

Q4 朝のニュース・番組
${data.morningNews === "yes"
? data.morningNewsDetail
: "なし"}

Q5 子どもの頃好きだったテレビ番組
${data.childhoodTv}

Q6 あだ名
${data.nickname}

Q7 MBTI
${data.mbtiStatus === "yes"
? data.mbtiType
: "なし"}

Q8
ネガティブ ${positiveBar} ポジティブ

Q9
察さない ${empathyBar} 察する

Q10 部活動
${data.club}

Q11 バイト経験
${data.partTimeJob}

Q12 休日（人と）
${data.holidayWithFriends}

Q13 休日（1人）
${data.holidayAlone}

Q14 LINE頻度
${data.lineFrequency}

Q15 行きたいデート先
${data.datePlace}
`;
}
