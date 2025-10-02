// Variables globales
let aiData = null;

// Función para eliminar gasto
async function eliminarGasto(id) {
    if (confirm('¿Estás seguro de eliminar este gasto?')) {
        try {
            const response = await fetch(`/gastos/${id}`, { method: 'DELETE' });
            if (response.ok) {
                location.reload();
            } else {
                alert('Error eliminando gasto');
            }
        } catch (error) {
            alert('Error eliminando gasto');
        }
    }
}

// Función para eliminar ingreso
async function eliminarIngreso(id) {
    if (confirm('¿Estás seguro de eliminar este ingreso?')) {
        try {
            const response = await fetch(`/ingresos/${id}`, { method: 'DELETE' });
            if (response.ok) {
                location.reload();
            } else {
                alert('Error eliminando ingreso');
            }
        } catch (error) {
            alert('Error eliminando ingreso');
        }
    }
}

// Función para eliminar categoría
async function eliminarCategoria(id) {
    if (confirm('¿Estás seguro de eliminar esta categoría? Solo se puede eliminar si no tiene gastos o ingresos asociados.')) {
        try {
            const response = await fetch(`/categorias/${id}`, { method: 'DELETE' });
            const result = await response.json();
            
            if (response.ok) {
                alert('Categoría eliminada correctamente');
                location.reload();
            } else {
                alert(result.error || 'Error eliminando categoría');
            }
        } catch (error) {
            alert('Error eliminando categoría');
        }
    }
}

// Función para editar categoría
async function editarCategoria(id) {
    try {
        const response = await fetch(`/api/categorias/${id}`);
        const categoria = await response.json();
        
        if (response.ok) {
            document.getElementById('editCategoriaId').value = categoria.id;
            document.getElementById('editNombreCategoria').value = categoria.nombre;
            document.getElementById('editDescripcionCategoria').value = categoria.descripcion || '';
            document.getElementById('editColor').value = categoria.color;
            
            const tipoDiv = document.getElementById('editTipoCategoria');
            const tipoIcon = categoria.tipo_categoria === 'gasto' ? 'arrow-down-circle' : 'arrow-up-circle';
            const tipoColor = categoria.tipo_categoria === 'gasto' ? 'danger' : 'success';
            const tipoTexto = categoria.tipo_categoria === 'gasto' ? 'Gasto' : 'Ingreso';
            
            tipoDiv.innerHTML = `<i class="bi bi-${tipoIcon} text-${tipoColor}"></i> ${tipoTexto}`;
            
            const modal = new bootstrap.Modal(document.getElementById('editarCategoriaModal'));
            modal.show();
        } else {
            alert('Error cargando datos de la categoría');
        }
    } catch (error) {
        alert('Error cargando datos de la categoría');
    }
}

// Función para guardar cambios de categoría
async function guardarCambiosCategoria() {
    try {
        const id = document.getElementById('editCategoriaId').value;
        const nombre = document.getElementById('editNombreCategoria').value;
        const descripcion = document.getElementById('editDescripcionCategoria').value;
        const color = document.getElementById('editColor').value;
        
        if (!nombre.trim()) {
            alert('El nombre de la categoría es obligatorio');
            return;
        }
        
        const response = await fetch(`/categorias/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre.trim(),
                descripcion: descripcion.trim() || null,
                color: color
            })
        });
        
        if (response.ok) {
            alert('Categoría actualizada correctamente');
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarCategoriaModal'));
            modal.hide();
            location.reload();
        } else {
            const result = await response.json();
            alert(result.error || 'Error actualizando categoría');
        }
    } catch (error) {
        alert('Error actualizando categoría');
    }
}

// Funciones del AI Scanner
function procesarArchivo(input) {
    const file = input.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
        alert('Formato de archivo no válido. Solo se permiten JPG, PNG y PDF.');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB.');
        return;
    }

    mostrarProgreso();

    const formData = new FormData();
    formData.append('document', file);

    fetch('/ai/procesar-documento', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        completarProgreso();
        
        if (data.success) {
            mostrarResultadoIA(data.result);
        } else {
            alert('Error procesando el documento: ' + (data.error || 'Error desconocido'));
        }
    })
    .catch(error => {
        completarProgreso();
        alert('Error procesando el documento');
        console.error(error);
    });
}

function mostrarProgreso() {
    document.querySelector('.upload-progress').style.display = 'block';
    document.querySelector('.ai-upload-area').style.display = 'none';
    
    let progress = 0;
    const progressBar = document.querySelector('.upload-progress .progress-bar');
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Incremento más consistente
        if (progress > 95) progress = 95; // Dejar 5% para completar manualmente
        progressBar.style.width = progress + '%';
    }, 300); // Más frecuente para mayor suavidad
    
    window.progressInterval = interval;
    window.currentProgress = progress;
}

function completarProgreso() {
    // Función para completar el progreso al 100%
    const progressBar = document.querySelector('.upload-progress .progress-bar');
    if (progressBar) {
        progressBar.style.width = '100%';
        setTimeout(() => {
            ocultarProgreso();
        }, 500); // Esperar un momento antes de ocultar
    }
}

function ocultarProgreso() {
    if (window.progressInterval) {
        clearInterval(window.progressInterval);
    }
    document.querySelector('.upload-progress').style.display = 'none';
    document.querySelector('.ai-upload-area').style.display = 'block';
    document.querySelector('.upload-progress .progress-bar').style.width = '0%';
}

function mostrarResultadoIA(result) {
    aiData = result;
    
    const aiDataDiv = document.getElementById('ai-data');
    aiDataDiv.innerHTML = `
        <div class="alert alert-success">
            <h6 class="mb-3"><i class="bi bi-robot"></i> Resultado del análisis AI - <small class="text-muted">Puedes editarlo antes de confirmar</small></h6>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Monto:</label>
                    <div class="input-group">
                        <span class="input-group-text">$</span>
                        <input type="number" class="form-control" id="ai-monto" value="${result.monto}" min="0" step="0.01">
                    </div>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Fecha:</label>
                    <input type="date" class="form-control" id="ai-fecha" value="${result.fecha}">
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Descripción:</label>
                    <input type="text" class="form-control" id="ai-descripcion" value="${result.descripcion || ''}" placeholder="Descripción del gasto">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Categoría:</label>
                    <select class="form-select" id="ai-categoria">
                        <option value="Alimentación" ${result.categoria === 'Alimentación' ? 'selected' : ''}>Alimentación</option>
                        <option value="Transporte" ${result.categoria === 'Transporte' ? 'selected' : ''}>Transporte</option>
                        <option value="Salud" ${result.categoria === 'Salud' ? 'selected' : ''}>Salud</option>
                        <option value="Hogar" ${result.categoria === 'Hogar' ? 'selected' : ''}>Hogar</option>
                        <option value="Servicios" ${result.categoria === 'Servicios' ? 'selected' : ''}>Servicios</option>
                        <option value="Entretenimiento" ${result.categoria === 'Entretenimiento' ? 'selected' : ''}>Entretenimiento</option>
                        <option value="Ropa" ${result.categoria === 'Ropa' ? 'selected' : ''}>Ropa</option>
                        <option value="Educación" ${result.categoria === 'Educación' ? 'selected' : ''}>Educación</option>
                        <option value="Otros" ${result.categoria === 'Otros' ? 'selected' : ''}>Otros</option>
                    </select>
                </div>
            </div>
            
            ${result.comercio ? `
            <div class="row">
                <div class="col-12 mb-3">
                    <label class="form-label fw-bold">Comercio:</label>
                    <input type="text" class="form-control" id="ai-comercio" value="${result.comercio}" placeholder="Nombre del comercio">
                </div>
            </div>
            ` : `
            <div class="row">
                <div class="col-12 mb-3">
                    <label class="form-label fw-bold">Comercio (opcional):</label>
                    <input type="text" class="form-control" id="ai-comercio" value="" placeholder="Nombre del comercio">
                </div>
            </div>
            `}
            
            <div class="row">
                <div class="col-12">
                    <label class="form-label fw-bold">Observaciones adicionales:</label>
                    <textarea class="form-control" id="ai-observaciones" rows="2" placeholder="Agregar notas adicionales..."></textarea>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('ai-result').style.display = 'block';
}

function confirmarGasto() {
    if (!aiData) return;
    
    // Obtener valores editados del formulario
    const montoEditado = document.getElementById('ai-monto').value;
    const fechaEditada = document.getElementById('ai-fecha').value;
    const descripcionEditada = document.getElementById('ai-descripcion').value;
    const categoriaEditada = document.getElementById('ai-categoria').value;
    const comercioEditado = document.getElementById('ai-comercio').value;
    const observacionesEditadas = document.getElementById('ai-observaciones').value;
    
    // Validaciones básicas
    if (!montoEditado || parseFloat(montoEditado) <= 0) {
        alert('Por favor ingresa un monto válido');
        document.getElementById('ai-monto').focus();
        return;
    }
    
    if (!fechaEditada) {
        alert('Por favor selecciona una fecha');
        document.getElementById('ai-fecha').focus();
        return;
    }
    
    if (!descripcionEditada.trim()) {
        alert('Por favor ingresa una descripción');
        document.getElementById('ai-descripcion').focus();
        return;
    }
    
    // Crear el gasto con los datos editados
    const gastoData = {
        descripcion: descripcionEditada.trim(),
        monto: parseFloat(montoEditado),
        fecha_gasto: fechaEditada,
        tipo_gasto: 'variable',
        metodo_pago: 'otro',
        observaciones: `Procesado por IA${comercioEditado ? ` - ${comercioEditado}` : ''}${observacionesEditadas ? ` | ${observacionesEditadas}` : ''}`
    };
    
    fetch('/agregar-gasto', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(gastoData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('¡Gasto agregado exitosamente!');
            resetearIA();
            const gastosTab = new bootstrap.Tab(document.getElementById('gastos-tab'));
            gastosTab.show();
            setTimeout(() => location.reload(), 1000);
        } else {
            alert('Error agregando el gasto: ' + data.error);
        }
    })
    .catch(error => {
        alert('Error agregando el gasto');
        console.error(error);
    });
}

function resetearIA() {
    aiData = null;
    document.getElementById('ai-result').style.display = 'none';
    document.getElementById('file-input').value = '';
}

// Inicialización cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    // Drag and drop para el área de upload
    const uploadArea = document.querySelector('.ai-upload-area');
    
    if (uploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight(e) {
            uploadArea.classList.add('dragover');
        }
        
        function unhighlight(e) {
            uploadArea.classList.remove('dragover');
        }
        
        uploadArea.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                const fileInput = document.getElementById('file-input');
                fileInput.files = files;
                procesarArchivo(fileInput);
            }
        }
    }

    // Mejorar experiencia de entrada de números
    const montoInputs = document.querySelectorAll('input[type="number"]');
    montoInputs.forEach(input => {
        if (input.name === 'monto') {
            input.setAttribute('placeholder', 'Ej: 150000');
        }
        
        input.addEventListener('blur', function() {
            if (this.value && !isNaN(this.value)) {
                const formatted = parseFloat(this.value).toLocaleString('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                });
                this.setAttribute('title', `Formato: ${formatted}`);
            }
        });
        
        input.addEventListener('input', function() {
            const label = document.querySelector(`label[for="${this.id}"]`);
            if (label && this.value && !isNaN(this.value)) {
                const formatted = parseFloat(this.value).toLocaleString('es-AR');
                const originalText = label.textContent.split(' - ')[0];
                label.textContent = `${originalText} - $${formatted}`;
            } else if (label) {
                const originalText = label.textContent.split(' - ')[0];
                label.textContent = originalText;
            }
        });
        
        input.addEventListener('keypress', function(e) {
            if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true)) {
                return;
            }
            if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) {
                e.preventDefault();
            }
        });
    });
    
    // Inicializar el flow chart
    initializeFlowChart();
});

// Inicializar el gráfico de flujo
function initializeFlowChart() {
    console.log('🎯 Inicializando flow chart...');
    
    // Detectar si es móvil/tablet
    if (isMobileOrTablet()) {
        console.log('📱 Dispositivo móvil detectado, usando gráfico de pie...');
        createMobilePieChart();
        return;
    }
    
    const container = document.getElementById('sankeyChart');
    if (!container) {
        console.log('📊 No se encontró sankeyChart, usando Chart.js...');
        initializeChartJS();
        return;
    }
    
    // Verificar si D3 está disponible
    if (typeof d3 === 'undefined') {
        console.error('❌ D3.js no está disponible, usando Chart.js como fallback');
        initializeChartJS();
        return;
    }
    
    console.log('✅ D3.js disponible, creando diagrama Sankey...');
    createSankeyDiagram(container);
}

// Función fallback con Chart.js
function initializeChartJS() {
    const canvas = document.getElementById('flowChart');
    if (!canvas) {
        console.log('❌ No se encontró ningún contenedor para el chart');
        return;
    }
    
    console.log('📊 Inicializando Chart.js...');
    const ctx = canvas.getContext('2d');
    
    // Obtener datos del servidor (pasados desde el template)
    const totalIngresos = parseFloat(document.querySelector('.ingresos-card h4').textContent.replace(/[^\d.-]/g, '')) || 0;
    const totalGastos = parseFloat(document.querySelector('.gastos-card h4').textContent.replace(/[^\d.-]/g, '')) || 0;
    const balance = totalIngresos - totalGastos;
    
    console.log(`💰 Datos: Ingresos: ${totalIngresos}, Gastos: ${totalGastos}, Balance: ${balance}`);
    
    // Configuración del gráfico de barras horizontales
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Flujo Financiero'],
            datasets: [
                {
                    label: 'Ingresos',
                    data: [totalIngresos],
                    backgroundColor: 'rgba(25, 135, 84, 0.8)',
                    borderColor: 'rgba(25, 135, 84, 1)',
                    borderWidth: 2,
                    borderRadius: 5,
                    stack: 'flow'
                },
                {
                    label: 'Gastos',
                    data: [-totalGastos],
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 2,
                    borderRadius: 5,
                    stack: 'flow'
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Flujo de Dinero (Este Mes)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = Math.abs(context.parsed.x);
                            return context.dataset.label + ': $' + value.toLocaleString('es-AR');
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + Math.abs(value).toLocaleString('es-AR');
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                y: {
                    stacked: true,
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
    
    // Crear un segundo gráfico de dona para categorías si existe
    createCategoryChart();
}

// Función para detectar dispositivos móviles/tablets
function isMobileOrTablet() {
    return window.innerWidth <= 992 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Crear gráfico de pie optimizado para móviles
function createMobilePieChart() {
    const container = document.getElementById('sankeyChart');
    if (!container) return;
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Obtener datos de categorías con gastos reales
    const categoryElements = document.querySelectorAll('.category-stats');
    const categorias = [];
    
    // Función para parsear montos con formato argentino
    const parseArgentineAmount = (text) => {
        const cleaned = text
            .replace(/\./g, '')
            .replace(/,/g, '.')
            .replace(/[^\d.-]/g, '');
        return parseFloat(cleaned) || 0;
    };
    
    categoryElements.forEach(element => {
        const badge = element.querySelector('.categoria-badge');
        const amountText = element.querySelector('strong')?.textContent;
        
        if (badge && amountText) {
            const monto = parseArgentineAmount(amountText);
            
            if (monto > 0) {
                const computedColor = window.getComputedStyle(badge).backgroundColor;
                let color = '#007bff';
                
                if (computedColor && computedColor.startsWith('rgb')) {
                    const rgbMatch = computedColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
                    if (rgbMatch) {
                        const r = parseInt(rgbMatch[1]);
                        const g = parseInt(rgbMatch[2]);
                        const b = parseInt(rgbMatch[3]);
                        color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                    }
                } else if (computedColor && computedColor.startsWith('#')) {
                    color = computedColor;
                }
                
                categorias.push({
                    nombre: badge.textContent.trim(),
                    monto: monto,
                    color: color
                });
            }
        }
    });
    
    if (categorias.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #6c757d;">
                <div style="font-size: 36px; margin-bottom: 15px; opacity: 0.3;">📊</div>
                <h6 style="color: #495057; margin-bottom: 10px;">No hay gastos registrados</h6>
                <p style="font-size: 13px; line-height: 1.5;">
                    Agrega algunos gastos para ver la distribución por categorías.
                </p>
            </div>
        `;
        return;
    }
    
    // Crear canvas para Chart.js
    const canvas = document.createElement('canvas');
    canvas.id = 'mobilePieChart';
    canvas.style.maxHeight = '300px';
    container.appendChild(canvas);
    
    // Configurar datos para Chart.js
    const labels = categorias.map(cat => cat.nombre);
    const data = categorias.map(cat => cat.monto);
    const colors = categorias.map(cat => cat.color);
    
    // Crear gráfico de dona
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(color => color + '40'),
                borderWidth: 2,
                hoverBorderWidth: 3,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribución de Gastos',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    },
                    color: '#495057'
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        generateLabels: function(chart) {
                            const data = chart.data;
                            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                            
                            return data.labels.map((label, index) => {
                                const value = data.datasets[0].data[index];
                                const percentage = ((value / total) * 100).toFixed(1);
                                
                                return {
                                    text: `${label} (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[index],
                                    hidden: false,
                                    index: index
                                };
                            });
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            
                            return `${label}: $${value.toLocaleString('es-AR')} (${percentage}%)`;
                        }
                    },
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            cutout: '60%',
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000
            }
        }
    });
    
    console.log('✅ Gráfico de pie móvil creado con', categorias.length, 'categorías');
    
    // Agregar responsividad para el gráfico móvil
    const resizeMobileChart = () => {
        if (!isMobileOrTablet()) {
            // Cambió a escritorio, usar Sankey
            initializeFlowChart();
        }
    };
    
    window.addEventListener('resize', debounce(resizeMobileChart, 250));
}

// Función debounce para optimizar el redimensionado
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Crear diagrama Sankey con D3
function createSankeyDiagram(container) {
    console.log('Creando diagrama Sankey...');
    
    if (!d3 || !d3.sankey) {
        console.error('D3.js o d3-sankey no están disponibles');
        return false;
    }
    
    if (!container) {
        console.error('Container no está disponible para el diagrama Sankey');
        return false;
    }
    
    try {
        // Limpiar contenedor
        d3.select(container).selectAll("*").remove();
    
    // Obtener datos del servidor con mejor parsing de números
    const ingresosText = document.querySelector('.ingresos-card h4')?.textContent || '0';
    const gastosText = document.querySelector('.gastos-card h4')?.textContent || '0';
    
    // Función para parsear montos con formato argentino
    const parseArgentineAmount = (text) => {
        const cleaned = text
            .replace(/\./g, '') // Remover puntos como separadores de miles
            .replace(/,/g, '.') // Convertir comas decimales a puntos
            .replace(/[^\d.-]/g, ''); // Remover todo excepto dígitos, puntos y guiones
        return parseFloat(cleaned) || 0;
    };
    
    const totalIngresos = parseArgentineAmount(ingresosText);
    const totalGastos = parseArgentineAmount(gastosText);
    const balance = totalIngresos - totalGastos;
    
    console.log(`Texto ingresos original: "${ingresosText}" → ${totalIngresos}`);
    console.log(`Texto gastos original: "${gastosText}" → ${totalGastos}`);
    console.log(`Total ingresos: $${totalIngresos.toLocaleString('es-AR')}`);
    console.log(`Total gastos: $${totalGastos.toLocaleString('es-AR')}`);
    console.log(`Balance inicial: $${balance.toLocaleString('es-AR')}`);
    
    // Obtener datos de categorías de gastos SOLO con montos > 0
    const categoryElements = document.querySelectorAll('.category-stats');
    const categorias = [];
    
    categoryElements.forEach(element => {
        const badge = element.querySelector('.categoria-badge');
        const amountText = element.querySelector('strong').textContent;
        
        if (badge && amountText) {
            console.log(`Procesando categoría: ${badge.textContent.trim()}`);
            console.log(`Texto del monto original: "${amountText}"`);
            
            const monto = parseArgentineAmount(amountText);
            console.log(`Monto parseado: ${monto}`);
            
            // SOLO agregar categorías que tienen gastos reales (monto > 0)
            if (monto > 0) {
                const computedColor = window.getComputedStyle(badge).backgroundColor;
                let color = '#007bff'; // Default color
                
                // Convertir colores RGB a hex si es necesario
                if (computedColor && computedColor.startsWith('rgb')) {
                    const rgbMatch = computedColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
                    if (rgbMatch) {
                        const r = parseInt(rgbMatch[1]);
                        const g = parseInt(rgbMatch[2]);
                        const b = parseInt(rgbMatch[3]);
                        color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                    }
                } else if (computedColor && computedColor.startsWith('#')) {
                    color = computedColor;
                }
                
                categorias.push({
                    nombre: badge.textContent.trim(),
                    monto: monto,
                    color: color
                });
            }
        }
    });
    
    // Si no hay categorías con gastos, mostrar mensaje informativo en lugar de datos ficticios
    if (categorias.length === 0) {
        // Limpiar contenedor y mostrar mensaje
        d3.select(container)
            .append('div')
            .style('text-align', 'center')
            .style('padding', '60px 20px')
            .style('color', '#6c757d')
            .style('font-family', "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
            .html(`
                <div style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;">
                    📊
                </div>
                <h5 style="color: #495057; margin-bottom: 15px;">
                    No hay gastos registrados este mes
                </h5>
                <p style="font-size: 14px; line-height: 1.6; max-width: 400px; margin: 0 auto;">
                    Una vez que agregues algunos gastos en diferentes categorías, 
                    verás aquí un hermoso diagrama de flujo mostrando cómo se distribuyen tus ingresos.
                </p>
                <div style="margin-top: 25px;">
                    <button class="btn btn-primary btn-sm" onclick="document.querySelector('[href=&quot;#agregarGasto&quot;]').click()">
                        <i class="bi bi-plus-circle"></i> Agregar primer gasto
                    </button>
                </div>
            `);
        
        console.log('No hay categorías con gastos para mostrar en el diagrama');
        return true;
    }
    
    // Recalcular el total de gastos basado en las categorías reales con montos
    const totalGastosReales = categorias.reduce((sum, cat) => sum + cat.monto, 0);
    const balanceReal = totalIngresos - totalGastosReales;
    
    console.log(`Categorías con gastos: ${categorias.length}`);
    console.log(`Total gastos reales: $${totalGastosReales.toLocaleString('es-AR')}`);
    console.log(`Balance real: $${balanceReal.toLocaleString('es-AR')}`);
    
    // Configuración del SVG con mejores proporciones
    const margin = { top: 30, right: 200, bottom: 30, left: 200 };
    const width = Math.max(800, container.offsetWidth - margin.left - margin.right);
    const height = Math.max(450, Math.min(600, categorias.length * 60 + 200)) - margin.top - margin.bottom;
    
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Crear datos para el diagrama Sankey
    let balanceNodeName;
    if (Math.abs(balanceReal) < 0.01) {
        balanceNodeName = 'Balance Equilibrado';
    } else if (balanceReal >= 0) {
        balanceNodeName = 'Balance Positivo';
    } else {
        balanceNodeName = 'Déficit';
    }
    
    const nodes = [
        { name: 'Ingresos Totales', id: 0 },
        ...categorias.map((cat, index) => ({ 
            name: cat.nombre, 
            id: index + 1,
            color: cat.color
        })),
        { name: balanceNodeName, id: categorias.length + 1 }
    ];
    
    const links = [
        // Enlaces de ingresos a cada categoría de gasto
        ...categorias.map((cat, index) => ({
            source: 0,
            target: index + 1,
            value: cat.monto,
            color: cat.color
        }))
    ];
    
    // SIEMPRE agregar enlace al balance final, independientemente si es positivo o negativo
    // Solo omitir si el balance es exactamente 0
    if (Math.abs(balanceReal) > 0.01) { // Usar umbral pequeño para evitar problemas de precisión de punto flotante
        links.push({
            source: 0,
            target: categorias.length + 1,
            value: Math.abs(balanceReal), // Usar valor absoluto para mostrar el flujo
            color: balanceReal >= 0 ? '#28a745' : '#dc3545' // Verde si es positivo, rojo si es negativo
        });
    }
    
    // Configurar Sankey con mejor espaciado
    const sankey = d3.sankey()
        .nodeWidth(25)
        .nodePadding(Math.max(15, Math.min(40, height / (categorias.length + 2))))
        .extent([[0, 0], [width, height]])
        .nodeAlign(d3.sankeyJustify);
    
    const graph = sankey({
        nodes: nodes.map(d => Object.assign({}, d)),
        links: links.map(d => Object.assign({}, d))
    });
    
    // Crear gradientes para los enlaces
    const defs = svg.append("defs");
    
    graph.links.forEach((link, i) => {
        const gradient = defs.append("linearGradient")
            .attr("id", `gradient-${i}`)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", link.source.x1)
            .attr("x2", link.target.x0);
        
        // Crear gradiente más atractivo
        const sourceColor = link.color || '#28a745';
        const targetColor = d3.color(sourceColor).darker(0.3);
        
        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", sourceColor)
            .attr("stop-opacity", 0.8);
        
        gradient.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", sourceColor)
            .attr("stop-opacity", 0.6);
        
        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", targetColor)
            .attr("stop-opacity", 0.4);
    });
    
    // Dibujar enlaces (flujos)
    g.append("g")
        .selectAll("path")
        .data(graph.links)
        .enter()
        .append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("fill", (d, i) => `url(#gradient-${i})`)
        .attr("stroke", "none")
        .style("cursor", "pointer")
        .style("opacity", 0.8)
        .on("mouseover", function(event, d) {
            // Resaltar el enlace
            d3.select(this)
                .transition()
                .duration(150)
                .style("opacity", 1)
                .style("filter", "drop-shadow(0 2px 6px rgba(0,0,0,0.3))");
            
            // Mostrar tooltip mejorado
            const tooltip = d3.select("body").append("div")
                .attr("class", "sankey-tooltip")
                .style("position", "absolute")
                .style("background", "linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.7))")
                .style("color", "white")
                .style("padding", "12px 16px")
                .style("border-radius", "8px")
                .style("font-size", "13px")
                .style("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
                .style("pointer-events", "none")
                .style("z-index", "1000")
                .style("box-shadow", "0 8px 25px rgba(0,0,0,0.4)")
                .style("border", "1px solid rgba(255,255,255,0.1)")
                .style("opacity", 0);
            
            const percentage = ((d.value / totalIngresos) * 100).toFixed(1);
            const isBalance = d.target.name.includes('Balance') || d.target.name.includes('Déficit');
            const realBalanceValue = balanceReal; // Valor real del balance (puede ser negativo)
            
            tooltip.html(`
                <div style="font-weight: 600; margin-bottom: 6px; color: #fff;">
                    ${d.source.name} → ${d.target.name}
                </div>
                <div style="color: ${isBalance ? (realBalanceValue >= 0 ? '#28a745' : '#dc3545') : '#28a745'}; font-weight: 500;">
                    ${isBalance ? (realBalanceValue >= 0 ? '💰' : '⚠️') : '💰'} $${isBalance ? Math.abs(realBalanceValue).toLocaleString('es-AR') : d.value.toLocaleString('es-AR')}
                </div>
                <div style="color: #6c757d; font-size: 11px; margin-top: 4px;">
                    📊 ${percentage}% de los ingresos totales
                    ${isBalance ? (realBalanceValue < 0 ? '<br/>🔴 Gastos superan los ingresos' : '<br/>🟢 Dinero disponible') : ''}
                </div>
            `)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 10) + "px")
                .transition()
                .duration(200)
                .style("opacity", 1);
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .transition()
                .duration(150)
                .style("opacity", 0.8)
                .style("filter", "none");
            d3.selectAll(".sankey-tooltip").remove();
        });
    
    // Dibujar nodos
    const node = g.append("g")
        .selectAll("rect")
        .data(graph.nodes)
        .enter()
        .append("g");
    
    node.append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => {
            if (d.id === 0) return '#28a745'; // Ingresos en verde más brillante
            if (d.id === categorias.length + 1) return balanceReal >= 0 ? '#28a745' : '#dc3545'; // Balance
            return d.color || '#007bff'; // Categorías con su color
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("rx", 4) // Bordes redondeados
        .attr("ry", 4)
        .style("cursor", "pointer")
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
        .on("mouseover", function(event, d) {
            const currentFill = d3.select(this).attr("fill");
            d3.select(this)
                .transition()
                .duration(150)
                .attr("fill", d3.color(currentFill).darker(0.2))
                .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.2))");
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .transition()
                .duration(150)
                .attr("fill", d => {
                    if (d.id === 0) return '#28a745';
                    if (d.id === categorias.length + 1) return balanceReal >= 0 ? '#28a745' : '#dc3545';
                    return d.color || '#007bff';
                })
                .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");
        });
    
    // Agregar etiquetas a los nodos
    node.append("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 12 : d.x0 - 12)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .style("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("fill", "#2c3e50")
        .style("text-shadow", "1px 1px 2px rgba(255,255,255,0.8)")
        .text(d => d.name);
    
    // Agregar valores a los nodos
    node.append("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 12 : d.x0 - 12)
        .attr("y", d => (d.y1 + d.y0) / 2 + 18)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .style("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
        .style("font-size", "12px")
        .style("font-weight", "500")
        .style("fill", "#6c757d")
        .style("text-shadow", "1px 1px 2px rgba(255,255,255,0.8)")
        .text(d => `$${(d.value || 0).toLocaleString('es-AR')}`);
        
        console.log('Diagrama Sankey creado exitosamente');
        
        // Agregar responsividad inteligente
        const resizeChart = () => {
            // Si cambió de móvil a escritorio o viceversa, reinicializar
            if (isMobileOrTablet()) {
                // Cambió a móvil, usar gráfico de pie
                createMobilePieChart();
            } else {
                // Cambió a escritorio, verificar si necesita redimensionar Sankey
                const newWidth = Math.max(800, container.offsetWidth - margin.left - margin.right);
                if (Math.abs(newWidth - width) > 50) {
                    createSankeyDiagram(container);
                }
            }
        };
        
        window.addEventListener('resize', debounce(resizeChart, 250));
        
        return true;
        
    } catch (error) {
        console.error('Error creando diagrama Sankey:', error);
        
        // Mostrar mensaje de error en el contenedor
        d3.select(container)
            .append('div')
            .style('text-align', 'center')
            .style('padding', '40px')
            .style('color', '#dc3545')
            .html(`
                <i class="fas fa-exclamation-triangle" style="font-size: 24px;"></i><br/>
                <strong>Error al cargar el gráfico</strong><br/>
                <small>Revisa la consola para más detalles</small>
            `);
        
        return false;
    }
}

// Crear gráfico de dona para categorías
function createCategoryChart() {
    // Buscar datos de categorías en el DOM
    const categoryElements = document.querySelectorAll('.category-stats');
    if (categoryElements.length === 0) return;
    
    const categories = [];
    const amounts = [];
    const colors = [];
    
    categoryElements.forEach(element => {
        const badge = element.querySelector('.categoria-badge');
        const amountText = element.querySelector('strong').textContent;
        
        if (badge) {
            categories.push(badge.textContent.trim());
            amounts.push(parseFloat(amountText.replace(/[^\d.-]/g, '')));
            colors.push(badge.style.backgroundColor || '#007bff');
        }
    });
    
    if (categories.length === 0) return;
    
    // Crear un mini gráfico de dona en el resumen
    const legendContainer = document.querySelector('.flow-categories');
    if (legendContainer) {
        const miniCanvas = document.createElement('canvas');
        miniCanvas.width = 120;
        miniCanvas.height = 120;
        miniCanvas.style.marginTop = '10px';
        
        const ctx = miniCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: colors,
                    borderWidth: 1,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const percentage = ((context.parsed / amounts.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                return context.label + ': ' + percentage + '%';
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
        
        legendContainer.appendChild(miniCanvas);
    }
}

// Validación de formulario de categorías
function initializeCategoryValidation() {
    const categoryForm = document.querySelector('form[action="/agregar-categoria"]');
    const categoryNameInput = document.getElementById('nombre_categoria');
    
    if (!categoryForm || !categoryNameInput) return;
    
    // Obtener nombres de categorías existentes
    function getExistingCategoryNames() {
        const categoryBadges = document.querySelectorAll('.categoria-badge');
        return Array.from(categoryBadges).map(badge => 
            badge.textContent.trim().toLowerCase()
        );
    }
    
    // Validar nombre en tiempo real
    categoryNameInput.addEventListener('input', function() {
        const inputValue = this.value.trim().toLowerCase();
        const existingNames = getExistingCategoryNames();
        const submitButton = categoryForm.querySelector('button[type="submit"]');
        const feedbackElement = categoryForm.querySelector('.invalid-feedback');
        
        // Remover feedback anterior
        if (feedbackElement) {
            feedbackElement.remove();
        }
        
        this.classList.remove('is-invalid', 'is-valid');
        
        if (inputValue.length > 0) {
            if (existingNames.includes(inputValue)) {
                this.classList.add('is-invalid');
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                feedback.textContent = 'Esta categoría ya existe. Elige un nombre diferente.';
                this.parentNode.appendChild(feedback);
                submitButton.disabled = true;
            } else {
                this.classList.add('is-valid');
                submitButton.disabled = false;
            }
        } else {
            submitButton.disabled = false;
        }
    });
    
    // Validar antes del envío
    categoryForm.addEventListener('submit', function(e) {
        const inputValue = categoryNameInput.value.trim().toLowerCase();
        const existingNames = getExistingCategoryNames();
        
        if (existingNames.includes(inputValue)) {
            e.preventDefault();
            
            // Mostrar alerta más visible
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
            alertDiv.innerHTML = `
                <i class="bi bi-exclamation-triangle"></i>
                <strong>Error:</strong> La categoría "${categoryNameInput.value.trim()}" ya existe.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            this.appendChild(alertDiv);
            categoryNameInput.focus();
            
            // Auto-remover la alerta después de 5 segundos
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 5000);
        }
    });
}

// Inicializar validación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeCategoryValidation();
});