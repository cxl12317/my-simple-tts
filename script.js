const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const speakBtn = document.getElementById('speakBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');

let voices = [];

// 加载可用的语音
function loadVoices() {
    voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}

// 初始化
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}
loadVoices();

// 播放语音
speakBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoiceIndex = voiceSelect.value;
    if (selectedVoiceIndex !== '') {
        utterance.voice = voices[selectedVoiceIndex];
    }
    speechSynthesis.speak(utterance);
});

// 暂停
pauseBtn.addEventListener('click', () => {
    speechSynthesis.pause();
});

// 继续
resumeBtn.addEventListener('click', () => {
    speechSynthesis.resume();
});

// 停止
stopBtn.addEventListener('click', () => {
    speechSynthesis.cancel();
});