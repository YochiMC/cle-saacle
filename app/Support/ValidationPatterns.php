<?php

namespace App\Support;

/**
 * Patron comun de expresiones y reglas de validacion reutilizables.
 */
final class ValidationPatterns
{
    public const SPANISH_NAME = '/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[[:space:]][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/u';
    public const PHONE_NUMBER = '/^\d+$/';
    public const CURP = '/^[A-Z]{4}\d{6}[HM](?:AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/i';
    public const RFC = '/^(?:[A-Z&Ñ]{3,4})\d{6}[A-Z0-9]{3}$/i';
}