// utils/modelUtils.ts
import { BufferAttribute, BufferGeometry, Vector3 } from 'three';

export const generateCylindricalUVs = (geometry: BufferGeometry) => {
    // ⭐ AJUSTES DE LÍMITE VERTICAL DE LA IMAGEN (Valores entre 0.0 y 1.0)
    const V_START = 0.2; 
    const V_END = 0.8;   
    const V_RANGE = V_END - V_START;

    // ⭐ AJUSTES DE LÍMITE HORIZONTAL DE LA IMAGEN
    const U_START = 0.33; 
    const U_END = 0.66;
    const U_RANGE = U_END - U_START;

    // ⭐ MARGEN CRÍTICO: Evita que los UVs toquen exactamente 0.0 o 1.0
    // Esto previene que ClampToEdgeWrapping cause bordes repetidos
    const UV_MARGIN = 0.001;

    const pos = geometry.attributes.position;
    const uvs: number[] = [];

    const center = new Vector3();
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox!;
    center.x = (bbox.min.x + bbox.max.x) / 2;
    center.y = (bbox.min.y + bbox.max.y) / 2;
    center.z = (bbox.min.z + bbox.max.z) / 2;
    
    const height = bbox.max.y - bbox.min.y;
    const minY = bbox.min.y;

    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i) - center.x;
        const y = pos.getY(i);
        const z = pos.getZ(i) - center.z;

        const u_normalized = 0.5 + Math.atan2(z, x) / (2 * Math.PI);
        const v_normalized = (y - minY) / height;

        const u_scaled_angle = (u_normalized - U_START) / U_RANGE;
        const v_scaled_height = (v_normalized - V_START) / V_RANGE;

        // Aplicar clamping [0, 1]
        const u_clamped = Math.max(0, Math.min(1, v_scaled_height));
        const v_clamped = Math.max(0, Math.min(1, 1.0 - u_scaled_angle));
        
        // ⭐ SOLUCIÓN CLAVE: Mapear [0,1] a [MARGIN, 1-MARGIN]
        // Esto asegura que ningún UV toque exactamente los bordes
       const UV_MARGIN = 0.002; // puedes usar 0.005 si quieres aún más seguridad

        const u_final = UV_MARGIN + u_clamped * (1 - UV_MARGIN * 2);
        const v_final = UV_MARGIN + v_clamped * (1 - UV_MARGIN * 2);

        uvs.push(u_final, v_final);

    }

    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
    geometry.attributes.uv.needsUpdate = true;
    
    console.log('✅ UVs cilíndricos generados con margen anti-repetición');
};