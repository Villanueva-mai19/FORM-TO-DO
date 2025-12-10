import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createUser, findUserByName } from "../api/Index.jsx";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem("auth_user");
      if (raw) setUser(JSON.parse(raw));
    }
  }, []);

  const login = async (name, password, navigate) => {
    try {
      // Limpiar espacios en blanco
      const cleanName = name.trim();
      const cleanPassword = password.trim();
      
      // Buscar usuario existente
      const existing = await findUserByName(cleanName);
      
      console.log("Usuario buscado:", cleanName);
      console.log("Usuario encontrado:", existing);
      
      if (existing) {
        console.log("Contraseña ingresada:", cleanPassword);
        console.log("Contraseña guardada:", existing.password);
        console.log("¿Coinciden?:", existing.password === cleanPassword);
        console.log("Longitud contraseña ingresada:", cleanPassword.length);
        console.log("Longitud contraseña guardada:", existing.password?.length);
        
        if (existing.password !== cleanPassword) {
          toast.error("Contraseña incorrecta. Verifica que estés usando la contraseña correcta.");
          return;
        }
        setUser(existing);
        if (typeof window !== 'undefined') {
          localStorage.setItem("auth_user", JSON.stringify(existing));
        }
        toast.success(`Bienvenido ${cleanName}`);
        if (navigate) navigate("/");
      } else {
        // Nuevo registro - guardar en db.json
        const newUser = { name: cleanName, password: cleanPassword };
        const created = await createUser(newUser);
        setUser(created);
        if (typeof window !== 'undefined') {
          localStorage.setItem("auth_user", JSON.stringify(created));
        }
        toast.success(`Usuario creado: ${cleanName}`);
        if (navigate) navigate("/");
      }
    } catch (error) {
      console.error("Error en login:", error);
      toast.error("Error al procesar el login. Intenta de nuevo.");
    }
  };

  const logout = (navigate) => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("auth_user");
    }
    toast.info("Session closed");
    if (navigate) navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

