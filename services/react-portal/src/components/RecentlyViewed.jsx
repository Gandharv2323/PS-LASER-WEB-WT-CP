// CLASSIC REDUX: a CLASS component wired to the store with the connect() higher-order component.
// mapStateToProps picks state -> props; mapDispatchToProps turns action creators into props.
// Modern code uses useSelector/useDispatch instead (see pages/Cart.jsx).
import { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { clearRecent } from '../store/classic/recentlyViewed.js'

class RecentlyViewed extends Component {
  render() {
    const { items, clear } = this.props
    if (items.length === 0) {
      return <p className="muted">Machines you open will appear here (classic Redux reducer + connect()).</p>
    }
    return (
      <>
        <ul className="recent-list">
          {items.map((m) => (
            <li key={m.slug}>
              <Link to={`/machines/${m.slug}`}>
                <img src={m.image} alt="" width="48" height="36" />
                {m.shortName}
              </Link>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-sm btn-link" onClick={clear}>Clear list</button>
      </>
    )
  }
}

RecentlyViewed.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({ slug: PropTypes.string, shortName: PropTypes.string, image: PropTypes.string })).isRequired,
  clear: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({ items: state.recent.items })
const mapDispatchToProps = (dispatch) => ({ clear: () => dispatch(clearRecent()) })

// connect(...) returns a HOC; calling it with the component returns a new, store-aware component.
export default connect(mapStateToProps, mapDispatchToProps)(RecentlyViewed)
