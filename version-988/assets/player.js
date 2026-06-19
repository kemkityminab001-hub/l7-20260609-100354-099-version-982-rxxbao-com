(function () {
  function setupMoviePlayer(url, videoId) {
    var video = document.getElementById(videoId || "movie-player");
    if (!video || !url) {
      return;
    }

    var frame = video.closest(".player-frame");
    var button = frame ? frame.querySelector(".player-cover-button") : null;
    var status = frame ? frame.querySelector(".player-status") : null;
    var hls = null;
    var loaded = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text || "";
      }
    }

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("");
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus("播放加载失败，请稍后重试");
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus("播放暂时中断，正在恢复");
            hls.recoverMediaError();
          } else {
            setStatus("播放器暂时无法加载，请刷新页面重试");
            hls.destroy();
          }
        });
        return;
      }
      video.src = url;
    }

    function start() {
      hideButton();
      attach();
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {
          setStatus("点击视频区域继续播放");
        });
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", hideButton);
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
