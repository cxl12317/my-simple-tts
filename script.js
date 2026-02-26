const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const speakBtn = document.getElementById('speakBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');

let voices = [];

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
});

// --- 下载语音（调用Vercel API）---
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

        // 调用我们自己的API
        const response = await fetch(`/api/tts?text=${encodeURIComponent(text)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '下载失败');
        }

        // 触发下载
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = 'tts_output.mp3';
        a.click();
        URL.revokeObjectURL(audioUrl);

        alert('语音文件已成功下载！');
    } catch (err) {
        console.error('下载失败：', err);
        alert(`下载失败: ${err.message}`);
    } finally {
        // 恢复按钮状态
        downloadBtn.textContent = '下载';
        downloadBtn.disabled = false;
    }
});
