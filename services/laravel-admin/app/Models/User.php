<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Shared `users` table (services/db/schema.sql). Passwords are bcrypt ($2y$),
 * so Laravel's Hash/Auth works with the rows other services create.
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const ROLES = ['admin', 'staff', 'customer'];
    public const BACK_OFFICE_ROLES = ['admin', 'staff'];

    protected $fillable = ['name', 'email', 'phone', 'password', 'role'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function hasRole(string ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /** Local scope: User::backOffice()->get() */
    public function scopeBackOffice(Builder $query): Builder
    {
        return $query->whereIn('role', self::BACK_OFFICE_ROLES);
    }
}
