'use client';

export default function Footer() {
  return (
    <div className="flex flex-col items-center mt-12 pb-8">
      <style jsx>{`
        .tree-container {
          position: relative;
          width: 280px;
          height: 280px;
          perspective: 1400px;
        }

        .tree {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.2));
        }

        .tree-trunk {
          position: absolute;
          bottom: 15px;
          left: 50%;
          width: 12px;
          height: 65px;
          background:
            linear-gradient(90deg,
              #2d1810 0%,
              #3d2515 15%,
              #4d3520 30%,
              #5d4228 50%,
              #4d3520 70%,
              #3d2515 85%,
              #2d1810 100%
            );
          border-radius: 4px 4px 2px 2px;
          transform-origin: bottom center;
          animation: sway-trunk 5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          box-shadow:
            inset -3px 0 6px rgba(0, 0, 0, 0.4),
            inset 3px 0 4px rgba(139, 90, 43, 0.3),
            3px 0 12px rgba(0, 0, 0, 0.25);
        }

        .tree-trunk::before {
          content: '';
          position: absolute;
          top: 10%;
          left: -2px;
          width: 6px;
          height: 8px;
          background: linear-gradient(135deg, #4d3520, #3d2515);
          border-radius: 50% 20% 20% 50%;
          box-shadow: inset -1px -1px 2px rgba(0, 0, 0, 0.3);
        }

        .tree-trunk::after {
          content: '';
          position: absolute;
          top: 40%;
          right: -3px;
          width: 7px;
          height: 10px;
          background: linear-gradient(225deg, #4d3520, #3d2515);
          border-radius: 20% 50% 50% 20%;
          box-shadow: inset 1px -1px 2px rgba(0, 0, 0, 0.3);
        }

        .canopy {
          position: absolute;
          bottom: 70px;
          left: 50%;
          transform: translateX(-50%);
          width: 140px;
          height: 140px;
        }

        .foliage-cluster {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(
            circle at 40% 35%,
            #a8d89a 0%,
            #8fca7a 20%,
            #7fb069 40%,
            #6a9c54 60%,
            #5a8c47 75%,
            #4a7039 90%,
            #3a5f2a 100%
          );
          box-shadow:
            inset -12px -12px 24px rgba(0, 0, 0, 0.25),
            inset 8px 8px 16px rgba(200, 255, 180, 0.15),
            0 4px 12px rgba(0, 0, 0, 0.15);
          animation: sway-cluster var(--sway-duration) cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          animation-delay: var(--sway-delay);
          transform-origin: var(--origin-x) var(--origin-y);
        }

        /* Center large cluster */
        .foliage-cluster:nth-child(1) {
          width: 95px;
          height: 95px;
          top: 30%;
          left: 50%;
          transform: translate(-50%, -50%);
          --sway-duration: 5s;
          --sway-delay: 0s;
          --origin-x: 50%;
          --origin-y: 80%;
          z-index: 5;
        }

        /* Top left cluster */
        .foliage-cluster:nth-child(2) {
          width: 70px;
          height: 70px;
          top: 5%;
          left: 20%;
          --sway-duration: 5.2s;
          --sway-delay: -0.5s;
          --origin-x: 70%;
          --origin-y: 90%;
          z-index: 4;
        }

        /* Top right cluster */
        .foliage-cluster:nth-child(3) {
          width: 65px;
          height: 65px;
          top: 8%;
          right: 22%;
          --sway-duration: 4.8s;
          --sway-delay: -1s;
          --origin-x: 30%;
          --origin-y: 85%;
          z-index: 3;
        }

        /* Middle left cluster */
        .foliage-cluster:nth-child(4) {
          width: 68px;
          height: 68px;
          top: 35%;
          left: 8%;
          --sway-duration: 5.1s;
          --sway-delay: -1.5s;
          --origin-x: 75%;
          --origin-y: 70%;
          z-index: 6;
        }

        /* Middle right cluster */
        .foliage-cluster:nth-child(5) {
          width: 72px;
          height: 72px;
          top: 32%;
          right: 6%;
          --sway-duration: 4.9s;
          --sway-delay: -2s;
          --origin-x: 25%;
          --origin-y: 75%;
          z-index: 7;
        }

        /* Bottom left cluster */
        .foliage-cluster:nth-child(6) {
          width: 60px;
          height: 60px;
          bottom: 15%;
          left: 15%;
          --sway-duration: 5.3s;
          --sway-delay: -2.5s;
          --origin-x: 60%;
          --origin-y: 50%;
          z-index: 2;
        }

        /* Bottom right cluster */
        .foliage-cluster:nth-child(7) {
          width: 58px;
          height: 58px;
          bottom: 18%;
          right: 18%;
          --sway-duration: 4.7s;
          --sway-delay: -3s;
          --origin-x: 40%;
          --origin-y: 55%;
          z-index: 3;
        }

        /* Top center small */
        .foliage-cluster:nth-child(8) {
          width: 55px;
          height: 55px;
          top: 0%;
          left: 50%;
          transform: translate(-50%, 0);
          --sway-duration: 5s;
          --sway-delay: -3.5s;
          --origin-x: 50%;
          --origin-y: 100%;
          z-index: 8;
        }

        .orange-fruit {
          position: absolute;
          width: 14px;
          height: 14px;
          background:
            radial-gradient(
              circle at 32% 28%,
              #ffe5b4 0%,
              #ffd27f 15%,
              #ffb347 35%,
              #ff9933 55%,
              #ff8c42 70%,
              #e67a35 85%,
              #cc6622 100%
            );
          border-radius: 50%;
          animation: fruit-sway var(--fruit-duration) ease-in-out infinite;
          animation-delay: var(--fruit-delay);
          box-shadow:
            0 0 12px rgba(255, 140, 66, 0.6),
            inset -3px -3px 6px rgba(0, 0, 0, 0.3),
            inset 3px 3px 6px rgba(255, 255, 255, 0.4),
            0 2px 4px rgba(0, 0, 0, 0.2);
          z-index: 10;
        }

        .orange-fruit::before {
          content: '';
          position: absolute;
          top: 15%;
          left: 25%;
          width: 35%;
          height: 35%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.6), transparent);
          border-radius: 50%;
        }

        .orange-fruit::after {
          content: '';
          position: absolute;
          top: -3px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: linear-gradient(135deg, #4d3520, #2d1810);
          border-radius: 50% 50% 0 0;
        }

        .orange-fruit:nth-child(9) { top: 22%; left: 25%; --fruit-duration: 3.2s; --fruit-delay: 0s; }
        .orange-fruit:nth-child(10) { top: 18%; left: 52%; --fruit-duration: 3.5s; --fruit-delay: -0.5s; }
        .orange-fruit:nth-child(11) { top: 28%; right: 18%; --fruit-duration: 3.1s; --fruit-delay: -1s; }
        .orange-fruit:nth-child(12) { top: 45%; left: 15%; --fruit-duration: 3.3s; --fruit-delay: -1.5s; }
        .orange-fruit:nth-child(13) { top: 48%; left: 48%; --fruit-duration: 3.4s; --fruit-delay: -2s; }
        .orange-fruit:nth-child(14) { top: 52%; right: 12%; --fruit-duration: 3.2s; --fruit-delay: -2.5s; }
        .orange-fruit:nth-child(15) { bottom: 25%; left: 28%; --fruit-duration: 3.6s; --fruit-delay: -3s; }
        .orange-fruit:nth-child(16) { bottom: 22%; right: 30%; --fruit-duration: 3.3s; --fruit-delay: -3.5s; }

        @keyframes sway-trunk {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          25% { transform: translateX(-50%) rotate(2deg); }
          50% { transform: translateX(-50%) rotate(0deg); }
          75% { transform: translateX(-50%) rotate(-2deg); }
        }

        @keyframes sway-cluster {
          0%, 100% {
            transform: translate(var(--tx-start, 0), var(--ty-start, 0)) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(3px, -2px) rotate(2.5deg) scale(1.02);
          }
          50% {
            transform: translate(0, -1px) rotate(0deg) scale(1);
          }
          75% {
            transform: translate(-3px, -2px) rotate(-2.5deg) scale(0.98);
          }
        }

        @keyframes fruit-sway {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            filter: brightness(1);
          }
          25% {
            transform: translateY(-2px) rotate(3deg);
            filter: brightness(1.1);
          }
          50% {
            transform: translateY(0px) rotate(0deg);
            filter: brightness(1);
          }
          75% {
            transform: translateY(-2px) rotate(-3deg);
            filter: brightness(1.05);
          }
        }

        .footer-text {
          text-align: center;
          margin-top: 2rem;
          font-family: monospace;
          color: var(--text);
          opacity: 0.75;
        }

        .footer-text .date {
          display: block;
          font-size: 0.875rem;
          margin: 0.25rem 0;
          letter-spacing: 0.05em;
        }

        @media (prefers-reduced-motion) {
          .tree-trunk,
          .foliage-cluster,
          .orange-fruit {
            animation: none !important;
          }
        }
      `}</style>

      <div className="tree-container">
        <div className="tree">
          <div className="canopy">
            <div className="foliage-cluster"></div>
            <div className="foliage-cluster"></div>
            <div className="foliage-cluster"></div>
            <div className="foliage-cluster"></div>
            <div className="foliage-cluster"></div>
            <div className="foliage-cluster"></div>
            <div className="foliage-cluster"></div>
            <div className="foliage-cluster"></div>
            <div className="orange-fruit"></div>
            <div className="orange-fruit"></div>
            <div className="orange-fruit"></div>
            <div className="orange-fruit"></div>
            <div className="orange-fruit"></div>
            <div className="orange-fruit"></div>
            <div className="orange-fruit"></div>
            <div className="orange-fruit"></div>
          </div>
          <div className="tree-trunk"></div>
        </div>
      </div>

      <div className="footer-text">
        <span className="date">Planted May '23</span>
        <span className="date">Tended Apr '25</span>
      </div>
    </div>
  );
}
