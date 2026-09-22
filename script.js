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
const btnCopy          = document.getElementById('btnCopy');
const chkCapaTermica   = document.getElementById('chkCapaTermica');
const logList          = document.getElementById('logList');

// Elementos de Telemetria
const valConsumo       = document.getElementById('valConsumo');
const valEficiencia    = document.getElementById('valEficiencia');
const valTempo         = document.getElementById('valTempo');

// Estado
let currentOpacity = 1.0;
let transitionDurationSec = 1.5;

/**
 * Adiciona uma mensagem ao histórico de logs
 */
function addLog(msg) {
  const time = new Date().toLocaleTimeString('pt-BR', { minute: '2-digit', second: '2-digit' });
  const li = document.createElement('li');
  li.textContent = `[${time}] ${msg}`;
  logList.prepend(li);
  if (logList.children.length > 5) logList.removeChild(logList.lastChild);
}

/**
 * Atualiza a duração da transição com base na Capa Térmica
 */
function updateTransitionSpeed() {
  const temCapa = chkCapaTermica.checked;
  transitionDurationSec = temCapa ? 3.0 : 1.0;
  fadeTarget.style.transition = `opacity ${transitionDurationSec}s ease-in-out`;
}

/**
 * Mapeia opacidade para temperatura, consumo elétrico e telemetria escolar
 */
function applyOpacity(value) {
  currentOpacity = Math.max(0, Math.min(1, value));

  fadeTarget.style.opacity = currentOpacity;

  // Cálculo da temperatura e telemetria
  const temp = (20 + currentOpacity * 12).toFixed(1);
  const consumoKW = (currentOpacity * 6.0).toFixed(1);
  const eficiencia = chkCapaTermica.checked ? Math.round(85 + currentOpacity * 12) : Math.round(60 + currentOpacity * 20);
  const tempoMin = Math.round((1 - currentOpacity) * 45);

  // Labels
  targetLabel.textContent = `${temp}°C`;
  valConsumo.textContent = `${consumoKW} kW`;
  valEficiencia.textContent = `${eficiencia}%`;
  valTempo.textContent = `${tempoMin} min`;

  // Status pedagógico/esportivo
  if (currentOpacity >= 0.8) {
    statusLabel.textContent = "Aquecimento Máximo / Spa";
  } else if (currentOpacity >= 0.7) {
    statusLabel.textContent = "Hidroterapia & Inclusão";
  } else if (currentOpacity >= 0.4) {
    statusLabel.textContent = "Treino & Natação Escolar";
  } else {
    statusLabel.textContent = "Modo Repouso / Férias";
  }

  const percentage = Math.round(currentOpacity * 100);
  sliderValueDisp.textContent = `${percentage}% (${currentOpacity.toFixed(2)})`;
  opacitySlider.value = percentage;

  renderCode(temp);
}

/**
 * Renderiza o código CSS no painel
 */
function renderCode(currentTemp) {
  const opacity = currentOpacity.toFixed(2);
  const duration = `${transitionDurationSec.toFixed(1)}s`;

  const rawCode =
`/* Automação do Parque Aquático Escolar */
.piscina-escolar {
  opacity: ${opacity}; /* Temp: ${currentTemp}°C */
  transition: opacity ${duration} ease-in-out;
  will-change: opacity;
}`;

  const highlighted =
`<span class="tok-com">/* Parque Aquático Escolar — Temp: ${currentTemp}°C */</span>
<span class="tok-sel">.piscina-escolar</span> <span class="tok-punc">{</span>
  <span class="tok-prop">opacity</span><span class="tok-punc">:</span> <span class="tok-num">${opacity}</span><span class="tok-punc">;</span>
  <span class="tok-prop">transition</span><span class="tok-punc">:</span> <span class="tok-val">opacity</span> <span class="tok-num">${duration}</span> <span class="tok-val">ease-in-out</span><span class="tok-punc">;</span>
  <span class="tok-prop">will-change</span><span class="tok-punc">:</span> <span class="tok-val">opacity</span><span class="tok-punc">;</span>
<span class="tok-punc">}</span>

<span class="tok-com">/* Capa Térmica Escolar: ${chkCapaTermica.checked ? 'Ativa (3.0s Fade Out)' : 'Inativa (1.0s Fade Out)'} */</span>`;

  codeOutput.innerHTML = highlighted;
  btnCopy.dataset.raw = rawCode;
}

/**
 * Animação da inércia térmica via JS
 */
function animateOpacity(from, to) {
  const start = performance.now();
  const durationMs = transitionDurationSec * 1000;

  const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / durationMs, 1);
    const eased = easeInOut(progress);
    const value = from + (to - from) * eased;

    applyOpacity(value);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

/* LISTENERS DE EVENTOS */

// Presets Rápidos Escolares
document.querySelectorAll('.btn-preset').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
    const targetBtn = e.currentTarget;
    targetBtn.classList.add('active');

    const targetTemp = parseFloat(targetBtn.dataset.temp);
    const targetOpacity = (targetTemp - 20) / 12;

    addLog(`Preset escolar acionado: ${targetTemp}°C`);
    updateTransitionSpeed();
    animateOpacity(currentOpacity, targetOpacity);
  });
});

// Switch Capa Térmica
chkCapaTermica.addEventListener('change', () => {
  const estaAtiva = chkCapaTermica.checked;
  updateTransitionSpeed();
  addLog(`Capa térmica ${estaAtiva ? 'colocada na piscina' : 'recolhida'}.`);
  applyOpacity(currentOpacity);
});

// Slider
opacitySlider.addEventListener('input', (e) => {
  fadeTarget.style.transition = 'none';
  applyOpacity(e.target.value / 100);
});

opacitySlider.addEventListener('change', () => {
  updateTransitionSpeed();
  addLog(`Potência manual ajustada para ${Math.round(currentOpacity * 100)}%`);
});

// Botões principais
btnFadeIn.addEventListener('click', () => {
  addLog('Comando: Ligar Bombas (Fade In)');
  updateTransitionSpeed();
  animateOpacity(currentOpacity, 1);
});

btnFadeOut.addEventListener('click', () => {
  addLog('Comando: Desligar Bombas (Fade Out)');
  updateTransitionSpeed();
  animateOpacity(currentOpacity, 0);
});

btnToggle.addEventListener('click', () => {
  const target = currentOpacity > 0.5 ? 0 : 1;
  addLog(`Comando: Alternar para ${target === 1 ? 'Ligado' : 'Desligado'}`);
  updateTransitionSpeed();
  animateOpacity(currentOpacity, target);
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
updateTransitionSpeed();
applyOpacity(1.0);