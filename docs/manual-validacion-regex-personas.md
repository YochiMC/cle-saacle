# Manual de validacion de nombres, telefonos y documentos fiscales

## Proposito

Este documento define el criterio tecnico que se aplico a las validaciones de datos personales y fiscales en los formularios de estudiantes, docentes y perfil de usuario.

La meta es estandarizar reglas de entrada para:

- nombres y apellidos;
- telefonos;
- CURP;
- RFC;
- CLABE interbancaria.

## Regla general

Las reglas quedaron centralizadas en:

- app/Support/ValidationPatterns.php

Con esto se evita duplicar expresiones regulares entre formularios y se mantiene un solo punto de ajuste.

## Criterio por campo

### Nombres y apellidos

Se valida que solo acepten letras del alfabeto español y espacios intermedios entre palabras.

Resultado:

- se rechazan numeros;
- se rechazan caracteres especiales;
- se permiten acentos y la letra Ñ;
- se permite mas de una palabra.

### Telefono

Se valida que solo contenga digitos.

Resultado:

- se rechazan letras;
- se rechazan espacios;
- se rechazan guiones y otros separadores;
- se conserva el tipo string para no perder ceros iniciales.

### CURP

Se aplico una validacion estructural por regex para verificar la forma general de la CURP.

Incluye:

- 18 caracteres;
- bloque inicial de letras;
- fecha de nacimiento;
- caracter de genero;
- entidad federativa;
- consonantes internas;
- caracter diferenciador;
- digito verificador.

Nota:

- esta validacion confirma el formato, no sustituye una validacion oficial completa con reglas adicionales de negocio o catalogos externos.

### RFC

Se aplico una validacion estructural por regex para RFC de persona fisica y moral.

Incluye:

- 12 caracteres para persona moral;
- 13 caracteres para persona fisica;
- fecha compacta;
- homoclave final.

Nota:

- esta validacion confirma estructura y longitud, no realiza verificacion SAT completa.

### CLABE

Se valido con `digits:18`.

Resultado:

- exactamente 18 digitos;
- no acepta letras;
- no acepta separadores;
- se mantiene una validacion simple y clara, como corresponde a un dato bancario almacenado como cadena.

## Archivos actualizados

- app/Http/Requests/StoreStudentRequest.php
- app/Http/Requests/UpdateStudentRequest.php
- app/Http/Requests/StoreTeacherRequest.php
- app/Http/Requests/UpdateTeacherRequest.php
- app/Http/Requests/ProfileUpdateRequest.php

## Buenas practicas aplicadas

- Centralizar patrones reutilizables en un solo archivo.
- Mantener reglas expresivas y faciles de leer.
- Preferir `digits:18` para CLABE en lugar de una regex innecesaria.
- Separar formato de validacion estructural de validacion oficial completa.
- Mantener el tipo `string` en telefonos para no perder ceros iniciales.

## Checklist de verificacion

1. Probar nombres con acentos y espacios.
2. Probar nombres con numeros o simbolos y confirmar rechazo.
3. Probar telefonos con solo digitos.
4. Probar CURP y RFC con estructura incorrecta.
5. Probar CLABE con menos o mas de 18 digitos.

## Nota de mantenimiento

Si se agregan nuevos formularios con estos mismos campos, deben reutilizar el mismo criterio desde `ValidationPatterns` para mantener consistencia en todo el proyecto.
