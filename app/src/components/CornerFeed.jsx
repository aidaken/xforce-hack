import { useCallback, useEffect, useRef, useState } from "react";

/**
 * CornerFeed — a muted gameplay clip pinned to a corner, cropped to a 9:16 short.
 *
 * Self-contained on purpose: no store, no context, no CSS file. Drop it anywhere
 * in the tree and it mounts itself. See docs/corner-feed.md.
 *
 * Each feed carries its own in-point and playback rate. `start` is also where the
 * loop returns to, because YouTube's own loop always restarts at 0.
 */
export const DEFAULT_FEEDS = [
  { id: "bdmG3oh-ZD8", name: "Subway Surfers", start: 30, rate: 1 },
  { id: "u7kdVe8q5zs", name: "Minecraft parkour", start: 0, rate: 1.25 },
];

const SIZES = { sm: 150, md: 210, lg: 290 };
const MIN_W = 82;

/* The API calls this global exactly once, when it finishes loading. On a warm cache
   it can finish before a component ever mounts, so callers must also check whether
   YT is already present. Everything that asks for the API shares one promise. */
let ytPromise = null;
function loadYouTubeApi() {
  if (ytPromise) return ytPromise;
  ytPromise = new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) return resolve(window.YT);

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      resolve(window.YT);
    };

    if (!document.querySelector('script[data-corner-feed-api]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      tag.dataset.cornerFeedApi = "1";
      tag.onerror = () => reject(new Error("blocked"));
      document.head.appendChild(tag);
    }

    /* third safety net: the callback can be missed entirely on a warm cache */
    let tries = 0;
    const poll = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(poll);
        resolve(window.YT);
      } else if (++tries > 50) {
        clearInterval(poll);
        reject(new Error("timeout"));
      }
    }, 200);
  });
  return ytPromise;
}

function errorText(code) {
  if (code === 101 || code === 150) return "The uploader turned off embedding for this clip.";
  if (code === 100) return "That video is private, removed, or the ID is wrong.";
  if (code === 2) return "That video ID isn't valid.";
  if (code === 5) return "The player failed here. Try serving the page over localhost.";
  return "The player returned error " + code + ".";
}

export default function CornerFeed({
  feeds = DEFAULT_FEEDS,
  defaultSize = "md",
  corner = "bottom-right",
  showControls = true,
  /* An autoplaying clip is the one thing a reduce-motion user is asking not to get,
     so it starts paused for them. Pass false to always autoplay. */
  respectReducedMotion = true,
}) {
  const [feedIndex, setFeedIndex] = useState(0);
  const [size, setSize] = useState(defaultSize);
  const [minimised, setMinimised] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [muted, setMuted] = useState(true);
  const [covered, setCovered] = useState(true);
  const [fault, setFault] = useState("");

  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const coverTimer = useRef(null);
  const feedRef = useRef(feeds[0]);
  feedRef.current = feeds[feedIndex] || feeds[0];

  const holdStill =
    respectReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Covering waits a beat so a half-second rebuffer doesn't blink the frame.
     Uncovering waits a shorter one, so YouTube's title overlay is gone first. */
  const cover = useCallback((on) => {
    clearTimeout(coverTimer.current);
    coverTimer.current = setTimeout(() => setCovered(on), on ? 260 : 200);
  }, []);

  const applyRate = useCallback(() => {
    const p = playerRef.current;
    if (!p || !p.setPlaybackRate) return;
    try {
      p.setPlaybackRate(feedRef.current.rate ?? 1);
    } catch {
      /* rate unsupported on this clip — leave it at 1x */
    }
  }, []);

  useEffect(() => {
    let dead = false;

    loadYouTubeApi()
      .then((YT) => {
        if (dead || !mountRef.current) return;
        const feed = feedRef.current;

        playerRef.current = new YT.Player(mountRef.current, {
          videoId: feed.id,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            autoplay: holdStill ? 0 : 1,
            mute: 1, // browsers refuse to autoplay with sound
            controls: 0,
            loop: 1,
            playlist: feed.id,
            playsinline: 1,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
            start: feed.start ?? 0,
          },
          events: {
            onReady: (e) => {
              e.target.mute();
              e.target.seekTo(feedRef.current.start ?? 0);
              applyRate();
              if (!holdStill) e.target.playVideo();
            },
            onStateChange: (e) => {
              // loop:1 restarts at 0 and ignores the start param — seek back by hand
              if (e.data === YT.PlayerState.ENDED) {
                e.target.seekTo(feedRef.current.start ?? 0);
                e.target.playVideo();
              }
              // the rate is reset by every load, so reassert it whenever playback begins
              if (e.data === YT.PlayerState.PLAYING) applyRate();
              cover(e.data !== YT.PlayerState.PLAYING);
            },
            onError: (e) => setFault(errorText(e.data)),
          },
        });
      })
      .catch(() => setFault("YouTube can't load here — offline, blocked, or sandboxed."));

    return () => {
      dead = true;
      clearTimeout(coverTimer.current);
      const p = playerRef.current;
      playerRef.current = null;
      if (p && p.destroy) {
        try {
          p.destroy();
        } catch {
          /* already torn down */
        }
      }
    };
  }, [applyRate, cover, holdStill]);

  /* Let the host page reserve a gutter: padding-right: var(--corner-feed-width) */
  const width = hidden ? 0 : minimised ? MIN_W : SIZES[size] ?? SIZES.md;
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--corner-feed-width", width + "px");
    return () => root.style.removeProperty("--corner-feed-width");
  }, [width]);

  function switchFeed(i) {
    setFeedIndex(i);
    feedRef.current = feeds[i];
    setFault("");
    cover(true);
    const p = playerRef.current;
    if (p && p.loadVideoById) {
      p.loadVideoById({ videoId: feeds[i].id, startSeconds: feeds[i].start ?? 0 });
      if (muted) p.mute();
      else p.unMute();
    }
  }

  function toggleSound() {
    const p = playerRef.current;
    if (!p || !p.unMute) return;
    const next = !muted;
    next ? p.mute() : p.unMute();
    setMuted(next);
  }

  function setHiddenAndPause(next) {
    setHidden(next);
    const p = playerRef.current;
    if (!p) return;
    try {
      next ? p.pauseVideo() : p.playVideo();
    } catch {
      /* player not ready yet */
    }
  }

  const vertical = corner.startsWith("top") ? { top: 20 } : { bottom: 20 };
  const horizontal = corner.endsWith("left") ? { left: 20 } : { right: 20 };

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => setHiddenAndPause(false)}
        style={{
          position: "fixed",
          ...vertical,
          ...horizontal,
          zIndex: 61,
          background: "var(--text, #2b2a26)",
          color: "var(--bg, #f7f1e3)",
          border: 0,
          borderRadius: 20,
          padding: "9px 15px",
          fontSize: 13,
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0,0,0,.3)",
        }}
      >
        Show feed
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        ...vertical,
        ...horizontal,
        zIndex: 60,
        width,
        transition: "width .2s",
      }}
    >
      <div
        style={{
          background: "#0B0F12",
          border: "1px solid var(--border, #e3daca)",
          borderRadius: minimised ? 9 : 12,
          padding: minimised ? 5 : 8,
          boxShadow: "0 6px 22px rgba(0,0,0,.28)",
        }}
      >
        <div
          style={{
            position: "relative",
            aspectRatio: "9 / 16",
            borderRadius: 7,
            overflow: "hidden",
            background: "#05080A",
          }}
        >
          {/* 16:9 source cropped to fill a 9:16 frame: full height, 316% width, centred.
              pointer-events:none keeps the iframe from swallowing clicks. */}
          <div
            ref={mountRef}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              height: "100%",
              width: "316%",
              border: 0,
              pointerEvents: "none",
            }}
          />

          {/* YouTube paints its title bar, centre play/pause, arrows and a "More videos"
              strip whenever the player is not playing. This hides all of it. It must
              appear instantly — a fade-in would let the title show through. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#05080A",
              display: "grid",
              placeItems: "center",
              opacity: covered || fault ? 1 : 0,
              transition: covered || fault ? "none" : "opacity .22s",
              pointerEvents: "none",
              padding: 12,
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: 10, letterSpacing: ".09em", textTransform: "uppercase", color: "#56655E" }}>
              {fault || (holdStill ? "paused" : "loading")}
            </span>
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: minimised ? 4 : 7,
            }}
          >
            {!minimised && (
              <div style={{ display: "flex" }}>
                <span style={pill}>
                  <i style={dot} />
                  {feedRef.current.name}
                </span>
              </div>
            )}
            {showControls && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: minimised ? "flex-end" : "flex-start" }}>
                {!minimised && (
                  <button type="button" style={pillBtn} onClick={toggleSound}>
                    {muted ? "Unmute" : "Mute"}
                  </button>
                )}
                <button type="button" style={pillBtn} onClick={() => setMinimised(!minimised)}>
                  {minimised ? "Expand" : "Min"}
                </button>
                {!minimised && (
                  <button type="button" style={pillBtn} onClick={() => setHiddenAndPause(true)}>
                    Hide
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {!minimised && showControls && feeds.length > 1 && (
          <div style={{ display: "flex", gap: 4, marginTop: 7 }}>
            {feeds.map((f, i) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={i === feedIndex}
                onClick={() => switchFeed(i)}
                style={{ ...chip, ...(i === feedIndex ? chipOn : null), fontSize: 9.5, padding: "5px 2px" }}
              >
                {f.name}
              </button>
            ))}
          </div>
        )}

        {!minimised && showControls && (
          <div style={{ display: "flex", gap: 4, marginTop: 7 }}>
            {Object.keys(SIZES).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={k === size}
                onClick={() => setSize(k)}
                style={{ ...chip, ...(k === size ? chipOn : null) }}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const pill = {
  background: "rgba(5,8,10,.66)",
  color: "#EAF1EE",
  fontSize: 10.5,
  padding: "3px 7px",
  borderRadius: 11,
  lineHeight: 1.3,
};
const pillBtn = { ...pill, pointerEvents: "auto", border: 0, cursor: "pointer" };
const dot = {
  display: "inline-block",
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "#55D07A",
  marginRight: 5,
  verticalAlign: 1,
};
const chip = {
  flex: 1,
  background: "#151B20",
  color: "#C9D4CE",
  border: "1px solid #29343A",
  borderRadius: 4,
  padding: "4px 0",
  fontSize: 10.5,
  cursor: "pointer",
  lineHeight: 1.2,
};
const chipOn = { background: "#EAF1EE", color: "#0B0F12", borderColor: "#EAF1EE" };
