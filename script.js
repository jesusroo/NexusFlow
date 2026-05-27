(function initNexusAuthSystem() {
  // 1. Verificación de la librería de Supabase
  if (typeof _supabase === 'undefined') {
    console.error("Supabase CDN no ha cargado correctamente.");
    return;
  }

  // 2. Inicialización del cliente
  const SUPABASE_URL = "https://jesusroo.supabase.co"; // Reemplaza con tu URL real si varía
  const SUPABASE_ANON_KEY = "sb_publishable_-g-s6xqJkEGZDrwpDj9GQg_0dnF7Pyw"; // Tu clave anon
  const supabase = _supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 3. Captura de elementos del DOM
  const authForm = document.getElementById('nexus-register-form');
  const nameInput = document.getElementById('nexus-auth-name');
  const emailInput = document.getElementById('nexus-auth-email');
  const passwordInput = document.getElementById('nexus-auth-password');
  
  // Buscamos el botón de enviar dentro del formulario
  const submitBtn = authForm ? authForm.querySelector('button[type="submit"]') : null;
  const loginNavBtn = document.querySelector('a[href="#nexus-register-form"].btn-ghost'); // Botón "Iniciar sesión"

  if (!authForm || !submitBtn) {
    console.warn("No se encontró el formulario o el botón de envío.");
    return;
  }

  // 4. Estado de la aplicación: 'register' o 'login'
  let authMode = 'register'; 

  // 5. Inyectar dinámicamente el switch para cambiar de modo
  const toggleContainer = document.createElement('div');
  toggleContainer.style.textAlign = 'center';
  toggleContainer.style.marginTop = '15px';
  toggleContainer.innerHTML = `<p style="color: #a0aec0; font-size: 14px;">
    <span id="auth-toggle-text">¿Ya tienes una cuenta?</span> 
    <a href="#" id="auth-toggle-link" style="color: #3b82f6; text-decoration: underline; margin-left: 5px;">Iniciar Sesión</a>
  </p>`;
  authForm.appendChild(toggleContainer);

  const toggleLink = document.getElementById('auth-toggle-link');
  const toggleText = document.getElementById('auth-toggle-text');

  // Función para cambiar la interfaz visualmente
  function setAuthMode(mode) {
    authMode = mode;
    if (mode === 'login') {
      submitBtn.textContent = "Iniciar Sesión →";
      if (nameInput) {
        nameInput.required = false;
        nameInput.parentElement.style.display = 'none'; // Oculta el campo de Nombre
      }
      toggleText.textContent = "¿No tienes una cuenta?";
      toggleLink.textContent = "Regístrate gratis";
    } else {
      submitBtn.textContent = "Crear cuenta gratuita →";
      if (nameInput) {
        nameInput.required = true;
        nameInput.parentElement.style.display = 'block'; // Muestra el campo de Nombre
      }
      toggleText.textContent = "¿Ya tienes una cuenta?";
      toggleLink.textContent = "Iniciar Sesión";
    }
  }

  // Evento para el enlace interno del formulario
  toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    setAuthMode(authMode === 'register' ? 'login' : 'register');
  });

  // Evento para el botón "Iniciar sesión" de la barra de navegación (Navbar)
  if (loginNavBtn) {
    loginNavBtn.addEventListener('click', () => {
      setAuthMode('login');
    });
  }

  // 6. Lógica de Envío del Formulario (Submit)
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = "Procesando...";

    try {
      if (authMode === 'register') {
        // --- MODO REGISTRO ---
        // 1. Validar si el correo ya existe en la tabla
        const { data: existingUsers, error: checkError } = await supabase
          .from('usuarios')
          .select('email')
          .eq('email', email);

        if (checkError) throw checkError;

        if (existingUsers && existingUsers.length > 0) {
          alert("Error: Este correo electrónico ya se encuentra registrado.");
          submitBtn.disabled = false;
          setAuthMode('register');
          return;
        }

        // 2. Si no existe, insertar el nuevo usuario
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert([{ name, email, password }]);

        if (insertError) throw insertError;

        alert("¡Brutal! Registro completado con éxito.");
        authForm.reset();

      } else {
        // --- MODO INICIO DE SESIÓN ---
        const { data: user, error: loginError } = await supabase
          .from('usuarios')
          .select('name, password')
          .eq('email', email)
          .single(); // Esperamos un solo resultado

        if (loginError || !user) {
          alert("Error: El correo electrónico no existe.");
        } else if (user.password !== password) {
          alert("Error: Contraseña incorrecta.");
        } else {
          alert(`¡Bienvenido de nuevo, ${user.name}! Sesión iniciada con éxito.`);
          authForm.reset();
        }
      }
    } catch (err) {
      console.error(err);
      alert(`Error en el sistema: ${err.message || err}`);
    } finally {
      submitBtn.disabled = false;
      setAuthMode(authMode); // Restablece el texto del botón correspondiente
    }
  });
})();
