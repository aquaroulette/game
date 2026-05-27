var uniqueToken;
var isSubmitting = false;

const webAppUrl = "https://script.google.com/macros/s/AKfycbyQhECOQe_wvA5Jsho6Y9c7uJ8qLlArgFFlonofPM8qANdywkroBstTMjoUOk1G4IBM/exec";

let selectedNumber = null;

/* STREAM */
const video = document.getElementById("player");
const streamURL = "https://live.aquaroulette.com/hls/stream.m3u8";

if (window.Hls && Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(streamURL);
    hls.attachMedia(video);
} else {
    video.src = streamURL;
}

/* ROULETTE */
const redNumbers = [
 1,3,5,7,9,12,14,16,18,
 19,21,23,25,27,30,32,34,36
];

const grid = document.getElementById("grid");

for (let i = 1; i <= 36; i++) {
    const btn = document.createElement("button");
    btn.classList.add("ball");
    btn.classList.add(redNumbers.includes(i) ? "red" : "black");

    btn.dataset.number = i;
    btn.textContent = i;

    btn.onclick = () => selectNumber(btn, i);

    grid.appendChild(btn);
}

document.querySelector(".green").onclick = () => {
    selectNumber(document.querySelector(".green"), 0);
};

function selectNumber(el, num){
    document.querySelectorAll(".ball").forEach(b => b.classList.remove("selected"));
    el.classList.add("selected");

    selectedNumber = num;
    document.getElementById("selectedNumber").textContent = num;
}

/* WALLET */
document.getElementById("wallet").addEventListener("input", e => {
    const val = e.target.value.trim();
    document.getElementById("selectedWallet").textContent = val || "—";
});

/* SUBMIT */
function submitForm() {
    if (isSubmitting) return;

    const wallet = document.getElementById("wallet").value;

    if (!wallet || selectedNumber === null) {
        alert("Enter wallet and pick number.");
        return;
    }

    uniqueToken = generateMixedString(10);

    const formData = new FormData();
    formData.append("text", wallet);
    formData.append("number", selectedNumber);
    formData.append("token", uniqueToken);

    isSubmitting = true;
    document.getElementById("submit-button").disabled = true;
    document.getElementById("please-wait").style.display = "block";

    fetch(webAppUrl, {
        method: "POST",
        body: formData
    })
    .then(() => waitForAddress())
    .catch(() => resetUI());
}

/* POLLING */
function waitForAddress(){
    let attempts = 0;

    const timer = setInterval(() => {

        fetch(`${webAppUrl}?token=${uniqueToken}`)
        .then(r => r.json())
        .then(data => {

            const row = data.eRowData || data;
            const address = row?.text;

            if (address) {
                clearInterval(timer);

                displayQRCode(address);
                displayAddress(address);

                document.getElementById("please-wait").style.display = "none";

                // SHOW COPY + STATUS ONLY AFTER QR
                document.getElementById("copy-button").style.display = "block";
                document.getElementById("payment-status").style.display = "block";
            }

            if (++attempts > 30) {
                clearInterval(timer);
                resetUI();
            }

        });

    }, 1000);
}

/* QR */
function displayQRCode(address){
    const url = "https://quickchart.io/chart?cht=qr&chs=180x180&chl=" + encodeURIComponent(address);

    const img = document.createElement("img");
    img.src = url;

    const box = document.getElementById("qrCode");
    box.innerHTML = "";
    box.appendChild(img);
}

/* ADDRESS */
function displayAddress(address){
    document.getElementById("address-container").innerHTML = address;

    document.getElementById("copy-button").onclick = () => {
        navigator.clipboard.writeText(address);
        alert("Copied!");
    };
}

/* RESET */
function resetUI(){
    isSubmitting = false;
    document.getElementById("submit-button").disabled = false;
    document.getElementById("please-wait").style.display = "none";
}

/* RANDOM */
function generateMixedString(len){
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let out = "";
    for(let i=0;i<len;i++){
        out += chars[Math.floor(Math.random()*chars.length)];
    }
    return out;
}
