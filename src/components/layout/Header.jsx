import { Link, NavLink } from 'react-router-dom';
import logo from '../../assets/images/icons/logo.png';
import logo2 from '../../assets/images/icons/logo2.png';

const links = [
  { to: '/', label: 'Home' },
  { to: '/Menu', label: 'Menu' },
  { to: '/Reservation', label: 'Reservation' },
  { to: '/Gallery', label: 'Gallery' },
  { to: '/About', label: 'About' },
  { to: '/Blog', label: 'Blog' },
  { to: '/Contact', label: 'Contact' },
];
const Header = () => {
  return (
    <header>
      <div className="wrap-menu-header gradient1 trans-0-4">
        <div className="container h-full">
          <div className="wrap_header trans-0-3">
            <div className="logo">
              <Link to="/" className="logo">
                <img src={logo} alt="IMG-LOGO" data-logofixed={logo2} />
              </Link>
            </div>

            <div className="wrap_menu p-l-45 p-l-0-xl">
              <nav className="menu">
                <ul className="main_menu">
                  {links.map(({ to, label }) => (
                    <li key={to}>
                      <NavLink to={to} end={to === '/'}>
                        {label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="social flex-w flex-l-m p-r-20">
              <a href="#">
                <i className="fa fa-tripadvisor" aria-hidden="true"></i>
              </a>
              <a href="#">
                <i className="fa fa-facebook m-l-21" aria-hidden="true"></i>
              </a>
              <a href="#">
                <i className="fa fa-twitter m-l-21" aria-hidden="true"></i>
              </a>

              <button className="btn-show-sidebar m-l-33 trans-0-4"></button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
