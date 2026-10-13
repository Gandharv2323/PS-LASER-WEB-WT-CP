{{--
    Reusable form field with label, old() value and validation error.
    <x-field name="name" label="Machine name" :value="$machine->name" required />
    <x-field name="specs" type="textarea" rows="4" ... />
--}}
@props(['name', 'label', 'type' => 'text', 'value' => null, 'help' => null])
@php($current = old($name, $value instanceof \DateTimeInterface ? $value->format('Y-m-d') : $value))
<div class="mb-3">
    <label for="{{ $name }}" class="form-label fw-medium">{{ $label }}</label>
    @if ($type === 'textarea')
        <textarea id="{{ $name }}" name="{{ $name }}"
            {{ $attributes->class(['form-control', 'is-invalid' => $errors->has($name)]) }}>{{ $current }}</textarea>
    @else
        <input id="{{ $name }}" name="{{ $name }}" type="{{ $type }}" value="{{ $current }}"
            {{ $attributes->class(['form-control', 'is-invalid' => $errors->has($name)]) }}>
    @endif
    @error($name)
        <div class="invalid-feedback">{{ $message }}</div>
    @enderror
    @if ($help)
        <div class="form-text">{{ $help }}</div>
    @endif
</div>
