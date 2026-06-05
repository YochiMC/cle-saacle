import { Head } from "@inertiajs/react";
import { Shield, ShieldCheck, ShieldX, GraduationCap, BookOpen, Award, CheckCircle } from "lucide-react";

export default function Verify({ valid, record }) {
    return (
        <>
            <Head title="Constancia de Acreditación — CLE ITL" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html, body { font-family: 'Inter', sans-serif; background: #f5f7fa; min-height: 100vh; }
                .page {
                    min-height: 100vh;
                    background: linear-gradient(to bottom, #e8f0f7 0%, #f5f7fa 50%, #e8f0f7 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    position: relative;
                }
                .container {
                    width: 100%;
                    max-width: 900px;
                }
                /* CONSTANCIA VÁLIDA */
                .constancia-wrapper {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    align-items: stretch;
                }
                .constancia-main {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);
                    overflow: hidden;
                }
                /* HEADER TEAL */
                .constancia-header {
                    background: linear-gradient(135deg, #16a085 0%, #1abc9c 100%);
                    padding: 40px 30px;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    min-height: 280px;
                    position: relative;
                    overflow: hidden;
                }
                .constancia-header::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: 
                        radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(0,0,0,0.05) 0%, transparent 50%);
                    pointer-events: none;
                }
                .constancia-header > * { position: relative; z-index: 1; }
                .constancia-icon {
                    width: 80px;
                    height: 80px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    border: 3px solid rgba(255,255,255,0.4);
                }
                /* BODY CONSTANCIA */
                .constancia-body {
                    padding: 40px;
                }
                .section-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: #1abc9c;
                    font-weight: 700;
                    margin-bottom: 8px;
                    display: block;
                }
                .section-value {
                    font-size: 24px;
                    font-family: 'Playfair Display', serif;
                    font-weight: 700;
                    color: #2c3e50;
                    margin-bottom: 20px;
                    line-height: 1.2;
                }
                .two-columns {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin: 30px 0;
                }
                .data-item {
                    border-bottom: 1px solid #ecf0f1;
                    padding-bottom: 15px;
                    margin-bottom: 15px;
                }
                .data-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                    margin-bottom: 0;
                }
                .data-label {
                    font-size: 10px;
                    text-transform: uppercase;
                    color: #7f8c8d;
                    font-weight: 600;
                    letter-spacing: 0.8px;
                    margin-bottom: 4px;
                }
                .data-value {
                    font-size: 16px;
                    font-weight: 600;
                    color: #2c3e50;
                }
                .data-value.highlight {
                    font-size: 28px;
                    color: #1abc9c;
                    font-family: 'Playfair Display', serif;
                }
                .divider-section {
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #1abc9c, transparent);
                    margin: 30px 0;
                }
                .validation-box {
                    background: linear-gradient(135deg, rgba(26,188,156,0.08) 0%, rgba(22,160,133,0.08) 100%);
                    border: 1px solid rgba(26,188,156,0.3);
                    border-radius: 8px;
                    padding: 16px;
                    margin-top: 20px;
                }
                .validation-label {
                    font-size: 9px;
                    text-transform: uppercase;
                    color: #16a085;
                    font-weight: 700;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }
                .validation-code {
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    color: #2c3e50;
                    word-break: break-all;
                    letter-spacing: 1px;
                    font-weight: 500;
                }
                /* SIDE PANEL */
                .constancia-side {
                    background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);
                    border-radius: 12px;
                    padding: 30px;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    box-shadow: 0 10px 40px rgba(26,188,156,0.2);
                }
                .side-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.2);
                }
                .side-title {
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    font-weight: 700;
                    margin-bottom: 10px;
                }
                .side-subtitle {
                    font-size: 11px;
                    opacity: 0.9;
                    line-height: 1.5;
                }
                .key-info {
                    display: flex;
                    flex-direction: column;
                    gap: 25px;
                    margin-bottom: 30px;
                }
                .key-item {
                    text-align: center;
                }
                .key-label {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    opacity: 0.85;
                    margin-bottom: 6px;
                    display: block;
                }
                .key-value {
                    font-size: 28px;
                    font-family: 'Playfair Display', serif;
                    font-weight: 700;
                }
                .footer-logos {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255,255,255,0.2);
                }
                .logo-placeholder {
                    display: inline-block;
                    width: 100%;
                    max-width: 150px;
                    height: 40px;
                    background: rgba(255,255,255,0.15);
                    border-radius: 6px;
                    margin-bottom: 10px;
                    font-size: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px dashed rgba(255,255,255,0.3);
                }
                .footer-text {
                    font-size: 9px;
                    opacity: 0.85;
                    margin-top: 10px;
                }
                /* INVALID STATE */
                .error-container {
                    background: white;
                    border-radius: 12px;
                    padding: 60px 40px;
                    text-align: center;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.12);
                    max-width: 500px;
                }
                .error-icon {
                    width: 80px;
                    height: 80px;
                    background: #fee;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    border: 2px solid #f87171;
                }
                .error-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #ef4444;
                    margin-bottom: 10px;
                    font-family: 'Playfair Display', serif;
                }
                .error-text {
                    color: #6b7280;
                    font-size: 14px;
                    line-height: 1.6;
                    margin-bottom: 20px;
                }
                .contact-info {
                    background: #f9fafb;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #4b5563;
                }
                .check-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    background: rgba(26,188,156,0.2);
                    border-radius: 50%;
                    margin-right: 8px;
                }
                @media (max-width: 768px) {
                    .constancia-wrapper { grid-template-columns: 1fr; }
                    .two-columns { grid-template-columns: 1fr; gap: 15px; }
                    .constancia-body { padding: 30px 20px; }
                    .constancia-header { padding: 30px 20px; min-height: 200px; }
                    .section-value { font-size: 18px; }
                }
            `}</style>

            <div className="page">
                <div className="container">

                {valid && record ? (
                    <div className="constancia-wrapper">
                        {/* MAIN CONTENT */}
                        <div className="constancia-main">
                            {/* HEADER TEAL */}
                            <div className="constancia-header">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '15px' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px dashed rgba(255,255,255,0.3)',
                                        fontSize: '24px'
                                    }}>
                                        📚
                                    </div>
                                    <div className="constancia-icon">
                                        <CheckCircle size={40} color="white" strokeWidth={1.5} />
                                    </div>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px dashed rgba(255,255,255,0.3)',
                                        fontSize: '24px'
                                    }}>
                                        🎓
                                    </div>
                                </div>
                                <div className="section-label">Constancia de Acreditación</div>
                                <div className="section-value" style={{ marginBottom: 0 }}>
                                    {record.student_name}
                                </div>
                            </div>

                            {/* BODY */}
                            <div className="constancia-body">
                                <div style={{ marginBottom: 25 }}>
                                    <span className="section-label">Curso</span>
                                    <div style={{ fontSize: "18px", fontWeight: 600, color: "#2c3e50" }}>
                                        {record.carrera || "Acreditación de Inglés"}
                                    </div>
                                </div>

                                <div className="two-columns">
                                    <div>
                                        <div className="data-item">
                                            <div className="data-label">% Avance</div>
                                            <div className="data-value highlight">{record.progress || 0}%</div>
                                        </div>
                                        <div className="data-item">
                                            <div className="data-label">Número de Control</div>
                                            <div className="data-value">{record.num_control}</div>
                                        </div>
                                        <div className="data-item">
                                            <div className="data-label">Tipo de Acreditación</div>
                                            <div className="data-value" style={{ fontSize: "13px" }}>
                                                {record.certificate_type === 'cursos'
                                                    ? 'Programa Institucional'
                                                    : record.certificate_type === 'cuatro-habilidades'
                                                    ? '4 Habilidades'
                                                    : 'Examen de Acreditación'}
                                            </div>
                                        </div>
                                        <div className="data-item">
                                            <div className="data-label">Periodo</div>
                                            <div className="data-value">{record.periodo || 'No especificado'}</div>
                                        </div>
                                    </div>
                                    <div>
                                        {record.promedio ? (
                                            <div className="data-item">
                                                <div className="data-label">Puntaje / Calificación</div>
                                                <div className="data-value highlight">{record.promedio}</div>
                                            </div>
                                        ) : record.nivel ? (
                                            <div className="data-item">
                                                <div className="data-label">Nivel Certificado (MCER)</div>
                                                <div className="data-value highlight">{record.nivel}</div>
                                            </div>
                                        ) : null}
                                        <div className="data-item">
                                            <div className="data-label">Fecha de Emisión</div>
                                            <div className="data-value">{record.issued_at}</div>
                                        </div>
                                        {record.enrollment_date && (
                                            <div className="data-item">
                                                <div className="data-label">Fecha y hora de inscripción</div>
                                                <div className="data-value" style={{ fontSize: "13px" }}>{record.enrollment_date}</div>
                                            </div>
                                        )}
                                        <div className="data-item">
                                            <div className="data-label">Oficio No.</div>
                                            <div className="data-value">{record.no_oficio || '—'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="divider-section" />

                                <div className="validation-box">
                                    <div className="validation-label">Código Único de Validación</div>
                                    <div className="validation-code">{record.validation_code}</div>
                                </div>
                            </div>
                        </div>

                        {/* SIDE PANEL */}
                        <div className="constancia-side">
                            <div className="side-header">
                                <div className="side-title">✓ Constancia Auténtica</div>
                                <div className="side-subtitle">
                                    Este documento fue emitido oficialmente por la Coordinación de Lenguas Extranjeras del ITL.
                                </div>
                            </div>

                            <div className="key-info">
                                <div className="key-item">
                                    <div className="key-label">% Avance</div>
                                    <div className="key-value">
                                        {record.progress}%
                                    </div>
                                </div>
                                <div className="key-item">
                                    <div className="key-label">Puntaje / Nivel</div>
                                    <div className="key-value">
                                        {record.promedio || record.nivel || '—'}
                                    </div>
                                </div>
                                <div className="key-item">
                                    <div className="key-label">Estado</div>
                                    <div className="key-value" style={{ color: "#2de3c3", fontSize: "20px" }}>
                                        <span className="check-icon">
                                            <CheckCircle size={16} />
                                        </span>
                                        Válida
                                    </div>
                                </div>
                            </div>

                            <div className="footer-logos">
                                <div style={{ fontSize: "11px", marginBottom: "12px", fontWeight: 600 }}>
                                    Institución Emisora
                                </div>
                                <div className="logo-placeholder">
                                    ITL
                                </div>
                                <div className="footer-text">
                                    Instituto Tecnológico de León
                                </div>
                                <div className="footer-text" style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                                    📧 tecleon@leon.tecnm.mx
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="error-container">
                        <div className="error-icon">
                            <ShieldX size={40} color="#ef4444" strokeWidth={2} />
                        </div>
                        <div className="error-title">Constancia No Válida</div>
                        <div className="error-text">
                            Este código QR no corresponde a ninguna constancia registrada en nuestro sistema.
                            Puede ser una constancia falsificada o el código es incorrecto.
                        </div>
                        <div className="contact-info">
                            <div style={{ fontWeight: 600, marginBottom: "10px" }}>
                                Si crees que esto es un error, contacta:
                            </div>
                            <div>📧 tecleon@leon.tecnm.mx</div>
                            <div>📞 477 7105200</div>
                            <div style={{ marginTop: "10px", fontSize: "11px", opacity: 0.8 }}>
                                Coordinación de Lenguas Extranjeras — ITL
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </>
    );
}
