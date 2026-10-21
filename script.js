
const SECRET_PIN = "2210"; 

// Danh sách ảnh bay ra từ hộp quà (mặc định dùng ảnh của bạn, nếu có thêm ảnh khác bạn có thể điền thêm vào mảng này)
const PHOTO_LIST = [
    "Messenger_creation_2D5D99DF-D751-4083-9B99-0C802928CC0B.jpeg",
    "Messenger_creation_9A072B78-27DD-4DCB-9C45-C89ADD25A7B1.jpeg",
    "Messenger_creation_30A1C457-3CEC-423D-AAA7-92E9DA932DB9.jpeg",
    "Messenger_creation_96EC1CF0-51C0-4EA4-90F7-7F9BF9F0F6B6.jpeg",
    "Messenger_creation_559E31E9-1FCE-4C8A-BA36-A1A3A698251F.jpeg",
    "Messenger_creation_845FE778-AABA-46F9-A7C6-207CF68A2DDE.jpeg"
];

const WISH_MESSAGE = "Em ơi,\n\nChúc mừng sinh nhật tuổi 16 rực rỡ nhất của công chúa anh thương! 🎂✨\n\nBước sang tuổi 17, chúc em luôn xinh đẹp, ngập tràn niềm vui, tiếng cười và hạnh phúc. Cảm ơn em vì đã đến bên anh và làm cho thế giới của anh trở nên dịu dàng, ấm áp hơn biết bao.\n\nMọi điều ước tuổi mới của em nhất định sẽ thành hiện thực nhé!";

let currentPin = "";
let charIndex = 0;
let isBlown = false;
let photoDropInterval = null;
let noClickCount = 0;
let boxOpened = false;

const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const dots = document.querySelectorAll("#pinDots span");

// Tự động đặt số mật khẩu vào dưới lớp vé cào
document.getElementById("ticketSecretText").innerText = `🎂 ${SECRET_PIN} 🎂`;

// =======================================================
// 1. MÀN HÌNH KHÓA MẬT KHẨU
// =======================================================
function pressKey(num) {
    if (currentPin.length < 4) {
        currentPin += num;
        updateDots();
        if (currentPin.length === 4) {
            setTimeout(checkPin, 200);
        }
    }
}

function deleteLast() {
    currentPin = currentPin.slice(0, -1);
    updateDots();
}

function clearPin() {
    currentPin = "";
    updateDots();
}

function updateDots() {
    dots.forEach((dot, index) => {
        dot.classList.toggle("filled", index < currentPin.length);
    });
}

function checkPin() {
    if (currentPin === SECRET_PIN) {
        music.volume = 0.85;
        music.play().then(() => {
            musicBtn.innerHTML = "🎵 Đang phát nhạc";
        }).catch(() => {
            musicBtn.innerHTML = "🔇 Chạm để bật nhạc";
        });
        musicBtn.style.display = "inline-block";

        // Sang Trang 2: Bánh kem số 17
        document.getElementById("lockScreen").classList.remove("active");
        document.body.classList.add("dark-room");
        document.getElementById("cakeScreen").classList.add("active");

        startFallingPhotos();
    } else {
        const pinContainer = document.getElementById("pinDots");
        document.getElementById("lockHint").innerText = "Sai mật khẩu rồi! Ấn vào bóng đèn 💡 góc trên để cào vé lấy mật khẩu nhé!";
        document.getElementById("lockHint").style.color = "#e91e63";
        pinContainer.classList.add("shake");
        setTimeout(() => {
            pinContainer.classList.remove("shake");
            clearPin();
        }, 450);
    }
}

// =======================================================
// 2. VÉ CÀO TRÚNG THƯỞNG (KHI ẤN BÓNG ĐÈN 💡)
// =======================================================
const scratchCanvas = document.getElementById("scratchCanvas");
const sCtx = scratchCanvas.getContext("2d");
let isDrawing = false;

function initScratchCard() {
    sCtx.globalCompositeOperation = "source-over";
    const grad = sCtx.createLinearGradient(0, 0, scratchCanvas.width, scratchCanvas.height);
    grad.addColorStop(0, "#cfd8dc");
    grad.addColorStop(0.5, "#eceff1");
    grad.addColorStop(1, "#b0bec5");
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

    sCtx.fillStyle = "#546e7a";
    sCtx.font = "bold 14px Quicksand, sans-serif";
    sCtx.textAlign = "center";
    sCtx.fillText("✨ CÀO LỚP NHŨ NÀY ✨", scratchCanvas.width / 2, 42);
    sCtx.font = "12px Quicksand, sans-serif";
    sCtx.fillText("(Dùng tay chà qua lại)", scratchCanvas.width / 2, 62);
}

function openScratchModal() {
    document.getElementById("ticketModal").classList.add("show");
    initScratchCard();
}

function closeScratchModal() {
    document.getElementById("ticketModal").classList.remove("show");
}

function scratch(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const rect = scratchCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    sCtx.globalCompositeOperation = "destination-out";
    sCtx.beginPath();
    sCtx.arc(clientX - rect.left, clientY - rect.top, 20, 0, Math.PI * 2);
    sCtx.fill();
}

scratchCanvas.addEventListener("mousedown", () => isDrawing = true);
window.addEventListener("mouseup", () => isDrawing = false);
scratchCanvas.addEventListener("mousemove", scratch);
scratchCanvas.addEventListener("touchstart", (e) => { isDrawing = true; scratch(e); }, { passive: false });
window.addEventListener("touchend", () => isDrawing = false);
scratchCanvas.addEventListener("touchmove", scratch, { passive: false });

// =======================================================
// 3. ẢNH RƠI NHẸ NHÀNG XUNG QUANH BÁNH KEM SỐ 17
// =======================================================
function createFallingPhoto() {
    const container = document.getElementById("fallingPhotosContainer");
    const photoWrap = document.createElement("div");
    photoWrap.classList.add("mini-photo-drop");

    const img = document.createElement("img");
    img.src = PHOTO_LIST[0];
    img.onerror = function() { this.src = "avatar.jpg"; };
    photoWrap.appendChild(img);

    photoWrap.style.left = (Math.random() * 86 + 4) + "vw";
    const duration = Math.random() * 3 + 8;
    photoWrap.style.animationDuration = duration + "s";

    container.appendChild(photoWrap);
    setTimeout(() => photoWrap.remove(), duration * 1000);
}

function startFallingPhotos() {
    if (photoDropInterval) return;
    createFallingPhoto();
    photoDropInterval = setInterval(createFallingPhoto, 1800);
}

function stopFallingPhotos() {
    clearInterval(photoDropInterval);
    photoDropInterval = null;
    document.getElementById("fallingPhotosContainer").innerHTML = "";
}

// =======================================================
// 4. THỔI TẮT NẾN SỐ 17 -> HIỆN THÔNG BÁO "BẠN CÓ QUÀ"
// =======================================================
function blowOutCandle17() {
    if (isBlown) return;
    isBlown = true;

    const blowBtn = document.getElementById("blowBtn");
    blowBtn.innerText = "🌬️ Phùuuu...";
    blowBtn.style.opacity = "0.7";

    document.getElementById("windEffect").classList.add("blowing");

    setTimeout(() => {
        document.getElementById("flame1").classList.add("wind-blown");
        document.getElementById("flame2").classList.add("wind-blown");
        document.getElementById("candleGlow").style.opacity = "0";
        document.getElementById("smoke1").classList.add("puff");
        document.getElementById("smoke2").classList.add("puff");
    }, 350);

    // Sau khi nến tắt -> Hiện bảng hỏi "Bạn có quà!"
    setTimeout(() => {
        document.getElementById("giftPromptModal").classList.add("show");
    }, 1400);
}

// Danh sách câu làm nũng khi người yêu ấn nút "Không"
const poutMessages = [
    { icon: "🥺👉👈", text: "Ơ kìaaa... Anh chuẩn bị hộp quà này tâm huyết lắm luôn á, ấn nút Có đi màaa! 🥺" },
    { icon: "😭💔", text: "Huhu không nhận quà là anh buồn khóc ngập lụt bây giờ đóoo! Chọn Có đi công chúaaa 😭" },
    { icon: "😤💢", text: "Không cho ấn Không đâu nha! Bắt buộc phải nhận quà sinh nhật của anh cơ! 😤💖" },
    { icon: "🧸💖", text: "Ngoan nào công chúa ơi, ấn vào nút 'Có chứ 💖' to đùng bên cạnh đi nèee! 🥰✨" }
];

function rejectGift() {
    const item = poutMessages[noClickCount % poutMessages.length];
    noClickCount++;

    document.getElementById("promptEmoji").innerText = item.icon;
    const poutText = document.getElementById("poutText");
    poutText.innerText = item.text;
    poutText.style.color = "#d81b60";
    poutText.style.fontWeight = "700";

    // Phóng to nút Có và thu nhỏ nút Không
    const btnYes = document.getElementById("btnYes");
    const btnNo = document.getElementById("btnNo");
    const scaleYes = Math.min(1 + noClickCount * 0.14, 1.55);
    const scaleNo = Math.max(1 - noClickCount * 0.12, 0.55);
    btnYes.style.transform = `scale(${scaleYes})`;
    btnNo.style.transform = `scale(${scaleNo})`;

    // Rung nhẹ thẻ làm nũng
    const card = document.getElementById("promptCard");
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
}

function acceptGift() {
    document.getElementById("giftPromptModal").classList.remove("show");
    document.getElementById("cakeScreen").classList.remove("active");
    document.body.classList.remove("dark-room");
    stopFallingPhotos();

    // Chuyển sang Trang 3: Hộp quà ở giữa màn hình
    document.getElementById("giftScene").classList.add("active");
    startFireworks();
}

// =======================================================
// 5. HỘP QUÀ RƠI MỞ NẮP -> TUNG ẢNH -> HIỆN THIỆP & LỜI CHÚC
// =======================================================
function openGiftBox() {
    if (boxOpened) return;
    boxOpened = true;

    document.getElementById("giftHint").style.display = "none";
    const giftBox = document.getElementById("giftBoxWrapper");

    // Bước 1: Hộp quà từ từ rơi xuống đáy màn hình
    giftBox.classList.add("dropped");

    // Bước 2: Mở tung nắp hộp quà & ảnh lần lượt bay ra ngoài
    setTimeout(() => {
        giftBox.classList.add("opened");
        ejectPhotosSequence();
    }, 850);
}

function ejectPhotosSequence() {
    const area = document.getElementById("ejectedPhotosArea");
    const borderColors = ["#ffca28", "#ff6b95", "#4dd0e1", "#ba68c8", "#ff8a65", "#81c784"];

    // Tọa độ các tấm ảnh bay lên rồi đáp xuống xung quanh giống ảnh mẫu
    const targetPositions = [
        { x: -110, y: -270, rot: -16 },
        { x: 95,   y: -250, rot: 14 },
        { x: -45,  y: -210, rot: -10 },
        { x: 105,  y: -175, rot: 20 },
        { x: -115, y: -145, rot: -18 },
        { x: 20,   y: -285, rot: 8 }
    ];

    PHOTO_LIST.forEach((src, idx) => {
        setTimeout(() => {
            const card = document.createElement("div");
            card.className = "flying-photo";
            card.style.border = `3.5px solid ${borderColors[idx % borderColors.length]}`;

            const img = document.createElement("img");
            img.src = src;
            img.onerror = function() { this.src = "avatar.jpg"; };
            card.appendChild(img);
            area.appendChild(card);

            const pos = targetPositions[idx % targetPositions.length];

            // Bay vọt từ trong hộp quà lên giữa không trung (Giống ảnh 2)
            requestAnimationFrame(() => {
                card.style.opacity = "1";
                card.style.transform = `translate(calc(-50% + ${pos.x}px), ${pos.y}px) rotate(${pos.rot}deg) scale(1.05)`;
            });

            // Sau 1.3 giây, ảnh nhẹ nhàng rớt xuống góc dưới để nhường chỗ cho tấm thiệp
            setTimeout(() => {
                const settleX = (idx % 2 === 0 ? -1 : 1) * (50 + (idx * 22));
                const settleY = -20 - (idx * 18);
                card.style.transform = `translate(calc(-50% + ${settleX}px), ${settleY}px) rotate(${pos.rot * 1.2}deg) scale(0.75)`;
                card.classList.add("settled");
            }, 1350);

        }, idx * 550);
    });

    // Bước 3: Sau khi hết ảnh -> Hiện tấm thiệp phong bì ở giữa màn hình (Giống ảnh 3)
    const totalWait = PHOTO_LIST.length * 550 + 1300;
    setTimeout(() => {
        document.getElementById("floatingEnvelope").classList.add("show");
    }, totalWait);
}

// Bước 4: Ấn vào tấm thiệp phong bì -> Hiện tờ thư chúc mừng (Giống ảnh 4)
function openFinalLetter() {
    document.getElementById("floatingEnvelope").classList.remove("show");
    document.getElementById("finalLetterCard").classList.add("show");
    setTimeout(typeWriter, 400);
}

function typeWriter() {
    if (charIndex < WISH_MESSAGE.length) {
        document.getElementById("typewriterText").textContent += WISH_MESSAGE.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 38);
    } else {
        document.getElementById("signatureText").style.opacity = "1";
    }
}

function toggleMusic() {
    if (music.paused) {
        music.play();
        musicBtn.innerHTML = "🎵 Đang phát nhạc";
    } else {
        music.pause();
        musicBtn.innerHTML = "🔇 Đã tắt nhạc";
    }
}

// =======================================================
// 6. HIỆU ỨNG PHÁO HOA NỀN NHẸ NHÀNG (CANVAS FIREWORKS)
// =======================================================
const fwCanvas = document.getElementById("fireworks");
const fCtx = fwCanvas.getContext("2d");
let particles = [];
let fwRunning = false;

function resizeFw() {
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeFw);
resizeFw();

function createFireworkBurst() {
    const x = Math.random() * fwCanvas.width * 0.8 + fwCanvas.width * 0.1;
    const y = Math.random() * fwCanvas.height * 0.5 + fwCanvas.height * 0.1;
    const colors = ["#ff80ab", "#ffca28", "#80d8ff", "#ea80fc", "#ffffff"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < 22; i++) {
        const angle = (Math.PI * 2 * i) / 22;
        const speed = Math.random() * 2.2 + 0.8;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            color
        });
    }
}

function animateFireworks() {
    if (!fwRunning) return;
    fCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.alpha -= 0.016;

        if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
        }

        fCtx.save();
        fCtx.globalAlpha = p.alpha;
        fCtx.strokeStyle = p.color;
        fCtx.lineWidth = 2;
        fCtx.beginPath();
        fCtx.moveTo(p.x, p.y);
        fCtx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
        fCtx.stroke();
        fCtx.restore();
    }
    requestAnimationFrame(animateFireworks);
}

function startFireworks() {
    if (fwRunning) return;
    fwRunning = true;
    createFireworkBurst();
    setInterval(createFireworkBurst, 1400);
    animateFireworks();
}
