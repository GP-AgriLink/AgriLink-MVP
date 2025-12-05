import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Heart, 
  Shield,
  MapPin,
  ArrowRight 
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Section */}
      <section className="relative py-20 px-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-teal-600/10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold uppercase tracking-wider">
              <Leaf className="w-4 h-4" />
              About AgriLink
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Connecting Farms to
            <span className="block mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Your Table
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're bridging the gap between local farmers and conscious consumers, 
            creating a sustainable future for Egyptian agriculture.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3">
                Our Story
              </p>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Fresh Produce, Direct from the Source
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  AgriLink was born from a simple idea: what if consumers could buy 
                  directly from the farmers who grow their food? What if we could 
                  eliminate the middlemen and create a direct connection?
                </p>
                <p>
                  In Egypt, our farmers work tirelessly to produce fresh, quality crops. 
                  Yet, many struggle to reach customers willing to pay fair prices. 
                  Meanwhile, consumers seek fresher, healthier options but don't know 
                  where to find them.
                </p>
                <p>
                  We built AgriLink to solve both problems. Our platform empowers farmers 
                  to showcase their products, set their prices, and connect with customers 
                  who value quality and sustainability.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <img 
                  src="../../../mision.jpeg" 
                  alt="Fresh farm produce"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-emerald-600 text-white p-6 rounded-xl shadow-lg max-w-xs">
                <p className="text-2xl font-bold">100+</p>
                <p className="text-emerald-100">Farms Connected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-5 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Mission & Vision
            </h2>
            <div className="w-20 h-1 bg-emerald-600 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <div className="w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To revolutionize the way Egyptians access fresh produce by creating 
                a transparent, efficient marketplace that benefits both farmers and 
                consumers. We're committed to supporting local agriculture while 
                providing customers with the freshest, highest-quality products.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100">
              <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                We envision a future where every Egyptian household has easy access 
                to farm-fresh produce, and every farmer has the tools and platform 
                to thrive. AgriLink will be the leading marketplace connecting 
                agriculture to communities across Egypt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What We Stand For
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our core values guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="group p-8 rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality & Trust</h3>
              <p className="text-gray-600 leading-relaxed">
                We verify every farm and ensure all products meet our quality 
                standards. Your trust is our priority.
              </p>
            </div>
            
            {/* Value 2 */}
            <div className="group p-8 rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
              <p className="text-gray-600 leading-relaxed">
                We believe in supporting local communities and building lasting 
                relationships between farmers and customers.
              </p>
            </div>
            
            {/* Value 3 */}
            <div className="group p-8 rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sustainability</h3>
              <p className="text-gray-600 leading-relaxed">
                We promote sustainable farming practices and reduce food miles 
                by connecting you with local producers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-5 bg-gradient-to-br from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How AgriLink Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, transparent, and efficient
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  1
                </div>
                <MapPin className="w-10 h-10 text-emerald-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Discover Local Farms
                </h3>
                <p className="text-gray-600">
                  Browse farms near you and explore their fresh produce offerings. 
                  See what's in season and available.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ArrowRight className="w-8 h-8 text-emerald-300" />
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  2
                </div>
                <ShoppingCart className="w-10 h-10 text-emerald-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Shop Directly
                </h3>
                <p className="text-gray-600">
                  Add products to your cart from one or multiple farms. 
                  No middlemen, just direct farm-to-table shopping.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ArrowRight className="w-8 h-8 text-emerald-300" />
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <Heart className="w-10 h-10 text-emerald-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Enjoy Fresh Produce
              </h3>
              <p className="text-gray-600">
                Receive your order fresh from the farm. Support local agriculture 
                while enjoying the best quality produce.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-5 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Experience Fresh?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of customers who are already enjoying farm-fresh produce
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-600 rounded-lg font-bold text-lg hover:bg-emerald-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Discover Farms
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700 text-white rounded-lg font-bold text-lg hover:bg-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Join as Farmer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
