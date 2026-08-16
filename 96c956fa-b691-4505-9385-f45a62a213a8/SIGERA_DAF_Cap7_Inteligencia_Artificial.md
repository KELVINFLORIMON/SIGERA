# Capítulo 7: Inteligencia Artificial en SIGERA

## 7.1 Introducción y Visión de la Inteligencia Artificial (IA) en SIGERA

El Sistema Inteligente de Gestión Educativa y Rendimiento Académico (SIGERA) ha sido concebido desde sus cimientos para trascender la mera digitalización de procesos administrativos y académicos. La incorporación de la Inteligencia Artificial (IA) representa el cenit de esta visión (correspondiente a las Etapas 5 y 6 del desarrollo del sistema), transformando un repositorio pasivo de datos en un ecosistema proactivo, predictivo y prescriptivo. En el contexto del nivel secundario de la República Dominicana, caracterizado por desafíos persistentes en términos de retención escolar, rendimiento académico dispar y recursos pedagógicos limitados, la IA emerge como un catalizador indispensable para la equidad y la excelencia educativa.

La visión de la IA en SIGERA no es reemplazar el invaluable juicio humano y la vocación de los docentes y equipos de gestión, sino potenciar sus capacidades mediante la provisión de "superpoderes analíticos". La IA actuará como un observador incansable, identificando patrones sutiles, correlaciones complejas y señales de alerta temprana que a menudo escapan al análisis humano debido a la magnitud y complejidad de los datos.

**Requisito Fundamental:**
Es imperativo establecer que la implementación de los modelos de IA en SIGERA está condicionada a la existencia de un corpus de datos históricos robusto y representativo. Se establece como requisito *sine qua non* la recopilación de **al menos un (1) año escolar completo de datos históricos** dentro de la plataforma (idealmente abarcando las Etapas 1 a 4). Este período de "incubación de datos" es vital para que los algoritmos de Machine Learning (ML) puedan "aprender" los patrones específicos, la estacionalidad académica y las dinámicas particulares de los centros educativos dominicanos. Intentar desplegar modelos predictivos sin esta base histórica resultaría en predicciones erráticas, sesgadas y carentes de utilidad práctica, minando la confianza de los usuarios en el sistema.

La estrategia de IA se alinea estrechamente con las normativas del Ministerio de Educación de la República Dominicana (MINERD), buscando proporcionar herramientas concretas para alcanzar los objetivos de los planes decenales y estrategias nacionales de desarrollo en el ámbito educativo.

---

## 7.2 Casos de Uso de Inteligencia Artificial

El despliegue de la IA en SIGERA se articula en torno a casos de uso estratégicamente seleccionados, diseñados para abordar las problemáticas más acuciantes del sistema educativo secundario. A continuación, se detallan exhaustivamente estos casos:

### 7.2.1 Predicción de Riesgo de Reprobación (Por Estudiante y Por Asignatura)
Este es el pilar predictivo fundamental de SIGERA. El sistema no espera a que un estudiante repruebe al final del año o en un período específico para alertar. Utilizando modelos de aprendizaje supervisado, la IA evalúa continuamente la trayectoria del estudiante desde el inicio del año escolar.
- **Por Estudiante:** Calcula una probabilidad global de que el estudiante no logre la promoción al siguiente grado, considerando su rendimiento general en todas las asignaturas.
- **Por Asignatura:** Proporciona una predicción granular (e.g., "Juan Pérez tiene un 85% de probabilidad de reprobar Matemáticas"), permitiendo intervenciones focalizadas. Esta capacidad es crucial en el nivel secundario dominicano, donde materias específicas (Matemáticas, Lengua Española, Ciencias de la Naturaleza) históricamente presentan altas tasas de fracaso.

### 7.2.2 Predicción de Riesgo de Abandono Escolar (Deserción)
El abandono escolar es un fenómeno multifactorial complejo. La IA de SIGERA trasciende el análisis puramente académico (calificaciones) para incorporar variables de la Etapa 2 (Control de Asistencia) y datos demográficos (Etapa 1). El modelo busca identificar señales tempranas de desvinculación: ausentismo crónico progresivo, caídas abruptas en el rendimiento que coinciden con cambios de etapa (e.g., paso de primer a segundo ciclo de secundaria), e historial de repitencia. La alerta temprana permite a los orientadores, psicólogos escolares y equipos de gestión intervenir antes de que la decisión de abandonar se materialice, abordando posibles causas socioemocionales o de otra índole.

### 7.2.3 Alertas Tempranas Automáticas
La IA se integra con el módulo de notificaciones y el dashboard de usuario para generar y canalizar alertas automatizadas. Estas no son simples informes, sino "llamadas a la acción". Cuando la probabilidad de riesgo (reprobación o abandono) cruza un umbral predefinido (ej. > 70%), el sistema dispara una alerta inmediata a las partes interesadas relevantes (Docente Guía, Orientador, Coordinador Pedagógico). Esto transforma el paradigma de "evaluación post-mortem" (actuar después del boletín de calificaciones) a uno de "intervención concurrente" (actuar mientras el período está en curso).

### 7.2.4 Detección de Asignaturas y Competencias Críticas
A nivel macro (centro educativo o distrito), la IA analiza el rendimiento agregado para identificar "cuellos de botella" pedagógicos.
- **Asignaturas Críticas:** Identifica materias donde, de manera sistemática y a través de múltiples secciones, las tasas de aprobación son anómalamente bajas.
- **Competencias Críticas:** Basado en el diseño curricular dominicano (enfocado en competencias), el sistema, al analizar las calificaciones de los indicadores de logro asociados a competencias específicas, puede detectar cuáles son las competencias específicas (ej. "Resolución de Problemas Matemáticos" o "Comprensión Escrita") que presentan mayores deficiencias a nivel grupal o de grado. Esto permite a la coordinación pedagógica organizar talleres de refuerzo o reajustar las estrategias de enseñanza institucionales.

### 7.2.5 Análisis de Rendimiento por Docente (Sin Sesgo Evaluativo)
Es fundamental enfatizar que este caso de uso **no tiene un fin punitivo ni de evaluación del desempeño laboral**. El objetivo es proporcionar al coordinador pedagógico información objetiva sobre varianzas significativas en el rendimiento de los estudiantes agrupados por docente. Si la IA detecta que, en condiciones comparables (mismo grado, similar perfil de estudiantes), los resultados en una asignatura varían drásticamente de un docente a otro, esto puede indicar una disparidad en la aplicación de los criterios de evaluación, en la efectividad de las metodologías empleadas o en el nivel de exigencia. Esta información permite a la coordinación propiciar espacios de diálogo profesional, intercambios de buenas prácticas y nivelación de criterios entre el cuerpo docente.

### 7.2.6 Recomendaciones Pedagógicas Personalizadas
Evolucionando de lo predictivo a lo prescriptivo, la IA de SIGERA analizará el perfil de dificultades de un estudiante o grupo y sugerirá estrategias pedagógicas. Estas sugerencias se basarán en un repositorio histórico de intervenciones exitosas registradas en el sistema. Por ejemplo, si el modelo detecta que un estudiante falla consistentemente en competencias analíticas pero sobresale en las prácticas, podría recomendar al docente "Incorporar más actividades prácticas y proyectos manipulativos para abordar los conceptos teóricos".

### 7.2.7 Análisis de Tendencias Históricas Multi-Año
Con el paso del tiempo, SIGERA acumulará un valioso histórico. La IA permitirá identificar tendencias a largo plazo: ¿Están mejorando las tasas de retención tras la implementación de ciertas políticas en el centro? ¿Cómo impactan los cambios en el currículo nacional en el rendimiento de las cohortes a través de los años? Estos análisis de series de tiempo son fundamentales para la planificación estratégica de la dirección del centro escolar y, potencialmente, para instancias superiores del sistema educativo.

---

## 7.3 Arquitectura del Módulo de Inteligencia Artificial

La arquitectura del módulo de IA ha sido diseñada siguiendo los principios de separación de responsabilidades, escalabilidad, y mantenibilidad. Se ha optado por desacoplar los procesos de Machine Learning intensivos computacionalmente del núcleo transaccional del sistema (el backend principal), asegurando que las operaciones de predicción y reentrenamiento no afecten el rendimiento de las tareas diarias (registro de notas, asistencia, etc.).

### 7.3.1 Stack Tecnológico
El ecosistema de IA de SIGERA se basa en las herramientas más robustas y probadas de la industria científica y de datos:
- **Lenguaje de Programación:** Python 3.10+ (Estándar de la industria para Data Science y Machine Learning por su vasto ecosistema y eficiencia).
- **Manipulación y Análisis de Datos:** Pandas y NumPy (Para extracción, transformación, limpieza y "feature engineering" de los volúmenes de datos históricos extraídos de la base de datos transaccional).
- **Modelado Predictivo y Machine Learning:** Scikit-Learn (Para la implementación, entrenamiento, validación y ajuste de modelos de clasificación clásicos como Regresión Logística y Random Forest).
- **Modelos Avanzados (Opcional/Fase Avanzada):** XGBoost o LightGBM (Para modelos de Gradient Boosting que suelen ofrecer un rendimiento superior en datos tabulares complejos).
- **Serialización de Modelos:** Joblib (Para guardar los modelos entrenados y sus transformadores asociados (ej. *scalers*, *encoders*) en disco, permitiendo su carga rápida en el entorno de producción).
- **Servicio de Inferencia (API):** FastAPI (Para exponer los modelos predictivos como servicios web RESTful de alto rendimiento, baja latencia y con validación automática de datos de entrada).

### 7.3.2 Flujo Arquitectónico General
El flujo de la IA se divide en dos ciclos principales: el Ciclo de Entrenamiento (Batch) y el Ciclo de Predicción (En Tiempo Real).

**Ciclo de Entrenamiento (Mensual/Bimestral):**
1. **Extracción (ETL):** Un proceso automatizado extrae de manera segura los datos históricos consolidados desde la base de datos principal PostgreSQL.
2. **Preprocesamiento y Feature Engineering:** Pandas limpia los datos (manejo de nulos, valores atípicos) y genera las variables predictoras complejas (ej. "tendencia de notas de los últimos 3 meses").
3. **Entrenamiento:** Scikit-Learn entrena los modelos utilizando datos históricos donde el resultado (promovido/reprobado) ya es conocido.
4. **Validación:** Se evalúa el rendimiento del modelo en un conjunto de datos de prueba para asegurar que cumple los umbrales mínimos de precisión.
5. **Serialización:** Si el modelo es satisfactorio, se empaqueta junto con su "pipeline" de preprocesamiento utilizando Joblib y se guarda en un almacenamiento seguro (ej. AWS S3 o un volumen de almacenamiento local protegido).

**Ciclo de Predicción (Diario/En Tiempo Real):**
1. **Solicitud (Trigger):** El core backend de SIGERA (escrito en Node.js, C#, Java, etc. - referirse al Cap. 8 de Arquitectura General) detecta un evento relevante, por ejemplo, el cierre de un período de evaluación (P1, P2...) para un estudiante.
2. **Llamada a la API de IA:** El core backend envía un payload JSON con las características actuales del estudiante al endpoint de FastAPI (el microservicio de IA).
3. **Inferencia:** FastAPI recibe los datos, carga el modelo en memoria (o lo utiliza si ya está en caché), aplica el pipeline de preprocesamiento para estandarizar los datos de entrada a como los espera el modelo, y genera la predicción (probabilidad de riesgo).
4. **Respuesta:** FastAPI devuelve el resultado al core backend.
5. **Acción:** El core backend procesa el resultado. Si el riesgo supera el umbral, registra la alerta en la base de datos principal y dispara el sistema de notificaciones correspondiente (dashboard, correo electrónico).

### 7.3.3 Separación Clara del Core del Sistema
Esta arquitectura basada en microservicios asegura que el módulo de IA opera de forma independiente:
- **Resiliencia:** Si el servicio de IA experimenta un fallo temporal, el core transaccional de SIGERA (registro de notas, gestión administrativa) sigue funcionando sin interrupciones. Simplemente, las nuevas predicciones se encolarán o se omitirán temporalmente.
- **Escalabilidad Independiente:** Si la demanda de predicciones aumenta drásticamente (ej. a final de semestre), el microservicio de IA en FastAPI puede ser escalado horizontalmente (añadiendo más instancias) de manera independiente al resto de la aplicación.
- **Mantenibilidad:** Los equipos de Data Science pueden actualizar los modelos, refactorizar el código de Python y desplegar nuevas versiones del servicio de IA sin requerir un despliegue completo de la plataforma SIGERA.

---

## 7.4 Features (Variables Predictoras) para el Modelo de Riesgo de Reprobación

El rendimiento de cualquier modelo de Machine Learning es directamente proporcional a la calidad y pertinencia de los datos de entrada (el principio "Garbage In, Garbage Out"). Para predecir el riesgo de reprobación en el contexto dominicano, el proceso de *Feature Engineering* es crítico. A continuación se detallan las variables (features) fundamentales que alimentarán el modelo.

### 7.4.1 Variables Académicas (El núcleo del modelo)
Estas variables capturan el progreso cognitivo y evaluativo directo del estudiante a lo largo de los períodos (P1, P2, P3, P4) definidos por el currículo del MINERD.
- `nota_acumulada_p1`, `nota_acumulada_p2`, etc.: Las calificaciones cuantitativas registradas por período.
- `promedio_general_actual`: El promedio móvil de todas las asignaturas hasta el momento de la evaluación.
- `tendencia_academica_global`: Un valor derivado que mide si el rendimiento promedio está aumentando, estable o disminuyendo. Se calcula como la pendiente de una regresión lineal simple sobre las notas de los períodos anteriores. Una tendencia negativa fuerte es un poderoso predictor de riesgo.
- `cantidad_asignaturas_reprobadas_actualmente`: Conteo de materias donde el estudiante está por debajo de la nota mínima aprobatoria (generalmente 70 en nivel secundario).

### 7.4.2 Variables de Recuperación (Indicadores de esfuerzo y resiliencia)
El sistema educativo dominicano contempla procesos de recuperación pedagógica a lo largo del año y evaluaciones extraordinarias/completivas al final. Estas variables son altamente predictivas:
- `asistencia_recuperacion_continua`: Porcentaje de asistencia a las sesiones de tutoría/recuperación programadas durante los períodos regulares. Una baja asistencia a recuperación cuando las notas son deficientes correlaciona fuertemente con reprobación final.
- `estado_asignaturas_pendientes`: Si el estudiante arrastra materias pendientes de años anteriores, su probabilidad general de riesgo aumenta significativamente, ya que representa una sobrecarga académica.

### 7.4.3 Variables Demográficas y de Perfil Estudiantil (Contexto del alumno)
Estas variables establecen la línea base del estudiante antes del inicio del período de evaluación actual.
- `grado_actual`: El nivel académico (ej. 1ro, 2do de secundaria). Ciertos grados de transición suelen presentar mayores desafíos de adaptación y, por ende, mayor riesgo.
- `condicion_inicial`: Estado del estudiante al iniciar el año (`'promovido_regular'`, `'promovido_condicional'`, `'repitente'`). Históricamente, los estudiantes repitentes presentan una vulnerabilidad estadística superior.
- `sexo`: Variable demográfica estándar. Aunque los modelos se calibran para evitar sesgos perjudiciales (ver sección 7.9), esta variable, en interacción con otras, a veces ayuda a perfilar intervenciones socioeducativas más ajustadas.
- `edad_sobre_edad_esperada`: Diferencia entre la edad cronológica del estudiante y la edad normativa para el grado en curso. La sobreedad es un indicador clásico de vulnerabilidad académica en sistemas educativos latinoamericanos.

### 7.4.4 Variables de Asistencia (La dimensión conductual, provenientes de la Etapa 2)
El rendimiento académico no existe en un vacío; está intrínsecamente ligado a la presencia física (y atencional) del estudiante.
- `porcentaje_asistencia_global`: Asistencia acumulada en todas las asignaturas.
- `tardanzas_acumuladas`: Frecuencia de llegadas tardías, lo cual puede reflejar desmotivación, problemas de transporte o situaciones en el entorno familiar.
- `ausencias_consecutivas_maximas`: El número máximo de días seguidos que el estudiante ha faltado. Episodios de ausencia prolongada interrumpen severamente el proceso de aprendizaje, dificultando la recuperación de las competencias perdidas.

### 7.4.5 Variables Contextuales (El entorno pedagógico)
El desempeño se evalúa dentro de un ecosistema específico.
- `codigo_asignatura`: (Categórica) Permite al modelo aprender si materias intrínsecamente difíciles (ej. Física, Química avanzada) tienen perfiles de riesgo distintos a otras.
- `ID_docente`: (Categórica anonimizada) El sistema "aprende" que un estudiante sacando 70 con el "Docente A" (conocido por evaluaciones muy rigurosas) podría tener menos riesgo real que un estudiante sacando 70 con el "Docente B" (conocido por mayor laxitud). **Nota crucial:** Esto es un ajuste estadístico interno del modelo, *nunca* un juicio sobre la calidad del docente (Ver 7.9).
- `seccion_id`: (Categórica) Permite capturar "efectos de grupo" o dinámicas de aula particulares que influyen en el aprendizaje colectivo.

---

## 7.5 Modelos de Machine Learning a Evaluar

La selección del algoritmo adecuado es un proceso empírico. SIGERA adoptará una estrategia de evaluación múltiple durante la fase de desarrollo, contrastando diversos enfoques para seleccionar aquel que ofrezca el mejor balance entre precisión, capacidad explicativa (interpretabilidad) y eficiencia computacional. El objetivo es resolver un problema clásico de **Clasificación Binaria**: ¿El estudiante [0] Aprobará o [1] Reprobará?

### 7.5.1 Regresión Logística (El Baseline Interpretable)
Se utilizará la Regresión Logística como el modelo fundamental de línea base (baseline).
- **Ventajas:** Es extremadamente rápido de entrenar y ejecutar. Su principal virtud reside en la *interpretabilidad*: los coeficientes asignados a cada variable revelan directamente su peso y dirección (positiva o negativa) en la probabilidad final. Permite responder fácilmente preguntas como "¿Cuánto aumenta el riesgo si las ausencias suben un 10%?".
- **Limitaciones:** Asume una relación lineal entre las variables predictoras y el logaritmo de las probabilidades (log-odds), lo cual puede ser insuficiente para modelar interacciones complejas no lineales inherentes a los datos educativos reales.

### 7.5.2 Random Forest (El Modelo Principal y Candidato Fuerte)
Random Forest, un algoritmo de ensamble basado en la construcción de múltiples árboles de decisión, es el candidato principal para producción en SIGERA.
- **Ventajas:** Es robusto, maneja inherentemente relaciones no lineales complejas y variables categóricas (como 'asignatura' o 'sección') con gran eficacia. Es resistente al sobreajuste (overfitting) gracias a la técnica de *bagging* y a la selección aleatoria de características. Además, proporciona una medida valiosa de la **Importancia de las Características** (Feature Importance), permitiendo identificar cuáles son los factores (ej. ausencias vs. nota P1) que más están pesando en las predicciones globales.
- **Limitaciones:** Es un modelo de "caja negra" más compleja que la regresión logística, dificultando explicar con total precisión *por qué* se tomó una decisión específica para un individuo particular (aunque técnicas como SHAP values pueden mitigar esto).

### 7.5.3 Gradient Boosting (XGBoost / LightGBM) (El Campeón del Rendimiento)
Los algoritmos de Gradient Boosting construyen árboles de decisión de forma secuencial, donde cada nuevo árbol intenta corregir los errores cometidos por los árboles anteriores.
- **Ventajas:** Típicamente ofrecen la máxima precisión predictiva en problemas de datos tabulares, superando frecuentemente al Random Forest. Son altamente optimizados para velocidad y eficiencia de memoria (especialmente LightGBM).
- **Limitaciones:** Son más propensos al sobreajuste si no se calibran cuidadosamente (tuning de hiperparámetros complejo). Son aún menos interpretables que los Random Forests y requieren mayor pericia técnica para su mantenimiento. Se evaluarán como una opción para maximizar las métricas si el Random Forest resulta insuficiente.

### 7.5.4 Tabla Comparativa Teórica de Evaluación de Modelos

| Métrica | Regresión Logística (Baseline) | Random Forest (Principal) | Gradient Boosting (XGBoost) | Justificación para el Contexto Educativo (SIGERA) |
| :--- | :--- | :--- | :--- | :--- |
| **Accuracy (Exactitud)** | Media | Alta | Muy Alta | Mide la corrección global. Útil, pero engañosa si las clases están desbalanceadas (ej. 90% aprueba, 10% reprueba). |
| **Precision (Precisión)** | Media-Alta | Alta | Alta | De los que predecimos en "Riesgo", ¿cuántos realmente lo están? Crucial para no saturar a los docentes con falsas alarmas (fatiga de alertas). |
| **Recall (Sensibilidad)** | Media | Alta | Alta | De todos los que *realmente* van a reprobar, ¿cuántos logró detectar el modelo? **Esta es la métrica más crítica en SIGERA.** Es preferible una falsa alarma (intervenir a un estudiante que quizás no lo necesitaba tanto) que omitir a un estudiante en verdadero riesgo (falso negativo). |
| **F1-Score** | Media | Alta | Alta | Media armónica entre Precision y Recall. Proporciona un balance realista del rendimiento del modelo. |
| **Interpretabilidad** | Muy Alta | Media | Baja | Crítico para la confianza del docente. La Regresión Logística gana aquí, pero Random Forest con herramientas de explicabilidad ofrece el mejor compromiso. |
| **Tiempo de Entrenamiento** | Muy Rápido | Moderado | Moderado/Lento | Importante para la frecuencia de reentrenamiento, pero menos crítico que el rendimiento predictivo. |

*Nota: La selección final del modelo se basará empíricamente en la evaluación de la métrica Recall ponderada por F1-Score en los datos históricos reales dominicanos recopilados durante la Etapa de validación de SIGERA.*

---

## 7.6 Flujo Técnico del Pipeline de IA

La operativización de los conceptos teóricos descritos anteriormente se materializa a través de un riguroso *pipeline* de datos y Machine Learning. Este flujo garantiza la reproducibilidad, automatización y confiabilidad del sistema predictivo.

### 7.6.1 Extracción de Datos Históricos (PostgreSQL)
El proceso inicia conectándose a la base de datos relacional principal del sistema. Se ejecutan consultas SQL complejas (JOINs masivos) para consolidar en un formato tabular "plano" toda la información de un estudiante en un punto temporal específico.
*Ejemplo conceptual de extracción:* "Dame todos los estudiantes de 3ro de secundaria del ciclo pasado, sus notas de P1 y P2, su asistencia hasta P2, y si finalmente aprobaron (1) o reprobaron (0) a final de año".

### 7.6.2 Preprocesamiento y Feature Engineering (Pandas)
Los datos brutos rara vez están listos para el modelado. Esta fase, ejecutada típicamente en scripts de Python orquestados, involucra:
1.  **Limpieza:** Imputación de valores faltantes (ej. si falta una nota de un quiz menor, ¿se promedia o se asume cero basado en reglas del negocio?). Tratamiento de valores atípicos evidentes (errores de digitación como una nota de 150).
2.  **Transformación:** Codificación de variables categóricas. Convertir el texto 'Masculino'/'Femenino', o los nombres de las asignaturas, a representaciones numéricas que los algoritmos matemáticos puedan procesar (ej. One-Hot Encoding).
3.  **Creación de Nuevas Variables (Feature Generation):** Ejecutar los cálculos matemáticos para crear las variables descritas en la sección 7.4 (ej. calcular la tendencia lineal de las notas).
4.  **Escalado/Normalización:** Estandarizar rangos (especialmente crítico para la Regresión Logística), asegurando que una variable con valores grandes (ej. edad en días) no domine numéricamente a una variable con valores pequeños (ej. nota sobre 100).

### 7.6.3 Entrenamiento y Validación (Scikit-Learn)
Los datos preparados se dividen, de forma estándar, en un conjunto de entrenamiento (ej. 80% de los datos) y un conjunto de prueba (20% restante, "nunca visto" por el modelo).
1.  **Ajuste (Fit):** El algoritmo (ej. `RandomForestClassifier`) "aprende" de los patrones en el conjunto de entrenamiento.
2.  **Validación Cruzada (Cross-Validation):** Se emplea K-Fold Cross-Validation para asegurar que el modelo sea robusto y no dependa de la "suerte" de cómo se dividieron los datos.
3.  **Predicción en Prueba:** El modelo ajustado predice los resultados sobre el conjunto del 20% oculto.
4.  **Evaluación:** Las predicciones se comparan con la realidad (la calificación final real del histórico) generando las métricas (Recall, Precision, etc.) para certificar la validez del modelo.

### 7.6.4 Serialización (Joblib)
Una vez el modelo de Machine Learning y todos los pasos previos de preprocesamiento (que juntos conforman un *Pipeline* de Scikit-Learn) son validados y aprobados, el objeto completo en memoria se "congela" y se guarda en un archivo físico en el disco servidor. La biblioteca `joblib` es el estándar en Python para persistir eficientemente objetos NumPy grandes.
El resultado es un archivo, por ejemplo, `modelo_riesgo_v1.2.pkl`.

### 7.6.5 Servicio de Predicción (Inferencia) como Endpoint FastAPI
El archivo `.pkl` es el "cerebro" del sistema, pero necesita una "boca y oídos" para comunicarse. Aquí entra FastAPI. Se desarrolla una aplicación web minimalista en Python que:
1.  Arranca y carga el `modelo_riesgo_v1.2.pkl` en la memoria del servidor.
2.  Expone una ruta HTTP, por ejemplo, `POST /api/ia/prediccion/riesgo`.
3.  Escucha peticiones JSON estructuradas provenientes del backend principal de SIGERA.
4.  Pasa el JSON al objeto del pipeline cargado, obtiene la probabilidad numérica.
5.  Responde con un JSON estandarizado al backend de SIGERA.

### 7.6.6 Actualización Mensual (Reentrenamiento Continuo)
La educación no es estática. Cambios curriculares, crisis nacionales o nuevas metodologías pueden alterar los patrones de aprendizaje. El modelo se degradará ("data drift") con el tiempo. Por ello, la arquitectura contempla un proceso de reentrenamiento mensual o trimestral automatizado.
Un proceso *cron* tomará los datos acumulados más recientes, ejecutará todo el pipeline de entrenamiento nuevamente, y si el nuevo modelo supera las métricas del modelo actual en producción, reemplazará el archivo `.pkl` y reiniciará el servicio FastAPI de manera transparente.

### 7.6.7 Pseudocódigo Python del Pipeline de Predicción (Microservicio FastAPI)

```python
# Pseudocódigo del endpoint de inferencia - IA SIGERA
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib

# Inicializar la aplicación API
app = FastAPI(title="SIGERA AI Inference Service", version="1.0")

# Cargar el modelo pre-entrenado al iniciar el servidor (evita cargarlo en cada petición)
try:
    # Este pipeline.pkl contiene todo: imputadores, escaladores y el RandomForest
    modelo_pipeline = joblib.load("modelos_produccion/pipeline_riesgo_rf_v1.pkl")
except FileNotFoundError:
    raise RuntimeError("Error crítico: Modelo predictivo no encontrado.")

# Definir el esquema de datos esperado usando Pydantic (Validación automática)
class DatosEstudiante(BaseModel):
    estudiante_id: str
    nota_p1: float
    nota_p2: float = None # Puede ser nulo si aún no estamos en ese periodo
    promedio_historico: float
    porcentaje_asistencia: float
    tardanzas: int
    grado: int
    condicion_previa: str # ej. "repitente", "promovido"
    id_asignatura: str

@app.post("/api/v1/predict/riesgo_reprobacion")
async def predecir_riesgo(datos: DatosEstudiante):
    """
    Endpoint para predecir el riesgo de reprobación basado en datos actuales.
    """
    try:
        # 1. Convertir el JSON entrante a un formato tabular de una fila (DataFrame)
        df_entrada = pd.DataFrame([datos.dict()])
        
        # 2. Ejecutar el modelo (el pipeline maneja automáticamente el escalado, 
        #    manejo de nulos p2, y codificación de variables categóricas)
        
        # Obtenemos las probabilidades [prob_aprobar, prob_reprobar]
        probabilidades = modelo_pipeline.predict_proba(df_entrada)
        
        # Nos interesa la probabilidad de la clase "1" (Reprobar)
        probabilidad_reprobar = probabilidades[0][1]
        
        # 3. Lógica de negocio básica para clasificar el nivel (puede moverse al core)
        nivel_riesgo = "VERDE"
        if probabilidad_reprobar > 0.70:
            nivel_riesgo = "ROJO"
        elif probabilidad_reprobar > 0.40:
            nivel_riesgo = "AMARILLO"
            
        # 4. Estructurar respuesta para el backend transaccional de SIGERA
        respuesta = {
            "estudiante_id": datos.estudiante_id,
            "probabilidad_riesgo": float(probabilidad_reprobar), # ej. 0.75
            "nivel_alerta": nivel_riesgo,
            "timestamp_prediccion": pd.Timestamp.now().isoformat()
        }
        
        return respuesta
        
    except Exception as e:
        # Manejo de errores para evitar que el servicio caiga
        raise HTTPException(status_code=500, detail=f"Error en inferencia IA: {str(e)}")

# Ejemplo de ejecución del servidor (si se corre localmente):
# uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 7.7 Sistema de Alertas Inteligentes (Integración con el Dashboard)

La información generada por la IA carece de valor si no es consumible e interpretable por los actores educativos, en el momento preciso y sin abrumarlos. El sistema de alertas actúa como la interfaz entre la predicción matemática y la acción humana.

### 7.7.1 Arquitectura Visual de Riesgo (Sistema de Semáforo)
SIGERA empleará una taxonomía visual universalmente comprensible para traducir la probabilidad continua (0.0 a 1.0) calculada por el modelo a categorías accionables en los dashboards.

- **VERDE (Riesgo Bajo / Sin Riesgo Significativo):**
  - **Umbral de Probabilidad:** < 40% (ajustable por administración).
  - **Interpretación:** El estudiante presenta una trayectoria académica y conductual alineada con los parámetros históricos de éxito.
  - **Acción del Sistema:** No se generan notificaciones activas. El estudiante aparece en listas normales.

- **AMARILLO (Riesgo Medio / Seguimiento Preventivo):**
  - **Umbral de Probabilidad:** 40% - 70%.
  - **Interpretación:** Se han detectado desviaciones preocupantes (ej. baja nota en un parcial importante o incremento inusual de tardanzas). El estudiante podría recuperarse sin ayuda, pero la probabilidad de fallo está aumentando.
  - **Acción del Sistema:** El estudiante es resaltado visualmente en el registro del Docente Guía y en el panel del Orientador. Se genera una "Sugerencia de Observación" pasiva en el dashboard.

- **ROJO (Riesgo Alto / Intervención Crítica Requerida):**
  - **Umbral de Probabilidad:** > 70%.
  - **Interpretación:** Basado en el comportamiento histórico de casos idénticos, la reprobación o el abandono es inminente si se mantiene la trayectoria actual.
  - **Acción del Sistema:** 
    - Se dispara una Notificación Activa (Push, E-mail interno, alerta roja intermitente en dashboard) dirigida inmediatamente al Orientador, Docente Guía y Coordinador Pedagógico.
    - El estudiante se incluye automáticamente en una lista prioritaria de "Casos Críticos" que requiere la apertura de un expediente de intervención psicopedagógica documentado dentro del mismo sistema SIGERA (integración con submódulos de orientación).

### 7.7.2 Gatillos (Triggers) Temporales de Alerta
¿Cuándo evalúa la IA a los estudiantes? La predicción continua es costosa computacionalmente e innecesaria. Se establecen eventos discretos que desencadenan el proceso de inferencia:
1.  **Cierre de Período Oficial (P1, P2, P3):** Inmediatamente después de la fecha límite de digitación de notas por parte de los docentes. Es la evaluación principal.
2.  **Alertas de Asistencia (Continuas):** Si el módulo de asistencia (Etapa 2) registra X ausencias consecutivas, o sobrepasa un porcentaje mensual, gatilla una evaluación extraordinaria de IA independientemente del período de notas.
3.  **Hitos Críticos de Evaluación:** Tras la carga masiva de resultados de pruebas diagnósticas nacionales o institucionales al inicio del año.
4.  **Bajo Demanda:** A través de un botón "Analizar Riesgo" disponible para el Coordinador o Psicólogo en el perfil de un estudiante específico en cualquier momento.

### 7.7.3 Diagrama Conceptual del Flujo de Alertas

```text
+---------------------+     (Evento: Cierre P1)      +-------------------------+
|  Módulo Académico   | ---------------------------> | Orquestador de Eventos  |
|  (SIGERA Core DB)   |                              | (Backend Principal)     |
+---------------------+                              +-------------------------+
                                                              |
                                                              | Envía JSON con datos
                                                              v
+---------------------+      Devuelve: 0.85 (85%)    +-------------------------+
| Lógica de Negocio   | <--------------------------- | API Inteligencia Artif. |
| (Gestor de Alertas) |      Umbral > 0.70 (ROJO)    | (Modelo Random Forest)  |
+---------------------+                              +-------------------------+
         |
         | ¿Es alerta nueva o agravada?
         v
+-------------------------------------------------------+
|                 SISTEMA DE NOTIFICACIONES             |
| 1. Registrar evento en BD de Auditoría/Historial      |
| 2. Notificación In-App (Campanita) al Docente Guía    |
| 3. Correo Urgente al Departamento de Orientación      |
| 4. Actualización Visual en Panel de Mando de Dirección|
+-------------------------------------------------------+
```

---

## 7.8 Modelo de Recomendaciones Pedagógicas (IA Prescriptiva)

Moverse de diagnosticar el problema (reprobación) a sugerir la cura (intervención) representa la frontera más avanzada de SIGERA.

### 7.8.1 Enfoque Basado en Competencias
El sistema de recomendaciones no será genérico ("estudiar más"). Se anclará profundamente en el diseño curricular basado en competencias de la República Dominicana. Al cruzar el rendimiento histórico agregado de los indicadores de logro, la IA construirá un mapa de vulnerabilidades pedagógicas institucionales.

### 7.8.2 Mecánica de las Recomendaciones
1.  **Detección de Patrones Agrupados:** La IA no evalúa a un estudiante aislado, sino que analiza grupos (una sección entera, o todos los estudiantes en Nivel Amarillo en 4to grado).
2.  **Identificación de la Falla Raíz Matemática:** Si el modelo detecta que el 60% del grupo tiene bajo rendimiento en un indicador vinculado a la competencia "Resolución de Problemas", identifica este nodo como crítico.
3.  **Recuperación de Estrategias Históricas:** SIGERA incorporará (en etapas posteriores) un módulo donde docentes documentan las intervenciones realizadas. Un sistema de filtrado colaborativo (similar al motor de recomendación de Netflix o Amazon) cruzará el "Problema Detectado X" con las "Intervenciones que históricamente mejoraron notas en el Problema X en poblaciones similares".
4.  **Sugerencias por Nivel de Desempeño:** Las recomendaciones varían. Para estudiantes en nivel rojo, la sugerencia puede ser metodológica e intensiva (ej. "Tutoría entre pares supervisada"); para nivel amarillo, puede ser de refuerzo (ej. "Asignación de banco de ejercicios graduados").

### 7.8.3 Soberanía del Docente
**Principio Recto Innegociable:** La IA en SIGERA es un sistema de *Soporte a las Decisiones*, **no un sistema de Toma de Decisiones Autónomo**.
- Las recomendaciones pedagógicas se presentan siempre como *sugerencias estructuradas*, no como directrices obligatorias.
- El docente, con su conocimiento del contexto socio-emocional inmediato del aula, empatía y experiencia tácita, siempre tendrá la prerrogativa de aceptar, modificar o rechazar las recomendaciones del sistema.
- Se implementará un mecanismo de retroalimentación (thumbs up/down) para que el docente califique la utilidad de la recomendación, lo que permitirá a la IA aprender y refinar sus sugerencias en el futuro mediante aprendizaje por refuerzo continuo.

---

## 7.9 Consideraciones Éticas, Sesgo y Privacidad (IA Responsable)

El uso de algoritmos predictivos en educación conlleva profundas responsabilidades éticas. Un modelo mal calibrado o mal utilizado puede estigmatizar, amplificar desigualdades preexistentes o vulnerar derechos fundamentales. SIGERA adopta un marco estricto de "IA Ética y Responsable por Diseño".

### 7.9.1 Prohibición Estricta de Uso Punitivo o Evaluativo Laboral
Como se delineó en los casos de uso, las predicciones generadas y el análisis de varianza **están categórica y sistémicamente prohibidos de ser utilizados como herramienta primaria o secundaria para evaluar el desempeño laboral de un docente, fundamentar despidos, penalizaciones salariales o medidas disciplinarias.**
El diseño de la interfaz y los permisos de acceso reflejarán esta restricción. Los reportes dirigidos a directores mostrarán tendencias agregadas, promoviendo el apoyo institucional y la capacitación, nunca la culpabilización algorítmica.

### 7.9.2 Transparencia y Explicabilidad (XAI)
Para que los docentes confíen en el sistema, deben entender por qué la IA dice lo que dice. Los modelos de "Caja Negra" inescrutables generan rechazo.
- El sistema intentará proporcionar siempre un grado de explicabilidad de sus alertas. (ej. En lugar de decir solo "Riesgo 80%", dirá: "Riesgo 80%. *Factores principales que influyen en esta predicción:* 1. Disminución drástica de notas P1 a P2 en Matemáticas; 2. Ausencias continuas en la última quincena").
- Se evitará el determinismo absoluto en el lenguaje de la interfaz (se usará "alta probabilidad" en lugar de "este estudiante va a fracasar").

### 7.9.3 Mitigación de Sesgos Algorítmicos
Los modelos de IA aprenden de datos históricos. Si el historial educativo contiene sesgos sistémicos (ej. diferencias estructurales de rendimiento entre géneros en ciertas materias, o sesgos derivados de zonas geográficas marginadas si se incluyen esos datos), la IA podría replicar y automatizar esa discriminación.
- **Auditoría de Datos:** Antes del entrenamiento, el equipo de ciencia de datos someterá los conjuntos de datos a análisis estadísticos rigurosos para detectar desbalances representativos severos.
- **Exclusión de Variables Sensibles Problemáticas:** Dependiendo de las normativas vigentes y el análisis ético continuo, se evaluará la exclusión o anonimización de ciertas variables (ej. origen étnico, situación económica detallada, etc.) durante el entrenamiento, si se determina que su inclusión perjudica injustamente al estudiante frente al algoritmo.
- **Métricas de Equidad (Fairness Metrics):** Se medirá el desempeño del modelo desglosado por subgrupos vulnerables para garantizar que la tasa de errores (ej. falsos positivos) sea equitativa en todas las poblaciones del centro educativo.

### 7.9.4 Privacidad de Datos y Cumplimiento Normativo
Toda la arquitectura del módulo de IA estará subordinada a los protocolos de seguridad definidos en los capítulos correspondientes de este DAF y cumplirá con la legislación dominicana pertinente en materia de protección de datos personales y los lineamientos del MINERD respecto a la confidencialidad del historial académico del menor.
- Los modelos predictivos operarán estrictamente sobre datos anonimizados o seudonimizados siempre que sea técnicamente viable durante la fase de entrenamiento masivo.
- Las bases de datos que alimentan a la IA tendrán cifrado en reposo y tránsito.
- El acceso a los perfiles de riesgo predictivo estará restringido bajo un riguroso esquema de Control de Acceso Basado en Roles (RBAC), limitándolo exclusivamente a personal con autoridad pedagógica o psicopedagógica (Docentes Guías, Orientadores, Directores). Un estudiante regular no podrá ver su propia "predicción de fracaso", ya que esto podría generar profecías autocumplidas (efecto Pigmalión negativo) y graves consecuencias psicológicas.

---

## 7.10 Indicadores Clave de Éxito del Módulo de IA (KPIs)

Para asegurar que la inversión técnica y el esfuerzo institucional en IA brinden retornos tangibles, se monitorearán continuamente los siguientes Indicadores de Rendimiento:

### 7.10.1 Métricas Técnicas del Modelo (Data Science Metrics)
- **Precisión Global (Accuracy) Sostenida:** Mantener un umbral mínimo de validación >= 80% sobre datos no vistos durante todos los ciclos de reentrenamiento mensual. Si cae por debajo, alerta a los desarrolladores para investigar degradación de datos.
- **Recall en Población en Riesgo:** Optimizar la capacidad del modelo para detectar al menos al 85% de los estudiantes que, de no mediar intervención, terminarían reprobando (fuerte priorización de minimizar los falsos negativos).
- **Latencia de Inferencia API:** Asegurar que el endpoint FastAPI retorne predicciones en menos de 300 milisegundos en el percentil 95, evitando ralentizar el sistema central.

### 7.10.2 Métricas de Impacto Educativo (Business Metrics)
Estas son las verdaderas medidas del éxito del proyecto, y se evaluarán comparando cohortes tras la implementación de la IA.
- **Reducción Porcentual de la Tasa de Reprobación Global:** Disminución medible interanual (ej. objetivo de reducción del 15% en el primer ciclo lectivo tras activación plena).
- **Reducción de la Tasa de Abandono Escolar:** (Métrica crítica a largo plazo). Comparativa de abandono en centros con SIGERA-IA activa vs. línea base histórica.
- **Tasa de Respuesta a las Alertas Tempranas (Engagement):** Medición de cuántas alertas ROJAS o AMARILLAS generadas por el sistema resultaron en la apertura y registro real de una "Intervención" en el módulo de Orientación en un plazo de 72 horas (Mide la usabilidad y adopción del sistema por el personal humano).

---

## 7.11 Plan de Implementación y Despliegue Gradual (Roadmap Estratégico)

La introducción de IA en un ecosistema educativo tradicional es tanto un desafío técnico como cultural (gestión del cambio). No se puede activar "de golpe" y esperar el éxito inmediato. Se requiere un despliegue por fases.

### Fase 1: Acumulación de Datos (El Silencio Estratégico) - Año 1
- **Requisito Previsto y Estricto:** Durante el primer año de uso general de SIGERA (Etapas 1-4: matrícula, asistencia, calificaciones), el módulo predictivo estará completamente desactivado en la interfaz de usuario.
- **Acción:** Operación en las sombras. El sistema simplemente recopila la materia prima de manera pasiva y estructurada, garantizando la calidad, integridad e historial de los datos.

### Fase 2: Shadow Mode y Validación Técnica (Entrenamiento Pasivo) - Inicios Año 2
- Se ejecuta la arquitectura descrita en la sección 7.6 por primera vez, entrenando los modelos iniciales (ej. Random Forest) con la data del Año 1.
- El módulo de IA (FastAPI) se enciende y recibe peticiones de evaluación diarias, **PERO las alertas no se muestran a los usuarios finales**.
- Las predicciones se registran silenciosamente en una base de datos analítica paralela. Al finalizar un cuatrimestre, el equipo técnico analiza: "¿Acertó el sistema? Los que marcó en alerta roja oculta, ¿efectivamente reprobaron?". Esto permite calibrar los umbrales de sensibilidad sin generar "falsas alarmas" públicas que erosionen la confianza inicial de los docentes.

### Fase 3: Piloto Activo y Adopción Cultural (Validación con Usuarios Clave) - Mediados Año 2
- Activación selectiva. El módulo se enciende solo para un grupo restringido de usuarios "early adopters": principalmente los Departamentos de Orientación y Psicología de centros educativos piloto.
- Se realizan capacitaciones intensivas sobre cómo interpretar las alertas, enfatizando el principio de "soporte a decisión, no decisión divina".
- Se establece un bucle de retroalimentación estrecho (reuniones quincenales) para ajustar la interfaz de las alertas y comprender cómo el personal psicopedagógico integra esta información en sus rutinas diarias de apoyo estudiantil.

### Fase 4: Despliegue General y Expansión Funcional (Producción Plena) - Año 3 en adelante
- Liberación del sistema de alertas tipo semáforo a todos los Docentes Guías y Directores a través del dashboard de SIGERA.
- Activación de los procesos de reentrenamiento automático (mensual).
- Inicio del desarrollo de las funcionalidades más avanzadas de la visión: recomendaciones pedagógicas prescriptivas y el motor de filtrado colaborativo basado en el registro histórico de intervenciones exitosas, consolidando a SIGERA como un asistente experto integral y no solo como una herramienta de reporte.

*(Referencia a Capítulos: Para comprender la infraestructura de base de datos relacional y de microservicios que sustenta este módulo, referirse al **Capítulo 8: Arquitectura Técnica General**. El modelo de datos extraído para el entrenamiento se alimenta de las estructuras detalladas en el **Capítulo 6: Base de Datos Transaccional**).*
