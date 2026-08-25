/**
 * Oficina Editorial: editor MasterServ com três modelos documentais,
 * prévia A4 fiel ao papel técnico, impressão direta pelo navegador
 * e download do documento em PDF.
 *
 * Vanilla JS, sem dependência de build (funciona direto no GitHub Pages
 * ou abrindo o index.html localmente).
 */

let uid = 1000;
const nextId = () => uid++;

const modeInfo = {
  service: { label: "Serviço Executado", title: "ORÇAMENTO / SERVIÇO EXECUTADO", icon: "🛠" },
  budget: { label: "Orçamento", title: "ORÇAMENTO DE SERVIÇOS", icon: "🧾" },
  report: { label: "Laudo Técnico", title: "LAUDO TÉCNICO E ORÇAMENTO DE REPARO", icon: "📋" },
};

function seedServices() {
  return [
    { id: nextId(), description: "Instalação, fixação e reforço das hastes para o varal de lâmpadas" },
    { id: nextId(), description: "Fixação das hastes nas grades" },
    { id: nextId(), description: "Instalação de ganchos nas hastes para sustentação do varal" },
    { id: nextId(), description: "Reparo na instalação da câmera" },
    { id: nextId(), description: "Instalação do novo varal de lâmpadas" },
    { id: nextId(), description: "Emendas nos cabos" },
    { id: nextId(), description: "Transferência das lâmpadas do varal antigo para o novo" },
  ];
}

function seedEquipment() {
  return [
    {
      id: nextId(), name: "Ar-condicionado Split", brand: "Carrier", model: "42FVQA09C5", serial: "S/Nº",
      defect: "Não liga",
      evaluation: "Após avaliação técnica, foi constatado que o equipamento não apresenta funcionamento ao ser acionado.",
      items: [{ id: nextId(), description: "Troca do aparelho / serviço técnico", value: 1000 }],
    },
    {
      id: nextId(), name: "Ar-condicionado Split", brand: "Consul", model: "CBV07DBBNA 40", serial: "MD6578630",
      defect: "Não liga",
      evaluation: "O equipamento apresentou falha de funcionamento, não entrando em operação quando acionado.",
      items: [{ id: nextId(), description: "Troca do aparelho / serviço técnico", value: 1000 }],
    },
  ];
}

function initialState() {
  return {
    mode: "service",
    client: "Luiz",
    location: "Nossa Vila",
    date: "21/08/2026",
    services: seedServices(),
    labor: 350,
    materials: 95,
    budgetItems: [{ id: nextId(), description: "Serviço ou peça", unit: 0 }],
    equipmentCount: 2,
    equipment: seedEquipment(),
    notes: "Os equipamentos devem ser avaliados individualmente. Este documento registra a avaliação técnica e os serviços indicados.",
    warranty: "Peças: garantia de 1 ano, conforme condições do fabricante/fornecedor. Mão de obra: garantia de 3 meses.",
    showSignature: true,
  };
}

let state = initialState();

const money = (n) => (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function currentTotal() {
  if (state.mode === "service") return state.labor + state.materials;
  if (state.mode === "budget") return state.budgetItems.reduce((s, i) => s + i.unit, 0);
  return state.equipment.reduce((s, e) => s + e.items.reduce((x, i) => x + i.value, 0), 0);
}

/* ---------------------------------- Editor ---------------------------------- */

function renderEditor() {
  const el = document.getElementById("editor");
  const info = modeInfo[state.mode];

  el.innerHTML = `
    <div class="editor-heading">
      <div><span class="eyebrow">EDITOR</span><h2>Monte o documento</h2></div>
      <button class="icon-button" id="btn-reset-top" title="Restaurar exemplo">↺</button>
    </div>

    <div class="model-switch">
      <span class="switch-caption">MODELO DO DOCUMENTO</span>
      <div class="model-tabs">
        ${Object.keys(modeInfo).map((key) => `
          <button data-mode="${key}" class="${state.mode === key ? "active" : ""}">
            ${modeInfo[key].icon} ${modeInfo[key].label}
          </button>`).join("")}
      </div>
    </div>

    <div class="step-card">
      <div class="step-index">01</div>
      <div class="step-content">
        <label>Identificação</label>
        ${field("Cliente", "client", state.client)}
        <div class="field-row">
          ${field("Local / endereço", "location", state.location)}
          ${field("Data", "date", state.date)}
        </div>
      </div>
    </div>

    ${state.mode === "report" ? reportEquipmentEditor() : listEditor()}

    ${state.mode === "report" ? conclusionEditor() : valuesEditor()}

    <div class="toggle-card">
      <label class="toggle-row">
        <input type="checkbox" id="toggle-signature" ${state.showSignature ? "checked" : ""} />
        <span>Incluir campo de assinatura no documento</span>
      </label>
    </div>

    <div class="editor-actions">
      <button class="primary-button" id="btn-print"><span>🖨</span> Imprimir</button>
      <button class="primary-button" id="btn-download"><span>⬇</span> Baixar PDF</button>
      <button class="secondary-button" id="btn-reset">Limpar e restaurar exemplo</button>
    </div>
  `;

  wireEditorEvents();
}

function field(label, key, value, opts) {
  opts = opts || {};
  return `<div class="field"><span>${label}</span><input data-field="${key}" ${opts.eq ? `data-eq="${opts.eq}"` : ""} value="${esc(value)}" /></div>`;
}

function listEditor() {
  const items = state.mode === "service" ? state.services : state.budgetItems;
  return `
    <div class="step-card">
      <div class="step-index">02</div>
      <div class="step-content">
        <div class="section-label-row">
          <label>${state.mode === "service" ? "Serviços realizados" : "Itens do orçamento"}</label>
          <button class="text-button" id="btn-add-item">✚ Adicionar</button>
        </div>
        ${items.map((item) => `
          <div class="service-line" data-item="${item.id}">
            <input data-list-field="description" value="${esc(item.description)}" />
            <button class="delete-button" data-remove-item="${item.id}" title="Remover">🗑</button>
          </div>`).join("")}
      </div>
    </div>`;
}

function valuesEditor() {
  if (state.mode === "service") {
    return `
      <div class="step-card">
        <div class="step-index">03</div>
        <div class="step-content">
          <label>Valores</label>
          <div class="value-line"><span>Mão de obra</span><input type="number" data-field="labor" value="${state.labor}" /></div>
          <div class="value-line"><span>Materiais</span><input type="number" data-field="materials" value="${state.materials}" /></div>
          <div class="total-mini"><span>Total calculado</span><strong>${money(currentTotal())}</strong></div>
        </div>
      </div>`;
  }
  return `
    <div class="step-card">
      <div class="step-index">03</div>
      <div class="step-content">
        <label>Valores</label>
        ${state.budgetItems.map((item) => `
          <div class="value-line" data-budget-value="${item.id}">
            <span class="truncate">${esc(item.description)}</span>
            <input type="number" data-budget-unit="${item.id}" value="${item.unit}" />
          </div>`).join("")}
        <div class="total-mini"><span>Total calculado</span><strong>${money(currentTotal())}</strong></div>
      </div>
    </div>`;
}

function reportEquipmentEditor() {
  return `
    <div class="step-card report-editor">
      <div class="step-index">02</div>
      <div class="step-content">
        <div class="section-label-row">
          <label>Equipamentos</label>
          <div class="equipment-controls">
            <select id="equipment-count" aria-label="Quantidade de equipamentos">
              ${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}" ${state.equipmentCount === i + 1 ? "selected" : ""}>${i + 1} equipamento${i ? "s" : ""}</option>`).join("")}
            </select>
            <button class="text-button" id="btn-add-equipment">✚ Adicionar</button>
          </div>
        </div>
        ${state.equipment.map((e, i) => `
          <div class="equipment-form" data-equipment="${e.id}">
            <b>Equipamento ${i + 1}</b>
            ${field("Descrição", "name", e.name, { eq: e.id })}
            <div class="field-row">
              ${field("Marca", "brand", e.brand, { eq: e.id })}
              ${field("Modelo", "model", e.model, { eq: e.id })}
            </div>
            ${field("Número de série", "serial", e.serial, { eq: e.id })}
            ${field("Defeito", "defect", e.defect, { eq: e.id })}
            ${field("Avaliação técnica", "evaluation", e.evaluation, { eq: e.id })}
            <div class="item-editor-label">
              <span>Peças e serviços / valores</span>
              <button class="text-button" data-add-eq-item="${e.id}">✚ Item</button>
            </div>
            ${e.items.map((item) => `
              <div class="equipment-item-line" data-eq-item="${e.id}:${item.id}">
                <input data-eq-item-field="description" value="${esc(item.description)}" />
                <input type="number" data-eq-item-field="value" value="${item.value}" />
              </div>`).join("")}
          </div>`).join("")}
      </div>
    </div>`;
}

function conclusionEditor() {
  return `
    <div class="step-card">
      <div class="step-index">03</div>
      <div class="step-content">
        <label>Conclusão e garantia</label>
        ${field("Observações gerais", "notes", state.notes)}
        ${field("Garantia", "warranty", state.warranty)}
      </div>
    </div>`;
}

function wireEditorEvents() {
  const el = document.getElementById("editor");

  el.querySelectorAll("[data-mode]").forEach((btn) => btn.addEventListener("click", () => { state.mode = btn.dataset.mode; renderAll(); }));

  el.querySelectorAll("[data-field]").forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.field;
      const eqId = input.dataset.eq;
      const val = input.type === "number" ? Number(input.value) || 0 : input.value;
      if (eqId) {
        const eq = state.equipment.find((e) => e.id === Number(eqId));
        if (eq) eq[key] = val;
      } else {
        state[key] = val;
      }
      renderPreview();
    });
  });

  el.querySelectorAll("[data-list-field]").forEach((input) => {
    input.addEventListener("input", () => {
      const id = Number(input.closest("[data-item]").dataset.item);
      const list = state.mode === "service" ? state.services : state.budgetItems;
      const item = list.find((i) => i.id === id);
      if (item) item.description = input.value;
      renderPreview();
    });
  });

  el.querySelectorAll("[data-remove-item]").forEach((btn) => btn.addEventListener("click", () => {
    const id = Number(btn.dataset.removeItem);
    if (state.mode === "service") state.services = state.services.filter((s) => s.id !== id);
    else state.budgetItems = state.budgetItems.filter((s) => s.id !== id);
    renderAll();
  }));

  const addItemBtn = document.getElementById("btn-add-item");
  if (addItemBtn) addItemBtn.addEventListener("click", () => {
    if (state.mode === "service") state.services.push({ id: nextId(), description: "Novo serviço" });
    else state.budgetItems.push({ id: nextId(), description: "Novo item", unit: 0 });
    renderAll();
  });

  el.querySelectorAll("[data-budget-unit]").forEach((input) => {
    input.addEventListener("input", () => {
      const id = Number(input.dataset.budgetUnit);
      const item = state.budgetItems.find((i) => i.id === id);
      if (item) item.unit = Number(input.value) || 0;
      renderPreview();
      const total = document.querySelector(".total-mini strong");
      if (total) total.textContent = money(currentTotal());
    });
  });

  const equipmentCountSelect = document.getElementById("equipment-count");
  if (equipmentCountSelect) equipmentCountSelect.addEventListener("change", () => {
    changeEquipmentCount(Number(equipmentCountSelect.value));
    renderAll();
  });

  const addEquipmentBtn = document.getElementById("btn-add-equipment");
  if (addEquipmentBtn) addEquipmentBtn.addEventListener("click", () => {
    changeEquipmentCount(state.equipmentCount + 1);
    renderAll();
  });

  el.querySelectorAll("[data-add-eq-item]").forEach((btn) => btn.addEventListener("click", () => {
    const eq = state.equipment.find((e) => e.id === Number(btn.dataset.addEqItem));
    if (eq) eq.items.push({ id: nextId(), description: "Novo item ou serviço", value: 0 });
    renderAll();
  }));

  el.querySelectorAll("[data-eq-item-field]").forEach((input) => {
    input.addEventListener("input", () => {
      const [eqId, itemId] = input.closest("[data-eq-item]").dataset.eqItem.split(":").map(Number);
      const eq = state.equipment.find((e) => e.id === eqId);
      const item = eq && eq.items.find((i) => i.id === itemId);
      if (item) item[input.dataset.eqItemField] = input.dataset.eqItemField === "value" ? Number(input.value) || 0 : input.value;
      renderPreview();
    });
  });

  document.getElementById("btn-print").addEventListener("click", handlePrint);
  document.getElementById("btn-download").addEventListener("click", handleDownloadPdf);
  document.getElementById("btn-reset").addEventListener("click", resetAll);
  document.getElementById("btn-reset-top").addEventListener("click", resetAll);

  document.getElementById("toggle-signature").addEventListener("change", (e) => {
    state.showSignature = e.target.checked;
    renderPreview();
  });
}

function changeEquipmentCount(count) {
  const safe = Math.max(1, Math.min(10, count));
  state.equipmentCount = safe;
  if (safe <= state.equipment.length) {
    state.equipment = state.equipment.slice(0, safe);
  } else {
    const extra = Array.from({ length: safe - state.equipment.length }, () => ({
      id: nextId(), name: "Novo equipamento", brand: "", model: "", serial: "", defect: "", evaluation: "", items: [],
    }));
    state.equipment = [...state.equipment, ...extra];
  }
}

function resetAll() {
  state = initialState();
  renderAll();
}

/* ---------------------------------- Preview ---------------------------------- */

function renderPreview() {
  const info = modeInfo[state.mode];
  const total = currentTotal();
  const paper = document.getElementById("paper");

  const bodySection = state.mode === "report" ? reportPreviewBody(total) : `
    <div class="paper-box services-box">
      <div class="paper-section-title"><span class="section-icon">⌁</span>${state.mode === "service" ? "SERVIÇOS REALIZADOS" : "ITENS DO ORÇAMENTO"}</div>
      <ol>
        ${(state.mode === "service" ? state.services : state.budgetItems).map((item) => `
          <li>${esc(item.description) || "Item não informado"}${state.mode === "budget" ? `<b class="list-value">${money(item.unit)}</b>` : ""}</li>`).join("")}
      </ol>
    </div>
    <div class="paper-box values-box">
      <div class="paper-section-title"><span class="section-icon">$</span>VALORES</div>
      <div class="paper-values">
        ${state.mode === "service"
          ? `<div><span>Mão de obra:</span><b>${money(state.labor)}</b></div><div><span>Materiais:</span><b>${money(state.materials)}</b></div>`
          : state.budgetItems.map((item) => `<div><span>${esc(item.description)}</span><b>${money(item.unit)}</b></div>`).join("")}
      </div>
      <div class="paper-total">TOTAL: ${money(total)}</div>
    </div>`;

  const closingSection = state.mode === "report" ? `
    <div class="paper-box report-summary">
      <div class="paper-section-title"><span class="section-icon">✓</span>OBSERVAÇÕES GERAIS</div>
      <p>${esc(state.notes)}</p>
      <p>${esc(state.warranty)}</p>
    </div>` : "";

  paper.innerHTML = `
    <div class="paper-header">
      <div class="paper-brand">
        <div class="brand-mark">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 4 L88 18 V48 C88 75 72 90 50 97 C28 90 12 75 12 48 V18 Z" fill="var(--navy)"/>
            <circle cx="50" cy="53" r="11" fill="none" stroke="#fff" stroke-width="5"/>
            <circle cx="50" cy="53" r="2.6" fill="#fff"/>
            <g fill="#fff">
              <rect x="47" y="31" width="6" height="8" rx="1.2" transform="rotate(0 50 53)"/>
              <rect x="47" y="31" width="6" height="8" rx="1.2" transform="rotate(45 50 53)"/>
              <rect x="47" y="31" width="6" height="8" rx="1.2" transform="rotate(90 50 53)"/>
              <rect x="47" y="31" width="6" height="8" rx="1.2" transform="rotate(135 50 53)"/>
              <rect x="47" y="31" width="6" height="8" rx="1.2" transform="rotate(180 50 53)"/>
              <rect x="47" y="31" width="6" height="8" rx="1.2" transform="rotate(225 50 53)"/>
              <rect x="47" y="31" width="6" height="8" rx="1.2" transform="rotate(270 50 53)"/>
              <rect x="47" y="31" width="6" height="8" rx="1.2" transform="rotate(315 50 53)"/>
            </g>
          </svg>
        </div>
        <div class="brand-text">
          <div class="brand-name"><b>MasterServ</b><strong>Limeira</strong></div>
          <small>SERVIÇOS TÉCNICOS</small>
          <div class="brand-contact">
            <span>(19) 99300-7408</span>
            <span>masterservlimeira@gmail.com</span>
            <span>CNPJ 63.906.113/0001-70</span>
          </div>
        </div>
      </div>
      <div class="paper-title">${info.title}</div>
    </div>
    <div class="paper-rule"></div>

    <div class="paper-box client-box">
      <div class="paper-section-title"><span class="section-icon">●</span>DADOS DO CLIENTE</div>
      <div class="client-grid">
        <p><b>Cliente:</b> ${esc(state.client) || "—"}</p>
        <p><b>Local:</b> ${esc(state.location) || "—"}</p>
        <p><b>Data:</b> ${esc(state.date) || "—"}</p>
      </div>
    </div>

    ${bodySection}
    ${closingSection}

    <div class="paper-footer">
      ${state.showSignature ? `
      <div class="signature">
        <span>Assinatura e Carimbo do Técnico Responsável</span>
        <div class="signature-line"></div>
        <small>Data: ${esc(state.date) || "—"}</small>
      </div>` : ""}
      <div class="footer-note">${info.icon} Documento gerado no padrão MasterServ Limeira</div>
    </div>
  `;

  document.getElementById("preview-meta").textContent = `A4 · ${state.mode === "report" ? `${state.equipment.length} equipamentos` : "1 página"}`;
}

function reportPreviewBody(total) {
  return `
    ${state.equipment.map((e, i) => `
      <div class="paper-box equipment-preview">
        <div class="equipment-ribbon">EQUIPAMENTO ${String(i + 1).padStart(2, "0")}</div>
        <div class="equipment-grid">
          <div>
            <div class="paper-section-title"><span class="section-icon">⌘</span>DADOS DO APARELHO</div>
            <p><b>Equipamento:</b> ${esc(e.name)}</p>
            <p><b>Marca:</b> ${esc(e.brand) || "—"}</p>
            <p><b>Modelo:</b> ${esc(e.model) || "—"}</p>
            <p><b>Série:</b> ${esc(e.serial) || "—"}</p>
            <p><b>Defeito:</b> ${esc(e.defect) || "—"}</p>
          </div>
          <div>
            <div class="paper-section-title"><span class="section-icon">☷</span>AVALIAÇÃO TÉCNICA</div>
            <p>${esc(e.evaluation) || "Avaliação não informada."}</p>
            <p><b>Conclusão:</b> equipamento avaliado conforme os danos e condições observadas.</p>
          </div>
        </div>
        <div class="mini-table">
          <div class="mini-table-head"><span>DESCRIÇÃO DA PEÇA / SERVIÇO</span><span>VALOR</span></div>
          ${e.items.map((item) => `<div class="mini-table-row"><span>${esc(item.description)}</span><b>${money(item.value)}</b></div>`).join("")}
        </div>
      </div>`).join("")}
    <div class="paper-box grand-total"><span>VALOR TOTAL DO LAUDO</span><strong>${money(total)}</strong></div>`;
}

function renderAll() {
  renderEditor();
  renderPreview();
}

/* ---------------------------------- Ações: imprimir / baixar ---------------------------------- */

function handlePrint() {
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    window.alert("Não foi possível abrir a janela de impressão. Verifique se os pop-ups estão permitidos.");
    return;
  }
  const paper = document.getElementById("paper");
  const styles = Array.from(document.querySelectorAll("style, link[rel=stylesheet]")).map((node) => node.outerHTML).join("");
  const info = modeInfo[state.mode];

  printWindow.document.open();
  printWindow.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${info.title}</title>${styles}<style>body{background:#fff!important;margin:0}.paper{box-shadow:none!important;border:0!important;max-width:none!important;width:100%!important;padding:22px 28px!important;min-height:auto!important}.paper-box{break-inside:avoid}.paper-footer{break-inside:avoid}@page{size:A4;margin:0}</style></head><body><article class="paper">${paper.innerHTML}</article></body></html>`);
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => {
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  }, 300);
}

async function handleDownloadPdf() {
  const overlay = document.getElementById("download-overlay");
  const btn = document.getElementById("btn-download");
  const paper = document.getElementById("paper");

  if (typeof html2canvas === "undefined" || typeof window.jspdf === "undefined") {
    window.alert("Não foi possível carregar o gerador de PDF (verifique sua conexão com a internet) e imprima usando o botão Imprimir.");
    return;
  }

  overlay.hidden = false;
  btn.disabled = true;
  paper.classList.add("pdf-capture");
  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginMm = 8;
    const contentWidthMm = pageWidth - marginMm * 2;
    const maxContentHeightMm = pageHeight - marginMm * 2;

    // Estima a altura total do documento (em mm) a partir do próprio DOM,
    // sem precisar renderizar tudo antes de decidir a estratégia.
    const widthPx = paper.getBoundingClientRect().width || paper.offsetWidth;
    const mmPerPx = contentWidthMm / widthPx;
    const naturalHeightMm = paper.scrollHeight * mmPerPx;

    if (naturalHeightMm <= maxContentHeightMm * 1.35) {
      // Cabe (ou quase cabe) em 1 folha: captura tudo de uma vez e, se
      // necessário, reduz levemente a escala para caber sem cortar nada.
      const canvas = await html2canvas(paper, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const canvasHeightMm = (canvas.height * contentWidthMm) / canvas.width;
      const scale = Math.min(1, maxContentHeightMm / canvasHeightMm);
      const drawWidth = contentWidthMm * scale;
      const drawHeight = canvasHeightMm * scale;
      const x = marginMm + (contentWidthMm - drawWidth) / 2;
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", x, marginMm, drawWidth, drawHeight);
    } else {
      // Documento mais longo: cada bloco (cabeçalho, cada caixa, rodapé) é
      // capturado separadamente e nunca é dividido entre duas páginas —
      // se não couber no espaço restante, pula inteiro para a próxima página.
      const blocks = Array.from(paper.children);
      let currentY = marginMm;
      const gapMm = 3;

      for (const block of blocks) {
        if (block.offsetHeight < 1) continue; // ignora elementos vazios/invisíveis
        const canvas = await html2canvas(block, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
        let blockHeightMm = (canvas.height * contentWidthMm) / canvas.width;
        let drawWidth = contentWidthMm;

        if (blockHeightMm > maxContentHeightMm) {
          // Bloco maior que uma página inteira (raro): reduz só este bloco
          // para caber por inteiro em vez de cortá-lo.
          const s = maxContentHeightMm / blockHeightMm;
          drawWidth = contentWidthMm * s;
          blockHeightMm = maxContentHeightMm;
        }

        if (currentY + blockHeightMm > pageHeight - marginMm && currentY > marginMm) {
          pdf.addPage();
          currentY = marginMm;
        }

        const x = marginMm + (contentWidthMm - drawWidth) / 2;
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", x, currentY, drawWidth, blockHeightMm);
        currentY += blockHeightMm + gapMm;
      }
    }

    const safeClient = (state.client || "cliente").trim().replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase();
    const filename = `${state.mode}-masterserv-${safeClient || "documento"}.pdf`;
    pdf.save(filename);
  } catch (err) {
    console.error(err);
    window.alert("Ocorreu um erro ao gerar o PDF. Tente usar o botão Imprimir e salvar como PDF pelo navegador.");
  } finally {
    paper.classList.remove("pdf-capture");
    overlay.hidden = true;
    btn.disabled = false;
  }
}

/* ---------------------------------- Início ---------------------------------- */

renderAll();
