/* ================================
   ELEMENTS
================================ */

const steps = [
    "step1",
    "step2",
    "step3",
    "step4",
    "step5",
    "payment",
    "final"
];

const intro = document.getElementById("intro");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const noMessage = document.getElementById("noMessage");
const questionArea = document.getElementById("questionArea");

let selectedVibe = "";
let selectedDate = "";
let selectedTime = "";
let noMoveCount = 0;
let messageTimer;


/* ================================
   INTRO / ENVELOPE
================================ */

const INTRO_DURATION = 5200;

setTimeout(() => {
    intro.classList.add("hide");
    showStep("step1");
}, INTRO_DURATION);


/* ================================
   STEP CONTROL
================================ */

function showStep(id) {
    steps.forEach(stepId => {
        document.getElementById(stepId).classList.add("hidden");
    });

    const current = document.getElementById(id);
    current.classList.remove("hidden");
    current.classList.remove("fade");

    void current.offsetWidth;
    current.classList.add("fade");
}


/* ================================
   NO BUTTON
================================
   The NO button is permanently kept
   inside the visible viewport.

   It gets candidate positions around
   the screen, then rejects anything
   inside a protected zone around YES.

   "margin" makes it avoid not only
   overlapping YES, but also being
   directly beside it.
================================ */

function getRectWithMargin(rect, margin) {
    return {
        left: rect.left - margin,
        right: rect.right + margin,
        top: rect.top - margin,
        bottom: rect.bottom + margin
    };
}

function rectanglesOverlap(a, b) {
    return (
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top
    );
}

function showNiceTry() {
    noMessage.classList.add("show");

    clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {
        noMessage.classList.remove("show");
    }, 1100);
}

function moveNoButton() {
    showNiceTry();
    noMoveCount++;

    const buttonRect = noBtn.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();

    const width = buttonRect.width;
    const height = buttonRect.height;

    const edge = 16;

    // The button cannot leave this rectangle.
    const minX = edge;
    const minY = edge;
    const maxX = Math.max(edge, window.innerWidth - width - edge);
    const maxY = Math.max(edge, window.innerHeight - height - edge);

    // A generous protected area around YES.
    const protectedYes = getRectWithMargin(yesRect, 90);

    const candidates = [];

    // Deliberately useful locations first.
    candidates.push(
        { x: 24, y: 24 },                                      // top-left
        { x: maxX, y: 24 },                                    // top-right
        { x: 24, y: maxY },                                    // bottom-left
        { x: maxX, y: maxY },                                  // bottom-right
        { x: (window.innerWidth - width) / 2, y: 24 },         // top-center
        { x: (window.innerWidth - width) / 2, y: maxY },       // bottom-center
        { x: 24, y: (window.innerHeight - height) / 2 },       // left-center
        { x: maxX, y: (window.innerHeight - height) / 2 }      // right-center
    );

    // Add random candidates for variety.
    for (let i = 0; i < 80; i++) {
        candidates.push({
            x: minX + Math.random() * Math.max(0, maxX - minX),
            y: minY + Math.random() * Math.max(0, maxY - minY)
        });
    }

    // Shuffle so repeated attempts don't always use the same path.
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    let safe = null;

    for (const candidate of candidates) {
        const proposed = {
            left: candidate.x,
            top: candidate.y,
            right: candidate.x + width,
            bottom: candidate.y + height
        };

        if (
            proposed.left < minX ||
            proposed.top < minY ||
            proposed.right > window.innerWidth - edge ||
            proposed.bottom > window.innerHeight - edge
        ) {
            continue;
        }

        if (!rectanglesOverlap(proposed, protectedYes)) {
            safe = candidate;
            break;
        }
    }

    /*
       If the viewport is extremely small and all candidates
       are rejected, force it to a safe top/bottom location.
       Clamp ensures it NEVER disappears off-screen.
    */
    if (!safe) {
        const topOption = { x: maxX, y: minY };
        const bottomOption = { x: maxX, y: maxY };

        safe = !rectanglesOverlap({
            left: topOption.x,
            top: topOption.y,
            right: topOption.x + width,
            bottom: topOption.y + height
        }, protectedYes) ? topOption : bottomOption;
    }

    safe.x = Math.max(minX, Math.min(safe.x, maxX));
    safe.y = Math.max(minY, Math.min(safe.y, maxY));

    noBtn.style.position = "fixed";
    noBtn.style.left = `${Math.round(safe.x)}px`;
    noBtn.style.top = `${Math.round(safe.y)}px`;

    // Little bounce whenever it escapes.
    noBtn.animate(
        [
            { transform: "scale(.85) rotate(-5deg)" },
            { transform: "scale(1.08) rotate(4deg)" },
            { transform: "scale(1) rotate(0deg)" }
        ],
        {
            duration: 220,
            easing: "ease-out"
        }
    );
}


/*
   Desktop: escape when pointer approaches.
   Pointerdown: escape before click can happen.
   Click: also escape as a final fallback.
*/
noBtn.addEventListener("pointerenter", moveNoButton);

noBtn.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    moveNoButton();
});

noBtn.addEventListener("click", (event) => {
    event.preventDefault();
    moveNoButton();
});


/*
   If the browser resizes, clamp the current position
   back into the viewport.
*/
window.addEventListener("resize", () => {
    if (noBtn.style.position === "fixed") {
        const rect = noBtn.getBoundingClientRect();

        const x = Math.max(
            12,
            Math.min(rect.left, window.innerWidth - rect.width - 12)
        );

        const y = Math.max(
            12,
            Math.min(rect.top, window.innerHeight - rect.height - 12)
        );

        noBtn.style.left = `${x}px`;
        noBtn.style.top = `${y}px`;
    }
});


/* ================================
   YES
================================ */

yesBtn.addEventListener("click", () => {
    launchConfetti(90);
    showStep("step2");
});


/* ================================
   STEP 2 → DATE
================================ */

document.getElementById("nextDate").addEventListener("click", () => {
    showStep("step3");
});


/* ================================
   DATE + TIME
================================ */

const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");
const continueDate = document.getElementById("continueDate");

const today = new Date().toISOString().split("T")[0];
dateInput.min = today;

function validateDateForm() {
    selectedDate = dateInput.value;
    selectedTime = timeInput.value;

    continueDate.disabled = !(selectedDate && selectedTime);
}

dateInput.addEventListener("change", validateDateForm);
timeInput.addEventListener("change", validateDateForm);

continueDate.addEventListener("click", () => {
    if (!selectedDate || !selectedTime) return;
    showStep("step4");
});


/* ================================
   VIBE
================================ */

const vibeButtons = document.querySelectorAll(".vibe");
const confirmVibe = document.getElementById("confirmVibe");

vibeButtons.forEach(button => {
    button.addEventListener("click", () => {
        vibeButtons.forEach(item => item.classList.remove("selected"));
        button.classList.add("selected");

        selectedVibe = button.dataset.vibe;
        confirmVibe.disabled = false;
    });
});


/* ================================
   CONFIRMATION
================================ */

confirmVibe.addEventListener("click", () => {
    if (!selectedVibe) return;

    const dateObject = new Date(`${selectedDate}T12:00:00`);

    const formattedDate = dateObject.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });

    document.getElementById("finalDate").textContent = formattedDate;
    document.getElementById("finalTime").textContent = selectedTime;
    document.getElementById("finalVibe").textContent = selectedVibe;

    // Fill the mock payment ticket too.
    document.getElementById("payDate").textContent = formattedDate;
    document.getElementById("payTime").textContent = selectedTime;
    document.getElementById("payVibe").textContent = selectedVibe;

    launchConfetti(70);
    showStep("step5");
});


/* ================================
   PAYMENT
================================ */

document.getElementById("paymentBtn").addEventListener("click", () => {
    showStep("payment");
});

document.getElementById("payBtn").addEventListener("click", () => {
    document.getElementById("finalDate2").textContent =
        document.getElementById("finalDate").textContent;

    document.getElementById("finalTime2").textContent =
        document.getElementById("finalTime").textContent;

    document.getElementById("finalVibe2").textContent = selectedVibe;

    launchConfetti(120);

    setTimeout(() => {
        showStep("final");
        launchConfetti(80);
    }, 650);
});


/* ================================
   FLOATING HEARTS
================================ */

const hearts = document.getElementById("hearts");
const heartSymbols = ["❤️", "💖", "💕", "💗", "💘", "💝", "✨"];

function createHeart() {
    const heart = document.createElement("div");

    heart.className = "heart";
    heart.textContent = heartSymbols[
        Math.floor(Math.random() * heartSymbols.length)
    ];

    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.fontSize = `${15 + Math.random() * 25}px`;
    heart.style.animationDuration = `${5 + Math.random() * 5}s`;

    hearts.appendChild(heart);

    setTimeout(() => heart.remove(), 10000);
}

setInterval(createHeart, 750);


/* ================================
   CONFETTI
================================ */

function launchConfetti(count = 80) {
    const container = document.getElementById("confetti");
    const symbols = ["🎉", "💖", "💕", "✨", "🎊", "❤️", "🥳", "💝"];

    for (let i = 0; i < count; i++) {
        const piece = document.createElement("div");

        piece.className = "confetti";
        piece.textContent = symbols[
            Math.floor(Math.random() * symbols.length)
        ];

        piece.style.left = `${Math.random() * 100}vw`;
        piece.style.fontSize = `${12 + Math.random() * 20}px`;
        piece.style.animationDuration = `${2 + Math.random() * 2}s`;

        container.appendChild(piece);

        setTimeout(() => piece.remove(), 4500);
    }
}
