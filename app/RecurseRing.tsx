"use client";

import React, { useEffect } from "react";

export default function RecurseRing() {
  useEffect(() => {
    function mod(n: number, m: number) {
      return ((n % m) + m) % m;
    }

    function replace_hrefs(data: any[]) {
      const home = document.getElementById("rc-ring-home");
      const prev = document.getElementById("rc-ring-prev");
      const next = document.getElementById("rc-ring-next");
      const rand = document.getElementById("rc-ring-rand");

      if (!home) return;

      const currentUuid = home.getAttribute("data-rc-uuid");
      const currentIndex = data.findIndex((site) => site.website_uuid === currentUuid);

      if (currentIndex === -1) return;

      const prevSite = data[mod((currentIndex - 1), data.length)];
      const nextSite = data[mod((currentIndex + 1), data.length)];
      const randSite = data[Math.floor(Math.random() * data.length)];

      if (next) next.setAttribute("href", nextSite.url);
      if (prev) prev.setAttribute("href", prevSite.url);
      if (rand) rand.setAttribute("href", randSite.url);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://raw.githack.com/Qwuke/recurse-ring/main/sites.json', true);
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 400) {
        replace_hrefs(JSON.parse(xhr.responseText));
      } else {
        const xhr_backup = new XMLHttpRequest();
        xhr_backup.open('GET', 'https://ring.recurse.com/sites.json', true);
        xhr_backup.onload = function() {
          if (xhr_backup.status >= 200 && xhr_backup.status < 400) {
            replace_hrefs(JSON.parse(xhr_backup.responseText));
          } else {  
            console.log("There was an error embedding the static blog URLs");
          }
        };
        xhr_backup.send();
      }
    };
    xhr.send();
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
      <a id="rc-ring-prev" href="https://ring.recurse.com/prev?id=54" className="hover:text-gray-700 transition-colors">←</a>
      <a id="rc-ring-home" data-rc-uuid="242f4aa8-c457-4681-a710-2009f3cd7299" href="https://ring.recurse.com/" className="hover:text-gray-700 transition-colors text-xs">The Recurse Webring</a>
      <a id="rc-ring-next" href="https://ring.recurse.com/next?id=54" className="hover:text-gray-700 transition-colors">→</a>
      <a id="rc-ring-rand" href="https://ring.recurse.com/rand" className="hover:text-gray-700 transition-colors">?</a>
    </div>
  );
}