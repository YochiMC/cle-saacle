<?php

namespace App\Console\Commands;

/**
 * Small wrapper to avoid depending directly on the vendor Symfony class in
 * source locations that trip Intelephense diagnostics. If the real
 * SymfonyStyle is available it will be extended, otherwise this class
 * provides a minimal compatible API used by the import command.
 */
if (!class_exists('\\App\\Console\\Commands\\ConsoleProgress')) {
    if (class_exists('Symfony\\Component\\Console\\Style\\SymfonyStyle')) {
        class ConsoleProgress extends \Symfony\Component\Console\Style\SymfonyStyle {}
    } else {
        class ConsoleProgress
        {
            public function __construct($input, $output) {}
            public function progressStart(int $max = 0): void {}
            public function progressAdvance(int $step = 1): void {}
            public function progressFinish(): void {}
        }
    }
}
