import { inject } from 'vue'
const swal = inject('$swal')

export function useConfirmBox() {

    function confirmBox() {

        swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        });
    }

    return { confirmBox };
}