# Manual de Evaluación de Habilidades y Convalidaciones en Exámenes

Este documento detalla la regularización realizada en el backend del sistema para alinear las reglas de aprobación de exámenes con la estructura dinámica basada en calificaciones numéricas (del 0 al 100) y claves estandarizadas de convalidación utilizadas en el frontend y en la base de datos.

## 1. Contexto y Problemática Anterior

Anteriormente, el backend determinaba si un alumno había aprobado un examen mediante el método `isApprovedExamResult`. Este método presentaba tres problemas críticos que impedían el correcto funcionamiento del encolamiento automático y la promoción de nivel de los alumnos:

1. **Confusión en los tipos de datos (Strings vs. Inteers)**:
   Las 4 habilidades (`listening`, `reading`, `writing`, `speaking`) y el promedio se validan en el frontend y en los requests HTTP del backend como números enteros (`integer|min:0|max:100`). Sin embargo, el método heredado del backend forzaba la conversión a string y evaluaba estas habilidades buscando niveles MCER (cadenas como `"B1"`, `"B2"`, `"C1"`, `"C2"`). Al tener calificaciones numéricas como `80` o `75` guardadas en el JSON `units_breakdown`, la condición siempre fallaba.

2. **Inconsistencia de idioma en Claves de Convalidación (`certified_level` vs. `nivel_certificado`)**:
   En los exámenes del tipo **Convalidación**, el JSON guardaba la propiedad en inglés `certified_level`. No obstante, el backend buscaba la traducción en español `nivel_certificado`. Esto causaba que los alumnos aprobados por convalidación fuesen ignorados al automatizar el proceso.

3. **Insuficiencia en las Reglas de 4 Habilidades**:
   El backend se limitaba a evaluar si el promedio final (`final_average`) era mayor o igual a 70. Esto omitía la regla de negocio que exige que **cada una de las 4 habilidades individuales debe ser mayor o igual a 70** para considerar aprobado el examen de 4 Habilidades.

---

## 2. Solución e Implementación Realizada

Se unificó la lógica de aprobación en un helper estándar y robusto implementado en cuatro clases del backend que interactúan con el resultado del examen de un estudiante (`exam_student` pivot).

### Lógica Unificada Aplicada:
* **Caso 1: Convalidación**:
  Revisa si existe un nivel MCER válido (`B1`, `B2`, `C1`, `C2`) dentro de la propiedad `certified_level` (con fallback de compatibilidad a `nivel_certificado`).
* **Caso 2: Examen de 4 Habilidades**:
  Si las claves de las 4 habilidades (`listening`, `reading`, `writing`, `speaking`) están presentes en la calificación del estudiante, exige de forma estricta que **todas** sean numéricas y tengan un puntaje **mayor o igual a 70**.
* **Caso 3: Fallback Numérico (Planes Anteriores u otros)**:
  Verifica si promedios o calificaciones globales generales (`final_average`, `calificacion_final`, `promedio`, etc.) son mayores o iguales a 70.

---

## 3. Archivos Modificados

Los siguientes archivos backend fueron actualizados para incorporar esta lógica unificada y resolver el problema en cascada:

1. **Acción de Encolado Automático**:
   * [AutoQueueAccreditationCandidates.php](file:///c:/Users/josep/Documents/cle-saacle/app/Actions/AutoQueueAccreditationCandidates.php#L116-L157)
   * *Responsable de mandar a los alumnos con examen finalizado y aprobado al estatus `In Review` en la cola de acreditaciones.*

2. **Acción de Avance Automático de Nivel**:
   * [AdvanceStudentsLevelAction.php](file:///c:/Users/josep/Documents/cle-saacle/app/Actions/Students/AdvanceStudentsLevelAction.php#L106-L150)
   * *Responsable de promocionar de nivel a los alumnos con exámenes completados y aprobados.*

3. **Recurso de la API de Candidatos**:
   * [AccreditationCandidateResource.php](file:///c:/Users/josep/Documents/cle-saacle/app/Http/Resources/AccreditationCandidateResource.php#L143-L184)
   * *Normaliza la información y el cálculo del origen del alumno (Examen o Curso) al renderizar la tabla dinámica de candidatos.*

4. **Comando de Regularización (Backfill)**:
   * [BackfillAccreditationInReview.php](file:///c:/Users/josep/Documents/cle-saacle/app/Console/Commands/BackfillAccreditationInReview.php#L171-L212)
   * *Comando de consola para recalcular masivamente el estatus de acreditaciones en revisión en base al historial de exámenes.*

---

## 4. Validación y Pruebas de Calidad

Para garantizar la estabilidad general y prevenir regresiones en otras secciones del sistema:
1. Se ejecutó la suite completa de pruebas de Laravel (`php artisan test`).
2. Se verificaron satisfactoriamente **257 pruebas aprobadas** con un total de 707 aserciones.
3. Se confirmaron los efectos correctos en la base de datos para la actualización del promedio final y el desglose flexible.
