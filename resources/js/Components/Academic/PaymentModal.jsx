/**
 * PaymentModal
 *
 * Modal para que estudiantes registren un nuevo pago o visualicen
 * detalles de un pago existente. Contiene formulario para captura de
 * datos y comprobante, o vista en lectura para pagos ya enviados.
 *
 * @component
 *
 * @param {boolean}   [show=false]      - Controla la visibilidad del modal.
 * @param {Function}  onClose           - Callback invocado al cerrar el modal.
 * @param {Object}    [selectedPayment] - Pago a visualizar (si existe, modo lectura).
 * @param {Array}     serviceTypes      - Listado de conceptos de pago: [{ value, label }].
 * @param {Object}    formData          - Estado del formulario (react-hook-form o useForm).
 * @param {Function}  setFormData       - Setter del estado del formulario.
 * @param {Array}     errors            - Errores de validación del formulario.
 * @param {Function}  onSubmit          - Callback al enviar el formulario.
 * @param {boolean}   isProcessing      - Estado de carga del envío.
 * @param {Function}  onFileChange      - Callback para cambios en input file.
 * @param {Function}  onDelete          - Callback para eliminar un pago.
 * @param {Function}  onDownload        - Callback para descargar comprobante.
 * @param {Function}  getStatusStyle    - Función que retorna clases Tailwind según estado.
 * @param {Function}  getStatusIcon     - Función que retorna icono según estado.
 * @param {Function}  getStatusLabel    - Función que retorna etiqueta legible del estado.
 * @param {Function}  getTypeLabel      - Función que retorna etiqueta legible del tipo.
 * @param {Function}  formatCurrency    - Función que formatea moneda.
 *
 * @example
 * <PaymentModal
 *   show={isPaymentModalOpen}
 *   onClose={() => setIsPaymentModalOpen(false)}
 *   selectedPayment={selectedPayment}
 *   serviceTypes={serviceTypes}
 *   formData={formData}
 *   setFormData={setFormData}
 *   errors={errors}
 *   onSubmit={submitPayment}
 *   isProcessing={isPosting}
 *   onFileChange={handleFileChange}
 *   onDelete={handleDelete}
 *   onDownload={handleDownload}
 *   getStatusStyle={getStatusStyle}
 *   getStatusIcon={getStatusIcon}
 *   getStatusLabel={getStatusLabel}
 *   getTypeLabel={getTypeLabel}
 *   formatCurrency={formatCurrency}
 * />
 */

import FormModal from '@/Components/Forms/FormModal';
import { FieldError } from '@/Components/ui/field';
import SelectForm from '@/Components/Forms/SelectForm';
import FileInputForm from '@/Components/Forms/FileInputForm';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { CreditCard, Download, Trash2 } from 'lucide-react';

export default function PaymentModal({
    show = false,
    onClose,
    selectedPayment = null,
    serviceTypes = [],
    formData,
    setFormData,
    errors,
    onSubmit,
    isProcessing,
    onFileChange,
    onDelete,
    onDownload,
    getStatusStyle,
    getStatusIcon,
    getStatusLabel,
    getTypeLabel,
    formatCurrency,
}) {
    const title = selectedPayment ? 'Detalles del Pago' : 'Nuevo Pago';

    return (
        <FormModal title={title} show={show} onClose={onClose}>
            <form onSubmit={onSubmit} className="space-y-6">
                {/* Encabezado con ícono y estado (si aplica) */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    </div>
                    {selectedPayment && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusStyle(selectedPayment.status)}`}>
                            {getStatusIcon(selectedPayment.status)}
                            {getStatusLabel(selectedPayment.status)}
                        </span>
                    )}
                </div>

                {/* Contenido del modal */}
                {selectedPayment ? (
                    // MODO LECTURA: Detalles del pago
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <p className="text-5xl font-black text-gray-900 tracking-tight">{formatCurrency(selectedPayment.amount)}</p>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="text-gray-500 font-medium">Concepto</span>
                            <span className="font-bold text-gray-900">{getTypeLabel(selectedPayment.type)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="text-gray-500 font-medium">Ref / Folio</span>
                            <span className="font-bold text-gray-900">{selectedPayment.reference_number || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="text-gray-500 font-medium">Fecha</span>
                            <span className="font-bold text-gray-900">{new Date(selectedPayment.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="text-gray-500 font-medium">Comprobante</span>
                            <button type="button" onClick={() => onDownload(selectedPayment.id)} className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1">
                                <Download className="w-4 h-4" /> Descargar
                            </button>
                        </div>
                        {selectedPayment.comments && (
                            <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-xl text-sm">
                                <p className="font-bold mb-1">Comentarios de revisión:</p>
                                <p>{selectedPayment.comments}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    // MODO FORMULARIO: Nuevo pago
                    <div className="space-y-5">
                        <div>
                            <SelectForm
                                label="Concepto"
                                selectId="type"
                                options={serviceTypes}
                                value={formData.type}
                                onValueChange={(val) => setFormData('type', val)}
                                required
                            />
                            <FieldError>{errors.type}</FieldError>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                Monto a Pagar <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition"
                                value={formData.amount}
                                onChange={(e) => setFormData('amount', e.target.value)}
                            />
                            <FieldError>{errors.amount}</FieldError>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Número de Referencia / Folio</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition"
                                value={formData.reference_number}
                                onChange={(e) => setFormData('reference_number', e.target.value)}
                            />
                            <FieldError>{errors.reference_number}</FieldError>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Descripción o Notas Adicionales</label>
                            <textarea
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition"
                                rows={2}
                                value={formData.description}
                                onChange={(e) => setFormData('description', e.target.value)}
                            />
                            <FieldError>{errors.description}</FieldError>
                        </div>

                        <div>
                            <FileInputForm
                                name="file"
                                label="Comprobante de Pago"
                                onChange={onFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                                maxFileSizeMb={5}
                                required
                            />
                            <FieldError>{errors.file}</FieldError>
                        </div>
                    </div>
                )}

                {/* Pie del modal con botones de acción */}
                <div className="border-t border-gray-100 pt-4 flex justify-between gap-3">
                    <div>
                        {selectedPayment && (
                            <button
                                type="button"
                                onClick={() => onDelete(selectedPayment.id)}
                                className="text-red-600 hover:text-red-800 flex items-center font-bold text-sm px-3 py-2 transition"
                            >
                                <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <SecondaryButton onClick={onClose}>
                            {selectedPayment ? 'Cerrar' : 'Cancelar'}
                        </SecondaryButton>
                        {!selectedPayment && (
                            <PrimaryButton
                                type="submit"
                                disabled={isProcessing}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Subir Pago
                            </PrimaryButton>
                        )}
                    </div>
                </div>
            </form>
        </FormModal>
    );
}
