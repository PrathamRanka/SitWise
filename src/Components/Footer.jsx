import React from "react";
import { FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import MyReservations from './../Pages/MyReservations';

export default function Footer({ isLoggedIn }) {
  return (
    <footer className="bg-gradient-to-t from-gray-100 via-white to-gray-50 text-gray-800 mt-10 shadow-inner rounded-t-2xl">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between md:items-center">
          {/* Branding + tagline */}
          <motion.div whileHover={{ scale: 1.03 }} className="cursor-default flex flex-col items-center md:items-start">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">SitWise</h1>
            <p className="text-sm sm:text-base text-gray-600 italic mt-1 text-center md:text-left">
              Quit waiting — your study spot is ready.
            </p>
          </motion.div>

          {/* Links */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-4 text-sm sm:text-base font-medium"
          >
            <Link to="/" className="transition-colors px-3 py-1 rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200">Home</Link>
            {isLoggedIn ? (
              <>
              <Link to="/floorplan/1" className="transition-colors px-3 py-1 rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200">Book Seat</Link>
             <Link to="/reservations" className="transition-colors px-3 py-1 rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            aria-disabled="true" title="Login to book seats">My Reservations</Link>
           </> ) : (
              <>
              <span
                className="transition-colors px-5 py-1 rounded-lg text-gray-400 cursor-not-allowed "
                aria-disabled="true"
                title="Login to book seats"
              >
                Book Seat
                
              </span>
              <span
                className="transition-colors px-5 py-1 rounded-lg text-gray-400 cursor-not-allowed "
                aria-disabled="true"
                title="Login to book seats"
              >
                MyReservations
                
              </span>
              </>
              
            )}
            {/* <Link to="/reservations" className="transition-colors px-3 py-1 rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            aria-disabled="true" title="Login to book seats">My Reservations</Link> */}
            <Link to="/contact" className="transition-colors px-3 py-1 rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200">Contact</Link>
          </motion.div>

          {/* Social */}
          <motion.div whileHover={{ scale: 1.12 }} className="flex justify-center md:justify-end gap-4">
            <a
              href="https://github.com/PrathamRanka/SitWise"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-700 transition-colors bg-white rounded-full p-2 shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-label="GitHub"
            >
              <FaGithub size={24} />
            </a>
          </motion.div>
        </div>

        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="mt-8 border-t border-gray-200 pt-5 text-xs text-gray-500 text-center"
        >
          <p className="mb-1">
            Created by <span className="font-semibold text-blue-700">Sagarika, Sanchita, Pratham</span>
          </p>
          <p>
            © 2025 <span className="font-semibold text-gray-700">SitWise</span>. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
