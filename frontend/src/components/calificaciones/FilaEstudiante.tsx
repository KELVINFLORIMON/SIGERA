import React, { useState, useEffect, useRef } from 'react';
import { CeldaCalificacion, navigateGrid } from './CeldaCalificacion';
import { api, type CalificacionGrupoPayload, type GrupoResponse } from '../../services/api';
import './FilaEstudiante.css';

interface FilaEstudianteProps {
  estudianteSeccionId: number;
  asignaturaId: number;
  numeroLista: number;
  nombreCompleto: string;
  avatarUrl?: string;
  notasIniciales: any[];
  notaCompletivaInicial?: number | null;
  notaExtraordinariaInicial?: number | null;
  notaEspecialInicial?: number | null;
  activeTab: 'periodos' | 'situacion';
}

export const FilaEstudiante: React.FC<FilaEstudianteProps> = ({
  estudianteSeccionId,
  asignaturaId,
  numeroLista,
  nombreCompleto,
  avatarUrl,
  notasIniciales,
  notaCompletivaInicial,
  notaExtraordinariaInicial,
  notaEspecialInicial,
  activeTab
}) => {
  const getGrupoInicial = (gc_id: number) => {
    const found = notasIniciales.find(g => g.grupo_competencia_id === gc_id);
    return {
      p1: found?.p1 ?? null, rp1: found?.rp1 ?? null,
      p2: found?.p2 ?? null, rp2: found?.rp2 ?? null,
      p3: found?.p3 ?? null, rp3: found?.rp3 ?? null,
      p4: found?.p4 ?? null, rp4: found?.rp4 ?? null,
    };
  };

  const [grupos, setGrupos] = useState([
    getGrupoInicial(1),
    getGrupoInicial(2),
    getGrupoInicial(3),
    getGrupoInicial(4)
  ]);

  const [pcs, setPcs] = useState<(number | null)[]>([null, null, null, null]);
  const [cf, setCf] = useState<number | null>(null);
  
  // Etapas adicionales
  const [cec, setCec] = useState<number | null>(notaCompletivaInicial ?? null);
  const [ceex, setCeex] = useState<number | null>(notaExtraordinariaInicial ?? null);
  const [ce, setCe] = useState<number | null>(notaEspecialInicial ?? null);
  
  const [situacion, setSituacion] = useState<string>('-');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    calcularLocalmente();
    triggerSyncBackend();
  }, [grupos, cec, ceex, ce]);

  const esPeriodoCompleto = (p: number | null, rp: number | null) => {
    if (p === null) return false;
    if (p < 70 && rp === null) return false;
    return true;
  };

  const p1GlobalCompleto = grupos.every(g => esPeriodoCompleto(g.p1, g.rp1));
  const p2GlobalCompleto = p1GlobalCompleto && grupos.every(g => esPeriodoCompleto(g.p2, g.rp2));
  const p3GlobalCompleto = p2GlobalCompleto && grupos.every(g => esPeriodoCompleto(g.p3, g.rp3));

  const calcularLocalmente = () => {
    const nuevosPcs = grupos.map(g => {
      if (!esPeriodoCompleto(g.p1, g.rp1) || !esPeriodoCompleto(g.p2, g.rp2) ||
          !esPeriodoCompleto(g.p3, g.rp3) || !esPeriodoCompleto(g.p4, g.rp4)) {
        return null;
      }
      const ne1 = g.rp1 !== null ? g.rp1 : (g.p1 as number);
      const ne2 = g.rp2 !== null ? g.rp2 : (g.p2 as number);
      const ne3 = g.rp3 !== null ? g.rp3 : (g.p3 as number);
      const ne4 = g.rp4 !== null ? g.rp4 : (g.p4 as number);
      // Redondear a 1 decimal
      return Math.round(((ne1 + ne2 + ne3 + ne4) / 4) * 10) / 10;
    });
    setPcs(nuevosPcs);

    if (nuevosPcs.includes(null)) {
      setCf(null);
      setSituacion('EN PROCESO');
    } else {
      const sum = nuevosPcs.reduce((a, b) => (a as number) + (b as number), 0) as number;
      const final = Math.round(sum / 4);
      setCf(final);
      
      if (final >= 70) {
        setSituacion('APROBADO');
      } else if (ce !== null) {
        setSituacion(ce >= 70 ? 'APROBADO' : 'REPROBADO');
      } else if (ceex !== null) {
        const cexf = Math.round(final * 0.3 + ceex * 0.7);
        setSituacion(cexf >= 70 ? 'APROBADO' : 'REPROBADO');
      } else if (cec !== null) {
        const ccf = Math.round(final * 0.5 + cec * 0.5);
        setSituacion(ccf >= 70 ? 'APROBADO' : 'REPROBADO');
      } else {
        setSituacion('EN_COMPLETIVA');
      }
    }
  };

  const triggerSyncBackend = () => {
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    setSyncStatus('syncing');

    debounceTimer.current = window.setTimeout(async () => {
      try {
        const payloadGrupos: CalificacionGrupoPayload[] = grupos.map((g, idx) => ({
          grupo_competencia_id: idx + 1,
          nota_p1: g.p1, nota_rp1: g.rp1,
          nota_p2: g.p2, nota_rp2: g.rp2,
          nota_p3: g.p3, nota_rp3: g.rp3,
          nota_p4: g.p4, nota_rp4: g.rp4,
        }));

        const payload: any = { grupos: payloadGrupos };
        if (cec !== null) payload.nota_completiva = cec;
        if (ceex !== null) payload.nota_extraordinaria = ceex;
        if (ce !== null) payload.nota_especial = ce;

        // asumiendo que estudianteSeccionId y asignaturaId se pasan
        const res = await api.guardarCalificaciones(estudianteSeccionId, asignaturaId, payload);

        if (res.calificacion_final !== null) {
          setCf(res.calificacion_final);
          setSituacion(res.situacion_final);
        }
        
        const serverPcs = res.grupos.map((g: GrupoResponse) => g.promedio_competencia);
        setPcs(serverPcs);

        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 2000);
      } catch (error) {
        setSyncStatus('error');
      }
    }, 1000);
  };

  const setNotaGrupo = (grupoIdx: number, pIndex: number, pVal: number | null, rpVal: number | null) => {
    setGrupos(prev => {
      const nuevos = [...prev];
      const actual = { ...nuevos[grupoIdx] };
      if (pIndex === 1) { actual.p1 = pVal; actual.rp1 = rpVal; }
      if (pIndex === 2) { actual.p2 = pVal; actual.rp2 = rpVal; }
      if (pIndex === 3) { actual.p3 = pVal; actual.rp3 = rpVal; }
      if (pIndex === 4) { actual.p4 = pVal; actual.rp4 = rpVal; }
      nuevos[grupoIdx] = actual;
      return nuevos;
    });
    
    // Si se modifica cualquier calificación base, las etapas de recuperación global pierden validez
    setCec(null);
    setCeex(null);
    setCe(null);
  };

  const getColorClass = (nota: number | null) => {
    if (nota === null) return 'cf-pendiente';
    if (nota >= 70) return 'cf-logrado';
    return 'cf-insuficiente';
  };

  const getIniciales = (nombre: string) => {
    // Remove punctuation like commas and split by spaces
    const partes = nombre.replace(/[,.-]/g, '').trim().split(/\s+/);
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return nombre.substring(0, 2).toUpperCase();
  };
  
  // Cálculos derivados para la UI (redondeados a 1 decimal como solicitó el usuario)
  const ccf50cf = cf !== null ? Math.round((cf * 0.5) * 10) / 10 : null;
  const ccf50cec = cec !== null ? Math.round((cec * 0.5) * 10) / 10 : null;
  const ccf = (ccf50cf !== null && ccf50cec !== null) ? Math.round(ccf50cf + ccf50cec) : null;

  const cex30cf = cf !== null ? Math.round((cf * 0.3) * 10) / 10 : null;
  const cex70ceex = ceex !== null ? Math.round((ceex * 0.7) * 10) / 10 : null;
  const cexf = (cex30cf !== null && cex70ceex !== null) ? Math.round(cex30cf + cex70ceex) : null;
  
  const esAprobado = situacion === 'APROBADO';
  // El usuario solicitó que la "R" solo aparezca cuando se haya aplicado C.E. y sea menor a 70
  const esReprobado = ce !== null && ce < 70;
  
  const getSituacionEmoji = (sit: string) => {
    switch (sit) {
      case 'APROBADO': return '✅';
      case 'REPROBADO': return '❌';
      case 'EN_COMPLETIVA': return '🔄';
      case 'EN_EXTRAORDINARIA': return '⚠️';
      default: return null; // Elimina 'EN PROCESO' u otros
    }
  };

  const getSituacionTexto = (sit: string) => {
    if (sit === 'EN_COMPLETIVA') return 'EVALUACIÓN'; // Cambia COMPLETIVO por EVALUACION
    return sit;
  };
  
  // Determinar si el estudiante tiene alguna calificación P < 70 cuyo RP aún está vacío
  const tieneRPPendiente = grupos.some(g => 
    (g.p1 !== null && g.p1 < 70 && g.rp1 === null) ||
    (g.p2 !== null && g.p2 < 70 && g.rp2 === null) ||
    (g.p3 !== null && g.p3 < 70 && g.rp3 === null) ||
    (g.p4 !== null && g.p4 < 70 && g.rp4 === null)
  );

  const getAvatarColor = () => {
    if (tieneRPPendiente) return 'linear-gradient(135deg, #f59e0b, #d97706)'; // Amarillo
    if (situacion === 'APROBADO') return 'linear-gradient(135deg, #10b981, #059669)'; // Verde
    if (situacion === 'REPROBADO') return 'linear-gradient(135deg, #ef4444, #dc2626)'; // Rojo
    if (situacion === 'EN_COMPLETIVA' || situacion === 'EN_EXTRAORDINARIA') return 'linear-gradient(135deg, #3b82f6, #2563eb)'; // Azul
    return 'linear-gradient(135deg, #94a3b8, #64748b)'; // Gris
  };

  return (
    <tr className="student-row">
      <td className="sticky-col left-col">
        <div className="estudiante-info-table">
          <span className="numero-lista">{numeroLista}</span>
          <div className="avatar-estudiante" style={{ background: getAvatarColor() }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={nombreCompleto} />
            ) : (
              <span>{getIniciales(nombreCompleto)}</span>
            )}
            
            {/* Si no hay alerta de sync, mostramos los warnings/situaciones si aplican */}
            {syncStatus === 'syncing' ? (
              <span className="sync-indicator syncing" title="Guardando..."/>
            ) : syncStatus === 'success' ? (
              <span className="sync-indicator success" title="Guardado con éxito">✓</span>
            ) : syncStatus === 'error' ? (
              <span className="sync-indicator error" title="Error de validación">!</span>
            ) : (
              // Mostrar alertas en el avatar cuando está idle
              <>
                {/* Removemos la alerta de recuperacion izquierda flotante ya que el color de fondo lo indica, 
                    pero mantenemos la sombra sutil o simplemente dependemos del color. 
                    Si queremos, podemos dejar el emoji también: */}
                {/* {activeTab === 'periodos' && tieneRPPendiente && (
                  <span className="sync-indicator warning left" title="Recuperación Pedagógica Pendiente">⚠️</span>
                )}
                {activeTab === 'situacion' && getSituacionEmoji(situacion) && (
                  <span className="sync-indicator warning left" style={{ background: 'transparent', border: 'none', fontSize: '1rem' }} title={getSituacionTexto(situacion)}>
                    {getSituacionEmoji(situacion)}
                  </span>
                )} */}
              </>
            )}
          </div>
          <div className="datos-estudiante">
            <span className="nombre" title={nombreCompleto}>
              {nombreCompleto}
            </span>
          </div>
        </div>
      </td>

      {activeTab === 'periodos' ? (
        <>
          {[0, 1, 2, 3].map(gIdx => {
            const n = grupos[gIdx];
            return (
              <React.Fragment key={gIdx}>
                <td className="period-cell">
                  <CeldaCalificacion 
                    etiqueta="P1" 
                    valorInicialP={n.p1} valorInicialRP={n.rp1} 
                    onCambio={(p, rp) => setNotaGrupo(gIdx, 1, p, rp)} 
                  />
                </td>
                <td className="period-cell">
                  <CeldaCalificacion 
                    etiqueta="P2" 
                    valorInicialP={n.p2} valorInicialRP={n.rp2} 
                    soloLectura={!p1GlobalCompleto}
                    onCambio={(p, rp) => setNotaGrupo(gIdx, 2, p, rp)} 
                  />
                </td>
                <td className="period-cell">
                  <CeldaCalificacion 
                    etiqueta="P3" 
                    valorInicialP={n.p3} valorInicialRP={n.rp3}
                    soloLectura={!p2GlobalCompleto} 
                    onCambio={(p, rp) => setNotaGrupo(gIdx, 3, p, rp)} 
                  />
                </td>
                <td className="period-cell">
                  <CeldaCalificacion 
                    etiqueta="P4" 
                    valorInicialP={n.p4} valorInicialRP={n.rp4} 
                    soloLectura={!p3GlobalCompleto}
                    onCambio={(p, rp) => setNotaGrupo(gIdx, 4, p, rp)} 
                  />
                </td>
                <td className="pc-cell">
                  <div className="calificacion-final-table">
                    <span className="cf-valor-table">{pcs[gIdx] !== null ? pcs[gIdx] : '-'}</span>
                  </div>
                </td>
              </React.Fragment>
            );
          })}

          <td className={`sticky-col right-col ${getColorClass(cf)}`}>
            <div className="calificacion-final-table cf-global">
              <span className="cf-valor-table">{cf !== null ? cf : '-'}</span>
            </div>
          </td>
        </>
      ) : (
        <>
          {/* Promedios GC */}
          {[0, 1, 2, 3].map(gIdx => (
            <td key={`pc-${gIdx}`} className="pc-cell text-center" style={{ fontWeight: 'bold' }}>
              {pcs[gIdx] !== null ? pcs[gIdx] : '-'}
            </td>
          ))}

          <td className={`period-cell ${getColorClass(cf)}`}>
            <div className="calificacion-final-table cf-global">
              <span className="cf-valor-table">{cf !== null ? cf : '-'}</span>
            </div>
          </td>
          
          {/* Completiva */}
          <td className="period-cell" style={{ textAlign: 'center', color: 'var(--text-main)' }}>
            {cf !== null && cf < 70 ? ccf50cf : '-'}
          </td>
          <td className="period-cell">
            <input 
              className="nota-input"
              style={{ width: '40px', textAlign: 'center', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.2rem', color: 'var(--text-main)' }}
              type="number" 
              min="0" max="100"
              value={cec !== null ? cec : ''}
              disabled={cf === null || cf >= 70}
              onKeyDown={navigateGrid}
              onChange={(e) => {
                const rawVal = e.target.value.replace(/[^0-9]/g, '');
                const val = rawVal === '' ? null : Number(rawVal);
                if (val === null || (val >= 0 && val <= 100)) {
                  setCec(val);
                  // Si se modifica la Completiva, limpiar Extraordinaria y Especial
                  setCeex(null);
                  setCe(null);
                }
              }}
            />
          </td>
          <td className="period-cell" style={{ textAlign: 'center', color: 'var(--text-main)' }}>{ccf50cec !== null ? ccf50cec : '-'}</td>
          <td className={`period-cell ${getColorClass(ccf)}`}>
            <div className="calificacion-final-table cf-global">
              <span className="cf-valor-table">{ccf !== null ? ccf : '-'}</span>
            </div>
          </td>
          
          {/* Extraordinaria */}
          <td className="period-cell" style={{ textAlign: 'center', color: 'var(--text-main)' }}>
            {ccf !== null && ccf < 70 ? cex30cf : '-'}
          </td>
          <td className="period-cell">
            <input 
              className="nota-input"
              style={{ width: '40px', textAlign: 'center', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.2rem', color: 'var(--text-main)' }}
              type="number" 
              min="0" max="100"
              value={ceex !== null ? ceex : ''}
              disabled={ccf === null || ccf >= 70}
              onKeyDown={navigateGrid}
              onChange={(e) => {
                const rawVal = e.target.value.replace(/[^0-9]/g, '');
                const val = rawVal === '' ? null : Number(rawVal);
                if (val === null || (val >= 0 && val <= 100)) {
                  setCeex(val);
                  // Si se modifica la Extraordinaria, limpiar Especial
                  setCe(null);
                }
              }}
            />
          </td>
          <td className="period-cell" style={{ textAlign: 'center', color: 'var(--text-main)' }}>{cex70ceex !== null ? cex70ceex : '-'}</td>
          <td className={`period-cell ${getColorClass(cexf)}`}>
            <div className="calificacion-final-table cf-global">
              <span className="cf-valor-table">{cexf !== null ? cexf : '-'}</span>
            </div>
          </td>
          
          {/* Especial */}
          <td className="period-cell" style={{ textAlign: 'center', color: 'var(--text-main)' }}>{cexf !== null && cexf < 70 ? cf : '-'}</td>
          <td className="period-cell">
            <input 
              className="nota-input"
              style={{ width: '40px', textAlign: 'center', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.2rem', color: 'var(--text-main)' }}
              type="number" 
              min="0" max="100"
              value={ce !== null ? ce : ''}
              disabled={cexf === null || cexf >= 70}
              onKeyDown={navigateGrid}
              onChange={(e) => {
                const rawVal = e.target.value.replace(/[^0-9]/g, '');
                const val = rawVal === '' ? null : Number(rawVal);
                if (val === null || (val >= 0 && val <= 100)) {
                  setCe(val);
                }
              }}
            />
          </td>
          
          {/* Situacion Final */}
          <td className="period-cell" style={{ textAlign: 'center', color: esAprobado ? 'var(--color-success)' : 'inherit', fontWeight: esAprobado ? 'bold' : 'normal' }}>
            {esAprobado ? 'A' : '-'}
          </td>
          <td className="period-cell" style={{ textAlign: 'center', color: esReprobado ? 'var(--color-danger)' : 'inherit', fontWeight: esReprobado ? 'bold' : 'normal' }}>
            {esReprobado ? 'R' : '-'}
          </td>
        </>
      )}
    </tr>
  );
};
