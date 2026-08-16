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
        
        const docente = users.find(u => u.nombre_completo.includes('Kelvin') && u.roles.includes('DOCENTE'));
        console.log("Docente ID:", docente?.docente_id);
        
        if (docente) {
            const asigsRes = await fetch(`http://127.0.0.1:8000/api/v1/asignaciones/docente/${docente.docente_id}`, { headers });
            const asigs = await asigsRes.json();
            console.log("Asignaciones docente:");
            console.log(JSON.stringify(asigs, null, 2));
        }
        
        console.log("----");
        
        const seccRes = await fetch('http://127.0.0.1:8000/api/v1/secciones/', { headers });
        const secciones = await seccRes.json();
        
        for (const s of secciones) {
            const asigSeccRes = await fetch(`http://127.0.0.1:8000/api/v1/asignaciones/seccion/${s.id}`, { headers });
            const asigSecc = await asigSeccRes.json();
            if (asigSecc.length > 0) {
                console.log(`Sección ${s.nombre} (ID: ${s.id}):`);
                console.log(JSON.stringify(asigSecc, null, 2));
            }
        }
        
    } catch(e) {
        console.error(e);
    }
};

run();
