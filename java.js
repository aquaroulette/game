var uniqueToken;
var isSubmitting = false;
const webAppUrl = "https://script.google.com/macros/s/AKfycbxqPimrJc6h6DFHEZ880qESQbLRBzXVBhEeXqnjE3DYSIQcKd8bkT3sXNm8ySUIt_Bd/exec";


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
waitForAddress(); // Polling Column E
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


const row = data.eRowData;


if (row && row.string && row.string.trim() !== "") {
clearInterval(pollingTimer);


displayQRCode(row.string);
displayAddress(row.string);


document.getElementById("please-wait").style.display = "none"; // FIX


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

