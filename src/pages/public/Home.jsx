import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TopBar from '../../components/public/TopBar';
import Navbar from '../../components/public/Navbar';
import Hero from '../../components/public/Hero';
import Bienvenida from '../../components/public/Bienvenida';
import Servicios from '../../components/public/Servicios';
import Novedades from '../../components/public/Novedades';
import Contacto from '../../components/public/Contacto';
import Footer from '../../components/public/Footer';
import BotonWhatsApp from '../../components/public/BotonWhatsApp';

function Home() {
  const { hash } = useLocation();

  // Al llegar desde otra ruta con ancla (p. ej. "Volver a servicios" desde
  // el flujo de agendamiento), React Router no hace scroll solo.
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    }
  }, [hash]);

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
      <BotonWhatsApp />
    </div>
  );
}

export default Home;
