// utils/modelUtils.ts
import { BufferAttribute, BufferGeometry, Vector3 } from 'three';

/**
 * Función para generar UVs cilíndricos.
 * Esta función es necesaria para modelos que no tienen UVs predefinidos, pero tienen forma cilíndrica.
 * @param geometry La geometría a la que aplicar los UVs.
 */
export const generateCylindricalUVs = (geometry: BufferGeometry) => {
    const pos = geometry.attributes.position;
    const uvs: number[] = [];

    // Encontrar el centro y la altura del modelo
    const center = new Vector3();
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox!;
    center.x = (bbox.min.x + bbox.max.x) / 2;
    center.y = (bbox.min.y + bbox.max.y) / 2;
    center.z = (bbox.min.z + bbox.max.z) / 2;
    
    const height = bbox.max.y - bbox.min.y;

    // Generar coordenadas UV para cada vértice
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i) - center.x;
        const y = pos.getY(i);
        const z = pos.getZ(i) - center.z;

        // UV horizontal (u): basado en el ángulo alrededor del eje Y
        const u = 0.5 + Math.atan2(z, x) / (2 * Math.PI);
        
        // UV vertical (v): basado en la altura
        const v = (y - bbox.min.y) / height;

        uvs.push(u, v);
    }

    // Asignar los UVs a la geometría
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
    geometry.attributes.uv.needsUpdate = true;
};