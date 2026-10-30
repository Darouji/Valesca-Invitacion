(() => {
  "use strict";

  const config = window.INVITE_CONFIG || { channels: [], characters: [] };
  const $ = (selector) => document.querySelector(selector);
  const introScene = $("#introScene");
  const inviteScene = $("#inviteScene");
  const tvShell = $("#tvShell");
  const tvScreen = $("#tvScreen");
  const screenOff = $("#screenOff");
  const screenPrompt = $("#screenPrompt");
  const channelImage = $("#channelImage");
  const channelComposite = $("#channelComposite");
  const screenFallback = $("#screenFallback");
  const fallbackNumber = $("#fallbackNumber");
  const staticLayer = $("#staticLayer");
  const crackLayer = $("#crackLayer");
  const screenChannelCaption = $("#screenChannelCaption");
  const progressLabel = $("#progressLabel");
  const progressCount = $("#progressCount");
  const progressFill = $("#progressFill");
  const powerLed = $("#powerLed");
  const skipIntro = $("#skipIntro");
  const soundToggle = $("#soundToggle");
  const soundToggleInvite = $("#soundToggleInvite");
  const soundToggleText = $("#soundToggleText");
  const fullFlash = $("#fullFlash");
  const toast = $("#toast");
  const downloadInvite = $("#downloadInvite");
  const flipHint = $("#flipHint");
  const characterRing = $("#characterRing");

  const TOTAL_HITS = 8;
  const INTRO_STORAGE_KEY = "valesca-invitation-intro-completed-v1";
  let state = "off";
  let hits = 0;
  let busy = false;
  let soundEnabled = true;
  let isFlipped = false;
  let toastTimer = null;

  // Permite volver a probar la primera visita desde el computador con ?resetIntro=1.
  const query = new URLSearchParams(window.location.search);
  if (query.has("resetIntro")) {
    try {
      localStorage.removeItem(INTRO_STORAGE_KEY);
    } catch (_) {
      /* Almacenamiento no disponible. */
    }
  }

  function hasCompletedIntro() {
    try {
      return localStorage.getItem(INTRO_STORAGE_KEY) === "true";
    } catch (_) {
      return false;
    }
  }

  function markIntroCompleted() {
    try {
      localStorage.setItem(INTRO_STORAGE_KEY, "true");
    } catch (_) {
      /* La experiencia sigue funcionando aunque el navegador no permita guardar. */
    }
  }

  // La primera visita es obligatoria. El botón solo aparece en visitas posteriores.
  skipIntro.hidden = !hasCompletedIntro();

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2600);
  }

  function setScene(scene) {
    const showingInvite = scene === "invite";
    introScene.hidden = showingInvite;
    inviteScene.hidden = !showingInvite;
    if (showingInvite) {
      state = "invite";
      renderCharacters();
      document.title = "Valesca Calle · Nivel 30 desbloqueado";
    }
  }

  function showImageOrFallback(index) {
    const channel = config.channels[index];
    const channelNumber = String(index + 1).padStart(2, "0");
    const sources = Array.isArray(channel?.images)
      ? channel.images
      : channel?.image
        ? [channel.image]
        : [];

    fallbackNumber.textContent = channelNumber;
    channelImage.hidden = true;
    channelComposite.hidden = true;
    channelComposite.replaceChildren();
    screenFallback.hidden = true;

    if (sources.length > 1) {
      let loaded = 0;
      let failed = 0;
      sources.forEach((source, imageIndex) => {
        const panel = document.createElement("div");
        panel.className = `channel-composite-panel panel-${imageIndex + 1}`;
        const img = document.createElement("img");
        img.alt = channel?.labels?.[imageIndex] || "";
        img.decoding = "async";
        img.onload = () => {
          loaded += 1;
          if (loaded + failed === sources.length && loaded > 0)
            channelComposite.hidden = false;
        };
        img.onerror = () => {
          failed += 1;
          panel.remove();
          if (loaded + failed === sources.length && loaded === 0) {
            channelComposite.hidden = true;
            screenFallback.hidden = false;
          }
        };
        img.src = source;
        const label = document.createElement("span");
        label.className = "channel-composite-label";
        label.textContent = channel?.labels?.[imageIndex] || "";
        panel.append(img, label);
        channelComposite.append(panel);
      });
      // Se muestra la composición cuando carga la primera imagen, no se espera a la última.
      channelComposite.hidden = false;
    } else if (sources.length === 1) {
      channelImage.onload = () => {
        channelImage.hidden = false;
        screenFallback.hidden = true;
      };
      channelImage.onerror = () => {
        channelImage.hidden = true;
        screenFallback.hidden = false;
      };
      channelImage.src = sources[0];
    } else {
      screenFallback.hidden = false;
    }

    screenChannelCaption.textContent =
      channel?.label || `CH. ${channelNumber} · BUSCANDO SEÑAL`;
    screenChannelCaption.hidden = false;
  }

  async function powerOn() {
    if (state !== "off" || busy) return;
    busy = true;
    await window.InviteAudio?.unlock();
    window.InviteAudio?.startMusic();
    state = "booting";
    tvShell.classList.add("is-on", "tv-wobble-small");
    screenOff.hidden = true;
    powerLed.classList.add("powered");
    screenPrompt.textContent = "...";
    staticLayer.hidden = false;
    progressLabel.textContent = "RECUPERANDO ENERGÍA";
    window.InviteAudio?.powerOn();
    window.InviteAudio?.staticPop();

    window.setTimeout(() => {
      tvShell.classList.remove("tv-wobble-small");
      staticLayer.hidden = true;
      state = "ready";
      busy = false;
      hits = 0;
      screenPrompt.textContent = "PRESIONA PARA SINTONIZAR";
      progressLabel.textContent = "SEÑAL INESTABLE";
      progressCount.textContent = `00 / 0${TOTAL_HITS}`;
      progressFill.style.width = "0%";
      window.InviteAudio?.staticPop();
    }, 1250);
  }

  function updateProgress() {
    progressCount.textContent = `${String(hits).padStart(2, "0")} / 0${TOTAL_HITS}`;
    progressFill.style.width = `${Math.min(100, (hits / TOTAL_HITS) * 100)}%`;
  }

  function addShake() {
    tvShell.classList.remove("tv-wobble", "tv-wobble-small", "tv-wobble-hard");
    void tvShell.offsetWidth;
    tvShell.classList.add(hits >= 5 ? "tv-wobble-hard" : "tv-wobble");
    window.setTimeout(
      () => tvShell.classList.remove("tv-wobble", "tv-wobble-hard"),
      500,
    );
  }

  function tune() {
    if (state === "off") {
      void powerOn();
      return;
    }
    if (state !== "ready" || busy) return;
    busy = true;
    hits += 1;
    updateProgress();
    addShake();
    staticLayer.hidden = false;

    if (hits <= config.channels.length) {
      showImageOrFallback(hits - 1);
      window.InviteAudio?.cartoonHit(hits >= 5 ? 1.2 : 1);

      if (hits === TOTAL_HITS - 2) {
        crackLayer.src = "assets/images/efectos/grieta-1.svg";
        crackLayer.hidden = false;
        progressLabel.textContent = "LA SEÑAL SE ESTÁ ROMPIENDO";
        window.InviteAudio?.glassCrack(0.65);
      } else if (hits === TOTAL_HITS - 1) {
        crackLayer.src = "assets/images/efectos/grieta-2.svg";
        crackLayer.hidden = false;
        progressLabel.textContent = "ÚLTIMA SINTONIZACIÓN";
        window.InviteAudio?.glassCrack(1.15);
      } else {
        progressLabel.textContent = "SINTONIZANDO CANAL";
      }

      screenPrompt.textContent =
        hits >= 5 ? "NO PUEDE SER..." : "¡SEÑAL ENCONTRADA!";
      screenPrompt.classList.add("prompt-small");
      window.setTimeout(() => {
        staticLayer.hidden = true;
        screenPrompt.textContent =
          hits >= 5 ? "NO PUEDE SER..." : "PRESIONA PARA SINTONIZAR";
        busy = false;
      }, 360);
    } else {
      state = "breaking";
      markIntroCompleted();
      crackLayer.src = "assets/images/efectos/grieta-2.svg";
      crackLayer.hidden = false;
      staticLayer.hidden = false;
      screenPrompt.textContent = "¡CRAAASH!";
      progressLabel.textContent = "TRANSMISIÓN INTERRUMPIDA";
      tvShell.classList.add("tv-wobble-hard", "tv-shattered");
      window.InviteAudio?.shatter();
      fullFlash.classList.remove("flash-out");
      fullFlash.classList.add("flash-in");

      window.setTimeout(() => {
        setScene("invite");
        window.InviteAudio?.levelUp();
        fullFlash.classList.remove("flash-in");
        fullFlash.classList.add("flash-out");
        window.setTimeout(() => fullFlash.classList.remove("flash-out"), 780);
      }, 560);
    }
  }

  async function goToInvite() {
    if (state === "invite" || !hasCompletedIntro()) return;
    busy = false;
    state = "invite";
    await window.InviteAudio?.unlock();
    window.InviteAudio?.startMusic();
    setScene("invite");
    fullFlash.classList.remove("flash-in", "flash-out");
    tvShell.classList.remove("tv-wobble", "tv-wobble-hard", "tv-shattered");
  }

  function flip() {
    if (state !== "invite") return;
    isFlipped = !isFlipped;
    inviteScene.classList.toggle("is-details", isFlipped);
    $("#inviteFront").setAttribute("aria-hidden", String(isFlipped));
    $("#inviteBack").setAttribute("aria-hidden", String(!isFlipped));
    flipHint.innerHTML = isFlipped
      ? 'TOCA PARA VOLVER <span aria-hidden="true">↺</span>'
      : 'TOCA PARA VOLTEAR <span aria-hidden="true">↻</span>';
    downloadInvite.setAttribute(
      "aria-label",
      `Descargar ${isFlipped ? "los datos del evento" : "la invitación"} como imagen`,
    );
  }

  function renderCharacters() {
    if (!characterRing || characterRing.dataset.rendered === "true") return;
    characterRing.dataset.rendered = "true";
    const entries = Array.isArray(config.characters) ? config.characters : [];
    const responsiveScale = Math.min(1, (window.innerWidth || 390) / 390);

    entries.forEach((entry, index) => {
      const character =
        typeof entry === "string"
          ? {
              image: entry,
              edge: "bottom",
              position: ((index + 1) / (entries.length + 1)) * 100,
            }
          : entry;
      const slot = document.createElement("div");
      slot.className = `character-slot edge-${character.edge || "bottom"}`;
      slot.style.setProperty("--position", `${character.position ?? 50}%`);
      slot.style.setProperty(
        "--size",
        `${Math.round((character.size ?? 150) * responsiveScale)}px`,
      );
      slot.style.setProperty(
        "--peek",
        `${Math.round((character.peek ?? 86) * responsiveScale)}px`,
      );
      slot.style.setProperty(
        "--float-distance",
        `-${Math.max(3, Math.round((character.float ?? 6) * responsiveScale))}px`,
      );
      slot.style.setProperty(
        "--float-x",
        `${Math.round((character.floatX ?? 2) * responsiveScale)}px`,
      );
      slot.style.setProperty("--float-duration", `${character.duration ?? 4}s`);
      slot.style.setProperty("--float-delay", `${-(index * 0.37)}s`);
      slot.style.setProperty("--character-index", String(index));
      slot.dataset.edge = character.edge || "bottom";
      slot.dataset.position = String(character.position ?? 50);

      const img = document.createElement("img");
      img.alt = "";
      img.decoding = "async";
      img.loading = "eager";
      img.src = character.image;
      img.onerror = () => slot.classList.add("image-missing");
      slot.append(img);
      characterRing.append(slot);
    });
  }

  function drawStar(
    ctx,
    cx,
    cy,
    spikes,
    outerRadius,
    innerRadius,
    color,
    rotation = -Math.PI / 2,
  ) {
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i += 1) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = rotation + (i * Math.PI) / spikes;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawCharacterFrame(ctx, W, H) {
    const slots = Array.from(characterRing.querySelectorAll(".character-slot"));
    const viewW = characterRing.clientWidth || 390;
    const viewH = characterRing.clientHeight || 844;
    const scale = Math.min(W / viewW, H / viewH);

    slots.forEach((slot) => {
      const img = slot.querySelector("img");
      if (
        !img ||
        !img.complete ||
        img.naturalWidth === 0 ||
        slot.classList.contains("image-missing")
      )
        return;

      const edge = slot.dataset.edge || "bottom";
      const position = Number.parseFloat(slot.dataset.position || "50") / 100;
      const size =
        (Number.parseFloat(slot.style.getPropertyValue("--size")) || 150) *
        scale;
      const peek =
        (Number.parseFloat(slot.style.getPropertyValue("--peek")) || 86) *
        scale;
      const ratio = img.naturalWidth / img.naturalHeight;
      const drawW = ratio >= 1 ? size : size * ratio;
      const drawH = ratio >= 1 ? size / ratio : size;
      const cx =
        edge === "left"
          ? peek - size / 2
          : edge === "right"
            ? W - peek + size / 2
            : position * W;
      const cy =
        edge === "top"
          ? peek - size / 2
          : edge === "bottom"
            ? H - peek + size / 2
            : position * H;

      ctx.save();
      ctx.beginPath();
      if (edge === "bottom") ctx.rect(0, H - peek, W, peek);
      else if (edge === "top") ctx.rect(0, 0, W, peek);
      else if (edge === "left") ctx.rect(0, 0, peek, H);
      else ctx.rect(W - peek, 0, peek, H);
      ctx.clip();
      ctx.translate(cx, cy);
      if (edge === "top") ctx.rotate(Math.PI);
      else if (edge === "left") ctx.rotate(Math.PI / 2);
      else if (edge === "right") ctx.rotate(-Math.PI / 2);
      ctx.shadowColor = "rgba(7,4,18,.72)";
      ctx.shadowBlur = 22;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    });
  }

  function drawCenteredText(
    ctx,
    text,
    y,
    font,
    color,
    maxWidth = 900,
    shadow = "rgba(0,0,0,.85)",
  ) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.shadowColor = shadow;
    ctx.shadowBlur = 24;
    let size = Number.parseFloat(font.match(/([0-9.]+)px/)?.[1] || "40");
    const family = font.replace(/^.*?\d+(?:\.\d+)?px\s*/, "");
    while (ctx.measureText(text).width > maxWidth && size > 24) {
      size -= 2;
      ctx.font = `${font.match(/^[^0-9]*/)?.[0] || "900 "}${size}px ${family}`;
    }
    ctx.fillText(text, 540, y);
    ctx.restore();
  }

  function drawLevelHeadline(ctx, y) {
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "900 77px Impact, Arial Black, sans-serif";
    let size = 77;
    const first = "NIVEL 30";
    const second = "DESBLOQUEADO";
    const gap = 17;
    while (
      ctx.measureText(first).width + gap + ctx.measureText(second).width >
        990 &&
      size > 42
    ) {
      size -= 2;
      ctx.font = `900 ${size}px Impact, Arial Black, sans-serif`;
    }
    const firstWidth = ctx.measureText(first).width;
    const secondWidth = ctx.measureText(second).width;
    let x = (1080 - firstWidth - gap - secondWidth) / 2;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(8,5,18,.95)";
    ctx.shadowColor = "rgba(152,105,207,.95)";
    ctx.shadowBlur = 22;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = "#f8f2e8";
    ctx.strokeText(first, x, y);
    ctx.fillText(first, x, y);
    x += firstWidth + gap;
    ctx.fillStyle = "#d5f36a";
    ctx.shadowColor = "rgba(213,243,106,.45)";
    ctx.strokeText(second, x, y);
    ctx.fillText(second, x, y);
    ctx.restore();
  }

  function drawTextLines(ctx, lines, x, y, maxWidth, lineHeight, font, color) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.shadowColor = "rgba(0,0,0,.9)";
    ctx.shadowBlur = 14;
    lines.forEach((line, index) => {
      let size = Number.parseFloat(font.match(/([0-9.]+)px/)?.[1] || "28");
      if (ctx.measureText(line).width > maxWidth) {
        while (ctx.measureText(line).width > maxWidth && size > 19) {
          size -= 1;
          ctx.font = `700 ${size}px Arial, sans-serif`;
        }
      }
      ctx.fillText(line, x, y + index * lineHeight);
    });
    ctx.restore();
  }

  function drawExportCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    const base = ctx.createLinearGradient(0, 0, W, H);
    base.addColorStop(0, "#10091e");
    base.addColorStop(0.48, "#211337");
    base.addColorStop(1, "#080715");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    const violetHaze = ctx.createRadialGradient(540, 870, 50, 540, 870, 940);
    violetHaze.addColorStop(0, "rgba(143,94,190,.25)");
    violetHaze.addColorStop(0.55, "rgba(92,54,137,.12)");
    violetHaze.addColorStop(1, "rgba(8,7,21,0)");
    ctx.fillStyle = violetHaze;
    ctx.fillRect(0, 0, W, H);

    const roseHaze = ctx.createRadialGradient(950, 430, 10, 950, 430, 620);
    roseHaze.addColorStop(0, "rgba(214,103,174,.19)");
    roseHaze.addColorStop(1, "rgba(214,103,174,0)");
    ctx.fillStyle = roseHaze;
    ctx.fillRect(0, 0, W, H);

    // Textura discreta de señal analógica, sin marcos ni tarjetas.
    ctx.fillStyle = "rgba(226,208,248,.045)";
    for (let y = 0; y < H; y += 32) {
      for (let x = 0; x < W; x += 32)
        ctx.fillRect(x + ((y / 32) % 2) * 7, y, 2, 2);
    }
    ctx.fillStyle = "rgba(0,0,0,.12)";
    for (let y = 0; y < H; y += 5) ctx.fillRect(0, y, W, 1);

    drawCharacterFrame(ctx, W, H);

    // Halo oscuro suave detrás de la tipografía: mantiene el título legible sin crear una tarjeta.
    const textAura = ctx.createRadialGradient(540, 990, 80, 540, 990, 760);
    textAura.addColorStop(0, "rgba(13,7,28,.88)");
    textAura.addColorStop(0.55, "rgba(18,10,35,.68)");
    textAura.addColorStop(0.82, "rgba(18,10,35,.18)");
    textAura.addColorStop(1, "rgba(18,10,35,0)");
    ctx.fillStyle = textAura;
    ctx.fillRect(0, 0, W, H);

    // Brillos gráficos pequeños en los márgenes; el centro permanece limpio.
    drawStar(ctx, 100, 340, 7, 23, 10, "#d5f36a");
    drawStar(ctx, 980, 510, 8, 26, 11, "#bd83df");
    drawStar(ctx, 110, 1480, 8, 22, 9, "#ef8fc7");
    drawStar(ctx, 980, 1550, 7, 24, 10, "#d5f36a");

    if (!isFlipped) {
      drawLevelHeadline(ctx, 660);
      drawCenteredText(
        ctx,
        "VALESCA CALLE",
        765,
        "900 49px Arial Black, sans-serif",
        "#f3b8dc",
        900,
        "rgba(0,0,0,.95)",
      );
      drawTextLines(
        ctx,
        ["Una celebración salida directamente", "de los años 2000."],
        540,
        890,
        850,
        46,
        "700 31px Arial, sans-serif",
        "#f1e9f4",
      );

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "900 30px Arial Black, sans-serif";
      ctx.shadowColor = "rgba(199,255,102,.75)";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#d5f36a";
      ctx.fillText("MISIÓN OBLIGATORIA", 540, 1080);
      ctx.restore();

      drawTextLines(
        ctx,
        ["¡Ven con tu mejor disfraz de", "Cartoon Network 2000!"],
        540,
        1150,
        850,
        43,
        "800 34px Arial, sans-serif",
        "#fff4e9",
      );
      drawCenteredText(
        ctx,
        "PREPÁRATE PARA VOLVER A TU INFANCIA",
        1300,
        "900 23px Arial, sans-serif",
        "#dcb8f2",
        960,
      );
    } else {
      drawCenteredText(
        ctx,
        "PRÓXIMA TRANSMISIÓN",
        590,
        "900 25px Arial, sans-serif",
        "#d5f36a",
        900,
      );
      drawCenteredText(
        ctx,
        "¡NOS VEMOS EN",
        710,
        "900 66px Impact, Arial Black, sans-serif",
        "#f8f2e8",
        950,
        "rgba(152,105,207,.9)",
      );
      drawCenteredText(
        ctx,
        "EL CANAL 30!",
        790,
        "900 78px Impact, Arial Black, sans-serif",
        "#d5f36a",
        950,
        "rgba(0,0,0,.95)",
      );
      const detailRows = [
        ["¿CUÁNDO?", "14 DE NOVIEMBRE"],
        ["¿A QUÉ HORA?", "18:00 HORAS"],
        ["¿DÓNDE?", "PORTEZUELO 4516"],
      ];
      detailRows.forEach((row, index) => {
        const y = 980 + index * 165;
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "900 24px Arial, sans-serif";
        ctx.fillStyle = "#d5f36a";
        ctx.shadowColor = "rgba(0,0,0,.9)";
        ctx.shadowBlur = 14;
        ctx.fillText(row[0], 540, y);
        ctx.font = "900 45px Impact, Arial Black, sans-serif";
        ctx.fillStyle = "#fff4e9";
        ctx.fillText(row[1], 540, y + 55);
        ctx.restore();
      });
      drawTextLines(
        ctx,
        [
          "Una noche para celebrar y revivir",
          "los mejores recuerdos animados.",
        ],
        540,
        1490,
        850,
        40,
        "700 27px Arial, sans-serif",
        "#ddcde9",
      );
    }

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "800 20px Arial, sans-serif";
    ctx.fillStyle = "rgba(238,229,246,.78)";
    ctx.fillText("VALESCA CALLE · NIVEL 30", 540, 1840);
    ctx.restore();
    return canvas;
  }

  function downloadCurrentFace() {
    try {
      const canvas = drawExportCanvas();
      const save = (url) => {
        const anchor = document.createElement("a");
        anchor.download = `valesca-calle-nivel-30-${isFlipped ? "datos" : "invitacion"}.png`;
        anchor.href = url;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        showToast("¡Imagen lista para guardar en tu galería!");
      };
      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (!blob) {
            save(canvas.toDataURL("image/png"));
            return;
          }
          const url = URL.createObjectURL(blob);
          save(url);
          window.setTimeout(() => URL.revokeObjectURL(url), 5000);
        }, "image/png");
      } else save(canvas.toDataURL("image/png"));
    } catch (error) {
      console.error("No se pudo exportar la invitación:", error);
      showToast("No se pudo generar la imagen. Prueba desde otro navegador.");
    }
  }

  tvScreen.addEventListener("click", tune);
  tvScreen.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      tune();
    }
  });
  skipIntro.addEventListener("click", goToInvite);

  function syncSoundControls() {
    [soundToggle, soundToggleInvite].filter(Boolean).forEach((button) => {
      button.setAttribute("aria-pressed", String(soundEnabled));
      button.classList.toggle("muted", !soundEnabled);
      button.setAttribute(
        "aria-label",
        soundEnabled
          ? "Silenciar música y efectos"
          : "Activar música y efectos",
      );
      button.setAttribute(
        "title",
        soundEnabled
          ? "Silenciar música y efectos"
          : "Activar música y efectos",
      );
    });
    if (soundToggleText)
      soundToggleText.textContent = soundEnabled
        ? "SONIDO ACTIVADO"
        : "SONIDO DESACTIVADO";
  }

  async function toggleSound() {
    await window.InviteAudio?.unlock();
    soundEnabled = !soundEnabled;
    window.InviteAudio?.setEnabled(soundEnabled);
    if (soundEnabled) {
      window.InviteAudio?.startMusic();
      window.InviteAudio?.staticPop();
    }
    syncSoundControls();
  }

  soundToggle.addEventListener("click", toggleSound);
  soundToggleInvite?.addEventListener("click", toggleSound);

  // Cualquier toque en la invitación cambia de cara, excepto el botón de descarga.
  inviteScene.addEventListener("click", (event) => {
    if (event.target.closest("button, a")) return;
    flip();
  });
  downloadInvite.addEventListener("click", downloadCurrentFace);

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("reduce-motion");
  }
})();
