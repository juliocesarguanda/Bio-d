const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
              

const ExcelJS = require('exceljs'); // Añadir al inicio con los demás requires


router.get('/', async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        
        // 1. Exportar Tabla Principal: Misceláneos
        const mainSheet = workbook.addWorksheet('Misceláneos');
        const mainData = await conexion(`
            SELECT m.*, 
                   c.nombre as categoria_nombre,
                   p.nombre as proveedor_nombre,
                   a.nombre as almacen_nombre
            FROM miscelaneo m
            LEFT JOIN categorias c ON m.categoria_id = c.id
            LEFT JOIN proveedores p ON m.proveedor_id = p.id
            LEFT JOIN almacenes a ON m.almacen_id = a.id
        `);
        
        mainSheet.columns = [
            { header: 'ID Sistema', key: 'id', hidden: true },
            { header: 'Código', key: 'codigo', width: 15 },
            { header: 'Nombre', key: 'nombre', width: 30 },
            { header: 'Categoría', key: 'categoria_nombre', width: 20 },
            { header: 'Proveedor', key: 'proveedor_nombre', width: 20 },
            { header: 'Almacén', key: 'almacen_nombre', width: 15 },
            { header: 'Precio', key: 'precio', width: 15, style: { numFmt: '"$"#,##0.00' } },
            { header: 'Stock', key: 'stock', width: 10 },
            { header: 'Estado', key: 'estatus', width: 15 }
        ];
        
        mainSheet.addRows(mainData.respuesta);

        // 2. Hoja de Catálogos: Categorías
        const categoriasSheet = workbook.addWorksheet('Categorías');
        const categoriasData = await conexion('SELECT * FROM categorias');
        
        categoriasSheet.columns = [
            { header: 'ID Sistema', key: 'id', hidden: true },
            { header: 'Código', key: 'codigo', width: 15 },
            { header: 'Nombre', key: 'nombre', width: 30 },
            { header: 'Descripción', key: 'descripcion', width: 40 }
        ];
        
        categoriasSheet.addRows(categoriasData.respuesta);

        // 3. Hoja de Proveedores
        const proveedoresSheet = workbook.addWorksheet('Proveedores');
        const proveedoresData = await conexion(`
            SELECT p.*, 
                   COUNT(m.id) as total_productos,
                   MAX(m.ultima_actualizacion) as ultima_compra
            FROM proveedores p
            LEFT JOIN miscelaneo m ON p.id = m.proveedor_id
            GROUP BY p.id
        `);
        
        proveedoresSheet.columns = [
            { header: 'ID Sistema', key: 'id', hidden: true },
            { header: 'Código', key: 'codigo', width: 15 },
            { header: 'Nombre', key: 'nombre', width: 30 },
            { header: 'Teléfono', key: 'telefono', width: 15 },
            { header: 'Productos Registrados', key: 'total_productos', width: 20 },
            { header: 'Última Compra', key: 'ultima_compra', width: 20, style: { numFmt: 'dd/mm/yyyy hh:mm' } }
        ];
        
        proveedoresSheet.addRows(proveedoresData.respuesta);

        // 4. Hoja de Almacenes
        const almacenesSheet = workbook.addWorksheet('Almacenes');
        const almacenesData = await conexion(`
            SELECT a.*, 
                   SUM(m.stock) as stock_total,
                   COUNT(m.id) as productos_registrados
            FROM almacenes a
            LEFT JOIN miscelaneo m ON a.id = m.almacen_id
            GROUP BY a.id
        `);
        
        almacenesSheet.columns = [
            { header: 'ID Sistema', key: 'id', hidden: true },
            { header: 'Código', key: 'codigo', width: 15 },
            { header: 'Nombre', key: 'nombre', width: 30 },
            { header: 'Ubicación', key: 'ubicacion', width: 40 },
            { header: 'Stock Total', key: 'stock_total', width: 15 },
            { header: 'Productos', key: 'productos_registrados', width: 15 }
        ];
        
        almacenesSheet.addRows(almacenesData.respuesta);

        // 5. Hoja de Relaciones
        const relacionesSheet = workbook.addWorksheet('Relaciones');
        relacionesSheet.columns = [
            { header: 'Tabla', width: 20 },
            { header: 'Campo', width: 20 },
            { header: 'Relacionado con', width: 30 },
            { header: 'Tipo', width: 15 }
        ];
        
        relacionesSheet.addRows([
            ['Misceláneos', 'categoria_id', 'Categorías.id', 'Foreign Key'],
            ['Misceláneos', 'proveedor_id', 'Proveedores.id', 'Foreign Key'],
            ['Misceláneos', 'almacen_id', 'Almacenes.id', 'Foreign Key']
        ]);

        // 6. Configurar Validaciones Cruzadas
        addCrossSheetValidations(workbook);

        // Generar archivo
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="sistema-completo.xlsx"');
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        res.status(500).json({ estatus: 'error', respuesta: error.message });
    }
});

// Función para validaciones entre hojas
function addCrossSheetValidations(workbook) {
    // Validación para Categorías
    const categoriaValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['INDIRECT("Categorías!$C$2:$C$1048576")']
    };

    // Validación para Proveedores
    const proveedorValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['INDIRECT("Proveedores!$C$2:$C$1048576")']
    };

    // Aplicar validaciones a la hoja principal
    const mainSheet = workbook.getWorksheet('Misceláneos');
    mainSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Saltar cabecera
        
        row.getCell('categoria_nombre').dataValidation = categoriaValidation;
        row.getCell('proveedor_nombre').dataValidation = proveedorValidation;
    });
}

module.exports = router;
