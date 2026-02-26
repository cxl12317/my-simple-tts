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

const downloadBtn = document.getElementById('downloadBtn');

// 下载语音
downloadBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) return;

    const selectedVoiceIndex = voiceSelect.value;
    const voice = voices[selectedVoiceIndex] || voices[0];

    // 创建音频上下文和媒体流
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const destination = audioContext.createMediaStreamDestination();
    const oscillator = audioContext.createOscillator();
    oscillator.connect(destination);
    oscillator.start();
    oscillator.stop();

    // 录制语音合成的输出
    const mediaRecorder = new MediaRecorder(destination.stream);
    const audioChunks = [];
    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunks.push(event.data);
        }
    };
    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = 'tts_output.mp3';
        a.click();
        URL.revokeObjectURL(audioUrl);
    };

    // 播放并录制语音
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.onstart = () => mediaRecorder.start();
    utterance.onend = () => mediaRecorder.stop();
    speechSynthesis.speak(utterance);
});