import React, { useState, useEffect } from 'react';
import './CeldaCalificacion.css';

interface CeldaCalificacionProps {
  valorInicialP?: number | null;
  valorInicialRP?: number | null;
  etiqueta?: string; // Ej: "P1"
  soloLectura?: boolean;
  onCambio?: (p: number | null, rp: number | null) => void;
}

export const navigateGrid = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    
    const input = e.target as HTMLInputElement;
    const td = input.closest('td');
    const tr = input.closest('tr');
    if (!td || !tr) return;
    
    const cellIndex = td.cellIndex;
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const allInputs = Array.from(document.querySelectorAll('input[type="number"]:not([disabled])')) as HTMLInputElement[];
      const idx = allInputs.indexOf(input);
      const next = allInputs[e.key === 'ArrowRight' ? idx + 1 : idx - 1];
      if (next) next.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const tbody = tr.closest('tbody');
      if (!tbody) return;
      const rows = Array.from(tbody.querySelectorAll('tr.student-row'));
      const rowIndex = rows.indexOf(tr as HTMLTableRowElement);
      
      const nextRow = rows[e.key === 'ArrowDown' ? rowIndex + 1 : rowIndex - 1];
      if (nextRow) {
         const nextTd = nextRow.children[cellIndex] as HTMLTableCellElement;
         if (nextTd) {
           const nextInput = nextTd.querySelector('input[type="number"]:not([disabled])') as HTMLInputElement;
           if (nextInput) {
             nextInput.focus();
             return;
           }
         }
         // Si la celda exacta no tiene input, buscamos el input más cercano en esa fila
         const fallbackInputs = nextRow.querySelectorAll('input[type="number"]:not([disabled])');
         if (fallbackInputs.length > 0) {
           (fallbackInputs[0] as HTMLInputElement).focus();
         }
      }
    }
  }
};

export const CeldaCalificacion: React.FC<CeldaCalificacionProps> = ({
  valorInicialP = null,
  valorInicialRP = null,
  etiqueta = 'P1',
  soloLectura = false,
  onCambio
}) => {
  const [notaP, setNotaP] = useState<string>(valorInicialP !== null ? String(valorInicialP) : '');
  const [notaRP, setNotaRP] = useState<string>(valorInicialRP !== null ? String(valorInicialRP) : '');
  
  // Estado visual derivado
  const [estado, setEstado] = useState<'normal' | 'logrado' | 'reprobado' | 'en_rp'>('normal');

  useEffect(() => {
    evaluarEstado(notaP, notaRP);
  }, [notaP, notaRP]);

  const evaluarEstado = (p: string, rp: string) => {
    const valP = parseInt(p);
    const valRP = parseInt(rp);
    
    if (isNaN(valP)) {
      setEstado('normal');
      return;
    }

    if (valP >= 70) {
      setEstado('logrado');
    } else {
      if (!isNaN(valRP) && valRP >= 70) {
        setEstado('en_rp'); // Logró pasar con RP
      } else {
        setEstado('reprobado'); // Reprobado, requiere RP
      }
    }
  };

  const handleCambioP = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir dígitos puros (elimina puntos y decimales)
    const val = e.target.value.replace(/[^0-9]/g, '');
    
    if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 100)) {
      setNotaP(val);
      
      // Regla: Ante cualquier modificación de P, si existía una nota RP, se limpia.
      // Esto obliga al docente a re-evaluar la RP basándose en la nueva nota P.
      let newRP = notaRP;
      if (notaRP !== '') {
        newRP = '';
        setNotaRP('');
      }
      
      if (onCambio) onCambio(val ? parseInt(val) : null, newRP ? parseInt(newRP) : null);
    }
  };

  const handleCambioRP = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir dígitos puros
    const val = e.target.value.replace(/[^0-9]/g, '');
    
    if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 100)) {
      setNotaRP(val);
      if (onCambio) onCambio(notaP ? parseInt(notaP) : null, val ? parseInt(val) : null);
    }
  };

  const handleBlurRP = () => {
    const pVal = parseInt(notaP);
    const rpVal = parseInt(notaRP);
    if (!isNaN(pVal) && !isNaN(rpVal) && rpVal < pVal) {
      window.alert('La nota de Recuperación Pedagógica (RP) no puede ser menor a la calificación del período (P).');
      setNotaRP('');
      if (onCambio) onCambio(pVal, null);
    }
  };

  const requiereRP = estado === 'reprobado' || estado === 'en_rp';
  const containerClass = `celda-container estado-${estado} ${soloLectura ? 'deshabilitado' : ''}`;

  return (
    <div className={containerClass}>
      <div className="celda-header">
        <span className="etiqueta">{etiqueta}</span>
        {estado === 'logrado' && <span className="icono-estado">✅</span>}
        {estado === 'reprobado' && <span className="icono-estado">⚠️</span>}
        {estado === 'en_rp' && <span className="icono-estado">🔄</span>}
      </div>
      
      <div className="celda-inputs">
        <div className="input-grupo principal">
          <input
            type="number"
            min="0"
            max="100"
            value={notaP}
            onChange={handleCambioP}
            onKeyDown={navigateGrid}
            disabled={soloLectura}
            placeholder="-"
            className="input-nota"
            title="Nota del período"
          />
        </div>
        
        {/* Solo se muestra el input de RP si la nota principal es < 70 (o si ya hay un valor de RP) */}
        {requiereRP && (
          <div className="input-grupo secundario tooltip-rp" data-tooltip="Recuperación (Mín. misma nota)">
            <input
              type="number"
              min="0"
              max="100"
              value={notaRP}
              onChange={handleCambioRP}
              onBlur={handleBlurRP}
              onKeyDown={navigateGrid}
              disabled={soloLectura}
              placeholder="RP"
              className="input-nota input-rp"
            />
          </div>
        )}
      </div>
    </div>
  );
};
