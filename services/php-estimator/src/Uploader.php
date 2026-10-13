<?php
/**
 * Drawing upload handling (Unit I: form handling + file handling + security).
 *
 * Rules: dxf / dwg / pdf / png / jpg, max 10 MB. The extension AND the real
 * content type (finfo magic-byte sniffing) must both be on the allow-list.
 * Files get a random name and are stored in storage/uploads, which is OUTSIDE
 * the public/ document root — they can never be requested by URL or executed.
 */

declare(strict_types=1);

final class Uploader
{
    /** extension => MIME types finfo may report for a genuine file */
    private const ALLOWED = [
        'dxf'  => ['text/plain', 'image/vnd.dxf', 'application/dxf', 'image/x-dxf', 'application/octet-stream'],
        'dwg'  => ['application/octet-stream', 'image/vnd.dwg', 'application/acad', 'image/x-dwg', 'application/x-dwg'],
        'pdf'  => ['application/pdf'],
        'png'  => ['image/png'],
        'jpg'  => ['image/jpeg'],
        'jpeg' => ['image/jpeg'],
    ];

    /** Executable signatures we refuse even if the MIME looks generic. */
    private const BLOCKED_MIME = ['application/x-dosexec', 'application/x-msdownload', 'application/x-executable',
        'application/x-php', 'text/x-php', 'application/x-sh', 'text/x-shellscript'];

    public function __construct(private string $targetDir = UPLOAD_DIR, private int $maxBytes = UPLOAD_MAX_BYTES)
    {
    }

    /** True when the form actually contained a file. */
    public static function hasFile(?array $file): bool
    {
        return is_array($file) && ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;
    }

    /**
     * Validate one entry of $_FILES. Returns metadata; does NOT move the file.
     *
     * @throws UploadException
     */
    public function validate(array $file): array
    {
        // 1) PHP's own upload error codes — a switch statement.
        switch ($file['error'] ?? UPLOAD_ERR_NO_FILE) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new UploadException('The drawing is larger than 10 MB.');
            case UPLOAD_ERR_PARTIAL:
                throw new UploadException('The upload was interrupted — please try again.');
            case UPLOAD_ERR_NO_FILE:
                throw new UploadException('No file was uploaded.');
            default:
                throw new UploadException('The server could not save the upload (code ' . (int) $file['error'] . ').');
        }

        if (!is_uploaded_file($file['tmp_name'])) {
            throw new UploadException('Invalid upload.');
        }

        // 2) Size.
        $size = (int) $file['size'];
        if ($size <= 0) {
            throw new UploadException('The file is empty.');
        }
        if ($size > $this->maxBytes) {
            throw new UploadException(sprintf('The drawing is %s — the limit is %s.', human_bytes($size), human_bytes($this->maxBytes, 0)));
        }

        // 3) Extension from the original name (lower-cased; only the last one counts).
        $original = basename((string) $file['name']);
        $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
        if (!array_key_exists($ext, self::ALLOWED)) {
            throw new UploadException('Only DXF, DWG, PDF, PNG or JPG drawings are accepted (got ".' . $ext . '").');
        }

        // 4) Real content type from the file's bytes (not the browser's claim).
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = (string) $finfo->file($file['tmp_name']);
        if (in_array($mime, self::BLOCKED_MIME, true) || !in_array($mime, self::ALLOWED[$ext], true)) {
            throw new UploadException("The file content ({$mime}) does not match a .{$ext} drawing.");
        }

        // Safe display name: keep letters, digits, dot, dash, underscore, space.
        $displayName = preg_replace('/[^A-Za-z0-9._\- ]+/', '_', $original) ?? 'drawing';

        return [
            'tmp'      => $file['tmp_name'],
            'original' => mb_substr($displayName, 0, 200),
            'ext'      => $ext,
            'mime'     => $mime,
            'size'     => $size,
        ];
    }

    /**
     * Move the validated file into storage/uploads with a random name.
     * Returns the metadata plus 'stored' (path relative to storage/) and 'abs'.
     */
    public function store(array $meta): array
    {
        if (!is_dir($this->targetDir) && !mkdir($this->targetDir, 0775, true) && !is_dir($this->targetDir)) {
            throw new UploadException('Upload folder is not writable.');
        }
        $name = safe_upload_name($meta['ext']);
        $abs = $this->targetDir . DIRECTORY_SEPARATOR . $name;
        if (!move_uploaded_file($meta['tmp'], $abs)) {
            throw new UploadException('Could not save the drawing.');
        }
        return $meta + ['stored' => 'uploads/' . $name, 'abs' => $abs];
    }
}
