/**
 * Plain GET form, server-rendered with uncontrolled inputs (defaultValue). Submitting
 * changes the URL search params, and the Server Component page re-renders. Works without
 * JavaScript (progressive enhancement); Next's <Form> is not needed for this.
 */
export function TrackForm({ orderNo, phone }: { orderNo: string; phone: string }) {
  return (
    <form method="get" action="/track" className="ps-adv-card ps-adv-trackform">
      <div className="form-row align-items-end">
        <div className="form-group col-md-5">
          <label htmlFor="track-order">Order number</label>
          <input id="track-order" name="orderNo" className="form-control" defaultValue={orderNo} placeholder="PSL-DEMO-001" required autoComplete="off" />
        </div>
        <div className="form-group col-md-4">
          <label htmlFor="track-phone">Phone used for the order</label>
          <input id="track-phone" name="phone" type="tel" inputMode="tel" className="form-control" defaultValue={phone} placeholder="9000000001" required />
        </div>
        <div className="form-group col-md-3">
          <button type="submit" className="btn btn-primary btn-block">
            <i className="bx bx-search" aria-hidden="true" /> Track order
          </button>
        </div>
      </div>
      <p className="ps-adv-muted small mb-0">Demo: PSL-DEMO-001 with phone 9000000001.</p>
    </form>
  );
}
