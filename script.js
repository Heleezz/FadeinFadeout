/* =========================================================
   LÓGICA DO PLAYGROUND
   ========================================================= */

// Referências aos elementos DOM
const fadeTarget       = document.getElementById('fadeTarget');
const targetLabel      = document.getElementById('targetLabel');
const opacitySlider    = document.getElementById('opacitySlider');
const sliderValueDisp  = document.getElementById('sliderValueDisplay');
const codeOutput       = document.getElementById('codeOutput');
const btnFadeIn        = document.getElementById('btnFadeIn');
const btnFadeOut       = document.getElementById('btnFadeOut');
const btnToggle        = document.getElementById('btnToggle');
const btnReset         = document.getElementById('btnReset');
const btnCopy          = document.getElementById('btnCopy');

// Estado atual da opacidade
let currentOpacity = 1;

/**
 * Aplica um valor de opacidade ao elemento alvo
 * e atualiza todas as interfaces dependentes.
 */
function applyOpacity(value) {
  // Clamp entre 0 e 1
  currentOpacity = Math.max(0, Math.min(1, value));

  // Atualiza o elemento visual
  fadeTarget.style.opacity = currentOpacity;

  // Atualiza labels
  const formatted = currentOpacity.toFixed(2);
  targetLabel.textContent = formatted;
  sliderValueDisp.textContent = formatted;
  opacitySlider.value = Math.round(currentOpacity * 100);

  // Atualiza o painel de código
  renderCode();
}

/**
 * Renderiza o snippet CSS no painel de código vivo,
 * com syntax highlighting manual via spans.
 */
function renderCode() {
  const opacity = currentOpacity.toFixed(2);
  const transitionDuration = '0.6s';

  // Código "cru" para copiar
  const rawCode =
`.fade-target {
  opacity: ${opacity};
  transition: opacity ${transitionDuration} ease-in-out;
  will-change: opacity;
}

/* Fórmula de interpolação:
   Opacity(t) = ${currentOpacity > 0.5 ? '1.00' : '0.00'} + (${opacity} - ${currentOpacity > 0.5 ? '1.00' : '0.00'}) × f(t) */`;

  // Versão com syntax highlighting
  const highlighted =
`<span class="tok-sel">.fade-target</span> <span class="tok-punc">{</span>
  <span class="tok-prop">opacity</span><span class="tok-punc">:</span> <span class="tok-num">${opacity}</span><span class="tok-punc">;</span>
  <span class="tok-prop">transition</span><span class="tok-punc">:</span> <span class="tok-val">opacity</span> <span class="tok-num">${transitionDuration}</span> <span class="tok-val">ease-in-out</span><span class="tok-punc">;</span>
  <span class="tok-prop">will-change</span><span class="tok-punc">:</span> <span class="tok-val">opacity</span><span class="tok-punc">;</span>
<span class="tok-punc">}</span>

<span class="tok-com">/* Fórmula de interpolação:
   Opacity(t) = Opacity_inicial + (Opacity_final - Opacity_inicial) × f(t) */</span>`;

  codeOutput.innerHTML = highlighted;

  // Armazena o código puro para o botão copiar
  btnCopy.dataset.raw = rawCode;
}

/**
 * Animação programática de fade com easing.
 * Usa requestAnimationFrame para suavidade.
 */
function animateOpacity(from, to, duration = 600) {
  const start = performance.now();

  // Curva ease-in-out (cubic bezier simplificada)
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

/* =========================================================
   EVENT LISTENERS
   ========================================================= */

// Slider: atualiza opacidade em tempo real
opacitySlider.addEventListener('input', (e) => {
  // Desabilita transição CSS durante drag para resposta imediata
  fadeTarget.style.transition = 'none';
  applyOpacity(e.target.value / 100);
  // Restaura transição no próximo frame
  requestAnimationFrame(() => {
    fadeTarget.style.transition = 'opacity 0.6s ease-in-out';
  });
});

// Botão Fade In
btnFadeIn.addEventListener('click', () => {
  animateOpacity(currentOpacity, 1);
});

// Botão Fade Out
btnFadeOut.addEventListener('click', () => {
  animateOpacity(currentOpacity, 0);
});

// Botão Toggle
btnToggle.addEventListener('click', () => {
  const target = currentOpacity > 0.5 ? 0 : 1;
  animateOpacity(currentOpacity, target);
});

// Botão Reset
btnReset.addEventListener('click', () => {
  animateOpacity(currentOpacity, 1);
});

// Botão Copiar código
btnCopy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(btnCopy.dataset.raw);
    const original = btnCopy.textContent;
    btnCopy.textContent = '✓ Copiado';
    btnCopy.style.color = 'var(--success)';
    btnCopy.style.borderColor = 'var(--success)';
    setTimeout(() => {
      btnCopy.textContent = original;
      btnCopy.style.color = '';
      btnCopy.style.borderColor = '';
    }, 1500);
  } catch (err) {
    console.error('Falha ao copiar:', err);
  }
});

// Inicialização
applyOpacity(1);