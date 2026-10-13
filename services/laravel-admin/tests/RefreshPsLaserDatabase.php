<?php

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Tests run on SQLite :memory: (see phpunit.xml), never on the shared MySQL DB.
 * The shared tables are owned by services/db/schema.sql, not by Laravel migrations,
 * so this trait also runs the test-only folder tests/database/migrations, which
 * recreates simplified SQLite copies of them.
 *
 * (A trait is needed because trait methods override methods inherited from
 * TestCase - overriding migrateFreshUsing() in TestCase would be ignored.)
 */
trait RefreshPsLaserDatabase
{
    use RefreshDatabase;

    protected function migrateFreshUsing()
    {
        return [
            '--drop-views' => false,
            '--drop-types' => false,
            '--path' => ['database/migrations', 'tests/database/migrations'],
        ];
    }
}
