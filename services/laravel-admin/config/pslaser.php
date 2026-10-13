<?php

// PS Laser specific configuration (read with config('pslaser.key')).
return [
    'brand' => 'PS Laser',
    'asset_base' => env('PSLASER_ASSET_BASE', 'http://localhost:3001'),
    'whatsapp' => env('PSLASER_WHATSAPP', '917719976990'),
    'per_page' => 15,
];
