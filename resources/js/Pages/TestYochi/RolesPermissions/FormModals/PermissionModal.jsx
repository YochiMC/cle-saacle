import FormModal from "@/Components/Forms/FormModal"

export default function PermissionModal({title, show, onClose}){
    return(
        <FormModal
            title={title}
            show={show}
            onClose={onClose}
        >
            <form>
                
            </form>
        </FormModal>
    )
}