<?php
/**
 * Custom exception classes (Unit I: exception handling).
 *
 * ValidationException carries a field => message map so a form can show
 * every error next to its input. EstimateException is thrown when a
 * calculation is impossible (e.g. no rate row for that thickness).
 */

declare(strict_types=1);

class AppException extends Exception
{
}

final class ValidationException extends AppException
{
    /** @param array<string,string> $errors field => message */
    public function __construct(private array $errors, string $message = 'Please correct the highlighted fields.')
    {
        parent::__construct($message, 422);
    }

    /** @return array<string,string> */
    public function getErrors(): array
    {
        return $this->errors;
    }
}

final class EstimateException extends AppException
{
    public function __construct(string $message, private string $materialCode = '', private float $thicknessMm = 0.0)
    {
        parent::__construct($message, 400);
    }

    public function getContext(): string
    {
        return sprintf('%s @ %g mm', $this->materialCode, $this->thicknessMm);
    }
}

final class UploadException extends AppException
{
}
