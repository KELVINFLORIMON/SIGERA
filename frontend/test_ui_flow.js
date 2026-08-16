const login = async () => {
    const res = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'username': 'kflorimon@gmail.com',
            'password': '123'
        })
    });
    const data = await res.json();
    return data.access_token;
};

const run = async () => {
    try {
        const token = await login();
        console.log("Logged in");
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'X-Centro-Id': '1'
        };
        
        const usersRes = await fetch('http://127.0.0.1:8000/api/v1/usuarios/', { headers });
        const users = await usersRes.json();
        
        const docentesList = users
        .filter(u => u.roles?.includes('DOCENTE') && u.docente_id)
        .map(u => ({
          id: u.docente_id,
          nombre_completo: u.nombre_completo,
          usuario_id: u.id
        }));
        
        console.log("Docentes List:", docentesList);
        
        const kelvin = docentesList.find(d => d.nombre_completo.includes("Kelvin"));
        if (kelvin) {
            console.log("Fetching asignaciones for", kelvin.id);
            const asigsRes = await fetch(`http://127.0.0.1:8000/api/v1/asignaciones/docente/${kelvin.id}?anio_escolar_id=19`, { headers });
            const asigs = await asigsRes.json();
            console.log("Asignaciones Docente (anio=19):", asigs);
        }
        
    } catch(e) {
        console.error(e);
    }
};

run();
