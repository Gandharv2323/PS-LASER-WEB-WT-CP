@csrf
<div class="row">
    <div class="col-md-6"><x-field name="title" label="Title" :value="$service->title" required maxlength="160" /></div>
    <div class="col-md-4"><x-field name="slug" label="Slug" :value="$service->slug" help="Blank = generated from the title." /></div>
    <div class="col-md-2"><x-field name="sort_order" type="number" label="Order" :value="$service->sort_order" min="0" /></div>
</div>
<x-field name="image" label="Image path" :value="$service->image" required help="e.g. /sites/pslaser/gallery/laser-cutting-bg.jpg" />
<x-field name="description" type="textarea" rows="4" label="Description" :value="$service->description" required />
