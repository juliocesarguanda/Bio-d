const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const backToLoginLink = document.getElementById('backToLoginLink');
const imageSection = document.getElementById('imageSection');
const closeBtns = document.getElementsByClassName('close');
function showNotification(title, type) {
    const params = [{
        title: title
    },
        type,
    {
        animate: true,
        isColored: true,
        screenTime: '15000',
        transitionDuration: '500',
        position: 'bottom-right',
        typeAnimation: 'fade-in',
        expand: false,
        theme: 'gradient',
        timeline: true,
        removeOn: 'click'
    }];
    const bell = new Bell(...params);
    bell.launch();
}



const images = [
    'assets/img/jpg/fondo.jpg'

];
let currentImageIndex = 0;
async function sendRequest(url, data, callback, method = 'POST', isPDF = false) {
    try {
        const respuesta = await fetch(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/${url}`,{
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: method === 'POST' ? JSON.stringify(data) : undefined
        });

        if (isPDF) {
            if (!respuesta.ok) {
                return respuesta.json().then(err => { throw new Error(err.respuesta); });
            }
            const blob = await respuesta.blob();
            callback(blob);
        } else {
            const result = await respuesta.json().catch(() => null);
            callback(result);
        }
    } catch (error) {
        callback({ estatus: 'error', respuesta: error.message });
    }
}


// Función para cambiar la imagen de fondo
function changeImage() {
    imageSection.style.opacity = '1';
    setTimeout(() => {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        imageSection.style.backgroundImage = `url('${images[currentImageIndex]}')`;
        imageSection.style.opacity = '1';
    }, 250);
}



// Establecer imagen inicial
changeImage(); 

// Enlace para recuperar contraseña
forgotPasswordLink.addEventListener('click', function () {
    imageSection.style.transform = 'translateX(-100%)';
    setTimeout(changeImage, 250); // Cambia la imagen a mitad de la transición
});

// Enlace para volver al inicio de sesión
backToLoginLink.addEventListener('click', function () {
    imageSection.style.transform = 'translateX(0)';
    setTimeout(changeImage, 250); // Cambia la imagen a mitad de la transición
});

// Convertir a mayúsculas el valor de los inputs con clase 'upperCase'
document.addEventListener('input', function (event) {
    if (event.target.tagName === 'INPUT' && event.target.classList.contains('upperCase')) {
        event.target.value = event.target.value.toUpperCase();
    }
});




// Función para alternar la visibilidad de la contraseña
function togglePassword(inputId, inputId2) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(inputId2);
    if (input.type === 'password') {
        input.type = 'text';
        icon.style.color = '#4bb4e6';
        icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
        input.type = 'password';
        icon.style.color = 'currentColor';
        icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
}

// Función para cerrar los modales
Array.from(closeBtns).forEach(btn => {
    btn.onclick = function () {
        codeModal.style.display = 'none';
        newPasswordModal.style.display = 'none';
    }
});

// Cerrar los modales al hacer clic fuera de ellos
window.onclick = function (event) {
    if (event.target == codeModal) {
        codeModal.style.display = 'none';
    }
    if (event.target == newPasswordModal) {
        newPasswordModal.style.display = 'none';
    }
}

// Efectos de hover en los logos
document.querySelectorAll('.logo').forEach(logo => {
    logo.addEventListener('mouseover', function () {
        this.style.transform = 'scale(1.05) rotate(10deg)';
    });
    logo.addEventListener('mouseout', function () {
        this.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Auto-enfoque en los campos de verificación de código
const codeInputs = document.querySelectorAll('.code-input');
codeInputs.forEach((input, index) => {
    input.addEventListener('input', function () {
        if (this.value.length === this.maxLength) {
            if (index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
        }
    });
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
            codeInputs[index - 1].focus();
        }
    });
});

// Añadir clase activa a los inputs en foco
document.querySelectorAll('.input-container input').forEach(input => {
    input.addEventListener('focus', () => {
        input.classList.add('active');
    });

    input.addEventListener('blur', () => {
        if (input.value === '') {
            input.classList.remove('active');
        }
    });
});










try {

    // Handle form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (e.target.id === "loginForm") {
                promise = sendRequest('login/login', {
                    username: e.target.username.value,
                    password: e.target.password.value
                }, resultado => {
                    if (resultado.estatus === 'éxito') {
                       window.location = 'main.html';
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                });
            }
            if (e.target.id === "recoverForm") {
                promise = sendRequest('login/recovery', {
                    username: e.target.recoverUsername.value
                }, resultado => {
                    if (resultado.estatus === 'éxito') {
                        codeModal.style.display = 'block';
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                });
            }
                        
            if (e.target.id === "codeForm") {
                
                promise = sendRequest('login/codigo', {
                    codigo: Array.from({ length: 6 }, (_, i) => e.target[`codigo${i + 1}`].value).join('')
                }, resultado => {
                    if (resultado.estatus === 'éxito') {
                        codeModal.style.display = 'none';
                        newPasswordModal.style.display = 'block';
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                });
            }
            if (e.target.id === "newPasswordForm") {
                    promise = sendRequest('login/password', {
                        newPassword: e.target.newPassword.value
                    }, resultado => {
                        if (resultado.estatus === 'éxito') {
                            showNotification(resultado.respuesta, 'success');
                            newPasswordModal.style.display = 'none';
                            imageSection.style.transform = 'translateX(0)';
                        } else {
                            showNotification(resultado.respuesta, 'info');
                        }
                    });
                }
                

            const state = {
                pending: "procesando",
                success: "procesado",
                error: "Ups. algo paso"
            }

            const bell = new Bell({
                title: "precesos"
            }, "promise", {
                position: "bottom-left"
            })

            bell.promise(promise, state);

        });
    });

} catch (error) {
}







