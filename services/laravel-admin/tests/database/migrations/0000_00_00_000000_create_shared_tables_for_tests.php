<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 | TEST-ONLY migration (loaded by tests/TestCase.php, never by `php artisan migrate`).
 | Recreates the shared PS Laser tables from services/db/schema.sql in SQLite :memory:
 | so Feature tests never touch the real MySQL database.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $t) {
            $t->id();
            $t->string('name', 120);
            $t->string('email', 190)->unique();
            $t->string('phone', 20)->nullable();
            $t->timestamp('email_verified_at')->nullable();
            $t->string('password');
            $t->string('role', 10)->default('customer');
            $t->rememberToken();
            $t->timestamps();
        });
        Schema::create('machines', function (Blueprint $t) {
            $t->id();
            $t->string('slug', 80)->unique();
            $t->string('name', 160);
            $t->string('short_name', 80);
            $t->string('category', 60);
            $t->text('specs');
            $t->string('image');
            $t->integer('sort_order')->default(0);
            $t->timestamps();
        });
        Schema::create('services', function (Blueprint $t) {
            $t->id();
            $t->string('slug', 80)->unique();
            $t->string('title', 160);
            $t->text('description');
            $t->string('image');
            $t->integer('sort_order')->default(0);
            $t->timestamps();
        });
        Schema::create('materials', function (Blueprint $t) {
            $t->id();
            $t->string('code', 10)->unique();
            $t->string('name', 60);
            $t->decimal('max_thickness_mm', 5, 2);
            $t->decimal('density_g_cm3', 5, 2);
        });
        Schema::create('rates', function (Blueprint $t) {
            $t->id();
            $t->string('material_code', 10);
            $t->decimal('thickness_from_mm', 5, 2);
            $t->decimal('thickness_to_mm', 5, 2);
            $t->decimal('cut_rate_per_m', 10, 2);
            $t->decimal('pierce_rate', 10, 2);
            $t->decimal('material_rate_per_kg', 10, 2);
            $t->boolean('is_sample')->default(true);
            $t->timestamp('updated_at')->nullable();
        });
        Schema::create('settings', function (Blueprint $t) {
            $t->string('key', 80)->primary();
            $t->string('value');
        });
        Schema::create('enquiries', function (Blueprint $t) {
            $t->id();
            $t->string('name', 120);
            $t->string('phone', 20);
            $t->string('email', 190)->nullable();
            $t->string('service_slug', 80)->nullable();
            $t->string('machine_slug', 80)->nullable();
            $t->text('message');
            $t->string('source', 10)->default('next');
            $t->string('status', 10)->default('new');
            $t->timestamps();
        });
        Schema::create('uploads', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('enquiry_id')->nullable();
            $t->string('original_name');
            $t->string('stored_path');
            $t->string('mime', 100)->nullable();
            $t->unsignedInteger('size_bytes');
            $t->timestamp('created_at')->nullable();
        });
        Schema::create('quotes', function (Blueprint $t) {
            $t->id();
            $t->string('quote_no', 30)->unique();
            $t->unsignedBigInteger('enquiry_id')->nullable();
            $t->string('customer_name', 120)->nullable();
            $t->string('customer_phone', 20)->nullable();
            $t->string('material_code', 10);
            $t->decimal('thickness_mm', 5, 2);
            $t->decimal('length_mm', 8, 2);
            $t->decimal('width_mm', 8, 2);
            $t->decimal('cut_length_mm', 10, 2);
            $t->integer('pierces')->default(1);
            $t->integer('bends')->default(0);
            $t->boolean('powder_coat')->default(false);
            $t->integer('quantity')->default(1);
            $t->decimal('amount_inr', 12, 2);
            $t->boolean('is_estimate')->default(true);
            $t->string('source', 20)->default('php');
            $t->timestamp('created_at')->nullable();
        });
        Schema::create('work_orders', function (Blueprint $t) {
            $t->id();
            $t->string('order_no', 30)->unique();
            $t->string('customer_name', 120);
            $t->string('customer_phone', 20);
            $t->string('description');
            $t->string('machine_slug', 80)->nullable();
            $t->integer('quantity')->default(1);
            $t->string('status', 20)->default('received');
            $t->date('due_date')->nullable();
            $t->timestamps();
        });
        Schema::create('work_order_events', function (Blueprint $t) {
            $t->id();
            $t->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete();
            $t->string('status', 20);
            $t->string('note')->nullable();
            $t->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        foreach (['work_order_events', 'work_orders', 'quotes', 'uploads', 'enquiries', 'settings', 'rates', 'materials', 'services', 'machines', 'users'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
