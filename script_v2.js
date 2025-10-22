const baseURL = "https://mte-backend.onrender.com";

console.log("✅ script.js loaded");

window.addEventListener("load", () => {
  console.log("✅ Page fully loaded");
  loadModules();
});

async function loadModules() {
  try {
    console.log("Fetching modules...");
    const res = await fetch(`${baseURL}/modules`);
    const modules = await res.json();
    console.log("Modules loaded:", modules);

    const moduleDropdown = document.getElementById("moduleDropdown");
    moduleDropdown.innerHTML = "<option value=''>Select Module</option>";

    modules.forEach(m => {
      const option = document.createElement("option");
      option.value = m;
      option.textContent = m;
      moduleDropdown.appendChild(option);
    });

    // When module changes, load models
    moduleDropdown.addEventListener("change", () => {
      const selectedModule = moduleDropdown.value;
      if (selectedModule) loadModels(selectedModule);
    });

  } catch (err) {
    console.error("Error loading modules:", err);
  }
}

async function loadModels(selectedModule) {
  try {
    console.log("Fetching models for:", selectedModule);
    const res = await fetch(`${baseURL}/models/${encodeURIComponent(selectedModule)}`);
    const models = await res.json();
    console.log("Models loaded:", models);

    const modelDropdown = document.getElementById("modelDropdown");
    modelDropdown.innerHTML = "<option value=''>Select Model</option>";

    models.forEach(m => {
      const option = document.createElement("option");
      option.value = m.model_name;
      option.textContent = m.model_name;
      modelDropdown.appendChild(option);
    });

    // When model changes, load variants
    modelDropdown.addEventListener("change", () => {
      const selectedModel = modelDropdown.value;
      if (selectedModel) loadVariants(selectedModel);
    });

  } catch (err) {
    console.error("Error loading models:", err);
  }
}

async function loadVariants(selectedModel) {
  try {
    console.log("Fetching variants for:", selectedModel);
    const res = await fetch(`${baseURL}/variants/${encodeURIComponent(selectedModel)}`);
    const variants = await res.json();
    console.log("Variants loaded:", variants);

    const variantDropdown = document.getElementById("variantDropdown");
    variantDropdown.innerHTML = "<option value=''>Select Variant</option>";

    variants.forEach(v => {
      const option = document.createElement("option");
      option.value = v.variant_name;
      option.textContent = `${v.variant_name} (${v.MTE})`;
      variantDropdown.appendChild(option);
    });

  } catch (err) {
    console.error("Error loading variants:", err);
  }
}



