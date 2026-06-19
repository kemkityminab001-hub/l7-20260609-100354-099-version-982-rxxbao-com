import { H as Hls } from "./hls.js";

function mountPlayer(shell) {
    const video = shell.querySelector("video");
    const button = shell.querySelector("[data-player-start]");
    const status = shell.querySelector("[data-player-status]");
    const source = shell.dataset.videoUrl;
    let hls = null;
    let loaded = false;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function loadSource() {
        if (loaded || !video || !source) {
            return;
        }

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setStatus("播放源加载完成");
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    setStatus("网络波动，正在重新连接");
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    setStatus("媒体加载异常，正在恢复");
                    hls.recoverMediaError();
                } else {
                    setStatus("播放失败，请刷新页面重试");
                    hls.destroy();
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            setStatus("播放源加载完成");
        } else {
            setStatus("当前浏览器不支持 HLS 播放");
        }

        loaded = true;
        video.controls = true;
    }

    async function startPlayback() {
        loadSource();
        shell.classList.add("is-playing");
        try {
            await video.play();
        } catch (error) {
            shell.classList.remove("is-playing");
            setStatus("请再次点击播放按钮启动视频");
        }
    }

    if (button && video && source) {
        button.addEventListener("click", startPlayback);
        video.addEventListener("play", () => shell.classList.add("is-playing"));
        video.addEventListener("pause", () => {
            if (!video.ended) {
                shell.classList.remove("is-playing");
            }
        });
    }

    window.addEventListener("beforeunload", () => {
        if (hls) {
            hls.destroy();
        }
    });
}

document.querySelectorAll("[data-video-player]").forEach(mountPlayer);
