<?php
/**
 * MySQL with PHP (Unit I) — one shared PDO connection.
 *
 * PDO::ERRMODE_EXCEPTION makes every SQL error throw PDOException, so the
 * callers can use try / catch / finally. Emulated prepares are turned off so
 * MySQL itself receives real prepared statements (SQL-injection safe).
 */

declare(strict_types=1);

final class Database
{
    private static ?PDO $pdo = null;

    public static function pdo(): PDO
    {
        if (self::$pdo === null) {
            $c = DB_CONFIG;
            $dsn = "mysql:host={$c['host']};port={$c['port']};dbname={$c['name']};charset=utf8mb4";
            try {
                self::$pdo = new PDO($dsn, $c['user'], $c['password'], [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::ATTR_TIMEOUT            => 5,
                ]);
            } catch (PDOException $ex) {
                // Re-throw with a friendly message; the global handler shows the error page.
                throw new RuntimeException(
                    'Cannot connect to MySQL at ' . $c['host'] . ':' . $c['port'] . ' — is XAMPP MySQL running?',
                    503,
                    $ex
                );
            }
        }
        return self::$pdo;
    }
}

/**
 * Small data-access layer. Every query uses a prepared statement with
 * placeholders — values are never concatenated into SQL.
 */
final class Repository
{
    public function __construct(private PDO $db)
    {
    }

    /** @return list<array{code:string,name:string,max_thickness_mm:string,density_g_cm3:string}> */
    public function materials(): array
    {
        return $this->db->query('SELECT code, name, max_thickness_mm, density_g_cm3 FROM materials ORDER BY id')->fetchAll();
    }

    public function material(string $code): ?array
    {
        $stmt = $this->db->prepare('SELECT code, name, max_thickness_mm, density_g_cm3 FROM materials WHERE code = ?');
        $stmt->execute([$code]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    /** All rate bands for one material (the band is chosen in PHP with a loop). */
    public function ratesFor(string $materialCode): array
    {
        $stmt = $this->db->prepare(
            'SELECT thickness_from_mm, thickness_to_mm, cut_rate_per_m, pierce_rate, material_rate_per_kg, is_sample
               FROM rates WHERE material_code = :code ORDER BY thickness_from_mm'
        );
        $stmt->execute([':code' => $materialCode]);
        return $stmt->fetchAll();
    }

    /** settings table as key => value (FETCH_KEY_PAIR). */
    public function settings(): array
    {
        return $this->db->query('SELECT `key`, `value` FROM settings')->fetchAll(PDO::FETCH_KEY_PAIR);
    }

    public function services(): array
    {
        return $this->db->query('SELECT slug, title FROM services ORDER BY sort_order')->fetchAll();
    }

    /** Next quote number for today: PSL-Q-YYYYMMDD-#### */
    public function nextQuoteNo(): string
    {
        $prefix = 'PSL-Q-' . date('Ymd') . '-';
        $stmt = $this->db->prepare('SELECT quote_no FROM quotes WHERE quote_no LIKE ? ORDER BY quote_no DESC LIMIT 1');
        $stmt->execute([$prefix . '%']);
        $last = $stmt->fetchColumn();
        $seq = $last ? ((int) substr((string) $last, strlen($prefix))) + 1 : 1;
        return quote_number($seq);
    }

    /** Insert a quote row (source 'php'); returns the quote number. */
    public function insertQuote(array $est, ?string $name, ?string $phone): string
    {
        $sql = 'INSERT INTO quotes (quote_no, customer_name, customer_phone, material_code, thickness_mm,
                    length_mm, width_mm, cut_length_mm, pierces, bends, powder_coat, quantity, amount_inr,
                    is_estimate, source)
                VALUES (:quote_no, :name, :phone, :material, :thickness, :length, :width, :cut, :pierces,
                    :bends, :coat, :qty, :amount, 1, \'php\')';
        $stmt = $this->db->prepare($sql);

        // Retry if two visitors get the same sequence number at the same moment (UNIQUE key).
        for ($attempt = 1; $attempt <= 3; $attempt++) {
            $quoteNo = $this->nextQuoteNo();
            try {
                $stmt->execute([
                    ':quote_no'  => $quoteNo,
                    ':name'      => $name,
                    ':phone'     => $phone,
                    ':material'  => $est['materialCode'],
                    ':thickness' => $est['thicknessMm'],
                    ':length'    => $est['lengthMm'],
                    ':width'     => $est['widthMm'],
                    ':cut'       => $est['cutLengthMm'],
                    ':pierces'   => $est['pierces'],
                    ':bends'     => $est['bends'],
                    ':coat'      => $est['powderCoat'] ? 1 : 0,
                    ':qty'       => $est['quantity'],
                    ':amount'    => $est['total'],
                ]);
                return $quoteNo;
            } catch (PDOException $ex) {
                if ($ex->errorInfo[1] !== 1062 || $attempt === 3) {   // 1062 = duplicate key
                    throw $ex;
                }
            }
        }
        throw new RuntimeException('Could not allocate a quote number.');
    }

    public function insertEnquiry(array $data): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO enquiries (name, phone, email, service_slug, message, source)
             VALUES (?, ?, ?, ?, ?, 'php')"
        );
        $stmt->execute([$data['name'], $data['phone'], $data['email'] ?: null, $data['service'] ?: null, $data['message']]);
        return (int) $this->db->lastInsertId();
    }

    public function insertUpload(int $enquiryId, array $file): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO uploads (enquiry_id, original_name, stored_path, mime, size_bytes) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$enquiryId, $file['original'], $file['stored'], $file['mime'], $file['size']]);
        return (int) $this->db->lastInsertId();
    }

    /** Counts for the stats page. */
    public function counts(): array
    {
        $row = $this->db->query(
            "SELECT
               (SELECT COUNT(*) FROM quotes WHERE source = 'php')     AS quotes,
               (SELECT COUNT(*) FROM enquiries WHERE source = 'php')  AS enquiries,
               (SELECT COUNT(*) FROM uploads u JOIN enquiries e ON e.id = u.enquiry_id WHERE e.source = 'php') AS uploads,
               (SELECT COALESCE(SUM(amount_inr), 0) FROM quotes WHERE source = 'php') AS quoted_value"
        )->fetch();
        return array_map('floatval', $row);
    }

    public function latestQuotes(int $limit = 5): array
    {
        $stmt = $this->db->prepare(
            "SELECT quote_no, material_code, thickness_mm, quantity, amount_inr, created_at
               FROM quotes WHERE source = 'php' ORDER BY id DESC LIMIT ?"
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
