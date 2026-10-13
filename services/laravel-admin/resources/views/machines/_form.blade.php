{{-- Shared by create + edit. $machine is a new or existing Machine model. --}}
@csrf
<div class="row">
    <div class="col-md-8"><x-field name="name" label="Full name" :value="$machine->name" required maxlength="160" /></div>
    <div class="col-md-4"><x-field name="short_name" label="Short name" :value="$machine->short_name" required maxlength="80" /></div>
    <div class="col-md-6"><x-field name="slug" label="Slug (URL id)" :value="$machine->slug" maxlength="80" help="Leave blank to generate from the name." /></div>
    <div class="col-md-4"><x-field name="category" label="Category" :value="$machine->category" required maxlength="60" list="categories" /></div>
    <div class="col-md-2"><x-field name="sort_order" type="number" label="Order" :value="$machine->sort_order" min="0" max="999" /></div>
</div>
<datalist id="categories">
    <option value="Laser Cutting"><option value="Bending"><option value="Turret Punching"><option value="Welding"><option value="Finishing">
</datalist>
<x-field name="image" label="Image path" :value="$machine->image" required
         help="Path served by the website, e.g. /sites/pslaser/machines/hsg-3kw-fiber-laser-3x1.5m.jpg" />
<x-field name="specs" type="textarea" rows="5" label="Specifications (one per line)" :value="$machine->specs" required />
