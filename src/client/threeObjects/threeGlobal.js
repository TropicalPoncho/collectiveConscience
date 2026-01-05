import * as ThreeModule from 'three';

// Devuelve siempre la instancia vigente de THREE. Si A-Frame ya cargó, usa window.THREE; si no, usa el módulo.
export function resolveTHREE() {
	if (typeof globalThis !== 'undefined' && globalThis.THREE) {
		return globalThis.THREE;
	}
	return ThreeModule;
}

// Mantén un export con el valor inmediato (para compatibilidad), pero preferir resolveTHREE() en los consumidores.
export const THREE = resolveTHREE();
export * from 'three';
