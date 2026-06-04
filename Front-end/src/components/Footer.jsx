export const Footer = () => {
  return <footer className="w-full border-t border-gray-100 dark:border-neutral-855 bg-neutral-50 dark:bg-neutral-900 border-neutral-300 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Collections</h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li><button className="hover:text-black dark:hover:text-white transition">Formal Tailoring</button></li>
              <li><button className="hover:text-black dark:hover:text-white transition">Minimalist Gadgets</button></li>
              <li><button className="hover:text-black dark:hover:text-white transition">Acoustic Audio Pro</button></li>
              <li><button className="hover:text-black dark:hover:text-white transition">Signature Activewear</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Support</h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li><button className="hover:text-black dark:hover:text-white transition">Shipping Logistics</button></li>
              <li><button className="hover:text-black dark:hover:text-white transition">Returns Policy</button></li>
              <li><button className="hover:text-black dark:hover:text-white transition">Corporate Enquiries</button></li>
              <li><button className="hover:text-black dark:hover:text-white transition">Contact Assistance</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Trendora</h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li><button className="hover:text-black dark:hover:text-white transition">Our Design Heritage</button></li>
              <li><button className="hover:text-black dark:hover:text-white transition">Sustainable Textiles</button></li>
              <li><button className="hover:text-black dark:hover:text-white transition">Careers</button></li>
              <li><button className="hover:text-black dark:hover:text-white transition">Press Center</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Exclusive Privileges</h3>
            <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Register for premium membership to unlock personal wardrobes, seasonal catalog releases, and 15% discount promo.
            </p>
            <div className="mt-4 flex gap-1">
              <input
    type="email"
    placeholder="Secure email"
    className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs px-3 py-2 text-neutral-900 dark:text-white focus:outline-none"
  />
              <button className="rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-3 hover:opacity-80 transition py-2">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 dark:border-neutral-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 dark:text-neutral-500">
          <p>© 2026 Trendora Inc. All craftsmanship rights reserved.</p>
          <div className="flex gap-6">
            <button className="hover:text-neutral-600 dark:hover:text-white transition">Terms & Agreements</button>
            <button className="hover:text-neutral-600 dark:hover:text-white transition">Privacy Manifest</button>
          </div>
        </div>
      </div>
    </footer>;
};
