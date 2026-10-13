<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * php artisan db:seed
 * The shared catalogue/admin data comes from services/db/seed.sql; Laravel only
 * adds clearly-fake demo enquiries/quotes so the admin screens have content.
 * Safe to run any number of times (idempotent).
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(DemoEnquirySeeder::class);
    }
}
