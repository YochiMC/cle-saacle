/**
 * ReviewModal
 *
 * Modal para que administradores revisen y aprueben/rechacen pagos
 * enviados por estudiantes. Permite cambiar el estado y agregar
 * comentarios de retroalimentación.
 *
 * @component
 *
 * @param {boolean}   [show=false]      - Controla la visibilidad del modal.
 * @param {Function}  onClose           - Callback invocado al cerrar el modal.
 * @param {Object}    [selectedPayment] - Pago a revisar.
 * @param {Array}     reviewOptions     - Listado de estados de revisión: [{ value, label }].
 * @param {Object}    reviewData        - Estado del formulario de revisión.
 * @param {Function}  setReviewData     - Setter del estado del formulario.
 * @param {Array}     reviewErrors      - Errores de validación.
 * @param {Function}  onSubmit          - Callback al enviar la revisión.
 * @param {boolean}   isProcessing      - Estado de carga del envío.
 * @param {Function}  onDelete          - Callback para eliminar un pago.
 * @param {Function}  onDownload        - Callback para descargar comprobante.
 * @param {Function}  getStatusStyle    - Función que retorna clases Tailwind según estado.
 * @param {Function}  getStatusIcon     - Función que retorna icono según estado.
 * @param {Function}  getStatusLabel    - Función que retorna etiqueta legible del estado.
 * @param {Function}  getTypeLabel      - Función que retorna etiqueta legible del tipo.
 * @param {Function}  formatCurrency    - Función que formatea moneda.
 *
 * @example
 * <ReviewModal
 *   show={isReviewModalOpen}
 *   onClose={() => setIsReviewModalOpen(false)}
 *   selectedPayment={selectedPayment}
 *   reviewOptions={reviewOptions}
 *   reviewData={reviewData}
 *   setReviewData={setReviewData}
 *   reviewErrors={reviewErrors}
 *   onSubmit={submitReview}
 *   isProcessing={isReviewing}
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
import PrimaryButton from '@/Components/ui/PrimaryButton';
import SecondaryButton from '@/Components/ui/SecondaryButton';
import { FileText, Trash2 } from 'lucide-react';

export default function ReviewModal({
    show = false,
    onClose,
    selectedPayment = null,
    reviewOptions = [],
    reviewData,
    setReviewData,
    reviewErrors,
    onSubmit,
    isProcessing,
    onDelete,
    onDownload,
    getStatusStyle,
    getStatusIcon,
    getStatusLabel,
    getTypeLabel,
    formatCurrency,
}) {
    return (
        <FormModal title="Aprobar o Rechazar Pago" show={show} onClose={onClose}>
            <form onSubmit={onSubmit} className="space-y-6">
                {/* Encabezado con estado actual */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-gray-900">Revisión de Pago</h3>
                    {selectedPayment && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusStyle(selectedPayment.status)}`}>
                            {getStatusIcon(selectedPayment.status)}
                            {getStatusLabel(selectedPayment.status)}
                        </span>
                    )}
                </div>

                {/* Información del pago */}
                {selectedPayment && (
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <p className="text-4xl font-black text-gray-900 tracking-tight">{formatCurrency(selectedPayment.amount)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Alumno</p>
                                <p className="font-bold text-gray-900 text-sm">{selectedPayment.student?.user?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Concepto</p>
                                <p className="font-bold text-gray-900 text-sm">{getTypeLabel(selectedPayment.type)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Referencia</p>
                                <p className="font-bold text-gray-900 text-sm">{selectedPayment.reference_number || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Comprobante</p>
                                <button
                                    type="button"
                                    onClick={() => onDownload(selectedPayment.id)}
                                    className="text-indigo-600 hover:underline font-bold flex items-center text-sm gap-1"
                                >
                                    <FileText className="w-4 h-4" /> Descargar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Campos de revisión */}
                <div className="space-y-5">
                    <div>
                        <SelectForm
                            label="Estado de Revisión"
                            selectId="status"
                            options={reviewOptions}
                            value={reviewData.status}
                            onValueChange={(val) => setReviewData('status', val)}
                            required
                        />
                        <FieldError>{reviewErrors.status}</FieldError>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Comentarios (Opcional)</label>
                        <textarea
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition"
                            rows={3}
                            placeholder="Motivo de rechazo o nota interna..."
                            value={reviewData.comments}
                            onChange={(e) => setReviewData('comments', e.target.value)}
                        />
                        <FieldError>{reviewErrors.comments}</FieldError>
                    </div>
                </div>

                {/* Pie del modal */}
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
                        <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={isProcessing}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Guardar Revisión
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </FormModal>
    );
}

