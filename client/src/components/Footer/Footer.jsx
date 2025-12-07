import { Link } from 'react-router-dom';
import { LogoIconSvg } from '../common/Logo';

function Footer() {
  return (
    <footer className="font-['Inter'] box-border bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/40 backdrop-blur-lg border-t-0 border-emerald-200/50 pt-6 pb-6 shadow-[0_-12px_32px_rgba(6,78,59,0.06)] rounded-t-3xl z-40 bottom-0">
      <div className="w-full lg:w-5/6 mx-auto px-4 sm:px-6 lg:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-6">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-100">
                <LogoIconSvg className="w-[55%] h-[55%] text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-emerald-900 font-bold text-xl tracking-wide">AgriLink</span>
                <span className="text-emerald-700/70 text-xs font-medium tracking-wide">Connecting Farms to Tables</span>
              </div>
            </div>
            <p className="text-emerald-800/60 text-sm text-center md:text-left max-w-sm leading-relaxed">
              Bridging the gap between local farmers and consumers, delivering fresh produce directly to your doorstep.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <h3 className="text-emerald-900 font-bold text-sm uppercase tracking-wider">Quick Links</h3>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-3">
              <Link
                to="/privacy"
                className="group flex items-center gap-2 text-emerald-800/70 font-medium text-sm cursor-pointer transition-all hover:text-emerald-700 no-underline hover:translate-x-0.5"
                aria-label="Read privacy policy"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600/70 group-hover:stroke-emerald-600 transition-colors">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Privacy Policy</span>
              </Link>

              <Link
                to="/terms"
                className="group flex items-center gap-2 text-emerald-800/70 font-medium text-sm cursor-pointer transition-all hover:text-emerald-700 no-underline hover:translate-x-0.5"
                aria-label="Review terms of service"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600/70 group-hover:stroke-emerald-600 transition-colors">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                <span>Terms of Service</span>
              </Link>

              <Link
                to="/contact-us"
                className="group flex items-center gap-2 text-emerald-800/70 font-medium text-sm cursor-pointer transition-all hover:text-emerald-700 no-underline hover:translate-x-0.5"
                aria-label="Contact AgriLink"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600/70 group-hover:stroke-emerald-600 transition-colors">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>Contact Us</span>
              </Link>

              <Link
                to="/about-us"
                className="group flex items-center gap-2 text-emerald-800/70 font-medium text-sm cursor-pointer transition-all hover:text-emerald-700 no-underline hover:translate-x-0.5"
                aria-label="About AgriLink"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600/70 group-hover:stroke-emerald-600 transition-colors">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>About Us</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="relative h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent blur-sm"></div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-emerald-900/60 text-xs font-medium text-center md:text-left">
            © 2025 AgriLink. All rights reserved. | Built with 🌱 for sustainable agriculture
          </p>

          <div className="flex items-center gap-2 text-emerald-700/60 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600/60">
              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
              <line x1="16" y1="8" x2="2" y2="22"></line>
              <line x1="17.5" y1="15" x2="9" y2="15"></line>
            </svg>
            <span className="font-medium">Fresh. Local. Sustainable.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
