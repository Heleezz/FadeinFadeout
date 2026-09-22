// Elementos DOM
const fadeTarget       = document.getElementById('fadeTarget');
const targetLabel      = document.getElementById('targetLabel');
const statusLabel      = document.getElementById('statusLabel');
const opacitySlider    = document.getElementById('opacitySlider');
const sliderValueDisp  = document.getElementById('sliderValueDisplay');
const codeOutput       = document.getElementById('codeOutput');
const btnFadeIn        = document.getElementById('btnFadeIn');
const btnFadeOut       = document.getElementById('btnFadeOut');
const btnToggle        = document.getElementById('btnToggle');
const btnReset         = document.getElementById('btnReset');
const btnCopy          = document.getElementById('btnCopy');

// Estado da opacidade
let currentOpacity = 1.0;

/**
 * Mapeia o valor da opacidade (0.0 a 1.0) para a temperatura da piscina
 * Faixa: 20°C (fria/desligada) até 32°C (máxima)
 */
function applyOpacity(value) {
  currentOpacity = Math.max(0, Math.min(1, value));

  // Aplica transparência ao gradiente térmico
  fadeTarget.style.opacity = currentOpacity;

  // Cálculo da temperatura simulada
  const temp = (20 + currentOpacity * 12).toFixed(1);
  targetLabel.textContent = `${temp}°C`;

  // Atualiza rótulo do estado da água
  if (currentOpacity >= 0.8) {
    statusLabel.textContent = "Aquecimento Máximo";
  } else if (currentOpacity >= 0.3) {
    statusLabel.textContent = "Modo ECO / Manutenção";
  } else {
    statusLabel.textContent = "Água Fria / Repouso";
  }

  // Atualiza controles da interface
  const percentage = Math.round(currentOpacity * 100);
  sliderValueDisp.textContent = `${percentage}% (${currentOpacity.toFixed(2)})`;
  opacitySlider.value = percentage;

  renderCode(temp);
}

/**
 * Atualiza o código CSS no painel
 */
function renderCode(currentTemp) {
  const opacity = currentOpacity.toFixed(2);
  const duration = '1.5s'; // Tempo simulado de inércia térmica

  const rawCode =
`/* Circuito de Aquecimento da Piscina */
.circuito-termico {
  opacity: ${opacity}; /* Temp. Atual: ${currentTemp}°C */
  transition: opacity ${duration} ease-in-out;
  will-change: opacity;
}

/* Estado: ${currentOpacity > 0.5 ? 'Bomba Ativa' : 'Standby / Resfriando'} */`;

  const highlighted =
`<span class="tok-com">/* Circuito Térmico — Temp: ${currentTemp}°C */</span>
<span class="tok-sel">.circuito-termico</span> <span class="tok-punc">{</span>
  <span class="tok-prop">opacity</span><span class="tok-punc">:</span> <span class="tok-num">${opacity}</span><span class="tok-punc">;</span>
  <span class="tok-prop">transition</span><span class="tok-punc">:</span> <span class="tok-val">opacity</span> <span class="tok-num">${duration}</span> <span class="tok-val">ease-in-out</span><span class="tok-punc">;</span>
  <span class="tok-prop">will-change</span><span class="tok-punc">:</span> <span class="tok-val">opacity</span><span class="tok-punc">;</span>
<span class="tok-punc">}</span>

<span class="tok-com">/* Inércia Térmica:
   Fade In  = Ligar aquecedor (20°C → 32°C)
   Fade Out = Resfriamento (32°C → 20°C) */</span>`;

  codeOutput.innerHTML = highlighted;
  btnCopy.dataset.raw = rawCode;
}

/**
 * Animação da inércia térmica via JavaScript
 */
function animateOpacity(from, to, duration = 1500) {
  const start = performance.now();

  const easeInOut = t => t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOut(progress);
    const value = from + (to - from) * eased;

    applyOpacity(value);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

/* EVENT LISTENERS */

// Slider Modo ECO
opacitySlider.addEventListener('input', (e) => {
  fadeTarget.style.transition = 'none';
  applyOpacity(e.target.value / 100);
  requestAnimationFrame(() => {
    fadeTarget.style.transition = 'opacity 1.5s ease-in-out';
  });
});

// Ligar (Fade In)
btnFadeIn.addEventListener('click', () => {
  animateOpacity(currentOpacity, 1);
});

// Desligar (Fade Out)
btnFadeOut.addEventListener('click', () => {
  animateOpacity(currentOpacity, 0);
});

// Toggle Ciclo
btnToggle.addEventListener('click', () => {
  const target = currentOpacity > 0.5 ? 0 : 1;
  animateOpacity(currentOpacity, target);
});

// Modo Capa Térmica (Reset para 0.5 - conservação de temperatura)
btnReset.addEventListener('click', () => {
  animateOpacity(currentOpacity, 0.5);
});

// Copiar código
btnCopy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(btnCopy.dataset.raw);
    const original = btnCopy.textContent;
    btnCopy.textContent = '✓ Copiado';
    btnCopy.style.color = 'var(--success)';
    setTimeout(() => {
      btnCopy.textContent = original;
      btnCopy.style.color = '';
    }, 1500);
  } catch (err) {
    console.error('Erro ao copiar:', err);
  }
});

// Inicialização
applyOpacity(1);