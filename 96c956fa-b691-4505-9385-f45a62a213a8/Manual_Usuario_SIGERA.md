# Manual de Usuario - SIGERA
**Sistema Inteligente de Gestión Educativa y Rendimiento Académico**

---
**Versión:** 1.0  
**Fecha:** Agosto 2026  
**Nivel Educativo:** Secundario (Modalidad Académica Regular)  
**Marco Normativo:** Ordenanza 04-2023  

---

## Índice
1. [Introducción](#1-introducción)
2. [Acceso al Sistema](#2-acceso-al-sistema)
3. [Perfiles de Usuario](#3-perfiles-de-usuario)
4. [Manual para Administrador](#4-manual-para-administrador)
5. [Manual para Docente](#5-manual-para-docente)
6. [Manual para Coordinador Académico](#6-manual-para-coordinador-académico)
7. [Manual para Director](#7-manual-para-director)
8. [Resolución de Problemas Frecuentes](#8-resolución-de-problemas-frecuentes)

---

## 1. Introducción
**SIGERA** es la plataforma digital diseñada para modernizar y automatizar la gestión académica de los centros educativos del nivel secundario en República Dominicana. Este manual te guiará paso a paso para utilizar el sistema y facilitar tus labores diarias, eliminando el trabajo manual de cálculos y transcripciones en los registros de grado.

## 2. Acceso al Sistema
Para ingresar a SIGERA, sigue estos pasos:
1. Abre tu navegador web (preferiblemente Google Chrome o Mozilla Firefox).
2. Ingresa la dirección de la plataforma de tu centro educativo (Ejemplo: `sigera.tu-centro.edu.do`).
3. Introduce tu **Usuario** y **Contraseña** provistos por el departamento de tecnología o el administrador del centro.
4. Haz clic en **Iniciar Sesión**.

> [!NOTE]
> Si olvidaste tu contraseña, haz clic en *¿Olvidaste tu contraseña?* e ingresa tu correo electrónico para recibir un enlace de recuperación.

## 3. Perfiles de Usuario
El sistema se adapta automáticamente a tu rol, mostrando solo las opciones necesarias para tus responsabilidades:
- **Administrador:** Configura el sistema, maneja usuarios, estudiantes, docentes y genera exportaciones.
- **Docente:** Registra calificaciones, ingresa asistencia, maneja recuperación pedagógica y genera boletines de sus secciones.
- **Coordinador:** Revisa y valida calificaciones, monitorea el rendimiento y busca alertas tempranas.
- **Director:** Visualiza estadísticas generales del centro y aprueba reportes finales.

---

## 4. Manual para Administrador
El administrador es el encargado de la configuración inicial del sistema en cada año escolar.

### 4.1 Configuración Institucional
1. Ve a **Configuración > Institución**.
2. Verifica y actualiza los datos del centro educativo, regional, distrito y tandas.
3. En **Año Escolar**, crea el nuevo período (Ej. 2026-2027) y actívalo.

### 4.2 Gestión de Estudiantes y Docentes
- **Añadir un Estudiante:** Ve a **Gestión > Estudiantes**, haz clic en *Nuevo Estudiante*, llena el formulario con el RNE y datos personales, y guárdalo.
- **Matrícula:** Asigna los estudiantes al grado y sección correspondientes.
- **Añadir Docentes:** Ve a **Gestión > Docentes** e ingresa sus datos y asignaturas.

### 4.3 Asignación de Carga Académica
Para vincular al docente con los estudiantes:
1. Ingresa a **Académico > Carga Horaria**.
2. Selecciona la asignatura, el docente y la sección, y guarda los cambios.

---

## 5. Manual para Docente
Este es el flujo principal para registrar calificaciones como se hace en el Registro de Grado oficial.

### 5.1 Registro de Calificaciones por Período
1. En el menú principal, selecciona **Mis Secciones**.
2. Haz clic en la asignatura que deseas calificar.
3. Elige el período actual (P1, P2, P3 o P4).
4. Introduce las calificaciones para cada Competencia Específica (PC1, PC2, PC3, PC4) usando la escala del 0 al 100.
5. El sistema calcula automáticamente el promedio de la competencia. 
6. Haz clic en **Guardar Calificaciones**. 

> [!IMPORTANT]
> Recuerda que la nota mínima aprobatoria de cada área es de **70 puntos** (según Ordenanza 04-2023). El sistema resaltará en rojo aquellas calificaciones inferiores al mínimo.

### 5.2 Recuperación Pedagógica
Si un estudiante obtiene menos de 70 puntos en un período:
1. Ve a la pestaña **Recuperación Pedagógica**.
2. Registra la nueva calificación obtenida. El sistema conservará la nota original, pero aplicará las reglas del MINERD para actualizar el récord del período.

### 5.3 Evaluaciones Completivas y Extraordinarias
Al final del P4, el sistema evaluará automáticamente quiénes pasan directo, quiénes van a completiva y quiénes a extraordinaria. 
- Ve a **Cierre de Año > Pruebas Especiales** para registrar las notas correspondientes (CEC y CEX). El cálculo de 50/50 y 30/70 se hará sin que debas calcularlo a mano.

### 5.4 Generación de Boletines
1. Ve a la sección **Boletines**.
2. Selecciona tu sección y el período (Ej. P1).
3. Haz clic en **Generar Todos en PDF**. Se descargará un archivo consolidado con todos los boletines de tus estudiantes con formato MINERD.

---

## 6. Manual para Coordinador Académico

### 6.1 Validación de Calificaciones
1. Ve a **Supervisión > Calificaciones**.
2. Revisa el estado de cada asignatura. Verás indicadores de qué docentes ya finalizaron la carga de notas de su período.
3. Si los datos están correctos, haz clic en **Validar Registro** para bloquear su edición.

### 6.2 Alertas de Rendimiento
- En el panel principal (Dashboard), revisa la sección de **Estudiantes en Riesgo**. 
- Podrás identificar estudiantes que han reprobado más de 2 materias o cuya asistencia está por debajo del 70%.

---

## 7. Manual para Director

### 7.1 Visualización de Dashboards
El director tiene acceso a información en tiempo real sin necesidad de esperar reportes de Excel o pedir resúmenes a los docentes:
1. Ingresa a **Reportes > Dashboard Institucional**.
2. Selecciona un grado o nivel.
3. Analiza los gráficos de tasa de aprobación, reprobación y tendencias.

### 7.2 Certificación de Documentos
Desde la pestaña **Actas Oficiales**, el director puede firmar digitalmente o aprobar los documentos finales para ser emitidos e impresos con validez oficial del centro educativo.

---

## 8. Resolución de Problemas Frecuentes

- **¿Por qué no puedo editar una calificación del P1?**
  Si el período ya fue cerrado y validado por la coordinación, el docente pierde acceso de edición. Deberás solicitar una apertura especial al coordinador académico.
  
- **El sistema me indica que un estudiante repite, pero está en completiva.**
  Revisa las asignaturas reprobadas. Si después de la prueba extraordinaria tiene 3 o más asignaturas pendientes, el sistema, basado en la Ordenanza 04-2023, automáticamente lo coloca en estado de *Reprobado*.
  
- **Olvidé cómo ingresar a SIGERA.**
  Asegúrate de estar en la URL correcta de tu centro educativo. Si el problema persiste, contacta al administrador tecnológico de la institución.

---
*SIGERA — "El registro que ya conoces, en la herramienta que necesitas."*
