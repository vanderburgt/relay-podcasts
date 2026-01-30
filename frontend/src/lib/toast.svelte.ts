interface Toast {
	id: number;
	message: string;
	type: 'success' | 'error';
}

let toasts = $state<Toast[]>([]);
let nextId = 0;

export function getToasts() {
	return {
		get list() {
			return toasts;
		}
	};
}

export function showToast(message: string, type: 'success' | 'error' = 'success') {
	const id = nextId++;
	toasts = [...toasts, { id, message, type }];

	setTimeout(() => {
		toasts = toasts.filter((t) => t.id !== id);
	}, 3000);
}

export function dismissToast(id: number) {
	toasts = toasts.filter((t) => t.id !== id);
}
