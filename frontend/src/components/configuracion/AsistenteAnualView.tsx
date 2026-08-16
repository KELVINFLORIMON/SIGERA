import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { AnioEscolarView } from './AnioEscolarView';
import { SeccionesView } from './SeccionesView';
import { ConfiguracionAsignaturasView } from './ConfiguracionAsignaturasView';
import { CargaAcademicaView } from './CargaAcademicaView';
import { Calendar, Layers, BookOpen, ArrowLeft, Users } from 'lucide-react';
import { institucionalService } from '../../services/institucionalService';
import './AsistenteAnualView.css';

export const AsistenteAnualView: React.FC = () => {
  const [activeTab, setActiveTab] = useState(2);
  const [globalAnioId, setGlobalAnioId] = useState<number | null>(null);
  const [anioDescripcion, setAnioDescripcion] = useState<string>('');

  useEffect(() => {
    if (globalAnioId) {
      // Cargar la descripción del año para mostrar en la cabecera
      institucionalService.getAniosEscolares().then(anios => {
        const anio = anios.find(a => a.id === globalAnioId);
        if (anio) setAnioDescripcion(anio.descripcion);
      }).catch(console.error);
    }
  }, [globalAnioId]);

  const handleConfigurarAnio = (anioId: number) => {
    setGlobalAnioId(anioId);
    setActiveTab(2); // Mover a grados y secciones automáticamente
  };

  const handleVolver = () => {
    setGlobalAnioId(null);
  };

  return (
    <DashboardLayout title="Configuración Anual">
      <div className="wizard-container">
        
        {!globalAnioId ? (
          <div className="wizard-step-content slide-in">
            <div className="step-header">
              <h3><Calendar size={20} /> Años Escolares</h3>
              <p>Crea un nuevo año escolar o haz clic en "Configurar" para gestionar sus grados, secciones y currículo.</p>
            </div>
            <AnioEscolarView 
              isWizard={true} 
              onConfigurar={handleConfigurarAnio}
              selectedAnioId={globalAnioId}
            />
          </div>
        ) : (
          <div className="slide-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <button 
                onClick={handleVolver} 
                className="btn-secondary"
                style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ArrowLeft size={16} /> Volver a Años Escolares
              </button>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                Configurando: <span className="badge" style={{ fontSize: '1rem' }}>{anioDescripcion}</span>
              </h3>
            </div>

            {/* Sub-Tabs for specific year */}
            <div className="wizard-tabs">
              <button 
                className={`wizard-tab ${activeTab === 2 ? 'active' : ''}`}
                onClick={() => setActiveTab(2)}
              >
                <div className="step-number">1</div>
                <div className="step-info">
                  <span className="step-title">Grados y Secciones</span>
                  <span className="step-desc">Estructura académica</span>
                </div>
              </button>

              <button 
                className={`wizard-tab ${activeTab === 3 ? 'active' : ''}`}
                onClick={() => setActiveTab(3)}
              >
                <div className="step-number">2</div>
                <div className="step-info">
                  <span className="step-title">Currículo</span>
                  <span className="step-desc">Asignaturas y Competencias</span>
                </div>
              </button>

              <button 
                className={`wizard-tab ${activeTab === 4 ? 'active' : ''}`}
                onClick={() => setActiveTab(4)}
              >
                <div className="step-number">3</div>
                <div className="step-info">
                  <span className="step-title">Carga Académica</span>
                  <span className="step-desc">Asignar Docentes</span>
                </div>
              </button>
            </div>

            <div className="wizard-content">
              {activeTab === 2 && (
                <div className="wizard-step-content slide-in">
                  <div className="step-header">
                    <h3><Layers size={20} /> Estructura: Grados y Secciones</h3>
                    <p>Agrega los grados que se impartirán en este año escolar y crea sus secciones (A, B, C...).</p>
                  </div>
                  <SeccionesView 
                    isWizard={true} 
                    wizardAnioId={globalAnioId} 
                    onWizardAnioChange={setGlobalAnioId} 
                  />
                </div>
              )}

              {activeTab === 3 && (
                <div className="wizard-step-content slide-in">
                  <div className="step-header">
                    <h3><BookOpen size={20} /> Currículo: Asignaturas</h3>
                    <p>Asigna las materias a los grados de este año escolar. Los Grupos de Competencias se copiarán de tus plantillas.</p>
                  </div>
                  <ConfiguracionAsignaturasView 
                    isWizard={true} 
                    wizardAnioId={globalAnioId}
                    onWizardAnioChange={setGlobalAnioId}
                  />
                </div>
              )}

              {activeTab === 4 && (
                <div className="wizard-step-content slide-in">
                  <div className="step-header">
                    <h3><Users size={20} /> Carga Académica</h3>
                    <p>Asigna los docentes a las asignaturas de cada sección.</p>
                  </div>
                  <CargaAcademicaView 
                    isWizard={true} 
                    wizardAnioId={globalAnioId}
                  />
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
