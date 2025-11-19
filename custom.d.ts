// global.d.ts o custom.d.ts

// Declara el módulo para silenciar el error TS7016
declare module 'troika-three-text' {
    export function configureTextBuilder(options: { 
        workerFactory: null | undefined;
        disableSDFGeneration?: boolean; // ✨ AÑADIR ESTA LÍNEA
    }): void;
}