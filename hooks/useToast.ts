'use client';

import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export function useToast() {
  const notifySuccess = (message: string) => {
    toast.success(message);
  };

  const notifyError = (message: string) => {
    toast.error(message);
  };

  const confirmAction = async (options: {
    title: string;
    text: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
  }): Promise<boolean> => {
    const result = await Swal.fire({
      title: options.title,
      text: options.text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText || 'Confirm',
      cancelButtonText: options.cancelButtonText || 'Cancel',
      background: '#1a1e24',
      color: '#f4f3ee',
      confirmButtonColor: '#ff6600',
      cancelButtonColor: '#2b323c',
      customClass: {
        popup: 'border border-[#2b323c]',
      },
    });

    return result.isConfirmed;
  };

  return {
    notifySuccess,
    notifyError,
    confirmAction,
  };
}
