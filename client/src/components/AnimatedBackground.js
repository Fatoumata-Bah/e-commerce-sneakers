import React from 'react';
import { Box } from '@mui/material';

const AnimatedBackground = () => {
  return (
    <>
      {/* Particules flottantes d'arrière-plan */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: -1,
          overflow: 'hidden'
        }}
      >
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: { xs: 2, md: 3 },
              height: { xs: 2, md: 3 },
              borderRadius: '50%',
              backgroundColor: `rgba(255,107,53,${0.1 + (i % 3) * 0.05})`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `floatParticle ${5 + i * 0.8}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </Box>

      {/* CSS Animations globales */}
      <style jsx global>{`
        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-40px) translateX(-5px);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-20px) translateX(-10px);
            opacity: 0.7;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(255, 215, 0, 0);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes sneakerHover {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-5px) rotate(1deg);
          }
          50% {
            transform: translateY(-10px) rotate(0deg);
          }
          75% {
            transform: translateY(-5px) rotate(-1deg);
          }
        }

        @keyframes particle0 {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-15px) scale(1.2);
            opacity: 0.8;
          }
        }

        @keyframes particle1 {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.4;
          }
          33% {
            transform: translateY(-10px) translateX(5px);
            opacity: 0.7;
          }
          66% {
            transform: translateY(-20px) translateX(-5px);
            opacity: 0.5;
          }
        }

        @keyframes particle2 {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.3) rotate(180deg);
            opacity: 0.6;
          }
        }

        /* Amélioration des transitions pour tous les éléments interactifs */
        .MuiCard-root {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .MuiButton-root {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .MuiChip-root {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* Effet de brillance subtil sur les cartes */
        .MuiCard-root:hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: shine 0.8s ease-in-out;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes shine {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        /* Scroll fluide pour toute la page */
        html {
          scroll-behavior: smooth;
        }

        /* Animation d'apparition pour les éléments au scroll */
        .fade-in-on-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease-out;
        }

        .fade-in-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </>
  );
};

export default AnimatedBackground;
