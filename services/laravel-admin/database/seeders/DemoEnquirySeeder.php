<?php

namespace Database\Seeders;

use App\Models\Enquiry;
use App\Models\Material;
use App\Models\Quote;
use App\Models\Upload;
use Illuminate\Database\Seeder;

/**
 * Idempotent demo data: rows are matched on a unique-ish key with
 * firstOrCreate / updateOrCreate, so re-running never duplicates them.
 * All demo customers use 90000001xx phone numbers and "Demo" names.
 */
class DemoEnquirySeeder extends Seeder
{
    public function run(): void
    {
        $enquiries = [
            ['name' => 'Demo Fabricator A', 'phone' => '9000000101', 'email' => 'demo-a@example.com', 'service_slug' => 'laser-cutting', 'machine_slug' => 'hsg-3kw-fiber-laser',
                'message' => 'Need 200 pcs MS 3 mm base plates 150x150 with 4 holes. DXF attached.', 'status' => 'new'],
            ['name' => 'Demo Panel Works B', 'phone' => '9000000102', 'email' => null, 'service_slug' => 'cnc-bending', 'machine_slug' => null,
                'message' => 'Electrical panel doors, CRCA 1.6 mm, cut + bend + powder coat RAL 7035. Qty 25.', 'status' => 'contacted'],
            ['name' => 'Demo Interiors C', 'phone' => '9000000103', 'email' => 'demo-c@example.com', 'service_slug' => 'laser-cutting', 'machine_slug' => null,
                'message' => 'Decorative SS 1.2 mm jaali screens, 4 designs, 1200x600.', 'status' => 'quoted'],
            ['name' => 'Demo Auto Parts D', 'phone' => '9000000104', 'email' => null, 'service_slug' => 'turret-punching', 'machine_slug' => null,
                'message' => 'Perforated SS sheets 1 mm, 5 mm holes, 8x4 ft, 10 sheets.', 'status' => 'won'],
        ];

        foreach ($enquiries as $data) {
            // Match on phone + source so other services' enquiries are untouched.
            $enquiry = Enquiry::firstOrCreate(
                ['phone' => $data['phone'], 'source' => 'laravel'],
                $data + ['source' => 'laravel'],
            );

            if ($data['phone'] === '9000000101') {
                Upload::firstOrCreate(
                    ['enquiry_id' => $enquiry->id, 'original_name' => 'demo-base-plate.dxf'],
                    ['stored_path' => 'demo/demo-base-plate.dxf', 'mime' => 'application/dxf', 'size_bytes' => 48213],
                );
            }

            if ($data['phone'] === '9000000103' && Material::where('code', 'SS')->exists()) {
                Quote::firstOrCreate(
                    ['quote_no' => 'PSL-Q-DEMO-001'],
                    [
                        'enquiry_id' => $enquiry->id, 'customer_name' => $data['name'], 'customer_phone' => $data['phone'],
                        'material_code' => 'SS', 'thickness_mm' => 1.2, 'length_mm' => 1200, 'width_mm' => 600,
                        'cut_length_mm' => 18500, 'pierces' => 120, 'bends' => 0, 'powder_coat' => false,
                        'quantity' => 4, 'amount_inr' => 9876.40, 'is_estimate' => true, 'source' => 'laravel',
                    ],
                );
            }
        }
    }
}
