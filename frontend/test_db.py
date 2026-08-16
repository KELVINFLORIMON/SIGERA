import sqlite3

def check_db():
    print("Checking database...")
    conn = sqlite3.connect('../backend/sigera.db')
    cursor = conn.cursor()
    
    print("\n--- Usuarios ---")
    cursor.execute("SELECT id, nombre, apellido, roles FROM usuario")
    for row in cursor.fetchall():
        print(row)
        
    print("\n--- Docentes ---")
    cursor.execute("SELECT id, primer_nombre, primer_apellido FROM docente")
    for row in cursor.fetchall():
        print(row)
        
    print("\n--- Asignaciones Docente ---")
    cursor.execute("SELECT id, docente_id, seccion_id, asignatura_id, anio_escolar_id FROM asignacion_docente")
    asignaciones = cursor.fetchall()
    if not asignaciones:
        print("No hay asignaciones.")
    for row in asignaciones:
        print(row)
        
    print("\n--- Secciones ---")
    cursor.execute("SELECT id, nombre, grado_id FROM seccion")
    for row in cursor.fetchall():
        print(row)

    print("\n--- Asignaturas ---")
    cursor.execute("SELECT id, nombre FROM asignatura")
    for row in cursor.fetchall():
        print(row)
        
    conn.close()

if __name__ == "__main__":
    check_db()
