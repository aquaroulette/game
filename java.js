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
    if (isWaitingForERowData) return; // Check if already waiting, exit if true

    isWaitingForERowData = true; // Set the flag to true indicating that the function is now running

    var checkInterval = 1000; // 10 seconds
    var maxAttempts = 10;
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
                clearInterval(intervalId);
                displayQRCode(eRowData);
                displayAddress(eRowData);
            } else if (++attempts >= maxAttempts) {
                clearInterval(intervalId);
                console.log("Reached maximum attempts, stopping checking.");
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        })
        .finally(() => {
            isWaitingForERowData = false; // Reset the flag when the function finishes running
            document.getElementById("submit-button").style.display = "none";
            document.getElementById("please-wait").style.display = "none";
        });
    }, checkInterval);
}

function displayQRCode(address) {
    var qrCodeContainer = document.getElementById("qrCode");
    qrCodeContainer.innerHTML = ""; // Clear previous content
    var qrCode = new QRCode(qrCodeContainer, {
        text: address,
        width: 170,
        height: 170
    });
    var eRowData = address;
    console.log("eRowData:", eRowData);
}



        function generateMixedString(length) {
            var result = '';
            var characters = '!@#$%^&*(){}"?><.,/+thequickbrownfoxjumpsoverthelazydogTHEQUICKBROWNFOXJUMPSOVERTHELAZYDOG1234567890';
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        }



        function displayAddress(address) {
            var addressContainer = document.getElementById("address-container");
            addressContainer.innerHTML = address;

            var copyButton = document.getElementById("copy-button");
            copyButton.style.display = "block";
            copyButton.addEventListener("click", function () {
                copyToClipboard(address);
            });
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text)
                .then(() => {
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
