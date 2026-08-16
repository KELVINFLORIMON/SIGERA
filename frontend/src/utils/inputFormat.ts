/**
 * inputFormat.ts
 * Utilidad central para formatear y estandarizar inputs de texto
 * según el contexto/tipo de campo en SIGERA.
 */

export type InputFormatType =
  | 'codigo'        // MAYÚSCULAS, sin espacios, solo alfanumérico y guiones
  | 'nombre'        // Title Case: Primera letra de cada palabra en mayúscula
  | 'abreviatura'   // Title Case con punto opcional al final
  | 'email'         // lowercase, sin espacios
  | 'descripcion'   // Sentence case: Solo primera letra en mayúscula
  | 'observacion'   // Sentence case
  | 'telefono'      // Solo números, guiones y paréntesis
  | 'cedula'        // Solo números y guiones
  | 'none';         // Sin transformación

/**
 * Aplica el formato correspondiente al valor según el tipo de campo.
 */
export function formatInput(value: string, type: InputFormatType): string {
  if (!value) return value;

  switch (type) {
    case 'codigo':
      // MAYÚSCULAS, eliminar caracteres no válidos (solo letras, números, guiones)
      return value.toUpperCase().replace(/[^A-Z0-9\-_]/g, '');

    case 'nombre':
      // Title Case: primera letra de cada palabra en mayúscula
      return toTitleCase(value);

    case 'abreviatura':
      // Title Case
      return toTitleCase(value);

    case 'email':
      // lowercase y sin espacios
      return value.toLowerCase().replace(/\s/g, '');

    case 'descripcion':
    case 'observacion':
      // Sentence case: solo la primera letra en mayúscula, resto libre
      return toSentenceCase(value);

    case 'telefono':
      // Solo números, guiones y paréntesis
      return value.replace(/[^0-9\-\(\)\+\s]/g, '');

    case 'cedula':
      // Solo números (sin guiones)
      return value.replace(/[^0-9]/g, '');

    case 'none':
    default:
      return value;
  }
}

/**
 * Convierte texto a Title Case.
 * Ejemplo: "lengua española" → "Lengua Española"
 * Respeta palabras conectoras pequeñas (y, de, del, la, el, las, los, en, a)
 * que van en minúscula excepto al inicio.
 */
function toTitleCase(value: string): string {
  const minorWords = new Set(['y', 'e', 'de', 'del', 'la', 'el', 'las', 'los', 'en', 'a', 'o', 'u', 'con', 'por', 'para', 'sin']);
  return value
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (!word) return word;
      // Primera palabra siempre en mayúscula
      if (index === 0 || !minorWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
}

/**
 * Convierte texto a Sentence case.
 * Ejemplo: "ESTA ES UNA OBSERVACION" → "Esta es una observacion"
 */
function toSentenceCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Hook-like helper para usar en onChange de inputs React.
 * Devuelve el manejador de onChange con formato aplicado.
 *
 * Uso:
 *   onChange={createFormatHandler('codigo', (val) => setFormData({...formData, codigo: val}))}
 */
export function createFormatHandler(
  type: InputFormatType,
  setter: (value: string) => void
) {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const formatted = formatInput(e.target.value, type);
    setter(formatted);
  };
}
