# Manual de manejo de errores por Policy con Inertia

## Proposito

Este documento define el comportamiento oficial cuando una Policy rechaza acceso (403), separando claramente flujo de accion, flujo de navegacion y flujo API.

La meta es:

- reducir ruido visual para usuario final (especialmente rol student);
- mantener contrato HTTP correcto segun tipo de cliente;
- evitar respuestas inconsistentes entre backend y frontend;
- estandarizar criterio para nuevos modulos.

## Alcance

Aplica al manejo central de excepciones en:

- bootstrap/app.php

Y a la vista de error reutilizable en:

- resources/js/Pages/Errors/ErrorPage.jsx

## Regla operativa (matriz)

### Caso 1: Accion Inertia bloqueada por Policy (POST/PUT/PATCH/DELETE)

Criterio:

- request con header X-Inertia;
- request no GET;
- status 403.

Respuesta:

- redireccion controlada a URL previa segura (misma aplicacion);
- flash message con texto corto y neutral.

Mensaje:

- No tienes permisos para realizar esta accion.

Resultado UX:

- el usuario permanece en su contexto funcional;
- se evita enviar al usuario a una pantalla completa de error por una accion puntual.

### Caso 2: Navegacion a vista protegida bloqueada por Policy (GET)

Criterio:

- status 403;
- no aplica flujo API ni flujo de accion Inertia.

Respuesta:

- render de pagina Errors/ErrorPage via Inertia;
- status HTTP 403 preservado.

Resultado UX:

- mensaje claro para rutas no autorizadas;
- evita toasts repetitivos o confusos.

### Caso 3: Cliente API/JSON bloqueado por Policy

Criterio:

- request expectsJson();
- status 403.

Respuesta:

- JSON con message;
- status HTTP 403.

Resultado tecnico:

- contrato estable para clientes no web;
- evita mezclar HTML/Inertia en endpoints consumidos como API.

## Hardening aplicado

En el flujo de accion Inertia se agrega validacion de URL previa segura:

- si Referer pertenece al mismo host, se utiliza como destino;
- si no existe o no es confiable, fallback a /.

Beneficio:

- evita redirecciones a dominios externos;
- evita fallas por ausencia de Referer;
- mantiene flujo consistente para usuario final.

## Criterio para 404 y 500

En entorno no local:

- 404 y 500 renderizan Errors/ErrorPage para navegacion web;
- requests JSON se mantienen en formato JSON.

Beneficio:

- separacion limpia entre experiencia web y contrato API.

## Ajustes en la vista ErrorPage

Se estandariza la vista para no depender de layout autenticado:

- se elimina acoplamiento a AuthenticatedLayout;
- se deja una estructura neutral para contexto autenticado y no autenticado;
- CTA principal: Volver al inicio.

Beneficio:

- la pagina de error funciona de forma segura en rutas publicas y privadas;
- reduce riesgo de props faltantes por contexto de autenticacion.

## Buenas practicas establecidas

- No usar la misma respuesta para todos los 403: separar por tipo de request.
- En acciones bloqueadas, preferir retorno al contexto + flash corto.
- En vistas bloqueadas, preferir pagina 403 dedicada.
- En API, preservar contrato JSON y codigos HTTP correctos.
- Evitar mensajes con detalles internos de autorizacion.

## Checklist de verificacion

1. Como student, intentar ejecutar una accion sin permiso y validar retorno a pantalla previa con flash.
2. Como student, abrir URL protegida por Policy y validar render de ErrorPage con status 403.
3. Probar endpoint JSON protegido y validar respuesta 403 en formato JSON.
4. Validar que 404/500 en produccion renderizan ErrorPage para navegacion web.
5. Confirmar que ErrorPage renderiza correctamente sin layout autenticado.

## Nota de mantenimiento

Si se agrega una nueva politica de autorizacion o nuevo modulo con mutaciones:

- validar la clasificacion GET vs no GET;
- validar comportamiento para requests Inertia y JSON;
- actualizar este documento en el mismo cambio.
