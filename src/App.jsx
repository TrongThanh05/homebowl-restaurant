import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/layout';
import Home from './pages/Home';
import About from './pages/About';
import Menu from './pages/Menu';
import Gallery from './pages/Gallery';
import Reservation from './pages/Reservation';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/Menu" element={<Menu />} />
        <Route path="/Gallery" element={<Gallery />} />
        <Route path="/Reservation" element={<Reservation />} />
        <Route path="/Blog" element={<Blog />} />
        <Route path="/Blog/:id" element={<BlogDetail />} />
        <Route path="/Contact" element={<Contact />} />
      </Route>
    </Routes>
  );
}
