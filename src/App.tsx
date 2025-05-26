import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import Features from "./pages/Features";
import Layout from "./components/Layout";
import { useEffect } from "react";

function App() {
 useEffect(() => {
    // When component mounts (page reloads), scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

	return (
    
		<Router>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Home />} />
					<Route path="features" element={<Features />} />
					<Route path="how-it-works" element={<HowItWorks />} />
					<Route path="contact" element={<Contact />} />
				</Route>
			</Routes>
		</Router>
	);
}

export default App;
