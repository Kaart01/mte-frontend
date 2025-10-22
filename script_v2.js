const baseURL = "https://mte-backend.onrender.com";

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

// --- Debounce ---
function debounce(fn, delay=300){
  let timeout;
  return (...args)=>{
    clearTimeout(timeout);
    timeout = setTimeout(()=>fn(...args), delay);
  };
}

// --- Load Modules ---
async function loadModules(){
  if(cachedModules.length) return;
  const res = await fetch(`${baseURL}/modules`);
  cachedModules = await res.json();
  renderDropdown(cachedModules, moduleSelect);
}

// --- Load Models ---
async function loadModels(module){
  if(cachedModels[module]){
    renderDropdown(cachedModels[module], modelSelect);
  } else {
    const res = await fetch(`${baseURL}/models/${encodeURIComponent(module)}`);
    const data = await res.json();
    const models = data.map(m=>m.model_name);
    cachedModels[module] = models;
    renderDropdown(models, modelSelect);
  }
  modelSearch.disabled = false;
  variantSelect.disabled = true;
  variantSelect.innerHTML = "";
}

// --- Load Variants ---
async function loadVariants(model){
  if(cachedVariants[model]){
    renderDropdown(cachedVariants[model].map(v=>v.variant_name), variantSelect);
  } else {
    const res = await fetch(`${baseURL}/variants/${encodeURIComponent(model)}`);
    const data = await res.json();
    cachedVariants[model] = data;
    renderDropdown(data.map(v=>v.variant_name), variantSelect);
  }
  variantSearch.disabled = false;
}

// --- Render Dropdown ---
function renderDropdown(items, selectEl){
  selectEl.innerHTML = "";
  items.forEach(item=>{
    const opt = document.createElement("option");
    opt.value = typeof item === "string" ? item : item.variant_name;
    opt.textContent = typeof item === "string" ? item : item.variant_name;
    selectEl.appendChild(opt);
  });
}

// --- Search Handlers ---
moduleSearch.addEventListener("input", debounce(()=>{
  const filtered = cachedModules.filter(m=>m.toLowerCase().includes(moduleSearch.value.toLowerCase()));
  renderDropdown(filtered, moduleSelect);
}));

modelSearch.addEventListener("input", debounce(()=>{
  const models = cachedModels[moduleSelect.value] || [];
  renderDropdown(models.filter(m=>m.toLowerCase().includes(modelSearch.value.toLowerCase())), modelSelect);
}));

variantSearch.addEventListener("input", debounce(()=>{
  const variants = cachedVariants[modelSelect.value] || [];
  renderDropdown(
    variants.filter(v=>v.variant_name.toLowerCase().includes(variantSearch.value.toLowerCase())).map(v=>v.variant_name),
    variantSelect
  );
}));

// --- Module Select ---
moduleSelect.addEventListener("change", async ()=>{
  const module = moduleSelect.value;
  if(module){
    await loadModels(module);
    modelSelect.disabled=false;
    variantSelect.disabled=true;
    variantSelect.innerHTML="";
    modelSearch.value="";
    variantSearch.value="";
  }
});

// --- Model Select ---
modelSelect.addEventListener("change", async ()=>{
  const model = modelSelect.value;
  if(model){
    await loadVariants(model);
    variantSelect.disabled=false;
    variantSearch.value="";
  }
});

// --- Variant Select ---
variantSelect.addEventListener("change", ()=>{
  const vname = variantSelect.value;
  if(!selectedVariants[vname]){
    const vobj = cachedVariants[modelSelect.value].find(v=>v.variant_name===vname);
    if(vobj){
      selectedVariants[vname] = vobj;
      renderChips();
    }
  }
});

// --- Render Chips ---
function renderChips(){
  selectedChips.innerHTML="";
  Object.values(selectedVariants).forEach(v=>{
    const chip = document.createElement("div");
    chip.className="chip";
    chip.innerHTML = `${v.module_name} > ${v.model_name} > ${v.variant_name} (${v.MTE}) <span class="remove">&times;</span>`;
    chip.querySelector(".remove").addEventListener("click", ()=>{
      delete selectedVariants[v.variant_name];
      renderChips();
    });
    selectedChips.appendChild(chip);
  });
}

// --- Clear All ---
clearAllBtn.addEventListener("click", ()=>{
  selectedVariants={};
  renderChips();
  totalMte.textContent="0";
  moduleSearch.value="";
  modelSearch.value="";
  variantSearch.value="";
  renderDropdown(cachedModules, moduleSelect);
  modelSelect.innerHTML="";
  variantSelect.innerHTML="";
  modelSelect.disabled = true;
  variantSelect.disabled = true;
});

// --- Calculate MTE ---
calculateBtn.addEventListener("click", async ()=>{
  const names = Object.keys(selectedVariants);
  if(!names.length) return alert("Select variants first!");
  loadingOverlay.style.display="flex";
  const res = await fetch(`${baseURL}/calculate_mte`, {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({variants:names})
  });
  const data = await res.json();
  totalMte.textContent = data.overall_mte.toFixed(2);
  loadingOverlay.style.display="none";
});

// --- Init ---
loadModules();





