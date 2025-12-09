var uniqueToken;
var isSubmitting = false;
const webAppUrl = "https://script.google.com/macros/s/AKfycbyUNKke-9zQYeD5YpNXcjvAWIezi0M1w8ohE6GevGfA7JhPvS7bhueI3-C5JogXhTQugg/exec";

function submitForm() {
    if (isSubmitting) {
        console.log("Please wait, submission in progress...");
        return;
    }

    var textInput = document.getElementById("text-input").value;
    var numberInput = document.getElementById("number-input").value;

    var mixedLettersNumbersUser = generateMixedString(30);

    uniqueToken = generateMixedString(10);
    console.log('Generated Token:', uniqueToken);

    var formData = new FormData();
    formData.append("text", textInput);
    formData.append("number", numberInput);
    formData.append("mixedUser", mixedLettersNumbersUser);
    formData.append("token", uniqueToken);

    isSubmitting = true;
    document.getElementById("submit-button").disabled = true;
    document.getElementById("please-wait").style.display = "block";

    fetch(webAppUrl, {
        method: 'POST',
        body: formData,
        mode: 'cors'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        waitForAddress(); // Poll Column E
    })
    .catch((error) => {
        console.error('Error:', error);
        isSubmitting = false;
        document.getElementById("submit-button").disabled = false;
        document.getElementById("please-wait").style.display = "none";
    });
}

function waitForAddress() {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds

    const pollingTimer = setInterval(() => {
        fetch(`${webAppUrl}?token=${uniqueToken}`)
            .then(res => res.json())
            .then(data => {
                console.log("GET response:", data);

                // NEW: Backend returns { text: "address" }
                const address = data.text;

                if (address && address.trim() !== "") {
                    clearInterval(pollingTimer);

                    displayQRCode(address);
                    displayAddress(address);
                    return;
                }

                if (++attempts >= maxAttempts) {
                    clearInterval(pollingTimer);
                    console.warn("Timeout waiting for address.");
                    resetUI();
                }
            })
            .catch(err => console.error("GET error:", err));
    }, 1000);
}

function displayQRCode(address) {
    var qrCodeUrl = "https://quickchart.io/chart?cht=qr&chs=150x150&chl=" + encodeURIComponent(address);

    var qrCodeImage = document.createElement("img");
    qrCodeImage.src = qrCodeUrl;
    qrCodeImage.width = 170;
    qrCodeImage.height = 170;

    var qrCodeContainer = document.getElementById("qrCode");
    qrCodeContainer.innerHTML = "";
    qrCodeContainer.appendChild(qrCodeImage);
}

function generateMixedString(length) {
    var result = '';
    var characters = 'thequickbrownfoxjumpsoverthelazydogTHEQUICKBROWNFOXJUMPSOVERTHELAZYDOG1234567890';
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function displayAddress(address) {
    var addressContainer = document.getElementById("address-container");
    addressContainer.innerHTML = address;
    addressContainer.style.color = "white";

    var copyButton = document.getElementById("copy-button");
    copyButton.style.display = "block";
    copyButton.onclick = () => copyToClipboard(address);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            const video = document.getElementById("player");
            setTimeout(() => {
                if (video.paused) video.play().catch(() => {});
            }, 100);
            alert("Address copied to clipboard!");
        })
        .catch((error) => console.error("Unable to copy to clipboard:", error));
}

function showNumberPopup() {
    var popup = document.getElementById("number-popup");
    popup.style.display = "block";
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

function resetUI() {
    isSubmitting = false;
    document.getElementById("submit-button").disabled = false;
    document.getElementById("please-wait").style.display = "none";
}
