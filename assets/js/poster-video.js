/**
 * 视频模态层播放功能
 * 点击视频区域弹出模态层播放视频
 */

class VideoModalPlayer {
  constructor() {
    this.modal = document.getElementById('videoModal');
    this.videoPlayer = this.modal.querySelector('.video-modal-player');
    this.closeButton = this.modal.querySelector('.video-modal-close');
    this.backdrop = this.modal.querySelector('.video-modal-backdrop');
    this.videoContainers = document.querySelectorAll('.video-container');

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupKeyboardControls();
  }

  setupEventListeners() {
    // 为每个视频容器添加点击事件
    this.videoContainers.forEach(container => {
      container.addEventListener('click', (e) => {
        e.preventDefault();
        this.openVideoModal(container);
      });
    });

    // 关闭按钮事件
    this.closeButton.addEventListener('click', () => {
      this.closeVideoModal();
    });

    // 点击背景关闭
    this.backdrop.addEventListener('click', () => {
      this.closeVideoModal();
    });

    // 视频播放完成时关闭模态层
    this.videoPlayer.addEventListener('ended', () => {
      this.closeVideoModal();
    });
  }

  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      if (this.modal.classList.contains('active')) {
        switch (e.key) {
          case 'Escape':
            e.preventDefault();
            this.closeVideoModal();
            break;
          case ' ':
            e.preventDefault();
            this.togglePlayPause();
            break;
        }
      }
    });
  }

  openVideoModal(container) {
    const videoSrc = container.getAttribute('data-video-src');
    const videoPoster = container.getAttribute('data-video-poster');

    if (!videoSrc) {
      console.error('未找到视频源');
      return;
    }

    // 设置视频源
    this.setVideoSource(videoSrc, videoPoster);

    // 显示模态层
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // 检测是否为移动端
    const isMobile = this.isMobileDevice();

    // 移动端自动播放（带声音）
    if (isMobile) {
      this.videoPlayer.muted = false;
      this.videoPlayer.play().catch(error => {
        console.log('移动端自动播放失败，用户需要手动播放:', error);
      });
    } else {
      // 桌面端静音自动播放
      this.videoPlayer.muted = true;
      this.videoPlayer.play().catch(error => {
        console.log('桌面端自动播放失败:', error);
      });
    }
  }

  setVideoSource(videoSrc, videoPoster) {
    // 清除之前的源
    this.videoPlayer.src = '';
    this.videoPlayer.poster = videoPoster || '';

    // 设置新的源
    const sources = this.videoPlayer.querySelectorAll('source');
    sources.forEach(source => {
      const dataSrc = source.getAttribute('data-src');
      if (dataSrc) {
        source.src = dataSrc;
      }
    });

    // 设置主视频源
    this.videoPlayer.src = videoSrc;

    // 加载视频
    this.videoPlayer.load();
  }

  closeVideoModal() {
    // 暂停视频
    this.videoPlayer.pause();
    this.videoPlayer.currentTime = 0;

    // 隐藏模态层
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  togglePlayPause() {
    if (this.videoPlayer.paused) {
      this.videoPlayer.play();
    } else {
      this.videoPlayer.pause();
    }
  }

  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new VideoModalPlayer();
});

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VideoModalPlayer;
}
