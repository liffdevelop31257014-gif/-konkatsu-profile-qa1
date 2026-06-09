alert("app.js読込成功");

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
  

function log(msg){
  console.log(msg);

  const el =
    document.getElementById("debug");

  if(el){
    el.textContent += msg + "\n";
  }
}

　
window.onload = async () => {

console.log("window.onload");

try {

```
await liff.init({
  liffId: LIFF_ID
});

console.log("LIFF init OK");

if (!liff.isLoggedIn()) {

  console.log("login required");

  liff.login();
  return;
}

const profile =
  await liff.getProfile();

console.log("profile取得");

userHash =
  await sha256(
    profile.userId
  );

console.log(
  "userHash生成完了"
);

setupEvents();
```

} catch (error) {

```
console.error(error);

alert(
  "LINE認証に失敗しました。\nページを再読み込みしてください。"
);
```

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
b =>
b
.toString(16)
.padStart(2, "0")
)
.join("");
}

/********************************

* イベント
  ********************************/
  function setupEvents() {

console.log(
"setupEvents実行"
);

setupQ4();
setupQ7();

const submitBtn =
document.getElementById(
"submitBtn"
);

if (!submitBtn) {

```
console.error(
  "submitBtnが見つかりません"
);

return;
```

}

submitBtn.addEventListener(
"click",
() => {

```
  console.log(
    "送信ボタン押下"
  );

  submitForm();
}
```

);
}

/********************************

* Q4
  ********************************/
  function setupQ4() {

const detail =
document.getElementById(
"q4Detail"
);

if (!detail) return;

detail.style.display =
"none";

document
.querySelectorAll(
'input[name="q4"]'
)
.forEach(radio => {

```
  radio.addEventListener(
    "change",
    () => {

      if (
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
```

}

/********************************

* Q7
  ********************************/
  function setupQ7() {

const detail =
document.getElementById(
"q7Detail"
);

if (!detail) return;

detail.style.display =
"none";

document
.querySelectorAll(
'input[name="q7"]'
)
.forEach(radio => {

```
  radio.addEventListener(
    "change",
    () => {

      if (
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
```

}

/********************************

* 入力取得
  ********************************/
  function collectData() {

return {

```
wakeUp:
  document.getElementById("q1")?.value || "",

sleep:
  document.getElementById("q2")?.value || "",

afterWork:
  document.getElementById("q3")?.value || "",

morningNews:
  document.querySelector(
    'input[name="q4"]:checked'
  )?.value || "",

morningNewsDetail:
  document.getElementById("q4Detail")?.value || "",

childhoodTv:
  document.getElementById("q5")?.value || "",

nickname:
  document.getElementById("q6")?.value || "",

mbtiStatus:
  document.querySelector(
    'input[name="q7"]:checked'
  )?.value || "",

mbtiType:
  document.getElementById("q7Detail")?.value || "",

positive:
  document.getElementById("q8")?.value || "3",

empathy:
  document.getElementById("q9")?.value || "3",

club:
  document.getElementById("q10")?.value || "",

partTimeJob:
  document.getElementById("q11")?.value || "",

holidayWithFriends:
  document.getElementById("q12")?.value || "",

holidayAlone:
  document.getElementById("q13")?.value || "",

lineFrequency:
  document.querySelector(
    'input[name="q14"]:checked'
  )?.value || "",

datePlace:
  document.getElementById("q15")?.value || ""
```

};
}

/********************************

* 送信
  ********************************/
  async function submitForm() {

console.log(
"submitForm開始"
);

const submitBtn =
document.getElementById(
"submitBtn"
);

try {

```
submitBtn.disabled = true;
submitBtn.textContent =
  "送信中...";

const payload = {

  action: "submit",

  userHash: userHash,

  consent: true,

  data: collectData()
};

console.log(payload);

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

console.log(
  "response",
  response
);

const result =
  await response.json();

console.log(
  "result",
  result
);

if (
  !result.success
) {

  alert(
    "回答の保存に失敗しました。"
  );

  return;
}

alert(
  "回答ありがとうございました。"
);
```

} catch (error) {

```
console.error(error);

alert(
  "通信エラーが発生しました。\n" +
  error.message
);
```

} finally {

```
submitBtn.disabled =
  false;

submitBtn.textContent =
  "送信";
```

}
}
