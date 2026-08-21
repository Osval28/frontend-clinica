import TopBar from '../../components/public/TopBar';
import Navbar from '../../components/public/Navbar';
import Hero from '../../components/public/Hero';
import Bienvenida from '../../components/public/Bienvenida';
import Servicios from '../../components/public/Servicios';
import Novedades from '../../components/public/Novedades';
import Contacto from '../../components/public/Contacto';
import Footer from '../../components/public/Footer';

function Home() {
  return (
    <div>
      <TopBar />
      <Navbar />
      <Hero />
      <Bienvenida />
      <Servicios />
      <Novedades />
      <Contacto />
      <Footer />
    </div>
  );
}

export default Home;
