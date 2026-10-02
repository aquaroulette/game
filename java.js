javascript
var uniqueToken;
var isSubmitting = false;

const webAppUrl =
    "https://script.google.com/macros/s/AKfycbyQhECOQe_wvA5Jsho6Y9c7uJ8qLlArgFFlonofPM8qANdywkroBstTMjoUOk1G4IBM/exec";


let selectedNumber = null;


/* =========================================================
   STREAM
========================================================= */

const video =
    document.getElementById("player");


const streamURL =
    "https://live.aquaroulette.com/hls/stream.m3u8";


video.muted = true;
video.autoplay = true;
video.playsInline = true;


if (Hls.isSupported()) {

    const hls = new Hls({
        liveDurationInfinity: true
    });


    hls.loadSource(streamURL);

    hls.attachMedia(video);


    hls.on(
        Hls.Events.MANIFEST_PARSED,
        () => {

            video.play().catch(err => {

                console.log(
                    "Autoplay blocked:",
                    err
                );

            });

        }
    );

} else if (
    video.canPlayType(
        "application/vnd.apple.mpegurl"
    )
) {

    video.src = streamURL;


    video.addEventListener(
        "loadedmetadata",
        () => {

            video.play().catch(err => {

                console.log(
                    "Autoplay blocked:",
                    err
                );

            });

        }
    );

}


/* =========================================================
   ROULETTE
========================================================= */

const redNumbers = [

    1, 3, 5, 7, 9,
    12, 14, 16, 18,
    19, 21, 23, 25,
    27, 30, 32, 34, 36

];


const grid =
    document.getElementById("grid");


/*
   CREATE NUMBERS 1 - 36
*/

for (
    let i = 1;
    i <= 36;
    i++
) {

    const btn =
        document.createElement("button");


    btn.classList.add("ball");


    btn.classList.add(
        redNumbers.includes(i)
            ? "red"
            : "black"
    );


    btn.dataset.number = i;

    btn.textContent = i;


    btn.onclick = () => {

        selectNumber(btn, i);

    };


    grid.appendChild(btn);

}


/*
   ZERO BUTTON
*/

document
    .querySelector(".green")
    .onclick = () => {

        selectNumber(
            document.querySelector(".green"),
            0
        );

    };


/* =========================================================
   SELECT NUMBER
========================================================= */

function selectNumber(el, num){

    /*
       Do nothing if the roulette
       has already been submitted.
    */

    if (isSubmitting) {
        return;
    }


    /*
       Remove previous selection.
    */

    document
        .querySelectorAll(".ball")
        .forEach(ball => {

            ball.classList.remove("selected");

        });


    /*
       Highlight new selection.
    */

    el.classList.add("selected");


    /*
       Store selected number.
    */

    selectedNumber = num;


    /*
       Display selected number.
    */

    document
        .getElementById("selectedNumber")
        .textContent = num;

}


/* =========================================================
   LOCK ROULETTE
========================================================= */

function lockSelection(){

    document
        .querySelectorAll(".ball")
        .forEach(ball => {

            ball.disabled = true;

            ball.style.cursor =
                "not-allowed";

        });

}


/* =========================================================
   UNLOCK ROULETTE
========================================================= */

function unlockSelection(){

    document
        .querySelectorAll(".ball")
        .forEach(ball => {

            ball.disabled = false;

            ball.style.cursor =
                "pointer";

        });

}


/* =========================================================
   WALLET
========================================================= */

document
    .getElementById("wallet")
    .addEventListener(
        "input",
        e => {

            /*
               Do not allow wallet display
               to change after submission.
            */

            if (isSubmitting) {
                return;
            }


            const val =
                e.target.value.trim();


            document
                .getElementById("selectedWallet")
                .textContent =
                    val || "—";

        }
    );


/* =========================================================
   SUBMIT
========================================================= */

function submitForm(){

    /*
       Prevent double submission.
    */

    if (isSubmitting) {
        return;
    }


    const wallet =
        document
            .getElementById("wallet")
            .value
            .trim();


    /*
       Make sure wallet and number
       have been selected.
    */

    if (
        !wallet ||
        selectedNumber === null
    ) {

        alert(
            "Enter wallet and pick number."
        );

        return;
    }


    /*
       Generate unique token.
    */

    uniqueToken =
        generateMixedString(10);


    /*
       Create form data.
    */

    const formData =
        new FormData();


    formData.append(
        "text",
        wallet
    );


    formData.append(
        "number",
        selectedNumber
    );


    formData.append(
        "token",
        uniqueToken
    );


    /*
       IMPORTANT:
       Lock everything BEFORE
       sending the request.

       This means the selected number
       cannot be changed after Submit.
    */

    isSubmitting = true;


    lockSelection();


    /*
       Lock wallet input too.
    */

    document
        .getElementById("wallet")
        .disabled = true;


    /*
       Disable Submit button.
    */

    const submitButton =
        document.getElementById(
            "submit-button"
        );


    submitButton.disabled = true;

    submitButton.textContent =
        "Submitted";


    /*
       Show waiting message.
    */

    document
        .getElementById("please-wait")
        .style.display = "block";


    /*
       Send data.
    */

    fetch(
        webAppUrl,
        {
            method: "POST",
            body: formData
        }
    )
    .then(() => {

        waitForAddress();

    })
    .catch(() => {

        resetUI();

    });

}


/* =========================================================
   POLLING
========================================================= */

function waitForAddress(){

    let attempts = 0;


    const timer =
        setInterval(() => {

            fetch(
                `${webAppUrl}?token=${uniqueToken}`
            )

            .then(r => r.json())

            .then(data => {

                const row =
                    data.eRowData || data;


                const address =
                    row?.text;


                if (address) {

                    clearInterval(timer);


                    displayQRCode(
                        address
                    );


                    displayAddress(
                        address
                    );


                    document
                        .getElementById(
                            "please-wait"
                        )
                        .style.display =
                            "none";


                    /*
                       Show copy button.
                    */

                    document
                        .getElementById(
                            "copy-button"
                        )
                        .style.display =
                            "block";


                    /*
                       Show payment status.
                    */

                    document
                        .getElementById(
                            "payment-status"
                        )
                        .style.display =
                            "block";

                }


                /*
                   Stop polling after
                   30 attempts.
                */

                if (++attempts > 30) {

                    clearInterval(timer);

                    resetUI();

                }

            })

            .catch(() => {

                /*
                   Ignore temporary polling
                   errors and keep trying.
                */

            });

        }, 1000);

}


/* =========================================================
   QR CODE
========================================================= */

function displayQRCode(address){

    const url =
        "https://quickchart.io/chart" +
        "?cht=qr" +
        "&chs=180x180" +
        "&chl=" +
        encodeURIComponent(address);


    const img =
        document.createElement("img");


    img.src = url;


    img.alt =
        "Dogecoin payment QR code";


    const box =
        document.getElementById(
            "qrCode"
        );


    box.innerHTML = "";


    box.appendChild(img);

}


/* =========================================================
   ADDRESS
========================================================= */

function displayAddress(address){

    document
        .getElementById(
            "address-container"
        )
        .textContent = address;


    document
        .getElementById(
            "copy-button"
        )
        .onclick = () => {

            navigator.clipboard
                .writeText(address)
                .then(() => {

                    alert("Copied!");

                })
                .catch(() => {

                    alert(
                        "Unable to copy address."
                    );

                });

        };

}


/* =========================================================
   RESET
========================================================= */

function resetUI(){

    /*
       Allow another submission.
    */

    isSubmitting = false;


    /*
       Enable Submit.
    */

    const submitButton =
        document.getElementById(
            "submit-button"
        );


    submitButton.disabled = false;

    submitButton.textContent =
        "Submit";


    /*
       Hide waiting message.
    */

    document
        .getElementById(
            "please-wait"
        )
        .style.display =
            "none";


    /*
       Unlock roulette.
    */

    unlockSelection();


    /*
       Unlock wallet.
    */

    document
        .getElementById(
            "wallet"
        )
        .disabled = false;

}


/* =========================================================
   RANDOM TOKEN
========================================================= */

function generateMixedString(len){

    const chars =
        "abcdefghijklmnopqrstuvwxyz" +
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
        "1234567890";


    let out = "";


    for (
        let i = 0;
        i < len;
        i++
    ){

        out += chars[
            Math.floor(
                Math.random() *
                chars.length
            )
        ];

    }


    return out;

}
