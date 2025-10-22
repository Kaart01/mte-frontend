const baseURL = "https://mte-backend.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const moduleDropdown = document.getElementById("moduleDropdown");
    const modelDropdown = document.getElementById("modelDropdown");
    const variantDropdown = document.getElementById("variantDropdown");

    // Load modules initially
    loadModules();

    // Event listeners
    moduleDropdown.onchange = () => {
        modelDropdown.innerHTML = "<option value=''>Select Model</option>";
        variantDropdown.innerHTML = "<option value=''>Select Variant</option>";
        if (moduleDropdown.value) {
            loadModels(moduleDropdown.value);
        }
    };

    modelDropdown.onchange = () => {
        variantDropdown.innerHTML = "<option value=''>Select Variant</option>";
        if (modelDropdown.value) {
            loadVariants(modelDropdown.value);
        }
    };
});

async function loadModules() {
    try {
        const res = await fetch(`${baseURL}/modules`);
        const modules = await res.json();

        const moduleDropdown = document.getElementById("moduleDropdown");
        moduleDropdown.innerHTML = "<option value=''>Select Module</option>";

        modules.forEach(m => {
            const option = document.createElement("option");
            option.value = m;
            option.textContent = m;
            moduleDropdown.appendChild(option);
        });
    } catch (err) {
        console.error("Error loading modules:", err);
        alert("Failed to load modules. Check your backend URL.");
    }
}

async function loadModels(selectedModule) {
    if (!selectedModule) return;

    try {
        const res = await fetch(`${baseURL}/models/${encodeURIComponent(selectedModule)}`);
        const models = await res.json();

        const modelDropdown = document.getElementById("modelDropdown");
        modelDropdown.innerHTML = "<option value=''>Select Model</option>";

        models.forEach(m => {
            const option = document.createElement("option");
            option.value = m.model_name;
            option.textContent = m.model_name;
            modelDropdown.appendChild(option);
        });
    } catch (err) {
        console.error("Error loading models:", err);
        alert("Failed to load models. Check your backend URL.");
    }
}

async function loadVariants(selectedModel) {
    if (!selectedModel) return;

    try {
        const res = await fetch(`${baseURL}/variants/${encodeURIComponent(selectedModel)}`);
        const variants = await res.json();

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
        alert("Failed to load variants. Check your backend URL.");
    }
}


async function loadModules() {
    try {
        const res = await fetch(`${baseURL}/modules`);
        const modules = await res.json();

        const moduleDropdown = document.getElementById("moduleDropdown");
        moduleDropdown.innerHTML = "<option value=''>Select Module</option>";

        modules.forEach(m => {
            const option = document.createElement("option");
            option.value = m;
            option.textContent = m;
            moduleDropdown.appendChild(option);
        });
    } catch (err) {
        console.error("Error loading modules:", err);
    }
}

async function loadModels(selectedModule) {
    if (!selectedModule) return;

    try {
        const res = await fetch(`${baseURL}/models/${encodeURIComponent(selectedModule)}`);
        const models = await res.json();

        const modelDropdown = document.getElementById("modelDropdown");
        modelDropdown.innerHTML = "<option value=''>Select Model</option>";

        models.forEach(m => {
            const option = document.createElement("option");
            option.value = m.model_name;
            option.textContent = m.model_name;
            modelDropdown.appendChild(option);
        });
    } catch (err) {
        console.error("Error loading models:", err);
    }
}

async function loadVariants(selectedModel) {
    if (!selectedModel) return;

    try {
        const res = await fetch(`${baseURL}/variants/${encodeURIComponent(selectedModel)}`);
        const variants = await res.json();

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


