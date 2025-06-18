import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    if (storedName && storedEmail) {
      setUsername(storedName);
      setEmail(storedEmail);
    }
    setLoading(false);
  }, []);

  return (
    <UserContext.Provider value={{ username, email, loading }}>
      {children}
    </UserContext.Provider>
  );
};
