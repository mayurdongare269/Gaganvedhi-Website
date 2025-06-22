// import React from 'react';
// import Lottie from 'lottie-react';
// import animationData from '../assets/animation.json';

// const Animation = () => {
//   return (
//     <div className="flex justify-center items-center">
//       <Lottie 
//         animationData={animationData} 
//         loop={true} 
//         autoplay={true}
//         style={{ width: 300, height: 300 }} 
//       />
//     </div>
//   );
// };

// export default Animation;


// src/components/Animation.jsx
// src/components/Animation.jsx
import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/amimation3.json';

const Animation = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',         // Center horizontally
        alignItems: 'center',             // Center vertically
        height: '100vh',
        background: 'radial-gradient(circle at 50% 20%, #1a1a2e, #000)', // Dark space feel
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Stars effect (simulated with tiny dots using pseudo-stars) */}
      <div className="absolute inset-0 z-0">
        <div className="stars-small" />
        <div className="stars-medium" />
        <div className="stars-large" />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-black z-10"></div>

      {/* Lottie Animation */}
      <div className="z-20">
        <Lottie
          animationData={animationData}
          loop
          style={{
            width: '280px',
            height: '280px',
          }}
        />
        <p style={{ color: '#bbb', textAlign: 'center', marginTop: '1rem', fontSize: '1.1rem' }}>
          Preparing the universe...
        </p>
      </div>
    </div>
  );
};

export default Animation;

