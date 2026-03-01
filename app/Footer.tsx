'use client';

export default function Footer() {
  return (
    <div className="synth-footer">
      <style jsx>{`
        .synth-footer {
          position: relative;
          width: 100%;
          margin-top: -4rem;
        }

        /* Gradient that blends page bg into the sky */
        .fade-in {
          height: 60px;
          background: linear-gradient(to bottom, var(--bg), transparent);
          position: relative;
          z-index: 1;
        }

        .scene {
          position: relative;
          width: 100%;
          height: 50vh;
          min-height: 260px;
          overflow: hidden;
          margin-top: -60px; /* overlap the fade */
        }

        .sky {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 54%;
          z-index: 2;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 12%);
          mask-image: linear-gradient(to bottom, transparent 0%, black 12%);
          background: linear-gradient(
            180deg,
            #0e0c08 0%,
            #1a1408 18%,
            #2a1a0a 38%,
            #5c2a18 55%,
            #944a52 70%,
            #c06828 87%,
            #d4943a 100%
          );
        }


        .stars {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 50%;
          z-index: 3;
        }

        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #fff;
          border-radius: 50%;
          animation: twinkle var(--dur) ease-in-out infinite;
          animation-delay: var(--delay);
        }


        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.8; }
        }

        .sun {
          position: absolute;
          top: 33%;
          left: 50%;
          transform: translateX(-50%);
          width: clamp(90px, 16vw, 150px);
          aspect-ratio: 1;
          border-radius: 50%;
          background: linear-gradient(180deg, #b5636a 0%, #c87838 30%, #d4943a 60%, #e8b840 100%);
          box-shadow: 0 0 80px rgba(212, 148, 58, 0.5), 0 0 160px rgba(212, 148, 58, 0.2);
          z-index: 4;
        }

        .sun-slices { position: absolute; inset: 0; border-radius: 50%; overflow: hidden; }
        .sun-slice { position: absolute; left: 0; width: 100%; background: #0e0c08; opacity: 0.85; }
        .sun-slice:nth-child(1) { bottom: 15%; height: 2.5%; }
        .sun-slice:nth-child(2) { bottom: 25%; height: 3%; }
        .sun-slice:nth-child(3) { bottom: 34%; height: 3.5%; }
        .sun-slice:nth-child(4) { bottom: 42%; height: 4.5%; }
        .sun-slice:nth-child(5) { bottom: 50%; height: 6%; }

        .ground {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 58%;
          overflow: hidden;
          z-index: 1;
        }

        .ground-fill { position: absolute; inset: 0; background: var(--bg); }

        .ground-grid {
          position: absolute;
          top: 0;
          left: -100%;
          width: 300%;
          height: 400%;
          background-image:
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
          background-size: 40px 40px;
          transform: perspective(200px) rotateX(60deg);
          transform-origin: center top;
          animation: scroll-grid 3s linear infinite;
          --grid-line: rgba(212, 148, 58, 0.5);
        }


        @keyframes scroll-grid {
          0% { transform: perspective(200px) rotateX(60deg) translateY(0); }
          100% { transform: perspective(200px) rotateX(60deg) translateY(40px); }
        }

        .horizon {
          position: absolute;
          top: 54%;
          left: 0;
          width: 100%;
          height: 2px;
          z-index: 5;
        }

        .horizon::before {
          content: '';
          position: absolute;
          inset: -10px 0;
          background: linear-gradient(90deg, transparent 0%, var(--secondary) 15%, var(--tertiary) 50%, var(--secondary) 85%, transparent 100%);
          filter: blur(6px);
          opacity: 0.7;
        }

        .horizon::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 15%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.6) 85%, transparent 100%);
        }

        .footer-meta {
          position: absolute;
          bottom: 10px;
          left: 0;
          width: 100%;
          text-align: center;
          font-family: monospace;
          opacity: 0.25;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          z-index: 6;
          color: rgba(220, 200, 170, 0.5);
        }

        @media (prefers-reduced-motion) {
          .ground-grid { animation: none !important; }
          .star { animation: none !important; opacity: 0.3; }
        }
      `}</style>

      <div className="fade-in" />

      <div className="scene">
        <div className="sky">
          <div className="stars">
            <div className="star" style={{ top: '8%', left: '8%', '--dur': '3s', '--delay': '0s' } as any} />
            <div className="star" style={{ top: '15%', left: '22%', '--dur': '4.2s', '--delay': '-1.2s' } as any} />
            <div className="star" style={{ top: '5%', left: '38%', '--dur': '3.5s', '--delay': '-2s' } as any} />
            <div className="star" style={{ top: '12%', left: '52%', '--dur': '2.8s', '--delay': '-0.5s' } as any} />
            <div className="star" style={{ top: '20%', left: '65%', '--dur': '4s', '--delay': '-3s' } as any} />
            <div className="star" style={{ top: '4%', left: '78%', '--dur': '3.8s', '--delay': '-1.8s' } as any} />
            <div className="star" style={{ top: '14%', left: '88%', '--dur': '3.2s', '--delay': '-2.5s' } as any} />
            <div className="star" style={{ top: '10%', left: '95%', '--dur': '4.5s', '--delay': '-0.8s' } as any} />
            <div className="star" style={{ top: '22%', left: '5%', '--dur': '3.3s', '--delay': '-1.5s' } as any} />
            <div className="star" style={{ top: '3%', left: '60%', '--dur': '3.7s', '--delay': '-3.5s' } as any} />
          </div>
          <div className="sun">
            <div className="sun-slices">
              <div className="sun-slice" />
              <div className="sun-slice" />
              <div className="sun-slice" />
              <div className="sun-slice" />
              <div className="sun-slice" />
            </div>
          </div>
        </div>
        <div className="ground">
          <div className="ground-fill" />
          <div className="ground-grid" />
        </div>
        <div className="horizon" />
        <div className="footer-meta">Planted May '23 / Tended Mar '26</div>
      </div>
    </div>
  );
}
