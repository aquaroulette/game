<script>
/* -----------------------------
   GLOBAL VARIABLES
------------------------------ */
let uniqueToken = "";
let isSubmitting = false;
let pollingTimer = null;

const webAppUrl = "https://script.google.com/macros/s/AKfycbyUNKke-9zQYeD5YpNXcjvAWIezi0M1w8ohE6GevGfA7JhPvS7bhueI3-C5JogXhTQugg/exec";


/* -----------------------------
   SUBMIT FORM
------------------------------ */
function submitForm() {
    if (isSubmitting) return;

    const textInput = document.getElementById("text-input").value.trim();
    const numberInput = document.getElementById("number-input").value.trim();

    const mixedUser = generateMixedString(30);
    uniqueToken = generateMixedString(10);

    const formData = new FormData();
    formData.append("text", textInput);
    formData.append("number", numberInput);
    formData.append("mixedUser", mixedUser);
    formData.append("token", uniqueToken);

    // UI lock
    isSubmitting = true;
    document.getElementById("submit-button").disabled = true;
    document.getElementById("please-wait").style.display = "block";

    fetch(webAppUrl, { method: "POST", body: formData })
        .then(res => res.json())
        .then(data => {
            console.log("POST response:", data);
            waitForAddress(); // Start polling
        })
        .catch(err => {
            console.error("POST error:", err);
            resetUI();
        });
}


/* -----------------------------
   POLLING FOR ADDRESS (Column E)
------------------------------ */
function waitForAddress() {
    let attempts = 0;
    const maxAttempts = 30; // = 30 seconds

    pollingTimer = setInterval(() => {
        fetch(`${webAppUrl}?token=${uniqueToken}`)
            .then(res => res.json())
            .then(data => {
                console.log("GET response:", data);

                const row = data.eRowData;

                // We wait until ARRAYFORMULA populates column E
                if (row && row.address && row.address.trim() !== "") {
                    clearInterval(pollingTimer);

                    displayQRCode(row.address);
                    displayAddress(row.address);
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


/* -----------------------------
   QR CODE DISPLAY
------------------------------ */
function displayQRCode(address) {
    const qrUrl = `https://quickchart.io/chart?cht=qr&chs=150x150&chl=${encodeURIComponent(address)}`;

    const img = document.createElement("img");
    img.src = qrUrl;
    img.width = 170;
    img.height = 170;

    const container = document.getElementById("qrCode");
    container.innerHTML = "";
    container.appendChild(img);
}


/* -----------------------------
   DISPLAY ADDRESS + COPY BUTTON
------------------------------ */
function displayAddress(address) {
    const addressContainer = document.getElementById("address-container");
    addressContainer.innerHTML = address;
    addressContainer.style.color = "white";

    const copyButton = document.getElementById("copy-button");
    copyButton.style.display = "block";

    // Reset listener to avoid duplicates
    copyButton.onclick = () => copyToClipboard(address);

    resetUI();
}


/* -----------------------------
   COPY TO CLIPBOARD
------------------------------ */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            alert("Address copied to clipboard!");
        })
        .catch(err => console.error("Copy failed:", err));
}


/* -----------------------------
   UTILS — GENERATE STRING
------------------------------ */
function generateMixedString(length) {
    const chars = "thequickbrownfoxjumpsoverthelazydogTHEQUICKBROWNFOXJUMPSOVERTHELAZYDOG1234567890";
    let output = "";
    for (let i = 0; i < length; i++) {
        output += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return output;
}


/* -----------------------------
   POPUP (No changes needed)
------------------------------ */
function showNumberPopup() {
    const popup = document.getElementById("number-popup");
    popup.style.display = "block";
    popup.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
}

function hideNumberPopup() {
    document.getElementById("number-popup").style.display = "none";
}

function selectNumber(n) {
    document.getElementById("number-input").value = n;
    hideNumberPopup();
}


/* -----------------------------
   RESET UI
------------------------------ */
function resetUI() {
    isSubmitting = false;
    document.getElementById("submit-button").disabled = false;
    document.getElementById("please-wait").style.display = "none";
}
</script>
