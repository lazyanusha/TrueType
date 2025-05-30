const Footer = () => {
  return (
    <footer className="bg-white py-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <img
                  src="logo.png"
                  alt="TrueType Logo"
                  className="h-16 w-auto"
                />
          </div>
          <div className="mt-4 md:mt-0 text-sm text-gray-500">
            © {new Date().getFullYear()} TrueType. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;