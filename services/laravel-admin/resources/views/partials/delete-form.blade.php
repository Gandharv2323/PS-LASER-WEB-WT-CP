{{-- @include('partials.delete-form', ['action' => route('machines.destroy', $machine), 'label' => 'Delete']) --}}
@can('admin')
    <form method="POST" action="{{ $action }}" class="d-inline" data-confirm="{{ $confirm ?? 'Delete this record permanently?' }}">
        @csrf
        @method('DELETE')
        <button type="submit" class="btn {{ $btnClass ?? 'btn-outline-danger' }}">
            <i class="bi bi-trash me-1"></i>{{ $label ?? 'Delete' }}
        </button>
    </form>
@endcan
