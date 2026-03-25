import FormModal from "@/Components/Forms/FormModal"

export default function RoleModal({ title, show, onClose }) {
    return (
        <FormModal
            title={title}
            show={show}
            onClose={onClose}
        >
            <form>
                {/* Aquí irían los campos del formulario para crear/editar un rol */}
            </form>
        </FormModal>

    )
}