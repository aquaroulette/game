var uniqueToken;
var isSubmitting = false;
const webAppUrl = "https://script.google.com/macros/s/AKfycbxqPimrJc6h6DFHEZ880qESQbLRBzXVBhEeXqnjE3DYSIQcKd8bkT3sXNm8ySUIt_Bd/exec";

function submitForm() {
    if (isSubmitting) return;

    var textInput = document.getElementById("text-input").value;
    var numberInput = document.getElementById("number-input").value;

    uniqueToken = generateMixedString(10);

    var formData = new FormData();
    formData.append("text", textInput);
    formData.append("number", numberInput);
    formData.append("token", uniqueToken);

    isSubmitting = true;
    document.getElementById("submit-button").disabled = true;
    document.getElementById("please-wait").style.display = "block";

    fetch(webAppUrl, {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(() => waitForAddress())
    .catch(err => {
        console.error("POST error:", err);
        resetUI();
    });
}


function waitForAddress() {
    let attempts = 0;
    const maxAttempts = 30;

    const polling = setInterval(() => {
        fetch(`${webAppUrl}?token=${uniqueToken}`)
            .then(res => res.json())
            .then(data => {
                const row = data.eRowData;
                if (!row) return;

                const address = row.address;

                if (address && address.trim() !== "") {
                    clearInterval(polling);

                    displayQRCode(address);
                    displayAddress(address);

                    document.getElementById("please-wait").style.display = "none";
                    isSubmitting = false;
                    document.getElementById("submit-button").disabled = false;
                }

                if (++attempts >= maxAttempts) {
                    clearInterval(polling);
                    console.warn("Timeout waiting for address");
                    resetUI();
                }
            })
            .catch(err => console.error("GET error:", err));
    }, 1000);
}


function displayQRCode(address) {
    var url = "https://quickchart.io/chart?cht=qr&chs=150x150&chl=" + encodeURIComponent(address);
    var img = document.createElement("img");
    img.src = url;
    img.width = 170;
    img.height = 170;
    document.getElementById("qrCode").innerHTML = "";
    document.getElementById("qrCode").appendChild(img);
}

function displayAddress(address) {
    var container = document.getElementById("address-container");
    container.innerHTML = address;
    container.style.color = "white";

    var copyButton = document.getElementById("copy-button");
    copyButton.style.display = "block";
    copyButton.onclick = () => copyToClipboard(address);
}

function generateMixedString(len) {
    const chars = "thequickbrownfoxjumpsoverthelazydogTHEQUICKBROWNFOXJUMPSOVERTHELAZYDOG1234567890";
    let out = "";
    for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return out;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => alert("Address copied!"))
        .catch(err => console.error("Clipboard error:", err));
}

function resetUI() {
    isSubmitting = false;
    document.getElementById("submit-button").disabled = false;
    document.getElementById("please-wait").style.display = "none";
}


function showNumberPopup() {
    var popup = document.getElementById("number-popup");
    popup.style.display = "flex";
    popup.style.flexDirection = "column"; // Ensure cancel button appears at bottom
    popup.style.justifyContent = "center";
    popup.style.alignItems = "center";
    popup.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
}

function hideNumberPopup() {
    var popup = document.getElementById("number-popup");
    popup.style.display = "none";
}

function selectNumber(number) {
    document.getElementById("number-input").value = number;
    hideNumberPopup();
}

