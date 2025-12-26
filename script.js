// Swipe Carousel Gallery - Swipe Only (No Prev/Next Buttons)
const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const dotsContainer = document.querySelector('.carousel-dots');

let currentIndex = 0;

// Buat dots otomatis
dotsContainer.innerHTML = ''; // Reset dulu
slides.forEach((_, index) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
        currentIndex = index;
        updateCarousel();
    });
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentIndex);
    });
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
    });
}

// Swipe dengan jari (Touch Events) - LANGSUNG ganti slide
let startX = 0;
let isDragging = false;

const container = document.querySelector('.carousel-container');

container.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    isDragging = true;
}, { passive: true });

container.addEventListener('touchmove', e => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent scroll page
}, { passive: false });

container.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;

    const endX = event.changedTouches[0].clientX;
    const deltaX = startX - endX;

    if (Math.abs(deltaX) > 50) { // Threshold geser minimal 50px
        if (deltaX > 0) {
            // Geser kiri → next
            currentIndex = (currentIndex + 1) % slides.length;
        } else {
            // Geser kanan → prev
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        }
        updateCarousel();
    }
});

// Bonus: Mouse drag di desktop
container.addEventListener('mousedown', e => {
    startX = e.clientX;
    isDragging = true;
});

document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
});

document.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;

    const deltaX = startX - e.clientX;
    if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
            currentIndex = (currentIndex + 1) % slides.length;
        } else {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        }
        updateCarousel();
    }
});


updateCarousel();

// Universal Ripple Effect untuk Mobile (touch)
document.addEventListener('touchstart', function(e) {
    const rippleElements = e.target.closest('.ripple');
    if (!rippleElements) return;

    // Hapus ripple lama kalau ada
    const oldRipple = rippleElements.querySelector('.ink');
    if (oldRipple) oldRipple.remove();

    // Buat elemen ink
    const ink = document.createElement('span');
    ink.classList.add('ink');
    rippleElements.appendChild(ink);

    // Reset style
    ink.style.width = ink.style.height = '0px';

    // Hitung posisi touch
    const rect = rippleElements.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.touches[0].clientX - rect.left - size / 2;
    const y = e.touches[0].clientY - rect.top - size / 2;

    ink.style.width = ink.style.height = size + 'px';
    ink.style.left = x + 'px';
    ink.style.top = y + 'px';
    ink.classList.add('animate');
}, { passive: true });

// === REVEAL ON SCROLL ANIMASI untuk Struktur Organisasi ===
const revealElements = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
    revealElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const elementVisible = 150; // Muncul saat 150px dari viewport
        
        if (elementTop < window.innerHeight - elementVisible) {
            el.classList.add('active');
        } else {
            el.classList.remove('active'); // Optional: biar repeat saat scroll ulang
        }
    });
};

// Jalankan saat scroll & load awal
window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // Init saat load


// === CHAT ANONIM GLOBAL REAL-TIME FIREBASE - FIX 100% ===
const firebaseConfig = {
  apiKey: "AIzaSyAenJKAlU7HZUS9DYciOol-PossbSoS4Kk",
  authDomain: "chat-web-kelas.firebaseapp.com",
  databaseURL: "https://chat-web-kelas-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chat-web-kelas",
  storageBucket: "chat-web-kelas.firebasestorage.app",
  messagingSenderId: "71196549800",
  appId: "1:71196549800:web:02935c4163882e7e89989d",
  measurementId: "G-S1787EDBTB"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const chatRef = db.ref('messages');

const chatModal = document.getElementById('chat-modal');
const openChatBtn = document.getElementById('open-chat');
const closeChatBtn = document.querySelector('.close-chat');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-message');

if (chatModal && openChatBtn) {
    openChatBtn.addEventListener('click', (e) => {
        e.preventDefault();
        chatModal.classList.add('show');
        chatMessages.innerHTML = ''; // Kosongin dulu biar bersih
        chatInput.focus();
    });

    closeChatBtn.addEventListener('click', () => {
        chatModal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (e.target === chatModal) {
            chatModal.classList.remove('show');
        }
    });

    // Kirim pesan
    const sendMessage = () => {
        const text = chatInput.value.trim();
        if (text === '') return;

        chatRef.push({
            text: text,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        });

        chatInput.value = '';
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Real-time listener - FIX RENDER PAKAI BACKTICK
    chatRef.on('child_added', (snapshot) => {
        const msg = snapshot.val();
        const div = document.createElement('div');
        div.classList.add('message');
        // PAKAI BACKTICK `` BIAR ${} JALAN BENAR
        div.innerHTML = `
            <strong>${msg.time}</strong><br>
            ${msg.text}
        `;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}