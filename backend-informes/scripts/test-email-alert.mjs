#!/usr/bin/env node
/**
 * Test para verificar que las alertas de email funcionan correctamente
 * Uso: NODE_ENV=production node scripts/test-email-alert.mjs
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const logger = {
  info: (msg, data) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg, data) => console.error(`[ERROR] ${msg}`, data || ''),
};

async function testEmailAlert() {
  try {
    logger.info('Test de Alerta por Email - SES');
    logger.info('Credenciales cargadas:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? 'configurado' : 'NO CONFIGURADO',
      from: process.env.SMTP_FROM,
      to: process.env.COMMUNICATION_ALERT_EMAIL,
    });

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      throw new Error('Credenciales SMTP no configuradas en .env');
    }

    // Crear transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    logger.info('Transporter creado, verificando conexión...');

    // Verificar conexión (opcional pero útil)
    await transporter.verify();
    logger.info('✓ Conexión SMTP verificada');

    // Crear email de prueba
    const testReport = {
      timestamp: new Date().toISOString(),
      eventCount: 0,
      table: 'ActividadDiaria2026-03',
      message: 'Sin comunicación - solo 0 eventos en últimos 10 segundos',
      status: 'CRITICAL',
    };

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.COMMUNICATION_ALERT_EMAIL,
      subject: '🔴 ALERTA CRÍTICA (TEST): Sin comunicación',
      html: `
        <h2 style="color: #d32f2f;">⚠️ EMAIL DE PRUEBA - ALERTA CRÍTICA</h2>
        <p style="color: #ff9800; font-weight: bold;">Este es un mensaje de prueba para verificar que las alertas funcionan.</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Hora:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${new Date(testReport.timestamp).toLocaleString('es-AR')}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Eventos (últimos 10 seg):</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #d32f2f;"><strong>${testReport.eventCount}</strong></td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Tabla:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${testReport.table}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Mensaje:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${testReport.message}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; color: #666;">Email de prueba generado por: scripts/test-email-alert.mjs</p>
      `,
    };

    logger.info('Enviando email de prueba...');
    const result = await transporter.sendMail(mailOptions);
    logger.info('✓ Email enviado exitosamente', {
      messageId: result.messageId,
      to: process.env.COMMUNICATION_ALERT_EMAIL,
    });

    console.log('\n✅ TEST COMPLETADO: Email de prueba enviado');
    console.log('Revisa tu bandeja de entrada en:', process.env.COMMUNICATION_ALERT_EMAIL);

    process.exit(0);
  } catch (error) {
    logger.error('❌ TEST FALLIDO:', {
      message: error.message,
      code: error.code,
    });
    console.error('\nDetalles completos:', error);
    process.exit(1);
  }
}

testEmailAlert();
