import React, { createContext, useContext, useState } from "react";

const SignUpContext = createContext();

export const SignUpProvider = ({ children }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <SignUpContext.Provider value={{ isSignUp, setIsSignUp }}>
      {children}
    </SignUpContext.Provider>
  );
};

export const useSignUp = () => {
  return useContext(SignUpContext);
};
