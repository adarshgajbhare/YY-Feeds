/* eslint-disable no-unused-vars */
import { signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { auth, provider } from "../lib/firebase";
import { Navigate, useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

const LearnMorePage = () => {
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      Navigate("/");
    } catch (error) {
      setError("Failed to sign in with Google");
      console.error(error);
    }
  };
  return (
    <>
      <div className="min-h-dvh text-white overflow-hidden bg-[#050505] p-8 md:p-16 lg:p-24 xl:p-32">
        <div className="fixed top-2 left-2 md:top-4 md:left-4 z-50 flex items-center gap-1 cursor-pointer">
            <a href="/login" className="flex items-center gap-1">
                <IoChevronBack
                className="text-2xl ml-4 md:text-3xl lg:text-4xl text-white" />
                <span className="text-xl font-medium tracking-tight">Back to Homepage</span>
            </a>
        </div>
        <div className="max-w-7xl mt-4 mx-auto">
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-semibold max-w-3xl lg:max-w-4xl text-balance tracking-tight text-left mb-2 lg:mb-8">
            ZenFeeds: Take Back the Wheel from the Algorithm
          </h1>
          <p className="text-lg/6 md:text-xl/7 lg:text-2xl/8 text-left max-w-2xl lg:max-w-4xl mb-4 lg:mb-12">
            Imagine a world where you're in charge of your video feed, not some
            faceless algorithm bent on keeping you glued to your screen. That's
            ZenFeeds. <br />
            We strip away the distractions, so you get the content you want, no
            strings attached.
          </p>
          <div className="text-left space-y-4 lg:space-y-8">
            <div>
              <h2 className="text-xl lg:text-3xl font-semibold text-pretty">
                Why ZenFeeds?
              </h2>
              <ul className="text-left list-none w-4/5 lg:w-3/5 space-y-2 lg:space-y-4 mt-2 lg:mt-6">
                <li>
                  <span className="text-lg/6 lg:text-xl/7">🎯</span>{" "}
                  <span className="font-semibold text-pretty">
                    Escape the Rabbit Hole
                  </span>
                  <br />
                  <span className="ml-6 lg:ml-8">
                    No more endless autoplay.
                  </span>
                </li>
                <li>
                  <span className="text-lg/6 lg:text-xl/7">🛠️</span>{" "}
                  <span className="font-semibold text-pretty">
                    Control the Narrative
                  </span>
                  <br />
                  <span className="ml-6 lg:ml-8">
                    Watch your favorites on <em>your</em> terms.
                  </span>
                </li>
                <li>
                  <span className="text-lg/6 lg:text-xl/7">🌿</span>{" "}
                  <span className="font-semibold text-pretty">
                    Digital Minimalism
                  </span>
                  <br />
                  <span className="ml-6 lg:ml-8">
                    Curate a clean, focused feed.
                  </span>
                </li>
              </ul>
            </div>
            <p className="text-lg/6 md:text-xl/7 lg:text-2xl/8 max-w-2xl lg:max-w-4xl">
              You don't need to quit YouTube to escape its traps. With ZenFeeds,
              reconnect with your favorite creators, rediscover purposeful
              browsing, and log off <em>on your schedule</em>.
            </p>
          </div>
          {error && (
            <div className="text-red-500 rounded-lg mt-2 lg:mt-8">
             Oops! {error}
            </div>
          )}

<div className="hero-buttons md:ml-4 mt-12 flex w-full md:max-w-md   flex-col items-center gap-3 ">
            <a
              href="#"
              onClick={handleGoogleSignIn}
              className="
              
              rounded-md bg-white px-6 py-4 text-lg/4 font-medium text-gray-950  w-full text-center  drop-shadow-md
              "
            >
              Sign up with Google
            </a>
            <a
              href="/learn-more"
              className="rounded-md bg-black  w-full text-center px-6 py-4 text-lg/4 font-medium text-white  shadow-[inset_0_0_1px_1px_rgba(255,255,255,1)] "
            >
              Learn more
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default LearnMorePage;