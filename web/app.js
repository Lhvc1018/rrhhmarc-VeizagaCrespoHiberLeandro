const API_URL = 'http://localhost:3000/api/marcaciones';

async function cargarMarcaciones() {
    const filtro = document.getElementById('filtroCodigo').value;
    const url = filtro ? `${API_URL}?empleado=${filtro}` : API_URL;
    
    const res = await fetch(url);
    const data = await res.json();
    
    const tbody = document.getElementById('tablaCuerpo');
    tbody.innerHTML = '';
    
    data.forEach(m => {
        tbody.innerHTML += `
            <tr>
                <td>${m.codigo_empleado}</td>
                <td>${m.nombre_empleado}</td>
                <td>${m.fecha.split('T')[0]}</td>
                <td>${m.hora_ingreso_programada}</td>
                <td>${m.hora_ingreso_real || '-'}</td>
                <td><b>${m.estado}</b></td>
                <td><button onclick="eliminar(${m.id})">Eliminar</button></td>
            </tr>
        `;
    });
}

document.getElementById('marcacionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        codigo_empleado: document.getElementById('codigo').value,
        nombre_empleado: document.getElementById('nombre').value,
        fecha: document.getElementById('fecha').value,
        hora_ingreso_programada: document.getElementById('ingreso_prog').value,
        hora_ingreso_real: document.getElementById('ingreso_real').value,
        hora_salida_programada: document.getElementById('salida_prog').value,
        hora_salida_real: document.getElementById('salida_real').value
    };

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    cargarMarcaciones();
});

async function eliminar(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    cargarMarcaciones();
}

cargarMarcaciones();