let binData = {};

// BINデータをロード（初回のみ実行）
async function loadBINData() {
    if (Object.keys(binData).length > 0) return; // すでにデータがある場合は再ロードしない

    try {
        const response = await fetch("bin-db.json"); // BINデータを読み込む
        binData = await response.json();
    } catch (error) {
        console.error("BINデータの読み込みに失敗しました:", error);
    }
}

// BIN検索処理
async function lookupBIN() {
    await loadBINData(); // 初回のみロード

    let bin = document.getElementById("binInput").value;
    if (bin.length !== 6) {
        document.getElementById("result").innerText = "6桁のBINを入力してください。";
        return;
    }

    // 数字以外を削除（例: "4708-91" → "470891"）
    let normalizedBin = bin.replace(/\D/g, "");

    // 国際ブランドを判定
    let brand = getCardBrand(bin);

    // BINデータベースから検索
    let found = null;
    for (const category in binData) {
        for (const entry of binData[category]) {
            let normalizedEntryBin = entry.bin.replace(/\D/g, ""); // BINデータ側も統一
            if (normalizedEntryBin === normalizedBin) {
                found = entry;
                break;
            }
        }
        if (found) break;
    }

    // 情報の表示処理
    if (found) {
        document.getElementById("result").innerHTML = `
            <p><strong>国際ブランド:</strong> ${brand}</p>
            <p><strong>発行会社:</strong> ${found.description}</p>
        `;
    } else {
        document.getElementById("result").innerHTML = `
            <p><strong>国際ブランド:</strong> ${brand}</p>
            <p><strong>発行会社:</strong> 情報が見つかりませんでした。</p>
        `;
    }

    // お問い合わせメッセージを常に表示
    const contactMessage = document.getElementById("contactMessage");
    if (contactMessage) contactMessage.classList.remove("hidden");
}

// 国際ブランド判定
function getCardBrand(bin) {
    if (bin.startsWith("4")) return "VISA";
    if (bin.startsWith("5")) return "Mastercard";
    if (bin.startsWith("34") || bin.startsWith("37")) return "American Express";
    if (bin.startsWith("36") || bin.startsWith("38")) return "Diners Club";
    if (bin.startsWith("35")) return "JCB";
    if (bin.startsWith("6")) return "Discover / UnionPay";
    return "不明";
}

// お問い合わせポップアップを開く
function openContactModal() {
    document.getElementById("contactModal")?.classList.remove("hidden");
}

// お問い合わせポップアップを閉じる
function closeContactModal() {
    document.getElementById("contactModal")?.classList.add("hidden");
}

// プライバシーポリシーの同意処理
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("privacyModal");
    const agreeCheckbox = document.getElementById("agreeCheckbox");
    const agreeButton = document.getElementById("agreeButton");
    const searchButton = document.getElementById("searchButton");

    if (modal) {
        // 一度同意したかを確認
        if (!localStorage.getItem("privacyAgreed")) {
            modal.classList.remove("hidden");
        } else {
            searchButton.disabled = false; // 既に同意していたら検索ボタンを有効化
        }

        // チェックボックスを監視してボタンの有効化
        agreeCheckbox?.addEventListener("change", () => {
            agreeButton.disabled = !agreeCheckbox.checked;
        });

        // 続行ボタンを押したらモーダルを閉じる
        agreeButton?.addEventListener("click", () => {
            localStorage.setItem("privacyAgreed", "true");
            modal.classList.add("hidden");
            searchButton.disabled = false; // 検索ボタンを有効化
        });
    }
});

// 初回ロード
loadBINData();
