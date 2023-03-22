import { ref } from 'vue'
import { useToast } from "vue-toastification";

const toast = ref(useToast());

export function useFlash() {

    function flash(message, type = 'success') {

        toast.value[type](message);
    }

    function confirmAtts() {
        return {
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        };
    }

    return { flash, confirmAtts };
}