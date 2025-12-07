var uniqueToken;
var isSubmitting = false;

const webAppUrl = "https://script.google.com/macros/s/AKfycbyUNKke-9zQYeD5YpNXcjvAWIezi0M1w8ohE6GevGfA7JhPvS7bhueI3-C5JogXhTQugg/exec";

function submitForm() {
    if (isSubmitting) return;

    var textInput = document.getElementById("text-input").value;
    var numberInput = document.getElementById("number-input").value;

    // Generate token only (mixedUser removed as requested)
    uniqueToken = generateMixedString(10);
    console.log("Generated Token:", uniqueToken);

    var formData = new FormData();
    formData.append("text", textInput);
    formData.append("number", numberInput);
    formData.append("token", uniqueToken);

    isSubmitting = true;
    document.getElementById("submit-button").disabled = true;
    document.getElementById("please-wait").style.display = "block";

    fetch(webAppUrl, {
        method: "POST",
        body: formData,
        mode: "cors"
    })
    .then(response => response.json())
    .then(data => {
        console.log("Success:", data);
        waitForAddress(); // FIXED
    })
    .catch(error => {
        console.error("Error:", error);
        resetUI();
    });
}

function waitForAddress() {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds

    pollingTimer = setInterval(() => {
        fetch(`${webAppUrl}?token=${uniqueToken}`)
            .then(res => res.json())
            .then(data => {
                console.log("GET response:", data);

                const row = data.eRowData;

                // E column is now expected to be a STRING
                if (row && row.string && row.string.trim() !== "") {
                    clearInterval(pollingTimer);

                    displayQRCode(row.string);
                    displayAddress(row.string);
                    return;
                }

                if (++attempts >= maxAttempts) {
                    clearInterval(pollingTimer);
                    console.warn("Timeout waiting for string in column E.");
                    resetUI();
                }
            })
            .catch(err => console.error("GET error:", err));
    }, 1000);
}

function displayQRCode(value) {
    var qrCodeUrl =
        "https://quickchart.io/chart?cht=qr&chs=150x150&chl=" +
        encodeURIComponent(value);

    var qrCodeImage = document.createElement("img");
    qrCodeImage.src = qrCodeUrl;
    qrCodeImage.width = 170;
    qrCodeImage.height = 170;

    var qrCodeContainer = document.getElementById("qrCode");
    qrCodeContainer.innerHTML = "";
    qrCodeContainer.appendChild(qrCodeImage);
}

function displayAddress(value) {
    var addressContainer = document.getElementById("address-container");
    addressContainer.innerHTML = value;
    addressContainer.style.color = "white";

    var copyButton = document.getElementById("copy-button");
    copyButton.style.display = "block";
    copyButton.onclick = () => copyToClipboard(value);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            // iOS Safari fix
            const video = document.getElementById("player");
            setTimeout(() => {
                if (video && video.paused) video.play().catch(() => {});
            }, 100);

            alert("Copied!");
        })
        .catch(error => console.error("Clipboard error:", error));
}

function resetUI() {
    isSubmitting = false;
    document.getElementById("submit-button").disabled = false;
    document.getElementById("please-wait").style.display = "none";
}

function generateMixedString(length) {
    var result = "";
    var characters =
        "thequickbrownfoxjumpsoverthelazydogTHEQUICKBROWNFOXJUMPSOVERTHELAZYDOG1234567890";
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Popup functions
function showNumberPopup() {
    var popup = document.getElementById("number-popup");
    popup.style.display = "block";
    popup.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
}

function hideNumberPopup() {
    document.getElementById("number-popup").style.display = "none";
}

function selectNumber(number) {
    document.getElementById("number-input").value = number;
    hideNumberPopup();
}
