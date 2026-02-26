const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const speakBtn = document.getElementById('speakBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');

let voices = [];
let mediaRecorder;
let audioChunks = [];

// 加载可用的语音列表
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

// 初始化语音列表
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}
loadVoices();

// 播放语音（浏览器原生 TTS）
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

// 暂停语音
pauseBtn.addEventListener('click', () => {
    speechSynthesis.pause();
});

// 继续播放
resumeBtn.addEventListener('click', () => {
    speechSynthesis.resume();
});

// 停止语音
stopBtn.addEventListener('click', () => {
    speechSynthesis.cancel();
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
});

// --- 下载语音（纯前端录制实现）---
downloadBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
        alert('请先输入要转换的文本');
        return;
    }

    try {
        // 显示加载状态
        downloadBtn.textContent = '生成中...';
        downloadBtn.disabled = true;

        // 请求麦克风权限（用于录制）
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const destination = audioContext.createMediaStreamDestination();
        const oscillator = audioContext.createOscillator();
        oscillator.connect(destination);
        oscillator.start();
        oscillator.stop();

        // 初始化录制器
        mediaRecorder = new MediaRecorder(destination.stream);
        audioChunks = [];
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
            alert('语音文件已成功下载！');
            downloadBtn.textContent = '下载';
            downloadBtn.disabled = false;
        };

        // 开始录制并播放语音
        mediaRecorder.start();
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoiceIndex = voiceSelect.value;
        if (selectedVoiceIndex !== '') {
            utterance.voice = voices[selectedVoiceIndex];
        }
        utterance.onend = () => {
            if (mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
        };
        speechSynthesis.speak(utterance);

    } catch (err) {
        console.error('下载失败：', err);
        alert(`下载失败: ${err.message}`);
        downloadBtn.textContent = '下载';
        downloadBtn.disabled = false;
    }
});