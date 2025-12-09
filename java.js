var uniqueToken;
var isSubmitting = false;
const webAppUrl = "https://script.google.com/macros/s/AKfycbxqPimrJc6h6DFHEZ880qESQbLRBzXVBhEeXqnjE3DYSIQcKd8bkT3sXNm8ySUIt_Bd/exec";

function submitForm() {
    if (isSubmitting) return;

    const textInput = document.getElementById("text-input").value;
    const numberInput = document.getElementById("number-input").value;

    const mixedLettersNumbersUser = generateMixedString(30);
    uniqueToken = generateMixedString(10);

    const formData = new FormData();
    formData.append("text", textInput);
    formData.append("number", numberInput);
    formData.append("mixedUser", mixedLettersNumbersUser);
    formData.append("token", uniqueToken);

    isSubmitting = true;
    document.getElementById("submit-button").disabled = true;
    document.getElementById("please-wait").style.display = "block";

    fetch(webAppUrl, { method: 'POST', body: formData })
        .then(r => r.json())
        .then(data => {
            console.log("POST OK:", data);
            waitForAddress();
        })
        .catch(err => {
            console.error("POST ERROR:", err);
            resetUI();
        });
}

function waitForAddress() {
    let attempts = 0;
    const maxAttempts = 30;

    const polling = setInterval(() => {
        fetch(`${webAppUrl}?token=${uniqueToken}`)
            .then(r => r.json())
            .then(data => {
                console.log("GET:", data);

                const row = data.eRowData;
                if (!row) return;

                const value = row.string || "";

                if (value.trim() !== "") {
                    clearInterval(polling);

                    document.getElementById("please-wait").style.display = "none";

                    displayQRCode(value);
                    displayAddress(value);

                    return;
                }

                attempts++;
                if (attempts >= maxAttempts) {
                    clearInterval(polling);
                    resetUI();
                }
            })
            .catch(err => console.error("GET error:", err));
    }, 1000);
}

function displayQRCode(address) {
    const qrURL = "https://quickchart.io/chart?cht=qr&chs=150x150&chl=" + encodeURIComponent(address);

    const img = document.createElement("img");
    img.src = qrURL;
    img.width = 170;
    img.height = 170;

    const c = document.getElementById("qrCode");
    c.innerHTML = "";
    c.appendChild(img);
}

function generateMixedString(length) {
    const chars = "thequickbrownfoxjumpsoverthelazydogTHEQUICKBROWNFOXJUMPSOVERTHELAZYDOG1234567890";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function displayAddress(address) {
    const container = document.getElementById("address-container");
    container.innerHTML = address;
    container.style.color = "white";

    const btn = document.getElementById("copy-button");
    btn.style.display = "block";
    btn.onclick = () => copyToClipboard(address);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => alert("Address copied!"))
        .catch(err => console.error("Copy failed:", err));
}

function showNumberPopup() {
    const popup = document.getElementById("number-popup");
    popup.style.display = "flex";
    popup.style.flexDirection = "column";
    popup.style.justifyContent = "center";
    popup.style.alignItems = "center";
    popup.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
}

function hideNumberPopup() {
    document.getElementById("number-popup").style.display = "none";
}

function selectNumber(number) {
    document.getElementById("number-input").value = number;
    hideNumberPopup();
}

function resetUI() {
    isSubmitting = false;
    document.getElementById("submit-button").disabled = false;
    document.getElementById("please-wait").style.display = "none";
}
