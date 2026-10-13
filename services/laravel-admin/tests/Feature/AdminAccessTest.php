<?php

namespace Tests\Feature;

use App\Models\Enquiry;
use App\Models\Machine;
use App\Models\User;
use App\Models\WorkOrder;
use Tests\RefreshPsLaserDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshPsLaserDatabase; // SQLite :memory:, rebuilt per test

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get('/dashboard')->assertRedirect(route('login'));
        $this->get('/enquiries')->assertRedirect(route('login'));
        $this->get('/login')->assertOk()->assertSee('PS Laser Admin');
    }

    public function test_admin_can_log_in_and_out(): void
    {
        $admin = User::factory()->admin()->create(['email' => 'boss@pslaser.test', 'password' => 'secret-pass-1']);

        $this->post('/login', ['email' => 'boss@pslaser.test', 'password' => 'secret-pass-1'])
            ->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($admin);

        $this->get('/dashboard')->assertOk()->assertSee('Latest enquiries');

        $this->post('/logout')->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_wrong_password_and_customer_role_are_rejected(): void
    {
        User::factory()->create(['email' => 'staff@pslaser.test', 'password' => 'right-pass']);
        User::factory()->customer()->create(['email' => 'cust@pslaser.test', 'password' => 'right-pass']);

        $this->from('/login')->post('/login', ['email' => 'staff@pslaser.test', 'password' => 'wrong'])
            ->assertRedirect('/login')->assertSessionHasErrors('email');
        $this->post('/login', ['email' => 'cust@pslaser.test', 'password' => 'right-pass'])
            ->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_admin_can_update_enquiry_status(): void
    {
        $admin = User::factory()->admin()->create();
        $enquiry = Enquiry::create(['name' => 'Test Co', 'phone' => '9000000999', 'message' => 'Need 10 brackets']);

        $this->actingAs($admin)
            ->patch(route('enquiries.update', $enquiry), ['status' => 'contacted'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame('contacted', $enquiry->fresh()->status);
        $this->assertDatabaseHas('admin_audit_logs', ['action' => 'enquiry.status', 'subject_id' => $enquiry->id]);
    }

    public function test_invalid_enquiry_status_is_rejected(): void
    {
        $enquiry = Enquiry::create(['name' => 'X', 'phone' => '9000000998', 'message' => 'm']);

        $this->actingAs(User::factory()->create())
            ->patch(route('enquiries.update', $enquiry), ['status' => 'banana'])
            ->assertSessionHasErrors('status');
        $this->assertSame('new', $enquiry->fresh()->status);
    }

    public function test_customer_session_cannot_reach_back_office(): void
    {
        $this->actingAs(User::factory()->customer()->create())
            ->get('/dashboard')
            ->assertRedirect(route('login'));
    }

    public function test_machine_validation_and_staff_cannot_delete(): void
    {
        $staff = User::factory()->create(); // role staff

        $this->actingAs($staff)->post(route('machines.store'), ['name' => ''])
            ->assertSessionHasErrors(['name', 'short_name', 'category', 'specs', 'image']);

        $this->actingAs($staff)->post(route('machines.store'), [
            'name' => 'Test Laser 6 kW', 'short_name' => '6 kW Laser', 'category' => 'Laser Cutting',
            'specs' => "6 kW\nBed 3 x 1.5 m", 'image' => '/sites/pslaser/machines/test.jpg',
        ])->assertRedirect();
        $machine = Machine::where('slug', 'test-laser-6-kw')->firstOrFail(); // slug auto-generated

        $this->actingAs($staff)->delete(route('machines.destroy', $machine))->assertForbidden();
        $this->actingAs(User::factory()->admin()->create())->delete(route('machines.destroy', $machine))
            ->assertRedirect(route('machines.index'));
        $this->assertModelMissing($machine);
    }

    public function test_status_event_updates_work_order_timeline(): void
    {
        $order = WorkOrder::create(['order_no' => 'PSL-T-1', 'customer_name' => 'T', 'customer_phone' => '9000000997', 'description' => 'd']);

        $this->actingAs(User::factory()->create())
            ->post(route('work-orders.events.store', $order), ['status' => 'cutting', 'note' => 'On 3 kW laser'])
            ->assertRedirect(route('work-orders.show', $order));

        $this->assertSame('cutting', $order->fresh()->status);
        $this->assertDatabaseHas('work_order_events', ['work_order_id' => $order->id, 'status' => 'cutting']);
    }
}
