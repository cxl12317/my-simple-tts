const downloadBtn = document.getElementById('downloadBtn');

// 下载语音（使用Puter.js免费TTS API）
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

    // 调用Puter TTS API，直接生成MP3
    const audioBlob = await puter.tts.synthesize(text, {
      voice: 'zh-CN-XiaoxiaoNeural', // 选择中文音色“晓晓”
      format: 'audio-16khz-128kbitrate-mono-mp3'
    });

    // 触发下载
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