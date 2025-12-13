import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

function SubscribeSection() {
  const form = useRef();
  const [status, setStatus] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus("sending");

    const SERVICE_ID = "service_6pcmjqd";
    const TEMPLATE_ID = "template_5fmwkph";
    const PUBLIC_KEY = "m_7OqQFJ2pd4mzNpm";

    emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY).then(
      (result) => {
        setStatus("success");
        e.target.reset();
      },
      (error) => {
        setStatus("error");
      }
    );
  };

  return (
    <div className="p-10">
      <div className="mx-auto max-w-7xl rounded-xl border border-green-200 px-8 py-20 shadow-md">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-800">Can't find what you need?</h2>

          <p className="mb-6 text-lg text-green-800">
            Tell us what produce you are looking for and leave your email. We will notify you when
            it arrives.
          </p>

          <form
            ref={form}
            onSubmit={sendEmail}
            className="mx-auto mt-12 flex max-w-lg flex-col gap-4 text-center"
          >
            <input
              type="text"
              name="name"
              placeholder="What product are you looking for?"
              required
              className="w-full rounded-full border border-green-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-200"
            />
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <input
                type="email"
                name="email"
                placeholder="Your email address"
                required
                className="w-full flex-grow rounded-full border border-green-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-200"
              />

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full whitespace-nowrap rounded-full bg-green-100 px-8 py-3 text-lg font-semibold text-green-800 transition-colors hover:bg-green-200 sm:w-auto"
              >
                {status === "sending" ? "Sending..." : "Request Product"}
              </button>
            </div>
          </form>

          {status === "success" && (
            <p className="mt-4 font-medium text-green-600">
              Request received! We'll email you when it's in stock.
            </p>
          )}
          {status === "error" && (
            <p className="mt-4 font-medium text-red-500">Something went wrong. Please try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubscribeSection;
