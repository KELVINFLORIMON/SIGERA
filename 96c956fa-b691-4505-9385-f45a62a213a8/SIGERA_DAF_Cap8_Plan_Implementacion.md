# SIGERA
## Sistema Inteligente de Gestión Educativa y Rendimiento Académico
### Documento de Arquitectura Funcional (DAF)
#### Capítulo 8 — Plan de Implementación

---

**Versión:** 1.0  
**Fecha:** Agosto 2026  
**Estado:** Borrador para revisión  
**Referencia anterior:** [Capítulo 7 — Inteligencia Artificial](./SIGERA_DAF_Cap7_Inteligencia_Artificial.md)

## 1. Introducción y Enfoque del Plan de Implementación

Este capítulo constituye la culminación del **Documento de Arquitectura Funcional (DAF)** para el **Sistema Inteligente de Gestión Educativa y Rendimiento Académico (SIGERA)**. Tras haber definido exhaustivamente los requisitos, el modelo de dominio, la arquitectura tecnológica (Capítulo 7) y los módulos funcionales, el Plan de Implementación traza la hoja de ruta estratégica y operativa para materializar el sistema en el centro educativo dominicano de nivel secundario.

El enfoque metodológico es ágil, iterativo e incremental, priorizando la entrega temprana de valor (el registro de calificaciones y boletines) para mitigar riesgos, asegurar la adopción por parte de los docentes y estabilizar el núcleo del sistema antes de introducir componentes avanzados como la Inteligencia Artificial.

## 2. Resumen Ejecutivo del Proyecto

El proyecto SIGERA se consolida como una solución integral y moderna. Los puntos clave de este documento rector son:

*   **Alcance:** 8 capítulos del DAF completados que detallan desde el contexto del MINERD hasta la arquitectura técnica y operativa.
*   **Fases de Ejecución:** 6 etapas de desarrollo estratégico, extendiéndose a lo largo de 16 meses de trabajo continuo.
*   **Stack Tecnológico Definitivo:**
    *   **Backend:** Python 3.12+ con FastAPI.
    *   **Frontend:** React 18+ con TypeScript y TailwindCSS.
    *   **Base de Datos:** PostgreSQL 16.
    *   **Infraestructura:** Docker, VPS (Linux), Nginx, WeasyPrint para PDF.
*   **Equipo Mínimo Recomendado:** 5 roles fundamentales con alta sinergia (Tech Lead, Backend, Frontend, QA, Coordinador).

## 3. Roadmap Completo del Proyecto (Todas las Etapas)

La implementación se ha estructurado en bloques lógicos, asegurando que cada etapa sirva de cimiento sólido para la siguiente.

*   **Etapa 1 (Meses 1-4):** Registro de Calificaciones y Boletines (Núcleo crítico).
*   **Etapa 2 (Meses 5-6):** Asistencia y Analítica.
*   **Etapa 3 (Meses 7-9):** Portal Representantes y App Móvil.
*   **Etapa 4 (Mes 10):** Recuperación Avanzada y Pruebas Completivas/Extraordinarias.
*   **Etapa 5-6 (Meses 11-16):** Inteligencia Artificial (Analítica Predictiva y Modelos Generativos para retroalimentación).

### Diagrama de Gantt (ASCII)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║         SIGERA — DIAGRAMA GANTT DE IMPLEMENTACIÓN (16 MESES)                               ║
╠══════════════╦═══╦═══╦═══╦═══╦═══╦═══╦═══╦═══╦═══╦════╦════╦════╦════╦════╦════╦════╣
║ Etapa        ║ 1 ║ 2 ║ 3 ║ 4 ║ 5 ║ 6 ║ 7 ║ 8 ║ 9 ║ 10 ║ 11 ║ 12 ║ 13 ║ 14 ║ 15 ║ 16 ║
╠══════════════╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬════╬════╬════╬════╬════╬════╬════╣
║ 1 - Núcleo   ║███║███║███║███║   ║   ║   ║   ║   ║    ║    ║    ║    ║    ║    ║    ║
║   Calific.   ║███║███║███║███║   ║   ║   ║   ║   ║    ║    ║    ║    ║    ║    ║    ║
╠══════════════╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬════╬════╬════╬════╬════╬════╬════╣
║ 2 - Asist.   ║   ║   ║   ║   ║███║███║   ║   ║   ║    ║    ║    ║    ║    ║    ║    ║
║   Analítica  ║   ║   ║   ║   ║███║███║   ║   ║   ║    ║    ║    ║    ║    ║    ║    ║
╠══════════════╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬════╬════╬════╬════╬════╬════╬════╣
║ 3 - Portal   ║   ║   ║   ║   ║   ║   ║███║███║███║    ║    ║    ║    ║    ║    ║    ║
║   Repr./App  ║   ║   ║   ║   ║   ║   ║███║███║███║    ║    ║    ║    ║    ║    ║    ║
╠══════════════╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬════╬════╬════╬════╬════╬════╬════╣
║ 4 - Compl./  ║   ║   ║   ║   ║   ║   ║   ║   ║   ║████║    ║    ║    ║    ║    ║    ║
║   Extraord.  ║   ║   ║   ║   ║   ║   ║   ║   ║   ║████║    ║    ║    ║    ║    ║    ║
╠══════════════╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬════╬════╬════╬════╬════╬════╬════╣
║ 5 - IA       ║   ║   ║   ║   ║   ║   ║   ║   ║   ║    ║████║████║████║████║████║████║
║   Predicción ║   ║   ║   ║   ║   ║   ║   ║   ║   ║    ║████║████║████║████║████║████║
╚══════════════╩═══╩═══╩═══╩═══╩═══╩═══╩═══╩═══╩═══╩════╩════╩════╩════╩════╩════╩════╝
```

## 4. Desglose Detallado de la Etapa 1 (Meses 1-4)

Dado que la Etapa 1 representa la columna vertebral de SIGERA, se desglosa en sprints bisemanales precisos:

*   **Semanas 1-2:** Configuración del entorno de desarrollo, orquestación con Docker, levantamiento de PostgreSQL, y estructuración base del proyecto (Backend y Frontend).
*   **Semanas 3-4:** Diseño y ejecución de migraciones de base de datos (aproximadamente 28 tablas core), inserción de datos semilla y catálogos estáticos (grados, asignaturas oficiales MINERD, etc.).
*   **Semanas 5-6:** Implementación de Autenticación mediante JWT, sistema de roles y permisos (RBAC), y gestión integral de usuarios del sistema.
*   **Semanas 7-8:** Desarrollo del CRUD de estudiantes, módulo de importación masiva vía Excel (crucial para carga inicial), y gestión de la plantilla docente.
*   **Semanas 9-10:** **Módulo de Calificaciones (El más crítico)**. Creación de la tabla tipo "spreadsheet" en React, y desarrollo del motor de cálculo en el backend siguiendo la lógica de la Ordenanza MINERD (RP, Evaluaciones, etc.).
*   **Semanas 11-12:** Módulo de recuperación pedagógica, calificaciones completivas y extraordinarias. Cierre de la lógica evaluativa.
*   **Semanas 13-14:** Integración de WeasyPrint. Diseño de plantillas HTML/CSS y generación automatizada de boletines de calificaciones en PDF.
*   **Semanas 15-16:** Desarrollo del Dashboard inicial para coordinación/dirección, reportes estadísticos básicos (aprobados/reprobados) y rutinas de exportación de sábanas de notas a Excel. Preparación para el Go-Live.

## 5. Equipo de Desarrollo Recomendado

Para garantizar calidad y velocidad en la entrega, se sugiere el siguiente esquema de personal:

| Rol | Responsabilidades Principales | Dedicación Semanal |
| :--- | :--- | :--- |
| **Tech Lead / Arquitecto** | Diseño de arquitectura (Python/React), revisión de código, DevOps básico, mentoría técnica. | 20 - 40 horas |
| **Backend Developer** | Desarrollo de la API REST (FastAPI), modelos de datos, motor de cálculo y lógica de negocio. | 40 horas |
| **Frontend Developer** | Desarrollo de la UI/UX en React, consumo de APIs, componentes de grillas de datos complejas. | 40 horas |
| **QA / Tester** | Diseño y ejecución de pruebas manuales y automatizadas, reportes de bugs, validación de reglas de negocio. | 20 - 30 horas |
| **Coordinador del Proyecto** | Enlace entre el centro (Director/Coord. Académico) y el equipo técnico. Gestión de prioridades y validación de reglas del MINERD. | 10 - 15 horas |

## 6. Estrategia de Pruebas (QA y Testing)
    6.1 Pruebas Unitarias y de Integración (Backend y Frontend)
    6.2 User Acceptance Testing (UAT)

Garantizar la integridad de las calificaciones es imperativo. La estrategia QA incluye:

*   **Pruebas Unitarias (pytest):** Cobertura del 100% sobre el motor de cálculo de calificaciones (promedios, redondeos, condiciones de aprobación).
*   **Pruebas de Integración (API):** Validación de flujos de datos (ej. Autenticación $\rightarrow$ Registro de Notas $\rightarrow$ Generación de PDF).
*   **Pruebas de Aceptación (UAT):** Sesiones de pilotaje con un grupo selecto de **docentes reales** utilizando datos anonimizados para validar usabilidad.
*   **Pruebas de Carga:** Simulaciones de concurrencia con hasta 50 usuarios simultáneos (pico esperado al final del período evaluativo) para asegurar que el sistema no presente latencia.
*   **Checklist Go-Live:** Matriz de 30 puntos críticos de validación que deben ser firmados por QA y el Coordinador antes del paso a producción.

## 7. Estrategia de Despliegue

El despliegue sigue un ciclo de integración y entrega continua (CI/CD) adaptado al presupuesto educativo:

*   **Ambiente de Desarrollo:** Local en las máquinas de los desarrolladores mediante `docker-compose`.
*   **Ambiente de Pruebas (Staging):** Servidor clon de producción. Refleja fielmente el entorno final. Aquí se realiza el UAT y pruebas de calidad.
*   **Ambiente de Producción:** Servidor Virtual Privado (VPS) robusto basado en Linux (ej. Ubuntu 22.04). Proxies inversos manejados por Nginx con certificados SSL de Let's Encrypt. Base de datos con respaldos diarios automatizados.
*   **Actualizaciones Zero-Downtime:** Uso de contenedores Docker para levantar la nueva versión y rotar el tráfico desde Nginx sin interrumpir a los usuarios activos.
*   **Plan de Rollback:** Respaldos incrementales en la base de datos previos a cada migración. Capacidad de revertir la imagen de Docker a la versión estable anterior en menos de 5 minutos si ocurre un fallo crítico.

## 8. Plan de Capacitación

La adopción tecnológica es tan vital como el código. El plan comprende:

*   **Administradores y Sistemas (4 horas):** Gestión de usuarios, copias de seguridad, resolución de problemas comunes, importación masiva y configuración de años escolares.
*   **Coordinadores Académicos (3 horas):** Monitoreo del dashboard, reportes analíticos, validación de actas completivas, y flujos de revisión.
*   **Docentes (2 horas):** Acceso al sistema, llenado del registro de calificaciones digital (spreadsheet), registro de recuperaciones y generación de reportes por aula.
*   **Manual de Usuario y Base de Conocimiento:** Documentación interactiva integrada en el sistema.
*   **Videos Tutoriales:**
    1.  *Primer Ingreso y Configuración de Perfil.*
    2.  *Cómo registrar calificaciones paso a paso.*
    3.  *Aplicando la Recuperación Pedagógica.*
    4.  *Generación e impresión de Boletines.*

## 9. Plan de Migración de Datos

*   **Fase de Recopilación:** Consolidación de registros de estudiantes actuales y plantilla docente desde archivos Excel preexistentes y sistemas legados (físicos/digitales).
*   **Plantillas Estandarizadas:** Provisión de archivos CSV/Excel con formatos estrictos para la carga al nuevo sistema.
*   **Validación y Limpieza (Data Cleansing):** Scripts automatizados para detectar IDs duplicados, formatos de fecha incorrectos o datos faltantes antes de la inserción en PostgreSQL.
*   **Operación en Paralelo:** Durante el primer período de evaluación (P1), los docentes llevarán el registro físico tradicional y el sistema SIGERA simultáneamente como contingencia.

## 10. Gestión de Riesgos

| Riesgo | Probabilidad | Impacto | Estrategia de Mitigación |
| :--- | :--- | :--- | :--- |
| **Resistencia al cambio por docentes** | Alta | Alto | Involucramiento temprano, UX intuitiva, plan de capacitación sólido y soporte continuo. |
| **Cortes de electricidad o internet** | Alta | Medio | Diseño responsivo que permite usar datos móviles desde celulares; guardado automático de borradores. |
| **Datos históricos incompletos/incorrectos** | Media | Alto | Fase intensiva de auditoría de datos previos a la migración masiva. |
| **Cambios en la Ordenanza del MINERD** | Media | Alto | Arquitectura modular; el motor de cálculo está separado de la UI y es configurable. |
| **Falta de equipo informático en el centro** | Alta | Alto | Asegurar compatibilidad estricta con navegadores móviles y tablets de baja gama. |
| **Bajo rendimiento por picos de uso** | Baja | Medio | Optimización de queries (PostgreSQL), indexación adecuada, y pruebas de carga rigurosas. |
| **Retrasos de definición de competencias** | Media | Medio | Mantener catálogos dinámicos editables por los coordinadores para no bloquear el desarrollo. |
| **Brechas de seguridad / pérdida de datos** | Baja | Crítico | Backups automatizados fuera del sitio (S3), JWT robusto, y encriptación de contraseñas. |
| **Curva de aprendizaje del personal admin.** | Media | Medio | Manuales detallados, videos de consulta rápida y soporte post-lanzamiento de 30 días. |
| **Rotación de personal en desarrollo** | Baja | Alto | Documentación de código exhaustiva y uso de buenas prácticas estandarizadas. |

## 11. Criterios de Éxito del Proyecto

Al finalizar la Etapa 1, el proyecto será considerado exitoso si cumple con:

*   ✅ **100%** de los boletines de calificaciones del centro generados automáticamente en PDF.
*   ✅ **Reducción del 80%** en el tiempo invertido por los docentes y coordinadores en la elaboración y validación del registro de notas al final del período.
*   ✅ **Cero errores de cálculo (0%)** en las calificaciones finales publicadas, alineadas 100% con la Ordenanza vigente.
*   ✅ **Adopción del 90%** por parte de la plantilla docente activa durante el primer mes de uso obligatorio.
*   ✅ **Dashboard gerencial** totalmente operativo y disponible para el Director desde el día 1 del lanzamiento.

## 12. Cronograma de Inversión Estimada

*Nota: Los rangos presentados son referenciales (expresados en USD o equivalente en DOP) para facilitar la planificación presupuestaria del centro educativo.*

| Concepto | Detalle | Rango Estimado |
| :--- | :--- | :--- |
| **Desarrollo (Etapa 1)** | Horas hombre de ingeniería, diseño UI/UX y QA. | $X,XXX - $Y,YYY |
| **Infraestructura Cloud** | Servidor VPS de producción, dominio y almacenamiento (Anual). | $150 - $300 / año |
| **Licencias / Herramientas** | Herramientas de desarrollo, mapas, envíos de SMS (si aplica). | $0 - $100 |
| **Capacitación** | Horas del implementador dedicadas a formación y soporte inicial. | Incluido en Desarrollo |
| **Mantenimiento y Soporte** | Acuerdo de Nivel de Servicio (SLA) para soporte técnico mensual. | $ZZZ - $WWW / mes |

## 13. Próximos Pasos Inmediatos (Acción Semanal)

Para arrancar la ejecución de inmediato, se establece la siguiente agenda de 5 pasos para la presente semana:

*   **Paso 1:** Validar el DAF completo (Capítulos 1 al 8) con el equipo directivo del centro. Firmar el acta de aprobación.
*   **Paso 2:** Confirmar con la Coordinación Académica la malla curricular y las competencias específicas de todas las asignaturas.
*   **Paso 3:** Definir y contratar el servidor VPS de producción (ej. DigitalOcean, AWS, o Hostinger).
*   **Paso 4:** Conformar y formalizar el equipo de desarrollo técnico.
*   **Paso 5:** Inicializar los repositorios Git (Github/Gitlab) y el ambiente de desarrollo base con la arquitectura definida.

---

## 14. Índice Completo del DAF — SIGERA

Este Plan de Implementación concluye el Documento de Arquitectura Funcional de SIGERA. El DAF completo comprende **8 capítulos** y más de **400 KB** de documentación técnica y funcional:

| N° | Capítulo | Contenido principal | Archivo |
|---|---|---|---|
| 1 | **Visión General** | Contexto MINERD, objetivos, stakeholders, alcance del proyecto, filosofía de diseño | [Cap1](./SIGERA_DAF_Cap1_Vision_General.md) |
| 2 | **Arquitectura del Negocio** | 10 macroprocesos, 17 reglas de negocio, flujos por actor, 6 alertas automáticas | [Cap2](./SIGERA_DAF_Cap2_Arquitectura_Negocio.md) |
| 3 | **Arquitectura Funcional** | 20 casos de uso, 26 historias de usuario, motor de cálculo, 12 pantallas diseñadas | [Cap3](./SIGERA_DAF_Cap3_Arquitectura_Funcional.md) |
| 4 | **Arquitectura de Datos** | 28 tablas PostgreSQL, 11 tipos ENUM, SQL completo, diccionario de datos, triggers | [Cap4](./SIGERA_DAF_Cap4_Arquitectura_Datos.md) |
| 5 | **Arquitectura de Software** | FastAPI + React, 60+ endpoints REST, JWT+RBAC, Docker, estructura de carpetas | [Cap5](./SIGERA_DAF_Cap5_Arquitectura_Software.md) |
| 6 | **Reportes y Power BI** | 20 reportes, 7 CSVs dataset, modelo estrella, 10 fórmulas DAX, 3 dashboards | [Cap6](./SIGERA_DAF_Cap6_Reportes_PowerBI.md) |
| 7 | **Inteligencia Artificial** | Predicción de riesgo, alertas tempranas, pipeline ML, ética de la IA | [Cap7](./SIGERA_DAF_Cap7_Inteligencia_Artificial.md) |
| 8 | **Plan de Implementación** | Roadmap 16 meses, Gantt, equipo, pruebas, riesgos, capacitación, próximos pasos | [Cap8](./SIGERA_DAF_Cap8_Plan_Implementacion.md) |

---

> [!IMPORTANT]
> **Próximo paso obligatorio antes de desarrollar:**
> Validar las competencias específicas de cada asignatura con el Coordinador Académico del centro. Este es el único catálogo que no puede ser predefinido sin validación institucional (ver Cap. 4, Sección 7.3).

---

> [!NOTE]
> **Cierre Oficial del DAF — SIGERA**
>
> Con este octavo capítulo se da por concluida la fase de **conceptualización, diseño arquitectónico y planificación estratégica** de SIGERA.
>
> El sistema está completamente diseñado. Cada regla de negocio, cada tabla de base de datos, cada endpoint de la API, cada pantalla y cada fórmula de cálculo ha sido documentada. El proyecto está listo para pasar de la mesa de diseño al teclado.
>
> **¡Manos a la obra!** 🚀

---

*© 2026 SIGERA — Todos los derechos reservados*

**Capítulo anterior:** [Capítulo 7 — Inteligencia Artificial](./SIGERA_DAF_Cap7_Inteligencia_Artificial.md)
