function whatsAppResultadoExames(v1, v2) {
    consultar('src/servicios/whatsApp/resultadoExames.php', [v1, v2])
        .done(function (response) {
            if (response == 'paciente') {

                
                    const params = [{
                        title: 'Se le eviaron los resultados al paciente por WhatsApp'
                        },
                        'success',
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
                        }]
                        const bell = new Bell(...params)
                        bell.launch()
            } else if (response == 'razon') {
                
                    const params = [{
                        title: 'Se eviaron los resultados del paciente por WhatsApp'
                        },
                        'success',
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
                        }]
                        const bell = new Bell(...params)
                        bell.launch()
            } else if (response == 'no telefono') {
                
                    const params = [{
                        title: "No se encontro telefono para enviar le los resultados por WhatsApp"
                        },
                        'info',
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
                        }]
                        const bell = new Bell(...params)
                        bell.launch()
            }


        })
        .fail(function (xhr, status, error) {
            const options = [{
                "title": "Error: " + error,
                "description": null
            }, "error", {
                "animate": true,
                "isColored": true,
                "transitionDuration": 500,
                "position": "top-right",
                "typeAnimation": "ease-in-out",
                "timeScreen": 50000,
                "expand": true
            }];
            const bell = new Bell(...options).launch();
        });
}

document.getElementById('exportarPdfWhatsAppAp').addEventListener('click', () => {
whatsAppResultadoExames(document.getElementById('dataqrHistorial').value, document.getElementById('idExamenesResultadosHistorial').value);
    });