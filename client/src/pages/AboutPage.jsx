import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Code, Heart, Leaf } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-emerald-50">
      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
            <Leaf className="w-4 h-4" />
            About Us
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Meet{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              AgriLink
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Connecting Egyptian farmers directly with customers who value fresh, 
            quality produce and sustainable agriculture.
          </p>
        </div>
      </section>

      {/* Project Story */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What is AgriLink?
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                <p>
                  AgriLink is a digital marketplace platform that bridges the gap 
                  between local farmers and consumers across Egypt. We eliminate 
                  intermediaries, allowing farmers to showcase their products and 
                  connect directly with customers.
                </p>
                <p>
                  Our platform empowers farmers to set fair prices, manage their 
                  inventory, and grow their business while giving customers access 
                  to fresh, locally-sourced produce.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-8 border border-emerald-200">
              <h3 className="text-2xl font-bold text-emerald-900 mb-4">
                Why We Built It
              </h3>
              <div className="space-y-3 text-gray-800">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p>Farmers struggle to reach customers willing to pay fair prices</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p>Consumers want fresher, healthier options from local sources</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p>Long supply chains reduce freshness and farmer profits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Vision</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            We envision a future where every Egyptian household has easy access to 
            farm-fresh produce, and every farmer has the tools and platform to thrive. 
            AgriLink aims to be the leading marketplace connecting agriculture to 
            communities across Egypt, promoting sustainable farming and supporting 
            local economies.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Team
            </h2>
            <p className="text-xl text-gray-600">
              Built by passionate developers committed to making a difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Team Value 1 */}
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:rotate-12">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Collaborative
              </h3>
              <p className="text-gray-600">
                We work together as a team, combining our skills to build 
                the best solution for farmers and customers.
              </p>
            </div>

            {/* Team Value 2 */}
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Tech-Driven
              </h3>
              <p className="text-gray-600">
                We leverage modern technologies to create a seamless, 
                efficient platform for the agricultural community.
              </p>
            </div>

            {/* Team Value 3 */}
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Purpose-Driven
              </h3>
              <p className="text-gray-600">
                We're motivated by making a positive impact on Egyptian 
                agriculture and supporting local communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Built with Modern Technology</h2>
            <p className="text-emerald-100 mb-6 text-lg">
              We use cutting-edge technologies to ensure a fast, reliable, and 
              secure platform for all users.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center transition-all duration-300 hover:scale-110 hover:bg-white/20 cursor-pointer">
                <p className="font-semibold">React</p>
                <p className="text-sm text-emerald-100">Frontend</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center transition-all duration-300 hover:scale-110 hover:bg-white/20 cursor-pointer">
                <p className="font-semibold">Node.js</p>
                <p className="text-sm text-emerald-100">Backend</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center transition-all duration-300 hover:scale-110 hover:bg-white/20 cursor-pointer">
                <p className="font-semibold">MongoDB</p>
                <p className="text-sm text-emerald-100">Database</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center transition-all duration-300 hover:scale-110 hover:bg-white/20 cursor-pointer">
                <p className="font-semibold">Express</p>
                <p className="text-sm text-emerald-100">API</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Our Community
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Whether you're a farmer looking to grow your business or a customer 
            seeking fresh produce, we'd love to have you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-200"
            >
              Explore Farms
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 hover:scale-105 hover:-translate-y-1 transition-all duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
