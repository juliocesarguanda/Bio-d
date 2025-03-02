function iniciarLectorQR(botonQR, overlayQR, contenedorQR) {
    let stream;

    botonQR.addEventListener('click', async () => {
        const video = document.getElementById('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = 300;
        canvas.height = 200;
        canvas.style.display = 'none';

        contenedorQR.appendChild(canvas);

        try {
            // Solicitar acceso a la cámara
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            video.srcObject = stream;
            video.play();

            overlayQR.style.display = 'flex';

            // Leer el QR
            const scanQRCode = () => {
                if (video.paused || video.ended) return;

                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    console.log(code)
                    resultadoHistorial(code.data);

                    video.pause();
                    stream.getTracks().forEach(track => track.stop()); // Detener la cámara
                    overlayQR.style.display = 'none';
                } else {
                    requestAnimationFrame(scanQRCode);
                }
            };
            requestAnimationFrame(scanQRCode);
        } catch (error) {
            console.error('Error accessing the camera: ', error);
            alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
        }
    });

    // Cerrar el lector al hacer clic en el fondo oscuro o en el botón de cancelar
    overlayQR.addEventListener('click', (e) => {
        if (e.target.id === 'overlayQR' || e.target.id === 'cancelButton') {
            if (stream) {
                stream.getTracks().forEach(track => track.stop()); // Detener la cámara
            }
            overlayQR.style.display = 'none';
        }
    });
}

// Inicializar el lector de QR
const botonQR = document.getElementById('startButton');
const overlayQR = document.getElementById('overlayQR');
const contenedorQR = document.getElementById('videoContainer');
iniciarLectorQR(botonQR, overlayQR, contenedorQR);