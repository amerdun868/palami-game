// --- 0. ASSET LOADER ---
const imgRumput = new Image(); imgRumput.src = 'assets/rumput.png';
const imgBatu = new Image(); imgBatu.src = 'assets/setapak.png';
const imgPetiCokelat = new Image(); imgPetiCokelat.src = 'assets/chest.png';
const imgPetiEmas = new Image(); imgPetiEmas.src = 'assets/main-chest.png';
const imgNayDown = new Image(); imgNayDown.src = 'assets/nay-down.png'; // Hadap Bawah (Kamera)
const imgNayUp = new Image(); imgNayUp.src = 'assets/nay-up.png';     // Hadap Atas (Membelakangi)
const imgNayLeft = new Image(); imgNayLeft.src = 'assets/nay-left.png'; // Hadap Kiri
const imgNayRight = new Image(); imgNayRight.src = 'assets/nay-right.png'; // Hadap Kanan

// (Pastikan nama file di dalam tanda kutip 'assets/...' persis sama dengan nama file aslinya di folder)

// --- 1. STATE MANAGEMENT (Navigasi Layar) ---
const screens = {
    splash: document.getElementById('splash-screen'),
    prologue: document.getElementById('prologue-screen'),
    game: document.getElementById('game-screen'),
    credits: document.getElementById('credits-screen')
};

// Data untuk Prolog (bisa kamu ganti kata-katanya)
const prologueSlides = [
    "Halo Nay sayang <3",
    "Selamat ulang tahun beberapa hari yang lalu yaa!",
    "Ami buat tempat kecil ini khusus buat Nay.",
    "Jalan-jalan yuk di sini. Ada hal-hal baik yang Ami simpan.",
    "Siap?"
];
let currentPrologueSlide = 0;
const prologueTextElement = document.getElementById('prologue-text');
const btnNextPrologue = document.getElementById('btn-next-prologue');

// Fungsi ganti layar
/**
 * @param {string} screenName
 */
function showScreen(screenName) {
    // Sembunyikan semua layar
    Object.values(screens).forEach(s => s.classList.remove('active'));
    // Munculkan layar yang diminta
    screens[screenName].classList.add('active');
}

// Sequence Navigasi Awal
setTimeout(() => {
    // Pindah dari Splash Screen ke Prolog setelah 3 detik
    showScreen('prologue');
    prologueTextElement.innerText = prologueSlides[currentPrologueSlide];
}, 3000);

const bgm = document.getElementById('bgm');
let isBgmPlaying = false;

btnNextPrologue.addEventListener('click', () => {
    // Putar musik pada klik pertama (untuk mengakali sistem blokir autoplay browser)
    if (!isBgmPlaying) {
        bgm.volume = 0.5; // Atur volume (0.0 sampai 1.0)
        bgm.play().catch(e => console.log("Audio diblokir browser:", e));
        isBgmPlaying = true;
    }

    currentPrologueSlide++;
    if (currentPrologueSlide < prologueSlides.length) {
        prologueTextElement.innerText = prologueSlides[currentPrologueSlide];
    } else {
        showScreen('game');
        initGame(); // Mulai jalankan canvas game
    }
});

// --- 2. GAME ENGINE & PETA ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Konfigurasi Grid & Ukuran Tile
const tileSize = 64; 
let rows, cols;

// Definisi Peta (Map Array 2D)
// 0 = Rumput (Solid), 1 = Jalan Batu (Bisa jalan), 2 = Peti Foto, 3 = Peti Doa Utama
const map = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 1, 1, 1, 0, 1, 1, 1, 2, 0],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 2, 1, 1, 1, 0, 1, 1, 1, 2, 0],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0]
];

// Posisi awal Nay (ada di jalan batu bagian tengah-bawah)
let playerPos = { r: 3, c: 5 }; 

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    rows = map.length;
    cols = map[0].length;
}

// Fungsi Menggambar Peta dengan Sistem Kamera
function drawMap() {
    // 1. Hitung titik tengah karakter berdasarkan pergeseran PIXEL yang mulus
    const playerWorldX = currentPixelX + (tileSize / 2);
    const playerWorldY = currentPixelY + (tileSize / 2);

    // 2. Hitung jarak geser (offset) agar kamera selalu fokus ke karakter
    const cameraOffsetX = (canvas.width / 2) - playerWorldX;
    const cameraOffsetY = (canvas.height / 2) - playerWorldY;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const tile = map[r][c];
            // 3. Aplikasikan offset kamera ke setiap koordinat tile
            const x = (c * tileSize) + cameraOffsetX;
            const y = (r * tileSize) + cameraOffsetY;

            // Gambar Tile dengan Aset Asli
            if (tile === 0) {
                ctx.drawImage(imgRumput, x, y, tileSize, tileSize);
            } else if (tile === 1) {
                ctx.drawImage(imgBatu, x, y, tileSize, tileSize);
            } else if (tile === 2) {
                ctx.drawImage(imgBatu, x, y, tileSize, tileSize); // Gambar alas batu dulu
                ctx.drawImage(imgPetiCokelat, x, y, tileSize, tileSize); // Tumpuk dengan peti
            } else if (tile === 3) {
                ctx.drawImage(imgBatu, x, y, tileSize, tileSize); // Gambar alas batu dulu
                ctx.drawImage(imgPetiEmas, x, y, tileSize, tileSize); // Tumpuk dengan peti utama
            }
        }
    }
}

// Fungsi Menggambar Karakter (Nay) di Tengah Layar dengan 4 Arah
function drawPlayer() {
    const screenX = (canvas.width / 2) - (tileSize / 2);
    const screenY = (canvas.height / 2) - (tileSize / 2);

    let currentSprite;
    
    // Tentukan gambar mana yang dipakai berdasarkan arah terakhir
    if (facingDirection === 'up') currentSprite = imgNayUp;
    else if (facingDirection === 'down') currentSprite = imgNayDown;
    else if (facingDirection === 'left') currentSprite = imgNayLeft;
    else if (facingDirection === 'right') currentSprite = imgNayRight;

    ctx.drawImage(currentSprite, screenX, screenY, tileSize, tileSize); 
}

// Loop Render Utama
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Bersihkan frame sebelumnya
    updateMovement();
    drawMap();
    drawPlayer();
    requestAnimationFrame(gameLoop); // Panggil terus menerus
}

function initGame() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    gameLoop();
}

// Keluar Game
document.getElementById('btn-keluar').addEventListener('click', () => {
    showScreen('credits');
});

// --- 3. KONTROL & PERGERAKAN (KONTINYU & SMOOTH) ---
let isMoving = false;
let targetPos = { r: playerPos.r, c: playerPos.c };
let currentPixelX = playerPos.c * tileSize;
let currentPixelY = playerPos.r * tileSize;
let activeDirection = null; // Menyimpan arah saat tombol ditahan
let facingDirection = 'down'; // Default: saat baru main, Nay menghadap ke bawah (ke arah pemain)
const moveSpeed = 4; // Kecepatan jalan (ubah angkanya jika mau lebih cepat/lambat)

// Cek apakah tile tujuan adalah jalan batu (1)
function checkWalkable(r, c) {
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
        return map[r][c] === 1;
    }
    return false;
}

// Fungsi update pergerakan kontinyu
function updateMovement() {
    // Jika tidak sedang proses bergeser, tapi ada tombol yang ditahan
    if (!isMoving && activeDirection) {
        let nextR = playerPos.r;
        let nextC = playerPos.c;

        if (activeDirection === 'up') nextR--;
        if (activeDirection === 'down') nextR++;
        if (activeDirection === 'left') nextC--;
        if (activeDirection === 'right') nextC++;

        // Jika jalanan depannya batu, mulailah bergerak!
        if (checkWalkable(nextR, nextC)) {
            targetPos.r = nextR;
            targetPos.c = nextC;
            isMoving = true;
        }
    }

    // Animasi pergeseran pixel yang smooth
    if (isMoving) {
        let targetPixelX = targetPos.c * tileSize;
        let targetPixelY = targetPos.r * tileSize;

        // Geser perlahan ke target
        if (currentPixelX < targetPixelX) currentPixelX += moveSpeed;
        if (currentPixelX > targetPixelX) currentPixelX -= moveSpeed;
        if (currentPixelY < targetPixelY) currentPixelY += moveSpeed;
        if (currentPixelY > targetPixelY) currentPixelY -= moveSpeed;

        // Jika jarak sudah sangat dekat, paskan ke tengah tile dan berhenti
        if (Math.abs(currentPixelX - targetPixelX) < moveSpeed && 
            Math.abs(currentPixelY - targetPixelY) < moveSpeed) {
            
            currentPixelX = targetPixelX;
            currentPixelY = targetPixelY;
            
            playerPos.r = targetPos.r;
            playerPos.c = targetPos.c;
            isMoving = false; 
            
            checkInteractions(); // Cek kado setiap kali sampai di tile baru
        }
    }
}

// Logika deteksi kado di sekitar
const btnOpen = document.getElementById('btn-open');
function checkInteractions() {
    const directions = [ { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 } ];
    let foundChest = false;
    
    for (let dir of directions) {
        const checkR = playerPos.r + dir.r;
        const checkC = playerPos.c + dir.c;
        
        if (checkR >= 0 && checkR < rows && checkC >= 0 && checkC < cols) {
            const tile = map[checkR][checkC];
            if (tile === 2 || tile === 3) {
                foundChest = true;
                btnOpen.dataset.chestType = tile;
                btnOpen.dataset.chestRow = checkR;
                btnOpen.dataset.chestCol = checkC;
                break;
            }
        }
    }
    
    if (foundChest) btnOpen.classList.remove('hidden');
    else btnOpen.classList.add('hidden');
}

// Sistem Tahan Tombol (Hold-to-Move) untuk Layar Sentuh HP
const setDir = (dir) => { 
    activeDirection = dir; 
    facingDirection = dir; // Simpan arah hadap terakhir
};
const stopDir = (dir) => { if (activeDirection === dir) activeDirection = null; };

function setupHoldButton(id, dir) {
    const btn = document.getElementById(id);
    // Sensor layar sentuh
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); setDir(dir); });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); stopDir(dir); });
    // Sensor kursor (jika tes pakai mouse)
    btn.addEventListener('mousedown', () => setDir(dir));
    btn.addEventListener('mouseup', () => stopDir(dir));
    btn.addEventListener('mouseleave', () => stopDir(dir));
}

setupHoldButton('btn-up', 'up');
setupHoldButton('btn-down', 'down');
setupHoldButton('btn-left', 'left');
setupHoldButton('btn-right', 'right');

// Hubungkan tombol UI dengan fungsi pergerakan
document.getElementById('btn-up').addEventListener('click', () => movePlayer(-1, 0));
document.getElementById('btn-down').addEventListener('click', () => movePlayer(1, 0));
document.getElementById('btn-left').addEventListener('click', () => movePlayer(0, -1));
document.getElementById('btn-right').addEventListener('click', () => movePlayer(0, 1));

// --- 4. LOGIKA KADO & POPUP ---
const chestPopup = document.getElementById('chest-popup');
const btnClosePopup = document.getElementById('btn-close-popup');
const popupContent = document.getElementById('popup-content');
const btnNextSlide = document.getElementById('btn-next-slide');

// Data ucapan kado utama (3 slide)
const doaSlides = [
    "Selamat ulang tahun ke 26, Nay sayang...",
    "Tempat paling teduh buat Ami pulang, meski sekarang jarak masih jadi penghalang.",
    "Semoga semesta selalu memelukmu dengan bahagia, dan langkah kita menuju pelaminan terus dipermudah yaa. Wopyu ❤️"
];
let currentDoaSlide = 0;

btnOpen.addEventListener('click', () => {
    const type = btnOpen.dataset.chestType;
    
    // Tampilkan modal popup
    chestPopup.classList.remove('hidden');
    
        if (type == 2) {
        // Ambil data koordinat peti yang sedang dibuka
        const cRow = btnOpen.dataset.chestRow;
        const cCol = btnOpen.dataset.chestCol;
        
        // Buat "Kamus" koordinat untuk memanggil nama file foto yang berbeda
        const databaseFoto = {
            "1,1": "assets/kado1.jpg", // Foto untuk peti Kiri Atas
            "1,9": "assets/kado2.jpg", // Foto untuk peti Kanan Atas
            "5,1": "assets/kado3.jpg", // Foto untuk peti Kiri Bawah
            "5,9": "assets/kado4.jpg"  // Foto untuk peti Kanan Bawah
        };

        // Format kunci koordinatnya ("baris,kolom")
        const kunciKoordinat = `${cRow},${cCol}`;
        const sumberGambar = databaseFoto[kunciKoordinat];

        popupContent.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
                <img src="${sumberGambar}" style="max-width: 100%; max-height: 65vh; object-fit: contain; border: 4px solid #fff; border-radius: 8px; image-rendering: pixelated; background: #000;">
            </div>`;
        btnNextSlide.classList.add('hidden');
    } else if (type == 3) {
        // Logika Peti Utama (Doa 3 Slide)
        currentDoaSlide = 0;
        popupContent.innerHTML = `<h2 style="margin-bottom: 20px;">Dear, my Nay 🤍</h2><p style="font-size: 18px;">${doaSlides[currentDoaSlide]}</p>`;
        btnNextSlide.classList.remove('hidden'); // Munculkan tombol next
    }
});

// Logika Tombol Next untuk Peti Utama
btnNextSlide.addEventListener('click', () => {
    currentDoaSlide++;
    if (currentDoaSlide < doaSlides.length) {
        popupContent.innerHTML = `<h2 style="margin-bottom: 20px;">Dear, my Nay 🤍</h2><p style="font-size: 18px;">${doaSlides[currentDoaSlide]}</p>`;
    } else {
        // Jika teks habis
        popupContent.innerHTML = `<h2 style="margin-bottom: 20px;">Dear, my Nay 🤍</h2><p style="font-size: 18px;">❤️❤️❤️</p>`;
        btnNextSlide.classList.add('hidden');
    }
});

// Logika Tutup Popup dengan icon X
btnClosePopup.addEventListener('click', () => {
    chestPopup.classList.add('hidden');
});

// Keluar Game
document.getElementById('btn-keluar').addEventListener('click', () => {
    showScreen('credits');
    bgm.pause(); // Hentikan musik saat masuk layar credits
});
