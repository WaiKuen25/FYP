import React from 'react';

const PlatformLink = ({ href, icon, name, ariaLabel }) => (
  <div className="bg-white rounded-lg p-6 text-center transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-gray-50 border border-gray-200">
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="flex flex-col items-center justify-center h-full text-inherit no-underline"
    >
      <i className={`fas ${icon} text-5xl mb-4 text-[#005FAF] transition-colors duration-300 hover:text-[#003d73]`}></i>
      <div className="text-base font-semibold text-gray-800">{name}</div>
    </a>
  </div>
);

const Links = () => (
  <div className="min-h-screen bg-[#f4f7fc] flex items-center justify-center p-4 font-sans">
    <div className="max-w-4xl w-full p-8 text-center">
      <h1 className="text-4xl md:text-5xl text-[#005FAF] mb-8 font-bold">
        VTC Platform Links
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <PlatformLink
          href="https://myportal.vtc.edu.hk/wps/portal"
          icon="fa-right-to-bracket"
          name="MyPortal"
          ariaLabel="前往 VTC MyPortal"
        />
        <PlatformLink
          href="https://moodle2425.vtc.edu.hk/"
          icon="fa-graduation-cap"
          name="Moodle"
          ariaLabel="前往 VTC Moodle"
        />
        <PlatformLink
          href="https://library.vtc.edu.hk/web/"
          icon="fa-book"
          name="Library"
          ariaLabel="前往 VTC 圖書館"
        />
        <PlatformLink
          href="https://www.vtc.edu.hk/tc/home.html"
          icon="fa-info-circle"
          name="VTC Information"
          ariaLabel="前往 VTC 資訊主頁"
        />
      </div>
    </div>
  </div>
);

export default Links;