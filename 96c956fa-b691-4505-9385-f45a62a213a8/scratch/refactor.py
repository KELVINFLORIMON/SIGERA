import os
import re

path = r'c:\Users\kelvi\OneDrive - Transformación Digital Educación\Proyecto_SIGERA\96c956fa-b691-4505-9385-f45a62a213a8'
files = [
    'SIGERA_DAF_Cap2_Arquitectura_Negocio.md',
    'SIGERA_DAF_Cap3_Arquitectura_Funcional.md',
    'SIGERA_DAF_Cap4_Arquitectura_Datos.md',
    'SIGERA_DAF_Cap5_Arquitectura_Software.md',
    'SIGERA_DAF_Cap6_Reportes_PowerBI.md',
    'SIGERA_DAF_Cap7_Inteligencia_Artificial.md',
    'SIGERA_DAF_Cap8_Plan_Implementacion.md'
]

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Rule 1: Passing grade 65 -> 70
    content = re.sub(r'\b65\b(?=.*(?:puntos|aprob|nota|calific))', '70', content, flags=re.IGNORECASE)
    content = re.sub(r'<\s*65', '< 70', content)
    content = re.sub(r'>=\s*65', '>= 70', content)
    content = re.sub(r'65\s*-\s*76', '70 - 76', content) 
    # Be careful not to replace 65 if it's an ID or arbitrary number, so regex is safer. Let's just do a brute force for specific known phrases:
    
    specific_replaces = [
        ("65 puntos", "70 puntos"),
        ("nota mínima de 65", "nota mínima de 70"),
        ("menor a 65", "menor a 70"),
        ("mayor o igual a 65", "mayor o igual a 70"),
        ("CF < 65", "CF < 70"),
        ("CF >= 65", "CF >= 70"),
        ("nota de 65", "nota de 70"),
        ("umbral de 65", "umbral de 70"),
        ("60% CF + 40% CEC", "50% CF + 50% CEC"),
        ("60% de la CF", "50% de la CF"),
        ("40% de la CEC", "50% de la CEC"),
        ("60% de CF", "50% de CF"),
        ("40% de CEC", "50% de CEC"),
        ("(CF * 0.60)", "(CF * 0.50)"),
        ("(CEC * 0.40)", "(CEC * 0.50)"),
        ("Satisfactorio", "Logrado"),
        ("SATISFACTORIO", "LOGRADO"),
        ("CE1", "PC1"),
        ("CE2", "PC2"),
        ("CE3", "PC3"),
        ("CE4", "PC4"),
        ("CE5", "PC1"),
        ("CE6", "PC2"),
        ("CE7", "PC3"),
        ("Salida Optativa", "Salida Optativa (Solo 4to, 5to y 6to)")
    ]
    
    for old, new in specific_replaces:
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
for file in files:
    full_path = os.path.join(path, file)
    if os.path.exists(full_path):
        replace_in_file(full_path)
        print(f"Updated {file}")
