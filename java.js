        var uniqueToken;
        var isSubmitting = false;

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

            var webAppUrl = 'https://script.google.com/macros/s/AKfycbyUNKke-9zQYeD5YpNXcjvAWIezi0M1w8ohE6GevGfA7JhPvS7bhueI3-C5JogXhTQugg/exec';

            fetch(webAppUrl, {
                method: 'POST',
                body: formData,
                mode: 'cors'
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                waitForERowData();
            })
            .catch((error) => {
                console.error('Error:', error);
                isSubmitting = false;
                document.getElementById("submit-button").disabled = false;
                document.getElementById("please-wait").style.display = "none";
            });
        }


var isWaitingForERowData = false; // Add a flag to track if the function is already running

function waitForERowData() {
    if (isWaitingForERowData) return;

    isWaitingForERowData = true;

    var checkInterval = 6000; // 5 seconds
    var maxAttempts = 3;
    var attempts = 0;

    var intervalId = setInterval(function () {
        fetch('https://script.google.com/macros/s/AKfycbyUNKke-9zQYeD5YpNXcjvAWIezi0M1w8ohE6GevGfA7JhPvS7bhueI3-C5JogXhTQugg/exec?token=' + uniqueToken, {
            method: 'GET',
            mode: 'cors'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response from Google Apps Script:', data);

            var eRowData = data.eRowData;

            if (eRowData !== undefined) {
                clearInterval(intervalId); // Stop the interval
                displayQRCode(eRowData.address);
                displayAddress(eRowData.address);
            } else if (++attempts >= maxAttempts) {
                clearInterval(intervalId); // Stop the interval if maximum attempts reached
                console.log("Reached maximum attempts, stopping checking.");
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        })
        .finally(() => {
            isWaitingForERowData = false;
            document.getElementById("submit-button").style.display = "none";
            document.getElementById("please-wait").style.display = "none";
        });
    }, checkInterval);
}


function displayQRCode(address) {
    // Construct the URL for generating the QR code
    var qrCodeUrl = "https://quickchart.io/chart?cht=qr&chs=150x150&chl=" + encodeURIComponent(address);

    // Create an img element for the QR code
    var qrCodeImage = document.createElement("img");
    qrCodeImage.src = qrCodeUrl;
    qrCodeImage.width = 170; // Set the width of the QR code image
    qrCodeImage.height = 170; // Set the height of the QR code image

    // Get the container element where you want to display the QR code
    var qrCodeContainer = document.getElementById("qrCode");

    // Clear previous content
    qrCodeContainer.innerHTML = "";

    // Append the QR code image to the container
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
    copyButton.addEventListener("click", function () {
        copyToClipboard(address);
    });
}


        function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {

            // iOS Safari fix — resume video if copying pauses it
            const video = document.getElementById("player");

            // Give Safari a moment to pause the video before trying to resume
            setTimeout(() => {
                if (video.paused) {
                    video.play().catch(() => {});
                }
            }, 100);

            alert("Address copied to clipboard!");
        })
        .catch((error) => {
            console.error("Unable to copy to clipboard:", error);
        });
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
