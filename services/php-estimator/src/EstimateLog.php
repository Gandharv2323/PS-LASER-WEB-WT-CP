<?php
/**
 * File handling (Unit I): an append-only text log of estimates/events.
 *
 * Writes use fopen('a') + flock(LOCK_EX) + fwrite so two simultaneous
 * requests never interleave their lines. Reads use fopen('r') + fseek +
 * fgets to return only the last N lines (the "tail") without loading a big
 * file into memory.
 *
 * Line format (pipe separated, one event per line):
 *   2026-10-13T20:30:00+05:30 | ESTIMATE | MS | 2.00 | 10 | 1234.56 | 127.0.0.1
 */

declare(strict_types=1);

final class EstimateLog
{
    public const COLUMNS = ['time', 'event', 'material', 'thickness', 'quantity', 'total', 'ip'];

    public function __construct(private string $path = LOG_FILE)
    {
    }

    public function append(string $event, array $fields = []): void
    {
        $dir = dirname($this->path);
        if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
            throw new RuntimeException("Cannot create log directory {$dir}");
        }

        $values = [
            date('c'),
            strtoupper($event),
            $fields['material'] ?? '-',
            isset($fields['thickness']) ? sprintf('%.2f', $fields['thickness']) : '-',
            (string) ($fields['quantity'] ?? '-'),
            isset($fields['total']) ? sprintf('%.2f', $fields['total']) : '-',
            client_ip(),
        ];
        // Never let a "|" or newline from user data break the format.
        $values = array_map(fn ($v) => str_replace(['|', "\r", "\n"], ['/', ' ', ' '], (string) $v), $values);
        $line = implode(' | ', $values) . PHP_EOL;

        $handle = fopen($this->path, 'ab');
        if ($handle === false) {
            throw new RuntimeException('Cannot open the estimate log for writing.');
        }
        try {
            if (flock($handle, LOCK_EX)) {
                fwrite($handle, $line);
                fflush($handle);
                flock($handle, LOCK_UN);
            }
        } finally {
            fclose($handle);                       // always runs, even if fwrite throws
        }
    }

    /**
     * Last $lines entries, newest first, each parsed into an associative array.
     *
     * @return list<array<string,string>>
     */
    public function tail(int $lines = 20): array
    {
        if (!is_file($this->path) || filesize($this->path) === 0) {
            return [];
        }
        $handle = fopen($this->path, 'rb');
        if ($handle === false) {
            return [];
        }
        try {
            flock($handle, LOCK_SH);
            // Read at most the last 64 KB — plenty for a few dozen lines.
            $size = filesize($this->path);
            $offset = max(0, $size - 65536);
            fseek($handle, $offset);
            if ($offset > 0) {
                fgets($handle);                    // skip the (probably partial) first line
            }
            $buffer = [];
            while (($line = fgets($handle)) !== false) {
                $line = trim($line);
                if ($line === '') {
                    continue;
                }
                $buffer[] = $line;
                if (count($buffer) > $lines) {
                    array_shift($buffer);
                }
            }
            flock($handle, LOCK_UN);
        } finally {
            fclose($handle);
        }

        $parsed = array_map(function (string $line): array {
            $parts = array_pad(explode(' | ', $line), count(self::COLUMNS), '-');
            return array_combine(self::COLUMNS, array_slice($parts, 0, count(self::COLUMNS)));
        }, $buffer);

        return array_reverse($parsed);
    }

    public function sizeBytes(): int
    {
        clearstatcache(true, $this->path);
        return is_file($this->path) ? (int) filesize($this->path) : 0;
    }

    public function lineCount(): int
    {
        if (!is_file($this->path)) {
            return 0;
        }
        $count = 0;
        $handle = fopen($this->path, 'rb');
        while ($handle && !feof($handle)) {
            $count += substr_count((string) fread($handle, 8192), "\n");
        }
        if ($handle) {
            fclose($handle);
        }
        return $count;
    }
}
