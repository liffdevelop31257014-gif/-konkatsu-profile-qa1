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
 * イベント設定
 ********************************/
function setupEvents() {

  setupQ4();
  setupQ7();

  document
    .getElementById(
      "submitBtn"
    )
    .addEventListener(
      "click",
      submitForm
    );

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
 * Q4制御
 ********************************/
function setupQ4() {

  const detail =
    document.getElementById(
      "q4Detail"
    );

  detail.style.display =
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

            detail.style.display =
              "block";

          } else {

            detail.style.display =
              "none";

            detail.value = "";
          }
        }
      );
    });
}

/********************************
 * Q7制御
 ********************************/
function setupQ7() {

  const detail =
    document.getElementById(
      "q7Detail"
    );

  detail.style.display =
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

            detail.style.display =
              "block";

          } else {

            detail.style.display =
              "none";

            detail.value = "";
          }
        }
      );
    });
}

/********************************
 * 入力値取得
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
      document.getElementById(
        "q4Detail"
      ).value,

    childhoodTv:
      document.getElementById("q5").value,

    nickname:
      document.getElementById("q6").value,

    mbtiStatus:
      document.querySelector(
        'input[name="q7"]:checked'
      )?.value || "",

    mbtiType:
      document.getElementById(
        "q7Detail"
      ).value,

    positive:
      document.getElementById("q8")
        .value || "3",

    empathy:
      document.getElementById("q9")
        .value || "3",

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
 * 送信
 ********************************/
async function submitForm() {

  const submitBtn =
    document.getElementById(
      "submitBtn"
    );

  try {

    submitBtn.disabled = true;

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

    if (!result.success) {

      alert(
        result.message ||
        "保存に失敗しました"
      );

      return;
    }

    alert(
      "回答ありがとうございました"
    );

    document
      .getElementById(
        "shareModal"
      )
      .classList
      .add("show");

  } catch (error) {

    console.error(error);

    alert(
      "通信エラーが発生しました"
    );

  } finally {

    submitBtn.disabled = false;
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
      .trim() ||
    "匿名";

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

Q8 ポジティブ度
ネガティブ ${positiveBar} ポジティブ

Q9 察する度
察さない ${empathyBar} 察する

Q10 部活動
${data.club}

Q11 バイト経験
${data.partTimeJob}

Q12 休日（人と）
${data.holidayWithFriends}

Q13 休日（一人）
${data.holidayAlone}

Q14 LINE頻度
${data.lineFrequency}

Q15 行きたいデート先
${data.datePlace}
`;
}
