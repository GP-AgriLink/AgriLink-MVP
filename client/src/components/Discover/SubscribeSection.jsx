import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

function SubscribeSection() {

    const form = useRef();
    const [status, setStatus] = useState('');

    const sendEmail = (e) => {
        e.preventDefault();
        setStatus('sending');

        const SERVICE_ID = "service_6pcmjqd";
        const TEMPLATE_ID = "template_5fmwkph";
        const PUBLIC_KEY = "m_7OqQFJ2pd4mzNpm";

        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY)
            .then((result) => {
                console.log(result.text);
                setStatus('success');
                e.target.reset();
            }, (error) => {
                console.log(error.text);
                setStatus('error');
            });
    };

    return (
        <div className="p-10">
            <div className="max-w-7xl mx-auto rounded-xl border border-green-200 py-20 px-8 shadow-md">

                <div className="text-center max-w-2xl mx-auto">

                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        Stay Updated with Seasonal Releases
                    </h2>

                    <p className="text-lg text-green-800 mb-6">
                        Subscribe to our harvest bulletin to get notified about new farms, seasonal produce, and exclusive farm stories.
                    </p>

                    <form
                        ref={form}
                        onSubmit={sendEmail}
                        className="mt-12 text-center flex flex-col sm:flex-row justify-center items-center gap-3 max-w-lg mx-auto"
                    >
                        <input
                            type="email"
                            name="email"
                            placeholder="your@email.com"
                            required
                            className="w-full sm:w-auto flex-grow px-4 py-3 rounded-full border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-200"
                            aria-label="Email for newsletter"
                        />
                        <button type="submit" disabled={status === 'sending'} className="rounded-full bg-green-100 px-8 py-3 text-lg font-semibold text-green-800 transition-colors hover:bg-green-200">
                            {status === 'sending' ? 'Sending...' : 'Subscribe'}
                        </button>
                    </form>

                    {status === 'success' && (
                        <p className="text-green-600 mt-4 font-medium">Thank you for subscribing!</p>
                    )}
                    {status === 'error' && (
                        <p className="text-red-500 mt-4 font-medium">Something went wrong. Please try again.</p>
                    )}

                </div>
            </div>
        </div>
    );
}

export default SubscribeSection;