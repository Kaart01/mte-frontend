// script_v2.js
document.addEventListener("DOMContentLoaded", () => {

  const baseURL = "https://mte-backend.onrender.com"; // <- keep this

  const moduleSearch = document.getElementById("moduleSearch");
  const moduleSelect = document.getElementById("moduleSelect");
  const modelSearch = document.getElementById("modelSearch");
  const modelSelect = document.getElementById("modelSelect");
  const variantSearch = document.getElementById("variantSearch");
  const variantSelect = document.getElementById("variantSelect");
  const calculateBtn = document.getElementById("calculateBtn");
  const totalMte = document.getElementById("totalMte");
  const selectedChips = document.getElementById("selectedChips");
  const clearAllBtn = document.getElementById("clearAllBtn");
  const loadingOverlay = document.getElementById("loadingOverlay");

  let cachedModules = [], cachedModels = {}, cachedVariants = {};
  let selectedVariants = {};

  function debounce(fn, delay=300){
    let timeout;
    return (...args)=>{
      clearTimeout(timeout);
      timeout = setTimeout(()=>fn(...args), delay);
    };
  }

  // --- utilities
  function renderDropdown(items, selectEl){
    if(!selectEl) return;
    selectEl.innerHTML = "";
    if(!items || !items.length){
      const opt = document.createElement("option");
      opt.disabled = true;
      opt.textContent = "No items";
      selectEl.appendChild(opt);
      return;
    }
    items.forEach(item=>{
      const opt = document.createElement("option");
      opt.value = typeof item === "string" ? item : (item.variant_name || item.model_name || item);
      opt.textContent = typeof item === "string" ? item : (item.variant_name || item.model_name || item);
      selectEl.appendChild(opt);
    });
  }

  // --- Fetch helpers with better errors
  async function safeFetchJson(url, opts = {}) {
  console.log("Fetching URL:", url); // log the URL
  try {
    const res = await fetch(url, opts);
    console.log("Response status:", res.status); // log status code
    if(!res.ok) {
      const text = await res.text().catch(()=>"");
      console.error("Fetch failed:", text);
      throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
    }
    const data = await res.json();
    console.log("Data received:", data); // log data
    return data;
  } catch(err) {
    console.error("Fetch error:", err);
    throw err;
  }
}


  // --- Load Modules
  async function loadModules(){
    try {
      const modules = await safeFetchJson(`${baseURL}/modules`);
      cachedModules = modules;
      renderDropdown(cachedModules, moduleSelect);
    } catch(e){
      console.error("Failed to load modules:", e);
      moduleSelect.innerHTML = "<option disabled>Failed to load modules</option>";
      alert("Failed to load modules. Check backend or network (see console).");
    }
  }

  // --- Load models for a module
  async function loadModels(module){
    modelSelect.innerHTML = "<option disabled>Loading...</option>";
    try {
      if(cachedModels[module]){
        renderDropdown(cachedModels[module], modelSelect);
      } else {
        const data = await safeFetchJson(`${baseURL}/models/${encodeURIComponent(module)}`);
        const models = data.map(m => m.model_name);
        cachedModels[module] = models;
        renderDropdown(models, modelSelect);
      }
      modelSearch.disabled = false;
      variantSelect.disabled = true;
      variantSelect.innerHTML = "";
    } catch(e){
      console.error("Failed to load models:", e);
      modelSelect.innerHTML = "<option disabled>Failed to load models</option>";
      alert("Failed to load models. Check backend (console).");
    }
  }

  // --- Load variants for a model
  async function loadVariants(model){
    variantSelect.innerHTML = "<option disabled>Loading...</option>";
    try {
      if(cachedVariants[model]){
        renderDropdown(cachedVariants[model].map(v=>v.variant_name), variantSelect);
      } else {
        const data = await safeFetchJson(`${baseURL}/variants/${encodeURIComponent(model)}`);
        cachedVariants[model] = data;
        renderDropdown(data.map(v=>v.variant_name), variantSelect);
      }
      variantSearch.disabled = false;
    } catch(e){
      console.error("Failed to load variants:", e);
      variantSelect.innerHTML = "<option disabled>Failed to load variants</option>";
      alert("Failed to load variants. Check backend (console).");
    }
  }

  // --- Event wiring
  moduleSearch?.addEventListener("input", debounce(()=> {
    const q = moduleSearch.value.trim().toLowerCase();
    const filtered = cachedModules.filter(m => m.toLowerCase().includes(q));
    renderDropdown(filtered, moduleSelect);
  }));

  modelSearch?.addEventListener("input", debounce(()=> {
    const models = cachedModels[moduleSelect.value] || [];
    const q = modelSearch.value.trim().toLowerCase();
    renderDropdown(models.filter(m => m.toLowerCase().includes(q)), modelSelect);
  }));

  variantSearch?.addEventListener("input", debounce(()=> {
    const variants = cachedVariants[modelSelect.value] || [];
    const q = variantSearch.value.trim().toLowerCase();
    renderDropdown(variants.filter(v => v.variant_name.toLowerCase().includes(q)).map(v => v.variant_name), variantSelect);
  }));

  moduleSelect?.addEventListener("change", async ()=>{
    const m = moduleSelect.value;
    modelSearch.value = "";
    variantSearch.value = "";
    if(m) await loadModels(m);
  });

  modelSelect?.addEventListener("change", async ()=>{
    const mm = modelSelect.value;
    variantSearch.value = "";
    if(mm) await loadVariants(mm);
  });

  variantSelect?.addEventListener("change", ()=>{
    const vname = variantSelect.value;
    if(!vname || selectedVariants[vname]) return;
    // find full object if available
    const vobj = (cachedVariants[modelSelect.value] || []).find(v => v.variant_name === vname) || { variant_name: vname };
    selectedVariants[vname] = vobj;
    renderChips();
  });

  function renderChips(){
    selectedChips.innerHTML = "";
    Object.values(selectedVariants).forEach(v => {
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.innerHTML = `${v.module_name || ""} ${v.model_name ? "> "+v.model_name : ""} > ${v.variant_name || v} <span class="remove">&times;</span>`;
      chip.querySelector(".remove").addEventListener("click", ()=>{
        delete selectedVariants[v.variant_name || v];
        renderChips();
      });
      selectedChips.appendChild(chip);
    });
  }

  clearAllBtn?.addEventListener("click", ()=>{
    selectedVariants = {};
    renderChips();
    totalMte.textContent = "0";
  });

  calculateBtn?.addEventListener("click", async ()=>{
    const names = Object.keys(selectedVariants);
    if(!names.length) return alert("Select variants first!");
    loadingOverlay.style.display = "flex";
    try {
      const res = await safeFetchJson(`${baseURL}/calculate_mte`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({variants: names})
      });
      totalMte.textContent = (res.overall_mte || 0).toFixed(2);
    } catch(e){
      console.error("Calculation failed:", e);
      alert("Failed to calculate MTE. See console for details.");
    } finally {
      loadingOverlay.style.display = "none";
    }
  });

  // initial
  loadModules();

});

