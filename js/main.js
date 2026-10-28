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
  const screenFallback = $("#screenFallback");
  const fallbackNumber = $("#fallbackNumber");
  const staticLayer = $("#staticLayer");
  const crackLayer = $("#crackLayer");
  const screenChannelCaption = $("#screenChannelCaption");
  const progressLabel = $("#progressLabel");
  const progressCount = $("#progressCount");
  const progressFill = $("#progressFill");
  const actionHint = $("#actionHint");
  const powerLed = $("#powerLed");
  const soundToggle = $("#soundToggle");
  const soundToggleText = $("#soundToggleText");
  const fullFlash = $("#fullFlash");
  const toast = $("#toast");
  const flipCard = $("#flipCard");
  const flipInner = $("#flipInner");
  const downloadInvite = $("#downloadInvite");
  const downloadHint = $("#downloadHint");
  const characterRing = $("#characterRing");

  const TOTAL_HITS = 7;
  let state = "off";
  let hits = 0;
  let busy = false;
  let soundEnabled = true;
  let isFlipped = false;
  let toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
  }

  function setScene(scene) {
    const showingInvite = scene === "invite";
    introScene.hidden = showingInvite;
    inviteScene.hidden = !showingInvite;
    if (showingInvite) {
      state = "invite";
      document.title = "Valesca Calle · Nivel 30 desbloqueado";
      renderCharacters();
    }
  }

  function showImageOrFallback(index) {
    const channel = config.channels[index];
    fallbackNumber.textContent = String(index + 1).padStart(2, "0");
    screenFallback.hidden = false;
    channelImage.hidden = true;
    channelImage.onload = () => { channelImage.hidden = false; screenFallback.hidden = true; };
    channelImage.onerror = () => { channelImage.hidden = true; screenFallback.hidden = false; };
    if (channel && channel.image) channelImage.src = channel.image;
    else { channelImage.removeAttribute("src"); }
    screenChannelCaption.textContent = channel?.label || `CH. ${String(index + 1).padStart(2, "0")} · BUSCANDO SEÑAL`;
    screenChannelCaption.hidden = false;
  }

  async function powerOn() {
    if (state !== "off" || busy) return;
    busy = true;
    await window.InviteAudio?.unlock();
    state = "booting";
    tvShell.classList.add("is-on", "tv-wobble-small");
    screenOff.hidden = true;
    powerLed.classList.add("powered");
    screenPrompt.textContent = "...";
    staticLayer.hidden = false;
    progressLabel.textContent = "RECUPERANDO ENERGÍA";
    actionHint.textContent = "INICIANDO SISTEMA DE TUBO CATÓDICO...";
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
      actionHint.textContent = "CADA GOLPE TE ACERCA A LA SEÑAL PERDIDA";
      window.InviteAudio?.staticPop();
    }, 1350);
  }

  function updateProgress() {
    progressCount.textContent = `${String(hits).padStart(2, "0")} / 0${TOTAL_HITS}`;
    progressFill.style.width = `${Math.min(100, hits / TOTAL_HITS * 100)}%`;
  }

  function addShake() {
    tvShell.classList.remove("tv-wobble", "tv-wobble-small", "tv-wobble-hard");
    // Forzar reflow para reiniciar la animación en golpes seguidos.
    void tvShell.offsetWidth;
    tvShell.classList.add(hits >= 5 ? "tv-wobble-hard" : "tv-wobble");
    window.setTimeout(() => tvShell.classList.remove("tv-wobble", "tv-wobble-hard"), 480);
  }

  function tune() {
    if (state === "off") { powerOn(); return; }
    if (state !== "ready" || busy) return;
    busy = true;
    hits += 1;
    updateProgress();
    addShake();
    staticLayer.hidden = false;

    if (hits <= 6) {
      showImageOrFallback(hits - 1);
      window.InviteAudio?.cartoonHit(hits >= 5 ? 1.2 : 1);
      if (hits === 5) {
        crackLayer.src = "assets/images/efectos/grieta-1.svg";
        crackLayer.hidden = false;
        progressLabel.textContent = "¡ALGO SE ESTÁ QUEBRANDO!";
        actionHint.textContent = "UH-OH... QUIZÁS NO ERA BUENA IDEA";
        window.InviteAudio?.glassCrack(0.6);
      } else if (hits === 6) {
        crackLayer.src = "assets/images/efectos/grieta-2.svg";
        crackLayer.hidden = false;
        progressLabel.textContent = "SEÑAL CRÍTICA";
        actionHint.textContent = "UN ÚLTIMO GOLPE Y... ¡CRASH!";
        window.InviteAudio?.glassCrack(1.1);
      } else {
        progressLabel.textContent = "SINTONIZANDO CANAL";
        actionHint.textContent = hits === 4 ? "¡CASI ESTÁ! SIGUE SINTONIZANDO" : "BUEN GOLPE. LA SEÑAL ESTÁ CAMBIANDO";
      }
      screenPrompt.textContent = hits >= 5 ? "NO PUEDE SER..." : "¡SEÑAL ENCONTRADA!";
      screenPrompt.classList.add("prompt-small");
      window.setTimeout(() => {
        staticLayer.hidden = true;
        screenPrompt.textContent = hits >= 5 ? "NO PUEDE SER..." : "PRESIONA PARA SINTONIZAR";
        busy = false;
      }, 330);
    } else {
      state = "breaking";
      crackLayer.src = "assets/images/efectos/grieta-2.svg";
      crackLayer.hidden = false;
      staticLayer.hidden = false;
      screenPrompt.textContent = "¡CRAAASH!";
      progressLabel.textContent = "ERROR CATASTRÓFICO";
      actionHint.textContent = "TRANSMISIÓN INTERRUMPIDA";
      tvShell.classList.add("tv-wobble-hard", "tv-shattered");
      window.InviteAudio?.shatter();
      fullFlash.classList.remove("flash-out");
      fullFlash.classList.add("flash-in");
      window.setTimeout(() => {
        setScene("invite");
        fullFlash.classList.remove("flash-in");
        fullFlash.classList.add("flash-out");
        window.setTimeout(() => fullFlash.classList.remove("flash-out"), 700);
      }, 520);
    }
  }

  function goToInvite() {
    if (state === "invite") return;
    busy = false;
    state = "invite";
    setScene("invite");
    fullFlash.classList.remove("flash-in", "flash-out");
    tvShell.classList.remove("tv-wobble", "tv-wobble-hard", "tv-shattered");
  }

  function flip() {
    if (!flipInner) return;
    isFlipped = !isFlipped;
    flipInner.classList.toggle("is-flipped", isFlipped);
    flipCard.setAttribute("aria-label", isFlipped ? "Tarjeta girada. Toca para volver a la invitación" : "Girar tarjeta para ver los datos de la invitación");
    downloadInvite.innerHTML = `<span aria-hidden="true">↓</span> DESCARGAR ${isFlipped ? "DATOS DEL EVENTO" : "INVITACIÓN"} COMO IMAGEN`;
    downloadHint.textContent = isFlipped ? "SE DESCARGARÁ ESTA CARA · TOCA LA TARJETA PARA VOLVER" : "GUÁRDALA EN TU GALERÍA · TOCA LA TARJETA PARA GIRARLA";
  }

  function renderCharacters() {
    if (!characterRing || characterRing.dataset.rendered === "true") return;
    characterRing.dataset.rendered = "true";
    const colors = ["#d9ff38", "#ff4d9d", "#49e7ff", "#ffc857", "#a78bfa", "#ff765e", "#75f0a5", "#fc6bd7", "#93a8ff", "#ffe66d"];
    const paths = Array.isArray(config.characters) ? config.characters : [];
    paths.forEach((src, i) => {
      const angle = (-90 + (360 / paths.length) * i) * Math.PI / 180;
      const x = 50 + Math.cos(angle) * 43;
      const y = 50 + Math.sin(angle) * 40;
      const slot = document.createElement("div");
      slot.className = "character-slot";
      slot.style.left = `${x}%`;
      slot.style.top = `${y}%`;
      slot.style.setProperty("--sticker-color", colors[i % colors.length]);
      slot.style.setProperty("--tilt", `${(i % 2 ? 1 : -1) * (5 + (i % 4) * 3)}deg`);
      slot.setAttribute("aria-hidden", "true");
      const placeholder = document.createElement("span");
      placeholder.className = "character-placeholder";
      placeholder.textContent = "★";
      const img = document.createElement("img");
      img.alt = "";
      img.loading = "eager";
      img.onerror = () => { img.classList.add("image-missing"); placeholder.hidden = false; };
      img.onload = () => { img.classList.remove("image-missing"); placeholder.hidden = true; };
      img.src = src;
      placeholder.hidden = true;
      slot.append(placeholder, img);
      characterRing.append(slot);
    });
  }

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 5) {
    const words = text.split(/\s+/);
    let line = "";
    let lines = [];
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
      else line = test;
    });
    if (line) lines.push(line);
    if (lines.length > maxLines) lines = lines.slice(0, maxLines);
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
    return y + lines.length * lineHeight;
  }

  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color, rotation = -Math.PI / 2) {
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const a = rotation + i * Math.PI / spikes;
      const x = cx + Math.cos(a) * radius;
      const y = cy + Math.sin(a) * radius;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }

  function drawExportCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080; canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#100b24"); bg.addColorStop(0.5, "#28124b"); bg.addColorStop(1, "#071d36");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(217,255,56,.10)";
    for (let y = 0; y < H; y += 34) for (let x = 0; x < W; x += 34) ctx.fillRect(x + ((y / 34) % 2) * 8, y, 3, 3);
    drawStar(ctx, 85, 130, 8, 60, 25, "#d9ff38");
    drawStar(ctx, 1000, 240, 7, 65, 24, "#ff4d9d");
    drawStar(ctx, 82, 1680, 8, 52, 21, "#49e7ff");
    drawStar(ctx, 1000, 1760, 8, 58, 23, "#ffc857");

    // Dibuja los personajes primero; la tarjeta central queda por encima y deja el marco despejado.
    const slots = Array.from(characterRing.querySelectorAll(".character-slot"));
    slots.forEach((slot, i) => {
      const img = slot.querySelector("img");
      const xPct = parseFloat(slot.style.left) / 100;
      const yPct = parseFloat(slot.style.top) / 100;
      const cx = xPct * W, cy = yPct * H;
      const sw = 152, sh = 178;
      if (img && img.complete && img.naturalWidth > 0 && !img.classList.contains("image-missing")) {
        const ratio = Math.min(sw / img.naturalWidth, sh / img.naturalHeight);
        const dw = img.naturalWidth * ratio, dh = img.naturalHeight * ratio;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate((i % 2 ? 1 : -1) * 0.08); ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh); ctx.restore();
      } else {
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(i * 0.12);
        drawStar(ctx, 0, 0, 9, 62, 40, ["#d9ff38", "#ff4d9d", "#49e7ff", "#ffc857"][i % 4]);
        ctx.fillStyle = "#100b24"; ctx.font = "900 40px Arial Black, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("★", 0, 0);
        ctx.restore();
      }
    });

    // Marco principal tipo tarjeta coleccionable.
    const cardX = 84, cardY = 390, cardW = 912, cardH = 1135;
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.48)"; ctx.shadowBlur = 42; ctx.shadowOffsetY = 22;
    roundedRect(ctx, cardX, cardY, cardW, cardH, 46); ctx.fillStyle = "#f8f3df"; ctx.fill(); ctx.restore();
    roundedRect(ctx, cardX + 13, cardY + 13, cardW - 26, cardH - 26, 38); ctx.lineWidth = 7; ctx.strokeStyle = "#100b24"; ctx.stroke();
    ctx.fillStyle = "#100b24"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.font = "900 22px Arial Black, sans-serif"; ctx.fillText("CARTOON ARCHIVES", cardX + 44, cardY + 62);
    ctx.textAlign = "right"; ctx.fillStyle = "#e9438d"; ctx.fillText("● REC / 30", cardX + cardW - 44, cardY + 62);
    ctx.strokeStyle = "#100b24"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cardX + 42, cardY + 85); ctx.lineTo(cardX + cardW - 42, cardY + 85); ctx.stroke();

    if (!isFlipped) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#5622a4"; ctx.font = "900 26px Arial Black, sans-serif"; ctx.fillText("ESTÁS INVITADO A...", W / 2, cardY + 151);
      ctx.fillStyle = "#100b24"; ctx.font = "900 72px Impact, Arial Black, sans-serif"; ctx.fillText("¡NIVEL 30", W / 2, cardY + 255);
      ctx.fillStyle = "#e9438d"; ctx.font = "900 74px Impact, Arial Black, sans-serif"; ctx.fillText("DESBLOQUEADO!", W / 2, cardY + 338);
      ctx.fillStyle = "#100b24"; ctx.font = "900 47px Arial Black, sans-serif"; ctx.fillText("VALESCA CALLE", W / 2, cardY + 421);
      ctx.fillStyle = "#49cfe8"; ctx.fillRect(cardX + 260, cardY + 452, cardW - 520, 9);
      ctx.fillStyle = "#100b24"; ctx.font = "700 31px Arial, sans-serif";
      drawWrappedText(ctx, "Una celebración salida directamente de los años 2000.", W / 2, cardY + 520, 740, 43, 3);
      ctx.fillStyle = "#d9ff38"; roundedRect(ctx, cardX + 46, cardY + 645, cardW - 92, 255, 24); ctx.fill();
      ctx.strokeStyle = "#100b24"; ctx.lineWidth = 4; roundedRect(ctx, cardX + 46, cardY + 645, cardW - 92, 255, 24); ctx.stroke();
      ctx.fillStyle = "#100b24"; ctx.font = "900 25px Arial Black, sans-serif"; ctx.fillText("MISIÓN OBLIGATORIA", W / 2, cardY + 694);
      ctx.font = "700 28px Arial, sans-serif";
      drawWrappedText(ctx, "Ven con tu mejor disfraz inspirado en tus dibujos animados favoritos de Cartoon Network de los 2000.", W / 2, cardY + 748, 740, 42, 4);
      ctx.fillStyle = "#5622a4"; ctx.font = "900 24px Arial Black, sans-serif"; ctx.fillText("PREPÁRATE PARA VOLVER A TU INFANCIA", W / 2, cardY + 968);
      ctx.fillStyle = "#100b24"; ctx.font = "900 22px Arial Black, sans-serif"; ctx.fillText("GIRA LA TARJETA PARA VER LOS DATOS  ↻", W / 2, cardY + 1060);
    } else {
      ctx.textAlign = "center";
      ctx.fillStyle = "#5622a4"; ctx.font = "900 25px Arial Black, sans-serif"; ctx.fillText("GUARDA LA FECHA", W / 2, cardY + 150);
      ctx.fillStyle = "#100b24"; ctx.font = "900 55px Impact, Arial Black, sans-serif"; ctx.fillText("¡NOS VEMOS EN", W / 2, cardY + 250);
      ctx.fillStyle = "#e9438d"; ctx.font = "900 67px Impact, Arial Black, sans-serif"; ctx.fillText("EL CANAL 30!", W / 2, cardY + 326);
      const detailY = [cardY + 465, cardY + 625, cardY + 785];
      const labels = [["¿CUÁNDO?", "14 DE NOVIEMBRE"], ["¿A QUÉ HORA?", "18:00 HORAS"], ["¿DÓNDE?", "PORTEZUELO 4516"]];
      labels.forEach((pair, i) => {
        ctx.fillStyle = ["#d9ff38", "#49e7ff", "#ffb4d4"][i]; roundedRect(ctx, cardX + 74, detailY[i] - 57, cardW - 148, 119, 19); ctx.fill();
        ctx.strokeStyle = "#100b24"; ctx.lineWidth = 3; roundedRect(ctx, cardX + 74, detailY[i] - 57, cardW - 148, 119, 19); ctx.stroke();
        ctx.textAlign = "left"; ctx.fillStyle = "#5622a4"; ctx.font = "900 22px Arial Black, sans-serif"; ctx.fillText(pair[0], cardX + 108, detailY[i] - 14);
        ctx.fillStyle = "#100b24"; ctx.font = "900 35px Arial Black, sans-serif"; ctx.fillText(pair[1], cardX + 108, detailY[i] + 28);
      });
      ctx.textAlign = "center"; ctx.fillStyle = "#100b24"; ctx.font = "700 25px Arial, sans-serif";
      drawWrappedText(ctx, "Una noche para celebrar, disfrazarse y revivir los mejores recuerdos animados.", W / 2, cardY + 930, 740, 34, 3);
      ctx.fillStyle = "#5622a4"; ctx.font = "900 24px Arial Black, sans-serif"; ctx.fillText("¡TE ESPERAMOS!", W / 2, cardY + 1060);
    }

    ctx.textAlign = "center"; ctx.fillStyle = "#f8f3df"; ctx.font = "900 25px Arial Black, sans-serif"; ctx.fillText("TRANSMISIÓN ESPECIAL · VALESCA CALLE", W / 2, 1818);
    ctx.fillStyle = "#d9ff38"; ctx.font = "700 20px Arial, sans-serif"; ctx.fillText("NIVEL 30 DESBLOQUEADO", W / 2, 1860);
    return canvas;
  }

  function downloadCurrentFace() {
    try {
      const canvas = drawExportCanvas();
      const save = (url) => {
        const a = document.createElement("a");
        a.download = `invitacion-valesca-calle-30-${isFlipped ? "datos" : "invitacion"}.png`;
        a.href = url;
        document.body.appendChild(a); a.click(); a.remove();
        showToast("¡Imagen lista para guardar en tu galería!");
      };
      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (!blob) { save(canvas.toDataURL("image/png")); return; }
          const url = URL.createObjectURL(blob); save(url);
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
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); tune(); }
  });
  $("#skipIntro").addEventListener("click", goToInvite);
  soundToggle.addEventListener("click", async () => {
    await window.InviteAudio?.unlock();
    soundEnabled = !soundEnabled;
    window.InviteAudio?.setEnabled(soundEnabled);
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggleText.textContent = soundEnabled ? "SONIDO ACTIVADO" : "SONIDO DESACTIVADO";
    soundToggle.classList.toggle("muted", !soundEnabled);
    if (soundEnabled) window.InviteAudio?.staticPop();
  });
  flipCard.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    flip();
  });
  flipCard.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && !event.target.closest("button")) { event.preventDefault(); flip(); }
  });
  document.querySelectorAll("[data-flip]").forEach((button) => button.addEventListener("click", (event) => { event.stopPropagation(); flip(); }));
  downloadInvite.addEventListener("click", downloadCurrentFace);

  // Respeta las preferencias de movimiento reducido del dispositivo.
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("reduce-motion");
  }
})();
