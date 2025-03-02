export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} Simple Shop. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-primary-600 text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 text-sm">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
